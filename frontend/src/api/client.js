import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/') window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (data) => client.post('/auth/register', data),
  profile: () => client.get('/auth/profile'),
}

export const leaveApi = {
  list: (params) => client.get('/leave-requests', { params }),
  create: (data) => client.post('/leave-requests', data),
  update: (id, data) => client.put(`/leave-requests/${id}`, data),
  remove: (id) => client.delete(`/leave-requests/${id}`),
  approve: (id) => client.post(`/leave-requests/${id}/approve`),
  reject: (id, rejectionReason) => client.post(`/leave-requests/${id}/reject`, { rejectionReason }),
}

export const employeeApi = {
  list: (params) => client.get('/employees', { params }),
  create: (data) => client.post('/employees', data),
  update: (id, data) => client.put(`/employees/${id}`, data),
  remove: (id) => client.delete(`/employees/${id}`),
}

export const departmentApi = {
  list: () => client.get('/departments'),
  create: (data) => client.post('/departments', data),
  update: (id, data) => client.put(`/departments/${id}`, data),
  remove: (id) => client.delete(`/departments/${id}`),
}

export default client
