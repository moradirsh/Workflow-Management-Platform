import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"
import {login} from "../api/auth"

export default function Login() {
    // Tacks what user types in the form
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)

    // Redirect user post login
    const navigate = useNavigate()

    // Pull loginUser func from auth context
    const {loginUser} = useAuth()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Email and password are required")
            return
        }
        try {
            // Send email and pass to database
            const response = await login({email, password})
            loginUser(response.data.access_token) // Save token to context and localStorage
            navigate("/cases") // Redirect to cases page after login
        } 
        catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <div style = {{width: "300px", margin: "60px auto", padding: "2rem", overflow: "hidden"}}>
            <h2 style = {{textAlign: "center", marginBottom: "5rem"}}>CaseFlow Login</h2>

            <div style = {{height: "24px", overflow: "hidden", marginBottom: "1rem"}}>
                <p style = {{color: "red", textAlign: "center", fontSize: "16px", overflow: "hidden", margin: "0", lineHeight: "1.4"}}>
                    {error || ""}
                </p>
            </div>
                
            <form onSubmit = {handleLogin}>
                <div style = {{marginBottom: "1rem"}}>
                    <label style = {{display: "block", marginBottom: "4px", textAlign: "left"}}>Email:</label>
                    <input
                        type = "email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        style = {{display: "block", width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box"}}
                    />
                </div>

                <div style = {{marginBottom: "1rem"}}>
                    <label style = {{display: "block", marginBottom: "4px", textAlign: "left"}}>Password:</label>
                    <input
                        type = "password"
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                        style = {{display: "block", width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box"}}
                    />
                </div>

                <div style = {{ textAlign: "center"}}>
                    <button type = "submit" style = {{width: "100%", padding: "10px", justifyContent: "center", backgroundColor: "#a78bfa"}}>
                        Login
                    </button>
                </div>
            </form>


                <p style = {{textAlign: "center", marginTop: "1rem", fontSize: "13px", color: "#9ca3af"}}>
                Don't have an account?{" "}
                <span
                    onClick = {() => navigate("/register")}
                    style = {{color: "#a78bfa", cursor: "pointer"}}
                >
                    Register
                </span>
            </p>
        </div>
    )
}
                
            
