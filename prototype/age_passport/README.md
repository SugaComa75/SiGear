# SiGear Age Passport Prototype

This prototype implements the Minting Service, Control App, Integration API, Audit Subsystem and a small Portable CLI to demonstrate flows described in the specification.

Run services (separately, in different terminals):

```bash
# Minting Service
uvicorn prototype.age_passport.minting_service:app --port 8000 --reload

# Control App
uvicorn prototype.age_passport.control_service:app --port 8001 --reload

# Integration API
uvicorn prototype.age_passport.integration_service:app --port 8002 --reload

# Audit Subsystem
uvicorn prototype.age_passport.audit_service:app --port 8003 --reload
```

Portable CLI usage:

```bash
# mint and store locally
python prototype/age_passport/portable_cli.py mint --dob 2000-01-01 --out avatar.enc

# show stored passport
python prototype/age_passport/portable_cli.py show --file avatar.enc

# present to site (calls Integration API)
python prototype/age_passport/portable_cli.py present --file avatar.enc --site example.com --resource /video/123 --action view
```

Keys and data are created under `prototype/age_passport/data/` on first run.