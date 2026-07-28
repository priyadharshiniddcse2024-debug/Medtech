"""Shared queries and payload helpers for health records and pregnancy profiles."""
import json

from utils.db import execute, query_all, query_one

# Measured parameters, in the order they are reported to the user
MEASUREMENT_FIELDS = ['systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 'hemoglobin']

HEALTH_RECORD_FIELDS = MEASUREMENT_FIELDS + ['risk_level', 'recorded_at']

REQUIRED_HEALTH_FIELDS = MEASUREMENT_FIELDS

# Applied when an optional parameter is omitted by the client
OPTIONAL_PARAM_DEFAULTS = {
    'heart_rate': 75,
    'protein_urine': 0.1,
    'age': 28,
    'gestational_week': 20
}

PREGNANCY_PROFILE_FIELDS = ['current_week', 'expected_due_date', 'last_menstrual_period']


def build_health_params(data):
    """Build the parameter dict handed to the ML model from a request payload."""
    params = {field: data[field] for field in REQUIRED_HEALTH_FIELDS}
    for field, default in OPTIONAL_PARAM_DEFAULTS.items():
        params[field] = data.get(field, default)
    return params


def insert_health_record(user_id, health_params, ai_results):
    return execute('''
        INSERT INTO health_records
        (user_id, systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin,
         heart_rate, protein_urine, age, gestational_week, risk_level,
         detected_conditions, condition_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id,
          health_params['systolic_bp'], health_params['diastolic_bp'],
          health_params['blood_sugar'], health_params['body_weight'],
          health_params['hemoglobin'], health_params['heart_rate'],
          health_params['protein_urine'], health_params['age'],
          health_params['gestational_week'], ai_results['risk_level'],
          json.dumps(ai_results['detected_conditions']),
          json.dumps(ai_results['condition_details'])))


def fetch_health_records(user_id, limit=None):
    """Most recent health records first, as dicts keyed by HEALTH_RECORD_FIELDS."""
    query = f'''
        SELECT {', '.join(HEALTH_RECORD_FIELDS)}
        FROM health_records
        WHERE user_id = ?
        ORDER BY recorded_at DESC
    '''
    params = (user_id,)

    if limit is not None:
        query += ' LIMIT ?'
        params += (limit,)

    return [dict(zip(HEALTH_RECORD_FIELDS, row)) for row in query_all(query, params)]


def fetch_active_pregnancy_profile(user_id):
    row = query_one(f'''
        SELECT {', '.join(PREGNANCY_PROFILE_FIELDS)}
        FROM pregnancy_profiles
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
    ''', (user_id,))

    return dict(zip(PREGNANCY_PROFILE_FIELDS, row)) if row else None
