import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"

export default function Sidebar() {
    const {logoutUser} = useAuth()
    const navigate = useNavigate()
    const handleLogout = () => { // It'll clear the token from user
        logoutUser()
        navigate("/login")
    }

    const navItem = (label, path) => ( // Nav bar when pressing and scrolling on a case
        <div
            onClick = {() => navigate(path)}
            style = {{
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "13px",
                borderLeft: location.pathname === path ? "2px solid #0a0a0afff" : "2px solid transparent",
                color: location.pathname === path ? "#f5f5f5" : "#a3a3a3",
                backgroundColor: location.pathname === path ? "#141414" : "transparent",
                fontWeight: location.pathname === path ? "500" : "400"
            }}
        >
            {label}
        </div>
)

    return (
        <div style = {{width: "200px", minWidth: "200px", height: "100vh", borderRight: "1px solid #262626", display: "flex", flexDirection: "column", backgroundColor: "#0a0a0a"}}>

            {/* Logo */}
            <div style = {{padding: "20px 16px", fontSize: "15px", fontWeight: "600", color: "#f5f5f5", borderBottom: "1px solid #262626", letterSpacing: "0.3px"}}>
                CaseFlow
            </div>

            {/* Main */}
            <div style = {{padding: "16px 0"}}>
                <p style = {{padding: "4px 16px 8px", fontSize: "10px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em"}}>
                    Main
                </p>
                {navItem("Cases", "/cases")}
                {navItem("Dashboard", "/dashboard")}
                {navItem("Users", "/users")}
            </div>

            {/* System */}
            <div style = {{marginTop: "auto", borderTop: "1px solid #262626", padding: "16px 0"}}>
                <p style = {{padding: "4px 16px 8px", fontSize: "10px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em"}}>
                    System
                </p>
                {navItem("Settings", "/settings")}
                <div
                    onClick = {handleLogout}
                    style = {{padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#ef4444"}}
                >
                    Logout
                </div>
            </div>
        </div>
    )
}