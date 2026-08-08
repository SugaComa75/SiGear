from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse, PlainTextResponse
from starlette.requests import Request
from prototype.age_passport.age_passport import storage

app = Starlette()


@app.route("/policy/{avatar_id}", methods=["POST"])
async def set_policy(request: Request):
    avatar_id = request.path_params["avatar_id"]
    policy = await request.json()
    policies = storage.read_json("policies.json", default={}) or {}
    policies[avatar_id] = policy
    storage.write_json("policies.json", policies)
    return JSONResponse({"status": "ok"})


@app.route("/policy/{avatar_id}", methods=["GET"])
async def get_policy(request: Request):
    avatar_id = request.path_params["avatar_id"]
    policies = storage.read_json("policies.json", default={}) or {}
    p = policies.get(avatar_id)
    if not p:
        return PlainTextResponse("policy not found", status_code=404)
    return JSONResponse(p)
