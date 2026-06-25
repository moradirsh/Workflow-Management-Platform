import axios from 'axios'

// Adjust axios to point to vites /api when necessary, otherwise in production point to render url
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api',
  withCredentials: true // send cookies automatically
})


// Forces return to login page when catching 401 err returned by backend
api.interceptors.response.use((response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoginRequest) {
      window.dispatchEvent(new Event("auth:unauthorized"))
    }
    return Promise.reject(error) // return the error for debugging purposes
  }
)

export default api