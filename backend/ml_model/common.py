"""Shared constants and helpers for the risk prediction models."""
import numpy as np

RISK_LEVELS = ['Normal', 'Medium', 'High']

# Physiologically plausible (min, max) bounds per parameter
PARAM_BOUNDS = {
    'age': (16, 45),
    'systolic_bp': (80, 200),
    'diastolic_bp': (50, 120),
    'blood_sugar': (60, 300),
    'body_weight': (40, 150),
    'hemoglobin': (6, 18),
    'heart_rate': (50, 150),
    'protein_urine': (0, 5)
}

# Standard deviation of the noise added to synthetic training samples
PARAM_NOISE = {
    'systolic_bp': 2,
    'diastolic_bp': 1.5,
    'blood_sugar': 3,
    'body_weight': 1,
    'hemoglobin': 0.2,
    'heart_rate': 3,
    'protein_urine': 0.1,
    'age': 0.5,
    'gestational_week': 0.5
}


def clamp(param, value, bounds=PARAM_BOUNDS):
    """Clamp a generated parameter to its plausible range, if one is defined."""
    if param not in bounds:
        return value

    low, high = bounds[param]
    return max(low, min(high, value))


def with_noise(param, value):
    """Add realistic jitter to a generated parameter."""
    return value + np.random.normal(0, PARAM_NOISE[param])


def build_training_sample(values, feature_names, bounds=PARAM_BOUNDS):
    """Clamp generated parameters to realistic bounds and add measurement noise."""
    return [with_noise(name, clamp(name, values[name], bounds)) for name in feature_names]


def extract_features(health_params, feature_names, defaults=None):
    """Read features from a parameter dict in the model's expected order."""
    if defaults is None:
        return [health_params[name] for name in feature_names]
    return [health_params.get(name, defaults[name]) for name in feature_names]


def importance_by_feature(model, feature_names):
    return {
        feature: float(importance)
        for feature, importance in zip(feature_names, model.feature_importances_)
    }
