import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboard'
import EnhancedHealthEntry from './components/Health/EnhancedHealthEntry'
import PregnancyTracker from './components/Pregnancy/PregnancyTracker'
import SymptomTracker from './components/Symptoms/SymptomTracker'
import AdvancedDashboard from './components/Analytics/AdvancedDashboard'
import EmergencyContacts from './components/Emergency/EmergencyContacts'
import MedicalManager from './components/Medical/MedicalManager'
import Navigation from './components/Layout/Navigation'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <div className="app-layout">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/health-entry" element={<EnhancedHealthEntry />} />
              <Route path="/pregnancy-tracker" element={<PregnancyTracker />} />
              <Route path="/symptoms" element={<SymptomTracker />} />
              <Route path="/analytics" element={<AdvancedDashboard />} />
              <Route path="/emergency" element={<EmergencyContacts />} />
              <Route path="/medical" element={<MedicalManager />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
