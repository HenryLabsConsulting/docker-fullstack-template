"""
Authentication routes: login, register, token refresh, current user.

JWT flow:
  1. User calls POST /api/auth/login with email + password
  2. Server returns access_token (short-lived, 1hr) + refresh_token (long-lived, 30d)
  3. Client stores tokens and sends access_token in Authorization header
  4. When access_token expires, client calls POST /api/auth/refresh with refresh_token
  5. Server returns a new access_token without requiring re-login

Registration is open (no admin gate) — this is a starter template.
For production, add email verification or admin-only registration.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Create a new user account. Open registration for this template."""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        email=data['email'],
        display_name=data.get('display_name', ''),
        role='user',
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'User registered',
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate and return JWT tokens."""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Include role and email in the token claims so the frontend
    # can use them without an extra API call.
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email}
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Exchange a valid refresh token for a new access token."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email}
    )

    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Return the current authenticated user's profile."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200
