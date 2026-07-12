import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { Driver, DriverStatus } from '../types'
import Table, { type Column } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/statusHelpers'

const MOCK: Driver[] = [
  {
    id: 'd1',
    firstName: 'John',
    lastName: 'Mitchell',
    licenseNumber: 'DL-998123',
    licenseClass: 'A',
    licenseExpiry: '2027-03-15',
    status: 'active',
    phone: '+1 555 0101',
    email: 'john.m@transitops.com',
    hiredDate: '2021-04-01',
    assignedVehicleId: 'TRK-102',
    createdAt: '2021-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'd2',
    firstName: 'Sarah',
    lastName: 'Okafor',
    licenseNumber: 'DL-774520',
    licenseClass: 'B',
    licenseExpiry: '2026-12-01',
    status: 'off_duty',
    phone: '+1 555 0102',
    email: 'sarah.o@transitops.com',
    hiredDate: '2022-09-10',
    createdAt: '2022-09-10',
    updatedAt: '2026-05-01',
  },
  {
    id: 'd3',
    firstName: 'Carlos',
    lastName: 'Reyes',
    licenseNumber: 'DL-332981',
    licenseClass: 'A',
    licenseExpiry: '2026-08-20',
    status: 'suspended',
    phone: '+1 555 0103',
    email: 'carlos.r@transitops.com',
    hiredDate: '2020-01-22',
    createdAt: '2020-01-22',
    updatedAt: '2026-06-01',
  },
]

const Drivers = () => {
  const [drivers] = useState<Driver[]>(MOCK)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      drivers.filter((d) =>
        `${d.firstName} ${d.lastName} ${d.licenseNumber}`
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
      render: (d) => `${d.firstName} ${d.lastName}`,
    },
    { key: 'licenseNumber', header: 'License #', sortable: true },
    { key: 'licenseClass', header: 'Class', sortable: true },
    {
      key: 'licenseExpiry',
      header: 'License Expiry',
      sortable: true,
      render: (d) => formatDate(d.licenseExpiry),
    },
    { key: 'phone', header: 'Phone' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (d) => <Badge status={d.status as DriverStatus} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Drivers</h1>
          <p className="text-sm text-slate-400">Manage driver roster and licenses</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drivers..."
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      <Table columns={columns} data={filtered} getRowId={(d) => d.id} pageSize={8} />
    </div>
  )
}

export default Drivers
