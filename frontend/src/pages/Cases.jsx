import {useState, useEffect} from "react";
import {getCases, updateCase, deleteCase, createCase, getUsers, getCaseActivity, downloadFile, getComments, addComment} from "../api/cases";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar"

export default function Cases() {
    // States for view re-redner frontend when an update happens
    const [users, setUsers] = useState([])
    const [cases, setCases] = useState([])
    const [myCases, setMyCases] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedCase, setSelectedCase] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [newCase, setNewCase] = useState({title: "", description: "", priority: "low"})
    const [search, setSearch] = useState("")
    const [activity, setActivity] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [showActivity, setShowActivity] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [showComments, setShowComments] = useState(false)
    const [creating, setCreating] = useState(false)

    // Fetch all cases when page loads
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await getCases();
                setCases(response.data);
            } 
            catch (err) {
                console.error("Error fetching cases:", err);
            } 
            finally {
                setLoading(false);
            }
        }
        fetchCases();
    }, [])

    // Fetch all users
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [casesRes, usersRes] = await Promise.all([getCases(myCases), getUsers()])
                setCases(casesRes.data)
                setUsers(usersRes.data)
            } 
            catch (err) {
                console.error("Error fetching data:", err)
            } 
            finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [myCases])

    // Handle creating a new case
    const handleCreateCase = async () => {
        // Ensure title is provided as db cannot have it null
        if (!newCase.title) {
            alert("Title is required")
            return 
        }
        setCreating(true)
        try {
            const response = await createCase(newCase, selectedFile)
            setCases([...cases, response.data])
            setNewCase({title: "", description: "", priority: "low"})
            setSelectedFile(null)
            setShowForm(false)
        } 
        catch (err) {
            console.error("Error creating case:", err)
            alert("Failed to create case")
        }
        finally {
            setCreating(false)
        }
    }

    // Updated: now fetches activity and comments
    const handleSelectCase = async (c) => {
        setSelectedCase(c)
        setShowActivity(false)
        try {
            const [activityRes, commentsRes] = await Promise.all([
            getCaseActivity(c.id),
            getComments(c.id)
            ])
        setActivity(activityRes.data)
        setComments(commentsRes.data)
        }
            catch (err) {
        console.error("Error fetching activity:", err)
        }
    }

    // Filter cases by search 
    const filteredCases = cases.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

    if (loading) {return <div>Loading...</div>}

    return (

        <div style = {{display: "flex", flexDirection: "row", height: "100vh"}}>

                {/* Sidebar */}
                <Sidebar />

                {/* Case list panel */}
                <div style = {{width: "300px", minWidth: "300px", borderRight: "1px solid #2e303a", overflowY: "auto", backgroundColor: "#0f1117", display: "flex", flexDirection: "column"}}>

                    {/* Case list header */}
                    <div style = {{padding: "12px 16px", borderBottom: "1px solid #2e303a", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div style = {{display: "flex", alignItems: "center", gap: "8px"}}>
                            <span style = {{fontSize: "13px", fontWeight: "500", color: "#f3f4f6"}}>
                                Cases
                            </span>
                            <button
                                onClick = {() => setMyCases(!myCases)}
                                style = {{
                                    backgroundColor: myCases ? "#1e2030" : "#a78bfa", color: myCases ? "#9ca3af" : "#fff", border: "1px solid #2e303a", borderRadius: "4px", padding: "2px 8px",
                                    fontSize: "11px",
                                    cursor: "pointer"
                                }}
                            >
                                {myCases ? "All Cases" : "My Cases"}
                            </button>
                        </div>
                        <button
                            onClick = {() => setShowForm(!showForm)}
                            style = {{backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer"}}
                        >
                            + New
                        </button>
                    </div>

                    <div style = {{padding: "8px 16px", borderBottom: "1px solid #2e303a"}}>
                        <input
                            type = "text"
                            placeholder = "Search cases..."
                            value = {search}
                            onChange = {(e) => setSearch(e.target.value)}
                            style = {{
                                width: "100%", padding: "6px 10px", backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "4px", fontSize: "12px",
                                color: "#f3f4f6",
                                boxSizing: "border-box"
                            }}
                        />
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
                            {/* File upload */}
                            <div style = {{marginBottom: "8px"}}>
                                <input
                                    type = "file"
                                    accept = ".pdf,.docx,.doc,.jpg,.jpeg,.png"
                                    onChange = {(e) => setSelectedFile(e.target.files[0])}
                                    style = {{display: "block", width: "100%", fontSize: "12px", color: "#9ca3af"}}
                                />
                                {selectedFile && (
                                    <p style = {{fontSize: "11px", color: "#a78bfa", marginTop: "4px"}}>
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick = {handleCreateCase}
                                disabled = {creating}
                                style = {{width: "100%", padding: "6px", backgroundColor: creating ? "#6d5fa6" : "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.8 : 1}}
                            >
                                {creating ? "Creating... AI is analyzing" : "Create"}
                            </button>
                        </div>
                    )}

                    {/* Case items */}
                    {filteredCases.map((c) => (
                        <div
                            key = {c.id}
                            onClick = {() => handleSelectCase(c)}
                            style = {{
                                padding: "14px 16px", borderBottom: "1px solid #2e303a", cursor: "pointer", backgroundColor: selectedCase?.id === c.id ? "#1e2030" : "transparent",
                                borderLeft: selectedCase?.id === c.id ? "2px solid #a78bfa" : "2px solid transparent"
                            }}
                        >
                            <div style = {{fontSize: "11px", color: "#6b7280", marginBottom: "6px"}}>
                                #{c.id}
                            </div>
                            <div style = {{fontWeight: "500", fontSize: "13px", color: "#f3f4f6", marginBottom: "6px", lineHeight: "1.4"}}>
                                {c.title}
                            </div>
                            <div style = {{fontSize: "12px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "6px"}}>
                                <span style = {{color: c.priority === "high" ? "#ef4444" : c.priority === "medium" ? "#f59e0b" : "#10b981", fontSize: "8px"}}>
                                    ●
                                </span>
                                {c.status} · {c.priority}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Case detail panel */}
                <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0f1117"}}>
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
                                        // Will be confirmation to delete case
                                        const confirmed = window.confirm("Are you sure you want to delete this case? This action is irreversible.")
                                        if (!confirmed) return
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
                                                    
                                            
                                            const activityRes = await getCaseActivity(selectedCase.id)
                                            setActivity(activityRes.data)
                                            }
                                        
                                        catch (err) {
                                            console.error("Error updating case status:", err)
                                        }
                                    }}
                                    style = {{
                                        backgroundColor: "#1e2030", border: "1px solid #2e303a", color: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", fontSize: "12px"}}
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

                            {/* Assign to user */}
                            <div style = {{marginTop: "1rem", marginBottom: "1rem"}}>
                                <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                    Assigned to:
                                </span>
                                <select
                                    value = {selectedCase.assignee_id || ""}
                                    onChange = {async (e) => {
                                        const assigneeId = e.target.value ? parseInt(e.target.value) : null
                                        const assigneeName = users.find(u => u.id === assigneeId)?.name || "Unassigned"
                                        try {
                                            const res = await updateCase(selectedCase.id, {assignee_id: assigneeId})
                                            setSelectedCase({...selectedCase, assignee_id: assigneeId})
                                            setCases(prev => prev.map(c => c.id === selectedCase.id ? {...c, assignee_id: assigneeId} : c))
                                                
                                            // Refetch activity after assignee update
                                            const activityRes = await getCaseActivity(selectedCase.id)
                                            setActivity(activityRes.data)
                                        }
                                        catch (err) {
                                            console.error("Error updating assignee:", err)
                                        }
                                    }}
                                    style = {{marginLeft: "8px",  backgroundColor: "#1e2030", border: "1px solid #2e303a", color: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", fontSize: "12px"}}>
                                    <option value = "">Unassigned</option>
                                    {users.map(u => (
                                        <option key = {u.id} value = {u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
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

                            {/* When user attatches file */}
                            {selectedCase.file_name && (
                                <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                                        Attached File
                                    </p>
                                    <div style = {{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                        <span style = {{fontSize: "13px", color: "#d1d5db"}}>
                                            {selectedCase.file_name}
                                        </span>
                                        <button
                                            onClick = {async () => {
                                                try {
                                                    const res = await downloadFile(selectedCase.id)
                                                    // Create a download link and click it
                                                    const url = window.URL.createObjectURL(new Blob([res.data]))
                                                    const link = document.createElement('a')
                                                    link.href = url
                                                    link.setAttribute('download', selectedCase.file_name)
                                                    document.body.appendChild(link)
                                                    link.click()
                                                    link.remove()
                                                } catch (err) {
                                                    console.error("Error downloading file:", err)
                                                }
                                            }}
                                            style = {{backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer"}}
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            )}

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
                                    <p style = {{fontSize: "13px", color: "#f3f4f6", marginTop: "4px"}}>
                                        {selectedCase.category || "Not classified"}
                                    </p>
                                </div>

                                {/* Summary */}
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                        Summary
                                    </span>
                                    <p style = {{fontSize: "13px", color: "#f3f4f6", marginTop: "4px", lineHeight: "1.5"}}>
                                        {selectedCase.summary || "No summary"}
                                    </p>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <span style = {{fontSize: "12px", color: "#6b7280"}}>
                                        Recommendations
                                    </span>
                                    <div style = {{fontSize: "13px", color: "#f3f4f6", marginTop: "8px", lineHeight: "1.8"}}>
                                        <ReactMarkdown
                                            components={{
                                                ol: ({node, ...props}) => <ol style = {{paddingLeft: "13px", margin: "0"}} {...props} />, // Componenets for alignment of AI recommendations
                                                ul: ({node, ...props}) => <ul style = {{paddingLeft: "13px", margin: "0"}} {...props} />,
                                                li: ({node, ...props}) => <li style = {{marginBottom: "8px"}} {...props} />,
                                                strong: ({node, ...props}) => <strong style = {{color: "#f3f4f6"}} {...props} />,
                                                p: ({node, ...props}) => <p style = {{margin: "0"}} {...props} />
                                            }}>
                                            {selectedCase.recommendation || "No recommendations"}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Activity log */}
                            <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                {/* Clickable header */}
                                <div
                                    onClick = {() => setShowActivity(!showActivity)}
                                    style = {{display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: showActivity ? "12px" : "0"}}
                                >
                                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em"}}>
                                        Activity ({activity.length})
                                    </p>
                                    <span style = {{fontSize: "11px", color: "#6b7280"}}>
                                        {showActivity ? "▲" : "▼"}
                                    </span>
                                </div>
                                {showActivity && (
                                    activity.length > 0 ? (
                                        activity.map((log) => (
                                            <div
                                                key = {log.id}
                                                style = {{display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start"}}
                                            >
                                                <div style = {{width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#a78bfa", marginTop: "4px", flexShrink: 0}} />
                                                <div>
                                                    <p style = {{fontSize: "12px", color: "#d1d5db", marginBottom: "2px"}}> 
                                                        {/* Alteration of display for user changing user, user changing assignment progress */}
                                                        {log.details?.changed_by && (
                                                            <span style = {{color: "#a78bfa"}}>{log.details.changed_by} </span>
                                                        )}
                                                        {log.action.replace(/_/g, " ")}
                                                        {log.details?.changes?.status && (
                                                            <span> → <span style = {{color: "#a78bfa"}}>{log.details.changes.previous_status}</span> to <span style = {{color: "#a78bfa"}}>{log.details.changes.status}</span></span>
                                                        )}
                                                        {log.details?.changes?.assignee_id && (
                                                            <span> → assigned to <span style = {{color: "#a78bfa"}}>{log.details.changes.assignee_name}</span></span>
                                                        )}
                                                        {log.details?.changes?.assignee_id === null && ` → unassigned`}
                                                    </p>
                                                    <p style = {{fontSize: "11px", color: "#6b7280"}}>
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style = {{fontSize: "12px", color: "#6b7280"}}>
                                            No activity yet
                                        </p>
                                        )
                                    )}
                            </div>
                                {/* Comments section */}
                                <div style = {{backgroundColor: "#1e2030", border: "1px solid #2e303a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                    
                                    {/* Clickable header */}
                                    <div
                                        onClick = {() => setShowComments(!showComments)}
                                        style = {{display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: showComments ? "12px" : "0"}}
                                    >
                                        <p style = {{fontSize: "11px", fontWeight: "500", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em"}}>
                                            Comments ({comments.length})
                                        </p>
                                        <span style = {{fontSize: "11px", color: "#6b7280"}}>
                                            {showComments ? "▲" : "▼"}
                                        </span>
                                    </div>

                                    {/* Only show when expanded */}
                                    {showComments && (
                                        <div>
                                            {comments.length > 0 ? (
                                                comments.map((comment) => (
                                                    <div
                                                        key = {comment.id}
                                                        style = {{borderBottom: "1px solid #2e303a", paddingBottom: "10px", marginBottom: "10px"}}
                                                    >
                                                        <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px"}}>
                                                            <span style = {{fontSize: "12px", color: "#a78bfa", fontWeight: "500"}}>
                                                                {comment.author_name}
                                                            </span>
                                                            <span style = {{fontSize: "11px", color: "#6b7280"}}>
                                                                {new Date(comment.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p style = {{fontSize: "13px", color: "#d1d5db", lineHeight: "1.5"}}>
                                                            {comment.body}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style = {{fontSize: "12px", color: "#6b7280", marginBottom: "12px"}}>
                                                    No comments yet
                                                </p>
                                            )}

                                            {/* Add comment input */}
                                            <div style = {{marginTop: "12px"}}>
                                                <textarea
                                                    placeholder = "Add a comment..."
                                                    value = {newComment}
                                                    onChange = {(e) => setNewComment(e.target.value)}
                                                    style = {{
                                                        display: "block", width: "100%", padding: "8px", backgroundColor: "#0f1117",
                                                        border: "1px solid #2e303a", borderRadius: "4px", color: "#f3f4f6",
                                                        fontSize: "13px", resize: "vertical", boxSizing: "border-box", marginBottom: "8px"
                                                    }}
                                                />
                                                <button
                                                    onClick = {async () => {
                                                        if (!newComment.trim()) return
                                                        try {
                                                            const res = await addComment(selectedCase.id, {body: newComment})
                                                            setComments([...comments, res.data])
                                                            setNewComment("")
                                                        } catch (err) {
                                                            console.error("Error adding comment:", err)
                                                        }
                                                    }}
                                                    style = {{backgroundColor: "#a78bfa", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 16px", fontSize: "12px", cursor: "pointer"}}
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    )}
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