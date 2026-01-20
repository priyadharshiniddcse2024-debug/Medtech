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
        n_samples = 1000
        
        # Generate features with realistic ranges
        data = []
        labels = []
        
        for _ in range(n_samples):
            # Normal cases (60%)
            if np.random.random() < 0.6:
                systolic_bp = np.random.normal(115, 10)  # Normal: 90-120
                diastolic_bp = np.random.normal(75, 8)   # Normal: 60-80
                blood_sugar = np.random.normal(90, 15)   # Normal: 70-100 mg/dL
                body_weight = np.random.normal(65, 12)   # Varies widely
                hemoglobin = np.random.normal(12, 1)     # Normal: 11-13 g/dL
                risk = 0  # Normal
            
            # Medium risk cases (25%)
            elif np.random.random() < 0.85:
                systolic_bp = np.random.normal(135, 15)  # Elevated: 120-140
                diastolic_bp = np.random.normal(85, 10)  # Elevated: 80-90
                blood_sugar = np.random.normal(110, 20)  # Elevated: 100-125 mg/dL
                body_weight = np.random.normal(75, 15)   # Higher weight
                hemoglobin = np.random.normal(10.5, 1.5) # Slightly low: 9-11 g/dL
                risk = 1  # Medium
            
            # High risk cases (15%)
            else:
                systolic_bp = np.random.normal(155, 20)  # High: >140
                diastolic_bp = np.random.normal(95, 12)  # High: >90
                blood_sugar = np.random.normal(140, 25)  # High: >125 mg/dL
                body_weight = np.random.normal(85, 20)   # Higher weight
                hemoglobin = np.random.normal(9, 1.5)    # Low: <10 g/dL
                risk = 2  # High
            
            # Ensure realistic bounds
            systolic_bp = max(80, min(200, systolic_bp))
            diastolic_bp = max(50, min(120, diastolic_bp))
            blood_sugar = max(60, min(300, blood_sugar))
            body_weight = max(40, min(150, body_weight))
            hemoglobin = max(6, min(18, hemoglobin))
            
            data.append([systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin])
            labels.append(risk)
        
        return np.array(data), np.array(labels)
    
    def _train_model(self):
        """Train the Decision Tree model"""
        X, y = self._generate_training_data()
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Decision Tree
        self.model = DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=20,
            min_samples_leaf=10,
            random_state=42
        )
        
        self.model.fit(X_scaled, y)
        
        print("Model trained successfully!")
        print(f"Training accuracy: {self.model.score(X_scaled, y):.3f}")
    
    def _save_model(self):
        """Save the trained model and scaler"""
        os.makedirs('ml_model', exist_ok=True)
        joblib.dump(self.model, 'ml_model/maternal_health_model.joblib')
        joblib.dump(self.scaler, 'ml_model/scaler.joblib')
    
    def predict_risk(self, health_params):
        """Predict risk level from health parameters"""
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
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        
        return self.risk_levels[prediction]
    
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