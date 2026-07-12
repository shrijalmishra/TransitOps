import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Reports from './pages/Reports'

const RoleProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-amber-500" />
      </div>
    )
  }
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        element={
          <RoleProtectedRoute>
            <Layout />
          </RoleProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst']}><Vehicles /></RoleProtectedRoute>} />
        <Route path="/drivers" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst']}><Drivers /></RoleProtectedRoute>} />
        <Route path="/trips" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst', 'Driver']}><Trips /></RoleProtectedRoute>} />
        <Route path="/maintenance" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer']}><Maintenance /></RoleProtectedRoute>} />
        <Route path="/fuel-expenses" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Financial Analyst']}><FuelExpenses /></RoleProtectedRoute>} />
        <Route path="/reports" element={<RoleProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Financial Analyst', 'Safety Officer']}><Reports /></RoleProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
