from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, Task
from auth import auth_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///your.db')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
db.init_app(app)
jwt = JWTManager(app)
CORS(app)
app.register_blueprint(auth_bp, url_prefix='/auth')

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
    if "last_reset" in data:
        try:
            t.last_reset = datetime.fromisoformat(data["last_reset"])
        except Exception:
            pass
    for f in ("name", "type", "cycle", "unit", "completed", "priority"):
        if f in data:
            setattr(t, f, data[f])
    if "last_reset" not in data and (
        data.get("completed")
        or data.get("type") != t.type
        or data.get("cycle") != t.cycle
    ):
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
    app.run(host="127.0.0.1", port=5000, debug=True)
