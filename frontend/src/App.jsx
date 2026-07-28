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
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

const RequireAuth = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const AppShell = ({ children }) => (
  <div className="app">
    <div className="app-layout">
      <Navigation />
      <main className="main-content">{children}</main>
    </div>
  </div>
)

const protectedRoutes = [
  ['/dashboard', <Dashboard />],
  ['/health-entry', <EnhancedHealthEntry />],
  ['/pregnancy-tracker', <PregnancyTracker />],
  ['/symptoms', <SymptomTracker />],
  ['/analytics', <AdvancedDashboard />],
  ['/emergency', <EmergencyContacts />],
  ['/medical', <MedicalManager />],
]

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {protectedRoutes.map(([path, element]) => (
            <Route
              key={path}
              path={path}
              element={<RequireAuth><AppShell>{element}</AppShell></RequireAuth>}
            />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
