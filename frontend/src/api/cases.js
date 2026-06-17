import api from './axios'

// Wrap api calls
export const getCases = (assignedToMe = false, search = "", priority = "", status = "", groupIds = [], roleIds = []) => api.get(`/cases?assigned_to_me=${assignedToMe}${search ? `&search=${search}` : ""}${priority ? `&priority=${priority}` : ""}${status ? `&status=${status}` : ""}${groupIds.map(id => `&group_id=${id}`).join('')}${roleIds.map(id => `&custom_role_id=${id}`).join('')}`)
export const getCase = (id) => api.get(`/cases/${id}`)
export const archiveCase = (id) => api.put(`/archive/${id}`)
export const getArchivedCases = () => api.get('/archive')
export const createCase = (data, file = null) => {

    // Use FormData since we now support file uploads
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.priority) formData.append('priority', data.priority)
    if (data.assignee_id) formData.append('assignee_id', data.assignee_id)
    if (file) formData.append('file', file)
    if (data.group_id) formData.append('group_id', data.group_id)
    if (data.custom_role_id) formData.append('custom_role_id', data.custom_role_id)
    
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
export const exportCases = (assignedToMe = false, search = "", priority = "", status = "", groupIds = [], roleIds = []) => api.get(`/cases/export/csv?assigned_to_me=${assignedToMe}${search ? `&search=${search}` : ""}${priority ? `&priority=${priority}` : ""}${status ? `&status=${status}` : ""}${groupIds.length > 0 ? groupIds.map(id => `&group_id=${id}`).join('') : ""}${roleIds.length > 0 ? roleIds.map(id => `&custom_role_id=${id}`).join('') : ""}`, {responseType: 'blob'})
export const getGroups = () => api.get('/groups')
export const getCustomRoles = () => api.get('/custom-roles')
