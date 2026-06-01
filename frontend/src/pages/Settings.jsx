import {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
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
        try {
            const payload = {}
            if (name) payload.name = name
            if (role) payload.role = role
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
            setError(err.response?.data?.detail || "Failed to update profile")
        }
    }

    return (
        <div style = {{display: "flex", height: "100vh"}}>
            {/* name, email, role, current pass, new pass in view */}
            <Sidebar />
            <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0f1117"}}>

                <h2 style = {{marginBottom: "2rem", color: "#f3f4f6"}}>
                    Settings
                </h2>
                <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem", maxWidth: "500px"}}>
                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem"}}>
                        Profile
                    </p>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>
                            Email
                        </label>
                        <input
                            type = "text"
                            value = {profile.email}
                            disabled
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", opacity: "0.5"}}
                        />
                    </div>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>
                            Name
                        </label>
                        <input
                            type = "text"
                            value = {name}
                            onChange = {(e) => setName(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                        />
                    </div>
                </div>
                <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem", maxWidth: "500px"}}>
                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem"}}>
                        Change Password
                    </p>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>
                            Current Password
                        </label>
                        <input
                            type = "password"
                            value = {currentPassword}
                            onChange = {(e) => setCurrentPassword(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                        />
                    </div>
                    <div style = {{marginBottom: "1rem"}}>
                        <label style = {{display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px"}}>
                            New Password
                        </label>
                        <input
                            type = "password"
                            value = {newPassword}
                            onChange = {(e) => setNewPassword(e.target.value)}
                            style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
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
                    style = {{backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", padding: "10px 24px", cursor: "pointer", fontSize: "13px"}}
                >
                    Save Changes
                </button>

            </div>
        </div>
    )
}