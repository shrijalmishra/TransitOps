import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { Download, FileText } from 'lucide-react'
import api, { getErrorMessage } from '../services/api'
import type {
  FuelEfficiency,
  OperationalCost,
  VehicleRoi,
} from '../types'
import { useToast } from '../context/ToastContext'
import Table, { type Column } from '../components/ui/Table'
import Button from '../components/ui/Button'
import { formatCurrency, formatNumber } from '../utils/statusHelpers'

const chartTooltipStyle = {
  backgroundColor: 'rgba(18, 25, 40, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
}

const ROI_COLORS = ['#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#6366f1', '#8b5cf6']

const Reports = () => {
  const { success, error: toastError } = useToast()
  const [tab, setTab] = useState<'efficiency' | 'cost' | 'roi'>('efficiency')
  const [efficiency, setEfficiency] = useState<FuelEfficiency[]>([])
  const [operational, setOperational] = useState<OperationalCost[]>([])
  const [roi, setRoi] = useState<VehicleRoi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [effRes, opRes, roiRes] = await Promise.all([
        api.get<FuelEfficiency[]>('/reports/fuel-efficiency'),
        api.get<OperationalCost[]>('/reports/operational-cost'),
        api.get<VehicleRoi[]>('/reports/vehicle-roi'),
      ])
      setEfficiency(effRes.data)
      setOperational(opRes.data)
      setRoi(roiRes.data)
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

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/reports/export-csv', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'transitops-report.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      success('CSV exported successfully.')
    } catch (err) {
      toastError(getErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const efficiencyData = useMemo(
    () =>
      efficiency.map((e) => ({
        name: e.registrationNumber,
        label: e.vehicleName,
        fuelEfficiency: e.fuelEfficiency,
      })),
    [efficiency],
  )

  const operationalData = useMemo(
    () =>
      operational.map((o) => ({
        name: o.registrationNumber,
        label: o.vehicleName,
        fuelCost: o.fuelCost,
        maintenanceCost: o.maintenanceCost,
      })),
    [operational],
  )

  const roiData = useMemo(
    () =>
      roi.map((r) => ({
        name: r.registrationNumber,
        label: r.vehicleName,
        roi: r.roi,
      })),
    [roi],
  )

  const efficiencyColumns: Column<FuelEfficiency>[] = [
    { key: 'registrationNumber', header: 'Reg #', sortable: true },
    { key: 'vehicleName', header: 'Vehicle', sortable: true },
    {
      key: 'totalDistance',
      header: 'Distance (km)',
      sortable: true,
      render: (e) => formatNumber(e.totalDistance),
    },
    {
      key: 'totalFuel',
      header: 'Total Fuel (L)',
      sortable: true,
      render: (e) => formatNumber(e.totalFuel),
    },
    {
      key: 'fuelEfficiency',
      header: 'Efficiency (km/L)',
      sortable: true,
      render: (e) => e.fuelEfficiency.toFixed(2),
    },
  ]

  const operationalColumns: Column<OperationalCost>[] = [
    { key: 'registrationNumber', header: 'Reg #', sortable: true },
    { key: 'vehicleName', header: 'Vehicle', sortable: true },
    {
      key: 'fuelCost',
      header: 'Fuel Cost',
      sortable: true,
      render: (o) => formatCurrency(o.fuelCost),
    },
    {
      key: 'maintenanceCost',
      header: 'Maintenance Cost',
      sortable: true,
      render: (o) => formatCurrency(o.maintenanceCost),
    },
    {
      key: 'totalOperationalCost',
      header: 'Total Cost',
      sortable: true,
      render: (o) => formatCurrency(o.totalOperationalCost),
    },
  ]

  const roiColumns: Column<VehicleRoi>[] = [
    { key: 'registrationNumber', header: 'Reg #', sortable: true },
    { key: 'vehicleName', header: 'Vehicle', sortable: true },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      render: (r) => formatCurrency(r.revenue),
    },
    {
      key: 'totalCost',
      header: 'Total Cost',
      sortable: true,
      render: (r) => formatCurrency(r.totalCost),
    },
    {
      key: 'netProfit',
      header: 'Net Profit',
      sortable: true,
      render: (r) => (
        <span className={r.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {formatCurrency(r.netProfit)}
        </span>
      ),
    },
    {
      key: 'roi',
      header: 'ROI %',
      sortable: true,
      render: (r) => (
        <span className={r.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
          {r.roi.toFixed(1)}%
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <FileText className="h-6 w-6 text-blue-500" /> Reports
          </h1>
          <p className="text-sm text-slate-400">Fleet analytics and operational insights</p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={handleExport} loading={exporting}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['efficiency', 'cost', 'roi'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t === 'efficiency'
              ? 'Fuel Efficiency'
              : t === 'cost'
                ? 'Operational Cost'
                : 'Vehicle ROI'}
          </button>
        ))}
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-80 animate-pulse rounded-xl glass-panel" />
      ) : (
        <>
          <div className="rounded-xl glass-panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-200">
              {tab === 'efficiency'
                ? 'Fuel Efficiency by Vehicle (km/L)'
                : tab === 'cost'
                  ? 'Operational Cost by Vehicle (₹)'
                  : 'Return on Investment by Vehicle (%)'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {tab === 'efficiency' ? (
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#33415555' }} />
                    <Bar dataKey="fuelEfficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : tab === 'cost' ? (
                  <BarChart data={operationalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#33415555' }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    <Bar dataKey="fuelCost" name="Fuel Cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="maintenanceCost"
                      name="Maintenance Cost"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#33415555' }} />
                    <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                      {roiData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={entry.roi >= 0 ? ROI_COLORS[i % ROI_COLORS.length] : '#f43f5e'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl glass-panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-200">Detailed Breakdown</h2>
            {tab === 'efficiency' ? (
              <Table
                columns={efficiencyColumns}
                data={efficiency}
                getRowId={(e) => String(e.vehicleId)}
                pageSize={8}
              />
            ) : tab === 'cost' ? (
              <Table
                columns={operationalColumns}
                data={operational}
                getRowId={(o) => String(o.vehicleId)}
                pageSize={8}
              />
            ) : (
              <Table
                columns={roiColumns}
                data={roi}
                getRowId={(r) => String(r.vehicleId)}
                pageSize={8}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Reports
