"""Password hashing, JWT issuing and request validation helpers."""
import datetime
import hashlib

import jwt

TOKEN_VALIDITY = datetime.timedelta(days=30)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(user_id, secret_key):
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + TOKEN_VALIDITY
    }, secret_key, algorithm='HS256')


def decode_token(token, secret_key):
    """Decode a `Bearer <token>` header value and return its user id."""
    payload = jwt.decode(token.split(' ')[1], secret_key, algorithms=['HS256'])
    return payload['user_id']


def missing_fields(data, required_fields):
    """Return the required fields absent from a request payload."""
    return [field for field in required_fields if field not in (data or {})]
