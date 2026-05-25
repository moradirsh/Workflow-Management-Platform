import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Cases from "./pages/Cases"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"

// Forced login for all routes except /login if not authenticated
function ProtectedRoute({ children }) {
    const { token } = useAuth()
    if (!token) {
        return <Navigate to = "/login" replace />
    }
    return children
}

export default function App() {
    return (
        <Routes>
            <Route path = "/login" element = {<Login />} />

            <Route path = "/register" element = {<Register />} />

            <Route path = "/landing" element = {<Landing />} />

            {/* Wrap all other routes with ProtectedRoute to require authentication */}
            <Route path = "/cases" element = {
                <ProtectedRoute>
                    <Cases />
                </ProtectedRoute>
            } />

            <Route path = "/dashboard" element = {
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path = "/settings" element = {
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />

            {/* Add more routes later */}

            

            <Route path = "/" element = {<Navigate to = "/cases" />} />
        </Routes>
    )
}