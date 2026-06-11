export default function InactivityWarning({ onStayActive }) {
    return (
        <div style = {{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999}}>
            <div style = {{backgroundColor: "#141414", border: "1px solid #262626", borderRadius: "8px", padding: "2rem", width: "400px", textAlign: "center"}}>
                <p style = {{fontSize: "18px", color: "#ffffff", marginBottom: "8px", fontWeight: "500"}}>
                    Are you still there?
                </p>
                <p style = {{fontSize: "13px", color: "#a3a3a3", marginBottom: "1.5rem"}}>
                    You'll be logged out in 2 minutes due to inactivity.
                </p>
                <button
                    onClick = {onStayActive}
                    style = {{backgroundColor: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: "4px", padding: "10px 24px", cursor: "pointer", fontSize: "13px"}}
                >
                    Stay Logged In
                </button>
            </div>
        </div>
    )
}