from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import jwt
import datetime
from functools import wraps
import os
from ml_model.risk_predictor import RiskPredictor
from utils.pregnancy_tracker import PregnancyTracker
from utils.health_recommendations import HealthRecommendations

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'maternal-health-secret-key-2024')
CORS(app)

# Initialize ML model and utilities
risk_predictor = RiskPredictor()
pregnancy_tracker = PregnancyTracker()
health_recommendations = HealthRecommendations()

def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Health records table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            systolic_bp INTEGER NOT NULL,
            diastolic_bp INTEGER NOT NULL,
            blood_sugar REAL NOT NULL,
            body_weight REAL NOT NULL,
            hemoglobin REAL NOT NULL,
            risk_level TEXT NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Pregnancy profiles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pregnancy_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            last_menstrual_period DATE NOT NULL,
            expected_due_date DATE NOT NULL,
            current_week INTEGER,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def token_required(f):
    """Decorator for JWT token authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name', 'age']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Hash password
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    
    try:
        conn = sqlite3.connect('maternal_health.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, age)
            VALUES (?, ?, ?, ?)
        ''', (data['email'], password_hash, data['name'], data['age']))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user_id': user_id
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    print(f"Login attempt - Email: {data.get('email')}, Password provided: {bool(data.get('password'))}")
    
    if not data.get('email') or not data.get('password'):
        print("Missing email or password")
        return jsonify({'message': 'Email and password required'}), 400
    
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    print(f"Password hash: {password_hash}")
    
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, name FROM users WHERE email = ? AND password_hash = ?
    ''', (data['email'], password_hash))
    
    user = cursor.fetchone()
    print(f"User found: {bool(user)}")
    conn.close()
    
    if user:
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user_id': user[0],
            'name': user[1]
        }), 200
    else:
        print("Invalid credentials")
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/health-record', methods=['POST'])
@token_required
def add_health_record(current_user_id):
    """Add new health record and get risk assessment"""
    data = request.get_json()
    
    # Validate required health parameters
    required_fields = ['systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 'hemoglobin']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required health parameters'}), 400
    
    # Predict risk level using ML model
    health_params = {
        'systolic_bp': data['systolic_bp'],
        'diastolic_bp': data['diastolic_bp'],
        'blood_sugar': data['blood_sugar'],
        'body_weight': data['body_weight'],
        'hemoglobin': data['hemoglobin']
    }
    
    risk_level = risk_predictor.predict_risk(health_params)
    
    # Store health record
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO health_records 
        (user_id, systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (current_user_id, data['systolic_bp'], data['diastolic_bp'], 
          data['blood_sugar'], data['body_weight'], data['hemoglobin'], risk_level))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Generate recommendations
    recommendations = health_recommendations.get_recommendations(risk_level, health_params)
    
    return jsonify({
        'record_id': record_id,
        'risk_level': risk_level,
        'recommendations': recommendations,
        'message': 'Health record added successfully'
    }), 201

@app.route('/api/pregnancy-profile', methods=['POST'])
@token_required
def create_pregnancy_profile(current_user_id):
    """Create or update pregnancy profile"""
    data = request.get_json()
    
    if not data.get('last_menstrual_period'):
        return jsonify({'message': 'Last menstrual period date required'}), 400
    
    # Calculate expected due date and current week
    profile_data = pregnancy_tracker.create_profile(data['last_menstrual_period'])
    
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    # Deactivate existing profiles
    cursor.execute('UPDATE pregnancy_profiles SET is_active = FALSE WHERE user_id = ?', (current_user_id,))
    
    # Create new profile
    cursor.execute('''
        INSERT INTO pregnancy_profiles 
        (user_id, last_menstrual_period, expected_due_date, current_week)
        VALUES (?, ?, ?, ?)
    ''', (current_user_id, data['last_menstrual_period'], 
          profile_data['expected_due_date'], profile_data['current_week']))
    
    profile_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'profile_id': profile_id,
        'current_week': profile_data['current_week'],
        'expected_due_date': profile_data['expected_due_date'],
        'message': 'Pregnancy profile created successfully'
    }), 201

@app.route('/api/pregnancy-guidance/<int:week>', methods=['GET'])
@token_required
def get_pregnancy_guidance(current_user_id, week):
    """Get week-specific pregnancy guidance"""
    guidance = pregnancy_tracker.get_weekly_guidance(week)
    return jsonify(guidance), 200

@app.route('/api/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user_id):
    """Get dashboard data including recent records and pregnancy info"""
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    # Get recent health records
    cursor.execute('''
        SELECT systolic_bp, diastolic_bp, blood_sugar, body_weight, 
               hemoglobin, risk_level, recorded_at
        FROM health_records 
        WHERE user_id = ? 
        ORDER BY recorded_at DESC 
        LIMIT 5
    ''', (current_user_id,))
    
    recent_records = cursor.fetchall()
    
    # Get active pregnancy profile
    cursor.execute('''
        SELECT current_week, expected_due_date, last_menstrual_period
        FROM pregnancy_profiles 
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY created_at DESC 
        LIMIT 1
    ''', (current_user_id,))
    
    pregnancy_profile = cursor.fetchone()
    conn.close()
    
    dashboard_data = {
        'recent_records': [
            {
                'systolic_bp': record[0],
                'diastolic_bp': record[1],
                'blood_sugar': record[2],
                'body_weight': record[3],
                'hemoglobin': record[4],
                'risk_level': record[5],
                'recorded_at': record[6]
            } for record in recent_records
        ],
        'pregnancy_profile': {
            'current_week': pregnancy_profile[0] if pregnancy_profile else None,
            'expected_due_date': pregnancy_profile[1] if pregnancy_profile else None,
            'last_menstrual_period': pregnancy_profile[2] if pregnancy_profile else None
        } if pregnancy_profile else None
    }
    
    return jsonify(dashboard_data), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)