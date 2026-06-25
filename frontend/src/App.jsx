import {Routes, Route, Navigate} from "react-router-dom"
import {useAuth} from "./context/AuthContext"
import {useInactivity} from "./hooks/useInactivity"
import Login from "./pages/Login"
import Cases from "./pages/Cases"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"
import Users from "./pages/Users"
import Groups from "./pages/Groups"
import InactivityWarning from "./components/InactivityWarning"
import Archive from "./pages/Archive"

// Forced /landing if not auth by default
function ProtectedRoute({ children }) {
    const { token, loading } = useAuth()

    if (loading) return null // Wait for authcontext to check

    if (!token) {
        return <Navigate to = "/landing" replace />
    }
    return children
}

// Implementation now ensures that inactivty will log out user, whilst protecting every route
function AppContent() {
    const { token, loading } = useAuth()
    const { showWarning, resetTimers } = useInactivity()

    return (
        <>
            {showWarning && <InactivityWarning onStayActive = {resetTimers} />}
            <Routes>
                <Route path = "/login" element = {<Login />} />
                <Route path = "/register" element = {<Register />} />
                <Route path = "/cases" element = {<ProtectedRoute><Cases /></ProtectedRoute>} />
                <Route path = "/dashboard" element = {<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path = "/users" element = {<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path = "/settings" element = {<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path = "/groups" element = {<ProtectedRoute><Groups /></ProtectedRoute>} />
                <Route path = "/archive" element = {<ProtectedRoute><Archive /></ProtectedRoute>} />
                <Route path = "/landing" element = {<Landing />} />
                <Route path="/" element = {loading ? null : token ? <Navigate to="/cases" /> : <Navigate to="/landing" />} />
            </Routes>
        </>
    )
}

export default function App() {
    return (
        <AppContent />
    )
}