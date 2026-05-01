SiGear SBC Prototype (Flask)

This prototype simulates SBC behaviour: a policy-backed DNS check endpoint, local logs, SOS event, and a minimal UI.

Quick start
1. Create a venv and install:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run the app:

```powershell
python app.py
```

3. Open http://localhost:5000 to view the SBC UI.

Notes
- This is a mock for development and demo only — not for production use.
- Policy is loaded from `policy.json`. Update it to change allow/block rules.
API key usage
- The prototype supports simple API-key auth for push/sync endpoints.
- Default test key is in `keys.json`. Replace it for any real testing.
