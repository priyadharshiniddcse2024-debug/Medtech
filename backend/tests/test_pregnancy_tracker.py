from datetime import datetime, timedelta

import pytest

from utils.pregnancy_tracker import PregnancyTracker


@pytest.fixture
def tracker():
    return PregnancyTracker()


def _date_days_ago(days):
    return (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')


class TestCalculateGestationalWeek:
    def test_recent_lmp_is_week_zero(self, tracker):
        assert tracker.calculate_gestational_week(_date_days_ago(3)) == 0

    def test_typical_week_calculation(self, tracker):
        # 70 days -> exactly 10 weeks
        assert tracker.calculate_gestational_week(_date_days_ago(70)) == 10

    def test_floor_division_drops_partial_week(self, tracker):
        # 69 days -> 9 full weeks
        assert tracker.calculate_gestational_week(_date_days_ago(69)) == 9

    def test_capped_at_42_weeks(self, tracker):
        # Way past due date should cap at 42
        assert tracker.calculate_gestational_week(_date_days_ago(400)) == 42

    def test_future_lmp_floored_at_zero(self, tracker):
        future = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
        assert tracker.calculate_gestational_week(future) == 0

    def test_invalid_date_format_raises(self, tracker):
        with pytest.raises(ValueError):
            tracker.calculate_gestational_week('28-07-2026')


class TestCreateProfile:
    def test_due_date_is_280_days_after_lmp(self, tracker):
        lmp = '2024-01-01'
        profile = tracker.create_profile(lmp)
        expected_due = datetime.strptime(lmp, '%Y-%m-%d') + timedelta(days=280)
        assert profile['expected_due_date'] == expected_due.strftime('%Y-%m-%d')

    def test_profile_contains_expected_keys(self, tracker):
        profile = tracker.create_profile(_date_days_ago(70))
        assert set(profile.keys()) == {'expected_due_date', 'current_week', 'days_pregnant'}

    def test_current_week_matches_calculator(self, tracker):
        lmp = _date_days_ago(84)  # 12 weeks
        profile = tracker.create_profile(lmp)
        assert profile['current_week'] == 12
        assert profile['days_pregnant'] == 84


class TestGetWeeklyGuidance:
    def test_known_week_returns_specific_guidance(self, tracker):
        guidance = tracker.get_weekly_guidance(8)
        assert guidance['title'] == "Week 8 - Organ Development"
        assert 'fetal_development' in guidance

    def test_undefined_week_returns_default_guidance(self, tracker):
        guidance = tracker.get_weekly_guidance(15)
        assert guidance['title'] == "Week 15 - Second Trimester"
        assert 'error' not in guidance

    @pytest.mark.parametrize("week", [0, -1, 43, 100])
    def test_out_of_range_week_returns_error(self, tracker, week):
        assert tracker.get_weekly_guidance(week) == {"error": "Invalid week number"}

    def test_boundary_weeks_are_valid(self, tracker):
        assert 'error' not in tracker.get_weekly_guidance(1)
        assert 'error' not in tracker.get_weekly_guidance(42)


class TestDefaultGuidance:
    def test_first_trimester_label(self, tracker):
        guidance = tracker._get_default_guidance(10)
        assert "First Trimester" in guidance['title']

    def test_second_trimester_label(self, tracker):
        guidance = tracker._get_default_guidance(22)
        assert "Second Trimester" in guidance['title']

    def test_third_trimester_label(self, tracker):
        guidance = tracker._get_default_guidance(35)
        assert "Third Trimester" in guidance['title']

    def test_default_guidance_has_all_fields(self, tracker):
        guidance = tracker._get_default_guidance(22)
        for field in ('title', 'fetal_development', 'maternal_changes', 'nutrition',
                      'exercise', 'warning_signs', 'checkups', 'tips'):
            assert field in guidance


class TestTrimesterInfo:
    def test_first_trimester_boundaries(self, tracker):
        assert tracker.get_trimester_info(1)['trimester'] == 1
        assert tracker.get_trimester_info(12)['trimester'] == 1

    def test_second_trimester_boundaries(self, tracker):
        assert tracker.get_trimester_info(13)['trimester'] == 2
        assert tracker.get_trimester_info(28)['trimester'] == 2

    def test_third_trimester_boundaries(self, tracker):
        assert tracker.get_trimester_info(29)['trimester'] == 3
        assert tracker.get_trimester_info(40)['trimester'] == 3

    def test_trimester_info_structure(self, tracker):
        info = tracker.get_trimester_info(20)
        assert set(info.keys()) == {'trimester', 'name', 'description', 'key_focus'}
        assert isinstance(info['key_focus'], list)
