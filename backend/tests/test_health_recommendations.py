import pytest

from utils.health_recommendations import HealthRecommendations


@pytest.fixture
def recs():
    return HealthRecommendations()


NORMAL_PARAMS = {
    'systolic_bp': 115,
    'diastolic_bp': 75,
    'blood_sugar': 90,
    'body_weight': 65,
    'hemoglobin': 12.5,
}


class TestPriorityLevel:
    @pytest.mark.parametrize("risk,expected", [
        ("Normal", "low"),
        ("Medium", "medium"),
        ("High", "high"),
    ])
    def test_known_risk_levels(self, recs, risk, expected):
        assert recs._get_priority_level(risk) == expected

    def test_unknown_risk_defaults_to_medium(self, recs):
        assert recs._get_priority_level("Unknown") == "medium"


class TestParameterSpecificRecommendations:
    def test_normal_params_yield_no_specific_recs(self, recs):
        result = recs._get_parameter_specific_recommendations(NORMAL_PARAMS)
        assert result == {"dietary": [], "lifestyle": []}

    def test_missing_hemoglobin_defaults_to_zero_and_triggers_anemia(self, recs):
        # Params default to 0 when absent; hemoglobin=0 < 11 triggers iron recs.
        result = recs._get_parameter_specific_recommendations({})
        assert any("iron" in r.lower() for r in result['dietary'])

    def test_high_systolic_bp_triggers_bp_recs(self, recs):
        result = recs._get_parameter_specific_recommendations({'systolic_bp': 145})
        assert any("sodium" in r.lower() for r in result['dietary'])
        assert any("blood pressure" in r.lower() for r in result['lifestyle'])

    def test_high_diastolic_bp_triggers_bp_recs(self, recs):
        result = recs._get_parameter_specific_recommendations({'diastolic_bp': 95})
        assert result['dietary'] and result['lifestyle']

    def test_bp_threshold_is_exclusive(self, recs):
        # 140/90 exactly should NOT trigger (uses strict >); other params kept normal.
        params = dict(NORMAL_PARAMS, systolic_bp=140, diastolic_bp=90)
        result = recs._get_parameter_specific_recommendations(params)
        assert result == {"dietary": [], "lifestyle": []}

    def test_high_blood_sugar_triggers_recs(self, recs):
        result = recs._get_parameter_specific_recommendations({'blood_sugar': 130})
        assert any("carbohydrate" in r.lower() for r in result['dietary'])

    def test_low_hemoglobin_triggers_iron_recs(self, recs):
        result = recs._get_parameter_specific_recommendations({'hemoglobin': 10})
        assert any("iron" in r.lower() for r in result['dietary'])

    def test_high_weight_triggers_recs(self, recs):
        result = recs._get_parameter_specific_recommendations({'body_weight': 90})
        assert result['dietary'] and result['lifestyle']

    def test_multiple_conditions_accumulate(self, recs):
        params = {'systolic_bp': 150, 'blood_sugar': 130, 'hemoglobin': 9, 'body_weight': 90}
        result = recs._get_parameter_specific_recommendations(params)
        # Each of the 4 conditions adds dietary recs
        assert len(result['dietary']) >= 8
        assert len(result['lifestyle']) >= 8


class TestGetRecommendations:
    @pytest.mark.parametrize("risk", ["Normal", "Medium", "High"])
    def test_returns_full_structure(self, recs, risk):
        result = recs.get_recommendations(risk, NORMAL_PARAMS)
        expected_keys = {
            "risk_level", "priority", "general_advice", "dietary_recommendations",
            "lifestyle_changes", "medical_actions", "warning_signs",
            "next_checkup", "emergency_contact",
        }
        assert expected_keys == set(result.keys())
        assert result['risk_level'] == risk

    def test_priority_matches_risk_level(self, recs):
        assert recs.get_recommendations("High", NORMAL_PARAMS)['priority'] == "high"

    def test_specific_recs_appended_to_base(self, recs):
        base = recs.recommendations_db["Normal"]["dietary_recommendations"]
        result = recs.get_recommendations("Normal", {'blood_sugar': 130})
        assert len(result['dietary_recommendations']) > len(base)

    def test_invalid_risk_level_raises_keyerror(self, recs):
        with pytest.raises(KeyError):
            recs.get_recommendations("Critical", NORMAL_PARAMS)

    def test_emergency_contact_message_present(self, recs):
        result = recs.get_recommendations("Normal", NORMAL_PARAMS)
        assert "healthcare provider" in result['emergency_contact'].lower()


class TestEmergencyGuidelines:
    def test_structure(self, recs):
        guidelines = recs.get_emergency_guidelines()
        assert set(guidelines.keys()) == {
            "when_to_call_immediately", "emergency_numbers", "what_to_tell_medical_staff"
        }

    def test_emergency_numbers_keys(self, recs):
        numbers = recs.get_emergency_guidelines()['emergency_numbers']
        assert set(numbers.keys()) == {"your_doctor", "hospital", "emergency"}

    def test_call_immediately_is_nonempty_list(self, recs):
        guidelines = recs.get_emergency_guidelines()
        assert isinstance(guidelines['when_to_call_immediately'], list)
        assert len(guidelines['when_to_call_immediately']) > 0
