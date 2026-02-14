import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputClassifier
import joblib
import os

class EnhancedRiskPredictor:
    def __init__(self):
        self.risk_model = None
        self.condition_model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 
            'hemoglobin', 'heart_rate', 'protein_urine', 'age', 'gestational_week'
        ]
        self.risk_levels = ['Normal', 'Medium', 'High']
        self.conditions = [
            'gestational_diabetes', 'preeclampsia', 'anemia', 'hypertension',
            'preterm_labor_risk', 'fetal_growth_restriction', 'placental_issues'
        ]
        
        # Load or train model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train a new one with synthetic data"""
        risk_model_path = 'ml_model/enhanced_risk_model.joblib'
        condition_model_path = 'ml_model/condition_model.joblib'
        scaler_path = 'ml_model/enhanced_scaler.joblib'
        
        if (os.path.exists(risk_model_path) and 
            os.path.exists(condition_model_path) and 
            os.path.exists(scaler_path)):
            self.risk_model = joblib.load(risk_model_path)
            self.condition_model = joblib.load(condition_model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            self._train_model()
            self._save_model()
    
    def _generate_training_data(self):
        """Generate comprehensive training data for multiple conditions"""
        np.random.seed(42)
        n_samples = 2000
        
        data = []
        risk_labels = []
        condition_labels = []
        
        for _ in range(n_samples):
            # Generate base parameters
            age = np.random.normal(28, 6)  # Age 18-40
            gestational_week = np.random.uniform(8, 40)  # Pregnancy week
            
            # Generate correlated health parameters
            scenario = np.random.choice([
                'normal', 'gestational_diabetes', 'preeclampsia', 'anemia',
                'hypertension', 'preterm_risk', 'fetal_growth_issues', 'multiple_conditions'
            ], p=[0.4, 0.15, 0.12, 0.1, 0.08, 0.06, 0.05, 0.04])
            
            # Initialize condition flags
            conditions = [0] * len(self.conditions)  # All conditions start as 0 (no condition)
            
            if scenario == 'normal':
                systolic_bp = np.random.normal(115, 8)
                diastolic_bp = np.random.normal(75, 6)
                blood_sugar = np.random.normal(88, 10)
                body_weight = np.random.normal(65, 8)
                hemoglobin = np.random.normal(12.2, 0.8)
                heart_rate = np.random.normal(75, 10)
                protein_urine = np.random.normal(0.1, 0.05)  # Normal: <0.3
                risk = 0
                
            elif scenario == 'gestational_diabetes':
                systolic_bp = np.random.normal(125, 12)
                diastolic_bp = np.random.normal(82, 8)
                blood_sugar = np.random.normal(140, 20)  # High glucose
                body_weight = np.random.normal(75, 12)
                hemoglobin = np.random.normal(11.5, 1.0)
                heart_rate = np.random.normal(80, 12)
                protein_urine = np.random.normal(0.2, 0.1)
                conditions[0] = 1  # gestational_diabetes
                risk = 1 if blood_sugar < 160 else 2
                
            elif scenario == 'preeclampsia':
                systolic_bp = np.random.normal(150, 15)  # High BP
                diastolic_bp = np.random.normal(95, 10)  # High BP
                blood_sugar = np.random.normal(100, 15)
                body_weight = np.random.normal(78, 15)
                hemoglobin = np.random.normal(11.0, 1.2)
                heart_rate = np.random.normal(85, 15)
                protein_urine = np.random.normal(1.5, 0.8)  # High protein
                conditions[1] = 1  # preeclampsia
                conditions[3] = 1  # hypertension (often co-occurs)
                risk = 2
                
            elif scenario == 'anemia':
                systolic_bp = np.random.normal(110, 12)
                diastolic_bp = np.random.normal(70, 8)
                blood_sugar = np.random.normal(92, 12)
                body_weight = np.random.normal(62, 10)
                hemoglobin = np.random.normal(8.5, 1.0)  # Low hemoglobin
                heart_rate = np.random.normal(90, 15)  # Higher heart rate
                protein_urine = np.random.normal(0.15, 0.08)
                conditions[2] = 1  # anemia
                risk = 1 if hemoglobin > 9 else 2
                
            elif scenario == 'hypertension':
                systolic_bp = np.random.normal(145, 12)
                diastolic_bp = np.random.normal(92, 8)
                blood_sugar = np.random.normal(105, 18)
                body_weight = np.random.normal(72, 12)
                hemoglobin = np.random.normal(11.8, 1.0)
                heart_rate = np.random.normal(82, 12)
                protein_urine = np.random.normal(0.4, 0.2)
                conditions[3] = 1  # hypertension
                risk = 1 if systolic_bp < 160 else 2
                
            elif scenario == 'preterm_risk':
                systolic_bp = np.random.normal(130, 15)
                diastolic_bp = np.random.normal(85, 10)
                blood_sugar = np.random.normal(110, 20)
                body_weight = np.random.normal(68, 12)
                hemoglobin = np.random.normal(10.8, 1.2)
                heart_rate = np.random.normal(88, 15)
                protein_urine = np.random.normal(0.6, 0.3)
                conditions[4] = 1  # preterm_labor_risk
                risk = 2
                
            elif scenario == 'fetal_growth_issues':
                systolic_bp = np.random.normal(135, 12)
                diastolic_bp = np.random.normal(88, 10)
                blood_sugar = np.random.normal(95, 15)
                body_weight = np.random.normal(58, 8)  # Lower weight
                hemoglobin = np.random.normal(10.2, 1.0)
                heart_rate = np.random.normal(85, 12)
                protein_urine = np.random.normal(0.8, 0.4)
                conditions[5] = 1  # fetal_growth_restriction
                risk = 2
                
            elif scenario == 'multiple_conditions':
                # Multiple conditions scenario
                systolic_bp = np.random.normal(155, 18)
                diastolic_bp = np.random.normal(98, 12)
                blood_sugar = np.random.normal(145, 25)
                body_weight = np.random.normal(82, 15)
                hemoglobin = np.random.normal(9.2, 1.2)
                heart_rate = np.random.normal(95, 18)
                protein_urine = np.random.normal(2.0, 1.0)
                # Multiple conditions
                conditions[0] = 1  # gestational_diabetes
                conditions[1] = 1  # preeclampsia
                conditions[2] = 1  # anemia
                conditions[3] = 1  # hypertension
                conditions[6] = 1  # placental_issues
                risk = 2
            
            # Ensure realistic bounds
            age = max(16, min(45, age))
            systolic_bp = max(80, min(200, systolic_bp))
            diastolic_bp = max(50, min(120, diastolic_bp))
            blood_sugar = max(60, min(300, blood_sugar))
            body_weight = max(40, min(150, body_weight))
            hemoglobin = max(6, min(18, hemoglobin))
            heart_rate = max(50, min(150, heart_rate))
            protein_urine = max(0, min(5, protein_urine))
            
            # Add some realistic noise
            features = [
                systolic_bp + np.random.normal(0, 2),
                diastolic_bp + np.random.normal(0, 1.5),
                blood_sugar + np.random.normal(0, 3),
                body_weight + np.random.normal(0, 1),
                hemoglobin + np.random.normal(0, 0.2),
                heart_rate + np.random.normal(0, 3),
                protein_urine + np.random.normal(0, 0.1),
                age + np.random.normal(0, 0.5),
                gestational_week + np.random.normal(0, 0.5)
            ]
            
            data.append(features)
            risk_labels.append(risk)
            condition_labels.append(conditions)
        
        return np.array(data), np.array(risk_labels), np.array(condition_labels)
    
    def _train_model(self):
        """Train both risk and condition prediction models"""
        X, y_risk, y_conditions = self._generate_training_data()
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train risk prediction model
        self.risk_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42
        )
        self.risk_model.fit(X_scaled, y_risk)
        
        # Train condition prediction model (multi-output)
        self.condition_model = MultiOutputClassifier(
            RandomForestClassifier(
                n_estimators=100,
                max_depth=8,
                min_samples_split=15,
                min_samples_leaf=8,
                random_state=42
            )
        )
        self.condition_model.fit(X_scaled, y_conditions)
        
        print("Enhanced models trained successfully!")
        print(f"Risk model accuracy: {self.risk_model.score(X_scaled, y_risk):.3f}")
        
        # Print feature importance for risk model
        importance = self.risk_model.feature_importances_
        print("\nFeature importance for risk prediction:")
        for i, feature in enumerate(self.feature_names):
            print(f"{feature}: {importance[i]:.3f}")
    
    def _save_model(self):
        """Save the trained models and scaler"""
        os.makedirs('ml_model', exist_ok=True)
        joblib.dump(self.risk_model, 'ml_model/enhanced_risk_model.joblib')
        joblib.dump(self.condition_model, 'ml_model/condition_model.joblib')
        joblib.dump(self.scaler, 'ml_model/enhanced_scaler.joblib')
    
    def predict_comprehensive(self, health_params):
        """Predict both risk level and specific conditions"""
        if self.risk_model is None or self.condition_model is None:
            raise ValueError("Models not loaded or trained")
        
        # Extract features in correct order
        features = [
            health_params.get('systolic_bp', 120),
            health_params.get('diastolic_bp', 80),
            health_params.get('blood_sugar', 90),
            health_params.get('body_weight', 65),
            health_params.get('hemoglobin', 12),
            health_params.get('heart_rate', 75),
            health_params.get('protein_urine', 0.1),
            health_params.get('age', 28),
            health_params.get('gestational_week', 20)
        ]
        
        # Scale features
        features_scaled = self.scaler.transform([features])
        
        # Predict risk level
        risk_prediction = self.risk_model.predict(features_scaled)[0]
        risk_probabilities = self.risk_model.predict_proba(features_scaled)[0]
        
        # Predict conditions
        condition_predictions = self.condition_model.predict(features_scaled)[0]
        condition_probabilities = []
        
        # Get probabilities for each condition
        for i, estimator in enumerate(self.condition_model.estimators_):
            prob = estimator.predict_proba(features_scaled)[0]
            if len(prob) > 1:  # If condition is possible
                condition_probabilities.append(prob[1])  # Probability of having condition
            else:
                condition_probabilities.append(0.0)
        
        # Create detailed results
        detected_conditions = []
        condition_details = {}
        
        for i, (condition, prediction, probability) in enumerate(
            zip(self.conditions, condition_predictions, condition_probabilities)
        ):
            condition_details[condition] = {
                'detected': bool(prediction),
                'probability': float(probability),
                'severity': self._get_condition_severity(condition, probability, features)
            }
            
            if prediction and probability > 0.3:  # Threshold for detection
                detected_conditions.append({
                    'name': condition,
                    'probability': probability,
                    'severity': condition_details[condition]['severity']
                })
        
        return {
            'risk_level': self.risk_levels[risk_prediction],
            'risk_probabilities': {
                level: float(prob) for level, prob in zip(self.risk_levels, risk_probabilities)
            },
            'detected_conditions': detected_conditions,
            'condition_details': condition_details,
            'recommendations': self._get_condition_recommendations(detected_conditions, features)
        }
    
    def _get_condition_severity(self, condition, probability, features):
        """Determine severity of detected condition"""
        if probability < 0.3:
            return 'Low'
        elif probability < 0.7:
            return 'Moderate'
        else:
            return 'High'
    
    def _get_condition_recommendations(self, conditions, features):
        """Generate specific recommendations based on detected conditions"""
        recommendations = []
        
        for condition in conditions:
            condition_name = condition['name']
            severity = condition['severity']
            
            if condition_name == 'gestational_diabetes':
                recommendations.extend([
                    "Monitor blood glucose levels regularly",
                    "Follow a diabetic diet plan",
                    "Engage in regular, moderate exercise",
                    "Consider insulin therapy if recommended by doctor"
                ])
            
            elif condition_name == 'preeclampsia':
                recommendations.extend([
                    "Monitor blood pressure daily",
                    "Reduce sodium intake significantly",
                    "Rest frequently and avoid stress",
                    "Seek immediate medical attention for severe symptoms"
                ])
            
            elif condition_name == 'anemia':
                recommendations.extend([
                    "Increase iron-rich foods in diet",
                    "Take iron supplements as prescribed",
                    "Include vitamin C to enhance iron absorption",
                    "Regular blood tests to monitor hemoglobin"
                ])
            
            elif condition_name == 'hypertension':
                recommendations.extend([
                    "Monitor blood pressure regularly",
                    "Limit sodium and caffeine intake",
                    "Practice stress reduction techniques",
                    "Maintain healthy weight gain during pregnancy"
                ])
        
        if not recommendations:
            recommendations = [
                "Continue regular prenatal care",
                "Maintain healthy diet and exercise",
                "Monitor for any unusual symptoms",
                "Keep all scheduled prenatal appointments"
            ]
        
        return list(set(recommendations))  # Remove duplicates
    
    def get_feature_importance(self):
        """Get feature importance from the trained risk model"""
        if self.risk_model is None:
            raise ValueError("Risk model not loaded or trained")
        
        importance = self.risk_model.feature_importances_
        return {
            feature: float(imp) 
            for feature, imp in zip(self.feature_names, importance)
        }