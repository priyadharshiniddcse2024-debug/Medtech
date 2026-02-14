import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../utils/api'
import { 
  Thermometer, 
  Heart, 
  Zap, 
  Moon, 
  Utensils, 
  Activity,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Clock,
  Star
} from 'lucide-react'

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState([])
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: 1,
    description: '',
    category: 'general'
  })
  const [loading, setLoading] = useState(false)

  const symptomCategories = {
    general: { icon: Activity, color: '#667eea', label: 'General' },
    digestive: { icon: Utensils, color: '#48bb78', label: 'Digestive' },
    sleep: { icon: Moon, color: '#9f7aea', label: 'Sleep' },
    energy: { icon: Zap, color: '#ed8936', label: 'Energy' },
    pain: { icon: AlertCircle, color: '#f56565', label: 'Pain' },
    emotional: { icon: Heart, color: '#ec4899', label: 'Emotional' }
  }

  const commonSymptoms = [
    'Morning sickness', 'Fatigue', 'Headache', 'Back pain', 'Heartburn',
    'Constipation', 'Swelling', 'Mood changes', 'Insomnia', 'Dizziness'
  ]

  const handleAddSymptom = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const symptomData = {
        ...newSymptom,
        timestamp: new Date().toISOString(),
        id: Date.now()
      }
      
      setSymptoms([symptomData, ...symptoms])
      setNewSymptom({
        name: '',
        severity: 1,
        description: '',
        category: 'general'
      })
    } catch (error) {
      console.error('Error adding symptom:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    if (severity <= 2) return '#48bb78'
    if (severity <= 4) return '#ed8936'
    return '#f56565'
  }

  const getSeverityLabel = (severity) => {
    if (severity <= 2) return 'Mild'
    if (severity <= 4) return 'Moderate'
    return 'Severe'
  }

  return (
    <div className="symptom-tracker">
      <div className="tracker-header">
        <h1>Symptom Tracker</h1>
        <p>Monitor and track your pregnancy symptoms for better health insights</p>
      </div>

      <div className="tracker-content">
        <div className="add-symptom-section">
          <div className="medical-card">
            <h2>
              <Plus size={20} />
              Log New Symptom
            </h2>
            
            <form onSubmit={handleAddSymptom} className="symptom-form">
              <div className="form-group">
                <label className="form-label">Symptom Name</label>
                <input
                  type="text"
                  value={newSymptom.name}
                  onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
                  className="form-input"
                  placeholder="Enter symptom name"
                  required
                />
                <div className="quick-symptoms">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => setNewSymptom({...newSymptom, name: symptom})}
                      className="quick-symptom-btn"
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newSymptom.category}
                    onChange={(e) => setNewSymptom({...newSymptom, category: e.target.value})}
                    className="form-input"
                  >
                    {Object.entries(symptomCategories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Severity: {getSeverityLabel(newSymptom.severity)} ({newSymptom.severity}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newSymptom.severity}
                    onChange={(e) => setNewSymptom({...newSymptom, severity: parseInt(e.target.value)})}
                    className="severity-slider"
                    style={{
                      background: `linear-gradient(to right, ${getSeverityColor(newSymptom.severity)} 0%, ${getSeverityColor(newSymptom.severity)} ${newSymptom.severity * 20}%, #e2e8f0 ${newSymptom.severity * 20}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="severity-labels">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  value={newSymptom.description}
                  onChange={(e) => setNewSymptom({...newSymptom, description: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Additional details about the symptom..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !newSymptom.name}
              >
                {loading ? 'Adding...' : 'Log Symptom'}
              </button>
            </form>
          </div>
        </div>

        <div className="symptoms-history">
          <div className="medical-card">
            <h2>
              <TrendingUp size={20} />
              Recent Symptoms
            </h2>
            
            {symptoms.length === 0 ? (
              <div className="empty-state">
                <Thermometer size={48} />
                <h3>No symptoms logged yet</h3>
                <p>Start tracking your symptoms to identify patterns and discuss with your healthcare provider.</p>
              </div>
            ) : (
              <div className="symptoms-list">
                <AnimatePresence>
                  {symptoms.map((symptom) => {
                    const CategoryIcon = symptomCategories[symptom.category].icon
                    return (
                      <motion.div
                        key={symptom.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="symptom-item"
                      >
                        <div className="symptom-header">
                          <div className="symptom-info">
                            <div 
                              className="symptom-icon"
                              style={{ backgroundColor: symptomCategories[symptom.category].color + '20' }}
                            >
                              <CategoryIcon 
                                size={16} 
                                style={{ color: symptomCategories[symptom.category].color }}
                              />
                            </div>
                            <div>
                              <h4>{symptom.name}</h4>
                              <span className="symptom-category">
                                {symptomCategories[symptom.category].label}
                              </span>
                            </div>
                          </div>
                          <div className="symptom-meta">
                            <div 
                              className="severity-badge"
                              style={{ 
                                backgroundColor: getSeverityColor(symptom.severity) + '20',
                                color: getSeverityColor(symptom.severity)
                              }}
                            >
                              {getSeverityLabel(symptom.severity)}
                            </div>
                            <span className="symptom-time">
                              <Clock size={12} />
                              {new Date(symptom.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {symptom.description && (
                          <p className="symptom-description">{symptom.description}</p>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .symptom-tracker {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tracker-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .tracker-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .tracker-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .tracker-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .symptom-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .quick-symptoms {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .quick-symptom-btn {
          padding: 0.25rem 0.75rem;
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-symptom-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .severity-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }

        .severity-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .symptoms-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .symptom-item {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
        }

        .symptom-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .symptom-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .symptom-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .symptom-info h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .symptom-category {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .symptom-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .severity-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .symptom-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .symptom-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .tracker-content {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .tracker-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default SymptomTracker