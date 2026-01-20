import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  Activity, 
  Baby, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Plus,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', error)
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
      case 'high': return <AlertTriangle size={16} />
      default: return <Heart size={16} />
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="pulse">Loading your health dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    )
  }

  const { recent_records, pregnancy_profile } = dashboardData || {}
  const latestRecord = recent_records?.[0]

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Health Dashboard</h1>
        <p>Monitor your pregnancy journey with AI-powered insights</p>
      </div>

      {/* Pregnancy Status Card */}
      {pregnancy_profile ? (
        <div className="pregnancy-week">
          <h2>Week {pregnancy_profile.current_week}</h2>
          <p>
            Expected due date: {format(new Date(pregnancy_profile.expected_due_date), 'MMMM dd, yyyy')}
          </p>
        </div>
      ) : (
        <div className="medical-card">
          <h3>Set Up Your Pregnancy Profile</h3>
          <p>Track your pregnancy journey week by week with personalized guidance.</p>
          <Link to="/pregnancy-tracker" className="btn btn-primary">
            <Baby size={16} />
            Start Pregnancy Tracker
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/health-entry" className="action-card">
          <div className="action-icon">
            <Plus size={24} />
          </div>
          <div className="action-content">
            <h3>Add Health Record</h3>
            <p>Record your latest health parameters</p>
          </div>
        </Link>

        <Link to="/pregnancy-tracker" className="action-card">
          <div className="action-icon">
            <Calendar size={24} />
          </div>
          <div className="action-content">
            <h3>Pregnancy Guidance</h3>
            <p>Get week-specific recommendations</p>
          </div>
        </Link>
      </div>

      {/* Latest Health Record */}
      {latestRecord && (
        <div className="medical-card">
          <h2>Latest Health Assessment</h2>
          <div className="health-summary">
            <div className="risk-status">
              <div 
                className="risk-indicator"
                style={{ 
                  backgroundColor: getRiskColor(latestRecord.risk_level) + '20',
                  color: getRiskColor(latestRecord.risk_level),
                  border: `1px solid ${getRiskColor(latestRecord.risk_level)}30`
                }}
              >
                {getRiskIcon(latestRecord.risk_level)}
                {latestRecord.risk_level} Risk
              </div>
              <span className="record-date">
                <Clock size={14} />
                {format(new Date(latestRecord.recorded_at), 'MMM dd, yyyy')}
              </span>
            </div>

            <div className="health-metrics">
              <div className="metric-card">
                <div className="metric-value">
                  {latestRecord.systolic_bp}/{latestRecord.diastolic_bp}
                </div>
                <div className="metric-label">Blood Pressure (mmHg)</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">
                  {latestRecord.blood_sugar}
                </div>
                <div className="metric-label">Blood Sugar (mg/dL)</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">
                  {latestRecord.body_weight}
                </div>
                <div className="metric-label">Weight (kg)</div>
              </div>

              <div className="metric-card">
                <div className="metric-value">
                  {latestRecord.hemoglobin}
                </div>
                <div className="metric-label">Hemoglobin (g/dL)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Records History */}
      {recent_records && recent_records.length > 0 && (
        <div className="medical-card">
          <h2>Recent Health Records</h2>
          <div className="records-list">
            {recent_records.map((record, index) => (
              <div key={index} className="record-item">
                <div className="record-date">
                  {format(new Date(record.recorded_at), 'MMM dd')}
                </div>
                <div className="record-metrics">
                  <span>BP: {record.systolic_bp}/{record.diastolic_bp}</span>
                  <span>Sugar: {record.blood_sugar}</span>
                  <span>Weight: {record.body_weight}kg</span>
                </div>
                <div 
                  className="record-risk"
                  style={{ color: getRiskColor(record.risk_level) }}
                >
                  {record.risk_level}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Tips */}
      <div className="medical-card">
        <h2>Today's Health Tips</h2>
        <div className="health-tips">
          <div className="tip-item">
            <TrendingUp className="tip-icon" />
            <div>
              <h4>Stay Hydrated</h4>
              <p>Drink 8-10 glasses of water daily to support healthy pregnancy.</p>
            </div>
          </div>
          <div className="tip-item">
            <Activity className="tip-icon" />
            <div>
              <h4>Gentle Exercise</h4>
              <p>Take a 30-minute walk or try prenatal yoga for better health.</p>
            </div>
          </div>
          <div className="tip-item">
            <Heart className="tip-icon" />
            <div>
              <h4>Monitor Symptoms</h4>
              <p>Keep track of any unusual symptoms and discuss with your doctor.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--surface-color);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .action-icon {
          background: var(--primary-color);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-content h3 {
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .action-content p {
          color: var(--text-secondary);
          margin: 0;
        }

        .health-summary {
          margin-top: 1rem;
        }

        .risk-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .record-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .record-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .record-metrics {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .record-risk {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .health-tips {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .tip-icon {
          color: var(--secondary-color);
          margin-top: 0.25rem;
        }

        .tip-item h4 {
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .tip-item p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .dashboard-header h1 {
            font-size: 2rem;
          }
          
          .quick-actions {
            grid-template-columns: 1fr;
          }
          
          .record-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .record-metrics {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard