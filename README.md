# AI-Powered Maternal Health Monitoring System

A comprehensive web application for pregnancy care and early risk detection using AI-driven clinical decision support. This system enables pregnant users to track health parameters, receive AI-powered risk assessments, and get personalized pregnancy guidance.

## 🌟 Features

### 🏥 Health Parameter Tracking
- **Manual Entry**: Blood pressure, blood sugar, weight, and hemoglobin monitoring
- **Real-time Validation**: Input validation with medical reference ranges
- **Historical Tracking**: Complete health record history with trend analysis

### 🤖 AI Risk Assessment
- **Decision Tree ML Model**: Trained on maternal health indicators
- **Risk Classification**: Normal, Medium, or High risk levels
- **Personalized Recommendations**: Tailored health advice based on risk assessment
- **Clinical Decision Support**: Evidence-based recommendations for healthcare decisions

### 🤱 Pregnancy Tracker
- **Week-by-Week Guidance**: Comprehensive pregnancy journey tracking
- **Gestational Age Calculator**: Automatic calculation based on LMP
- **Stage-Specific Information**: Fetal development, maternal changes, nutrition advice
- **Medical Milestones**: Checkup reminders and screening schedules

### 📱 Smart Alerts & Recommendations
- **Risk-Based Alerts**: Immediate notifications for high-risk conditions
- **Health Recommendations**: Dietary, lifestyle, and medical guidance
- **Warning Signs**: Critical symptoms to watch for
- **Doctor Visit Suggestions**: When to seek immediate medical attention

### 🎨 User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Medical-Themed UI**: Professional healthcare interface
- **Accessibility**: WCAG compliant for inclusive access
- **Intuitive Navigation**: Easy-to-use interface for all users

## 🛠 Tech Stack

### Frontend
- **React.js 19.2** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful icons
- **Chart.js** - Data visualization
- **CSS3** - Custom styling with medical theme

### Backend
- **Python 3.9+** - Server-side language
- **Flask 2.3** - Lightweight web framework
- **SQLite** - Embedded database for development
- **JWT Authentication** - Secure user sessions
- **CORS Support** - Cross-origin resource sharing

### Machine Learning
- **Scikit-learn** - Decision Tree classifier
- **Pandas & NumPy** - Data processing
- **Joblib** - Model serialization
- **Synthetic Training Data** - Based on medical literature

### Security & Privacy
- **Password Hashing** - SHA-256 encryption
- **JWT Tokens** - Secure authentication
- **Input Validation** - Comprehensive data sanitization
- **HTTPS Ready** - Production security

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm or yarn**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run setup script (initializes DB and trains ML model)
python setup.py

# Start Flask server
python app.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Health Records
- `POST /api/health-record` - Add health record with AI analysis
- `GET /api/dashboard` - Get dashboard data

### Pregnancy Tracking
- `POST /api/pregnancy-profile` - Create pregnancy profile
- `GET /api/pregnancy-guidance/<week>` - Get weekly guidance

## 🧠 Machine Learning Model

### Decision Tree Classifier
- **Features**: Systolic BP, Diastolic BP, Blood Sugar, Weight, Hemoglobin
- **Output**: Risk Level (Normal/Medium/High)
- **Training Data**: 1000+ synthetic samples based on medical literature
- **Accuracy**: Optimized for maternal health risk patterns

### Risk Categories
- **Normal Risk**: Healthy parameters within normal ranges
- **Medium Risk**: Some parameters elevated, requires monitoring
- **High Risk**: Multiple risk factors, immediate medical attention needed

## 🏥 Healthcare Impact

### Early Detection
- **Pregnancy Complications**: Identify risks before they become critical
- **Preventive Care**: Proactive health management
- **Clinical Decision Support**: AI-assisted healthcare decisions

### Accessibility
- **Rural Healthcare**: Accessible in low-resource settings
- **Cost-Effective**: Affordable monitoring solution
- **User-Friendly**: No technical expertise required

### Evidence-Based Care
- **Medical Guidelines**: Based on established clinical practices
- **Personalized Recommendations**: Tailored to individual risk profiles
- **Continuous Monitoring**: Regular health parameter tracking

## 📱 User Interface

### Dashboard
- **Health Overview**: Latest risk assessment and trends
- **Pregnancy Progress**: Current week and milestones
- **Quick Actions**: Easy access to key features
- **Health Tips**: Daily recommendations

### Health Entry
- **Parameter Input**: Guided health data entry
- **Real-time Validation**: Immediate feedback on values
- **AI Analysis**: Instant risk assessment
- **Detailed Recommendations**: Comprehensive health guidance

### Pregnancy Tracker
- **Weekly Progress**: Visual pregnancy timeline
- **Stage Information**: Detailed weekly guidance
- **Development Tracking**: Fetal growth milestones
- **Medical Schedule**: Checkup and screening reminders

## 🔒 Security & Privacy

### Data Protection
- **Encrypted Storage**: Secure health data handling
- **User Authentication**: JWT-based security
- **Input Validation**: Comprehensive data sanitization
- **Privacy Compliance**: HIPAA-aware design principles

### Medical Disclaimer
This application provides educational information and AI-powered insights but does not replace professional medical advice. Users should always consult healthcare providers for medical decisions.

## 🌍 Deployment Options

### 🆓 FREE Deployment (Recommended)
Deploy completely free using Render + Vercel:
- **Backend:** Render (750 hours/month free)
- **Frontend:** Vercel (unlimited free)
- **Setup Time:** 10 minutes
- **See:** [FREE_DEPLOYMENT_QUICKSTART.md](FREE_DEPLOYMENT_QUICKSTART.md)

### Development
- **Local Setup**: SQLite database, Flask dev server
- **Docker**: Containerized deployment
- **Environment Variables**: Configurable settings

### Production Alternatives
- **Cloud Platforms**: AWS, GCP, Azure support
- **Database Options**: PostgreSQL, MySQL, Firebase
- **Scaling**: Horizontal scaling ready
- **Monitoring**: Health checks and logging

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

### Medical Accuracy
- All medical information based on established guidelines
- Regular review by healthcare professionals
- Evidence-based recommendations only

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Comprehensive endpoint documentation
- **User Guide**: Step-by-step usage instructions
- **Developer Guide**: Technical implementation details

### Community
- **Issues**: GitHub issue tracker
- **Discussions**: Community forum
- **Updates**: Regular feature updates and improvements

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic health parameter tracking
- ✅ AI risk assessment
- ✅ Pregnancy week tracker
- ✅ Responsive web interface

### Phase 2 (Planned)
- 📱 Mobile app development
- 🔔 Push notifications
- 📊 Advanced analytics
- 👩‍⚕️ Healthcare provider portal

### Phase 3 (Future)
- 🌐 Multi-language support
- 🤖 Advanced ML models
- 📈 Population health insights
- 🏥 EHR integration

## 🏆 Awards & Recognition

This project is designed for healthcare hackathons and demonstrates:
- **Real-world Impact**: Addresses critical maternal health challenges
- **Technical Excellence**: Modern full-stack architecture
- **AI Innovation**: Practical machine learning application
- **User-Centered Design**: Accessible healthcare technology

---

**Built with ❤️ for maternal and child health**

*Empowering expectant mothers with AI-driven healthcare insights*