import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { departmentApi, employeeApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/format'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  position: '',
  departmentId: '',
  role: 'EMPLOYEE',
}

export default function Employees() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(null)
  const [error, setError] = useState('')
  const [editError, setEditError] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      employeeApi.list({ q: search || undefined, perPage: 50 }),
      departmentApi.list(),
    ])
      .then(([empRes, deptRes]) => {
        setEmployees(empRes.data.data || empRes.data)
        setDepartments(deptRes.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      }
      await employeeApi.create(payload)
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee')
    }
  }

  const openEdit = (employee) => {
    setEditError('')
    setEditForm({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      password: '',
      phone: employee.phone || '',
      position: employee.position || '',
      departmentId: employee.departmentId ? String(employee.departmentId) : '',
      role: employee.role,
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setEditError('')
    try {
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || undefined,
        position: editForm.position || undefined,
        role: editForm.role,
        departmentId: editForm.departmentId ? Number(editForm.departmentId) : null,
      }
      if (editForm.password) payload.password = editForm.password
      await employeeApi.update(editForm.id, payload)
      setEditForm(null)
      load()
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update employee')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return
    try {
      await employeeApi.remove(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Employees</h2>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Add employee'}
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
          />
          <button type="submit" className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
            Search
          </button>
        </form>

        {isAdmin && showForm && (
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-semibold">New employee</h3>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid md:grid-cols-3 gap-3">
              <input required placeholder="First name" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <input required placeholder="Last name" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <input required type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <input placeholder="Password (default: password123)" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <input placeholder="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <input placeholder="Position" value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg" />
              <select value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg">
                <option value="">— Department —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="p-2 border border-slate-300 rounded-lg">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
              Create
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          {loading ? (
            <p className="p-4 text-slate-500">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Position</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="p-3">{e.firstName} {e.lastName}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3">{e.department?.name || '—'}</td>
                    <td className="p-3">{e.role}</td>
                    <td className="p-3">{e.position || '—'}</td>
                    <td className="p-3">
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(e)}
                            className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg">Edit employee</h3>
            {editError && <p className="text-sm text-red-600">{editError}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">First name</label>
                <input required value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Last name</label>
                <input required value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">Email</label>
                <input required type="email" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Phone</label>
                <input value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Position</label>
                <input value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Department</label>
                <select value={editForm.departmentId}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg">
                  <option value="">— None —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Role</label>
                <select value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-600 mb-1">New password (optional)</label>
                <input type="password" value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setEditForm(null)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
