import numpy as np
import pytest

from ml_model.risk_predictor import RiskPredictor


@pytest.fixture(scope="module")
def predictor():
    return RiskPredictor()


NORMAL = {
    'systolic_bp': 115, 'diastolic_bp': 75, 'blood_sugar': 88,
    'body_weight': 65, 'hemoglobin': 12.2,
}


class TestConfiguration:
    def test_feature_names(self, predictor):
        assert predictor.feature_names == [
            'systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 'hemoglobin'
        ]

    def test_risk_levels(self, predictor):
        assert predictor.risk_levels == ['Normal', 'Medium', 'High']

    def test_model_loaded(self, predictor):
        assert predictor.model is not None


class TestGenerateTrainingData:
    def test_shape_and_labels(self, predictor):
        X, y = predictor._generate_training_data()
        assert X.shape == (1500, 5)
        assert y.shape == (1500,)
        assert set(np.unique(y)).issubset({0, 1, 2})

    def test_feature_bounds_enforced(self, predictor):
        X, _ = predictor._generate_training_data()
        systolic, diastolic, sugar, weight, hb = (X[:, i] for i in range(5))
        # Bounds include small added noise, so use generous margins.
        assert systolic.min() >= 80 and systolic.max() <= 205
        assert hb.min() >= 5 and hb.max() <= 19


class TestPredictRisk:
    def test_returns_valid_level(self, predictor):
        assert predictor.predict_risk(NORMAL) in predictor.risk_levels

    def test_normal_params_predict_normal(self, predictor):
        assert predictor.predict_risk(NORMAL) == 'Normal'

    def test_severe_multi_critical_forces_high(self, predictor):
        # systolic>=160 (+2) and blood_sugar>=140 (+2) => >=3 critical => High
        params = {'systolic_bp': 170, 'diastolic_bp': 105, 'blood_sugar': 150,
                  'body_weight': 85, 'hemoglobin': 8.5}
        assert predictor.predict_risk(params) == 'High'

    def test_two_critical_conditions_at_least_medium(self, predictor):
        # systolic 145 (+1) and blood_sugar 130 (+1) => 2 critical => >= Medium
        params = {'systolic_bp': 145, 'diastolic_bp': 85, 'blood_sugar': 130,
                  'body_weight': 70, 'hemoglobin': 12.0}
        assert predictor.predict_risk(params) in ('Medium', 'High')

    def test_missing_key_raises(self, predictor):
        with pytest.raises(KeyError):
            predictor.predict_risk({'systolic_bp': 120})

    def test_raises_when_model_missing(self, predictor):
        saved = predictor.model
        predictor.model = None
        try:
            with pytest.raises(ValueError):
                predictor.predict_risk(NORMAL)
        finally:
            predictor.model = saved


class TestRiskProbability:
    def test_probabilities_structure_and_sum(self, predictor):
        probs = predictor.get_risk_probability(NORMAL)
        assert set(probs.keys()) == set(predictor.risk_levels)
        assert all(0.0 <= v <= 1.0 for v in probs.values())
        assert pytest.approx(sum(probs.values()), abs=1e-6) == 1.0

    def test_raises_when_model_missing(self, predictor):
        saved = predictor.model
        predictor.model = None
        try:
            with pytest.raises(ValueError):
                predictor.get_risk_probability(NORMAL)
        finally:
            predictor.model = saved


class TestFeatureImportance:
    def test_importance_keys_and_normalization(self, predictor):
        importance = predictor.get_feature_importance()
        assert set(importance.keys()) == set(predictor.feature_names)
        assert all(v >= 0 for v in importance.values())
        assert pytest.approx(sum(importance.values()), abs=1e-6) == 1.0

    def test_raises_when_model_missing(self, predictor):
        saved = predictor.model
        predictor.model = None
        try:
            with pytest.raises(ValueError):
                predictor.get_feature_importance()
        finally:
            predictor.model = saved
