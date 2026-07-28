import React, { createContext, useContext, useState, useEffect } from 'react'
import axios, { clearAuthToken, setAuthToken } from '../utils/api'
import { STORAGE_KEYS, readJSON, removeValues, readValue, writeJSON, writeValue } from '../utils/storage'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const persistSession = (token, user) => {
  writeValue(STORAGE_KEYS.token, token)
  writeJSON(STORAGE_KEYS.user, user)
  setAuthToken(token)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const token = readValue(STORAGE_KEYS.token)
    const userData = readJSON(STORAGE_KEYS.user)
    
    if (token && userData) {
      setUser(userData)
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password })
      const { token, user_id, name } = response.data
      const loggedInUser = { id: user_id, name, email }
      
      persistSession(token, loggedInUser)
      setUser(loggedInUser)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/register', userData)
      const { token, user_id } = response.data
      const registeredUser = { id: user_id, name: userData.name, email: userData.email }
      
      persistSession(token, registeredUser)
      setUser(registeredUser)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    removeValues(STORAGE_KEYS.token, STORAGE_KEYS.user)
    clearAuthToken()
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}