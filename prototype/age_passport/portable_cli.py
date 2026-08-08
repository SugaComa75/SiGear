#!/usr/bin/env python3
import argparse
import json
import requests
from cryptography.fernet import Fernet
from pathlib import Path

MINT_URL = "http://localhost:8000/mint"
INTEGRATION_URL = "http://localhost:8002/enforce"


def derive_key(passphrase: str) -> bytes:
    # simple symmetric key derivation for prototype (not production-grade)
    # use the passphrase bytes padded/truncated to 32 bytes and urlsafe_b64encode
    import base64
    b = passphrase.encode()
    b = (b * 32)[:32]
    return base64.urlsafe_b64encode(b)


def cmd_mint(args):
    r = requests.post(MINT_URL, json={"dob": args.dob}, timeout=5)
    r.raise_for_status()
    data = r.json()
    payload = json.dumps(data).encode()
    key = derive_key(args.passphrase)
    f = Fernet(key)
    out = f.encrypt(payload)
    Path(args.out).write_bytes(out)
    print("Saved encrypted avatar to", args.out)


def load_file(path: str, passphrase: str):
    data = Path(path).read_bytes()
    key = derive_key(passphrase)
    f = Fernet(key)
    dec = f.decrypt(data)
    return json.loads(dec)


def cmd_show(args):
    d = load_file(args.file, args.passphrase)
    print(json.dumps(d, indent=2))


def cmd_present(args):
    d = load_file(args.file, args.passphrase)
    passport = d.get("passport")
    payload = {
        "passport": passport,
        "required_age_band": args.required_age_band,
        "site_id": args.site or "example.com",
        "resource": args.resource or "/",
        "action": args.action or "view",
    }
    r = requests.post(INTEGRATION_URL, json=payload, timeout=5)
    print(r.status_code, r.text)


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd")

    a = sub.add_parser("mint")
    a.add_argument("--dob", required=False)
    a.add_argument("--out", required=True)
    a.add_argument("--passphrase", required=True)

    b = sub.add_parser("show")
    b.add_argument("--file", required=True)
    b.add_argument("--passphrase", required=True)

    c = sub.add_parser("present")
    c.add_argument("--file", required=True)
    c.add_argument("--passphrase", required=True)
    c.add_argument("--required_age_band", default="18+")
    c.add_argument("--site", required=False)
    c.add_argument("--resource", required=False)
    c.add_argument("--action", required=False)

    args = p.parse_args()
    if args.cmd == "mint":
        cmd_mint(args)
    elif args.cmd == "show":
        cmd_show(args)
    elif args.cmd == "present":
        cmd_present(args)
    else:
        p.print_help()


if __name__ == "__main__":
    main()
