import json
import os
from typing import Any, Dict, List

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)


def _path(name: str) -> str:
    return os.path.join(DATA_DIR, name)


def read_json(name: str, default=None):
    path = _path(name)
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(name: str, data: Any):
    path = _path(name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, default=str, indent=2)


def append_json_list(name: str, item: Dict):
    arr = read_json(name, default=[])
    arr.append(item)
    write_json(name, arr)
