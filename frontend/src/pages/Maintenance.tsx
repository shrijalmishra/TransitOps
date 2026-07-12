import { useMemo, useState } from 'react'
import { Plus, Search, Wrench } from 'lucide-react'
import type { Maintenance, MaintenanceStatus } from '../types'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDate, formatCurrency } from '../utils/statusHelpers'

const MOCK: Maintenance[] = [
  {
    id: 'm1',
    vehicleId: 'BUS-201',
    type: 'repair',
    status: 'in_progress',
    description: 'Brake pad replacement and rotor resurfacing',
    scheduledDate: '2026-06-20',
    odometer: 210000,
    cost: 1800,
    vendor: 'City Fleet Service',
    technician: 'Mike T.',
    createdAt: '2026-06-18',
    updatedAt: '2026-06-20',
  },
  {
    id: 'm2',
    vehicleId: 'TRK-101',
    type: 'routine',
    status: 'completed',
    description: 'Scheduled 80k mile service',
    scheduledDate: '2026-05-01',
    completedDate: '2026-05-01',
    odometer: 84200,
    cost: 620,
    vendor: 'Volvo Trucks',
    createdAt: '2026-04-20',
    updatedAt: '2026-05-01',
  },
  {
    id: 'm3',
    vehicleId: 'TRK-102',
    type: 'inspection',
    status: 'scheduled',
    description: 'DOT annual inspection',
    scheduledDate: '2026-07-25',
    odometer: 132500,
    createdAt: '2026-06-30',
    updatedAt: '2026-06-30',
  },
]

const MaintenancePage = () => {
  const [records] = useState<Maintenance[]>(MOCK)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      records.filter((m) =>
        `${m.vehicleId} ${m.description} ${m.vendor ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [records, search],
  )

  const columns: Column<Maintenance>[] = [
    { key: 'vehicleId', header: 'Vehicle', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    {
      key: 'description',
      header: 'Description',
      render: (m) => <span className="line-clamp-1">{m.description}</span>,
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled',
      sortable: true,
      render: (m) => formatDate(m.scheduledDate),
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (m) => (m.cost ? formatCurrency(m.cost) : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <Badge status={m.status as MaintenanceStatus} />,
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Service
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search maintenance..."
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      <Table columns={columns} data={filtered} getRowId={(m) => m.id} pageSize={8} />
    </div>
  )
}

export default MaintenancePage
