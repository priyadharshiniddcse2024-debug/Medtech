import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api'

// For demo purposes, we'll use a mock token or no authentication
// In a real app, you'd handle authentication properly
axios.defaults.headers.common['Authorization'] = 'Bearer demo-token'

export default axios