import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {AuthProvider} from "./context/AuthContext"
import './index.css'
import App from './App.jsx'


// Entire app is wrapped with BrowserRouter for routing
// Wrap the app with AuthProvider to provide authentication context to all components
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
