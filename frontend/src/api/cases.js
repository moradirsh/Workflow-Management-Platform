import api from './axios'

// Wrap api calls
export const getCases = (assignedToMe = false, search = "") => api.get(`/cases${assignedToMe ? "?assigned_to_me=true" : ""}${search ? `${assignedToMe ? "&" : "?"}search=${search}` : ""}`)
export const getCase = (id) => api.get(`/cases/${id}`)
export const createCase = (data, file = null) => {

    // Use FormData since we now support file uploads
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.priority) formData.append('priority', data.priority)
    if (data.assignee_id) formData.append('assignee_id', data.assignee_id)
    if (file) formData.append('file', file)
    
    return api.post('/cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
export const updateCase = (id, data) => api.put(`/cases/${id}`, data)
export const deleteCase = (id) => api.delete(`/cases/${id}`)
export const getUsers = () => api.get(`/users`)
export const getCaseActivity = (id) => api.get(`/cases/${id}/activity`)
export const downloadFile = (id) => api.get(`/cases/${id}/file`, {responseType: 'blob'})
export const getComments = (id) => api.get(`/cases/${id}/comments`)
export const addComment = (id, data) => api.post(`/cases/${id}/comments`, data)