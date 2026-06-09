import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { leaveApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDate, LEAVE_TYPES, statusColor } from '../utils/format'

const emptyForm = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' }

export default function LeaveRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const canReview = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  const load = () => {
    setLoading(true)
    leaveApi
      .list(filter ? { status: filter } : {})
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await leaveApi.create(form)
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request')
    }
  }

  const handleApprove = async (id) => {
    try {
      await leaveApi.approve(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve')
    }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    try {
      await leaveApi.reject(rejectId, rejectReason)
      setRejectId(null)
      setRejectReason('')
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this leave request?')) return
    try {
      await leaveApi.remove(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Leave Requests</h2>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'New request'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-semibold">Submit leave request</h3>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Leave type</label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Reason (optional)</label>
                <input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Start date</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">End date</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
              Submit
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          {loading ? (
            <p className="p-4 text-slate-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="p-4 text-slate-500">No leave requests found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {canReview && <th className="text-left p-3">Employee</th>}
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Dates</th>
                  <th className="text-left p-3">Reason</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    {canReview && (
                      <td className="p-3">
                        {r.employee?.firstName} {r.employee?.lastName}
                      </td>
                    )}
                    <td className="p-3">{r.leaveType}</td>
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </td>
                    <td className="p-3 max-w-xs truncate">{r.reason || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                      {r.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{r.rejectionReason}</p>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {canReview && r.status === 'PENDING' && r.employeeId !== user.id && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectId(r.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {r.status === 'PENDING' && (user.role === 'EMPLOYEE' ? r.employeeId === user.id : true) && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded text-slate-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleReject} className="bg-white p-6 rounded-xl w-full max-w-md space-y-3">
            <h3 className="font-semibold">Reject leave request</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full p-2 border border-slate-300 rounded-lg"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setRejectId(null)} className="px-4 py-2 text-sm border rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">
                Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
