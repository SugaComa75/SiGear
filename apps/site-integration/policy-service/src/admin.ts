import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { createPolicyRepository } from "./repository.js";

const ADMIN_TOKEN_ENV = "POLICY_ADMIN_TOKEN";
const JWT_SECRET_ENV = "POLICY_ADMIN_JWT_SECRET";
const JWT_PUBKEY_ENV = "POLICY_ADMIN_JWT_PUBLIC_KEY";
const JWT_AUD_ENV = "POLICY_ADMIN_JWT_AUD";
const JWT_ISS_ENV = "POLICY_ADMIN_JWT_ISS";
const JWT_ROLE_ENV = "POLICY_ADMIN_ROLE";

function unauthorized(res: Response) {
  res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Missing or invalid admin token" }, timestamp: new Date().toISOString() });
}

function forbidden(res: Response) {
  res.status(403).json({ success: false, data: null, error: { code: "FORBIDDEN", message: "Insufficient role for admin action" }, timestamp: new Date().toISOString() });
}

function verifyJwt(token: string) {
  const secret = process.env[JWT_SECRET_ENV];
  const pubKey = process.env[JWT_PUBKEY_ENV];
  const jwksUrl = process.env["POLICY_ADMIN_JWKS_URL"];
  const audience = process.env[JWT_AUD_ENV];
  const issuer = process.env[JWT_ISS_ENV];

  const verifyOptions: jwt.VerifyOptions = {};
  if (audience) verifyOptions.audience = audience;
  if (issuer) verifyOptions.issuer = issuer;

  // direct secret or public key first
  const key = secret ?? pubKey ?? undefined;
  if (key) {
    return jwt.verify(token, key, verifyOptions) as jwt.JwtPayload | string;
  }

  // Try JWKS URL if configured (supports rotatable keys)
  if (!jwksUrl) throw new Error("No JWT verification key or JWKS configured");

  // decode header to get kid
  const decoded = jwt.decode(token, { complete: true }) as { header?: Record<string, unknown> } | null;
  const kid = decoded?.header?.kid as string | undefined;
  if (!kid) throw new Error("JWT missing 'kid' header for JWKS lookup");

  const client = jwksClient({ jwksUri: jwksUrl, cache: true, cacheMaxEntries: 5, cacheMaxAge: 10 * 60 * 1000 });
  const getKey = (header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) => {
    client.getSigningKey(header.kid as string, (err, key) => {
      if (err) return callback(err as Error);
      const pub = key.getPublicKey();
      callback(null, pub);
    });
  };

  // jwt.verify supports a callback for async key retrieval; wrap in Promise
  return new Promise<jwt.JwtPayload | string>((resolve, reject) => {
    jwt.verify(token, getKey as any, verifyOptions, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as jwt.JwtPayload | string);
    });
  });
}

export async function pendingUnknownHandler(req: Request, res: Response) {
  try {
    const configuredToken = process.env[ADMIN_TOKEN_ENV];
    const requiredRole = process.env[JWT_ROLE_ENV] ?? "policy_admin";

    const auth = (req.headers["authorization"] as string) || "";
    if (!auth.startsWith("Bearer ")) return unauthorized(res);

    const token = auth.slice(7).trim();
    if (!token) return unauthorized(res);

    // 1) direct token match (keystore/shared secret)
    if (configuredToken && token === configuredToken) {
      const repo = createPolicyRepository();
      const events = await repo.listPendingUnknown(200);
      return res.json({ success: true, data: events, error: null, timestamp: new Date().toISOString() });
    }

    // 2) try JWT verification (HS256 or RS256 using configured key)
    try {
      const payload = verifyJwt(token);
      const roleClaim = (payload && typeof payload === "object") ? (payload["role"] ?? null) : null;
      const rolesClaim = (payload && typeof payload === "object") ? (payload["roles"] ?? null) : null;

      let hasRole = false;
      if (typeof roleClaim === "string" && roleClaim === requiredRole) hasRole = true;
      if (Array.isArray(rolesClaim) && rolesClaim.includes(requiredRole)) hasRole = true;
      if (typeof rolesClaim === "string") {
        const parts = rolesClaim.split(/[,\s]+/).map((s: string) => s.trim()).filter(Boolean);
        if (parts.includes(requiredRole)) hasRole = true;
      }

      if (!hasRole) return forbidden(res);

      const repo = createPolicyRepository();
      const events = await repo.listPendingUnknown(200);
      return res.json({ success: true, data: events, error: null, timestamp: new Date().toISOString() });
    } catch (err) {
      return unauthorized(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: { message: error instanceof Error ? error.message : String(error) }, timestamp: new Date().toISOString() });
  }
}
