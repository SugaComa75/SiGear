# Copyright (C) 2026 SiGear
# This file is part of the SiGear project.
# SiGear is distributed under the terms of the GNU Affero General Public License v3.0.
# See the project LICENSE-AGPLv3.txt for details.
# SPDX-License-Identifier: AGPL-3.0-only

from flask import Flask, jsonify, request, render_template, session, redirect, url_for, make_response, send_file
import json
import time
from pathlib import Path
import re
from functools import wraps
import hmac
import hashlib
import secrets
import secrets as _secrets
from datetime import datetime, timezone
VPN_SESSIONS_PATH = Path(__file__).parent / "vpn_sessions.json"

app = Flask(__name__)
app.secret_key = 'dev-secret-change-me'

POLICY_PATH = Path(__file__).parent / "policy.json"
DEVICES_PATH = Path(__file__).parent / "devices.json"
KEYS_PATH = Path(__file__).parent / "keys.json"
BOOTSTRAP_KEYS_PATH = Path(__file__).parent / "bootstrap_keys.json"
DEVICE_KEYS_PATH = Path(__file__).parent / "device_keys.json"
SETTINGS_PATH = Path(__file__).parent / "settings.json"
logs = []

def load_policy():
    try:
        with open(POLICY_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {"blocked_domains":[], "allowed_patterns":[]}

def load_devices():
    try:
        with open(DEVICES_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save_devices(devices):
    try:
        with open(DEVICES_PATH, 'w', encoding='utf-8') as f:
            json.dump(devices, f, indent=2)
        return True
    except Exception:
        return False


def load_keys():
    try:
        with open(KEYS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # support either list or dict {"keys": [...]}
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and 'keys' in data:
                return data['keys']
    except Exception:
        return []


def load_device_keys():
    try:
        with open(DEVICE_KEYS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def save_device_keys(d):
    try:
        with open(DEVICE_KEYS_PATH, 'w', encoding='utf-8') as f:
            json.dump(d, f, indent=2)
        return True
    except Exception:
        return False


def load_bootstrap_keys():
    try:
        with open(BOOTSTRAP_KEYS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
    except Exception:
        return {}


def load_vpn_sessions():
    try:
        with open(VPN_SESSIONS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def load_settings():
    try:
        with open(SETTINGS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {'hostname':'sigea-rpi','timezone':'UTC','fw_version':'0.0.0'}


def save_settings(s):
    try:
        with open(SETTINGS_PATH, 'w', encoding='utf-8') as f:
            json.dump(s, f, indent=2)
        return True
    except Exception:
        return False


def save_vpn_sessions(sessions):
    try:
        with open(VPN_SESSIONS_PATH, 'w', encoding='utf-8') as f:
            json.dump(sessions, f, indent=2)
        return True
    except Exception:
        return False


def make_mock_key():
    # Return a URL-safe pseudo-key (NOT real WireGuard keys). For mock only.
    return secrets.token_urlsafe(32)


def require_api_key(scope=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            key = request.headers.get('X-API-Key') or request.args.get('api_key')
            if not key:
                return jsonify({'status':'error','message':'missing api key'}), 401
            # global keys
            keys = load_keys()
            if key in keys:
                return f(*args, **kwargs)
            # device-scoped keys
            device_keys = load_device_keys()
            info = device_keys.get(key)
            if not info:
                return jsonify({'status':'error','message':'invalid api key'}), 401
            if scope and scope not in info.get('scopes', []):
                return jsonify({'status':'error','message':'insufficient scope'}), 403
            # attach device id to request context if needed
            request.device_id = info.get('device_id')
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route('/')
def index():
    return render_template('index.html')


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('admin'):
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return wrapper


@app.route('/admin/login', methods=['GET','POST'])
def admin_login():
    if request.method == 'POST':
        data = request.form
        user = data.get('username')
        pw = data.get('password')
        keys = {}
        try:
            with open(KEYS_PATH,'r',encoding='utf-8') as f:
                keys = json.load(f)
        except Exception:
            keys = {}
        admin_pw = keys.get('admin_password') or 'admin'
        if user == 'admin' and pw == admin_pw:
            session['admin'] = True
            return redirect(url_for('admin_dashboard'))
        return render_template('admin_login.html', error='Invalid credentials')
    return render_template('admin_login.html')


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('index'))


@app.route('/admin')
@admin_required
def admin_dashboard():
    settings = load_settings()
    devices = load_devices()
    logs_preview = logs[-50:]
    return render_template('admin.html', settings=settings, devices=devices, logs=logs_preview)

@app.route('/api/policy')
def api_policy():
    return jsonify(load_policy())


@app.route('/api/policy/pull')
def api_policy_pull():
    # Return both global policy and device-specific rules
    return jsonify({
        'policy': load_policy(),
        'devices': load_devices()
    })


@app.route('/api/policy/push', methods=['POST'])
@require_api_key(scope='sync')
def api_policy_push():
    payload = request.json or {}
    policy = payload.get('policy')
    devices = payload.get('devices')
    results = {}
    if policy is not None:
        try:
            with open(POLICY_PATH, 'w', encoding='utf-8') as f:
                json.dump(policy, f, indent=2)
            results['policy'] = 'ok'
        except Exception as e:
            results['policy'] = f'error: {e}'
    if devices is not None:
        ok = save_devices(devices)
        results['devices'] = 'ok' if ok else 'error'
    if not results:
        return jsonify({'status':'error','message':'no policy or devices provided'}), 400
    return jsonify({'status':'ok','results':results})

@app.route('/api/check_domain')
def api_check_domain():
    domain = request.args.get('domain','').lower()
    device_id = request.args.get('device_id')
    policy = load_policy()
    blocked = domain in [d.lower() for d in policy.get('blocked_domains',[])]
    # device-specific rules override global policy
    if device_id:
        devices = load_devices()
        dev = devices.get(device_id)
        if dev:
            dev_blocked = [d.lower() for d in dev.get('blocked_domains',[])]
            if domain in dev_blocked:
                blocked = True
            # device allow list can unblock
            dev_allowed = [d.lower() for d in dev.get('allowed_domains',[])]
            if domain in dev_allowed:
                blocked = False
    entry = {'time': time.time(), 'type':'dns_check', 'domain': domain, 'blocked': blocked}
    logs.append(entry)
    return jsonify({'domain': domain, 'blocked': blocked})

@app.route('/api/logs')
def api_logs():
    return jsonify(logs[-200:])


@app.route('/api/logs/export')
@admin_required
def api_logs_export():
    fmt = request.args.get('format','csv')
    data = logs
    if fmt == 'csv':
        # build CSV
        import io, csv, zipfile
        si = io.StringIO()
        cw = csv.writer(si)
        cw.writerow(['time','type','domain','blocked','device','payload'])
        for e in data:
            cw.writerow([e.get('time'), e.get('type'), e.get('domain',''), e.get('blocked',''), e.get('device',''), json.dumps(e.get('payload',''))])
        output = make_response(si.getvalue())
        output.headers['Content-Type'] = 'text/csv'
        output.headers['Content-Disposition'] = 'attachment; filename=logs.csv'
        return output
    else:
        return jsonify({'status':'error','message':'format not supported'}),400

@app.route('/api/sos', methods=['POST'])
def api_sos():
    payload = request.json or {}
    entry = {'time': time.time(), 'type':'sos', 'payload': payload}
    logs.append(entry)
    # In a real SBC this would relay to cloud / emergency contacts
    return jsonify({'status':'ok', 'message':'SOS relayed (mock)', 'entry': entry})


@app.route('/api/devices')
def api_devices():
    return jsonify(load_devices())


@app.route('/api/devices/export')
@admin_required
def api_devices_export():
    devices = load_devices()
    import io, csv
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['id','name','blocked_domains','allowed_domains'])
    for k,v in devices.items():
        cw.writerow([v.get('id'), v.get('name'), ';'.join(v.get('blocked_domains',[])), ';'.join(v.get('allowed_domains',[]))])
    output = make_response(si.getvalue())
    output.headers['Content-Type'] = 'text/csv'
    output.headers['Content-Disposition'] = 'attachment; filename=devices.csv'
    return output


@app.route('/license')
def license_view():
    # Serve the project license file
    lic = Path(__file__).parent.parent / 'LICENSE-AGPLv3.txt'
    if lic.exists():
        return send_file(lic, mimetype='text/plain')
    return jsonify({'status':'error','message':'license not found'}),404


@app.route('/download/source')
@admin_required
def download_source():
    # Create an in-memory zip of key project folders for sharing
    base = Path(__file__).parent.parent
    selected = ['SBC', 'MobileMock', 'Concept', 'LICENSE-AGPLv3.txt']
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for name in selected:
            p = base / name
            if not p.exists():
                continue
            if p.is_file():
                zf.write(p, arcname=p.relative_to(base))
            else:
                for f in p.rglob('*'):
                    if f.is_file():
                        # skip virtualenv and .git folders if present
                        if any(part.startswith('.venv') or part == '.git' for part in f.parts):
                            continue
                        zf.write(f, arcname=f.relative_to(base))
    buf.seek(0)
    return send_file(buf, mimetype='application/zip', as_attachment=True, download_name='sigea_source.zip')


@app.route('/api/devices', methods=['POST'])
@require_api_key(scope='sync')
def api_devices_post():
    payload = request.json or {}
    if 'id' not in payload:
        return jsonify({'status':'error','message':'device id required'}),400
    # validate id
    if not re.match(r'^[A-Za-z0-9_\-]{3,64}$', payload['id']):
        return jsonify({'status':'error','message':'invalid device id'}),400
    # validate fields
    blocked = payload.get('blocked_domains', [])
    allowed = payload.get('allowed_domains', [])
    if not isinstance(blocked, list) or not all(isinstance(x, str) for x in blocked):
        return jsonify({'status':'error','message':'blocked_domains must be list of strings'}),400
    if not isinstance(allowed, list) or not all(isinstance(x, str) for x in allowed):
        return jsonify({'status':'error','message':'allowed_domains must be list of strings'}),400

    devices = load_devices()
    # keep only allowed keys
    devices[payload['id']] = {
        'id': payload['id'],
        'name': payload.get('name',''),
        'blocked_domains': blocked,
        'allowed_domains': allowed
    }
    ok = save_devices(devices)
    if not ok:
        return jsonify({'status':'error','message':'failed to save'}),500
    logs.append({'time':time.time(),'type':'device_update','device':payload['id']})
    return jsonify({'status':'ok','device':payload['id']})


@app.route('/api/register', methods=['POST'])
def api_register():
    """Device registration using HMAC bootstrap key.
    Payload: {"id": "device-1", "ts": 1690000000, "sig": "hex..."}
    The sig is HMAC-SHA256 of "{id}|{ts}" using the bootstrap key assigned to the device.
    On success returns a new `api_key` for the device and scopes.
    """
    payload = request.json or {}
    dev_id = payload.get('id')
    ts = payload.get('ts')
    sig = payload.get('sig')
    if not dev_id or not ts or not sig:
        return jsonify({'status':'error','message':'id, ts, sig required'}),400
    try:
        ts = int(ts)
    except Exception:
        return jsonify({'status':'error','message':'invalid ts'}),400
    # check timestamp (allow 5 min skew)
    now = int(datetime.now(timezone.utc).timestamp())
    if abs(now - ts) > 300:
        return jsonify({'status':'error','message':'timestamp skew too large'}),400
    bootstrap = load_bootstrap_keys()
    bkey = bootstrap.get(dev_id)
    if not bkey:
        return jsonify({'status':'error','message':'no bootstrap key for device'}),404
    msg = f"{dev_id}|{ts}".encode('utf-8')
    expected = hmac.new(bkey.encode('utf-8'), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return jsonify({'status':'error','message':'invalid signature'}),401
    # generate api key
    api_key = _secrets.token_urlsafe(24)
    device_keys = load_device_keys()
    # Grant vpn scope as well for device operations
    device_keys[api_key] = {'device_id': dev_id, 'scopes': ['dns','sync','vpn']}
    save_device_keys(device_keys)
    logs.append({'time': time.time(), 'type':'register', 'device': dev_id})
    return jsonify({'status':'ok','api_key': api_key, 'scopes': ['dns','sync']})


@app.route('/api/vpn/provision', methods=['POST'])
@require_api_key(scope='vpn')
def api_vpn_provision():
    # Provision a mock WireGuard config for the device
    # request may include preferred_allowed_ips
    device_id = getattr(request, 'device_id', None) or request.json.get('device_id') if request.json else None
    if not device_id:
        return jsonify({'status':'error','message':'device_id required'}),400
    sessions = load_vpn_sessions()
    session_id = secrets.token_urlsafe(12)
    server_pub = make_mock_key()
    preshared = make_mock_key()
    client_priv = make_mock_key()
    client_pub = make_mock_key()
    entry = {
        'session_id': session_id,
        'device_id': device_id,
        'server_public_key': server_pub,
        'preshared_key': preshared,
        'client_public_key': client_pub,
        'client_private_key': client_priv,
        'allowed_ips': request.json.get('allowed_ips', ['0.0.0.0/0']),
        'endpoint': request.json.get('endpoint', 'vpn.example:51820'),
        'created': int(time.time())
    }
    sessions[session_id] = entry
    save_vpn_sessions(sessions)
    # Return a WG-like config (mock values)
    cfg = {
        'session_id': session_id,
        'private_key': client_priv,
        'peer_public_key': server_pub,
        'preshared_key': preshared,
        'endpoint': entry['endpoint'],
        'allowed_ips': entry['allowed_ips']
    }
    logs.append({'time': time.time(), 'type':'vpn_provision','device':device_id,'session':session_id})
    return jsonify({'status':'ok','config': cfg})


@app.route('/api/vpn/keepalive', methods=['POST'])
@require_api_key(scope='vpn')
def api_vpn_keepalive():
    payload = request.json or {}
    session_id = payload.get('session_id')
    device_keys = load_device_keys()
    # determine device
    device_id = getattr(request, 'device_id', None)
    sessions = load_vpn_sessions()
    if session_id and session_id in sessions:
        sessions[session_id]['last_seen'] = int(time.time())
        save_vpn_sessions(sessions)
        logs.append({'time': time.time(), 'type':'vpn_keepalive', 'session': session_id, 'device': sessions[session_id].get('device_id')})
        return jsonify({'status':'ok','session':session_id})
    else:
        # allow generic keepalive by device
        logs.append({'time': time.time(), 'type':'vpn_keepalive','device': device_id, 'payload': payload})
        return jsonify({'status':'ok','message':'keepalive logged'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
