import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoutes'
import Journal from './pages/Journal'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import Circle from './pages/Circle'
import Counselors from './pages/Counselors'


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
      <Route path="/journal" element={
        <PrivateRoute>
          <Journal />
        </PrivateRoute>
      } />

      <Route path="/insights" element={
        <PrivateRoute>
        <Insights />
      </PrivateRoute>
    } />

    <Route path="/profile" element={
        <PrivateRoute>
        <Profile />
      </PrivateRoute>
    } />

    <Route path="/circle" element={
        <PrivateRoute>
        <Circle />
      </PrivateRoute>
    } />

    <Route path="/counselors" element={
        <PrivateRoute>
        <Counselors />
      </PrivateRoute>
    } />
      

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