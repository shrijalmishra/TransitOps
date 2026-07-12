import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { Trip, TripStatus } from '../types'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/statusHelpers'

const MOCK: Trip[] = [
  {
    id: 't1',
    tripNumber: 'TRP-0001',
    vehicleId: 'TRK-102',
    driverId: 'd1',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    status: 'dispatched',
    scheduledDeparture: '2026-07-12T08:00:00Z',
    scheduledArrival: '2026-07-12T16:00:00Z',
    actualDeparture: '2026-07-12T08:10:00Z',
    distanceKm: 380,
    cargoDescription: 'Automotive parts',
    createdAt: '2026-07-10',
    updatedAt: '2026-07-12',
  },
  {
    id: 't2',
    tripNumber: 'TRP-0002',
    vehicleId: 'TRK-101',
    driverId: 'd2',
    origin: 'Houston, TX',
    destination: 'Dallas, TX',
    status: 'completed',
    scheduledDeparture: '2026-07-11T06:00:00Z',
    scheduledArrival: '2026-07-11T12:00:00Z',
    actualDeparture: '2026-07-11T06:05:00Z',
    actualArrival: '2026-07-11T11:45:00Z',
    distanceKm: 360,
    cargoDescription: 'Refrigerated goods',
    createdAt: '2026-07-09',
    updatedAt: '2026-07-11',
  },
  {
    id: 't3',
    tripNumber: 'TRP-0003',
    vehicleId: 'BUS-201',
    driverId: 'd3',
    origin: 'Seattle, WA',
    destination: 'Portland, OR',
    status: 'draft',
    scheduledDeparture: '2026-07-15T09:00:00Z',
    scheduledArrival: '2026-07-15T13:00:00Z',
    distanceKm: 280,
    cargoDescription: 'Passengers',
    createdAt: '2026-07-12',
    updatedAt: '2026-07-12',
  },
  {
    id: 't4',
    tripNumber: 'TRP-0004',
    vehicleId: 'TRK-103',
    driverId: 'd1',
    origin: 'Miami, FL',
    destination: 'Orlando, FL',
    status: 'cancelled',
    scheduledDeparture: '2026-07-10T07:00:00Z',
    scheduledArrival: '2026-07-10T11:00:00Z',
    distanceKm: 380,
    createdAt: '2026-07-08',
    updatedAt: '2026-07-09',
  },
]

const Trips = () => {
  const [trips] = useState<Trip[]>(MOCK)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      trips.filter((t) =>
        `${t.tripNumber} ${t.origin} ${t.destination}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [trips, search],
  )

  const columns: Column<Trip>[] = [
    { key: 'tripNumber', header: 'Trip #', sortable: true },
    { key: 'origin', header: 'Origin', sortable: true },
    { key: 'destination', header: 'Destination', sortable: true },
    {
      key: 'scheduledDeparture',
      header: 'Departure',
      sortable: true,
      render: (t) => formatDate(t.scheduledDeparture),
    },
    {
      key: 'distanceKm',
      header: 'Distance',
      sortable: true,
      render: (t) => (t.distanceKm ? `${t.distanceKm} km` : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <Badge status={t.status as TripStatus} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trips</h1>
          <p className="text-sm text-slate-400">Plan and track fleet trips</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Trip
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search trips..."
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      <Table columns={columns} data={filtered} getRowId={(t) => t.id} pageSize={8} />
    </div>
  )
}

export default Trips
