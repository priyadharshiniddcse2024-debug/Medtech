#!/usr/bin/env python3
"""
Setup script for Maternal Health Monitoring Backend
"""

import os
import sys
import subprocess

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def initialize_database():
    """Initialize the SQLite database"""
    print("Initializing database...")
    from app import init_db
    init_db()
    print("Database initialized successfully!")

def train_ml_model():
    """Train the enhanced ML model"""
    print("Training Enhanced ML model...")
    try:
        from ml_model.enhanced_risk_predictor import EnhancedRiskPredictor
        predictor = EnhancedRiskPredictor()
        print("Enhanced ML model trained and saved successfully!")
    except Exception as e:
        print(f"Error training enhanced model: {e}")
        print("Falling back to basic model...")
        from ml_model.risk_predictor import RiskPredictor
        predictor = RiskPredictor()
        print("Basic ML model trained and saved successfully!")

def main():
    """Main setup function"""
    print("Setting up Maternal Health Monitoring Backend...")
    
    try:
        install_requirements()
        initialize_database()
        train_ml_model()
        
        print("\n✅ Backend setup completed successfully!")
        print("\nTo start the server, run:")
        print("python app.py")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()