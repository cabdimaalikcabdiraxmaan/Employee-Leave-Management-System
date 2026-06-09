import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { to: '/leave-requests', label: 'Leave Requests', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { to: '/employees', label: 'Employees', roles: ['ADMIN', 'MANAGER'] },
  { to: '/departments', label: 'Departments', roles: ['ADMIN'] },
]

export default function Layout({ children }) {
  const { user, profile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(user?.role))

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">ELMS</h1>
            <p className="text-sm text-slate-500">Employee Leave Management</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {profile?.firstName} {profile?.lastName}
            </p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                location.pathname === item.to
                  ? 'bg-slate-50 text-blue-600 border border-b-0 border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto px-4 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Sign out
          </button>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
