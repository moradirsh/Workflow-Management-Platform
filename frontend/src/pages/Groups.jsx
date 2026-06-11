import {useState, useEffect} from "react"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"
import {toast} from "sonner"

export default function Groups() {
    const [groups, setGroups] = useState([])
    const [roles, setRoles] = useState([])
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newGroupName, setNewGroupName] = useState("") // Groups form
    const [showGroupForm, setShowGroupForm] = useState(false)
    const [newRoleName, setNewRoleName] = useState("") // Roles form
    const [showRoleForm, setShowRoleForm] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null) // These manage members
    const [selectedRole, setSelectedRole] = useState(null)
    const [groupMembers, setGroupMembers] = useState([])
    const [roleUsers, setRoleUsers] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, groupsRes, rolesRes, usersRes] = await Promise.all([api.get("/users/me"), api.get("/groups"), api.get("/custom-roles"), api.get("/users")
                ])
                setCurrentUser(meRes.data)
                setGroups(groupsRes.data)
                setRoles(rolesRes.data)
                setUsers(usersRes.data)
            } 
            catch (err) {
                console.error("Error fetching data:", err)
            } 
            finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Group handlers
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return
        try {
            const res = await api.post("/groups", {name: newGroupName})
            setGroups([...groups, res.data])
            setNewGroupName("")
            setShowGroupForm(false)
            toast.success("Group created")
        } 
        catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create group")
        }
    }

    const handleDeleteGroup = async (groupId) => {
        const confirmed = window.confirm("Delete this group?")
        if (!confirmed) return
        try {
            await api.delete(`/groups/${groupId}`)
            setGroups(groups.filter(g => g.id !== groupId))
            if (selectedGroup?.id === groupId) setSelectedGroup(null)
            toast.success("Group deleted")
        } 
        catch (err) {
            toast.error("Failed to delete group")
        }
    }

    const handleSelectGroup = async (group) => {
        setSelectedGroup(group)
        setSelectedRole(null)
        try {
            const res = await api.get(`/groups/${group.id}/members`)
            setGroupMembers(res.data)
        } 
        catch (err) {
            console.error("Error fetching group members:", err)
        }
    }

    const handleAddToGroup = async (userId) => {
        try {
            await api.post(`/groups/${selectedGroup.id}/members/${userId}`)
            const res = await api.get(`/groups/${selectedGroup.id}/members`)
            setGroupMembers(res.data)
            toast.success("User added to group")
        } 
        catch (err) {
            toast.error(err.response?.data?.detail || "Failed to add user")
        }
    }

    const handleRemoveFromGroup = async (userId) => {
        try {
            await api.delete(`/groups/${selectedGroup.id}/members/${userId}`)
            setGroupMembers(groupMembers.filter(m => m.id !== userId))
            toast.success("User removed from group")
        } 
        catch (err) {
            toast.error("Failed to remove user")
        }
    }

    // Role handlers
    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return
        try {
            const res = await api.post("/custom-roles", {name: newRoleName})
            setRoles([...roles, res.data])
            setNewRoleName("")
            setShowRoleForm(false)
            toast.success("Role created")
        } 
        catch (err) {
            toast.error(err.response?.data?.detail || "Failed to create role")
        }
    }

    const handleDeleteRole = async (roleId) => {
        const confirmed = window.confirm("Delete this role?")
        if (!confirmed) return
        try {
            await api.delete(`/custom-roles/${roleId}`)
            setRoles(roles.filter(r => r.id !== roleId))
            if (selectedRole?.id === roleId) setSelectedRole(null)
            toast.success("Role deleted")
        } 
        catch (err) {
            toast.error("Failed to delete role")
        }
    }

    const handleSelectRole = async (role) => {
        setSelectedRole(role)
        setSelectedGroup(null)
        try {
            const res = await api.get(`/custom-roles/${role.id}/users`)
            setRoleUsers(res.data)
        } 
        catch (err) {
            console.error("Error fetching role users:", err)
        }
    }

    const handleAssignRole = async (userId) => {
        try {
            await api.post(`/custom-roles/${selectedRole.id}/users/${userId}`)
            const res = await api.get(`/custom-roles/${selectedRole.id}/users`)
            setRoleUsers(res.data)
            toast.success("Role assigned")
        } 
        catch (err) {
            toast.error(err.response?.data?.detail || "Failed to assign role")
        }
    }

    const handleRemoveRole = async (userId) => {
        try {
            await api.delete(`/custom-roles/${selectedRole.id}/users/${userId}`)
            setRoleUsers(roleUsers.filter(u => u.id !== userId))
            toast.success("Role removed")
        } 
        catch (err) {
            toast.error("Failed to remove role")
        }
    }

    if (loading) return <div style = {{color: "#ffffff", padding: "2rem"}}>Loading...</div>

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

            <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a", display: "flex", gap: "2rem", flexWrap: "nowrap"}}>

                {/* Groups column */}
                <div style = {{flex: 1}}>
                    <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                        <h2 style = {{color: "#ffffff", fontSize: "16px",}}
                        >
                            Groups
                        </h2>
                        <button
                            onClick = {() => setShowGroupForm(!showGroupForm)}
                            style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px"}}
                        >
                            + New Group
                        </button>
                    </div>

                    {/* Create group form */}
                    {showGroupForm && (
                        <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                            <input
                                type = "text"
                                placeholder = "Group name"
                                value = {newGroupName}
                                onChange = {(e) => setNewGroupName(e.target.value)}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "8px", backgroundColor: "#0a0a0a"}}
                            />
                            <button
                                onClick = {handleCreateGroup}
                                style = {{margin: "0 auto", display: "block", backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px"}}
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Group column */}
                    <div style = {{width: "200px", backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", overflow: "hidden"}}>
                        {groups.length > 0 ? groups.map(group => (
                            <div
                                key = {group.id}
                                style = {{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "12px 16px", borderBottom: "1px solid #262626", cursor: "pointer",
                                    backgroundColor: selectedGroup?.id === group.id ? "#1e1e1e" : "transparent"
                                }}
                                onClick = {() => handleSelectGroup(group)}
                            >
                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{group.name}</span>
                                <button
                                    onClick = {(e) => { e.stopPropagation(); handleDeleteGroup(group.id) }}
                                    style = {{color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "3px 8px", cursor: "pointer", borderRadius: "4px", fontSize: "11px"}}
                                >
                                    Delete
                                </button>
                            </div>
                        )) : (
                            <p style = {{padding: "1rem", fontSize: "13px", color: "#a3a3a3"}}>No groups yet</p>
                        )}
                    </div>
                </div>

                {/* Roles column */}
                <div style = {{flex: 1}}>
                    <div style = {{width: "200px",display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}>
                        <h2 style = {{color: "#ffffff", fontSize: "16px", whitespace: "nowrap"}}
                        >
                            Custom Roles
                        </h2>
                        <button
                            onClick = {() => setShowRoleForm(!showRoleForm)}
                            style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}
                        >
                            + New Role
                        </button>
                    </div>

                    {/* Create role form */}
                    {showRoleForm && (
                        <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                            <input
                                type = "text"
                                placeholder = "Role name"
                                value = {newRoleName}
                                onChange = {(e) => setNewRoleName(e.target.value)}
                                style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", marginBottom: "8px", backgroundColor: "#0a0a0a"}}
                            />
                            <button
                                onClick = {handleCreateRole}
                                style = {{margin: "0 auto", display: "block", backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontSize: "12px"}}
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Role list */}
                    <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", overflow: "hidden"}}>
                        {roles.length > 0 ? roles.map(role => (
                            <div
                                key = {role.id}
                                style = {{
                                    display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #262626", cursor: "pointer", backgroundColor: selectedRole?.id === role.id ? "#1e1e1e" : "transparent"
                                }}
                                onClick = {() => handleSelectRole(role)}
                            >
                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{role.name}</span>
                                <button
                                    onClick = {(e) => { e.stopPropagation(); handleDeleteRole(role.id) }}
                                    style = {{color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "3px 8px", cursor: "pointer", borderRadius: "4px", fontSize: "11px"}}
                                >
                                    Delete
                                </button>
                            </div>
                        )) : (
                            <p style = {{padding: "1rem", fontSize: "13px", color: "#a3a3a3"}}>No roles yet</p>
                        )}
                    </div>
                </div>

                {/* Members panel */}
                {(selectedGroup || selectedRole) && (
                    <div style = {{flex: 1}}>
                        <h2 style = {{color: "#ffffff", fontSize: "16px", marginBottom: "1.5rem"}}>
                            {selectedGroup ? `${selectedGroup.name} Members` : `${selectedRole.name} Users`}
                        </h2>

                        {/* Current members */}
                        <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem"}}>
                            {(selectedGroup ? groupMembers : roleUsers).length > 0 ? (
                                (selectedGroup ? groupMembers : roleUsers).map(user => (
                                    <div
                                        key = {user.id}
                                        style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #262626"}}
                                    >
                                        <div>
                                            <p style = {{fontSize: "13px", color: "#ffffff", margin: "0"}}>{user.name}</p>
                                            <p style = {{fontSize: "11px", color: "#a3a3a3", margin: "0"}}>{user.email}</p>
                                        </div>
                                        <button
                                            onClick = {() => selectedGroup ? handleRemoveFromGroup(user.id) : handleRemoveRole(user.id)}
                                            style = {{color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "3px 8px", cursor: "pointer", borderRadius: "4px", fontSize: "11px"}}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p style = {{padding: "1rem", fontSize: "13px", color: "#a3a3a3"}}>No members yet</p>
                            )}
                        </div>

                        {/* Add members */}
                        <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                            Add Users
                        </p>
                        <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", overflow: "hidden"}}>
                            {users
                                .filter(u => !(selectedGroup ? groupMembers : roleUsers).find(m => m.id === u.id))
                                .map(user => (
                                    <div
                                        key = {user.id}
                                        style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #262626"}}
                                    >
                                        <div>
                                            <p style = {{fontSize: "13px", color: "#ffffff", margin: "0"}}>{user.name}</p>
                                            <p style = {{fontSize: "11px", color: "#a3a3a3", margin: "0"}}>{user.email}</p>
                                        </div>
                                        <button
                                            onClick = {() => selectedGroup ? handleAddToGroup(user.id) : handleAssignRole(user.id)}
                                            style = {{color: "#ffffff", background: "none", border: "1px solid #ffffff", padding: "3px 8px", cursor: "pointer", borderRadius: "4px", fontSize: "11px"}}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}