import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import { toast } from "sonner"

export default function Users() {
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newUser, setNewUser] = useState({name: "", email: "", password: "", role: "member"})
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({name: "", email: "", role: "member", new_password: ""})

    // Fetch current user and all org users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, usersRes] = await Promise.all([
                    api.get("/users/me"),
                    api.get("/users")
                ])
                setCurrentUser(meRes.data)
                setUsers(usersRes.data)
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
            setUsers([...users, res.data])
            setNewUser({name: "", email: "", password: "", role: "member"})
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
            const payload = {name: editForm.name, email: editForm.email, role: editForm.role
            }
            if (editForm.new_password) {
                payload.password = editForm.new_password
            }
            const res = await api.put(`/users/${editingUser.id}`, payload)
            setUsers(users.map(u => u.id === editingUser.id ? res.data : u))
            setEditingUser(null)
            toast.success("User updated")
        } 
        catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                toast.error(detail[0]?.msg || "Failed to update user")
            } 
            else {
                toast.error(err.response?.data?.detail || "Failed to update user")
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

    if (loading) return <div style = {{color: "#f5f5f5", padding: "2rem"}}>Loading...</div>

    // Redirect non admins
    if (currentUser && currentUser.role !== "admin") {
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
                    <h2 style = {{color: "#f5f5f5"}}>
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
                                    <p style = {{fontSize: "13px", fontWeight: "500", color: "#f5f5f5", marginBottom: "2px"}}>
                                        {user.name}
                                        {user.id === currentUser?.id && (
                                            <span style = {{fontSize: "11px", color: "#0a0a0afff", marginLeft: "8px"}}>
                                                (you)
                                            </span>
                                        )}
                                    </p>
                                    <p style = {{fontSize: "12px", color: "#a3a3a3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                                        {user.email} ·
                                        <span style = {{marginLeft: "4px", color: user.role === "admin" ? "#0a0a0afff" : "#a3a3a3"}}>
                                            {user.role}
                                        </span>
                                    </p>
                                </div>
                                {user.id !== currentUser?.id && (
                                    <div style = {{display: "flex", gap: "8px"}}>
                                        <button
                                            onClick = {() => {
                                                setEditingUser(user)
                                                setEditForm({name: user.name, email: user.email, role: user.role, new_password: ""})
                                            }}
                                            style = {{color: "#0a0a0afff", background: "none", border: "1px solid #0a0a0afff", padding: "4px 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px"}}
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
                        <h3 style = {{color: "#f5f5f5", marginBottom: "1.5rem", fontSize: "15px"}}>
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