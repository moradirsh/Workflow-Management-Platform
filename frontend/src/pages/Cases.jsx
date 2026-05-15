import {useState, useEffect} from "react";
import {getCases, updateCase, deleteCase, createCase} from "../api/cases";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar"

export default function Cases() {
    // Store list of cases, loaading state, and selected case for details view
    const [cases, setCases] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCase, setSelectedCase] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [newCase, setNewCase] = useState({title: "", description: "", priority: "low"})

    // Fetch all cases when page loads
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await getCases();
                setCases(response.data);
            } catch (err) {
                console.error("Error fetching cases:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, [])

    // Handle creating a new case
    const handleCreateCase = async () => {
        try {
            const response = await createCase(newCase)
            setCases([...cases, response.data])
            setNewCase({title: "", description: "", priority: "low"})
            setShowForm(false)
        } catch (err) {
            console.error("Error creating case:", err)
            alert("Failed to create case")
        }
    }

    if (loading) {return <div>Loading...</div>}

    return (

        <div style = {{display: "flex", flexDirection: "row", height: "100vh"}}>

                {/* Sidebar */}
                <Sidebar />

                {/* Case list panel */}
                <div style = {{width: "300px", minWidth: "300px", borderRight: "1px solid #2e303a", overflowY: "auto", backgroundColor: "#0f1117", display: "flex", flexDirection: "column"}}>

                    {/* New case button */}
                    <div style = {{padding: "12px 16px", borderBottom: "1px solid #2e303a", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <span style = {{fontSize: "13px", fontWeight: "500", color: "#f3f4f6"}}>
                            Cases
                        </span>
                        <button
                            onClick = {() => setShowForm(!showForm)}
                            style = {{backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer"}}
                        >
                            + New
                        </button>
                    </div>

                    {/* Create case form */}
                    {showForm && (
                        <div style = {{padding: "1rem", borderBottom: "1px solid #2e303a", backgroundColor: "#1e2030"}}>
                            <input
                                type = "text"
                                placeholder = "Title"
                                value = {newCase.title}
                                onChange = {(e) => setNewCase({...newCase, title: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box"}}
                            />
                            <textarea
                                placeholder = "Description"
                                value = {newCase.description}
                                onChange = {(e) => setNewCase({...newCase, description: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box", resize: "vertical"}}
                            />
                            <select
                                value = {newCase.priority}
                                onChange = {(e) => setNewCase({...newCase, priority: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box"}}
                            >
                                <option value = "low">Low</option>
                                <option value = "medium">Medium</option>
                                <option value = "high">High</option>
                            </select>
                            <button
                                onClick = {handleCreateCase}
                                style = {{width: "100%", padding: "6px", backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px"}}
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Case items */}
                    {cases.map((c) => (
                        <div
                            key = {c.id}
                            onClick = {() => setSelectedCase(c)}
                            style = {{
                                padding: "12px 16px",
                                borderBottom: "1px solid #2e303a",
                                cursor: "pointer",
                                backgroundColor: selectedCase?.id === c.id ? "#1e2030" : "transparent",
                                borderLeft: selectedCase?.id === c.id ? "2px solid #a78bfa" : "2px solid transparent"
                            }}
                        >
                            <div style = {{fontSize: "11px", color: "#6b7280", marginBottom: "4px"}}>
                                #{c.id}
                            </div>
                            <div style = {{fontWeight: "500", fontSize: "13px", color: "#f3f4f6", marginBottom: "4px"}}>
                                {c.title}
                            </div>
                            <div style = {{fontSize: "12px", color: "#9ca3af"}}>
                                <span style = {{color: c.priority === "high" ? "#ef4444" : c.priority === "medium" ? "#f59e0b" : "#10b981"}}>
                                    ●
                                </span>
                                {c.status} · {c.priority}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Case detail panel */}
                <div style = {{flex: 1, padding: "2rem", overflowY: "auto"}}>
                    {selectedCase ? (
                        <div>
                            {/* Title and delete button */}
                            <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
                                <h2 style = {{fontSize: "18px"}}>
                                    {selectedCase.title}
                                    <span style = {{fontSize: "13px", color: "#6b7280", fontWeight: "400", marginLeft: "8px"}}>
                                        #{selectedCase.id}
                                    </span>
                                </h2>
                                <button
                                    onClick = {async () => {
                                        try {
                                            await deleteCase(selectedCase.id)
                                            setCases(prev => prev.filter(c => c.id !== selectedCase.id))
                                            setSelectedCase(null)
                                        } catch (err) {
                                            console.error("Error deleting case:", err)
                                        }
                                    }}
                                    style = {{color: "#ef4444", background: "none", border: "1px solid #ef4444", padding: "4px 10px", cursor: "pointer", borderRadius: "4px", fontSize: "12px"}}
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Status badges for (open, in progress, resolved) */}
                            <div style = {{display: "flex", gap: "8px", marginBottom: "1rem", alignItems: "center"}}>
                                <select
                                    value = {selectedCase.status}
                                    onChange = {async (e) => {
                                        const newStatus = e.target.value
                                        try {
                                            await updateCase(selectedCase.id, {status: newStatus})
                                            setSelectedCase({...selectedCase, status: newStatus})
                                            setCases(prev => prev.map(c => c.id === selectedCase.id ? {...c, status: newStatus} : c))
                                        } catch (err) {
                                            console.error("Error updating case status:", err)
                                        }
                                    }}
                                    style = {{
                                        backgroundColor: "#1e2030",
                                        border: "1px solid #2e303a",
                                        color: "#f3f4f6",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "12px"
                                    }}
                                >
                                    <option value = "open">Open</option>
                                    <option value = "in progress">In Progress</option>
                                    <option value = "resolved">Resolved</option>
                                </select>

                                {/* Category badge */}
                                {selectedCase.category && (
                                    <span style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", color: "#9ca3af", padding: "4px 10px", borderRadius: "4px", fontSize: "12px"}}>
                                        {selectedCase.category}
                                    </span>
                                )}

                                {/* Priority badge (low, medium, high) */}
                                <span style = {{
                                    backgroundColor: selectedCase.priority === "high" ? "rgba(239,68,68,0.1)" : selectedCase.priority === "medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                                    color: selectedCase.priority === "high" ? "#ef4444" : selectedCase.priority === "medium" ? "#f59e0b" : "#10b981",
                                    padding: "4px 10px",
                                    borderRadius: "4px",
                                    fontSize: "12px"
                                }}>
                                    {selectedCase.priority} priority
                                </span>
                            </div>

                            <hr style = {{borderColor: "#2e303a", margin: "1rem 0"}} />

                            {/* Description */}
                            <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                                    Description
                                </p>
                                <p style = {{color: "#9ca3af", fontSize: "13px", lineHeight: "1.6"}}>
                                    {selectedCase.description}
                                </p>
                            </div>

                            {/* AI Augmentation background */}
                            <div style = {{backgroundColor: "#1e2030", border: "1px solid #7c3aed", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                <p style = {{fontSize: "11px", fontWeight: "500", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px"}}>
                                    ⊙ AI Augmentation
                                </p>

                                {/* Classification */}
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                        Classification
                                    </span>
                                    <p style = {{fontSize: "12px", color: "#f3f4f6", marginTop: "4px"}}>
                                        {selectedCase.category || "Not classified"}
                                    </p>
                                </div>

                                {/* Summary */}
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                        Summary
                                    </span>
                                    <p style = {{fontSize: "12px", color: "#f3f4f6", marginTop: "4px", lineHeight: "1.5"}}>
                                        {selectedCase.summary || "No summary"}
                                    </p>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                        Recommendations
                                    </span>
                                    <div style = {{fontSize: "12px", color: "#f3f4f6", marginTop: "4px", lineHeight: "1.6"}}>
                                        <ReactMarkdown
                                            components={{
                                                ol: ({node, ...props}) => <ol style = {{paddingLeft: "13px", margin: "0"}} {...props} />, // for alignment of AI recommendations
                                                ul: ({node, ...props}) => <ul style = {{paddingLeft: "13px", margin: "0"}} {...props} />,
                                                p: ({node, ...props}) => <p style = {{margin: "0"}} {...props} />
                                            }}
                                        >
                                            {selectedCase.recommendation || "No recommendations"}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div style = {{color: "#6b7280", marginTop: "2rem"}}>
                            Select a case to view details
                        </div>
                    )}
                </div>
            </div>     
    )
}