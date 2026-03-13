import jwt
import datetime
import bcrypt
from flask import Blueprint, request, jsonify
from database import get_db

auth_bp = Blueprint('auth', __name__)
SECRET = 'resumewise-secret-key-change-in-production'

# ── SIGNUP ──────────────────────────────────────────────
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name     = (data.get('name')  or '').strip()
    email    = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    db = get_db()
    try:
        db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, email, hashed)
        )
        db.commit()
        user_id = db.execute(
            'SELECT id FROM users WHERE email = ?', (email,)
        ).fetchone()['id']
    except Exception:
        db.close()
        return jsonify({'error': 'Email already registered'}), 409
    db.close()

    token = _make_token(user_id, name)
    return jsonify({'token': token, 'user': {'id': user_id, 'name': name, 'email': email}}), 201


# ── LOGIN ───────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    db   = get_db()
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    db.close()

    if not user or not bcrypt.checkpw(password.encode(), user['password'].encode()):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = _make_token(user['id'], user['name'])
    return jsonify({
        'token': token,
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    })


# ── GET PROFILE ─────────────────────────────────────────
@auth_bp.route('/me', methods=['GET'])
def me():
    from middleware import token_required
    # inline check so we can return user details
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'])
    except Exception:
        return jsonify({'error': 'Invalid token'}), 401

    db   = get_db()
    user = db.execute('SELECT id, name, email, created_at FROM users WHERE id = ?',
                      (payload['user_id'],)).fetchone()
    db.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(dict(user))


# ── HELPER ──────────────────────────────────────────────
def _make_token(user_id, name):
    return jwt.encode({
        'user_id': user_id,
        'name':    name,
        'exp':     datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET, algorithm='HS256')
