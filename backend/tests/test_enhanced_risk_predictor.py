import numpy as np
import pytest

from ml_model.enhanced_risk_predictor import EnhancedRiskPredictor


@pytest.fixture(scope="module")
def predictor():
    return EnhancedRiskPredictor()


class TestConfiguration:
    def test_feature_names(self, predictor):
        assert predictor.feature_names == [
            'systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight',
            'hemoglobin', 'heart_rate', 'protein_urine', 'age', 'gestational_week'
        ]

    def test_conditions_and_levels(self, predictor):
        assert predictor.risk_levels == ['Normal', 'Medium', 'High']
        assert len(predictor.conditions) == 7
        assert 'preeclampsia' in predictor.conditions

    def test_models_loaded(self, predictor):
        assert predictor.risk_model is not None
        assert predictor.condition_model is not None


class TestGenerateTrainingData:
    def test_shapes(self, predictor):
        X, y_risk, y_cond = predictor._generate_training_data()
        assert X.shape == (2000, 9)
        assert y_risk.shape == (2000,)
        assert y_cond.shape == (2000, 7)
        assert set(np.unique(y_risk)).issubset({0, 1, 2})
        assert set(np.unique(y_cond)).issubset({0, 1})


class TestConditionSeverity:
    @pytest.mark.parametrize("prob,expected", [
        (0.1, 'Low'),
        (0.29, 'Low'),
        (0.3, 'Moderate'),
        (0.5, 'Moderate'),
        (0.69, 'Moderate'),
        (0.7, 'High'),
        (0.95, 'High'),
    ])
    def test_severity_thresholds(self, predictor, prob, expected):
        assert predictor._get_condition_severity('anemia', prob, []) == expected


class TestConditionRecommendations:
    def test_empty_conditions_returns_default(self, predictor):
        recs = predictor._get_condition_recommendations([], [])
        assert "Continue regular prenatal care" in recs
        assert len(recs) == 4

    def test_gestational_diabetes_recommendations(self, predictor):
        recs = predictor._get_condition_recommendations(
            [{'name': 'gestational_diabetes', 'severity': 'High'}], [])
        assert any("glucose" in r.lower() for r in recs)

    def test_preeclampsia_recommendations(self, predictor):
        recs = predictor._get_condition_recommendations(
            [{'name': 'preeclampsia', 'severity': 'High'}], [])
        assert any("blood pressure" in r.lower() for r in recs)

    def test_results_are_deduplicated(self, predictor):
        conditions = [
            {'name': 'anemia', 'severity': 'High'},
            {'name': 'anemia', 'severity': 'High'},
        ]
        recs = predictor._get_condition_recommendations(conditions, [])
        assert len(recs) == len(set(recs))

    def test_unknown_condition_falls_back_to_default(self, predictor):
        recs = predictor._get_condition_recommendations(
            [{'name': 'unknown_condition', 'severity': 'Low'}], [])
        assert "Continue regular prenatal care" in recs


class TestPredictComprehensive:
    def test_structure(self, predictor):
        result = predictor.predict_comprehensive({
            'systolic_bp': 150, 'diastolic_bp': 95, 'blood_sugar': 140,
            'body_weight': 80, 'hemoglobin': 9, 'heart_rate': 90,
            'protein_urine': 1.5, 'age': 30, 'gestational_week': 30,
        })
        assert set(result.keys()) == {
            'risk_level', 'risk_probabilities', 'detected_conditions',
            'condition_details', 'recommendations'
        }
        assert result['risk_level'] in predictor.risk_levels
        assert set(result['risk_probabilities'].keys()) == set(predictor.risk_levels)

    def test_condition_details_cover_all_conditions(self, predictor):
        result = predictor.predict_comprehensive({'systolic_bp': 120})
        assert set(result['condition_details'].keys()) == set(predictor.conditions)
        for detail in result['condition_details'].values():
            assert set(detail.keys()) == {'detected', 'probability', 'severity'}

    def test_uses_defaults_for_missing_params(self, predictor):
        # Should not raise even with an empty dict (defaults are applied).
        result = predictor.predict_comprehensive({})
        assert result['risk_level'] in predictor.risk_levels

    def test_risk_probabilities_sum_to_one(self, predictor):
        result = predictor.predict_comprehensive({'systolic_bp': 115})
        assert pytest.approx(sum(result['risk_probabilities'].values()), abs=1e-6) == 1.0

    def test_raises_when_models_missing(self, predictor):
        saved = predictor.risk_model
        predictor.risk_model = None
        try:
            with pytest.raises(ValueError):
                predictor.predict_comprehensive({})
        finally:
            predictor.risk_model = saved


class TestFeatureImportance:
    def test_importance(self, predictor):
        importance = predictor.get_feature_importance()
        assert set(importance.keys()) == set(predictor.feature_names)
        assert pytest.approx(sum(importance.values()), abs=1e-6) == 1.0

    def test_raises_when_model_missing(self, predictor):
        saved = predictor.risk_model
        predictor.risk_model = None
        try:
            with pytest.raises(ValueError):
                predictor.get_feature_importance()
        finally:
            predictor.risk_model = saved
