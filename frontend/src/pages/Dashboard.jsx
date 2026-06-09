import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { leaveApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDate, statusColor } from '../utils/format'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leaveApi
      .list()
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false))
  }, [])

  const pending = requests.filter((r) => r.status === 'PENDING')
  const approved = requests.filter((r) => r.status === 'APPROVED')
  const rejected = requests.filter((r) => r.status === 'REJECTED')

  const stats = [
    { label: 'Pending', value: pending.length, color: 'text-amber-600' },
    { label: 'Approved', value: approved.length, color: 'text-green-600' },
    { label: 'Rejected', value: rejected.length, color: 'text-red-600' },
    { label: 'Total', value: requests.length, color: 'text-blue-600' },
  ]

  const recent = requests.slice(0, 5)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Welcome back, {profile?.firstName}.{' '}
            {user?.role === 'MANAGER' || user?.role === 'ADMIN'
              ? 'Review pending leave requests below.'
              : 'Track your leave requests below.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Recent leave requests</h3>
          </div>
          {loading ? (
            <p className="p-4 text-slate-500">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="p-4 text-slate-500">No leave requests yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                    <th className="text-left p-3">Employee</th>
                  )}
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Dates</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                      <td className="p-3">
                        {r.employee?.firstName} {r.employee?.lastName}
                      </td>
                    )}
                    <td className="p-3">{r.leaveType}</td>
                    <td className="p-3">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
