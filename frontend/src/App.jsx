import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Departments from './pages/Departments'
import Employees from './pages/Employees'
import LeaveRequests from './pages/LeaveRequests'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './context/AuthContext'

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leave-requests" element={<ProtectedRoute><LeaveRequests /></ProtectedRoute>} />
      <Route
        path="/employees"
        element={
          <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
            <Employees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Departments />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
