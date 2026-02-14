import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/api'
import { 
  Activity, 
  Heart, 
  Droplets, 
  Weight, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  User,
  Clock,
  TestTube,
  Zap
} from 'lucide-react'

const EnhancedHealthEntry = () => {
  const [formData, setFormData] = useState({
    systolic_bp: '',
    diastolic_bp: '',
    blood_sugar: '',
    body_weight: '',
    hemoglobin: '',
    heart_rate: '',
    protein_urine: '',
    age: '',
    gestational_week: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  // Pre-fill form from URL parameters for testing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const newFormData = { ...formData }
    let hasParams = false
    
    Object.keys(formData).forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        newFormData[param] = value
        hasParams = true
      }
    })
    
    if (hasParams) {
      setFormData(newFormData)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    const { systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin, heart_rate, age, gestational_week } = formData
    
    if (parseInt(systolic_bp) < 80 || parseInt(systolic_bp) > 200) {
      setError('Systolic blood pressure should be between 80-200 mmHg')
      return false
    }
    
    if (parseInt(diastolic_bp) < 50 || parseInt(diastolic_bp) > 120) {
      setError('Diastolic blood pressure should be between 50-120 mmHg')
      return false
    }
    
    if (parseFloat(blood_sugar) < 60 || parseFloat(blood_sugar) > 300) {
      setError('Blood sugar should be between 60-300 mg/dL')
      return false
    }
    
    if (parseFloat(body_weight) < 40 || parseFloat(body_weight) > 150) {
      setError('Body weight should be between 40-150 kg')
      return false
    }
    
    if (parseFloat(hemoglobin) < 6 || parseFloat(hemoglobin) > 18) {
      setError('Hemoglobin should be between 6-18 g/dL')
      return false
    }

    if (heart_rate && (parseInt(heart_rate) < 50 || parseInt(heart_rate) > 150)) {
      setError('Heart rate should be between 50-150 bpm')
      return false
    }

    if (age && (parseInt(age) < 16 || parseInt(age) > 45)) {
      setError('Age should be between 16-45 years')
      return false
    }

    if (gestational_week && (parseInt(gestational_week) < 1 || parseInt(gestational_week) > 42)) {
      setError('Gestational week should be between 1-42 weeks')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/health-record', {
        systolic_bp: parseInt(formData.systolic_bp),
        diastolic_bp: parseInt(formData.diastolic_bp),
        blood_sugar: parseFloat(formData.blood_sugar),
        body_weight: parseFloat(formData.body_weight),
        hemoglobin: parseFloat(formData.hemoglobin),
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : 75,
        protein_urine: formData.protein_urine ? parseFloat(formData.protein_urine) : 0.1,
        age: formData.age ? parseInt(formData.age) : 28,
        gestational_week: formData.gestational_week ? parseInt(formData.gestational_week) : 20
      })
      
      setResult(response.data)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process health record')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'normal': return 'var(--success-color)'
      case 'medium': return 'var(--warning-color)'
      case 'high': return 'var(--danger-color)'
      default: return 'var(--text-secondary)'
    }
  }

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'normal': return <CheckCircle size={20} />
      case 'medium': return <AlertCircle size={20} />
      case 'high': return <AlertCircle size={20} />
      default: return <Heart size={20} />
    }
  }

  const getConditionSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return '#48bb78'
      case 'moderate': return '#ed8936'
      case 'high': return '#f56565'
      default: return '#718096'
    }
  }

  if (result) {
    return (
      <div className="health-entry fade-in">
        <div className="result-container">
          <div className="result-header">
            <div 
              className="risk-badge"
              style={{ 
                backgroundColor: getRiskColor(result.risk_level) + '20',
                color: getRiskColor(result.risk_level),
                border: `2px solid ${getRiskColor(result.risk_level)}`
              }}
            >
              {getRiskIcon(result.risk_level)}
              <span>{result.risk_level} Risk Level</span>
            </div>
            <h1>Comprehensive Health Analysis Complete</h1>
            <p>AI-powered analysis with condition detection and personalized recommendations</p>
          </div>

          {/* Risk Probabilities */}
          <div className="medical-card">
            <h2>Risk Assessment Probabilities</h2>
            <div className="probability-bars">
              {Object.entries(result.risk_probabilities).map(([level, probability]) => (
                <div key={level} className="probability-item">
                  <div className="probability-label">
                    <span>{level}</span>
                    <span>{(probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="probability-bar">
                    <div 
                      className="probability-fill"
                      style={{ 
                        width: `${probability * 100}%`,
                        backgroundColor: getRiskColor(level)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Conditions */}
          {result.detected_conditions && result.detected_conditions.length > 0 && (
            <div className="medical-card">
              <h2>🔍 Detected Health Conditions</h2>
              <div className="conditions-grid">
                {result.detected_conditions.map((condition, index) => (
                  <div key={index} className="condition-card">
                    <div className="condition-header">
                      <h4>{condition.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <div 
                        className="severity-badge"
                        style={{ 
                          backgroundColor: getConditionSeverityColor(condition.severity) + '20',
                          color: getConditionSeverityColor(condition.severity)
                        }}
                      >
                        {condition.severity} Risk
                      </div>
                    </div>
                    <div className="condition-probability">
                      <span>Confidence: {(condition.probability * 100).toFixed(1)}%</span>
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill"
                          style={{ 
                            width: `${condition.probability * 100}%`,
                            backgroundColor: getConditionSeverityColor(condition.severity)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="recommendations-section">
            <div className="medical-card">
              <h2>🤖 AI-Generated Recommendations</h2>
              
              {result.ai_recommendations && result.ai_recommendations.length > 0 && (
                <div className="recommendation-group">
                  <h3>Condition-Specific Recommendations</h3>
                  <ul>
                    {result.ai_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.general_recommendations?.general_advice && (
                <div className="recommendation-group">
                  <h3>General Health Advice</h3>
                  <ul>
                    {result.general_recommendations.general_advice.map((advice, index) => (
                      <li key={index}>{advice}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.general_recommendations?.dietary_recommendations && (
                <div className="recommendation-group">
                  <h3>Dietary Recommendations</h3>
                  <ul>
                    {result.general_recommendations.dietary_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.general_recommendations?.lifestyle_changes && (
                <div className="recommendation-group">
                  <h3>Lifestyle Changes</h3>
                  <ul>
                    {result.general_recommendations.lifestyle_changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.general_recommendations?.warning_signs && (
                <div className="recommendation-group warning-signs">
                  <h3>⚠️ Warning Signs to Watch For</h3>
                  <ul>
                    {result.general_recommendations.warning_signs.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => {
                setResult(null)
                setFormData({
                  systolic_bp: '',
                  diastolic_bp: '',
                  blood_sugar: '',
                  body_weight: '',
                  hemoglobin: '',
                  heart_rate: '',
                  protein_urine: '',
                  age: '',
                  gestational_week: ''
                })
              }}
              className="btn btn-outline"
            >
              Add Another Record
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .result-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .result-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .risk-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }

          .result-header h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
          }

          .result-header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
          }

          .probability-bars {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .probability-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .probability-label {
            display: flex;
            justify-content: space-between;
            font-weight: 500;
          }

          .probability-bar {
            height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
          }

          .probability-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 1s ease;
          }

          .conditions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }

          .condition-card {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
          }

          .condition-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
          }

          .condition-header h4 {
            margin: 0;
            color: var(--text-primary);
          }

          .severity-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .condition-probability {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .mini-progress-bar {
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            overflow: hidden;
          }

          .mini-progress-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 1s ease;
          }

          .recommendations-section {
            margin-bottom: 2rem;
          }

          .recommendation-group {
            margin-bottom: 1.5rem;
          }

          .recommendation-group h3 {
            color: var(--primary-color);
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
          }

          .recommendation-group ul {
            list-style: none;
            padding: 0;
          }

          .recommendation-group li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .recommendation-group li:last-child {
            border-bottom: none;
          }

          .recommendation-group li::before {
            content: "✓";
            color: var(--secondary-color);
            font-weight: bold;
            margin-top: 0.125rem;
          }

          .warning-signs {
            background: rgba(239, 68, 68, 0.05);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.2);
          }

          .warning-signs li::before {
            content: "⚠️";
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }

          @media (max-width: 768px) {
            .result-header h1 {
              font-size: 2rem;
            }
            
            .action-buttons {
              flex-direction: column;
            }

            .conditions-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="health-entry fade-in">
      <div className="entry-header">
        <h1>Enhanced Health Assessment</h1>
        <p>Comprehensive health analysis with AI-powered condition detection</p>
      </div>

      {error && (
        <div className="error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="entry-form-container">
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-sections">
            {/* Essential Parameters */}
            <div className="form-section">
              <h3>Essential Health Parameters</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="systolic_bp" className="form-label">
                    <Heart size={16} />
                    Systolic Blood Pressure (mmHg) *
                  </label>
                  <input
                    type="number"
                    id="systolic_bp"
                    name="systolic_bp"
                    value={formData.systolic_bp}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 120"
                    min="80"
                    max="200"
                    required
                  />
                  <small className="form-help">Normal: 90-120 mmHg</small>
                </div>

                <div className="form-group">
                  <label htmlFor="diastolic_bp" className="form-label">
                    <Heart size={16} />
                    Diastolic Blood Pressure (mmHg) *
                  </label>
                  <input
                    type="number"
                    id="diastolic_bp"
                    name="diastolic_bp"
                    value={formData.diastolic_bp}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 80"
                    min="50"
                    max="120"
                    required
                  />
                  <small className="form-help">Normal: 60-80 mmHg</small>
                </div>

                <div className="form-group">
                  <label htmlFor="blood_sugar" className="form-label">
                    <Droplets size={16} />
                    Blood Sugar Level (mg/dL) *
                  </label>
                  <input
                    type="number"
                    id="blood_sugar"
                    name="blood_sugar"
                    value={formData.blood_sugar}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 95"
                    min="60"
                    max="300"
                    step="0.1"
                    required
                  />
                  <small className="form-help">Normal: 70-100 mg/dL (fasting)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="body_weight" className="form-label">
                    <Weight size={16} />
                    Body Weight (kg) *
                  </label>
                  <input
                    type="number"
                    id="body_weight"
                    name="body_weight"
                    value={formData.body_weight}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 65.5"
                    min="40"
                    max="150"
                    step="0.1"
                    required
                  />
                  <small className="form-help">Current weight</small>
                </div>

                <div className="form-group">
                  <label htmlFor="hemoglobin" className="form-label">
                    <Activity size={16} />
                    Hemoglobin Level (g/dL) *
                  </label>
                  <input
                    type="number"
                    id="hemoglobin"
                    name="hemoglobin"
                    value={formData.hemoglobin}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 12.5"
                    min="6"
                    max="18"
                    step="0.1"
                    required
                  />
                  <small className="form-help">Normal: 11-13 g/dL (pregnancy)</small>
                </div>
              </div>
            </div>

            {/* Additional Parameters */}
            <div className="form-section">
              <h3>Additional Health Parameters</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="heart_rate" className="form-label">
                    <Zap size={16} />
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    id="heart_rate"
                    name="heart_rate"
                    value={formData.heart_rate}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 75"
                    min="50"
                    max="150"
                  />
                  <small className="form-help">Normal: 60-100 bpm</small>
                </div>

                <div className="form-group">
                  <label htmlFor="protein_urine" className="form-label">
                    <TestTube size={16} />
                    Protein in Urine (g/L)
                  </label>
                  <input
                    type="number"
                    id="protein_urine"
                    name="protein_urine"
                    value={formData.protein_urine}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.1"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                  <small className="form-help">Normal: <0.3 g/L</small>
                </div>

                <div className="form-group">
                  <label htmlFor="age" className="form-label">
                    <User size={16} />
                    Age (years)
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 28"
                    min="16"
                    max="45"
                  />
                  <small className="form-help">Your current age</small>
                </div>

                <div className="form-group">
                  <label htmlFor="gestational_week" className="form-label">
                    <Calendar size={16} />
                    Gestational Week
                  </label>
                  <input
                    type="number"
                    id="gestational_week"
                    name="gestational_week"
                    value={formData.gestational_week}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 20"
                    min="1"
                    max="42"
                  />
                  <small className="form-help">Current pregnancy week</small>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="pulse">Analyzing...</div>
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                Comprehensive Health Analysis
              </>
            )}
          </button>
        </form>

        <div className="info-panel">
          <h3>Enhanced AI Analysis</h3>
          <div className="feature-list">
            <div className="feature-item">
              <CheckCircle className="feature-icon" />
              <div>
                <strong>Condition Detection:</strong> AI identifies specific pregnancy-related conditions
              </div>
            </div>
            <div className="feature-item">
              <TrendingUp className="feature-icon" />
              <div>
                <strong>Risk Probabilities:</strong> Detailed probability analysis for each risk level
              </div>
            </div>
            <div className="feature-item">
              <Heart className="feature-icon" />
              <div>
                <strong>Comprehensive Parameters:</strong> 9 health parameters for accurate analysis
              </div>
            </div>
            <div className="feature-item">
              <Activity className="feature-icon" />
              <div>
                <strong>Personalized Recommendations:</strong> Condition-specific health advice
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .health-entry {
          max-width: 1200px;
          margin: 0 auto;
        }

        .entry-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .entry-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .entry-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .entry-form-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .entry-form {
          background: var(--surface-color);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-section h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
          font-size: 1.2rem;
          border-bottom: 2px solid var(--primary-color);
          padding-bottom: 0.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-help {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .info-panel {
          background: var(--surface-color);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          height: fit-content;
        }

        .info-panel h3 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .feature-icon {
          color: var(--secondary-color);
          margin-top: 0.125rem;
          flex-shrink: 0;
        }

        .feature-item strong {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .entry-header h1 {
            font-size: 2rem;
          }
          
          .entry-form-container {
            grid-template-columns: 1fr;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedHealthEntry