import axios from 'axios'
import { STORAGE_KEYS, readValue } from './storage'

// For demo purposes the API accepts a mock token when no user is signed in
export const DEMO_TOKEN = 'demo-token'

export const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

axios.defaults.baseURL = API_BASE_URL

export const setAuthToken = (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearAuthToken = () => {
  delete axios.defaults.headers.common['Authorization']
}

setAuthToken(readValue(STORAGE_KEYS.token) || DEMO_TOKEN)

export default axios
