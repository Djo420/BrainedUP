import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    decode_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
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
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"msg": "Bad credentials"}), 401
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=str(current_user))
    return jsonify(access_token=access_token), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(refresh=True)
def logout():
    return jsonify({"msg": "Logged out"}), 200

@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    data = request.get_json(force=True)
    old = data.get("old_password")
    new = data.get("new_password")
    if not old or not new:
        return jsonify({"msg": "Missing old or new password"}), 400
    user = User.query.get(get_jwt_identity())
    if not user or not check_password_hash(user.password_hash, old):
        return jsonify({"msg": "Old password incorrect"}), 401
    user.password_hash = generate_password_hash(new)
    db.session.commit()
    return jsonify({"msg": "Password changed"}), 200

@auth_bp.route("/request-reset", methods=["POST"])
def request_reset():
    data = request.get_json(force=True)
    email = data.get("email", "").strip()
    if not email:
        return jsonify({"msg": "Missing email"}), 400
    user = User.query.filter_by(email=email).first()
    if user:
        reset_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(minutes=15),
            additional_claims={"scope": "password_reset"}
        )
        reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
        current_app.logger.info(f"Password reset link for {email}: {reset_url}")
    return jsonify({"msg": "If the email exists, a reset link has been sent."}), 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(force=True)
    token = data.get("token", "")
    new_password = data.get("new_password", "")
    if not token or not new_password:
        return jsonify({"msg": "Missing token or new password"}), 400
    try:
        decoded = decode_token(token)
    except Exception:
        return jsonify({"msg": "Invalid or expired token"}), 400
    if decoded.get("scope") != "password_reset":
        return jsonify({"msg": "Invalid token"}), 400
    user = User.query.get(decoded["sub"])
    if not user:
        return jsonify({"msg": "User not found"}), 404
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"msg": "Password has been reset"}), 200
