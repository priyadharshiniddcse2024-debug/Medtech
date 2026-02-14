import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

class RiskPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = ['systolic_bp', 'diastolic_bp', 'blood_sugar', 'body_weight', 'hemoglobin']
        self.risk_levels = ['Normal', 'Medium', 'High']
        
        # Load or train model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train a new one with synthetic data"""
        model_path = 'ml_model/maternal_health_model.joblib'
        scaler_path = 'ml_model/scaler.joblib'
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
        else:
            self._train_model()
            self._save_model()
    
    def _generate_training_data(self):
        """Generate synthetic training data based on medical literature"""
        np.random.seed(42)
        n_samples = 1500
        
        # Generate features with realistic ranges and correlations
        data = []
        labels = []
        
        for _ in range(n_samples):
            # Generate correlated health parameters for more realistic predictions
            
            # Normal cases (50%)
            if np.random.random() < 0.5:
                # Normal pregnancy parameters
                systolic_bp = np.random.normal(115, 8)  # Normal: 90-120
                diastolic_bp = np.random.normal(75, 6)   # Normal: 60-80
                blood_sugar = np.random.normal(88, 12)   # Normal: 70-100 mg/dL
                body_weight = np.random.normal(65, 10)   # Varies widely
                hemoglobin = np.random.normal(12.2, 0.8) # Normal: 11-13 g/dL
                risk = 0  # Normal
            
            # Medium risk cases (35%)
            elif np.random.random() < 0.85:
                # Create realistic medium risk scenarios
                scenario = np.random.choice(['bp_elevated', 'sugar_high', 'anemia', 'weight_gain'])
                
                if scenario == 'bp_elevated':
                    systolic_bp = np.random.normal(135, 10)  # Elevated: 130-140
                    diastolic_bp = np.random.normal(88, 8)   # Elevated: 85-95
                    blood_sugar = np.random.normal(95, 15)   # Normal to slightly high
                    body_weight = np.random.normal(70, 12)   # Slightly higher
                    hemoglobin = np.random.normal(11.8, 1.0) # Normal
                    
                elif scenario == 'sugar_high':
                    systolic_bp = np.random.normal(125, 12)  # Slightly elevated
                    diastolic_bp = np.random.normal(82, 8)   # Slightly elevated
                    blood_sugar = np.random.normal(115, 15)  # Elevated: 100-130 mg/dL
                    body_weight = np.random.normal(72, 15)   # Higher weight
                    hemoglobin = np.random.normal(11.5, 1.2) # Slightly low
                    
                elif scenario == 'anemia':
                    systolic_bp = np.random.normal(120, 10)  # Normal to slightly high
                    diastolic_bp = np.random.normal(78, 8)   # Normal
                    blood_sugar = np.random.normal(92, 12)   # Normal
                    body_weight = np.random.normal(68, 12)   # Normal
                    hemoglobin = np.random.normal(10.2, 0.8) # Low: 9-11 g/dL
                    
                else:  # weight_gain
                    systolic_bp = np.random.normal(128, 12)  # Slightly elevated
                    diastolic_bp = np.random.normal(85, 10)  # Slightly elevated
                    blood_sugar = np.random.normal(105, 18)  # Slightly high
                    body_weight = np.random.normal(78, 15)   # High weight gain
                    hemoglobin = np.random.normal(11.0, 1.0) # Low normal
                
                risk = 1  # Medium
            
            # High risk cases (15%)
            else:
                # Create realistic high risk scenarios with multiple factors
                scenario = np.random.choice(['preeclampsia', 'gestational_diabetes', 'severe_anemia', 'multiple_risks'])
                
                if scenario == 'preeclampsia':
                    systolic_bp = np.random.normal(155, 15)  # High: >140
                    diastolic_bp = np.random.normal(98, 12)  # High: >90
                    blood_sugar = np.random.normal(110, 20)  # Elevated
                    body_weight = np.random.normal(82, 18)   # High weight
                    hemoglobin = np.random.normal(10.8, 1.2) # Low
                    
                elif scenario == 'gestational_diabetes':
                    systolic_bp = np.random.normal(140, 15)  # Elevated
                    diastolic_bp = np.random.normal(92, 10)  # Elevated
                    blood_sugar = np.random.normal(145, 25)  # High: >125 mg/dL
                    body_weight = np.random.normal(85, 20)   # High weight
                    hemoglobin = np.random.normal(11.2, 1.0) # Low normal
                    
                elif scenario == 'severe_anemia':
                    systolic_bp = np.random.normal(125, 15)  # Variable
                    diastolic_bp = np.random.normal(80, 12)  # Variable
                    blood_sugar = np.random.normal(100, 20)  # Variable
                    body_weight = np.random.normal(70, 15)   # Variable
                    hemoglobin = np.random.normal(8.5, 1.0)  # Very low: <9 g/dL
                    
                else:  # multiple_risks
                    systolic_bp = np.random.normal(148, 18)  # High
                    diastolic_bp = np.random.normal(95, 12)  # High
                    blood_sugar = np.random.normal(135, 25)  # High
                    body_weight = np.random.normal(88, 22)   # Very high
                    hemoglobin = np.random.normal(9.8, 1.2)  # Low
                
                risk = 2  # High
            
            # Ensure realistic bounds with some outliers
            systolic_bp = max(85, min(200, systolic_bp))
            diastolic_bp = max(50, min(120, diastolic_bp))
            blood_sugar = max(60, min(300, blood_sugar))
            body_weight = max(45, min(150, body_weight))
            hemoglobin = max(6, min(18, hemoglobin))
            
            # Add some noise for more realistic variation
            systolic_bp += np.random.normal(0, 2)
            diastolic_bp += np.random.normal(0, 1.5)
            blood_sugar += np.random.normal(0, 3)
            body_weight += np.random.normal(0, 1)
            hemoglobin += np.random.normal(0, 0.2)
            
            data.append([systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin])
            labels.append(risk)
        
        return np.array(data), np.array(labels)
    
    def _train_model(self):
        """Train the Decision Tree model"""
        X, y = self._generate_training_data()
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Decision Tree with better parameters for variation
        self.model = DecisionTreeClassifier(
            max_depth=8,
            min_samples_split=15,
            min_samples_leaf=8,
            random_state=42,
            criterion='gini',
            max_features='sqrt'
        )
        
        self.model.fit(X_scaled, y)
        
        print("Model trained successfully!")
        print(f"Training accuracy: {self.model.score(X_scaled, y):.3f}")
        
        # Print feature importance
        importance = self.model.feature_importances_
        for i, feature in enumerate(self.feature_names):
            print(f"{feature}: {importance[i]:.3f}")
    
    def _save_model(self):
        """Save the trained model and scaler"""
        os.makedirs('ml_model', exist_ok=True)
        joblib.dump(self.model, 'ml_model/maternal_health_model.joblib')
        joblib.dump(self.scaler, 'ml_model/scaler.joblib')
    
    def predict_risk(self, health_params):
        """Predict risk level from health parameters with more nuanced logic"""
        if self.model is None:
            raise ValueError("Model not loaded or trained")
        
        # Extract features in correct order
        features = [
            health_params['systolic_bp'],
            health_params['diastolic_bp'],
            health_params['blood_sugar'],
            health_params['body_weight'],
            health_params['hemoglobin']
        ]
        
        # Scale features
        features_scaled = self.scaler.transform([features])
        
        # Get prediction and probability
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        # Add additional logic for edge cases and more realistic predictions
        systolic = health_params['systolic_bp']
        diastolic = health_params['diastolic_bp']
        blood_sugar = health_params['blood_sugar']
        hemoglobin = health_params['hemoglobin']
        
        # Override prediction based on critical thresholds
        critical_conditions = 0
        
        # Check for critical blood pressure
        if systolic >= 160 or diastolic >= 100:
            critical_conditions += 2
        elif systolic >= 140 or diastolic >= 90:
            critical_conditions += 1
            
        # Check for critical blood sugar
        if blood_sugar >= 140:
            critical_conditions += 2
        elif blood_sugar >= 125:
            critical_conditions += 1
            
        # Check for severe anemia
        if hemoglobin < 9:
            critical_conditions += 2
        elif hemoglobin < 10.5:
            critical_conditions += 1
        
        # Adjust prediction based on critical conditions
        if critical_conditions >= 3:
            final_prediction = 2  # High risk
        elif critical_conditions >= 2:
            final_prediction = max(1, prediction)  # At least medium risk
        elif critical_conditions >= 1:
            final_prediction = max(prediction, 0)  # Could be any level
        else:
            final_prediction = prediction
        
        return self.risk_levels[final_prediction]
    
    def get_risk_probability(self, health_params):
        """Get probability distribution for all risk levels"""
        if self.model is None:
            raise ValueError("Model not loaded or trained")
        
        features = [
            health_params['systolic_bp'],
            health_params['diastolic_bp'],
            health_params['blood_sugar'],
            health_params['body_weight'],
            health_params['hemoglobin']
        ]
        
        features_scaled = self.scaler.transform([features])
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        return {
            risk_level: float(prob) 
            for risk_level, prob in zip(self.risk_levels, probabilities)
        }
    
    def get_feature_importance(self):
        """Get feature importance from the trained model"""
        if self.model is None:
            raise ValueError("Model not loaded or trained")
        
        importance = self.model.feature_importances_
        return {
            feature: float(imp) 
            for feature, imp in zip(self.feature_names, importance)
        }