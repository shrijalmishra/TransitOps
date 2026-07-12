import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Wrench, XCircle, AlertTriangle } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type { Maintenance, MaintenanceStatus, Vehicle } from '../types'
import { MAINTENANCE_STATUSES, MAINTENANCE_TYPES } from '../types'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../utils/statusHelpers'

interface MaintenanceForm {
  vehicleId: string
  type: string
  description: string
  cost: string
  startDate: string
  endDate: string
  status: MaintenanceStatus
}

const emptyForm: MaintenanceForm = {
  vehicleId: '',
  type: 'Oil Change',
  description: '',
  cost: '',
  startDate: '',
  endDate: '',
  status: 'Active',
}

const Maintenance = () => {
  const { success, error: toastError } = useToast()
  const [records, setRecords] = useState<Maintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<MaintenanceForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MaintenanceForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        api.get<Maintenance[]>('/maintenance'),
        api.get<Vehicle[]>('/vehicles'),
      ])
      setRecords(maintenanceRes.data)
      setVehicles(vehiclesRes.data)
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
    setForm(emptyForm)
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof MaintenanceForm, string>> = {}
    if (!form.vehicleId) errs.vehicleId = 'Select a vehicle.'
    if (!form.startDate) errs.startDate = 'Start date is required.'
    const cost = Number(form.cost)
    if (form.cost === '' || Number.isNaN(cost) || cost < 0)
      errs.cost = 'Enter a valid cost (≥ 0).'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post<Maintenance>('/maintenance', {
        vehicleId: Number(form.vehicleId),
        type: form.type,
        description: form.description.trim() || undefined,
        cost: Number(form.cost),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        status: form.status,
      })
      success('Maintenance scheduled successfully.')
      setModalOpen(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async (record: Maintenance) => {
    if (!window.confirm(`Close maintenance record #${record.id}?`)) return
    try {
      await api.put<Maintenance>(`/maintenance/${record.id}/close`, {
        endDate: new Date().toISOString().slice(0, 10),
      })
      success('Maintenance record closed.')
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const filtered = useMemo(
    () =>
      records.filter((m) =>
        `${m.vehicle?.registrationNumber ?? m.vehicleId} ${m.description ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [records, search],
  )

  const vehicleOptions = vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name}`,
  }))

  const columns: Column<Maintenance>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (m) =>
        m.vehicle ? (
          <div>
            <div className="font-medium text-slate-100">
              {m.vehicle.registrationNumber}
            </div>
            <div className="text-xs text-slate-400">{m.vehicle.name}</div>
          </div>
        ) : (
          <span>V-{m.vehicleId}</span>
        ),
    },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (m) => (
        <span className="line-clamp-1">{m.description || '—'}</span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (m) => formatDate(m.startDate),
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      render: (m) => m.endDate ? formatDate(m.endDate) : '—',
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (m) => formatCurrency(m.cost),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <Badge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (m) =>
        m.status === 'Active' ? (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
              onClick={() => handleClose(m)}
            >
              <XCircle className="h-3.5 w-3.5" /> Close
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <Wrench className="h-6 w-6 text-amber-500" /> Maintenance
          </h1>
          <p className="text-sm text-slate-400">Track service, repairs and inspections</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Schedule Service
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vehicle or description..."
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
          getRowId={(m) => String(m.id)}
          pageSize={8}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Schedule Service"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Schedule
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Vehicle"
            value={form.vehicleId}
            onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
            placeholder="Select vehicle"
            options={vehicleOptions}
            error={formErrors.vehicleId}
            disabled={submitting}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={MAINTENANCE_TYPES.map((t) => ({ value: t, label: t }))}
              disabled={submitting}
            />
            <Input
              label="Cost (₹)"
              type="number"
              min={0}
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              error={formErrors.cost}
              disabled={submitting}
            />
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              error={formErrors.startDate}
              disabled={submitting}
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as MaintenanceStatus }))
            }
            options={MAINTENANCE_STATUSES.map((s) => ({ value: s, label: s }))}
            disabled={submitting}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Brake pad replacement"
              disabled={submitting}
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Marking as Active will set the vehicle to In Shop.
          </p>
        </form>
      </Modal>
    </div>
  )
}

export default Maintenance
