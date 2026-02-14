import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import axios from '../../utils/api'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Droplets, 
  Weight,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
  Zap,
  Shield
} from 'lucide-react'

const AdvancedDashboard = () => {
  const [healthData, setHealthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [timeRange, setTimeRange] = useState('30')

  // Sample data for demonstration
  const sampleHealthData = [
    { date: '2024-01-01', systolic_bp: 118, diastolic_bp: 78, blood_sugar: 92, body_weight: 65.2, hemoglobin: 12.1, risk_level: 'Normal' },
    { date: '2024-01-08', systolic_bp: 122, diastolic_bp: 82, blood_sugar: 95, body_weight: 65.8, hemoglobin: 12.0, risk_level: 'Normal' },
    { date: '2024-01-15', systolic_bp: 125, diastolic_bp: 85, blood_sugar: 98, body_weight: 66.5, hemoglobin: 11.8, risk_level: 'Medium' },
    { date: '2024-01-22', systolic_bp: 128, diastolic_bp: 88, blood_sugar: 102, body_weight: 67.2, hemoglobin: 11.6, risk_level: 'Medium' },
    { date: '2024-01-29', systolic_bp: 120, diastolic_bp: 80, blood_sugar: 89, body_weight: 67.8, hemoglobin: 11.9, risk_level: 'Normal' },
    { date: '2024-02-05', systolic_bp: 119, diastolic_bp: 79, blood_sugar: 91, body_weight: 68.1, hemoglobin: 12.2, risk_level: 'Normal' }
  ]

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async () => {
    try {
      // For demo purposes, use sample data
      setHealthData(sampleHealthData)
    } catch (error) {
      console.error('Error fetching health data:', error)
      setHealthData(sampleHealthData)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'normal': return '#48bb78'
      case 'medium': return '#ed8936'
      case 'high': return '#f56565'
      default: return '#718096'
    }
  }

  const calculateTrend = (data, metric) => {
    if (data.length < 2) return 0
    const latest = data[data.length - 1][metric]
    const previous = data[data.length - 2][metric]
    return ((latest - previous) / previous * 100).toFixed(1)
  }

  const getMetricStats = () => {
    if (healthData.length === 0) return {}
    
    const latest = healthData[healthData.length - 1]
    return {
      systolic_bp: {
        value: latest.systolic_bp,
        trend: calculateTrend(healthData, 'systolic_bp'),
        unit: 'mmHg',
        label: 'Systolic BP',
        icon: Heart,
        color: '#667eea'
      },
      diastolic_bp: {
        value: latest.diastolic_bp,
        trend: calculateTrend(healthData, 'diastolic_bp'),
        unit: 'mmHg',
        label: 'Diastolic BP',
        icon: Heart,
        color: '#764ba2'
      },
      blood_sugar: {
        value: latest.blood_sugar,
        trend: calculateTrend(healthData, 'blood_sugar'),
        unit: 'mg/dL',
        label: 'Blood Sugar',
        icon: Droplets,
        color: '#48bb78'
      },
      body_weight: {
        value: latest.body_weight,
        trend: calculateTrend(healthData, 'body_weight'),
        unit: 'kg',
        label: 'Weight',
        icon: Weight,
        color: '#ed8936'
      },
      hemoglobin: {
        value: latest.hemoglobin,
        trend: calculateTrend(healthData, 'hemoglobin'),
        unit: 'g/dL',
        label: 'Hemoglobin',
        icon: Activity,
        color: '#f56565'
      }
    }
  }

  const riskDistribution = healthData.reduce((acc, record) => {
    acc[record.risk_level] = (acc[record.risk_level] || 0) + 1
    return acc
  }, {})

  const riskPieData = Object.entries(riskDistribution).map(([risk, count]) => ({
    name: risk,
    value: count,
    color: getRiskColor(risk)
  }))

  const metricStats = getMetricStats()

  if (loading) {
    return (
      <div className="loading">
        <div className="pulse">Loading analytics dashboard...</div>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Advanced Health Analytics</h1>
        <p>Comprehensive insights into your pregnancy health journey</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        {Object.entries(metricStats).map(([key, metric]) => {
          const Icon = metric.icon
          const isPositiveTrend = parseFloat(metric.trend) > 0
          
          return (
            <motion.div
              key={key}
              className="metric-card"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="metric-header">
                <div 
                  className="metric-icon"
                  style={{ backgroundColor: metric.color + '20' }}
                >
                  <Icon size={20} style={{ color: metric.color }} />
                </div>
                <div className="metric-trend">
                  {isPositiveTrend ? (
                    <TrendingUp size={16} style={{ color: '#48bb78' }} />
                  ) : (
                    <TrendingDown size={16} style={{ color: '#f56565' }} />
                  )}
                  <span style={{ color: isPositiveTrend ? '#48bb78' : '#f56565' }}>
                    {Math.abs(metric.trend)}%
                  </span>
                </div>
              </div>
              <div className="metric-value">
                {metric.value} <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-label">{metric.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="medical-card">
            <div className="chart-header">
              <h2>
                <BarChart3 size={20} />
                Health Parameters Trend
              </h2>
              <div className="chart-controls">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="chart-select"
                >
                  <option value="all">All Metrics</option>
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="blood_sugar">Blood Sugar</option>
                  <option value="body_weight">Weight</option>
                  <option value="hemoglobin">Hemoglobin</option>
                </select>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                {(selectedMetric === 'all' || selectedMetric === 'blood_pressure') && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="systolic_bp" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      name="Systolic BP"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic_bp" 
                      stroke="#764ba2" 
                      strokeWidth={2}
                      name="Diastolic BP"
                    />
                  </>
                )}
                {(selectedMetric === 'all' || selectedMetric === 'blood_sugar') && (
                  <Line 
                    type="monotone" 
                    dataKey="blood_sugar" 
                    stroke="#48bb78" 
                    strokeWidth={2}
                    name="Blood Sugar"
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'body_weight') && (
                  <Line 
                    type="monotone" 
                    dataKey="body_weight" 
                    stroke="#ed8936" 
                    strokeWidth={2}
                    name="Weight"
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'hemoglobin') && (
                  <Line 
                    type="monotone" 
                    dataKey="hemoglobin" 
                    stroke="#f56565" 
                    strokeWidth={2}
                    name="Hemoglobin"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="medical-card">
            <h2>
              <PieChartIcon size={20} />
              Risk Level Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Insights */}
      <div className="insights-section">
        <div className="medical-card">
          <h2>
            <Target size={20} />
            Health Insights & Recommendations
          </h2>
          
          <div className="insights-grid">
            <div className="insight-card positive">
              <CheckCircle size={20} />
              <div>
                <h4>Stable Blood Pressure</h4>
                <p>Your blood pressure readings have been within normal ranges consistently.</p>
              </div>
            </div>
            
            <div className="insight-card warning">
              <AlertTriangle size={20} />
              <div>
                <h4>Monitor Weight Gain</h4>
                <p>Weight gain is slightly above recommended rate. Discuss with your healthcare provider.</p>
              </div>
            </div>
            
            <div className="insight-card positive">
              <Shield size={20} />
              <div>
                <h4>Good Hemoglobin Levels</h4>
                <p>Your hemoglobin levels indicate healthy iron status during pregnancy.</p>
              </div>
            </div>
            
            <div className="insight-card info">
              <Zap size={20} />
              <div>
                <h4>Blood Sugar Trending</h4>
                <p>Recent blood sugar readings show improvement with dietary changes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
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

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: var(--surface-color);
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .metric-unit {
          font-size: 1rem;
          font-weight: 400;
          color: var(--text-secondary);
        }

        .metric-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          width: 100%;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .chart-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--surface-color);
          color: var(--text-primary);
        }

        .insights-section {
          margin-bottom: 2rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid;
        }

        .insight-card.positive {
          background: rgba(72, 187, 120, 0.1);
          border-color: rgba(72, 187, 120, 0.3);
          color: #2f855a;
        }

        .insight-card.warning {
          background: rgba(237, 137, 54, 0.1);
          border-color: rgba(237, 137, 54, 0.3);
          color: #c05621;
        }

        .insight-card.info {
          background: rgba(66, 153, 225, 0.1);
          border-color: rgba(66, 153, 225, 0.3);
          color: #2c5282;
        }

        .insight-card h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .insight-card p {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .dashboard-header h1 {
            font-size: 2rem;
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  )
}

export default AdvancedDashboard