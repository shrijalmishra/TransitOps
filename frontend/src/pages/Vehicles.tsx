import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Pencil, PowerOff } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type { Vehicle, VehicleStatus, VehicleType } from '../types'
import {
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
} from '../types'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatNumber } from '../utils/statusHelpers'

interface VehicleForm {
  registrationNumber: string
  name: string
  type: VehicleType
  maxLoadCapacity: string
  odometer: string
  acquisitionCost: string
  status: VehicleStatus
}

const emptyForm: VehicleForm = {
  registrationNumber: '',
  name: '',
  type: 'Light Commercial',
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available',
}

const Vehicles = () => {
  const { success, error: toastError } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Vehicle[]>('/vehicles')
      setVehicles(res.data)
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

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle)
    setForm({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: String(vehicle.maxLoadCapacity),
      odometer: String(vehicle.odometer),
      acquisitionCost: String(vehicle.acquisitionCost),
      status: vehicle.status,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof VehicleForm, string>> = {}
    if (!form.registrationNumber.trim())
      errs.registrationNumber = 'Registration number is required.'
    if (!form.name.trim()) errs.name = 'Name is required.'
    const loadCapacity = Number(form.maxLoadCapacity)
    if (form.maxLoadCapacity === '' || Number.isNaN(loadCapacity) || loadCapacity < 0)
      errs.maxLoadCapacity = 'Enter a valid capacity (≥ 0).'
    const odo = Number(form.odometer)
    if (form.odometer === '' || Number.isNaN(odo) || odo < 0)
      errs.odometer = 'Enter a valid odometer (≥ 0).'
    const cost = Number(form.acquisitionCost)
    if (form.acquisitionCost === '' || Number.isNaN(cost) || cost < 0)
      errs.acquisitionCost = 'Enter a valid cost (≥ 0).'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const payload = {
      registrationNumber: form.registrationNumber.trim(),
      name: form.name.trim(),
      type: form.type,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      odometer: Number(form.odometer),
      acquisitionCost: Number(form.acquisitionCost),
      status: form.status,
    }
    try {
      if (editing) {
        await api.put<Vehicle>(`/vehicles/${editing.id}`, payload)
        success('Vehicle updated successfully.')
      } else {
        await api.post<Vehicle>('/vehicles', payload)
        success('Vehicle created successfully.')
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetire = async (vehicle: Vehicle) => {
    if (!window.confirm(`Retire vehicle ${vehicle.registrationNumber}? This sets its status to Retired.`))
      return
    try {
      await api.put<Vehicle>(`/vehicles/${vehicle.id}`, { status: 'Retired' })
      success(`${vehicle.registrationNumber} retired.`)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const filtered = useMemo(
    () =>
      vehicles.filter((v) =>
        `${v.registrationNumber} ${v.name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [vehicles, search],
  )

  const columns: Column<Vehicle>[] = [
    { key: 'registrationNumber', header: 'Registration #', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'maxLoadCapacity',
      header: 'Max Load (kg)',
      sortable: true,
      render: (v) => formatNumber(v.maxLoadCapacity),
    },
    {
      key: 'odometer',
      header: 'Odometer (km)',
      sortable: true,
      render: (v) => formatNumber(v.odometer),
    },
    {
      key: 'acquisitionCost',
      header: 'Acquisition Cost',
      sortable: true,
      render: (v) => formatCurrency(v.acquisitionCost),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => <Badge status={v.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Vehicles</h1>
          <p className="text-sm text-slate-400">Manage your fleet inventory</p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by registration or name..."
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
          getRowId={(v) => String(v.id)}
          pageSize={8}
          emptyMessage="No vehicles found."
          actions={(v) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(v)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:bg-rose-500/10"
                onClick={() => handleRetire(v)}
                title="Retire"
              >
                <PowerOff className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editing ? 'Save Changes' : 'Create Vehicle'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registration Number"
            value={form.registrationNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, registrationNumber: e.target.value }))
            }
            error={formErrors.registrationNumber}
            placeholder="e.g. MH-01-AB-1234"
            disabled={submitting}
          />
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            placeholder="e.g. Tata Ace #1"
            disabled={submitting}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value as VehicleType }))
            }
            options={VEHICLE_TYPES.map((t) => ({ value: t, label: t }))}
            disabled={submitting}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Max Load (kg)"
              type="number"
              min={0}
              value={form.maxLoadCapacity}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxLoadCapacity: e.target.value }))
              }
              error={formErrors.maxLoadCapacity}
              disabled={submitting}
            />
            <Input
              label="Odometer (km)"
              type="number"
              min={0}
              value={form.odometer}
              onChange={(e) => setForm((f) => ({ ...f, odometer: e.target.value }))}
              error={formErrors.odometer}
              disabled={submitting}
            />
            <Input
              label="Acquisition Cost (₹)"
              type="number"
              min={0}
              value={form.acquisitionCost}
              onChange={(e) =>
                setForm((f) => ({ ...f, acquisitionCost: e.target.value }))
              }
              error={formErrors.acquisitionCost}
              disabled={submitting}
            />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as VehicleStatus }))
            }
            options={VEHICLE_STATUSES.map((s) => ({ value: s, label: s }))}
            disabled={submitting}
          />
        </form>
      </Modal>
    </div>
  )
}

export default Vehicles
