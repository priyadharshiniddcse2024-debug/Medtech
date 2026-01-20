import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './components/Dashboard/Dashboard'
import HealthEntry from './components/Health/HealthEntry'
import PregnancyTracker from './components/Pregnancy/PregnancyTracker'
import Navigation from './components/Layout/Navigation'
import './App.css'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Navigation />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/health-entry" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Navigation />
                  <main className="main-content">
                    <HealthEntry />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/pregnancy-tracker" element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Navigation />
                  <main className="main-content">
                    <PregnancyTracker />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
