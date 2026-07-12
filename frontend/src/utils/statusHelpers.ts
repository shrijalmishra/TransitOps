type StatusStyle = { label: string; className: string }

const STATUS_STYLES: Record<string, StatusStyle> = {
  Available: {
    label: 'Available',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  'On Trip': {
    label: 'On Trip',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  'In Shop': {
    label: 'In Shop',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  Retired: {
    label: 'Retired',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  Dispatched: {
    label: 'Dispatched',
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  'Off Duty': {
    label: 'Off Duty',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  },
  Suspended: {
    label: 'Suspended',
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  Active: {
    label: 'Active',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  Toll: {
    label: 'Toll',
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  Maintenance: {
    label: 'Maintenance',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  Other: {
    label: 'Other',
    className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
}

const DEFAULT_STYLE: StatusStyle = {
  label: 'Unknown',
  className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

export function getStatusLabel(status: string): string {
  return STATUS_STYLES[status]?.label ?? status
}

export function getStatusClassName(status: string): string {
  return (STATUS_STYLES[status] ?? DEFAULT_STYLE).className
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number, precise = false): string {
  if (value == null || Number.isNaN(value)) return '₹0'
  return (precise ? currencyFormatterPrecise : currencyFormatter).format(value)
}

export function formatNumber(value: number): string {
  if (value == null || Number.isNaN(value)) return '0'
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isLicenseExpiringSoon(
  expiryDate: string,
  days = 30,
): boolean {
  const d = new Date(expiryDate)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  const threshold = new Date()
  threshold.setDate(now.getDate() + days)
  return d >= now && d <= threshold
}

export function isLicenseExpired(expiryDate: string): boolean {
  const d = new Date(expiryDate)
  if (Number.isNaN(d.getTime())) return false
  return d < new Date()
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}
