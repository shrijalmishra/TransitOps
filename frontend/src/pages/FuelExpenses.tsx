import { useMemo, useState } from 'react'
import { Plus, Search, Fuel } from 'lucide-react'
import type { Expense, ExpenseCategory, FuelLog } from '../types'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDate, formatCurrency } from '../utils/statusHelpers'

const FUEL_MOCK: FuelLog[] = [
  {
    id: 'f1',
    vehicleId: 'TRK-102',
    date: '2026-07-10',
    gallons: 120,
    cost: 420,
    odometer: 132000,
    fuelType: 'diesel',
    station: 'Pilot Travel Center',
    createdAt: '2026-07-10',
    updatedAt: '2026-07-10',
  },
  {
    id: 'f2',
    vehicleId: 'TRK-101',
    date: '2026-07-08',
    gallons: 95,
    cost: 332,
    odometer: 84000,
    fuelType: 'diesel',
    station: 'Love's',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-08',
  },
]

const EXPENSE_MOCK: Expense[] = [
  {
    id: 'e1',
    category: 'insurance',
    description: 'Quarterly fleet insurance premium',
    amount: 12500,
    date: '2026-07-01',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-01',
  },
  {
    id: 'e2',
    category: 'tolls',
    description: 'Highway tolls - June',
    amount: 1850,
    date: '2026-07-02',
    createdAt: '2026-07-02',
    updatedAt: '2026-07-02',
  },
  {
    id: 'e3',
    category: 'salary',
    description: 'Driver payroll - June',
    amount: 48000,
    date: '2026-07-05',
    createdAt: '2026-07-05',
    updatedAt: '2026-07-05',
  },
]

const FuelExpenses = () => {
  const [tab, setTab] = useState<'fuel' | 'expenses'>('fuel')
  const [search, setSearch] = useState('')

  const fuelFiltered = useMemo(
    () =>
      FUEL_MOCK.filter((f) =>
        `${f.vehicleId} ${f.station ?? ''}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  )

  const expenseFiltered = useMemo(
    () =>
      EXPENSE_MOCK.filter((e) =>
        `${e.description} ${e.category}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  )

  const fuelColumns: Column<FuelLog>[] = [
    { key: 'vehicleId', header: 'Vehicle', sortable: true },
    { key: 'date', header: 'Date', sortable: true, render: (f) => formatDate(f.date) },
    { key: 'gallons', header: 'Gallons', sortable: true },
    { key: 'fuelType', header: 'Fuel', sortable: true },
    { key: 'odometer', header: 'Odometer', sortable: true },
    { key: 'cost', header: 'Cost', sortable: true, render: (f) => formatCurrency(f.cost) },
  ]

  const expenseColumns: Column<Expense>[] = [
    { key: 'description', header: 'Description', sortable: true },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (e) => <Badge status={e.category as ExpenseCategory} />,
    },
    { key: 'date', header: 'Date', sortable: true, render: (e) => formatDate(e.date) },
    { key: 'amount', header: 'Amount', sortable: true, render: (e) => formatCurrency(e.amount) },
  ]

  const totalFuel = FUEL_MOCK.reduce((s, f) => s + f.cost, 0)
  const totalExpenses = EXPENSE_MOCK.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <Fuel className="h-6 w-6 text-amber-500" /> Fuel &amp; Expenses
          </h1>
          <p className="text-sm text-slate-400">Monitor fuel consumption and operating costs</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add {tab === 'fuel' ? 'Fuel Log' : 'Expense'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">Total Fuel Spend</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{formatCurrency(totalFuel)}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400">Total Operating Expenses</p>
          <p className="mt-1 text-2xl font-bold text-orange-400">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('fuel')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'fuel'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => setTab('expenses')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'expenses'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Expenses
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      {tab === 'fuel' ? (
        <Table columns={fuelColumns} data={fuelFiltered} getRowId={(f) => f.id} pageSize={8} />
      ) : (
        <Table columns={expenseColumns} data={expenseFiltered} getRowId={(e) => e.id} pageSize={8} />
      )}
    </div>
  )
}

export default FuelExpenses
