import {useState, useEffect} from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import {toast} from "sonner"

export default function Users() {
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newUser, setNewUser] = useState({name: "", email: "", password: "", role: "member", group_id: "", custom_role_id: ""})
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({name: "", email: "", role: "member", new_password: "", group_id: "", custom_role_id: ""})
    const [groups, setGroups] = useState([])
    const [customRoles, setCustomRoles] = useState([])
    const [userGroupIds, setUserGroupIds] = useState([])
    const [userRoleIds, setUserRoleIds] = useState([])
    const [groupDropdownOpen, setGroupDropdownOpen] = useState(false)
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)

    // Fetch current user and all org users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, usersRes, groupsRes, customRolesRes] = await Promise.all([
                    api.get("/users/me"), api.get("/users"), api.get("/groups"), api.get("/custom-roles")
                ])
                setCurrentUser(meRes.data)
                setUsers(usersRes.data)
                setGroups(groupsRes.data)
                setCustomRoles(customRolesRes.data)
            } 
            catch (err) {
                console.error("Error fetching users:", err)
            } 
            finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error("All fields are required")
            return
        }
        try {
            const res = await api.post("/users/create", newUser)

        // Assign group if selected
        if (newUser.group_id) {
            await api.post(`/groups/${newUser.group_id}/members/${res.data.id}`)
        }

        // Assign custom role if selected
        if (newUser.custom_role_id) {
            await api.post(`/custom-roles/${newUser.custom_role_id}/users/${res.data.id}`)
        }
            setUsers([...users, res.data])
            setNewUser({name: "", email: "", password: "", role: "member", group_id: "", custom_role_id: ""})
            setShowForm(false)
            toast.success("User created successfully")
        } 
        catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                toast.error(detail[0]?.msg || "Failed to create user")
            } 
            else {
                toast.error(err.response?.data?.detail || "Failed to create user")
            }
        }
    }

    const handleEditUser = async () => {
    try {
        const payload = {name: editForm.name, email: editForm.email, role: editForm.role}
        if (editForm.new_password) {
            payload.password = editForm.new_password
        }
        
        // Update user info first
        const res = await api.put(`/users/${editingUser.id}`, payload)
        
        // Sync groups based on checkbox state
        await Promise.all(groups.map(async (group) => {
            const isChecked = userGroupIds.includes(group.id)
            try {
                if (isChecked) {
                    await api.post(`/groups/${group.id}/members/${editingUser.id}`)
                } else {
                    await api.delete(`/groups/${group.id}/members/${editingUser.id}`)
                }
            } 
            catch (err) {
                // Ignore 400 (already member) and 404 (not a member) errors
            }
        }))
        
        // Sync roles based on checkbox state
        await Promise.all(customRoles.map(async (role) => {
            const isChecked = userRoleIds.includes(role.id)
            try {
                if (isChecked) {
                    await api.post(`/custom-roles/${role.id}/users/${editingUser.id}`)
                } else {
                    await api.delete(`/custom-roles/${role.id}/users/${editingUser.id}`)
                }
            } 
            catch (err) {
                // Ignore 400 (already has role) and 404 (doesnt have role) errors
            }
        }))
        
        setUsers(users.map(u => u.id === editingUser.id ? res.data : u))
        setEditingUser(null)
        toast.success("User updated")
        } 
        catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                toast.error(detail[0]?.msg || "Failed to update user")
            } else {
                toast.error(detail || "Failed to update user")
            }
        }
    }

    const handleDeleteUser = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?")
        if (!confirmed) return
        try {
            await api.delete(`/users/${userId}`)
            setUsers(users.filter(u => u.id !== userId))
            toast.success("User deleted")
        } 
        catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                toast.error(detail[0]?.msg || "Failed to delete user")
            } 
            else {
                toast.error(err.response?.data?.detail || "Failed to delete user")
            }
        }
    }


    const handleOpenEdit = async (user) => {
        setEditingUser(user)
        setEditForm({name: user.name, email: user.email, role: user.role, new_password: ""})
        
        try {
            // Fetch which groups and roles this user currently has
            const groupChecks = await Promise.all(
                groups.map(g => api.get(`/groups/${g.id}/members`))
            )
            const roleChecks = await Promise.all(
                customRoles.map(r => api.get(`/custom-roles/${r.id}/users`))
            )
            
            // Get IDs of groups/roles the user belongs to
            const currentGroupIds = groups
                .filter((g, i) => groupChecks[i].data.some(m => m.id === user.id))
                .map(g => g.id)
            const currentRoleIds = customRoles
                .filter((r, i) => roleChecks[i].data.some(u => u.id === user.id))
                .map(r => r.id)
            
            setUserGroupIds(currentGroupIds)
            setUserRoleIds(currentRoleIds)
        } 
        catch (err) {
            console.error("Error fetching user groups/roles:", err)
        }
    }

    useEffect(() => {
        const handleClickOutside = () => {
            setGroupDropdownOpen(false)
            setRoleDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    if (loading) return <div style = {{color: "#ffffff", padding: "2rem"}}>Loading...</div>

    // Redirect non admins/owner
    if (currentUser && currentUser.role !== "admin" && currentUser.role !== "owner") {
        return (
            <div style = {{display: "flex", height: "100vh"}}>
                <Sidebar />
                <div style = {{flex: 1, padding: "2rem 2.5rem", backgroundColor: "#0a0a0a", color: "#a3a3a3"}}>
                    You don't have permission to view this page.
                </div>
            </div>
        )
    }

    return (
        <div style = {{display: "flex", height: "100vh"}}>
            <Sidebar />

            <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a"}}>

                {/* Header */}
                <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem"}}>
                    <h2 style = {{color: "#ffffff"}}>
                        Users
                    </h2>
                    <button
                        onClick = {() => setShowForm(!showForm)}
                        style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontSize: "13px"}}
                    >
                        + Add User
                    </button>
                </div>

                {/* Create user form */}
                {showForm && (
                    <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem", maxWidth: "500px"}}>
                        <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem"}}>
                            New User
                        </p>
                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Name
                            </label>
                            <input
                                type = "text"
                                value = {newUser.name}
                                onChange = {(e) => setNewUser({...newUser, name: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>
                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Email
                            </label>
                            <input
                                type = "email"
                                value = {newUser.email}
                                onChange = {(e) => setNewUser({...newUser, email: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>
                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Password
                            </label>
                            <input
                                type = "password"
                                value = {newUser.password}
                                onChange = {(e) => setNewUser({...newUser, password: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>
                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Role
                            </label>
                            <select
                                value = {newUser.role}
                                onChange = {(e) => setNewUser({...newUser, role: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            >
                                <option value = "member">Member</option>
                                <option value = "admin">Admin</option>
                            </select>
                        </div>

                       {/* Groups dropdown checklist */}
                        {groups.length > 0 && (
                            <div style = {{marginBottom: "1rem", position: "relative"}}>
                                <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                                    Groups
                                </label>
                                <button
                                    onClick = {(e) => {e.stopPropagation(); setGroupDropdownOpen(!groupDropdownOpen)}}
                                    style = {{width: "100%", padding: "8px", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between"}}
                                >
                                    <span>
                                        {userGroupIds.length > 0 ? `Groups (${userGroupIds.length})` : "No Groups"}
                                    </span>
                                    <span>{groupDropdownOpen ? "▲" : "▼"}</span>
                                </button>
                                {groupDropdownOpen && (
                                    <div style = {{position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", zIndex: 100, maxHeight: "150px", overflowY: "auto"}}>
                                        {groups.map(g => (
                                            <div
                                                key = {g.id}
                                                onClick = {() => {
                                                    if (userGroupIds.includes(g.id)) {
                                                        setUserGroupIds(userGroupIds.filter(id => id !== g.id))
                                                    } 
                                                    else {
                                                        setUserGroupIds([...userGroupIds, g.id])
                                                    }
                                                }}
                                                style = {{display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", backgroundColor: userGroupIds.includes(g.id) ? "#1e1e1e" : "transparent"}}
                                            >
                                                <span style = {{fontSize: "12px", color: userGroupIds.includes(g.id) ? "#ffffff" : "#a3a3a3"}}>
                                                    {userGroupIds.includes(g.id) ? "☑" : "☐"}
                                                </span>
                                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{g.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom roles dropdown checklist */}
                        {customRoles.length > 0 && (
                            <div style = {{marginBottom: "1rem", position: "relative"}}>
                                <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                                    Custom Roles
                                </label>
                                <button
                                    onClick = {(e) => {e.stopPropagation(); setRoleDropdownOpen(!roleDropdownOpen)}}
                                    style = {{width: "100%", padding: "8px", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between"}}
                                >
                                    <span>
                                        {userRoleIds.length > 0 ? `Roles (${userRoleIds.length})` : "No Roles"}
                                    </span>
                                    <span>{roleDropdownOpen ? "▲" : "▼"}</span>
                                </button>
                                {roleDropdownOpen && (
                                    <div style = {{position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", zIndex: 100, maxHeight: "150px", overflowY: "auto"}}>
                                        {customRoles.map(r => (
                                            <div
                                                key = {r.id}
                                                onClick = {() => {
                                                    if (userRoleIds.includes(r.id)) {
                                                        setUserRoleIds(userRoleIds.filter(id => id !== r.id))
                                                    } 
                                                    else {
                                                        setUserRoleIds([...userRoleIds, r.id])
                                                    }
                                                }}
                                                style = {{display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", backgroundColor: userRoleIds.includes(r.id) ? "#1e1e1e" : "transparent"}}
                                            >
                                                <span style = {{fontSize: "12px", color: userRoleIds.includes(r.id) ? "#ffffff" : "#a3a3a3"}}>
                                                    {userRoleIds.includes(r.id) ? "☑" : "☐"}
                                                </span>
                                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{r.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick = {handleCreateUser}
                            style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", border: "1px solid #262626"}}
                        >
                            Create User
                        </button>
                    </div>
                )}

                {/* List of users with each user having an edit/delete button */}
                <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", overflow: "hidden", width: "300px"}}>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div
                                key = {user.id}
                                style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #262626", gap: "16px"}}
                            >
                                <div style = {{flex: 1, minWidth: 0}}>
                                    <p style = {{fontSize: "13px", fontWeight: "500", color: "#ffffff", marginBottom: "2px"}}>
                                        {user.name}
                                        {user.id === currentUser?.id && (
                                            <span style = {{fontSize: "11px", color: "#ffffff", marginLeft: "8px"}}>
                                                (you)
                                            </span>
                                        )}
                                        {user.role === "owner" && (
                                            <span style = {{fontSize: "11px", color: "#f59e0b", marginLeft: "8px"}}>
                                                owner
                                            </span>
                                        )}
                                    </p>
                                    <p style = {{fontSize: "12px", color: "#a3a3a3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                                        {user.email} ·
                                        <span style = {{marginLeft: "4px", color: "#ffffff"}}>
                                            {user.role}
                                        </span>
                                    </p>
                                </div>
                                {user.role !== "owner" && user.id !== currentUser?.id && !(currentUser?.role === "admin" && user.role === "admin") && (
                                    <div style = {{display: "flex", gap: "8px"}}>
                                        <button
                                            onClick = {() => {
                                                handleOpenEdit(user)
                                            }}
                                            style = {{color: "#ffffff", background: "none", border: "1px solid #ffffff", padding: "4px 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px"}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick = {() => handleDeleteUser(user.id)}
                                            style = {{color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "4px 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px"}}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style = {{padding: "2rem", textAlign: "center"}}>
                            <p style = {{fontSize: "13px", color: "#a3a3a3"}}>
                                No users yet — click Add User to get started
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Edit user modal */}
            {editingUser && (
                <div style = {{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000}}>
                    <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", width: "400px"}}>
                        <h3 style = {{color: "#ffffff", marginBottom: "1.5rem", fontSize: "15px"}}>
                            Edit User
                        </h3>

                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Name
                            </label>
                            <input
                                type = "text"
                                value = {editForm.name}
                                onChange = {(e) => setEditForm({...editForm, name: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>

                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Email
                            </label>
                            <input
                                type = "email"
                                value = {editForm.email}
                                onChange = {(e) => setEditForm({...editForm, email: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>

                        <div style = {{marginBottom: "1rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                Role
                            </label>
                             <select
                                value = {editForm.role}
                                onChange = {(e) => setEditForm({...editForm, role: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            >
                                <option value = "member">Member</option>
                                <option value = "admin">Admin</option>
                            </select>
                        </div>

                        {/* Groups dropdown checklist */}
                        {groups.length > 0 && (
                            <div style = {{marginBottom: "1rem", position: "relative"}}>
                                <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                                    Groups
                                </label>
                                <button
                                    onClick = {(e) => {e.stopPropagation(); setGroupDropdownOpen(!groupDropdownOpen)}}
                                    style = {{width: "100%", padding: "8px", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between"}}
                                >
                                    <span>
                                        {userGroupIds.length > 0 ? `Groups (${userGroupIds.length})` : "No Groups"}
                                    </span>
                                    <span>{groupDropdownOpen ? "▲" : "▼"}</span>
                                </button>
                                {groupDropdownOpen && (
                                    <div style = {{position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", zIndex: 100, maxHeight: "150px", overflowY: "auto"}}>
                                        {groups.map(g => (
                                            <div
                                                key = {g.id}
                                                onClick = {() => {
                                                    if (userGroupIds.includes(g.id)) {
                                                        setUserGroupIds(userGroupIds.filter(id => id !== g.id))
                                                    } 
                                                    else {
                                                        setUserGroupIds([...userGroupIds, g.id])
                                                    }
                                                }}
                                                style = {{display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", backgroundColor: userGroupIds.includes(g.id) ? "#1e1e1e" : "transparent"}}
                                            >
                                                <span style = {{fontSize: "12px", color: userGroupIds.includes(g.id) ? "#ffffff" : "#a3a3a3"}}>
                                                    {userGroupIds.includes(g.id) ? "☑" : "☐"}
                                                </span>
                                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{g.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom roles dropdown checklist */}
                        {customRoles.length > 0 && (
                            <div style = {{marginBottom: "1rem", position: "relative"}}>
                                <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                                    Custom Roles
                                </label>
                                <button
                                    onClick = {(e) => {e.stopPropagation(); setRoleDropdownOpen(!roleDropdownOpen)}}
                                    style = {{width: "100%", padding: "8px", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", fontSize: "13px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between"}}
                                >
                                    <span>
                                        {userRoleIds.length > 0 ? `Roles (${userRoleIds.length})` : "No Roles"}
                                    </span>
                                    <span>{roleDropdownOpen ? "▲" : "▼"}</span>
                                </button>
                                {roleDropdownOpen && (
                                    <div style = {{position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", zIndex: 100, maxHeight: "150px", overflowY: "auto"}}>
                                        {customRoles.map(r => (
                                            <div
                                                key = {r.id}
                                                onClick = {() => {
                                                    if (userRoleIds.includes(r.id)) {
                                                        setUserRoleIds(userRoleIds.filter(id => id !== r.id))
                                                    } 
                                                    else {
                                                        setUserRoleIds([...userRoleIds, r.id])
                                                    }
                                                }}
                                                style = {{display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", cursor: "pointer", backgroundColor: userRoleIds.includes(r.id) ? "#1e1e1e" : "transparent"}}
                                            >
                                                <span style = {{fontSize: "12px", color: userRoleIds.includes(r.id) ? "#ffffff" : "#a3a3a3"}}>
                                                    {userRoleIds.includes(r.id) ? "☑" : "☐"}
                                                </span>
                                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{r.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div style = {{marginBottom: "1.5rem"}}>
                            <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                                New Password <span style = {{color: "#737373"}}>(leave blank to keep current)</span>
                            </label>
                            <input
                                type = "password"
                                value = {editForm.new_password}
                                onChange = {(e) => setEditForm({...editForm, new_password: e.target.value})}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                            />
                        </div>

                        <div style = {{display: "flex", gap: "8px", justifyContent: "flex-end"}}>
                            <button
                                onClick = {() => setEditingUser(null)}
                                style = {{backgroundColor: "transparent", color: "#a3a3a3", border: "1px solid #262626", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontSize: "13px"}}
                            >
                                Cancel
                            </button>
                            <button
                                onClick = {handleEditUser}
                                style = {{backgroundColor: "#0a0a0a", color: "#ffffff", border: "1px solid #262626", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontSize: "13px"}}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}