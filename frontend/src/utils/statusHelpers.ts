export function formatNumber(value: number): string {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) {
    return '0'
  }

  return new Intl.NumberFormat('en-IN').format(numberValue)
}

export function formatCurrency(value: number): string {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) {
    return '₹0'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numberValue)
}

export function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function getStatusLabel(status: string): string {
  return status
}

export function getStatusClassName(status: string): string {
  const map: Record<string, string> = {
    Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'On Trip': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'In Shop': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Retired: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    Draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    Dispatched: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Suspended: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Off Duty': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Toll: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Other: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  }

  return map[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
}

export function isLicenseExpired(date: string): boolean {
  const expiry = new Date(date)
  if (Number.isNaN(expiry.getTime())) {
    return false
  }

  const today = new Date()
  return expiry.getTime() < today.getTime()
}

export function isLicenseExpiringSoon(date: string, thresholdDays: number = 30): boolean {
  const expiry = new Date(date)
  if (Number.isNaN(expiry.getTime())) {
    return false
  }

  const today = new Date()
  const diffInMs = expiry.getTime() - today.getTime()
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

  return diffInDays >= 0 && diffInDays <= thresholdDays
}

export function getInitials(name: string): string {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
