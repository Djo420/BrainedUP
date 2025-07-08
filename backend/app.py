from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from tasks import load_tasks, save_tasks, add_task, update_task, delete_task
from datetime import datetime, timedelta, timezone
from models import db, Task
from flask_jwt_extended import jwt_required, get_jwt_identity
from auth import auth_bp, jwt

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

db.init_app(app)
jwt.init_app(app)
CORS(app)
app.register_blueprint(auth_bp, url_prefix='/auth')

with app.app_context():
    db.create_all()

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
@jwt_required()
def list_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": t.id,
        "name": t.name,
        "type": t.type,
        "cycle": t.cycle,
        "unit": t.unit,
        "completed": t.completed,
        "last_reset": t.last_reset.isoformat(),
        "priority": t.priority
    } for t in tasks]), 200

@app.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json(force=True)
    t = Task(
        user_id=user_id,
        name=data["name"],
        type=data["type"],
        cycle=str(data["cycle"]),
        unit=data.get("unit"),
        completed=False
    )
    db.session.add(t)
    db.session.commit()
    return jsonify({
        "id": t.id,
        "name": t.name,
        "type": t.type,
        "cycle": t.cycle,
        "unit": t.unit,
        "completed": t.completed,
        "last_reset": t.last_reset.isoformat(),
        "priority": t.priority
    }), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    t = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not t:
        return jsonify({"msg": "Not found"}), 404
    data = request.get_json(force=True)
    for f in ("name", "type", "cycle", "unit", "completed", "priority"):
        if f in data:
            setattr(t, f, data[f])
    if data.get("completed") or data.get("type") != t.type or data.get("cycle") != t.cycle:
        t.last_reset = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({
        "id": t.id,
        "name": t.name,
        "type": t.type,
        "cycle": t.cycle,
        "unit": t.unit,
        "completed": t.completed,
        "last_reset": t.last_reset.isoformat(),
        "priority": t.priority
    }), 200

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    t = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not t:
        return jsonify({"msg": "Not found"}), 404
    db.session.delete(t)
    db.session.commit()
    return "", 204

if __name__ == "__main__":
    app.run(debug=True)
