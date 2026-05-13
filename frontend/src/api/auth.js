import api from './axios'

// Wrap 
export const login = (data) => api.post('/users/login', data)
export const register = (data) => api.post('/users/register', data)