import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Pencil, Ban, ShieldAlert, ShieldCheck } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type { Driver, DriverStatus } from '../types'
import { DRIVER_STATUSES, LICENSE_CATEGORIES } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import {
  formatDate,
  isLicenseExpired,
  isLicenseExpiringSoon,
} from '../utils/statusHelpers'

interface DriverForm {
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore: string
  status: DriverStatus
}

const emptyForm: DriverForm = {
  name: '',
  licenseNumber: '',
  licenseCategory: 'LMV',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: '100',
  status: 'Available',
}

const scoreColor = (score: number) =>
  score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'

const Drivers = () => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const canManage = user?.role === 'Admin' || user?.role === 'Fleet Manager' || user?.role === 'Safety Officer'

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [form, setForm] = useState<DriverForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DriverForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Driver[]>('/drivers')
      setDrivers(res.data)
      setError(null)
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg)
      toastError(msg)
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (driver: Driver) => {
    setEditing(driver)
    setForm({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate.slice(0, 10),
      contactNumber: driver.contactNumber,
      safetyScore: String(driver.safetyScore),
      status: driver.status,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof DriverForm, string>> = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.licenseNumber.trim())
      errs.licenseNumber = 'License number is required.'
    if (!form.licenseExpiryDate) errs.licenseExpiryDate = 'Expiry date is required.'
    if (!form.contactNumber.trim())
      errs.contactNumber = 'Contact number is required.'
    const score = Number(form.safetyScore)
    if (
      form.safetyScore === '' ||
      Number.isNaN(score) ||
      score < 0 ||
      score > 100
    )
      errs.safetyScore = 'Enter a score between 0 and 100.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      licenseNumber: form.licenseNumber.trim(),
      licenseCategory: form.licenseCategory,
      licenseExpiryDate: form.licenseExpiryDate,
      contactNumber: form.contactNumber.trim(),
      safetyScore: Number(form.safetyScore),
      status: form.status,
    }
    try {
      if (editing) {
        await api.put<Driver>(`/drivers/${editing.id}`, payload)
        success('Driver updated successfully.')
      } else {
        await api.post<Driver>('/drivers', payload)
        success('Driver created successfully.')
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuspend = async (driver: Driver) => {
    if (!window.confirm(`Suspend driver ${driver.name}?`)) return
    try {
      await api.delete(`/drivers/${driver.id}`)
      success(`${driver.name} suspended.`)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const handleReactivate = async (driver: Driver) => {
    try {
      await api.put<Driver>(`/drivers/${driver.id}`, { status: 'Available' })
      success(`${driver.name} reactivated.`)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const filtered = useMemo(
    () =>
      drivers.filter((d) =>
        `${d.name} ${d.licenseNumber} ${d.contactNumber}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [drivers, search],
  )

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (d) => <span className="font-medium text-slate-100">{d.name}</span>,
    },
    { key: 'licenseNumber', header: 'License #', sortable: true },
    { key: 'licenseCategory', header: 'Category', sortable: true },
    {
      key: 'licenseExpiryDate',
      header: 'License Expiry',
      sortable: true,
      render: (d) => {
        const expired = isLicenseExpired(d.licenseExpiryDate)
        const soon = isLicenseExpiringSoon(d.licenseExpiryDate, 30)
        return (
          <span className="inline-flex items-center gap-1.5">
            {expired ? (
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            ) : soon ? (
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            )}
            <span className={expired ? 'text-rose-400' : soon ? 'text-amber-400' : ''}>
              {formatDate(d.licenseExpiryDate)}
            </span>
          </span>
        )
      },
    },
    { key: 'contactNumber', header: 'Contact', sortable: true },
    {
      key: 'safetyScore',
      header: 'Safety Score',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full ${scoreColor(d.safetyScore)}`}
              style={{ width: `${d.safetyScore}%` }}
            />
          </div>
          <span className="text-xs text-slate-300">{d.safetyScore}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (d) => <Badge status={d.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Drivers</h1>
          <p className="text-sm text-slate-400">Manage driver roster and licenses</p>
        </div>
        {canManage && (
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Driver
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, license or contact..."
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl border border-slate-700 bg-slate-800" />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          getRowId={(d) => String(d.id)}
          pageSize={8}
          emptyMessage="No drivers found."
          actions={canManage ? (d) => (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(d)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              {d.status === 'Suspended' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => handleReactivate(d)}
                  title="Reactivate"
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:bg-rose-500/10"
                  onClick={() => handleSuspend(d)}
                  title="Suspend"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : undefined}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Driver' : 'Add Driver'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editing ? 'Save Changes' : 'Create Driver'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={formErrors.name}
              disabled={submitting}
            />
            <Input
              label="License Number"
              value={form.licenseNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, licenseNumber: e.target.value }))
              }
              error={formErrors.licenseNumber}
              disabled={submitting}
            />
            <Select
              label="License Category"
              value={form.licenseCategory}
              onChange={(e) =>
                setForm((f) => ({ ...f, licenseCategory: e.target.value }))
              }
              options={LICENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              disabled={submitting}
            />
            <Input
              label="License Expiry Date"
              type="date"
              value={form.licenseExpiryDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, licenseExpiryDate: e.target.value }))
              }
              error={formErrors.licenseExpiryDate}
              disabled={submitting}
            />
            <Input
              label="Contact Number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactNumber: e.target.value }))
              }
              error={formErrors.contactNumber}
              disabled={submitting}
            />
            <Input
              label="Safety Score (0-100)"
              type="number"
              min={0}
              max={100}
              value={form.safetyScore}
              onChange={(e) =>
                setForm((f) => ({ ...f, safetyScore: e.target.value }))
              }
              error={formErrors.safetyScore}
              disabled={submitting}
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as DriverStatus }))
            }
            options={DRIVER_STATUSES.map((s) => ({ value: s, label: s }))}
            disabled={submitting}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Drivers
