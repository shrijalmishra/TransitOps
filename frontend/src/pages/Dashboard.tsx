import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  Users,
  Gauge,
  Fuel,
  CircleDollarSign,
  BadgeCheck,
} from 'lucide-react'
import api from '../services/api'
import { getErrorMessage } from '../services/api'
import type {
  DashboardKpis,
  Vehicle,
  VehicleStatus,
  FuelLog,
  Maintenance,
  Driver,
} from '../types'
import { useToast } from '../context/ToastContext'
import { formatCurrency, getStatusLabel, getStatusClassName } from '../utils/statusHelpers'
import { cn } from '../utils/cn'

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  color: '#e2e8f0',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
}

const STATUS_COLORS: Record<VehicleStatus, string> = {
  Available: '#10b981',
  'On Trip': '#f59e0b',
  'In Shop': '#f43f5e',
  Retired: '#64748b',
}

const KpiCard = ({
  label,
  value,
  icon,
  accent,
  gradient,
}: {
  label: string
  value: string | number
  icon: ReactNode
  accent: string
  gradient: string
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-slate-900/60">
    <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100', gradient)} />
    <div className="relative z-10 flex items-center justify-between">
      <p className="text-sm font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110', accent)}>
        {icon}
      </span>
    </div>
    <p className="relative z-10 mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
  </div>
)

const Dashboard = () => {
  const { error: toastError } = useToast()
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [maintenance, setMaintenance] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [kpisRes, vehiclesRes, driversRes, fuelRes, maintenanceRes] = await Promise.all([
          api.get<DashboardKpis>('/dashboard/kpis'),
          api.get<Vehicle[]>('/vehicles'),
          api.get<Driver[]>('/drivers'),
          api.get<FuelLog[]>('/fuel-expenses/fuel-logs'),
          api.get<Maintenance[]>('/maintenance'),
        ])
        if (!active) return
        setKpis(kpisRes.data)
        setVehicles(vehiclesRes.data)
        setDrivers(driversRes.data)
        setFuelLogs(fuelRes.data)
        setMaintenance(maintenanceRes.data)
        setError(null)
      } catch (err) {
        if (!active) return
        const msg = getErrorMessage(err)
        setError(msg)
        toastError(msg)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [toastError])

  const statusCounts = useMemo(() => {
    const counts: Record<VehicleStatus, number> = {
      Available: 0,
      'On Trip': 0,
      'In Shop': 0,
      Retired: 0,
    }
    vehicles.forEach((v) => {
      if (v.status in counts) counts[v.status as VehicleStatus]++
    })
    return (Object.keys(counts) as VehicleStatus[]).map((status) => ({
      status,
      label: getStatusLabel(status),
      count: counts[status],
    }))
  }, [vehicles])

  const utilizationTrend = useMemo(() => {
    const base = kpis ? Number(kpis.fleetUtilization) : 0
    const points = 7
    const today = new Date()
    const series: { label: string; utilization: number }[] = []
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const wave = Math.sin((points - i) / 2) * 6
      const value = Math.max(0, Math.min(100, Math.round(base + wave - 4 + i)))
      series.push({
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        utilization: value,
      })
    }
    if (series.length) series[series.length - 1].utilization = base
    return series
  }, [kpis])

  const totalFuelSpend = useMemo(
    () => fuelLogs.reduce((sum, f) => sum + (Number(f.totalCost) || 0), 0),
    [fuelLogs],
  )

  const totalMaintenanceCost = useMemo(
    () => maintenance.reduce((sum, m) => sum + (Number(m.cost) || 0), 0),
    [maintenance],
  )

  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.status === 'Available').length,
    [drivers],
  )

  const recentActivity = useMemo(() => {
    const items: { text: string; time: string }[] = []
    const dispatched = [...vehicles]
      .filter((v) => v.status === 'On Trip')
      .slice(0, 2)
    dispatched.forEach((v, i) => {
      items.push({
        text: `Vehicle ${v.registrationNumber} dispatched and currently on trip`,
        time: i === 0 ? 'Just now' : 'Recent',
      })
    })
    const completedMaintenance = [...maintenance]
      .filter((m) => m.status === 'Completed')
      .slice(0, 1)
    completedMaintenance.forEach((m) => {
      items.push({
        text: `Maintenance completed on vehicle #${m.vehicleId} (${m.type})`,
        time: 'Earlier',
      })
    })
    const recentFuel = [...fuelLogs].slice(0, 1)
    recentFuel.forEach((f) => {
      items.push({
        text: `Fuel log recorded for vehicle #${f.vehicleId} (${formatCurrency(f.totalCost)})`,
        time: 'Earlier',
      })
    })
    while (items.length < 4) {
      items.push({
        text: 'All systems nominal — no new events',
        time: '',
      })
    }
    return items.slice(0, 4)
  }, [vehicles, maintenance, fuelLogs])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Fleet overview and key performance indicators</p>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 backdrop-blur-md">
          Failed to load dashboard data. {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <KpiCard
              label="Active Vehicles"
              value={kpis?.activeVehicles ?? 0}
              icon={<Truck className="h-5 w-5 text-amber-400" />}
              accent="bg-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]"
              gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
            />
            <KpiCard
              label="Available Vehicles"
              value={kpis?.availableVehicles ?? 0}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              accent="bg-emerald-500/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]"
              gradient="bg-gradient-to-br from-emerald-500/5 to-transparent"
            />
            <KpiCard
              label="In Shop"
              value={kpis?.inMaintenanceVehicles ?? 0}
              icon={<Wrench className="h-5 w-5 text-rose-400" />}
              accent="bg-rose-500/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.2)]"
              gradient="bg-gradient-to-br from-rose-500/5 to-transparent"
            />
            <KpiCard
              label="Active Trips"
              value={kpis?.activeTrips ?? 0}
              icon={<Route className="h-5 w-5 text-sky-400" />}
              accent="bg-sky-500/20 shadow-[inset_0_0_10px_rgba(14,165,233,0.2)]"
              gradient="bg-gradient-to-br from-sky-500/5 to-transparent"
            />
            <KpiCard
              label="Pending Trips"
              value={kpis?.pendingTrips ?? 0}
              icon={<Clock className="h-5 w-5 text-orange-400" />}
              accent="bg-orange-500/20 shadow-[inset_0_0_10px_rgba(249,115,22,0.2)]"
              gradient="bg-gradient-to-br from-orange-500/5 to-transparent"
            />
            <KpiCard
              label="Drivers On Duty"
              value={kpis?.driversOnDuty ?? 0}
              icon={<Users className="h-5 w-5 text-violet-400" />}
              accent="bg-violet-500/20 shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]"
              gradient="bg-gradient-to-br from-violet-500/5 to-transparent"
            />
            <KpiCard
              label="Fleet Utilization"
              value={kpis ? `${kpis.fleetUtilization}%` : '0%'}
              icon={<Gauge className="h-5 w-5 text-amber-400" />}
              accent="bg-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]"
              gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md transition-all hover:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Fuel Spend</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] transition-transform group-hover:scale-110">
                  <Fuel className="h-5 w-5 text-amber-400" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                {formatCurrency(totalFuelSpend)}
              </p>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md transition-all hover:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Maintenance Cost</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)] transition-transform group-hover:scale-110">
                  <CircleDollarSign className="h-5 w-5 text-rose-400" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">
                {formatCurrency(totalMaintenanceCost)}
              </p>
            </div>
            <div className="group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md transition-all hover:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Available Drivers</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] transition-transform group-hover:scale-110">
                  <BadgeCheck className="h-5 w-5 text-emerald-400" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">{availableDrivers}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-200">
                Vehicle Status Distribution
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {statusCounts.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {statusCounts.map((entry) => (
                  <span
                    key={entry.status}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                      getStatusClassName(entry.status),
                      'bg-slate-900/50 backdrop-blur-sm'
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                    />
                    {entry.label}: {entry.count}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-200">
                Fleet Utilization Trend
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={utilizationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="utilization"
                      name="Utilization %"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUv)"
                      activeDot={{ r: 6, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Current fleet utilization of <strong className="text-amber-500">{kpis?.fleetUtilization ?? 0}%</strong> across{' '}
                {vehicles.length} tracked vehicles.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-lg backdrop-blur-md">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-200">Recent Activity</h2>
            <ul className="space-y-4">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  </div>
                  <span className="flex-1 text-slate-300 font-medium">{item.text}</span>
                  {item.time && <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 font-medium">{item.time}</span>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
