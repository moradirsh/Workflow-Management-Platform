import {createContext, useContext, useState, useEffect} from "react"
import api from "../api/axios"

// Create AuthContext to manage authentication state across the app
const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check if user is already auth on load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get("/users/me")
                setToken(true)
            } 
            catch (err) {
                setToken(false)
            }
            finally {
                setLoading(false) // Determines to show the page or redirect to landing based on token
            }
        }
        checkAuth()
    }, [])

    const loginUser = async (email, password) => {
        await api.post("/users/login", {email, password})
        setToken(true) // Tracks token
    }

    const logoutUser = async () => {
        try {
            await api.post("/users/logout")
        } 
        catch (err) {
            console.error("Logout error:", err)
        }
        setToken(false)
    }
    // This allows these attributes to be available to any component in the app
    return (
        <AuthContext.Provider value = {{ token, loading, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// Just lets components easily access auth context 
export function useAuth() {
    return useContext(AuthContext)
}