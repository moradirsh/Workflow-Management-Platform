import {useNavigate} from "react-router-dom"

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div style = {{minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f5f5f5", fontFamily: "system-ui, sans-serif", width: "100%"}}>

            {/* Navbar */}
            <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 1rem", borderBottom: "1px solid #262626"}}>
                <span style = {{fontSize: "16px", fontWeight: "600", color: "#f5f5f5"}}>
                    CaseFlow
                </span>
                <div style = {{display: "flex", gap: "12px"}}>
                    <button
                        onClick = {() => navigate("/login")}
                        style = {{backgroundColor: "transparent", color: "#a3a3a3", border: "1px solid #262626", borderRadius: "4px", padding: "6px 16px", cursor: "pointer", fontSize: "13px"}}
                    >
                        Login
                    </button>
                    <button
                        onClick = {() => navigate("/register")}
                        style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "6px 16px", cursor: "pointer", fontSize: "13px"}}
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Appearance of what caseflow is */}
            <div style = {{textAlign: "center", padding: "6rem 2rem 4rem"}}>
                <div style = {{display: "inline-block", backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "999px", padding: "4px 16px", fontSize: "12px", color: "#ffffff", marginBottom: "1.5rem"}}>
                    AI Augmented Case Management
                </div>
                <h1 style = {{fontSize: "52px", fontWeight: "600", color: "#f5f5f5", marginBottom: "1.5rem", lineHeight: "1.2", letterSpacing: "-1px"}}>
                    Manage cases smarter<br />
                    <span style = {{color: "#ffffff"}}>without needing to read long documents</span>
                </h1>
                <p style = {{fontSize: "18px", color: "#a3a3a3", maxWidth: "540px", margin: "0 auto 2.5rem", lineHeight: "1.7"}}>
                    CaseFlow automatically classifies, summarizes, and recommends next steps for every case. Your team can focus on resolving, not managing.
                </p>
                <div style = {{display: "flex", gap: "12px", justifyContent: "center"}}>
                    <button
                        onClick = {() => navigate("/register")}
                        style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "6px", padding: "12px 28px", cursor: "pointer", fontSize: "14px", fontWeight: "500"}}
                    >
                        Get Started Here
                    </button>
                    <button
                        onClick = {() => navigate("/login")}
                        style = {{backgroundColor: "transparent", color: "#a3a3a3", border: "1px solid #262626", borderRadius: "6px", padding: "12px 28px", cursor: "pointer", fontSize: "14px"}}
                    >
                        Sign In
                    </button>
                </div>
            </div>

            {/* Overview of what is offered */}
            <div style = {{padding: "4rem", maxWidth: "1100px", margin: "0 auto"}}>
                <p style = {{textAlign: "center", fontSize: "11px", color: "#737373", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3rem"}}>
                    Everything your team needs
                </p>
                <div style = {{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px"}}>
                    {[
                        {
                            icon: "🜎",
                            title: "AI Classification",
                            description: "Every case is automatically classified into the right category the moment it's created. No manual tagging needed."
                        },
                        {
                            icon: "🜁",
                            title: "Smart Summaries",
                            description: "Claude instantly summarizes case descriptions so your team gets the key points without reading everything."
                        },
                        {
                            icon: "🜂",
                            title: "Actionable Recommendations",
                            description: "Get specific next steps for every case based on its classification and summary, powered by LangGraph."
                        },
                        {
                            icon: "🜃",
                            title: "File Upload & Analysis",
                            description: "Attach PDFs, Word docs, or images. The AI reads and analyzes the file content alongside the case description."
                        },
                        {
                            icon: "🜄",
                            title: "Activity Tracking",
                            description: "Every status change, reassignment, and update is logged automatically so nothing gets lost."
                        },
                        {
                            icon: "🜍",
                            title: "Team Collaboration",
                            description: "Assign cases, leave comments, and track who did what. Makes it all in one place without switching tools."
                        }
                    ].map((feature) => (
                        <div
                            key = {feature.title}
                            style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "1.5rem"}}
                        >
                            <div style = {{fontSize: "20px", marginBottom: "12px", color: "#ffffff"}}>
                                {feature.icon}
                            </div>
                            <h3 style = {{fontSize: "14px", fontWeight: "500", color: "#f5f5f5", marginBottom: "8px"}}>
                                {feature.title}
                            </h3>
                            <p style = {{fontSize: "13px", color: "#a3a3a3", lineHeight: "1.6"}}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Direct user to acc creation */}
            <div style = {{textAlign: "center", padding: "4rem 2rem 6rem", backgroundColor: "#0a0a0a"}}>
                <h2 style = {{fontSize: "32px", fontWeight: "600", color: "#f5f5f5", marginBottom: "1rem"}}>
                    Ready to get started?
                </h2>
                <p style = {{fontSize: "15px", color: "#a3a3a3", marginBottom: "2rem"}}>
                    Create an account and start managing cases smarter today.
                </p>
                <button
                    onClick = {() => navigate("/register")}
                    style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "6px", padding: "12px 32px", cursor: "pointer", fontSize: "14px", fontWeight: "500"}}
                >
                    Create Free Account
                </button>
            </div>

            <div style = {{borderTop: "1px solid #262626", backgroundColor: "#0a0a0a", padding: "1.5rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <span style = {{fontSize: "13px", color: "#737373"}}>
                    CaseFlow
                </span>
                <span style = {{fontSize: "12px", color: "#737373"}}>
                    Dont look here
                </span>
            </div>
        </div>
    )
}