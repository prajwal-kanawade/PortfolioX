import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ adminOnly = false, blockAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />
  if (blockAdmin && isAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}
