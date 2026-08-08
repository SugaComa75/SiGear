import os
from datetime import datetime, timedelta
from typing import Tuple
from nacl.signing import SigningKey, VerifyKey
from nacl.encoding import HexEncoder

KEY_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(KEY_DIR, exist_ok=True)
SK_PATH = os.path.join(KEY_DIR, "signing_key.hex")
VK_PATH = os.path.join(KEY_DIR, "verify_key.hex")


def generate_signing_key() -> SigningKey:
    if os.path.exists(SK_PATH):
        sk_hex = open(SK_PATH, "r").read().strip()
        return SigningKey(sk_hex, encoder=HexEncoder)
    sk = SigningKey.generate()
    open(SK_PATH, "w").write(sk.encode(encoder=HexEncoder).decode())
    vk = sk.verify_key
    open(VK_PATH, "w").write(vk.encode(encoder=HexEncoder).decode())
    return sk


def get_verify_key() -> VerifyKey:
    if os.path.exists(VK_PATH):
        vk_hex = open(VK_PATH, "r").read().strip()
        return VerifyKey(vk_hex, encoder=HexEncoder)
    # ensure signing key exists
    sk = generate_signing_key()
    return sk.verify_key


def sign_payload(payload_bytes: bytes) -> str:
    sk = generate_signing_key()
    sig = sk.sign(payload_bytes)
    # signature + message, but we only need signature portion
    signature = sig.signature
    return signature.hex()


def verify_signature(payload_bytes: bytes, signature_hex: str) -> bool:
    vk = get_verify_key()
    try:
        signature = bytes.fromhex(signature_hex)
        vk.verify(payload_bytes, signature)
        return True
    except Exception:
        return False


def long_expiry_years(years: int = 10) -> datetime:
    return datetime.utcnow() + timedelta(days=365 * years)
