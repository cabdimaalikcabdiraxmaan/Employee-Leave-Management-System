import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { departmentApi } from '../api/client'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    departmentApi
      .list()
      .then((res) => setDepartments(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await departmentApi.create(form)
      setForm({ name: '', description: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create department')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return
    try {
      await departmentApi.remove(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add department'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-semibold">New department</h3>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid md:grid-cols-2 gap-3">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg"
              />
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
              Create
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <p className="p-4 text-slate-500">Loading...</p>
          ) : departments.length === 0 ? (
            <p className="p-4 text-slate-500">No departments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="p-3 font-medium">{d.name}</td>
                    <td className="p-3">{d.description || '—'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded"
                      >
                        Delete
                      </button>
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
