import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Activity, 
  Heart, 
  Droplets, 
  Weight, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react'

const HealthEntry = () => {
  const [formData, setFormData] = useState({
    systolic_bp: '',
    diastolic_bp: '',
    blood_sugar: '',
    body_weight: '',
    hemoglobin: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    const { systolic_bp, diastolic_bp, blood_sugar, body_weight, hemoglobin } = formData
    
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
        hemoglobin: parseFloat(formData.hemoglobin)
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
            <h1>Health Assessment Complete</h1>
            <p>Your health parameters have been analyzed using AI</p>
          </div>

          <div className="recommendations-section">
            <div className="medical-card">
              <h2>AI-Generated Recommendations</h2>
              
              {result.recommendations.general_advice && (
                <div className="recommendation-group">
                  <h3>General Advice</h3>
                  <ul>
                    {result.recommendations.general_advice.map((advice, index) => (
                      <li key={index}>{advice}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.dietary_recommendations && (
                <div className="recommendation-group">
                  <h3>Dietary Recommendations</h3>
                  <ul>
                    {result.recommendations.dietary_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.lifestyle_changes && (
                <div className="recommendation-group">
                  <h3>Lifestyle Changes</h3>
                  <ul>
                    {result.recommendations.lifestyle_changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.medical_actions && (
                <div className="recommendation-group">
                  <h3>Medical Actions</h3>
                  <ul>
                    {result.recommendations.medical_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.warning_signs && (
                <div className="recommendation-group warning-signs">
                  <h3>⚠️ Warning Signs to Watch For</h3>
                  <ul>
                    {result.recommendations.warning_signs.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="next-checkup">
                <Calendar size={16} />
                <strong>Next Checkup: </strong>
                {result.recommendations.next_checkup}
              </div>
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
                  hemoglobin: ''
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
            max-width: 800px;
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

          .next-checkup {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--background-color);
            border-radius: 8px;
            margin-top: 1rem;
            color: var(--primary-color);
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
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="health-entry fade-in">
      <div className="entry-header">
        <h1>Health Parameter Entry</h1>
        <p>Enter your current health measurements for AI-powered risk assessment</p>
      </div>

      {error && (
        <div className="error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="entry-form-container">
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="systolic_bp" className="form-label">
                <Heart size={16} />
                Systolic Blood Pressure (mmHg)
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
              <small className="form-help">Normal range: 90-120 mmHg</small>
            </div>

            <div className="form-group">
              <label htmlFor="diastolic_bp" className="form-label">
                <Heart size={16} />
                Diastolic Blood Pressure (mmHg)
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
              <small className="form-help">Normal range: 60-80 mmHg</small>
            </div>

            <div className="form-group">
              <label htmlFor="blood_sugar" className="form-label">
                <Droplets size={16} />
                Blood Sugar Level (mg/dL)
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
              <small className="form-help">Normal range: 70-100 mg/dL (fasting)</small>
            </div>

            <div className="form-group">
              <label htmlFor="body_weight" className="form-label">
                <Weight size={16} />
                Body Weight (kg)
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
              <small className="form-help">Enter your current weight</small>
            </div>

            <div className="form-group">
              <label htmlFor="hemoglobin" className="form-label">
                <Activity size={16} />
                Hemoglobin Level (g/dL)
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
              <small className="form-help">Normal range: 11-13 g/dL (pregnancy)</small>
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
                Analyze Health Parameters
              </>
            )}
          </button>
        </form>

        <div className="info-panel">
          <h3>How to Measure</h3>
          <div className="measurement-tips">
            <div className="tip">
              <Heart className="tip-icon" />
              <div>
                <strong>Blood Pressure:</strong> Measure after 5 minutes of rest, sitting comfortably
              </div>
            </div>
            <div className="tip">
              <Droplets className="tip-icon" />
              <div>
                <strong>Blood Sugar:</strong> Best measured 2 hours after meals or fasting
              </div>
            </div>
            <div className="tip">
              <Weight className="tip-icon" />
              <div>
                <strong>Weight:</strong> Weigh yourself at the same time each day, preferably morning
              </div>
            </div>
            <div className="tip">
              <Activity className="tip-icon" />
              <div>
                <strong>Hemoglobin:</strong> Requires blood test from healthcare provider
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .health-entry {
          max-width: 1000px;
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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
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

        .measurement-tips {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tip {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .tip-icon {
          color: var(--secondary-color);
          margin-top: 0.125rem;
        }

        .tip strong {
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

export default HealthEntry