import {useState, useEffect} from "react"
import {getCases} from "../api/cases"
import Sidebar from "../components/Sidebar"
import api from "../api/axios"

export default function Dashboard() {
    const[cases, setCases] = useState([])
    const[loading, setLoading] = useState(true)
    const[stats, setStats] = useState(null)

    // Fetch all the cases when page is loading
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [casesRes, statsRes] = await Promise.all([
                    getCases(),
                    api.get("/cases/stats")
                ])
                setCases(casesRes.data)
                setStats(statsRes.data)
            } 
            catch (err) {
                console.error("Error fetching dashboard data:", err)
            } 
            finally {
                setLoading(false)
            }
        }
        fetchData()
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

if (loading) return <div style = {{color: "#f5f5f5", padding: "2rem"}}>Loading...</div>

return (
    <div style = {{display: "flex", height: "100vh"}}>

        <Sidebar />

        {/* Main content */}
        <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a"}}>

            <h2 style = {{marginBottom: "2rem", color: "#f5f5f5"}}>
                Dashboard
            </h2>

            {/* Key metrics */}
            <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Key Metrics
            </p>
            <div style = {{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem"}}>
                {[
                    {label: "Overdue Cases", value: stats?.overdue ?? 0, color: "#ef4444", sublabel: "Open 7+ days"},
                    {label: "Unassigned", value: stats?.unassigned ?? 0, color: "#f59e0b", sublabel: "Need attention"},
                    {label: "Avg Resolution", value: stats?.avg_resolution_days ?? 0, color: "#60a5fa", sublabel: "Days to resolve"},
                    {label: "Total Open", value: stats?.total_open ?? 0, color: "#ffffff", sublabel: "Active cases"}
                ].map((stat) => (
                    <div
                        key = {stat.label}
                        style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.25rem"}}
                    >
                        <p style = {{fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                            {stat.label}
                        </p>
                        <p style = {{fontSize: "28px", fontWeight: "600", color: stat.color}}>
                            {stat.value}
                        </p>
                        <p style = {{fontSize: "11px", color: "#737373", marginTop: "4px"}}>
                            {stat.sublabel}
                        </p>
                    </div>
                ))}
            </div>

            {/* Workload by assignee */}
            {stats?.workload?.length > 0 && (
                <>
                    <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                        Workload by Assignee
                    </p>
                    <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "2rem"}}>
                        {stats.workload.map((w) => (
                            <div
                                key = {w.name}
                                style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #262626"}}
                            >
                                <span style = {{fontSize: "13px", color: "#ffffff"}}>{w.name}</span>
                                <div style = {{display: "flex", alignItems: "center", gap: "12px"}}>
                                    <div style = {{width: "120px", backgroundColor: "#262626", borderRadius: "4px", height: "6px"}}>
                                        <div style = {{
                                            width: `${Math.min((w.count / Math.max(...stats.workload.map(x => x.count))) * 100, 100)}%`,
                                            backgroundColor: "#ffffff",
                                            borderRadius: "4px",
                                            height: "6px"
                                        }} />
                                    </div>
                                    <span style = {{fontSize: "13px", color: "#ffffff", fontWeight: "500", width: "20px", textAlign: "right"}}>
                                        {w.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Status stats */}
            <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Case Status
            </p>
            <div style = {{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem"}}>
                {[
                    {label: "Total", value: total, color: "#ffffff"},
                    {label: "Open", value: open, color: "#60a5fa"},
                    {label: "In Progress", value: inProgress, color: "#f59e0b"},
                    {label: "Resolved", value: resolved, color: "#10b981"}
                ].map((stat) => (
                    <div
                        key = {stat.label}
                        style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.25rem"}}
                    >
                        <p style = {{fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                            {stat.label}
                        </p>
                        <p style = {{fontSize: "28px", fontWeight: "600", color: stat.color}}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Priority stats */}
            <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
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
                        style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.25rem"}}
                    >
                        <p style = {{fontSize: "12px", color: "#a3a3a3", marginBottom: "8px"}}>
                            {stat.label}
                        </p>
                        <p style = {{fontSize: "28px", fontWeight: "600", color: stat.color}}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Category breakdown */}
            <p style = {{fontSize: "11px", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem"}}>
                Cases by Category
            </p>
            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem"}}>
                {Object.entries(categories).length > 0 ? (
                    Object.entries(categories).map(([category, count]) => (
                        <div
                            key = {category}
                            style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #262626"}}
                        >
                            <span style = {{fontSize: "13px", color: "#f5f5f5"}}>
                                {category}
                            </span>
                            <span style = {{fontSize: "13px", color: "#0a0a0afff", fontWeight: "500"}}>
                                {count}
                            </span>
                        </div>
                    ))
                ) : (
                    <p style = {{color: "#a3a3a3", fontSize: "13px"}}>
                        No categories yet
                    </p>
                )}
            </div>

        </div>
    </div>
)
}