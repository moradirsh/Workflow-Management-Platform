import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/Login"

// Forced login for all routes except /login if not authenticated
function ProtectedRoute({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to = "/login" />
}

export default function App() {
    return (
        <Routes>
            <Route path = "/login" element = {<Login />} />
            {/* Wrap all other routes with ProtectedRoute to require authentication */}

            <Route path = "/cases" element = {
                <ProtectedRoute>
                    <h1>Cases Page Soon</h1>
                </ProtectedRoute>
            } />

            {/* Add more routes later */}

            <Route path = "/" element = {<Navigate to = "/cases" />} />
        </Routes>
    )
}