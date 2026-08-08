from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.requests import Request
from datetime import datetime
from dataclasses import asdict
import uuid
import json
from prototype.age_passport.age_passport.models import AgeAttributes, AgePassport
from prototype.age_passport.age_passport import crypto

app = Starlette()


@app.route("/mint", methods=["POST"])
async def mint(request: Request):
    body = await request.json()
    # stubbed verification
    age_attrs = AgeAttributes(age_verified=True, age_band="18+", assurance_level="high")

    avatar_id = f"avatar:{uuid.uuid4()}"
    issued_at = datetime.utcnow()
    expiry = crypto.long_expiry_years(10)

    passport = AgePassport(
        issuer="SiGear",
        subject=avatar_id,
        age_verified=age_attrs.age_verified,
        age_band=age_attrs.age_band,
        assurance_level=age_attrs.assurance_level,
        issued_at=issued_at,
        expiry=expiry,
    )

    # Build a canonical passport dict with ISO timestamps before signing
    passport_dict = asdict(passport)
    passport_dict["issued_at"] = passport.issued_at.isoformat()
    passport_dict["expiry"] = passport.expiry.isoformat()
    # remove any existing signature key if present
    passport_dict.pop("signature", None)
    # canonical JSON bytes for signing — deterministic ordering
    payload_bytes = json.dumps(passport_dict, sort_keys=True, default=str, separators=(",", ":")).encode()
    signature = crypto.sign_payload(payload_bytes)
    passport_dict["signature"] = signature

    return JSONResponse({"avatar_id": avatar_id, "passport": passport_dict})
