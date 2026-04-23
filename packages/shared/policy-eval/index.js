const axisOrder = {
  identity_linkage: ["anonymous", "pseudonymous", "identifiable"],
  storage_duration: ["session", "time_limited", "long_term"],
  derivative_creation: ["none", "aggregation", "model_training", "synthetic_reuse"],
  purpose_scope: ["single", "related", "general_improvement"],
  cross_service_sharing: ["isolated", "ecosystem", "unrestricted"],
  monetisation_use: ["prohibited", "indirect", "commercial"],
  transparency_level: ["full_audit", "summary_only", "system_only"]
};

function isAllowedByOrder(requested, allowed, order) {
  const requestedIndex = order.indexOf(requested);
  const allowedIndex = order.indexOf(allowed);
  if (requestedIndex < 0 || allowedIndex < 0) return false;
  return requestedIndex <= allowedIndex;
}

function evaluateAxis(axisName, requestedAxes, ruleAxes, reasons) {
  const requested = requestedAxes ? requestedAxes[axisName] : undefined;
  const allowed = ruleAxes ? ruleAxes[axisName] : undefined;
  if (!requested || !allowed) return;
  if (!isAllowedByOrder(requested, allowed, axisOrder[axisName])) {
    reasons.push(`requested ${axisName} '${requested}' exceeds allowed '${allowed}'`);
  }
}

const readOnlyActions = new Set(["read", "view", "status", "list", "inspect"]);

export function evaluate(req, rule, consent) {
  const reasons = [];
  const context = req.context || {};
  const requestedAxes = Object.assign({}, context.requestedCapabilityAxes || {});

  if (req.purpose === "model_training" && !requestedAxes.derivative_creation) {
    requestedAxes.derivative_creation = "model_training";
  }

  if (context.monetised === true && !requestedAxes.monetisation_use) {
    requestedAxes.monetisation_use = "indirect";
  }

  if (typeof context.requestedRetentionDays === "number" && !requestedAxes.storage_duration) {
    if (context.requestedRetentionDays <= 1) requestedAxes.storage_duration = "session";
    else if (context.requestedRetentionDays <= 365) requestedAxes.storage_duration = "time_limited";
    else requestedAxes.storage_duration = "long_term";
  }

  if (!consent) {
    reasons.push("no consent record for identity");
  } else {
    if (consent.state === "deleted") reasons.push("consent is deleted; no processing allowed");
    if (consent.state === "archive") reasons.push("consent is archived; processing and sharing are disabled");
    if (consent.state === "recovery" && context.reauthenticated !== true) {
      reasons.push("consent is in recovery; re-authentication required before processing");
    }
    if (consent.state === "dormant") {
      if (!readOnlyActions.has(req.action)) reasons.push("consent is dormant; only read-only access is permitted");
      if (requestedAxes.derivative_creation && requestedAxes.derivative_creation !== "none") {
        reasons.push("consent is dormant; derivative creation is disabled");
      }
      if (requestedAxes.monetisation_use && requestedAxes.monetisation_use !== "prohibited") {
        reasons.push("consent is dormant; monetisation use is disabled");
      }
    }
  }

  // Unknown/unapproved axis handling
  const requestedAxisKeys = Object.keys(requestedAxes || {});
  const unknownRequestedAxes = [];
  const unapprovedRequestedAxes = [];

  if (requestedAxisKeys.length > 0) {
    if (!rule) {
      for (const key of requestedAxisKeys) {
        const k = String(key);
        reasons.push(`requested capability axis '${k}' cannot be evaluated without a policy rule`);
        unapprovedRequestedAxes.push(k);
      }
    } else {
      for (const key of requestedAxisKeys) {
        const k = String(key);
        // allow explicit approvals recorded in rule.metadata.approvedFeatures
        const approvedFeatures = rule && rule.metadata && Array.isArray(rule.metadata.approvedFeatures) ? rule.metadata.approvedFeatures : [];
        if (approvedFeatures.includes(k)) {
          // explicitly approved by parent via avatar metadata
          continue;
        }

        if (!(k in axisOrder)) {
          reasons.push(`requested unknown capability axis '${k}'; explicit approval required`);
          unknownRequestedAxes.push(k);
        } else if (!rule.capabilityAxes || !(k in rule.capabilityAxes)) {
          reasons.push(`requested capability axis '${k}' is not covered by policy rule; explicit approval required`);
          unapprovedRequestedAxes.push(k);
        }
      }
    }
  }

  if (rule && req.purpose && Array.isArray(rule.allowedPurposes) && !rule.allowedPurposes.includes(req.purpose)) {
    reasons.push(`purpose '${req.purpose}' is not allowed by policy rule`);
  }

  if (rule) {
    evaluateAxis("identity_linkage", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("storage_duration", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("derivative_creation", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("purpose_scope", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("cross_service_sharing", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("monetisation_use", requestedAxes, rule.capabilityAxes, reasons);
    evaluateAxis("transparency_level", requestedAxes, rule.capabilityAxes, reasons);

    if (context.monetised === true && rule.capabilityAxes && rule.capabilityAxes.monetisation_use === "prohibited") {
      reasons.push("monetised usage is prohibited by policy rule");
    }

    if (typeof context.requestedRetentionDays === "number" && typeof (rule.retention && rule.retention.maxDays) === "number" && context.requestedRetentionDays > rule.retention.maxDays) {
      reasons.push(`requested retention ${context.requestedRetentionDays}d exceeds max ${rule.retention.maxDays}d`);
    }
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    reasons,
    obligations: {
      ruleId: rule ? rule.id : null,
      ruleVersion: rule ? rule.version : null,
      consentState: consent ? consent.state : null,
      reminderNotificationRequired: consent ? consent.state === "reminder" : false,
      recoveryReauthenticationRequired: consent ? consent.state === "recovery" : false,
      transparencyLevel: rule && rule.capabilityAxes ? rule.capabilityAxes.transparency_level : null,
      retention: rule ? rule.retention : null,
      requestedCapabilityAxes: requestedAxes,
      unknownRequestedAxes,
      unapprovedRequestedAxes,
      derivativePolicy: rule ? rule.derivativePolicy : null
    }
  };
}

export function evaluateFromAvatar(avatar, req) {
  // avatar: { rules: [], consents: [] }
  const rules = avatar && avatar.rules ? avatar.rules : [];
  const consents = avatar && avatar.consents ? avatar.consents : [];

  const identityId = req.identityId;
  const consent = consents.find((c) => c.identityId === identityId) || null;
  const ruleId = req.ruleId || (consent ? consent.ruleId : null);
  const rule = rules.find((r) => r.id === ruleId) || null;

  return evaluate(req, rule, consent);
}

function bufferFromPem(pem) {
  // strip header/footer and newlines
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  return Uint8Array.from(Buffer.from(b64, 'base64')).buffer;
}

async function verifySignatureBrowser(publicKeyPem, data, signatureBase64) {
  const pem = publicKeyPem;
  // import SPKI public key
  const binary = bufferFromPem(pem);
  const key = await crypto.subtle.importKey('spki', binary, { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['verify']);
  const sig = Uint8Array.from(Buffer.from(signatureBase64, 'base64')).buffer;
  const enc = new TextEncoder();
  const ok = await crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, key, sig, enc.encode(data));
  return ok;
}

export async function verifySignedAvatar(avatar) {
  if (!avatar || (!avatar.signature)) return { valid: false, reason: 'no signature' };
  const signature = avatar.signature;
  const publicKeyPem = avatar.publicKey;
  if (!publicKeyPem) return { valid: false, reason: 'no public key included' };

  // canonicalize avatar without signature/publicKey
  const canonify = (obj) => {
    const sortKeys = (value) => {
      if (Array.isArray(value)) return value.map(sortKeys);
      if (value && typeof value === 'object') {
        const out = {};
        Object.keys(value).sort().forEach(k => {
          if (k === 'signature' || k === 'publicKey' || k === 'signedAt') return;
          out[k] = sortKeys(value[k]);
        });
        return out;
      }
      return value;
    };
    return JSON.stringify(sortKeys(obj));
  };

  const canon = canonify(avatar);

  // Node.js path if crypto.subtle not available
  if (!(globalThis && globalThis.crypto && globalThis.crypto.subtle)) {
    // use Node crypto
    try {
      const { createVerify } = await import('node:crypto');
      const verify = createVerify('RSA-SHA256');
      verify.update(canon);
      verify.end();
      const ok = verify.verify(publicKeyPem, signature, 'base64');
      return { valid: ok, reason: ok ? 'verified' : 'signature invalid' };
    } catch (err) {
      return { valid: false, reason: String(err) };
    }
  }

  // Browser path
  try {
    const ok = await verifySignatureBrowser(publicKeyPem, canon, signature);
    return { valid: ok, reason: ok ? 'verified' : 'signature invalid' };
  } catch (err) {
    return { valid: false, reason: String(err) };
  }
}
