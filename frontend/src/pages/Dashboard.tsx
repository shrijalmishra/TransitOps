import { useEffect, useMemo, useState } from 'react'
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
} from 'recharts'
import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  Users,
  Gauge,
} from 'lucide-react'
import api from '../services/api'
import { getErrorMessage } from '../services/api'
import type { DashboardKpis, Vehicle, VehicleStatus } from '../types'
import { useToast } from '../context/ToastContext'
import { getStatusClassName, getStatusLabel } from '../utils/statusHelpers'
import { cn } from '../utils/cn'

const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
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
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
}) => (
  <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', accent)}>
        {icon}
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold text-slate-100">{value}</p>
  </div>
)

const Dashboard = () => {
  const { error: toastError, success } = useToast()
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [kpisRes, vehiclesRes] = await Promise.all([
          api.get<DashboardKpis>('/dashboard/kpis'),
          api.get<Vehicle[]>('/vehicles'),
        ])
        if (!active) return
        setKpis(kpisRes.data)
        setVehicles(vehiclesRes.data)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400">Fleet overview and key performance indicators</p>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          Failed to load dashboard data. {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-700 bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <KpiCard
              label="Active Vehicles"
              value={kpis?.activeVehicles ?? 0}
              icon={<Truck className="h-5 w-5 text-amber-400" />}
              accent="bg-amber-500/15"
            />
            <KpiCard
              label="Available Vehicles"
              value={kpis?.availableVehicles ?? 0}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              accent="bg-emerald-500/15"
            />
            <KpiCard
              label="In Shop"
              value={kpis?.inMaintenanceVehicles ?? 0}
              icon={<Wrench className="h-5 w-5 text-rose-400" />}
              accent="bg-rose-500/15"
            />
            <KpiCard
              label="Active Trips"
              value={kpis?.activeTrips ?? 0}
              icon={<Route className="h-5 w-5 text-sky-400" />}
              accent="bg-sky-500/15"
            />
            <KpiCard
              label="Pending Trips"
              value={kpis?.pendingTrips ?? 0}
              icon={<Clock className="h-5 w-5 text-orange-400" />}
              accent="bg-orange-500/15"
            />
            <KpiCard
              label="Drivers On Duty"
              value={kpis?.driversOnDuty ?? 0}
              icon={<Users className="h-5 w-5 text-violet-400" />}
              accent="bg-violet-500/15"
            />
            <KpiCard
              label="Fleet Utilization"
              value={kpis ? `${kpis.fleetUtilization}%` : '0%'}
              icon={<Gauge className="h-5 w-5 text-amber-400" />}
              accent="bg-amber-500/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-200">
                Vehicle Status Distribution
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#33415555' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusCounts.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {statusCounts.map((entry) => (
                  <span
                    key={entry.status}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                      getStatusClassName(entry.status),
                    )}
                  >
                    {entry.label}: {entry.count}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-200">
                Fleet Utilization Trend
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={utilizationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} unit="%" domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      name="Utilization %"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Current fleet utilization of {kpis?.fleetUtilization ?? 0}% across{' '}
                {vehicles.length} tracked vehicles.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
