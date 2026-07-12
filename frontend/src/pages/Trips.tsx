import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Plus, Search, Send, XCircle, CheckCircle2, Eye } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type { Driver, Trip, TripStatus, Vehicle } from '../types'
import { TRIP_STATUSES } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatDate, formatNumber } from '../utils/statusHelpers'

interface TripForm {
  source: string
  destination: string
  cargoWeight: string
  plannedDistance: string
  vehicleId: string
  driverId: string
}

const emptyForm: TripForm = {
  source: '',
  destination: '',
  cargoWeight: '',
  plannedDistance: '',
  vehicleId: '',
  driverId: '',
}

interface CompleteForm {
  actualOdometer: string
  fuelConsumed: string
  revenue: string
}

const emptyComplete: CompleteForm = {
  actualOdometer: '',
  fuelConsumed: '',
  revenue: '',
}

const FILTERS: (TripStatus | 'All')[] = ['All', ...TRIP_STATUSES]

const Trips = () => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<TripStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  const canManage = user?.role === 'Admin' || user?.role === 'Fleet Manager'

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TripForm>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TripForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const [completeTrip, setCompleteTrip] = useState<Trip | null>(null)
  const [completeForm, setCompleteForm] = useState<CompleteForm>(emptyComplete)
  const [completeErrors, setCompleteErrors] = useState<Partial<Record<keyof CompleteForm, string>>>({})
  const [completing, setCompleting] = useState(false)

  const [summaryTrip, setSummaryTrip] = useState<Trip | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get<Trip[]>('/trips'),
        api.get<Vehicle[]>('/vehicles'),
        api.get<Driver[]>('/drivers'),
      ])
      setTrips(tripsRes.data)
      setVehicles(vehiclesRes.data)
      setDrivers(driversRes.data)
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
    const errs: Partial<Record<keyof TripForm, string>> = {}
    if (!form.source.trim()) errs.source = 'Source is required.'
    if (!form.destination.trim()) errs.destination = 'Destination is required.'
    const cargo = Number(form.cargoWeight)
    if (form.cargoWeight === '' || Number.isNaN(cargo) || cargo < 0)
      errs.cargoWeight = 'Enter a valid weight (≥ 0).'
    const dist = Number(form.plannedDistance)
    if (form.plannedDistance === '' || Number.isNaN(dist) || dist < 0)
      errs.plannedDistance = 'Enter a valid distance (≥ 0).'
    if (!form.vehicleId) errs.vehicleId = 'Select a vehicle.'
    if (!form.driverId) errs.driverId = 'Select a driver.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await api.post<Trip>('/trips', {
        source: form.source.trim(),
        destination: form.destination.trim(),
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        vehicleId: Number(form.vehicleId),
        driverId: Number(form.driverId),
      })
      success('Trip created successfully.')
      setModalOpen(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDispatch = async (trip: Trip) => {
    try {
      await api.put<Trip>(`/trips/${trip.id}/dispatch`)
      success(`Trip #${trip.id} dispatched.`)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const handleCancel = async (trip: Trip) => {
    if (!window.confirm(`Cancel trip #${trip.id}?`)) return
    try {
      await api.put<Trip>(`/trips/${trip.id}/cancel`)
      success(`Trip #${trip.id} cancelled.`)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    }
  }

  const openComplete = (trip: Trip) => {
    setCompleteTrip(trip)
    setCompleteForm(emptyComplete)
    setCompleteErrors({})
  }

  const closeComplete = () => {
    if (completing) return
    setCompleteTrip(null)
  }

  const validateComplete = (): boolean => {
    const errs: Partial<Record<keyof CompleteForm, string>> = {}
    const odo = Number(completeForm.actualOdometer)
    if (completeForm.actualOdometer === '' || Number.isNaN(odo) || odo < 0)
      errs.actualOdometer = 'Required (≥ 0).'
    const fuel = Number(completeForm.fuelConsumed)
    if (completeForm.fuelConsumed === '' || Number.isNaN(fuel) || fuel < 0)
      errs.fuelConsumed = 'Required (≥ 0).'
    const rev = Number(completeForm.revenue)
    if (completeForm.revenue === '' || Number.isNaN(rev) || rev < 0)
      errs.revenue = 'Required (≥ 0).'
    setCompleteErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleComplete = async (e: FormEvent) => {
    e.preventDefault()
    if (!completeTrip || !validateComplete()) return
    setCompleting(true)
    try {
      await api.put<Trip>(`/trips/${completeTrip.id}/complete`, {
        actualOdometer: Number(completeForm.actualOdometer),
        fuelConsumed: Number(completeForm.fuelConsumed),
        revenue: Number(completeForm.revenue),
      })
      success(`Trip #${completeTrip.id} completed.`)
      setCompleteTrip(null)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setCompleting(false)
    }
  }

  const filtered = useMemo(
    () =>
      trips
        .filter((t) => (filter === 'All' ? true : t.status === filter))
        .filter((t) =>
          `${t.source} ${t.destination} ${t.id}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
    [trips, filter, search],
  )

  const vehicleOptions = vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name}`,
  }))

  const driverOptions = drivers.map((d) => ({
    value: String(d.id),
    label: `${d.name} (${d.licenseNumber})`,
  }))

  const columns: Column<Trip>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'source', header: 'Source', sortable: true },
    { key: 'destination', header: 'Destination', sortable: true },
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (t) => t.vehicle?.registrationNumber ?? `V-${t.vehicleId}`,
    },
    {
      key: 'driver',
      header: 'Driver',
      sortable: true,
      render: (t) => t.driver?.name ?? `D-${t.driverId}`,
    },
    {
      key: 'cargoWeight',
      header: 'Cargo (kg)',
      sortable: true,
      render: (t) => formatNumber(t.cargoWeight),
    },
    {
      key: 'plannedDistance',
      header: 'Distance (km)',
      sortable: true,
      render: (t) => formatNumber(t.plannedDistance),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <Badge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {(t.status === 'Completed' || t.status === 'Cancelled') && (
            <Button variant="ghost" size="sm" onClick={() => setSummaryTrip(t)} title="View summary">
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canManage && t.status === 'Draft' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1"
                onClick={() => handleDispatch(t)}
              >
                <Send className="h-3.5 w-3.5" /> Dispatch
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:bg-rose-500/10"
                onClick={() => handleCancel(t)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {canManage && t.status === 'Dispatched' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1"
                onClick={() => openComplete(t)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-400 hover:bg-rose-500/10"
                onClick={() => handleCancel(t)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trips</h1>
          <p className="text-sm text-slate-400">Plan and track fleet trips</p>
        </div>
        {canManage && (
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f === 'All' ? 'All' : f}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
          />
        </div>
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
          getRowId={(t) => String(t.id)}
          pageSize={8}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="New Trip"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Create Trip
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Source"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              error={formErrors.source}
              disabled={submitting}
            />
            <Input
              label="Destination"
              value={form.destination}
              onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
              error={formErrors.destination}
              disabled={submitting}
            />
            <Input
              label="Cargo Weight (kg)"
              type="number"
              min={0}
              value={form.cargoWeight}
              onChange={(e) => setForm((f) => ({ ...f, cargoWeight: e.target.value }))}
              error={formErrors.cargoWeight}
              disabled={submitting}
            />
            <Input
              label="Planned Distance (km)"
              type="number"
              min={0}
              value={form.plannedDistance}
              onChange={(e) =>
                setForm((f) => ({ ...f, plannedDistance: e.target.value }))
              }
              error={formErrors.plannedDistance}
              disabled={submitting}
            />
            <Select
              label="Vehicle"
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
              placeholder="Select vehicle"
              options={vehicleOptions}
              error={formErrors.vehicleId}
              disabled={submitting}
            />
            <Select
              label="Driver"
              value={form.driverId}
              onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}
              placeholder="Select driver"
              options={driverOptions}
              error={formErrors.driverId}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={completeTrip !== null}
        onClose={closeComplete}
        title={`Complete Trip #${completeTrip?.id ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={closeComplete} disabled={completing}>
              Cancel
            </Button>
            <Button onClick={handleComplete} loading={completing}>
              Complete Trip
            </Button>
          </>
        }
      >
        <form onSubmit={handleComplete} className="space-y-4">
          <Input
            label="Actual Odometer"
            type="number"
            min={0}
            value={completeForm.actualOdometer}
            onChange={(e) =>
              setCompleteForm((f) => ({ ...f, actualOdometer: e.target.value }))
            }
            error={completeErrors.actualOdometer}
            disabled={completing}
          />
          <Input
            label="Fuel Consumed"
            type="number"
            min={0}
            value={completeForm.fuelConsumed}
            onChange={(e) =>
              setCompleteForm((f) => ({ ...f, fuelConsumed: e.target.value }))
            }
            error={completeErrors.fuelConsumed}
            disabled={completing}
          />
          <Input
            label="Revenue (₹)"
            type="number"
            min={0}
            value={completeForm.revenue}
            onChange={(e) =>
              setCompleteForm((f) => ({ ...f, revenue: e.target.value }))
            }
            error={completeErrors.revenue}
            disabled={completing}
          />
        </form>
      </Modal>

      <Modal open={summaryTrip !== null} onClose={() => setSummaryTrip(null)} title={`Trip #${summaryTrip?.id ?? ''} Summary`}>
        {summaryTrip && (
          <div className="space-y-3 text-sm">
            <SummaryRow label="Status">
              <Badge status={summaryTrip.status} />
            </SummaryRow>
            <SummaryRow label="Route">
              {summaryTrip.source} → {summaryTrip.destination}
            </SummaryRow>
            <SummaryRow label="Vehicle">
              {summaryTrip.vehicle?.registrationNumber ?? `V-${summaryTrip.vehicleId}`}
            </SummaryRow>
            <SummaryRow label="Driver">
              {summaryTrip.driver?.name ?? `D-${summaryTrip.driverId}`}
            </SummaryRow>
            <SummaryRow label="Cargo Weight">
              {formatNumber(summaryTrip.cargoWeight)} kg
            </SummaryRow>
            <SummaryRow label="Planned Distance">
              {formatNumber(summaryTrip.plannedDistance)} km
            </SummaryRow>
            <SummaryRow label="Actual Odometer">
              {summaryTrip.actualOdometer != null
                ? formatNumber(summaryTrip.actualOdometer)
                : '—'}
            </SummaryRow>
            <SummaryRow label="Fuel Consumed">
              {summaryTrip.fuelConsumed != null
                ? formatNumber(summaryTrip.fuelConsumed)
                : '—'}
            </SummaryRow>
            <SummaryRow label="Revenue">
              {summaryTrip.revenue != null ? formatCurrency(summaryTrip.revenue) : '—'}
            </SummaryRow>
            <SummaryRow label="Created">
              {formatDate(summaryTrip.createdAt)}
            </SummaryRow>
          </div>
        )}
      </Modal>
    </div>
  )
}

const SummaryRow = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
    <span className="text-slate-400">{label}</span>
    <span className="font-medium text-slate-100">{children}</span>
  </div>
)

export default Trips
