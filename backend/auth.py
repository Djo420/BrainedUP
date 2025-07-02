import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from models import db, User

auth_bp = Blueprint('auth', __name__)
jwt = JWTManager()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'msg':'Missing required fields'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'msg':'Email already exists'}), 422
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    access = create_access_token(identity=user.id)
    refresh = create_refresh_token(identity=user.id)
    return jsonify(access_token=access, refresh_token=refresh), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password','')):
        return jsonify({'msg':'Bad credentials'}), 401
    access = create_access_token(identity=user.id)
    refresh = create_refresh_token(identity=user.id)
    return jsonify(access_token=access, refresh_token=refresh), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access = create_access_token(identity=identity)
    return jsonify(access_token=access), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required(refresh=True)
def logout():
    return jsonify({'msg':'Logged out'}), 200
