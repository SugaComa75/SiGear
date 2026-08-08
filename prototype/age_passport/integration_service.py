from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from datetime import datetime
import requests
from prototype.age_passport.age_passport import crypto, storage

app = Starlette()

CONTROL_URL = "http://localhost:8001"
AUDIT_URL = "http://localhost:8003"


def band_to_min(age_band: str) -> int:
    if age_band.endswith("+"):
        return int(age_band[:-1])
    return int(age_band)


@app.route("/enforce", methods=["POST"])
async def enforce(request: Request):
    body = await request.json()
    passport = body.get("passport")
    required_age_band = body.get("required_age_band")
    site_id = body.get("site_id")
    resource = body.get("resource")
    action = body.get("action")
    # verify signature
    signature = passport.get("signature")
    payload_fields = passport.copy()
    payload_fields.pop("signature", None)
    # build canonical payload bytes using same canonicalization as minting
    import json

    payload_bytes = json.dumps(payload_fields, sort_keys=True, default=str, separators=(',', ':')).encode()
    valid = crypto.verify_signature(payload_bytes, signature)

    def _post(url, json_body):
        return requests.post(url, json=json_body, timeout=5)

    if not valid:
        await run_in_threadpool(_post, f"{AUDIT_URL}/log", {
            "timestamp": datetime.utcnow().isoformat(),
            "avatar_id": passport.get("subject"),
            "site_id": site_id,
            "resource": resource,
            "action": action,
            "decision": "denied",
            "rules_applied": ["invalid_signature"],
        })
        return JSONResponse({"allowed": False, "reason": "invalid passport"})

    # check expiry (ISO format expected)
    expiry_str = passport.get("expiry")
    try:
        expiry = datetime.fromisoformat(expiry_str) if expiry_str else None
    except Exception:
        expiry = None
    if expiry and expiry < datetime.utcnow():
        await run_in_threadpool(_post, f"{AUDIT_URL}/log", {
            "timestamp": datetime.utcnow().isoformat(),
            "avatar_id": passport.get("subject"),
            "site_id": site_id,
            "resource": resource,
            "action": action,
            "decision": "denied",
            "rules_applied": ["expiry"],
        })
        return JSONResponse({"allowed": False, "reason": "denied: expired"})

    # age check
    user_band = passport.get("age_band")
    if band_to_min(user_band) < band_to_min(required_age_band):
        await run_in_threadpool(_post, f"{AUDIT_URL}/log", {
            "timestamp": datetime.utcnow().isoformat(),
            "avatar_id": passport.get("subject"),
            "site_id": site_id,
            "resource": resource,
            "action": action,
            "decision": "denied",
            "rules_applied": [f"age_band:{user_band}"],
        })
        return JSONResponse({"allowed": False, "reason": "denied: underage"})

    # fetch policies
    try:
        r = await run_in_threadpool(requests.get, f"{CONTROL_URL}/policy/{passport.get('subject')}")
        policy = r.json()
    except Exception:
        policy = None

    rules_applied = [f"age_band:{user_band}"]

    # check blocked categories via requested resource (stub: resource contains category)
    if policy and policy.get("blocked_categories"):
        for bc in policy.get("blocked_categories", []):
            if bc in resource:
                await run_in_threadpool(_post, f"{AUDIT_URL}/log", {
                    "timestamp": datetime.utcnow().isoformat(),
                    "avatar_id": passport.get("subject"),
                    "site_id": site_id,
                    "resource": resource,
                    "action": action,
                    "decision": "denied",
                    "rules_applied": rules_applied + [f"blocked_category:{bc}"],
                })
                return JSONResponse({"allowed": False, "reason": f"denied: blocked_category:{bc}"})

    # allowed
    await run_in_threadpool(_post, f"{AUDIT_URL}/log", {
        "timestamp": datetime.utcnow().isoformat(),
        "avatar_id": passport.get("subject"),
        "site_id": site_id,
        "resource": resource,
        "action": action,
        "decision": "allowed",
        "rules_applied": rules_applied,
    })

    return JSONResponse({"allowed": True, "reason": "allowed"})
