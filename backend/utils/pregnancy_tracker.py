from datetime import datetime, timedelta
import json

class PregnancyTracker:
    def __init__(self):
        self.weekly_guidance = self._load_weekly_guidance()
    
    def create_profile(self, last_menstrual_period):
        """Create pregnancy profile with calculated dates and current week"""
        lmp_date = datetime.strptime(last_menstrual_period, '%Y-%m-%d')
        
        # Calculate expected due date (280 days from LMP)
        expected_due_date = lmp_date + timedelta(days=280)
        
        # Calculate current gestational week
        current_week = self.calculate_gestational_week(last_menstrual_period)
        
        return {
            'expected_due_date': expected_due_date.strftime('%Y-%m-%d'),
            'current_week': current_week,
            'days_pregnant': (datetime.now() - lmp_date).days
        }
    
    def calculate_gestational_week(self, last_menstrual_period):
        """Calculate current gestational week"""
        lmp_date = datetime.strptime(last_menstrual_period, '%Y-%m-%d')
        days_pregnant = (datetime.now() - lmp_date).days
        weeks = days_pregnant // 7
        return max(0, min(42, weeks))  # Cap between 0-42 weeks
    
    def get_weekly_guidance(self, week):
        """Get guidance for specific pregnancy week"""
        if week < 1 or week > 42:
            return {"error": "Invalid week number"}
        
        return self.weekly_guidance.get(str(week), self._get_default_guidance(week))
    
    def _load_weekly_guidance(self):
        """Load comprehensive weekly pregnancy guidance"""
        return {
            "1": {
                "title": "Week 1 - Conception",
                "fetal_development": "Fertilization occurs. The embryo is microscopic.",
                "maternal_changes": "You may not know you're pregnant yet. No noticeable symptoms.",
                "nutrition": "Start taking folic acid (400mcg daily). Eat a balanced diet rich in fruits and vegetables.",
                "exercise": "Continue regular exercise routine. Avoid extreme activities.",
                "warning_signs": "None specific to this week.",
                "checkups": "Schedule preconception counseling if planning pregnancy.",
                "tips": "Avoid alcohol, smoking, and unnecessary medications."
            },
            "4": {
                "title": "Week 4 - Implantation",
                "fetal_development": "Embryo implants in uterine wall. Neural tube begins forming.",
                "maternal_changes": "Missed period. Early pregnancy symptoms may begin.",
                "nutrition": "Continue folic acid. Increase protein intake. Stay hydrated.",
                "exercise": "Light to moderate exercise is safe. Listen to your body.",
                "warning_signs": "Heavy bleeding, severe cramping.",
                "checkups": "Take home pregnancy test. Schedule first prenatal appointment.",
                "tips": "Start prenatal vitamins. Avoid raw foods and high-mercury fish."
            },
            "8": {
                "title": "Week 8 - Organ Development",
                "fetal_development": "Major organs forming. Heart beats regularly. Size of a raspberry.",
                "maternal_changes": "Morning sickness, breast tenderness, fatigue common.",
                "nutrition": "Small, frequent meals. Ginger for nausea. Avoid caffeine excess.",
                "exercise": "Walking, swimming, prenatal yoga are excellent choices.",
                "warning_signs": "Severe nausea/vomiting, bleeding, severe abdominal pain.",
                "checkups": "First prenatal visit. Blood tests, urine tests, medical history.",
                "tips": "Rest when tired. Wear supportive bras. Stay positive."
            },
            "12": {
                "title": "Week 12 - End of First Trimester",
                "fetal_development": "All major organs formed. Size of a plum. Movement begins.",
                "maternal_changes": "Morning sickness may improve. Energy levels increase.",
                "nutrition": "Balanced diet with extra calcium and iron. Prenatal vitamins.",
                "exercise": "Regular moderate exercise. Avoid contact sports.",
                "warning_signs": "Persistent vomiting, fever, unusual discharge.",
                "checkups": "Nuchal translucency screening. Discuss genetic testing options.",
                "tips": "Many feel comfortable sharing pregnancy news now."
            },
            "16": {
                "title": "Week 16 - Second Trimester Begins",
                "fetal_development": "Sex organs visible on ultrasound. Size of an avocado.",
                "maternal_changes": "Increased appetite. Skin changes. Growing belly.",
                "nutrition": "Increase caloric intake by 300 calories. Focus on quality nutrition.",
                "exercise": "Prenatal classes. Avoid lying flat on back during exercise.",
                "warning_signs": "Severe headaches, vision changes, rapid weight gain.",
                "checkups": "Routine prenatal visit. Blood pressure and weight monitoring.",
                "tips": "Start thinking about maternity clothes. Enjoy increased energy."
            },
            "20": {
                "title": "Week 20 - Halfway Point",
                "fetal_development": "Anatomy scan week. All organs can be seen. Size of a banana.",
                "maternal_changes": "May feel first movements (quickening). Visible pregnancy.",
                "nutrition": "Iron-rich foods important. Continue balanced nutrition.",
                "exercise": "Swimming excellent. Modify exercises as belly grows.",
                "warning_signs": "No fetal movement after feeling it, severe back pain.",
                "checkups": "Detailed ultrasound (anatomy scan). Check for abnormalities.",
                "tips": "Great time for babymoon. Start planning nursery."
            },
            "24": {
                "title": "Week 24 - Viability Milestone",
                "fetal_development": "Lungs developing. Baby can hear sounds. Size of corn cob.",
                "maternal_changes": "Glucose screening. Possible heartburn and back pain.",
                "nutrition": "Watch sugar intake. Small, frequent meals for heartburn.",
                "exercise": "Prenatal yoga. Avoid exercises lying on back.",
                "warning_signs": "Signs of preterm labor, severe swelling, vision problems.",
                "checkups": "Glucose tolerance test. Blood pressure monitoring.",
                "tips": "Start childbirth education classes. Plan maternity leave."
            },
            "28": {
                "title": "Week 28 - Third Trimester Begins",
                "fetal_development": "Brain development accelerates. Eyes can open. Size of eggplant.",
                "maternal_changes": "Shortness of breath. Frequent urination returns.",
                "nutrition": "Increase protein. Watch sodium for swelling control.",
                "exercise": "Walking, swimming. Pelvic floor exercises important.",
                "warning_signs": "Decreased fetal movement, severe headaches, chest pain.",
                "checkups": "RhoGAM shot if Rh-negative. More frequent visits begin.",
                "tips": "Start thinking about birth plan. Prepare for baby's arrival."
            },
            "32": {
                "title": "Week 32 - Rapid Growth",
                "fetal_development": "Rapid weight gain. Bones hardening. Size of squash.",
                "maternal_changes": "Braxton Hicks contractions. Sleep difficulties.",
                "nutrition": "Calcium important for bone development. Stay hydrated.",
                "exercise": "Gentle stretching. Prenatal massage beneficial.",
                "warning_signs": "Regular contractions, fluid leakage, severe swelling.",
                "checkups": "Biweekly visits. Monitor baby's position and growth.",
                "tips": "Pack hospital bag. Finalize birth plan and pediatrician choice."
            },
            "36": {
                "title": "Week 36 - Full Term Approaching",
                "fetal_development": "Lungs nearly mature. Baby gaining weight. Size of papaya.",
                "maternal_changes": "Baby may 'drop'. Increased pelvic pressure.",
                "nutrition": "Continue balanced diet. Stay hydrated for breastfeeding prep.",
                "exercise": "Walking helps with positioning. Gentle stretching.",
                "warning_signs": "Regular contractions, water breaking, bleeding.",
                "checkups": "Weekly visits. Group B strep test. Cervical checks.",
                "tips": "Install car seat. Have hospital bag ready. Rest when possible."
            },
            "40": {
                "title": "Week 40 - Due Date",
                "fetal_development": "Baby is full term and ready for birth. Size of watermelon.",
                "maternal_changes": "Signs of labor may begin. Excitement and anxiety normal.",
                "nutrition": "Light, easily digestible foods. Stay hydrated.",
                "exercise": "Walking may help encourage labor. Rest is important.",
                "warning_signs": "Decreased fetal movement, severe headaches, vision changes.",
                "checkups": "Discuss induction options if overdue. Monitor baby's well-being.",
                "tips": "Trust your body. Labor signs: contractions, water breaking, bloody show."
            }
        }
    
    def _get_default_guidance(self, week):
        """Provide default guidance for weeks not specifically defined"""
        if week <= 12:
            trimester = "First Trimester"
            focus = "Organ development and early pregnancy symptoms"
        elif week <= 28:
            trimester = "Second Trimester"
            focus = "Rapid growth and increased energy"
        else:
            trimester = "Third Trimester"
            focus = "Final preparations and birth readiness"
        
        return {
            "title": f"Week {week} - {trimester}",
            "fetal_development": f"Continued development appropriate for {trimester.lower()}.",
            "maternal_changes": f"Changes typical of {trimester.lower()}.",
            "nutrition": "Maintain balanced diet with prenatal vitamins.",
            "exercise": "Continue safe, moderate exercise as comfortable.",
            "warning_signs": "Contact healthcare provider for any concerning symptoms.",
            "checkups": "Follow regular prenatal visit schedule.",
            "tips": f"Focus on {focus.lower()}. Stay positive and healthy."
        }
    
    def get_trimester_info(self, week):
        """Get trimester information based on week"""
        if week <= 12:
            return {
                "trimester": 1,
                "name": "First Trimester",
                "description": "Critical organ development period",
                "key_focus": ["Folic acid", "Avoiding harmful substances", "Managing early symptoms"]
            }
        elif week <= 28:
            return {
                "trimester": 2,
                "name": "Second Trimester",
                "description": "Often called the 'golden period' of pregnancy",
                "key_focus": ["Balanced nutrition", "Regular exercise", "Prenatal screening"]
            }
        else:
            return {
                "trimester": 3,
                "name": "Third Trimester",
                "description": "Final preparations for birth",
                "key_focus": ["Birth preparation", "Monitoring baby's movements", "Hospital planning"]
            }