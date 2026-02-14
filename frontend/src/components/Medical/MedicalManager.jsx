import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import axios from '../../utils/api'
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Activity,
  Stethoscope,
  Pill,
  TestTube,
  User,
  Clock,
  Star,
  AlertCircle,
  Phone,
  Hospital,
  Ambulance
} from 'lucide-react'

const MedicalManager = () => {
  const [records, setRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [newRecord, setNewRecord] = useState({
    title: '',
    type: 'checkup',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    notes: '',
    attachments: []
  })

  // Sample medical records
  const sampleRecords = [
    {
      id: 1,
      title: 'First Prenatal Checkup',
      type: 'checkup',
      date: '2024-01-15',
      provider: 'Dr. Sarah Johnson',
      notes: 'Initial pregnancy confirmation. All vitals normal. Prescribed prenatal vitamins.',
      attachments: ['blood_test_results.pdf'],
      icon: Stethoscope,
      color: '#667eea'
    },
    {
      id: 2,
      title: 'Blood Work Results',
      type: 'lab',
      date: '2024-01-20',
      provider: 'City Lab',
      notes: 'Complete blood count, glucose screening. Hemoglobin slightly low.',
      attachments: ['cbc_results.pdf'],
      icon: TestTube,
      color: '#f56565'
    },
    {
      id: 3,
      title: 'Ultrasound - 12 weeks',
      type: 'imaging',
      date: '2024-02-01',
      provider: 'Radiology Center',
      notes: 'First trimester ultrasound. Baby measuring on track. Heartbeat strong.',
      attachments: ['ultrasound_12weeks.jpg'],
      icon: Heart,
      color: '#48bb78'
    },
    {
      id: 4,
      title: 'Medication Review',
      type: 'medication',
      date: '2024-02-10',
      provider: 'Dr. Sarah Johnson',
      notes: 'Reviewed current medications. Added iron supplement for anemia.',
      attachments: [],
      icon: Pill,
      color: '#ed8936'
    }
  ]

  // Sample appointments
  const sampleAppointments = [
    {
      id: 1,
      title: 'Regular Checkup',
      date: '2024-02-15',
      time: '10:00 AM',
      provider: 'Dr. Sarah Johnson',
      type: 'checkup',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Anatomy Scan',
      date: '2024-02-20',
      time: '2:00 PM',
      provider: 'Radiology Center',
      type: 'imaging',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Glucose Tolerance Test',
      date: '2024-02-25',
      time: '9:00 AM',
      provider: 'City Lab',
      type: 'lab',
      status: 'scheduled'
    }
  ]

  useEffect(() => {
    setRecords(sampleRecords)
    setAppointments(sampleAppointments)
  }, [])

  const recordTypes = {
    checkup: { icon: Stethoscope, color: '#667eea', label: 'Checkup' },
    lab: { icon: TestTube, color: '#f56565', label: 'Lab Results' },
    imaging: { icon: Heart, color: '#48bb78', label: 'Imaging' },
    medication: { icon: Pill, color: '#ed8936', label: 'Medication' },
    other: { icon: FileText, color: '#718096', label: 'Other' }
  }

  const handleAddRecord = (e) => {
    e.preventDefault()
    const record = {
      ...newRecord,
      id: Date.now(),
      icon: recordTypes[newRecord.type].icon,
      color: recordTypes[newRecord.type].color,
      attachments: []
    }
    setRecords([record, ...records])
    setNewRecord({
      title: '',
      type: 'checkup',
      date: new Date().toISOString().split('T')[0],
      provider: '',
      notes: '',
      attachments: []
    })
    setShowAddRecord(false)
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || record.type === filterType
    return matchesSearch && matchesFilter
  })

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayAppointments = getAppointmentsForDate(date)
      if (dayAppointments.length > 0) {
        return (
          <div className="calendar-appointments">
            {dayAppointments.map(apt => (
              <div key={apt.id} className="calendar-appointment-dot" />
            ))}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="medical-manager">
      <div className="manager-header">
        <h1>Medical Records Manager</h1>
        <p>Organize and track your pregnancy medical information</p>
      </div>

      <div className="manager-content">
        {/* Left Column - Records */}
        <div className="records-section">
          <div className="section-header">
            <h2>
              <FileText size={20} />
              Medical Records
            </h2>
            <button 
              onClick={() => setShowAddRecord(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Record
            </button>
          </div>

          {/* Search and Filter */}
          <div className="records-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {Object.entries(recordTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Records List */}
          <div className="records-list">
            <AnimatePresence>
              {filteredRecords.map((record) => {
                const Icon = record.icon
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="record-card"
                  >
                    <div className="record-header">
                      <div className="record-info">
                        <div 
                          className="record-icon"
                          style={{ backgroundColor: record.color + '20' }}
                        >
                          <Icon size={16} style={{ color: record.color }} />
                        </div>
                        <div>
                          <h4>{record.title}</h4>
                          <span className="record-provider">{record.provider}</span>
                        </div>
                      </div>
                      <div className="record-meta">
                        <span className="record-date">
                          <Clock size={12} />
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <div 
                          className="record-type"
                          style={{ 
                            backgroundColor: record.color + '20',
                            color: record.color
                          }}
                        >
                          {recordTypes[record.type].label}
                        </div>
                      </div>
                    </div>
                    
                    <p className="record-notes">{record.notes}</p>
                    
                    {record.attachments.length > 0 && (
                      <div className="record-attachments">
                        <strong>Attachments:</strong>
                        {record.attachments.map((attachment, index) => (
                          <span key={index} className="attachment-link">
                            <FileText size={12} />
                            {attachment}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="record-actions">
                      <button className="action-btn">
                        <Eye size={14} />
                        View
                      </button>
                      <button className="action-btn">
                        <Edit size={14} />
                        Edit
                      </button>
                      <button className="action-btn">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Calendar & Appointments */}
        <div className="calendar-section">
          <div className="medical-card">
            <h2>
              <CalendarIcon size={20} />
              Appointment Calendar
            </h2>
            
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="medical-calendar"
              />
            </div>
            
            <div className="selected-date-appointments">
              <h3>
                Appointments for {selectedDate.toLocaleDateString()}
              </h3>
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="no-appointments">No appointments scheduled</p>
              ) : (
                <div className="appointments-list">
                  {getAppointmentsForDate(selectedDate).map(appointment => (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-time">{appointment.time}</div>
                      <div className="appointment-details">
                        <h4>{appointment.title}</h4>
                        <p>{appointment.provider}</p>
                      </div>
                      <div 
                        className="appointment-status"
                        style={{ 
                          backgroundColor: appointment.status === 'scheduled' ? '#48bb78' : '#ed8936',
                          color: 'white'
                        }}
                      >
                        {appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="medical-card">
            <h2>Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{records.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{appointments.length}</div>
                <div className="stat-label">Upcoming Appointments</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {records.filter(r => r.type === 'lab').length}
                </div>
                <div className="stat-label">Lab Results</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {records.filter(r => r.type === 'imaging').length}
                </div>
                <div className="stat-label">Imaging Studies</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="medical-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <button 
                onClick={() => window.location.href = 'tel:(555) 987-6543'}
                className="quick-action-btn doctor"
              >
                <Phone size={16} />
                Call Doctor
              </button>
              <button 
                onClick={() => window.location.href = 'tel:(555) 123-4567'}
                className="quick-action-btn hospital"
              >
                <Hospital size={16} />
                Call Hospital
              </button>
              <button 
                onClick={() => window.location.href = 'tel:911'}
                className="quick-action-btn emergency"
              >
                <Ambulance size={16} />
                Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showAddRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddRecord(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Add Medical Record</h3>
              <form onSubmit={handleAddRecord} className="record-form">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                      className="form-input"
                    >
                      {Object.entries(recordTypes).map(([key, type]) => (
                        <option key={key} value={key}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Healthcare Provider</label>
                  <input
                    type="text"
                    value={newRecord.provider}
                    onChange={(e) => setNewRecord({...newRecord, provider: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Dr. Smith, City Hospital"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    className="form-input"
                    rows="4"
                    placeholder="Record details, test results, recommendations..."
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddRecord(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Record
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .medical-manager {
          max-width: 1400px;
          margin: 0 auto;
        }

        .manager-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .manager-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .manager-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .manager-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          margin: 0;
        }

        .records-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--surface-color);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--surface-color);
          min-width: 150px;
        }

        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .record-card {
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .record-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .record-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .record-info h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .record-provider {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .record-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .record-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .record-type {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .record-notes {
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .record-attachments {
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: 0.5rem;
          color: var(--primary-color);
          cursor: pointer;
        }

        .record-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .calendar-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calendar-container {
          margin-bottom: 1.5rem;
        }

        .medical-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }

        .calendar-appointments {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin-top: 2px;
        }

        .calendar-appointment-dot {
          width: 4px;
          height: 4px;
          background: var(--primary-color);
          border-radius: 50%;
        }

        .selected-date-appointments h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .no-appointments {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .appointment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .appointment-time {
          font-weight: 600;
          color: var(--primary-color);
          min-width: 60px;
        }

        .appointment-details {
          flex: 1;
        }

        .appointment-details h4 {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .appointment-details p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .appointment-status {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: var(--background-color);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: white;
        }

        .quick-action-btn.doctor {
          background: #667eea;
        }

        .quick-action-btn.doctor:hover {
          background: #5a67d8;
        }

        .quick-action-btn.hospital {
          background: #48bb78;
        }

        .quick-action-btn.hospital:hover {
          background: #38a169;
        }

        .quick-action-btn.emergency {
          background: #f56565;
        }

        .quick-action-btn.emergency:hover {
          background: #e53e3e;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--surface-color);
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          color: var(--primary-color);
          margin: 0 0 1.5rem 0;
        }

        .record-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .manager-header h1 {
            font-size: 2rem;
          }
          
          .manager-content {
            grid-template-columns: 1fr;
          }
          
          .records-controls {
            flex-direction: column;
          }
          
          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

export default MedicalManager