from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.responses import PlainTextResponse
from prototype.age_passport.age_passport import storage

app = Starlette()


@app.route("/log", methods=["POST"])
async def log_event(request: Request):
    event = await request.json()
    storage.append_json_list("audit.json", event)
    return JSONResponse({"status": "ok"})


@app.route("/audit/{avatar_id}", methods=["GET"])
async def get_audit(request: Request):
    avatar_id = request.path_params["avatar_id"]
    events = storage.read_json("audit.json", default=[]) or []
    filtered = [e for e in events if e.get("avatar_id") == avatar_id]
    return JSONResponse(filtered)

