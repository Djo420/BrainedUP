from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User

auth_bp = Blueprint("auth", __name__)
jwt = JWTManager()

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 422
    user = User(email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password or ""):
        return jsonify({"msg": "Bad credentials"}), 401
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    """
    Expects JSON: { "old_password": "...", "new_password": "..." }
    """
    data = request.get_json(force=True)
    old = data.get("old_password")
    new = data.get("new_password")

    if not old or not new:
        return jsonify({"msg": "Missing old or new password"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not check_password_hash(user.password_hash, old):
        return jsonify({"msg": "Old password incorrect"}), 401

    user.password_hash = generate_password_hash(new)
    db.session.commit()
    return jsonify({"msg": "Password changed"}), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(refresh=True)
def logout():
    return jsonify({"msg": "Logged out"}), 200
