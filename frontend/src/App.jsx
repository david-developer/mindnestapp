import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoutes'

export default function APP(){
  return (
    <Routes>
      <Route path="/login" element= {<Login />} />0
      <Route path="/signup" element= {<Signup />} />
      <Route path="/dashboard" element= {
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }
















/*export default function App() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-green-700">
        MindNest is coming 🌿
      </h1>
    </div>
  )
}*/