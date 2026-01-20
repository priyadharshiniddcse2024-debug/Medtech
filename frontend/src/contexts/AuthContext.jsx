import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password })
      const { token, user_id, name } = response.data
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({ id: user_id, name, email }))
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update user state
      setUser({ id: user_id, name, email })
      
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
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({ 
        id: user_id, 
        name: userData.name, 
        email: userData.email 
      }))
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update user state
      setUser({ id: user_id, name: userData.name, email: userData.email })
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
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