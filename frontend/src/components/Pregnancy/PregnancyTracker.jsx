import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Baby, 
  Calendar, 
  Heart, 
  Apple, 
  Activity, 
  AlertTriangle,
  Stethoscope,
  Lightbulb,
  Plus,
  Clock
} from 'lucide-react'
import { format, addDays } from 'date-fns'

const PregnancyTracker = () => {
  const [pregnancyProfile, setPregnancyProfile] = useState(null)
  const [weeklyGuidance, setWeeklyGuidance] = useState(null)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [formData, setFormData] = useState({
    last_menstrual_period: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard')
      const profile = response.data.pregnancy_profile
      
      if (profile && profile.current_week) {
        setPregnancyProfile(profile)
        fetchWeeklyGuidance(profile.current_week)
      } else {
        setShowProfileForm(true)
      }
    } catch (error) {
      setError('Failed to load pregnancy data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyGuidance = async (week) => {
    try {
      const response = await axios.get(`/pregnancy-guidance/${week}`)
      setWeeklyGuidance(response.data)
    } catch (error) {
      console.error('Failed to load weekly guidance:', error)
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/pregnancy-profile', formData)
      
      // Refresh dashboard data to get the new profile
      await fetchDashboardData()
      setShowProfileForm(false)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create pregnancy profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const getWeekDescription = (week) => {
    if (week <= 12) return "First Trimester"
    if (week <= 28) return "Second Trimester"
    return "Third Trimester"
  }

  const getProgressPercentage = (week) => {
    return Math.min((week / 40) * 100, 100)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="pulse">Loading pregnancy tracker...</div>
      </div>
    )
  }

  if (showProfileForm) {
    return (
      <div className="pregnancy-tracker fade-in">
        <div className="profile-form-container">
          <div className="profile-header">
            <Baby className="profile-icon" />
            <h1>Set Up Your Pregnancy Profile</h1>
            <p>Track your pregnancy journey with personalized weekly guidance</p>
          </div>

          {error && (
            <div className="error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleCreateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="last_menstrual_period" className="form-label">
                <Calendar size={16} />
                Last Menstrual Period (LMP) Date
              </label>
              <input
                type="date"
                id="last_menstrual_period"
                name="last_menstrual_period"
                value={formData.last_menstrual_period}
                onChange={handleChange}
                className="form-input"
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
              <small className="form-help">
                This helps calculate your current pregnancy week and due date
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Create Pregnancy Profile'}
            </button>
          </form>
        </div>

        <style jsx>{`
          .profile-form-container {
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
          }

          .profile-header {
            margin-bottom: 2rem;
          }

          .profile-icon {
            width: 64px;
            height: 64px;
            color: var(--primary-color);
            margin-bottom: 1rem;
          }

          .profile-header h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
          }

          .profile-header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
          }

          .profile-form {
            background: var(--surface-color);
            padding: 2rem;
            border-radius: 16px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            text-align: left;
          }

          .form-help {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="pregnancy-tracker fade-in">
      <div className="tracker-header">
        <h1>Pregnancy Tracker</h1>
        <p>Your personalized pregnancy journey guide</p>
      </div>

      {/* Pregnancy Progress */}
      <div className="pregnancy-progress">
        <div className="progress-info">
          <div className="current-week">
            <span className="week-number">{pregnancyProfile?.current_week}</span>
            <span className="week-label">Weeks</span>
          </div>
          <div className="progress-details">
            <h2>{getWeekDescription(pregnancyProfile?.current_week)}</h2>
            <p>Due Date: {format(new Date(pregnancyProfile?.expected_due_date), 'MMMM dd, yyyy')}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage(pregnancyProfile?.current_week)}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {getProgressPercentage(pregnancyProfile?.current_week).toFixed(0)}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Guidance */}
      {weeklyGuidance && (
        <div className="weekly-guidance">
          <div className="guidance-header">
            <h2>{weeklyGuidance.title}</h2>
          </div>

          <div className="guidance-grid">
            <div className="guidance-card">
              <div className="card-header">
                <Baby className="card-icon" />
                <h3>Fetal Development</h3>
              </div>
              <p>{weeklyGuidance.fetal_development}</p>
            </div>

            <div className="guidance-card">
              <div className="card-header">
                <Heart className="card-icon" />
                <h3>Maternal Changes</h3>
              </div>
              <p>{weeklyGuidance.maternal_changes}</p>
            </div>

            <div className="guidance-card">
              <div className="card-header">
                <Apple className="card-icon" />
                <h3>Nutrition</h3>
              </div>
              <p>{weeklyGuidance.nutrition}</p>
            </div>

            <div className="guidance-card">
              <div className="card-header">
                <Activity className="card-icon" />
                <h3>Exercise</h3>
              </div>
              <p>{weeklyGuidance.exercise}</p>
            </div>

            <div className="guidance-card warning">
              <div className="card-header">
                <AlertTriangle className="card-icon" />
                <h3>Warning Signs</h3>
              </div>
              <p>{weeklyGuidance.warning_signs}</p>
            </div>

            <div className="guidance-card">
              <div className="card-header">
                <Stethoscope className="card-icon" />
                <h3>Checkups</h3>
              </div>
              <p>{weeklyGuidance.checkups}</p>
            </div>
          </div>

          {weeklyGuidance.tips && (
            <div className="tips-section">
              <div className="tips-header">
                <Lightbulb className="tips-icon" />
                <h3>Weekly Tips</h3>
              </div>
              <p className="tips-content">{weeklyGuidance.tips}</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          onClick={() => setShowProfileForm(true)}
          className="btn btn-outline"
        >
          <Plus size={16} />
          Update Profile
        </button>
        <button 
          onClick={() => fetchWeeklyGuidance(pregnancyProfile?.current_week)}
          className="btn btn-secondary"
        >
          <Clock size={16} />
          Refresh Guidance
        </button>
      </div>

      <style jsx>{`
        .pregnancy-tracker {
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

        .pregnancy-progress {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .current-week {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .week-number {
          font-size: 4rem;
          font-weight: 700;
          line-height: 1;
        }

        .week-label {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .progress-details {
          flex: 1;
        }

        .progress-details h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .progress-details p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 1rem;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          background: white;
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .weekly-guidance {
          margin-bottom: 2rem;
        }

        .guidance-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .guidance-header h2 {
          font-size: 2rem;
          color: var(--primary-color);
        }

        .guidance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .guidance-card {
          background: var(--surface-color);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .guidance-card.warning {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .card-icon {
          color: var(--primary-color);
          width: 20px;
          height: 20px;
        }

        .guidance-card.warning .card-icon {
          color: var(--danger-color);
        }

        .card-header h3 {
          color: var(--text-primary);
          font-size: 1.1rem;
          margin: 0;
        }

        .guidance-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .tips-section {
          background: var(--background-color);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .tips-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .tips-icon {
          color: var(--accent-color);
          width: 20px;
          height: 20px;
        }

        .tips-header h3 {
          color: var(--text-primary);
          margin: 0;
        }

        .tips-content {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .tracker-header h1 {
            font-size: 2rem;
          }
          
          .progress-info {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .guidance-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default PregnancyTracker