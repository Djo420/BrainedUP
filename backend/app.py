from flask import Flask, jsonify, request
from flask_cors import CORS
from tasks import load_tasks, save_tasks, add_task, update_task, delete_task
from datetime import datetime, timedelta, timezone
from backend.models import db
from backend.auth import auth_bp, jwt

app = Flask(__name__)
CORS(app)

def compute_next_reset(task):
    now  = datetime.now(timezone.utc)
    last = datetime.fromisoformat(task["last_reset"])
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)

    if task["type"] == "Timer-based":
        unit = task.get("unit")
        if unit == "Minutes":
            return last + timedelta(minutes=task["cycle"])
        if unit == "Hours":
            return last + timedelta(hours=task["cycle"])
        if unit == "Days":
            return last + timedelta(days=task["cycle"])
        if unit == "Weeks":
            return last + timedelta(weeks=task["cycle"])
        return last

    if task["cycle"] == "Daily":
        base = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return base + timedelta(days=1)

    if task["cycle"] == "Weekly":
        return last + timedelta(days=(7 - last.weekday()))

    if task["cycle"] == "Monthly":
        year, month = last.year + (last.month // 12), (last.month % 12) + 1
        return last.replace(
            year=year,
            month=month,
            day=1,
            hour=0, minute=0, second=0, microsecond=0
        )

    if task["cycle"] == "Yearly":
        return last.replace(
            year=last.year + 1,
            month=1, day=1,
            hour=0, minute=0, second=0, microsecond=0
        )

    return None

@app.route("/tasks", methods=["GET"])
def list_tasks():
    tasks = load_tasks()
    now = datetime.now(timezone.utc)
    changed = False

    for t in tasks:
        if t.get("completed"):
            nr = compute_next_reset(t)
            if nr and now >= nr:
                t["completed"] = False
                t["last_reset"] = now.isoformat()
                changed = True

    if changed:
        save_tasks(tasks)

    return jsonify(tasks), 200

@app.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    task = add_task(data["name"], data["type"], data["cycle"], data.get("unit"))
    return jsonify(task), 201

@app.route("/tasks/<task_id>", methods=["PUT"])
def modify_task(task_id):
    data = request.get_json()
    task = update_task(task_id, data)
    if not task:
        return jsonify({"error": "Not found"}), 404
    return jsonify(task), 200

@app.route("/tasks/<task_id>", methods=["DELETE"])
def remove_task(task_id):
    delete_task(task_id)
    return "", 204

if __name__ == "__main__":
    app.run(debug=True)
