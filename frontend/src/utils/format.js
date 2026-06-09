export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString()
}

export const LEAVE_TYPES = ['ANNUAL', 'SICK', 'EMERGENCY', 'RESIGNATION', 'OTHER']

export const LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED']

export const ROLES = ['EMPLOYEE', 'MANAGER', 'ADMIN']

export function statusColor(status) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-amber-100 text-amber-800'
  }
}
