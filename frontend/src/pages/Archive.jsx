import {useState, useEffect} from "react"
import Sidebar from "../components/Sidebar"
import {getArchivedCases} from "../api/cases"
import ReactMarkdown from "react-markdown"
import {toast} from "sonner"

export default function Archive() {
    const [cases, setCases] = useState([])
    const [selectedCase, setSelectedCase] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchArchived = async () => {
            try {
                const res = await getArchivedCases()
                setCases(res.data)
            } 
            catch (err) {
                console.error("Error fetching archived cases:", err)
            } 
            finally {
                setLoading(false)
            }
        }
        fetchArchived()
    }, [])

    if (loading) return <div style = {{color: "#ffffff", padding: "2rem"}}>Loading...</div>

    return (
        <div style = {{display: "flex", flexDirection: "row", height: "100vh"}}>
            <Sidebar />

            {/* Case list panel */}
            <div style = {{width: "400px", minWidth: "400px", borderRight: "1px solid #262626", overflowY: "auto", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column"}}>
                <div style = {{padding: "12px 16px", borderBottom: "1px solid #262626"}}>
                    <span style = {{fontSize: "13px", fontWeight: "500", color: "#ffffff"}}>
                        Archived Cases
                    </span>
                </div>

                {cases.length > 0 ? (
                    cases.map(c => (
                        <div
                            key = {c.id}
                            onClick = {() => setSelectedCase(c)}
                            style = {{
                                padding: "14px 16px", borderBottom: "1px solid #262626", cursor: "pointer",
                                backgroundColor: selectedCase?.id === c.id ? "#141414" : "transparent",
                                borderLeft: selectedCase?.id === c.id ? "2px solid #f59e0b" : "2px solid transparent"
                            }}
                        >
                            <div style = {{fontSize: "11px", color: "#a3a3a3", marginBottom: "6px"}}>
                                #{c.id}
                            </div>
                            <div style = {{fontWeight: "500", fontSize: "13px", color: "#a3a3a3", marginBottom: "6px", lineHeight: "1.4"}}>
                                {c.title}
                            </div>
                            <div style = {{fontSize: "12px", color: "#737373", display: "flex", alignItems: "center", gap: "6px"}}>
                                <span style = {{color: c.priority === "high" ? "#ef4444" : c.priority === "medium" ? "#f59e0b" : "#10b981", fontSize: "8px"}}>
                                    ●
                                </span>
                                {c.status} · {c.priority}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style = {{padding: "2rem", textAlign: "center"}}>
                        <p style = {{fontSize: "13px", color: "#a3a3a3"}}>No archived cases</p>
                    </div>
                )}
            </div>

            {/* Case detail panel */}
            <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a"}}>
                {selectedCase ? (
                    <div>
                        {/* Title */}
                        <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
                            <h2 style = {{fontSize: "18px", color: "#a3a3a3"}}>
                                {selectedCase.title}
                                <span style = {{fontSize: "13px", color: "#737373", fontWeight: "400", marginLeft: "8px"}}>
                                    #{selectedCase.id}
                                </span>
                            </h2>
                            <span style = {{backgroundColor: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "4px 10px", borderRadius: "4px", fontSize: "12px"}}>
                                Archived
                            </span>
                        </div>

                        {/* Status and priority badges */}
                        <div style = {{display: "flex", gap: "8px", marginBottom: "1rem", alignItems: "center"}}>
                            <span style = {{backgroundColor: "#141414", border: "1px solid #262626", color: "#a3a3a3", padding: "4px 10px", borderRadius: "4px", fontSize: "12px"}}>
                                {selectedCase.status}
                            </span>
                            {selectedCase.category && (
                                <span style = {{backgroundColor: "#141414", border: "1px solid #262626", color: "#a3a3a3", padding: "4px 10px", borderRadius: "4px", fontSize: "12px"}}>
                                    {selectedCase.category}
                                </span>
                            )}
                            <span style = {{
                                backgroundColor: selectedCase.priority === "high" ? "rgba(239,68,68,0.1)" : selectedCase.priority === "medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                color: selectedCase.priority === "high" ? "#ef4444" : selectedCase.priority === "medium" ? "#f59e0b" : "#10b981",
                                padding: "4px 10px", borderRadius: "4px", fontSize: "12px"
                            }}>
                                {selectedCase.priority} priority
                            </span>
                        </div>

                        <hr style = {{borderColor: "#262626", margin: "1rem 0"}} />

                        {/* Description */}
                        <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                            <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                                Description
                            </p>
                            <p style = {{color: "#a3a3a3", fontSize: "13px", lineHeight: "1.6"}}>
                                {selectedCase.description}
                            </p>
                        </div>

                        {/* AI part */}
                        {selectedCase.summary && (
                            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px"}}>
                                    🜎 AI Augmentation
                                </p>
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#737373"}}>Classification</span>
                                    <p style = {{fontSize: "13px", color: "#a3a3a3", marginTop: "4px"}}>{selectedCase.category || "Not classified"}</p>
                                </div>
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#737373"}}>Summary</span>
                                    <p style = {{fontSize: "13px", color: "#a3a3a3", marginTop: "4px", lineHeight: "1.5"}}>{selectedCase.summary}</p>
                                </div>
                                <div>
                                    <span style = {{fontSize: "12px", color: "#737373"}}>Recommendations</span>
                                    <div style = {{fontSize: "13px", color: "#a3a3a3", marginTop: "8px", lineHeight: "1.8"}}>
                                        <ReactMarkdown
                                            components={{
                                                ol: ({node, ...props}) => <ol style = {{paddingLeft: "13px", margin: "0"}} {...props} />,
                                                ul: ({node, ...props}) => <ul style = {{paddingLeft: "13px", margin: "0"}} {...props} />,
                                                li: ({node, ...props}) => <li style = {{marginBottom: "8px"}} {...props} />,
                                                p: ({node, ...props}) => <p style = {{margin: "0"}} {...props} />
                                            }}
                                        >
                                            {selectedCase.recommendation || "No recommendations"}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style = {{color: "#a3a3a3", marginTop: "2rem"}}>
                        Select a case to view details
                    </div>
                )}
            </div>
        </div>
    )
}