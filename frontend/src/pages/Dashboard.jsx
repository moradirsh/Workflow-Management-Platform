import {useState, useEffect} from "react"
import {getCases} from "../api/cases"
import Sidebar from "../components/Sidebar"

export default function Dashboard() {
    const[cases, setCases] = useState([])
    const[loading, setLoading] = useState(true)

    // Fetch all the cases when page is loading
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await getCases()
                setCases(response.data)
            }
            catch (err) {
                console.error("Error fetching cases:", err)
            }
            finally {
                setLoading(false)
            }
        }
    
    fetchCases()
    
}, []) 

// Stats from cases
const total = cases.length 
const open = cases.filter(c => c.status === "open").length
const inProgress = cases.filter(c => c.status === "in progress").length
const resolved = cases.filter(c => c.status == "resolved").length
const high = cases.filter(c => c.priority?.toLowerCase() === "high").length
const medium = cases.filter(c => c.priority?.toLowerCase() === "medium").length
const low = cases.filter(c => c.priority?.toLowerCase() === "low").length

// Count cases based on category
const categories = cases.reduce((acc, c) => {
    if (c.category) {
        acc[c.category] = (acc[c.category] || 0) + 1
    }
    return acc
}, {})

if (loading) return <div style = {{color: "#f3f4f6", padding: "2rem"}}>Loading...</div>

return (
    <div style = {{display: "flex", height: "100vh"}}>

        <Sidebar />

        {/* Main content */}
        <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0f1117"}}>

            <h2 style = {{marginBottom: "2rem", color: "#f3f4f6"}}>
                Dashboard
            </h2>

            {/* Status stats */}
            <p style = {{fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Case Status
            </p>
            <div style = {{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem"}}>
                {[
                    {label: "Total", value: total, color: "#a78bfa"},
                    {label: "Open", value: open, color: "#60a5fa"},
                    {label: "In Progress", value: inProgress, color: "#f59e0b"},
                    {label: "Resolved", value: resolved, color: "#10b981"}
                ].map((stat) => (
                    <div
                        key = {stat.label}
                        style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1.25rem"}}
                    >
                        <p style = {{fontSize: "12px", color: "#6b7280", marginBottom: "8px"}}>
                            {stat.label}
                        </p>
                        <p style = {{fontSize: "28px", fontWeight: "600", color: stat.color}}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Priority stats */}
            <p style = {{fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Case Priority
            </p>
            <div style = {{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "2rem"}}>
                {[
                    {label: "High", value: high, color: "#ef4444"},
                    {label: "Medium", value: medium, color: "#f59e0b"},
                    {label: "Low", value: low, color: "#10b981"}
                ].map((stat) => (
                    <div
                        key = {stat.label}
                        style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1.25rem"}}
                    >
                        <p style = {{fontSize: "12px", color: "#6b7280", marginBottom: "8px"}}>
                            {stat.label}
                        </p>
                        <p style = {{fontSize: "28px", fontWeight: "600", color: stat.color}}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Category breakdown */}
            <p style = {{fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Cases by Category
            </p>
            <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1rem"}}>
                {Object.entries(categories).length > 0 ? (
                    Object.entries(categories).map(([category, count]) => (
                        <div
                            key = {category}
                            style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #2e303a"}}
                        >
                            <span style = {{fontSize: "13px", color: "#d1d5db"}}>
                                {category}
                            </span>
                            <span style = {{fontSize: "13px", color: "#a78bfa", fontWeight: "500"}}>
                                {count}
                            </span>
                        </div>
                    ))
                ) : (
                    <p style = {{color: "#6b7280", fontSize: "13px"}}>
                        No categories yet
                    </p>
                )}
            </div>

        </div>
    </div>
)
}