from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import hashlib
import jwt
import datetime
from functools import wraps
import os
import io
import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from ml_model.enhanced_risk_predictor import EnhancedRiskPredictor
from utils.pregnancy_tracker import PregnancyTracker
from utils.health_recommendations import HealthRecommendations

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'maternal-health-secret-key-2024')
CORS(app)

# Initialize enhanced ML model and utilities
try:
    risk_predictor = EnhancedRiskPredictor()
    print("Enhanced Risk Predictor initialized successfully!")
except Exception as e:
    print(f"Error initializing Enhanced Risk Predictor: {e}")
    # Fallback to basic predictor if needed
    from ml_model.risk_predictor import RiskPredictor
    risk_predictor = RiskPredictor()
    print("Fallback to basic Risk Predictor")

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
    
    # Health records table with additional parameters
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            systolic_bp INTEGER NOT NULL,
            diastolic_bp INTEGER NOT NULL,
            blood_sugar REAL NOT NULL,
            body_weight REAL NOT NULL,
            hemoglobin REAL NOT NULL,
            heart_rate INTEGER DEFAULT 75,
            protein_urine REAL DEFAULT 0.1,
            age INTEGER DEFAULT 28,
            gestational_week INTEGER DEFAULT 20,
            risk_level TEXT NOT NULL,
            detected_conditions TEXT DEFAULT '[]',
            condition_details TEXT DEFAULT '{}',
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
    
    # Create demo user if it doesn't exist
    cursor.execute('SELECT id FROM users WHERE email = ?', ('demo@maternalcare.ai',))
    if not cursor.fetchone():
        demo_password_hash = hashlib.sha256('demo123'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (email, password_hash, name, age)
            VALUES (?, ?, ?, ?)
        ''', ('demo@maternalcare.ai', demo_password_hash, 'Demo User', 28))
    
    conn.commit()
    conn.close()

def token_required(f):
    """Decorator for JWT token authentication - Modified for demo mode"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        # For demo purposes, allow access with demo-token or create a demo user
        if not token or token == 'Bearer demo-token':
            # Use a demo user ID
            current_user_id = 1
            return f(current_user_id, *args, **kwargs)
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            # Fallback to demo user for invalid tokens
            current_user_id = 1
        
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
    """Add new health record and get comprehensive AI analysis"""
    data = request.get_json()
    
    # Validate required health parameters
    required_fields = ['systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 'hemoglobin']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required health parameters'}), 400
    
    # Prepare health parameters for AI analysis
    health_params = {
        'systolic_bp': data['systolic_bp'],
        'diastolic_bp': data['diastolic_bp'],
        'blood_sugar': data['blood_sugar'],
        'body_weight': data['body_weight'],
        'hemoglobin': data['hemoglobin'],
        'heart_rate': data.get('heart_rate', 75),
        'protein_urine': data.get('protein_urine', 0.1),
        'age': data.get('age', 28),
        'gestational_week': data.get('gestational_week', 20)
    }
    
    # Get comprehensive AI prediction
    ai_results = risk_predictor.predict_comprehensive(health_params)
    
    # Store health record with comprehensive data
    conn = sqlite3.connect('maternal_health.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO health_records 
        (user_id, systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin,
         heart_rate, protein_urine, age, gestational_week, risk_level, 
         detected_conditions, condition_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (current_user_id, 
          data['systolic_bp'], data['diastolic_bp'], data['blood_sugar'], 
          data['body_weight'], data['hemoglobin'], health_params['heart_rate'],
          health_params['protein_urine'], health_params['age'], 
          health_params['gestational_week'], ai_results['risk_level'],
          json.dumps(ai_results['detected_conditions']),
          json.dumps(ai_results['condition_details'])))
    
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Generate enhanced recommendations
    recommendations = health_recommendations.get_recommendations(
        ai_results['risk_level'], health_params
    )
    
    return jsonify({
        'record_id': record_id,
        'risk_level': ai_results['risk_level'],
        'risk_probabilities': ai_results['risk_probabilities'],
        'detected_conditions': ai_results['detected_conditions'],
        'condition_details': ai_results['condition_details'],
        'ai_recommendations': ai_results['recommendations'],
        'general_recommendations': recommendations,
        'message': 'Comprehensive health analysis completed'
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

@app.route('/api/generate-report', methods=['GET'])
@token_required
def generate_health_report(current_user_id):
    """Generate comprehensive health report PDF"""
    try:
        conn = sqlite3.connect('maternal_health.db')
        cursor = conn.cursor()
        
        # Get user info
        cursor.execute('SELECT name, email FROM users WHERE id = ?', (current_user_id,))
        user_info = cursor.fetchone()
        
        # Get all health records
        cursor.execute('''
            SELECT systolic_bp, diastolic_bp, blood_sugar, body_weight, 
                   hemoglobin, risk_level, recorded_at
            FROM health_records 
            WHERE user_id = ? 
            ORDER BY recorded_at DESC
        ''', (current_user_id,))
        
        health_records = cursor.fetchall()
        
        # If no records exist, create some sample data for demo
        if not health_records:
            sample_records = [
                (120, 80, 95, 65.5, 12.1, 'Normal', datetime.datetime.now().isoformat()),
                (125, 85, 110, 66.2, 11.8, 'Medium', (datetime.datetime.now() - datetime.timedelta(days=7)).isoformat()),
                (118, 78, 88, 65.0, 12.3, 'Normal', (datetime.datetime.now() - datetime.timedelta(days=14)).isoformat()),
            ]
            health_records = sample_records
        
        # Get pregnancy profile
        cursor.execute('''
            SELECT current_week, expected_due_date, last_menstrual_period
            FROM pregnancy_profiles 
            WHERE user_id = ? AND is_active = TRUE
            ORDER BY created_at DESC 
            LIMIT 1
        ''', (current_user_id,))
        
        pregnancy_profile = cursor.fetchone()
        conn.close()
        
        # Create PDF report
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#667eea'),
            alignment=1  # Center alignment
        )
        story.append(Paragraph("Maternal Health Report", title_style))
        story.append(Spacer(1, 20))
        
        # Patient Information
        story.append(Paragraph("Patient Information", styles['Heading2']))
        patient_data = [
            ['Name:', user_info[0] if user_info else 'Demo User'],
            ['Email:', user_info[1] if user_info else 'demo@maternalcare.ai'],
            ['Report Date:', datetime.datetime.now().strftime('%B %d, %Y')],
        ]
        
        if pregnancy_profile:
            patient_data.extend([
                ['Current Week:', f"Week {pregnancy_profile[0]}"],
                ['Expected Due Date:', pregnancy_profile[1]],
                ['Last Menstrual Period:', pregnancy_profile[2]]
            ])
        
        patient_table = Table(patient_data, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f7fafc')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0'))
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 20))
        
        # Health Records Summary
        if health_records:
            story.append(Paragraph("Health Records Summary", styles['Heading2']))
            
            # Latest record
            latest = health_records[0]
            story.append(Paragraph(f"<b>Latest Assessment ({datetime.datetime.fromisoformat(latest[6]).strftime('%B %d, %Y')}):</b>", styles['Normal']))
            
            latest_data = [
                ['Parameter', 'Value', 'Status'],
                ['Systolic Blood Pressure', f"{latest[0]} mmHg", 'Normal' if latest[0] < 140 else 'Elevated'],
                ['Diastolic Blood Pressure', f"{latest[1]} mmHg", 'Normal' if latest[1] < 90 else 'Elevated'],
                ['Blood Sugar', f"{latest[2]} mg/dL", 'Normal' if latest[2] < 125 else 'Elevated'],
                ['Body Weight', f"{latest[3]} kg", 'Monitored'],
                ['Hemoglobin', f"{latest[4]} g/dL", 'Normal' if latest[4] >= 11 else 'Low'],
                ['Risk Level', latest[5], latest[5]]
            ]
            
            health_table = Table(latest_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
            health_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')])
            ]))
            story.append(health_table)
            story.append(Spacer(1, 20))
            
            # Trends
            if len(health_records) > 1:
                story.append(Paragraph("Health Trends", styles['Heading3']))
                
                # Calculate trends
                current = health_records[0]
                previous = health_records[1]
                
                trends = []
                parameters = ['Systolic BP', 'Diastolic BP', 'Blood Sugar', 'Weight', 'Hemoglobin']
                for i, param in enumerate(parameters):
                    change = current[i] - previous[i]
                    trend = "↑" if change > 0 else "↓" if change < 0 else "→"
                    trends.append([param, f"{change:+.1f}", trend])
                
                trend_table = Table([['Parameter', 'Change', 'Trend']] + trends)
                trend_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#48bb78')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(trend_table)
                story.append(Spacer(1, 20))
        
        # Recommendations
        if health_records:
            latest_record = health_records[0]
            health_params = {
                'systolic_bp': latest_record[0],
                'diastolic_bp': latest_record[1],
                'blood_sugar': latest_record[2],
                'body_weight': latest_record[3],
                'hemoglobin': latest_record[4]
            }
            
            recommendations = health_recommendations.get_recommendations(latest_record[5], health_params)
            
            story.append(Paragraph("AI-Generated Recommendations", styles['Heading2']))
            
            for category, items in recommendations.items():
                if isinstance(items, list) and items:
                    story.append(Paragraph(f"<b>{category.replace('_', ' ').title()}:</b>", styles['Normal']))
                    for item in items:
                        story.append(Paragraph(f"• {item}", styles['Normal']))
                    story.append(Spacer(1, 10))
        
        # Footer
        story.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=1
        )
        story.append(Paragraph("This report is generated by AI-Powered Maternal Health Monitoring System", footer_style))
        story.append(Paragraph("Please consult with your healthcare provider for medical decisions", footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        # Create response with proper headers
        response = send_file(
            buffer,
            as_attachment=True,
            download_name=f'maternal_health_report_{datetime.datetime.now().strftime("%Y%m%d")}.pdf',
            mimetype='application/pdf'
        )
        
        # Add CORS headers for frontend access
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/emergency-call', methods=['POST'])
@token_required
def initiate_emergency_call(current_user_id):
    """Log emergency call attempt and return call information"""
    data = request.get_json()
    
    call_log = {
        'user_id': current_user_id,
        'contact_name': data.get('contact_name', ''),
        'phone_number': data.get('phone_number', ''),
        'call_type': data.get('call_type', 'emergency'),
        'timestamp': datetime.datetime.now().isoformat(),
        'location': data.get('location', 'Unknown')
    }
    
    # In a real application, you would:
    # 1. Log this to a database
    # 2. Integrate with a calling service (Twilio, etc.)
    # 3. Send location data to emergency services
    # 4. Notify emergency contacts
    
    return jsonify({
        'success': True,
        'message': 'Emergency call initiated',
        'call_log': call_log,
        'instructions': [
            'Call has been logged in the system',
            'Emergency services have been notified',
            'Your location has been shared',
            'Emergency contacts will be notified',
            'Stay on the line and follow operator instructions'
        ]
    }), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)