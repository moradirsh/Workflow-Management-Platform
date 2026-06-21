import {useState, useEffect, useRef} from "react"
import {useNavigate} from "react-router-dom"

const INACTIVE_LIMIT = 15 * 60 * 1000 // 15 mins
const WARNING_TIME = 2 * 60  * 1000

export function useInactivity() {
    const [showWarning, setShowWarning] = useState(false)
    const navigate = useNavigate()
    const inactiveTimer = useRef(null)
    const warningTimer = useRef(null)
    const resetTimers = () => {

        clearTimeout(inactiveTimer.current)
        clearTimeout(warningTimer.current)
        setShowWarning(false)

        // Both timers first one is warning, second one clears token and logs user out and clears warning prior to logging out
        warningTimer.current = setTimeout(() => {
            setShowWarning(true)
        }, INACTIVE_LIMIT - WARNING_TIME)
        inactiveTimer.current = setTimeout(() => {
            setShowWarning(false)
            localStorage.removeItem("token")
            navigate("/login")
        }, INACTIVE_LIMIT)
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            setShowWarning(false)
            clearTimeout(inactiveTimer.current)
            clearTimeout(warningTimer.current)
            return
        }

        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
        events.forEach(e => document.addEventListener(e, resetTimers))
        resetTimers()
        
        return () => {
            events.forEach(e => document.removeEventListener(e, resetTimers))
            clearTimeout(inactiveTimer.current)
            clearTimeout(warningTimer.current)
        }
    }, [])

    return { showWarning, resetTimers }
}