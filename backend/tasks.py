import json
import os
import uuid
from datetime import datetime, timezone

TASK_FILE = "tasks.json"

def load_tasks():
    if os.path.exists(TASK_FILE):
        try:
            with open(TASK_FILE) as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_tasks(tasks):
    with open(TASK_FILE, "w") as f:
        json.dump(tasks, f, indent=2)

def add_task(name, ttype, cycle, unit=None):
    new = {
        "id": str(uuid.uuid4()),
        "name": name,
        "type": ttype,
        "cycle": int(cycle) if ttype == "Timer-based" else cycle,
        "unit": unit if ttype == "Timer-based" else None,
        "completed": False,
        "last_reset": datetime.now(timezone.utc).isoformat(),
        "priority": False
    }
    tasks = load_tasks()
    tasks.append(new)
    save_tasks(tasks)
    return new

def update_task(task_id, data):
    tasks = load_tasks()
    for t in tasks:
        if t["id"] == task_id:
            old_type  = t["type"]
            old_cycle = t["cycle"]
            for k, v in data.items():
                t[k] = v
            if data.get("completed") is True \
            or data.get("type")      != old_type \
            or data.get("cycle")     != old_cycle:
                t["last_reset"] = datetime.now(timezone.utc).isoformat()
            save_tasks(tasks)
            return t
    return None

def delete_task(task_id):
    tasks = [t for t in load_tasks() if t["id"] != task_id]
    save_tasks(tasks)
