import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})


// Forces return to login page when catching 401 err returned by backend
api.interceptors.response.use((response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config.url.includes('/users/login') // Prevents redirection on incorrect credentials when logging in
      if (!isLoginRequest) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error) // return the error for debugging purposes
  }
)

// Auto attach JWT token to each request so backend knows user is authenticated each time
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

export default api