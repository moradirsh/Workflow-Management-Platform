import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext"
import {useState, useEffect, useRef} from "react"
import api from "../api/axios"
import {toast} from "sonner"

export default function Sidebar() {
    const {logoutUser} = useAuth()
    const navigate = useNavigate()
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const prevCountRef = useRef(0)
    const [currentUser, setCurrentUser] = useState(null)
    const handleLogout = async () => { // It'll clear the token from user
        await logoutUser()
        navigate("/login")
    }

    const navItem = (label, path) => ( // Nav bar when pressing and scrolling on a case
        <div
            onClick = {() => navigate(path)}
            style = {{padding: "10px 16px", cursor: "pointer", fontSize: "13px",
                borderLeft: location.pathname === path ? "2px solid #ffffff" : "2px solid transparent",
                color: location.pathname === path ? "#f5f5f5" : "#a3a3a3",
                backgroundColor: location.pathname === path ? "#141414" : "transparent",
                fontWeight: location.pathname === path ? "500" : "400"
            }}
        >
            {label}
        </div>
    )

    // Fetch unread count on load and every 30 seconds
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                await api.delete("/notifications/clear-old")
                const res = await api.get("/notifications/unread-count")
                const newCount = res.data.count
            
            // Toast now shows if new notifs arrived
            if (newCount > prevCountRef.current) {
                toast.info("You have new notifications")
            }
            prevCountRef.current = newCount
            setUnreadCount(newCount)
            } 
            catch (err) {
                console.error("Error fetching unread count:", err)
            }
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleOpenNotifs = async () => {
        setNotifOpen(!notifOpen)
        if (!notifOpen) {
            try {
                const res = await api.get("/notifications")
                setNotifications(res.data)
                await api.put("/notifications/mark-read")
                setUnreadCount(0)
            } 
            catch (err) {
                console.error("Error fetching notifications:", err)
            }
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/me")
                setCurrentUser(res.data)
            } 
            catch (err) {
                console.error("Error fetching user:", err)
            }
        }
        fetchUser()
    }, [])

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

                {/* Only admins and owners can view */}
                {(currentUser?.role === "admin" || currentUser?.role === "owner") && navItem("Users", "/users")}
                {(currentUser?.role === "admin" || currentUser?.role === "owner") && navItem("Groups", "/groups")}
                {(currentUser?.role === "admin" || currentUser?.role === "owner") && navItem("Archive", "/archive")}
            </div>

            {/* System */}
            <div style = {{marginTop: "auto", borderTop: "1px solid #262626", padding: "16px 0"}}>
                <p style = {{padding: "4px 16px 8px", fontSize: "10px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em"}}>
                    System
                </p>
                {navItem("Settings", "/settings")}

                {/* Notifications */}
                <div style = {{position: "relative"}}>
                    <div
                        onClick = {handleOpenNotifs}
                        style = {{padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#a3a3a3", display: "flex", alignItems: "center", gap: "8px"}}
                    >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span style = {{backgroundColor: "#ef4444", color: "#ffffff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Notifications dropdown */}
                    {notifOpen && (
                        <div style = {{position: "fixed", left: "210px", bottom: "60px", width: "300px", backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", zIndex: 1000, maxHeight: "400px", overflowY: "auto"}}>
                            <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", padding: "12px 16px", borderBottom: "1px solid #262626"}}>
                                Notifications
                            </p>
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key = {n.id}
                                        style = {{padding: "12px 16px", borderBottom: "1px solid #262626", backgroundColor: n.is_read ? "transparent" : "#1e1e1e"}}
                                    >
                                        <p style = {{fontSize: "13px", color: "#ffffff", marginBottom: "4px"}}>
                                            {n.message}
                                        </p>
                                        <p style = {{fontSize: "11px", color: "#a3a3a3"}}>
                                            {new Date(n.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p style = {{fontSize: "13px", color: "#a3a3a3", padding: "1rem"}}>
                                    No notifications
                                </p>
                            )}
                        </div>
                    )}
                </div>
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