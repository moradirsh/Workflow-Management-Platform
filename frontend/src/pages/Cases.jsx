import {useState, useEffect} from "react";
import {getCases, updateCase, deleteCase, createCase} from "../api/cases";
import ReactMarkdown from "react-markdown";

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
        <div style = {{display: "flex", flexDirection: "column", height: "100vh"}}>
            <div style = {{padding: "1rem", borderBottom: "1px solid #ccc"}}>
                <button onClick = {() => setShowForm(!showForm)} style = {{width: "100%"}}>
                    + New Case
                </button>
            </div>
            {/* Create case form part */}
            {showForm && (
                <div style = {{padding: "1rem", borderBottom: "1px solid #ccc"}}>
                    <h3>Create New Case</h3>
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
                        style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box"}}
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
                    <button onClick = {handleCreateCase} style = {{width: "100%", padding: "6px"}}>
                        Create
                    </button>
                </div>
        )}
            {/* case list and details part */}
            <div style = {{display: "flex", height: "100vh"}}>
                <div style = {{width: "300px", borderRight: "1px solid #ccc", overflowY: "auto"}}>
                    <h3 style = {{padding: "1rem"}}>Cases</h3>
                    {cases.map((c) => (
                        <div
                            key={c.id}
                            onClick = {() => setSelectedCase(c)}
                            style = {{
                                padding: "1rem",
                                borderBottom: "1px solid #eee",
                                cursor: "pointer",
                                backgroundColor: selectedCase?.id === c.id ? "#f0f0f0" : "transparent"
                            }}
                        >
                        
                            <div style = {{fontSize: "11px", color: "#999"}}> #{c.id}</div>
                            <div style = {{fontWeight: "500"}}> {c.title}</div>
                            <div style = {{fontSize: "12px", color: "#666"}}> {c.status} . {c.priority}</div>
                        </div>
                    ))}
                </div>

                {/* Case detail panel part */}
                <div style = {{flex: 1, padding: "2rem", overflowY: "auto"}}>
                    {selectedCase ? (
                        <div>
                            <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <h2> {selectedCase.title} </h2>
                                <button
                                    onClick = {async () => {
                                        try {
                                            await deleteCase(selectedCase.id) // Update status in db
                                            setCases(prev => prev.filter(c => c.id !== selectedCase.id)) // Update local state so UI reflects the change
                                            setSelectedCase(null) // Refresh case list; if case was deleted it will be deselected
                                        }
                                        catch (err) {
                                            console.error("Error deleting case:", err)
                                            alert("Failed to delete case")
                                        }
                                    }}
                                    style = {{color: "red", background: "none", border: "1px solid red", padding: "6px 12px", cursor: "pointer"}}
                                >
                                    Delete
                                </button>
                            </div>

                            <p style = {{color: "#666"}}>
                                Status:
                                <select
                                    value = {selectedCase.status}
                                    onChange = {async (e) => {
                                        const newStatus = e.target.value
                                        try {
                                            await updateCase(selectedCase.id, {status: newStatus})
                                            setSelectedCase({...selectedCase, status: newStatus})
                                            setCases(prev => prev.map(c => c.id === selectedCase.id ? {...c, status: newStatus} : c))
                                        }
                                        catch (err) {
                                            console.error("Error updating case status:", err)
                                            alert("Failed to update status")
                                        }
                                    }}
                                    style = {{marginLeft: "8px"}}
                                >
                                    <option value = "open">open</option>
                                    <option value = "in progress">in progress</option>
                                    <option value = "resolved">resolved</option>
                                </select>
                                · Priority: {selectedCase.priority}
                            </p>
                            <hr/>
                            <h4>Description</h4>
                            <p>{selectedCase.description}</p>
                            <h4>Classification</h4>
                            <p>{selectedCase.category || "Not classified"}</p>
                            <h4>Summary</h4>
                            <p>{selectedCase.summary || "No summary"}</p>
                            <h4>Recommendations</h4>
                            <ReactMarkdown>{selectedCase.recommendation || "No recommendations"}</ReactMarkdown>
                        </div>
                    ) : (
                        <div style = {{color: "#999", marginTop: "2rem"}}> Select a case to view details </div>
                    )}
                </div>
            </div>
        </div>
    )
}