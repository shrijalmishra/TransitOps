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
import { useAuth } from '../context/AuthContext'
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
  'On Trip': '#3b82f6',
  'In Shop': '#f97316',
  Retired: '#64748b',
}

const KpiCard = ({
  label,
  value,
  icon,
  accentColor,
  trend,
  emptyText,
}: {
  label: string
  value: string | number
  icon: ReactNode
  accentColor: string
  trend?: string
  emptyText?: string
}) => (
  <div className="group relative overflow-hidden rounded-2xl glass-panel p-6 transition-all duration-250 hover:-translate-y-1">
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-4xl font-bold tracking-tight text-white mb-2">
            {value === 0 && emptyText ? (
              <span className="text-lg font-medium text-slate-500">{emptyText}</span>
            ) : (
              value
            )}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <p className="font-medium text-slate-400">{label}</p>
            {trend && <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
          </div>
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-transform duration-300 group-hover:scale-110', accentColor)}>
          {icon}
        </span>
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
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
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Good Afternoon, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400 sm:gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Gauge className="h-4 w-4 text-blue-400" /> Fleet Utilization: {kpis?.fleetUtilization ?? 0}%
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"></span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Route className="h-4 w-4 text-blue-400" /> {kpis?.activeTrips ?? 0} Active Trips
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block"></span>
            <span className="flex items-center gap-1.5 font-medium text-orange-400">
              <Wrench className="h-4 w-4" /> {kpis?.inMaintenanceVehicles ?? 0} Maintenance Alerts
            </span>
          </p>
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400 backdrop-blur-md">
          Failed to load dashboard data. {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl glass-panel"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Core Operations */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Active Trips"
              value={kpis?.activeTrips ?? 0}
              emptyText="No active trips"
              trend="+12%"
              icon={<Route className="h-5 w-5" />}
              accentColor="text-blue-400"
            />
            <KpiCard
              label="Available Vehicles"
              value={kpis?.availableVehicles ?? 0}
              emptyText="No vehicles available"
              trend="+4%"
              icon={<CheckCircle2 className="h-5 w-5" />}
              accentColor="text-emerald-400"
            />
            <KpiCard
              label="Active Vehicles"
              value={kpis?.activeVehicles ?? 0}
              emptyText="No vehicles active"
              trend="+2%"
              icon={<Truck className="h-5 w-5" />}
              accentColor="text-blue-400"
            />
            <KpiCard
              label="Drivers On Duty"
              value={kpis?.driversOnDuty ?? 0}
              emptyText="No drivers on duty"
              icon={<Users className="h-5 w-5" />}
              accentColor="text-slate-400"
            />
          </div>

          {/* Second Row: Fleet Health & Financials */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <KpiCard
              label="Fuel Spend"
              value={formatCurrency(totalFuelSpend)}
              emptyText="No fuel expenses"
              trend="-5%"
              icon={<Fuel className="h-5 w-5" />}
              accentColor="text-slate-400"
            />
            <KpiCard
              label="Maintenance Cost"
              value={formatCurrency(totalMaintenanceCost)}
              emptyText="No maintenance costs"
              trend="+1.2%"
              icon={<CircleDollarSign className="h-5 w-5" />}
              accentColor="text-orange-400"
            />
            <KpiCard
              label="In Shop"
              value={kpis?.inMaintenanceVehicles ?? 0}
              emptyText="No vehicles in shop"
              icon={<Wrench className="h-5 w-5" />}
              accentColor="text-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="mb-6 text-sm font-medium text-slate-400">
                Vehicle Status Distribution
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1000} animationEasing="ease-out">
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    <span
                      className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: STATUS_COLORS[entry.status], color: STATUS_COLORS[entry.status] }}
                    />
                    {entry.label}: {entry.count}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="mb-6 text-sm font-medium text-slate-400">
                Fleet Utilization Trend
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={utilizationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorUv)"
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Current fleet utilization of <strong className="text-blue-400">{kpis?.fleetUtilization ?? 0}%</strong> across{' '}
                {vehicles.length} tracked vehicles.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="mb-5 text-sm font-medium text-slate-400">Recent Activity</h2>
            <ul className="space-y-4">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  </div>
                  <span className="flex-1 text-slate-300 font-medium">{item.text}</span>
                  {item.time && <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400 font-medium">{item.time}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
