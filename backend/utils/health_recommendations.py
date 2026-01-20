class HealthRecommendations:
    def __init__(self):
        self.recommendations_db = self._load_recommendations()
    
    def get_recommendations(self, risk_level, health_params):
        """Generate personalized recommendations based on risk level and health parameters"""
        base_recommendations = self.recommendations_db[risk_level]
        
        # Add parameter-specific recommendations
        specific_recommendations = self._get_parameter_specific_recommendations(health_params)
        
        return {
            "risk_level": risk_level,
            "priority": self._get_priority_level(risk_level),
            "general_advice": base_recommendations["general_advice"],
            "dietary_recommendations": base_recommendations["dietary_recommendations"] + specific_recommendations["dietary"],
            "lifestyle_changes": base_recommendations["lifestyle_changes"] + specific_recommendations["lifestyle"],
            "medical_actions": base_recommendations["medical_actions"],
            "warning_signs": base_recommendations["warning_signs"],
            "next_checkup": base_recommendations["next_checkup"],
            "emergency_contact": "Contact your healthcare provider immediately if you experience severe symptoms"
        }
    
    def _get_priority_level(self, risk_level):
        """Get priority level for UI display"""
        priority_map = {
            "Normal": "low",
            "Medium": "medium", 
            "High": "high"
        }
        return priority_map.get(risk_level, "medium")
    
    def _get_parameter_specific_recommendations(self, health_params):
        """Generate specific recommendations based on individual health parameters"""
        dietary = []
        lifestyle = []
        
        # Blood pressure specific recommendations
        systolic = health_params.get('systolic_bp', 0)
        diastolic = health_params.get('diastolic_bp', 0)
        
        if systolic > 140 or diastolic > 90:
            dietary.extend([
                "Reduce sodium intake to less than 2300mg daily",
                "Increase potassium-rich foods (bananas, spinach, avocados)"
            ])
            lifestyle.extend([
                "Practice stress reduction techniques (meditation, deep breathing)",
                "Monitor blood pressure daily at the same time"
            ])
        
        # Blood sugar specific recommendations
        blood_sugar = health_params.get('blood_sugar', 0)
        if blood_sugar > 125:
            dietary.extend([
                "Choose complex carbohydrates over simple sugars",
                "Eat smaller, more frequent meals to stabilize blood sugar",
                "Include protein with each meal"
            ])
            lifestyle.extend([
                "Take short walks after meals",
                "Monitor blood glucose as recommended by your doctor"
            ])
        
        # Hemoglobin specific recommendations
        hemoglobin = health_params.get('hemoglobin', 0)
        if hemoglobin < 11:
            dietary.extend([
                "Increase iron-rich foods (lean meats, beans, spinach)",
                "Combine iron-rich foods with vitamin C sources",
                "Consider iron supplements as prescribed"
            ])
            lifestyle.extend([
                "Avoid tea and coffee with iron-rich meals",
                "Get adequate rest to support blood production"
            ])
        
        # Weight management recommendations
        body_weight = health_params.get('body_weight', 0)
        if body_weight > 80:  # Simplified threshold
            dietary.extend([
                "Focus on nutrient-dense, lower-calorie foods",
                "Control portion sizes while meeting nutritional needs"
            ])
            lifestyle.extend([
                "Engage in regular, safe physical activity",
                "Track weight gain according to pregnancy guidelines"
            ])
        
        return {
            "dietary": dietary,
            "lifestyle": lifestyle
        }
    
    def _load_recommendations(self):
        """Load comprehensive recommendations database"""
        return {
            "Normal": {
                "general_advice": [
                    "Congratulations! Your health parameters are within normal ranges.",
                    "Continue your current healthy lifestyle to maintain optimal pregnancy health.",
                    "Regular prenatal checkups will help monitor your continued well-being."
                ],
                "dietary_recommendations": [
                    "Maintain a balanced diet with plenty of fruits and vegetables",
                    "Continue taking prenatal vitamins as prescribed",
                    "Stay hydrated with 8-10 glasses of water daily",
                    "Include calcium-rich foods for baby's bone development",
                    "Consume adequate protein for fetal growth"
                ],
                "lifestyle_changes": [
                    "Continue regular, moderate exercise as approved by your doctor",
                    "Get 7-9 hours of quality sleep each night",
                    "Practice stress management techniques",
                    "Avoid alcohol, smoking, and recreational drugs",
                    "Limit caffeine intake to less than 200mg daily"
                ],
                "medical_actions": [
                    "Continue regular prenatal appointments",
                    "Keep up with recommended prenatal screenings",
                    "Discuss any concerns with your healthcare provider"
                ],
                "warning_signs": [
                    "Severe headaches or vision changes",
                    "Persistent nausea and vomiting",
                    "Unusual vaginal bleeding or discharge",
                    "Severe abdominal pain",
                    "Decreased fetal movement (after 20 weeks)"
                ],
                "next_checkup": "Continue with your regular prenatal visit schedule"
            },
            
            "Medium": {
                "general_advice": [
                    "Your health parameters indicate medium risk that requires attention.",
                    "With proper management and monitoring, you can have a healthy pregnancy.",
                    "Follow the recommendations below and maintain close contact with your healthcare team."
                ],
                "dietary_recommendations": [
                    "Follow a structured meal plan to manage health parameters",
                    "Increase intake of foods rich in specific nutrients based on your needs",
                    "Consider working with a registered dietitian",
                    "Monitor portion sizes and meal timing",
                    "Limit processed foods and added sugars"
                ],
                "lifestyle_changes": [
                    "Increase monitoring of your health parameters at home",
                    "Engage in approved physical activity to improve health markers",
                    "Prioritize stress reduction and adequate sleep",
                    "Consider prenatal yoga or meditation classes",
                    "Maintain a health diary to track symptoms and improvements"
                ],
                "medical_actions": [
                    "Schedule more frequent prenatal visits",
                    "Discuss additional monitoring or testing with your doctor",
                    "Consider consultation with maternal-fetal medicine specialist",
                    "Follow prescribed medication regimens carefully",
                    "Monitor specific health parameters as directed"
                ],
                "warning_signs": [
                    "Worsening of current symptoms",
                    "New onset of severe headaches",
                    "Rapid weight gain or severe swelling",
                    "Chest pain or difficulty breathing",
                    "Any signs that concern you - trust your instincts"
                ],
                "next_checkup": "Schedule follow-up within 1-2 weeks or as directed by your healthcare provider"
            },
            
            "High": {
                "general_advice": [
                    "Your health parameters indicate high risk requiring immediate medical attention.",
                    "Please contact your healthcare provider as soon as possible.",
                    "High-risk pregnancies can still result in healthy outcomes with proper medical care."
                ],
                "dietary_recommendations": [
                    "Follow a medically supervised nutrition plan",
                    "Work closely with a registered dietitian specializing in high-risk pregnancies",
                    "Strictly monitor and control specific dietary factors",
                    "Consider therapeutic dietary modifications",
                    "Track all food intake and symptoms"
                ],
                "lifestyle_changes": [
                    "Implement daily monitoring of vital health parameters",
                    "Follow a modified activity plan as prescribed by your doctor",
                    "Prioritize complete rest and stress reduction",
                    "Consider bed rest if recommended by healthcare provider",
                    "Arrange for additional support at home"
                ],
                "medical_actions": [
                    "Contact your healthcare provider immediately",
                    "Schedule urgent prenatal appointment",
                    "Consider hospitalization for monitoring if recommended",
                    "Follow all prescribed medications and treatments strictly",
                    "Prepare for possible early delivery planning"
                ],
                "warning_signs": [
                    "Severe headaches with vision changes",
                    "Upper abdominal pain",
                    "Difficulty breathing or chest pain",
                    "Severe swelling of face, hands, or feet",
                    "Decreased or absent fetal movement",
                    "Vaginal bleeding",
                    "Severe nausea and vomiting"
                ],
                "next_checkup": "URGENT: Contact your healthcare provider today or go to the emergency room if experiencing severe symptoms"
            }
        }
    
    def get_emergency_guidelines(self):
        """Get emergency contact guidelines"""
        return {
            "when_to_call_immediately": [
                "Severe headache with vision changes or upper abdominal pain",
                "Heavy vaginal bleeding",
                "Severe abdominal or pelvic pain",
                "Difficulty breathing or chest pain",
                "Signs of preterm labor (regular contractions before 37 weeks)",
                "Sudden decrease or absence of fetal movement",
                "Severe nausea and vomiting preventing food/fluid intake",
                "High fever (over 101°F/38.3°C)",
                "Severe swelling of face, hands, or feet with headache"
            ],
            "emergency_numbers": {
                "your_doctor": "Contact your healthcare provider's emergency line",
                "hospital": "Go to your designated delivery hospital",
                "emergency": "Call emergency services (911) for life-threatening situations"
            },
            "what_to_tell_medical_staff": [
                "Your current gestational week",
                "Your specific symptoms and when they started",
                "Your current medications and medical conditions",
                "Your recent health parameter readings",
                "Any recent changes in your condition"
            ]
        }