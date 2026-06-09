import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { departmentApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    departmentId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    departmentApi.list().catch(() => setDepartments([]))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
      }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Register as an employee</p>

        {error && (
          <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First name</label>
              <input name="firstName" required value={form.firstName} onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last name</label>
              <input name="lastName" required value={form.lastName} onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department (optional)</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 rounded-lg">
              <option value="">— Select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-slate-600">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
