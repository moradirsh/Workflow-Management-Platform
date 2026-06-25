import {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {toast} from "sonner"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"

export default function Settings() {
    const navigate = useNavigate()

    // Hold current user profile
    const [profile, setProfile] = useState({name: "", email: "", role: ""})
    
    // Store form fields
    const [name, setName] = useState("")
    const [role, setRole] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // When load, get users curr profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/users/me")
                setProfile(res.data)
                setName(res.data.name)
                setRole(res.data.role)
            } 
            catch (err) {
                console.error("Error fetching profile:", err)
            }
        }
        fetchProfile()
    }, [])

    const handleUpdate = async () => {
        setError("")
        setSuccess("")
        if (newPassword && !currentPassword) {
            setError("Please enter your current password")
            return
        }
        try {
            const payload = {}
            if (name) payload.name = name
            if (newPassword) {
                payload.current_password = currentPassword
                payload.new_password = newPassword
            }

            const res = await api.put("/users/me", payload)
            setProfile(res.data)
            setSuccess("Profile updated successfully")
            setCurrentPassword("")
            setNewPassword("")
        } 
        catch (err) {
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                setError(detail[0]?.msg || "Failed to update profile")
            } 
            else {
                setError(detail || "Failed to update profile")
            }
        }
    }

    return (
        <div style = {{display: "flex", height: "100vh"}}>
            {/* name, email, role, current pass, new pass in view */}
            <Sidebar />
            <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a"}}>

                <h2 style = {{marginBottom: "2rem", color: "#f5f5f5"}}>
                    Settings
                </h2>
                <div style = {{width: "500px", backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem"}}>
                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem"}}>
                        Profile
                    </p>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                            Email
                        </label>
                        <input
                            type = "text"
                            value = {profile.email}
                            disabled
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", opacity: "0.5", backgroundColor: "#0a0a0a"}}
                        />
                    </div>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                            Name
                        </label>
                        <input
                            type = "text"
                            value = {name}
                            onChange = {(e) => setName(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                        />
                    </div>
                </div>
                <div style = {{width: "500px", backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem"}}>
                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem"}}>
                        Change Password
                    </p>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                            Current Password
                        </label>
                        <input
                            type = "password"
                            value = {currentPassword}
                            onChange = {(e) => setCurrentPassword(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                        />
                    </div>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#a3a3a3", marginBottom: "4px"}}>
                            New Password
                        </label>
                        <input
                            type = "password"
                            value = {newPassword}
                            onChange = {(e) => setNewPassword(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                        />
                    </div>
                </div>

                {/* Err and success messages */}
                {error && (
                    <p style = {{color: "#ef4444", fontSize: "13px", marginBottom: "1rem"}}>
                        {error}
                    </p>
                )}
                {success && (
                    <p style = {{color: "#10b981", fontSize: "13px", marginBottom: "1rem"}}>
                        {success}
                    </p>
                )}
                <button
                    onClick = {handleUpdate}
                    style = {{backgroundColor: "#0a0a0a", color: "#ffffff", border: "1px solid #262626", borderRadius: "4px", padding: "10px 24px", cursor: "pointer", fontSize: "13px"}}
                >
                    Save Changes
                </button>

                {/* Admin only delete org option */}
                {profile.role === "admin" && (
                <div style = {{backgroundColor: "#141414", border: "1px solid #ef4444", borderRadius: "8px", padding: "1.5rem", maxWidth: "500px", marginTop: "2rem"}}>
                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                        Danger Zone
                    </p>
                    <p style = {{fontSize: "13px", color: "#a3a3a3", marginBottom: "1rem"}}>
                        Permanently delete your organization and all associated cases, users, and data. This action is irreversible.
                    </p>
                    <button
                        onClick = {async () => {
                            const confirmed = window.confirm("Are you sure you want to delete your organization? This will permanently delete all cases, users, and data. This action cannot be undone.")
                            if (!confirmed) return
                            const doubleConfirm = window.confirm("This is your final warning. All data will be permanently deleted. Continue?")
                            if (!doubleConfirm) return
                            try {
                                await api.delete("/organizations/me")
                                await api.post("/users/logout")
                                window.location.href = "/landing"
                            } 
                            catch (err) {
                                toast.error("Failed to delete organization")
                            }
                        }}
                        style = {{backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "4px", padding: "8px 16px", cursor: "pointer", fontSize: "13px"}}
                    >
                        Delete Organization
                    </button>
                </div>
                )}
            </div>
        </div>
    )
}