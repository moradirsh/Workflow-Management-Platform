import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import Cases from "./pages/Cases"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"
import Users from "./pages/Users"
import Groups from "./pages/Groups"

// Forced /landing if not auth by default
function ProtectedRoute({ children }) {
    const { token } = useAuth()
    if (!token) {
        return <Navigate to = "/landing" replace />
    }
    return children
}

export default function App() {
    return (
        <Routes>
            <Route path = "/login" element = {<Login />} />

            <Route path = "/register" element = {<Register />} />

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

            <Route path = "/users" element = {
                <ProtectedRoute>
                    <Users />
                </ProtectedRoute>
            } />
            
            <Route path = "/settings" element = {
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />

            <Route path = "/groups" element = {
                <ProtectedRoute>
                    <Groups />
                </ProtectedRoute>
            } />

            {/* Add more routes later */}

            <Route path = "/landing" element = {<Landing />} />

            <Route path = "/" element = {<Navigate to = "/landing" />} />
        </Routes>
    )
}