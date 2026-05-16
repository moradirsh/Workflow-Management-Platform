import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {register} from "../api/auth"

export default function Register() {
    const [form, setForm] = useState({name: "", email: "", password: "", role: ""})
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleRegister = async () => {
        setError("")
        try {
            // User registration data to backend
            await register(form)
            // This will redirect once acc is registered
            navigate("/login")
        } catch (err) {
            setError("Registration failed. Email may already be taken.")
        }
    }

    return (
        <div style = {{maxWidth: "400px", margin: "60px auto", padding: "2rem"}}>
            <h2 style = {{textAlign: "center", marginBottom: "2rem"}}>
                Create Account
            </h2>

            {/* Error message on fail */}
            <p style = {{color: "red", textAlign: "center", height: "20px", margin: "0 0 1rem 0", fontSize: "14px", overflow: "hidden", whiteSpace: "nowrap"}}>
                {error || ""}
            </p>

            {/* Personal info fillout w submission*/}
            <div style = {{marginBottom: "1rem"}}>
                <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                    Name
                </label>
                <input
                    type = "text"
                    value = {form.name}
                    onChange = {(e) => setForm({...form, name: e.target.value})}
                    style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                />
            </div>

            <div style = {{marginBottom: "1rem"}}>
                <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                    Email
                </label>
                <input
                    type = "email"
                    value = {form.email}
                    onChange = {(e) => setForm({...form, email: e.target.value})}
                    style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                />
            </div>

            <div style = {{marginBottom: "1rem"}}>
                <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                    Password
                </label>
                <input
                    type = "password"
                    value = {form.password}
                    onChange = {(e) => setForm({...form, password: e.target.value})}
                    style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                />
            </div>

            <div style = {{marginBottom: "1.5rem"}}>
                <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                    Role
                </label>
                <input
                    type = "text"
                    value = {form.role}
                    onChange = {(e) => setForm({...form, role: e.target.value})}
                    style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box"}}
                />
            </div>

            <button
                onClick = {handleRegister}
                style = {{display: "block", width: "100%", padding: "10px", backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer"}}
            >
                Register
            </button>

            {/* Login link */}
            <p style = {{textAlign: "center", marginTop: "1rem", fontSize: "13px", color: "#9ca3af"}}>
                Already have an account?{" "}
                <span
                    onClick = {() => navigate("/login")}
                    style = {{color: "#a78bfa", cursor: "pointer"}}
                >
                    Login
                </span>
            </p>
        </div>
    )
}