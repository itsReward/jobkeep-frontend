import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                {/* Set login page as default by redirecting from root path */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add your other routes here */}
            </Routes>
        </Router>
    )

}

export default App
