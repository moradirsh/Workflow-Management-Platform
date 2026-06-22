import {createContext, useContext, useState} from "react"

// Create AuthContext to manage authentication state across the app
const AuthContext = createContext()

export function AuthProvider({ children }) {
    // Check if token exists from previous session
    const [token, setToken] = useState(localStorage.getItem("token") || null)
    const [user, setUser] = useState(null) 

    // Save token when user logs in to localStorage and update state
    const loginUser = (accessToken) => {
        localStorage.setItem("token", accessToken)
        setToken(accessToken)
    }

    const logoutUser = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    // This allows these attributes to be available to any component in the app
    return (
        <AuthContext.Provider value={{ token, user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// Just lets components easily access auth context 
export function useAuth() {
    return useContext(AuthContext)
}