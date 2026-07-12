import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Search, Fuel, Receipt } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type {
  Expense,
  ExpenseType,
  FuelLog,
  Trip,
  Vehicle,
} from '../types'
import { EXPENSE_TYPES } from '../types'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import { formatCurrency, formatDate, formatNumber } from '../utils/statusHelpers'

const today = () => new Date().toISOString().slice(0, 10)

interface FuelForm {
  vehicleId: string
  tripId: string
  liters: string
  costPerLiter: string
  totalCost: string
  date: string
}

const emptyFuel: FuelForm = {
  vehicleId: '',
  tripId: '',
  liters: '',
  costPerLiter: '',
  totalCost: '',
  date: today(),
}

interface ExpenseForm {
  vehicleId: string
  tripId: string
  type: ExpenseType
  amount: string
  description: string
  date: string
}

const emptyExpense: ExpenseForm = {
  vehicleId: '',
  tripId: '',
  type: 'Toll',
  amount: '',
  description: '',
  date: today(),
}

const FuelExpenses = () => {
  const { success, error: toastError } = useToast()
  const [tab, setTab] = useState<'fuel' | 'expenses'>('fuel')
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [fuelModal, setFuelModal] = useState(false)
  const [fuelForm, setFuelForm] = useState<FuelForm>(emptyFuel)
  const [fuelErrors, setFuelErrors] = useState<
    Partial<Record<keyof FuelForm, string>>
  >({})
  const [fuelSubmitting, setFuelSubmitting] = useState(false)

  const [expenseModal, setExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpense)
  const [expenseErrors, setExpenseErrors] = useState<
    Partial<Record<keyof ExpenseForm, string>>
  >({})
  const [expenseSubmitting, setExpenseSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [fuelRes, expenseRes, vehiclesRes, tripsRes] = await Promise.all([
        api.get<FuelLog[]>('/fuel-expenses/fuel-logs'),
        api.get<Expense[]>('/fuel-expenses/expenses'),
        api.get<Vehicle[]>('/vehicles'),
        api.get<Trip[]>('/trips'),
      ])
      setFuelLogs(fuelRes.data)
      setExpenses(expenseRes.data)
      setVehicles(vehiclesRes.data)
      setTrips(tripsRes.data)
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

  const vehicleOptions = vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name}`,
  }))

  const tripOptions = trips
    .filter((t) => t.status === 'Draft' || t.status === 'Dispatched')
    .map((t) => ({
      value: String(t.id),
      label: `#${t.id}: ${t.source} → ${t.destination}`,
    }))

  const tripLabel = (tripId?: number) => {
    if (!tripId) return '—'
    const t = trips.find((x) => x.id === tripId)
    return t ? `${t.source} → ${t.destination}` : '—'
  }

  const totalFuel = useMemo(
    () => fuelLogs.reduce((s, f) => s + Number(f.totalCost), 0),
    [fuelLogs],
  )
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses],
  )

  const fuelFiltered = useMemo(
    () =>
      fuelLogs.filter((f) =>
        `${f.vehicle?.registrationNumber ?? f.vehicleId}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [fuelLogs, search],
  )
  const expenseFiltered = useMemo(
    () =>
      expenses.filter((e) =>
        `${e.vehicle?.registrationNumber ?? e.vehicleId} ${e.description ?? ''} ${e.type}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [expenses, search],
  )

  const openFuel = () => {
    setFuelForm(emptyFuel)
    setFuelErrors({})
    setFuelModal(true)
  }
  const closeFuel = () => {
    if (fuelSubmitting) return
    setFuelModal(false)
  }

  const updateFuel = (key: keyof FuelForm, val: string) => {
    setFuelForm((f) => {
      const next = { ...f, [key]: val }
      if (key === 'liters' || key === 'costPerLiter') {
        const l = Number(next.liters)
        const c = Number(next.costPerLiter)
        if (!Number.isNaN(l) && !Number.isNaN(c)) {
          next.totalCost = (l * c).toFixed(2)
        }
      }
      return next
    })
  }

  const validateFuel = (): boolean => {
    const errs: Partial<Record<keyof FuelForm, string>> = {}
    if (!fuelForm.vehicleId) errs.vehicleId = 'Select a vehicle.'
    const liters = Number(fuelForm.liters)
    if (fuelForm.liters === '' || Number.isNaN(liters) || liters <= 0)
      errs.liters = 'Enter liters (> 0).'
    const cpl = Number(fuelForm.costPerLiter)
    if (fuelForm.costPerLiter === '' || Number.isNaN(cpl) || cpl < 0)
      errs.costPerLiter = 'Enter cost/liter (≥ 0).'
    const tc = Number(fuelForm.totalCost)
    if (fuelForm.totalCost === '' || Number.isNaN(tc) || tc < 0)
      errs.totalCost = 'Enter total cost (≥ 0).'
    setFuelErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submitFuel = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateFuel()) return
    setFuelSubmitting(true)
    try {
      await api.post<FuelLog>('/fuel-expenses/fuel-logs', {
        vehicleId: Number(fuelForm.vehicleId),
        tripId: fuelForm.tripId ? Number(fuelForm.tripId) : undefined,
        liters: Number(fuelForm.liters),
        costPerLiter: Number(fuelForm.costPerLiter),
        totalCost: Number(fuelForm.totalCost),
        date: fuelForm.date,
      })
      success('Fuel log added.')
      setFuelModal(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setFuelSubmitting(false)
    }
  }

  const openExpense = () => {
    setExpenseForm(emptyExpense)
    setExpenseErrors({})
    setExpenseModal(true)
  }
  const closeExpense = () => {
    if (expenseSubmitting) return
    setExpenseModal(false)
  }

  const validateExpense = (): boolean => {
    const errs: Partial<Record<keyof ExpenseForm, string>> = {}
    if (!expenseForm.vehicleId) errs.vehicleId = 'Select a vehicle.'
    const amount = Number(expenseForm.amount)
    if (expenseForm.amount === '' || Number.isNaN(amount) || amount < 0)
      errs.amount = 'Enter amount (≥ 0).'
    setExpenseErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submitExpense = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateExpense()) return
    setExpenseSubmitting(true)
    try {
      await api.post<Expense>('/fuel-expenses/expenses', {
        vehicleId: Number(expenseForm.vehicleId),
        tripId: expenseForm.tripId ? Number(expenseForm.tripId) : undefined,
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        description: expenseForm.description.trim() || undefined,
        date: expenseForm.date,
      })
      success('Expense added.')
      setExpenseModal(false)
      await load()
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setExpenseSubmitting(false)
    }
  }

  const fuelColumns: Column<FuelLog>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (f) => f.vehicle?.registrationNumber ?? `V-${f.vehicleId}`,
    },
    {
      key: 'trip',
      header: 'Trip',
      sortable: true,
      render: (f) => tripLabel(f.tripId),
    },
    { key: 'date', header: 'Date', sortable: true, render: (f) => formatDate(f.date) },
    {
      key: 'liters',
      header: 'Liters',
      sortable: true,
      render: (f) => formatNumber(f.liters),
    },
    {
      key: 'costPerLiter',
      header: 'Cost/L (₹)',
      sortable: true,
      render: (f) => formatCurrency(f.costPerLiter),
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      sortable: true,
      render: (f) => formatCurrency(f.totalCost),
    },
  ]

  const expenseColumns: Column<Expense>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (e) => e.vehicle?.registrationNumber ?? `V-${e.vehicleId}`,
    },
    {
      key: 'trip',
      header: 'Trip',
      sortable: true,
      render: (e) => tripLabel(e.tripId),
    },
    { key: 'type', header: 'Type', sortable: true, render: (e) => <Badge status={e.type} /> },
    {
      key: 'description',
      header: 'Description',
      render: (e) => <span className="line-clamp-1">{e.description || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (e) => formatCurrency(e.amount),
    },
    { key: 'date', header: 'Date', sortable: true, render: (e) => formatDate(e.date) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <Fuel className="h-6 w-6 text-blue-500" /> Fuel &amp; Expenses
          </h1>
          <p className="text-sm text-slate-400">Monitor fuel consumption and operating costs</p>
        </div>
        <Button className="gap-2" onClick={tab === 'fuel' ? openFuel : openExpense}>
          <Plus className="h-4 w-4" /> Add {tab === 'fuel' ? 'Fuel Log' : 'Expense'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl glass-panel p-5">
          <p className="text-sm text-slate-400">Total Fuel Spend</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">{formatCurrency(totalFuel)}</p>
        </div>
        <div className="rounded-xl glass-panel p-5">
          <p className="text-sm text-slate-400">Total Operating Expenses</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['fuel', 'expenses'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t === 'fuel' ? <Fuel className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
            {t === 'fuel' ? 'Fuel Logs' : 'Expenses'}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none"
          />
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl glass-panel" />
      ) : tab === 'fuel' ? (
        <Table
          columns={fuelColumns}
          data={fuelFiltered}
          getRowId={(f) => String(f.id)}
          pageSize={8}
        />
      ) : (
        <Table
          columns={expenseColumns}
          data={expenseFiltered}
          getRowId={(e) => String(e.id)}
          pageSize={8}
        />
      )}

      <Modal
        open={fuelModal}
        onClose={closeFuel}
        title="Add Fuel Log"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeFuel} disabled={fuelSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitFuel} loading={fuelSubmitting}>
              Add Fuel Log
            </Button>
          </>
        }
      >
        <form onSubmit={submitFuel} className="space-y-4">
          <Select
            label="Vehicle"
            value={fuelForm.vehicleId}
            onChange={(e) => updateFuel('vehicleId', e.target.value)}
            placeholder="Select vehicle"
            options={vehicleOptions}
            error={fuelErrors.vehicleId}
            disabled={fuelSubmitting}
          />
          <Select
            label="Trip (optional)"
            value={fuelForm.tripId}
            onChange={(e) => updateFuel('tripId', e.target.value)}
            placeholder="None"
            options={tripOptions}
            disabled={fuelSubmitting}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Liters"
              type="number"
              min={0}
              value={fuelForm.liters}
              onChange={(e) => updateFuel('liters', e.target.value)}
              error={fuelErrors.liters}
              disabled={fuelSubmitting}
            />
            <Input
              label="Cost / Liter (₹)"
              type="number"
              min={0}
              value={fuelForm.costPerLiter}
              onChange={(e) => updateFuel('costPerLiter', e.target.value)}
              error={fuelErrors.costPerLiter}
              disabled={fuelSubmitting}
            />
            <Input
              label="Total Cost (₹)"
              type="number"
              min={0}
              value={fuelForm.totalCost}
              onChange={(e) => updateFuel('totalCost', e.target.value)}
              error={fuelErrors.totalCost}
              disabled={fuelSubmitting}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={fuelForm.date}
            onChange={(e) => updateFuel('date', e.target.value)}
            disabled={fuelSubmitting}
          />
        </form>
      </Modal>

      <Modal
        open={expenseModal}
        onClose={closeExpense}
        title="Add Expense"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeExpense} disabled={expenseSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitExpense} loading={expenseSubmitting}>
              Add Expense
            </Button>
          </>
        }
      >
        <form onSubmit={submitExpense} className="space-y-4">
          <Select
            label="Vehicle"
            value={expenseForm.vehicleId}
            onChange={(e) =>
              setExpenseForm((f) => ({ ...f, vehicleId: e.target.value }))
            }
            placeholder="Select vehicle"
            options={vehicleOptions}
            error={expenseErrors.vehicleId}
            disabled={expenseSubmitting}
          />
          <Select
            label="Trip (optional)"
            value={expenseForm.tripId}
            onChange={(e) =>
              setExpenseForm((f) => ({ ...f, tripId: e.target.value }))
            }
            placeholder="None"
            options={tripOptions}
            disabled={expenseSubmitting}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={expenseForm.type}
              onChange={(e) =>
                setExpenseForm((f) => ({ ...f, type: e.target.value as ExpenseType }))
              }
              options={EXPENSE_TYPES.map((t) => ({ value: t, label: t }))}
              disabled={expenseSubmitting}
            />
            <Input
              label="Amount (₹)"
              type="number"
              min={0}
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm((f) => ({ ...f, amount: e.target.value }))
              }
              error={expenseErrors.amount}
              disabled={expenseSubmitting}
            />
          </div>
          <Input
            label="Description"
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="e.g. Highway tolls - June"
            disabled={expenseSubmitting}
          />
          <Input
            label="Date"
            type="date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
            disabled={expenseSubmitting}
          />
        </form>
      </Modal>
    </div>
  )
}

export default FuelExpenses
