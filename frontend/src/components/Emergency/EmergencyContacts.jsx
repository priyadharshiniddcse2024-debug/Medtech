import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../utils/api'
import { 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Ambulance,
  Hospital,
  User,
  Plus,
  Edit,
  Trash2,
  Star,
  Shield
} from 'lucide-react'

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyCallInfo, setEmergencyCallInfo] = useState(null)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    type: 'personal',
    address: '',
    notes: ''
  })

  // Default emergency contacts
  const defaultContacts = [
    {
      id: 1,
      name: 'Emergency Services',
      phone: '911',
      relationship: 'Emergency',
      type: 'emergency',
      address: 'Nationwide',
      notes: 'For life-threatening emergencies',
      icon: Ambulance,
      color: '#f56565'
    },
    {
      id: 2,
      name: 'Maternal Emergency Hotline',
      phone: '1-800-MATERNAL',
      relationship: 'Medical Support',
      type: 'medical',
      address: 'National Hotline',
      notes: '24/7 pregnancy emergency support',
      icon: Heart,
      color: '#ed8936'
    },
    {
      id: 3,
      name: 'Local Hospital - Maternity Ward',
      phone: '(555) 123-4567',
      relationship: 'Hospital',
      type: 'medical',
      address: '123 Medical Center Dr',
      notes: 'Primary delivery hospital',
      icon: Hospital,
      color: '#48bb78'
    },
    {
      id: 4,
      name: 'Dr. Sarah Johnson - OB/GYN',
      phone: '(555) 987-6543',
      relationship: 'Primary Care',
      type: 'medical',
      address: '456 Healthcare Plaza',
      notes: 'Primary pregnancy care provider',
      icon: User,
      color: '#667eea'
    }
  ]

  useEffect(() => {
    setContacts(defaultContacts)
  }, [])

  const handleAddContact = (e) => {
    e.preventDefault()
    const contact = {
      ...newContact,
      id: Date.now(),
      icon: User,
      color: '#718096'
    }
    setContacts([...contacts, contact])
    setNewContact({
      name: '',
      phone: '',
      relationship: '',
      type: 'personal',
      address: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const handleCall = async (phone, contactName = '', callType = 'emergency') => {
    try {
      // Get user's location if available
      let location = 'Unknown'
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          })
          location = `${position.coords.latitude}, ${position.coords.longitude}`
        } catch (error) {
          console.log('Location access denied')
        }
      }

      // Log the emergency call
      const callData = {
        contact_name: contactName,
        phone_number: phone,
        call_type: callType,
        location: location
      }

      const response = await axios.post('/emergency-call', callData)
      
      if (response.data.success) {
        // Show emergency call modal
        setEmergencyCallInfo({
          ...callData,
          instructions: response.data.instructions,
          timestamp: new Date().toISOString()
        })
        setShowEmergencyModal(true)
      }

      // Initiate the actual call
      window.location.href = `tel:${phone}`
      
    } catch (error) {
      console.error('Emergency call logging failed:', error)
      // Still make the call even if logging fails
      window.location.href = `tel:${phone}`
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency': return '#f56565'
      case 'medical': return '#48bb78'
      case 'personal': return '#667eea'
      default: return '#718096'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'emergency': return 'Emergency'
      case 'medical': return 'Medical'
      case 'personal': return 'Personal'
      default: return 'Other'
    }
  }

  const emergencyGuidelines = [
    {
      title: 'When to Call 911 Immediately',
      items: [
        'Severe bleeding or hemorrhaging',
        'Severe abdominal or chest pain',
        'Difficulty breathing or shortness of breath',
        'Loss of consciousness or fainting',
        'Severe headache with vision changes',
        'Signs of stroke (face drooping, arm weakness, speech difficulty)'
      ],
      color: '#f56565',
      icon: AlertTriangle
    },
    {
      title: 'When to Call Your Doctor',
      items: [
        'Regular contractions before 37 weeks',
        'Decreased fetal movement',
        'Persistent nausea and vomiting',
        'Signs of preeclampsia (swelling, headaches)',
        'Unusual vaginal discharge or bleeding',
        'Fever over 101°F (38.3°C)'
      ],
      color: '#ed8936',
      icon: Phone
    },
    {
      title: 'Hospital Emergency Department',
      items: [
        'Water breaking before 37 weeks',
        'Heavy bleeding with clots',
        'Severe pelvic pressure',
        'Continuous severe cramping',
        'Signs of infection',
        'Any concern about baby\'s wellbeing'
      ],
      color: '#48bb78',
      icon: Hospital
    }
  ]

  return (
    <div className="emergency-contacts">
      <div className="emergency-header">
        <h1>Emergency Contacts</h1>
        <p>Quick access to critical contacts and emergency guidelines</p>
      </div>

      {/* Emergency Guidelines */}
      <div className="guidelines-section">
        <h2>
          <Shield size={20} />
          Emergency Guidelines
        </h2>
        <div className="guidelines-grid">
          {emergencyGuidelines.map((guideline, index) => {
            const Icon = guideline.icon
            return (
              <div key={index} className="guideline-card">
                <div className="guideline-header">
                  <div 
                    className="guideline-icon"
                    style={{ backgroundColor: guideline.color + '20' }}
                  >
                    <Icon size={20} style={{ color: guideline.color }} />
                  </div>
                  <h3>{guideline.title}</h3>
                </div>
                <ul className="guideline-list">
                  {guideline.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Emergency Actions */}
      <div className="quick-actions">
        <h2>Quick Emergency Actions</h2>
        <div className="action-buttons">
          <button 
            onClick={() => handleCall('911', 'Emergency Services', 'critical')}
            className="emergency-btn critical"
          >
            <Ambulance size={20} />
            Call 911
          </button>
          <button 
            onClick={() => handleCall('1-800-MATERNAL', 'Maternal Hotline', 'medical')}
            className="emergency-btn medical"
          >
            <Heart size={20} />
            Maternal Hotline
          </button>
          <button 
            onClick={() => handleCall('(555) 123-4567', 'Hospital', 'medical')}
            className="emergency-btn hospital"
          >
            <Hospital size={20} />
            Hospital
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="contacts-section">
        <div className="contacts-header">
          <h2>Emergency Contacts</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

        <div className="contacts-grid">
          <AnimatePresence>
            {contacts.map((contact) => {
              const Icon = contact.icon
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="contact-card"
                >
                  <div className="contact-header">
                    <div 
                      className="contact-icon"
                      style={{ backgroundColor: contact.color + '20' }}
                    >
                      <Icon size={20} style={{ color: contact.color }} />
                    </div>
                    <div 
                      className="contact-type"
                      style={{ 
                        backgroundColor: getTypeColor(contact.type) + '20',
                        color: getTypeColor(contact.type)
                      }}
                    >
                      {getTypeLabel(contact.type)}
                    </div>
                  </div>
                  
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <p className="contact-relationship">{contact.relationship}</p>
                    
                    <div className="contact-details">
                      <div className="contact-detail">
                        <Phone size={14} />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.address && (
                        <div className="contact-detail">
                          <MapPin size={14} />
                          <span>{contact.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {contact.notes && (
                      <p className="contact-notes">{contact.notes}</p>
                    )}
                  </div>
                  
                  <div className="contact-actions">
                    <button 
                      onClick={() => handleCall(contact.phone, contact.name, contact.type)}
                      className="btn btn-primary contact-call-btn"
                    >
                      <Phone size={16} />
                      Call
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Emergency Call Modal */}
      <AnimatePresence>
        {showEmergencyModal && emergencyCallInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay emergency-modal"
            onClick={() => setShowEmergencyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content emergency-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="emergency-modal-header">
                <AlertTriangle size={32} color="#f56565" />
                <h3>Emergency Call Initiated</h3>
              </div>
              
              <div className="emergency-call-details">
                <p><strong>Contact:</strong> {emergencyCallInfo.contact_name}</p>
                <p><strong>Phone:</strong> {emergencyCallInfo.phone_number}</p>
                <p><strong>Time:</strong> {new Date(emergencyCallInfo.timestamp).toLocaleString()}</p>
                <p><strong>Location:</strong> {emergencyCallInfo.location}</p>
              </div>
              
              <div className="emergency-instructions">
                <h4>Emergency Instructions:</h4>
                <ul>
                  {emergencyCallInfo.instructions?.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
              
              <div className="emergency-actions">
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleCall(emergencyCallInfo.phone_number, emergencyCallInfo.contact_name)}
                  className="btn btn-danger"
                >
                  <Phone size={16} />
                  Call Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Add Emergency Contact</h3>
              <form onSubmit={handleAddContact} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={newContact.type}
                      onChange={(e) => setNewContact({...newContact, type: e.target.value})}
                      className="form-input"
                    >
                      <option value="personal">Personal</option>
                      <option value="medical">Medical</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Spouse, Doctor, Friend"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Address (Optional)</label>
                  <input
                    type="text"
                    value={newContact.address}
                    onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    className="form-input"
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .emergency-contacts {
          max-width: 1200px;
          margin: 0 auto;
        }

        .emergency-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .emergency-header h1 {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .emergency-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .guidelines-section {
          margin-bottom: 2rem;
        }

        .guidelines-section h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .guidelines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .guideline-card {
          background: var(--surface-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .guideline-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .guideline-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .guideline-header h3 {
          color: var(--text-primary);
          margin: 0;
        }

        .guideline-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .guideline-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .guideline-list li:last-child {
          border-bottom: none;
        }

        .quick-actions {
          margin-bottom: 2rem;
        }

        .quick-actions h2 {
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .emergency-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .emergency-btn.critical {
          background: #f56565;
          color: white;
        }

        .emergency-btn.medical {
          background: #ed8936;
          color: white;
        }

        .emergency-btn.hospital {
          background: #48bb78;
          color: white;
        }

        .emergency-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .contacts-section {
          margin-bottom: 2rem;
        }

        .contacts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .contacts-header h2 {
          color: var(--primary-color);
          margin: 0;
        }

        .contacts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .contact-card {
          background: var(--surface-color);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }

        .contact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .contact-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contact-type {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .contact-info h3 {
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .contact-relationship {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .contact-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .contact-notes {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-style: italic;
          margin: 0 0 1rem 0;
        }

        .contact-actions {
          display: flex;
          gap: 0.5rem;
        }

        .contact-call-btn {
          flex: 1;
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          color: var(--primary-color);
          margin: 0 0 1.5rem 0;
        }

        .contact-form {
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
          .emergency-header h1 {
            font-size: 2rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .contacts-header {
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

          .emergency-modal-content {
            max-width: 600px;
            background: #fff;
            border: 3px solid #f56565;
          }

          .emergency-modal-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f56565;
          }

          .emergency-modal-header h3 {
            color: #f56565;
            margin: 0;
            font-size: 1.5rem;
          }

          .emergency-call-details {
            background: #fee2e2;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            border: 1px solid #fecaca;
          }

          .emergency-call-details p {
            margin: 0.5rem 0;
            color: #991b1b;
          }

          .emergency-instructions {
            margin-bottom: 1.5rem;
          }

          .emergency-instructions h4 {
            color: #f56565;
            margin-bottom: 0.75rem;
          }

          .emergency-instructions ul {
            list-style: none;
            padding: 0;
          }

          .emergency-instructions li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }

          .emergency-instructions li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 0.5rem;
          }

          .emergency-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
          }

          .btn-danger {
            background: #f56565;
            color: white;
            border: none;
          }

          .btn-danger:hover {
            background: #e53e3e;
          }
        }
      `}</style>
    </div>
  )
}

export default EmergencyContacts