import {useState, useEffect} from "react";
import {getCases, updateCase, deleteCase, createCase, getUsers, getCaseActivity, downloadFile, getComments, addComment, getCase, exportCases} from "../api/cases";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar"
import {toast} from "sonner"

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
    const [priorityFilter, setPriorityFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

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
            toast.error("Title is required")
            return 
        }
        setCreating(true)
        try {
            const response = await createCase(newCase, selectedFile)
            setCases([...cases, response.data])
            setNewCase({title: "", description: "", priority: "low"})
            setSelectedFile(null)
            setShowForm(false)
            toast.success("Case created - AI analysis complete")
        } 
        catch (err) {
            console.error("Error creating case:", err)
            toast.error("Failed to create case")
        }
        finally {
            setCreating(false)
        }
    }

    // Updated: now fetches activity, comments, and who created the case
    const handleSelectCase = async (c) => {
        setSelectedCase(c)
        setShowActivity(false)
        setShowComments(false)
        try {
            const [caseRes, activityRes, commentsRes] = await Promise.all([
            getCase(c.id),
            getCaseActivity(c.id),
            getComments(c.id)
            ])
        setSelectedCase(caseRes.data) // Update selected case to pass creator name 
        setActivity(activityRes.data)
        setComments(commentsRes.data)
        }
        catch (err) {
            console.error("Error fetching activity:", err)
        }
    }

    // Now use backend search instead of frontend
    useEffect(() => {
        const fetchWithSearch = async () => {
            try {
                const res = await getCases(myCases, search, priorityFilter, statusFilter)
                setCases(res.data)
            } 
            catch (err) {
                console.error("Error searching cases:", err)
            }
        }

        // Debounce each time with 300ms so router isnt constantly spamming backend
        const timer = setTimeout(fetchWithSearch, 300)
        return () => clearTimeout(timer)
    }, [search, myCases, priorityFilter, statusFilter])

    if (loading) {return <div>Loading...</div>}

    return (

        <div style = {{display: "flex", flexDirection: "row", height: "100vh"}}>

                {/* Sidebar */}
                <Sidebar />

                {/* Case list panel */}
                <div style = {{width: "400px", borderRight: "1px solid #262626", overflowY: "auto", backgroundColor: "#0a0a0a", display: "flex", flexDirection: "column"}}>

                    {/* Case list header */}
                    <div style = {{padding: "12px 16px", borderBottom: "1px solid #262626", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <div style = {{display: "flex", alignItems: "center", gap: "8px"}}>
                            <span style = {{fontSize: "13px", fontWeight: "500", color: "#ffffff"}}>
                                Cases
                            </span>
                            <button
                                onClick = {() => setMyCases(!myCases)}
                                style = {{
                                    backgroundColor: myCases ? "#ffffff" : "#ffffff", color: myCases ? "#0a0a0a" : "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "2px 8px",
                                    fontSize: "12px",
                                    cursor: "pointer"
                                }}
                            >
                                {myCases ? "All Cases" : "My Cases"}
                            </button>
                        </div>
                        <div style = {{display: "flex", gap: "8px"}}>
                            <button
                                onClick = {() => setShowForm(!showForm)}
                                style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "2px 8px", fontSize: "12px", cursor: "pointer"}}
                            >
                                + New
                            </button>

                            {/* Export button */}
                            <button
                                onClick = {async () => {
                                    try {
                                        const res = await exportCases(myCases, search, priorityFilter, statusFilter)
                                        const url = window.URL.createObjectURL(new Blob([res.data]))
                                        const link = document.createElement('a')
                                        link.href = url
                                        link.setAttribute('download', 'cases.csv')
                                        document.body.appendChild(link)
                                        link.click()
                                        link.remove()
                                        toast.success("Cases exported")
                                    } catch (err) {
                                        toast.error("Failed to export cases")
                                    }
                                }}
                                style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "2px 8px", fontSize: "12px", cursor: "pointer"}}
                            >
                                Export
                            </button>
                        </div>
                    </div>

                    <div style = {{padding: "8px 16px", borderBottom: "1px solid #262626", display: "flex", gap: "8px"}}>
                        <input
                            type = "text"
                            placeholder = "Search cases..."
                            value = {search}
                            onChange = {(e) => setSearch(e.target.value)}
                            style = {{
                                width: "100%", padding: "6px 10px", backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", fontSize: "12px", color: "#ffffff", boxSizing: "border-box"}}
                        />
                        <select
                            value = {priorityFilter}
                            onChange = {(e) => setPriorityFilter(e.target.value)}
                            style = {{
                                backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", padding: "5px 8px", fontSize: "12px", cursor: "pointer"}}
                        >
                            <option value = "">All Priority</option>
                            <option value = "high">High</option>
                            <option value = "medium">Medium</option>
                            <option value = "low">Low</option>
                        </select>
                        <select
                            value = {statusFilter}
                            onChange = {(e) => setStatusFilter(e.target.value)}
                            style = {{
                                backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "4px", color: "#ffffff", padding: "5px 5px", fontSize: "12px", cursor: "pointer"}}
                        >
                            <option value = "">All Status</option>
                            <option value = "open">Open</option>
                            <option value = "in progress">In Progress</option>
                            <option value = "resolved">Resolved</option>
                        </select>
                    </div>

                    {/* Create case form */}
                    {showForm && (
                        <div style = {{padding: "1rem", borderBottom: "1px solid #262626", backgroundColor: "#0a0a0a"}}>
                            <input
                                type = "text"
                                placeholder = "Title"
                                value = {newCase.title}
                                onChange = {(e) => setNewCase({...newCase, title: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box", backgroundColor: "#141414"}}
                            />
                            <textarea
                                placeholder = "Description"
                                value = {newCase.description}
                                onChange = {(e) => setNewCase({...newCase, description: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box", resize: "vertical", backgroundColor: "#141414"}}
                            />
                            <select
                                value = {newCase.priority}
                                onChange = {(e) => setNewCase({...newCase, priority: e.target.value})}
                                style = {{display: "block", width: "100%", marginBottom: "8px", padding: "6px", boxSizing: "border-box", backgroundColor: "#141414"}}
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
                                    style = {{display: "block", width: "100%", fontSize: "12px", color: "#a3a3a3", backgroundColor: "#141414"}}
                                />
                                {selectedFile && (
                                    <p style = {{fontSize: "11px", color: "#ffffff", marginTop: "4px"}}>
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick = {handleCreateCase}
                                disabled = {creating}
                                style = {{width: "100%", padding: "6px", backgroundColor: creating ? "#525252" : "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.8 : 1}}
                            >
                                {creating ? "Creating... AI is analyzing" : "Create"}
                            </button>
                        </div>
                    )}

                    {/* Case items */}
                    {cases.length > 0 ? (
                        cases.map((c) => (
                            <div
                                key = {c.id}
                                onClick = {() => handleSelectCase(c)}
                                style = {{
                                    padding: "14px 16px", borderBottom: "1px solid #262626", cursor: "pointer", backgroundColor: selectedCase?.id === c.id ? "#141414" : "transparent",
                                    borderLeft: selectedCase?.id === c.id ? "2px solid #ffffff" : "2px solid transparent"
                                }}
                            >
                                <div style = {{fontSize: "11px", color: "#a3a3a3", marginBottom: "6px"}}>
                                    #{c.id}
                                </div>
                                <div style = {{fontWeight: "500", fontSize: "13px", color: "#ffffff", marginBottom: "6px", lineHeight: "1.4"}}>
                                    {c.title}
                                </div>
                                <div style = {{fontSize: "12px", color: "#a3a3a3", display: "flex", alignItems: "center", gap: "6px"}}>
                                    <span style = {{color: c.priority === "high" ? "#ef4444" : c.priority === "medium" ? "#f59e0b" : "#10b981", fontSize: "8px"}}>
                                        ●
                                    </span>
                                    {c.status} · {c.priority}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style = {{padding: "2rem", textAlign: "center"}}>
                            <p style = {{fontSize: "24px", marginBottom: "8px"}}>🜎</p>
                            <p style = {{fontSize: "13px", color: "#a3a3a3", marginBottom: "4px"}}>
                                {search ? "No cases match your search" : myCases ? "No cases assigned to you" : "No cases yet"}
                            </p>
                            <p style = {{fontSize: "12px", color: "#737373"}}>
                                {search ? "Try a different search term" : "Click + New to create your first case"}
                            </p>
                        </div>
                    )}
                    </div>

                {/* Case detail panel */}
                <div style = {{flex: 1, padding: "2rem 2.5rem", overflowY: "auto", backgroundColor: "#0a0a0a"}}>
                    {selectedCase ? (
                        <div>
                            {/* Title and delete button */}
                            <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
                                <h2 style = {{fontSize: "18px"}}>
                                    {selectedCase.title}
                                    <span style = {{fontSize: "13px", color: "#a3a3a3", fontWeight: "400", marginLeft: "8px"}}>
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
                                            toast.success("Case deleted")
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
                                            toast.success("Status Updated")
                                            }
                                        
                                        catch (err) {
                                            console.error("Error updating case status:", err)
                                        }
                                    }}
                                    style = {{
                                        backgroundColor: "#141414", border: "1px solid #262626", color: "#ffffff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px"}}
                                    >
                                    <option value = "open">Open</option>
                                    <option value = "in progress">In Progress</option>
                                    <option value = "resolved">Resolved</option>
                                </select>

                                {/* Category badge */}
                                {selectedCase.category && (
                                    <span style = {{backgroundColor: "#141414", border: "1px solid #262626", color: "#a3a3a3", padding: "4px 10px", borderRadius: "4px", fontSize: "12px"}}>
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
                                <span style = {{fontSize: "12px", color: "#a3a3a3"}}>
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
                                            toast.success("Assignee updated")
                                        }
                                        catch (err) {
                                            console.error("Error updating assignee:", err)
                                        }
                                    }}
                                    style = {{marginLeft: "8px",  backgroundColor: "#141414", border: "1px solid #262626", color: "#ffffff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px"}}>
                                    <option value = "">Unassigned</option>
                                    {users.map(u => (
                                        <option key = {u.id} value = {u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Created by */}
                            {selectedCase.created_by_name && (
                                <div style = {{marginBottom: "1rem"}}>
                                    <span style = {{fontSize: "12px", color: "#a3a3a3"}}>
                                        Created by:
                                    </span>
                                    <span style = {{fontSize: "12px", color: "#ffffff", marginLeft: "8px"}}>
                                        {selectedCase.created_by_name}
                                    </span>
                                </div>
                            )}
                            <hr style = {{borderColor: "#262626", margin: "1rem 0"}} />

                            {/* Description */}
                            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                                    Description
                                </p>
                                <p style = {{color: "#ffffff", fontSize: "13px", lineHeight: "1.6"}}>
                                    {selectedCase.description}
                                </p>
                            </div>

                            {/* When user attatches file */}
                            {selectedCase.file_name && (
                                <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px"}}>
                                        Attached File
                                    </p>
                                    <div style = {{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                        <span style = {{fontSize: "13px", color: "#ffffff"}}>
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
                                            style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "4px 10px", fontSize: "12px", cursor: "pointer"}}
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* AI background box */}
                            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                <p style = {{fontSize: "11px", fontWeight: "500", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px"}}>
                                    🜎 AI Augmentation
                                </p>

                                {/* Classification */}
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#a3a3a3"}}>
                                        Classification
                                    </span>
                                    <p style = {{fontSize: "13px", color: "#ffffff", marginTop: "4px"}}>
                                        {selectedCase.category || "Not classified"}
                                    </p>
                                </div>

                                {/* Summary */}
                                <div style = {{marginBottom: "8px"}}>
                                    <span style = {{fontSize: "12px", color: "#a3a3a3"}}>
                                        Summary
                                    </span>
                                    <p style = {{fontSize: "13px", color: "#ffffff", marginTop: "4px", lineHeight: "1.5"}}>
                                        {selectedCase.summary || "No summary"}
                                    </p>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <span style = {{fontSize: "12px", color: "#a3a3a3"}}>
                                        Recommendations
                                    </span>
                                    <div style = {{fontSize: "13px", color: "#ffffff", marginTop: "8px", lineHeight: "1.8"}}>
                                        <ReactMarkdown
                                            components={{
                                                ol: ({node, ...props}) => <ol style = {{paddingLeft: "13px", margin: "0"}} {...props} />, // Componenets for alignment of AI recommendations
                                                ul: ({node, ...props}) => <ul style = {{paddingLeft: "13px", margin: "0"}} {...props} />,
                                                li: ({node, ...props}) => <li style = {{marginBottom: "8px"}} {...props} />,
                                                strong: ({node, ...props}) => <strong style = {{color: "#ffffff"}} {...props} />,
                                                p: ({node, ...props}) => <p style = {{margin: "0"}} {...props} />
                                            }}>
                                            {selectedCase.recommendation || "No recommendations"}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Activity log */}
                            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>

                                {/* Clickable header */}
                                <div
                                    onClick = {() => setShowActivity(!showActivity)}
                                    style = {{display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: showActivity ? "12px" : "0"}}
                                >
                                    <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em"}}>
                                        Activity ({activity.length})
                                    </p>
                                    <span style = {{fontSize: "11px", color: "#a3a3a3"}}>
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
                                                <div style = {{width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ffffff", marginTop: "4px", flexShrink: 0}} />
                                                <div>
                                                    <p style = {{fontSize: "12px", color: "#ffffff", marginBottom: "2px"}}> 

                                                        {/* Alteration of display for user changing user, user changing assignment progress */}
                                                        {log.details?.changed_by && (
                                                            <span style = {{color: "#ffffff", fontWeight: "700"}}>{log.details.changed_by} </span>
                                                        )}
                                                        {log.action.replace(/_/g, " ")}
                                                        {log.details?.changes?.status && (
                                                            <span> → <span style = {{color: "#ffffff", fontWeight: "700"}}>{log.details.changes.previous_status}</span> to <span style = {{color: "#ffffff", fontWeight: "700"}}>{log.details.changes.status}</span></span>
                                                        )}
                                                        {log.details?.changes?.assignee_id && (
                                                            <span> → assigned to <span style = {{color: "#ffffff", fontWeight: "700"}}>{log.details.changes.assignee_name}</span></span>
                                                        )}
                                                        {log.details?.changes?.assignee_id === null && ` → unassigned`}
                                                    </p>
                                                    <p style = {{fontSize: "11px", color: "#a3a3a3"}}>
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style = {{fontSize: "12px", color: "#a3a3a3"}}>
                                            No activity yet
                                        </p>
                                        )
                                    )}
                            </div>
                                {/* Comments section */}
                                <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1rem", marginBottom: "1rem"}}>
                                    
                                    {/* Clickable header */}
                                    <div
                                        onClick = {() => setShowComments(!showComments)}
                                        style = {{display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: showComments ? "12px" : "0"}}
                                    >
                                        <p style = {{fontSize: "11px", fontWeight: "500", color: "#a3a3a3", textTransform: "uppercase", letterSpacing: "0.06em"}}>
                                            Comments ({comments.length})
                                        </p>
                                        <span style = {{fontSize: "11px", color: "#a3a3a3"}}>
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
                                                        style = {{borderBottom: "1px solid #262626", paddingBottom: "10px", marginBottom: "10px"}}
                                                    >
                                                        <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px"}}>
                                                            <span style = {{fontSize: "12px", color: "#ffffff", fontWeight: "700"}}>
                                                                {comment.author_name}
                                                            </span>
                                                            <span style = {{fontSize: "11px", color: "#a3a3a3"}}>
                                                                {new Date(comment.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p style = {{fontSize: "13px", color: "#ffffff", lineHeight: "1.5"}}>
                                                            {comment.body}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style = {{fontSize: "12px", color: "#a3a3a3", marginBottom: "12px"}}>
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
                                                        display: "block", width: "100%", padding: "8px", backgroundColor: "#0a0a0a",
                                                        border: "1px solid #262626", borderRadius: "4px", color: "#ffffff",
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
                                                            toast.success("Comment posted")
                                                        } catch (err) {
                                                            console.error("Error adding comment:", err)
                                                        }
                                                    }}
                                                    style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "1px solid #262626", borderRadius: "4px", padding: "6px 16px", fontSize: "12px", cursor: "pointer"}}
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
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