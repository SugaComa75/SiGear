from flask import Flask, jsonify, request, render_template
import json

app = Flask(__name__)

with open('policy.json') as f:
    policy = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/policy/push', methods=['POST'])
def push_policy():
    key = request.headers.get('X-API-Key')
    if key != 'test-api-key-CHANGE-THIS-abc123':
        return jsonify({'error': 'unauthorized'}), 401
    payload = request.json
    # In prototype, just echo
    return jsonify({'ok': True, 'received': payload})

if __name__ == '__main__':
    app.run(port=5000)
from flask import Flask, jsonify, request, render_template
import json

app = Flask(__name__)

with open('policy.json') as f:
    policy = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/policy/push', methods=['POST'])
def push_policy():
    key = request.headers.get('X-API-Key')
    if key != 'test-api-key-CHANGE-THIS-abc123':
        return jsonify({'error': 'unauthorized'}), 401
    payload = request.json
    # In prototype, just echo
    return jsonify({'ok': True, 'received': payload})

if __name__ == '__main__':
    app.run(port=5000)
