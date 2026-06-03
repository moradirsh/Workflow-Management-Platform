import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {register} from "../api/auth"

export default function Register() {
    const [form, setForm] = useState({org_name: "", name: "", email: "", password: ""})
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleRegister = async () => {
        setError("")
        console.log("sending:", form)
        if (!form.org_name || !form.name || !form.email || !form.password) {      
              setError("All fields are required")
              return
        }
        try {
            // User registration data to backend
            await register(form)
            // This will redirect once acc is registered
            navigate("/login")
        } catch (err) {
            setError("Registration failed.")
        }
    }

    return (
        <div style = {{width: "400px", margin: "60px auto", padding: "2rem"}}>
            <h2 style = {{textAlign: "center", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #262626"}}>
                Create Account
            </h2>

            {/* Error message on fail */}
            <div style = {{height: "24px", overflow: "hidden", marginBottom: "1rem"}}>
                <p style = {{color: "#ef4444", textAlign: "center", fontSize: "16px", overflow: "hidden", margin: "0", lineHeight: "1.4"}}>
                    {error || ""}
                </p>
            </div>

            {/* Personal info fillout w submission*/}
            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem"}}>
                <div style = {{marginBottom: "1rem"}}>
                    <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                        Organization Name
                    </label>
                    <input
                        type = "text"
                        value = {form.org_name}
                        onChange = {(e) => setForm({...form, org_name: e.target.value})}
                        style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                    />
                </div>
                <div style = {{marginBottom: "1rem"}}>
                    <label style = {{display: "block", marginBottom: "4px", fontSize: "13px"}}>
                        Name
                    </label>
                    <input
                        type = "text"
                        value = {form.name}
                        onChange = {(e) => setForm({...form, name: e.target.value})}
                        style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
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
                        style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
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
                        style = {{display: "block", width: "100%", padding: "8px", boxSizing: "border-box", backgroundColor: "#0a0a0a"}}
                    />
                </div>
                <button
                    onClick = {handleRegister}
                    style = {{display: "block", width: "100%", padding: "10px", backgroundColor: "#0a0a0a", color: "#ffffff", border: "1px solid #262626", borderRadius: "4px", cursor: "pointer"}}
                >
                    Register
                </button>
                {/* Login link */}
                <p style = {{textAlign: "center", marginTop: "1rem", fontSize: "13px", color: "#a3a3a3"}}>
                    Already have an account?{" "}
                    <span
                        onClick = {() => navigate("/login")}
                        style = {{color: "#ffffff", cursor: "pointer", textDecoration: "underline"}}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    )
}