import api from './axios'

// Wrap api calls
export const getCases = () => api.get('/cases')
export const getCase = (id) => api.get(`/cases/${id}`)
export const createCase = (data) => api.post('/cases', data)
export const updateCase = (id, data) => api.put(`/cases/${id}`, data)
export const deleteCase = (id) => api.delete(`/cases/${id}`)