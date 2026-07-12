import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, FileText } from 'lucide-react'
import type { VehicleRoi, FuelEfficiency, OperationalCost } from '../types'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/statusHelpers'

const ROI_MOCK: VehicleRoi[] = [
  { vehicleId: 'TRK-101', vehicleNumber: 'TRK-101', totalCost: 18000, totalRevenue: 64000, roi: 255 },
  { vehicleId: 'TRK-102', vehicleNumber: 'TRK-102', totalCost: 22000, totalRevenue: 71000, roi: 222 },
  { vehicleId: 'BUS-201', vehicleNumber: 'BUS-201', totalCost: 31000, totalRevenue: 52000, roi: 67 },
]

const EFFICIENCY_MOCK: FuelEfficiency[] = [
  { vehicleId: 'TRK-101', vehicleNumber: 'TRK-101', fuelEfficiency: 7.1, totalDistance: 42000, totalFuelCost: 9000 },
  { vehicleId: 'TRK-102', vehicleNumber: 'TRK-102', fuelEfficiency: 6.4, totalDistance: 51000, totalFuelCost: 11000 },
  { vehicleId: 'BUS-201', vehicleNumber: 'BUS-201', fuelEfficiency: 4.2, totalDistance: 38000, totalFuelCost: 14000 },
]

const COST_MOCK: OperationalCost[] = [
  { category: 'fuel', amount: 41000, period: '2026-06' },
  { category: 'maintenance', amount: 23000, period: '2026-06' },
  { category: 'salary', amount: 48000, period: '2026-06' },
  { category: 'insurance', amount: 12500, period: '2026-06' },
  { category: 'tolls', amount: 1850, period: '2026-06' },
]

const COLORS = ['#f59e0b', '#f97316', '#10b981', '#3b82f6', '#8b5cf6']

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
}

const Reports = () => {
  const [reportType, setReportType] = useState<'roi' | 'efficiency' | 'cost'>('roi')

  const roiData = useMemo(
    () => ROI_MOCK.map((r) => ({ name: r.vehicleNumber, roi: r.roi })),
    [],
  )
  const efficiencyData = useMemo(
    () => EFFICIENCY_MOCK.map((e) => ({ name: e.vehicleNumber, mpg: e.fuelEfficiency })),
    [],
  )
  const costData = useMemo(
    () =>
      COST_MOCK.map((c) => ({
        name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
        value: c.amount,
      })),
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <FileText className="h-6 w-6 text-amber-500" /> Reports
          </h1>
          <p className="text-sm text-slate-400">Fleet analytics and operational insights</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['roi', 'efficiency', 'cost'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              reportType === t
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t === 'roi' ? 'Vehicle ROI' : t === 'efficiency' ? 'Fuel Efficiency' : 'Operational Cost'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-200">
          {reportType === 'roi'
            ? 'Return on Investment by Vehicle (%)'
            : reportType === 'efficiency'
              ? 'Fuel Efficiency by Vehicle (mpg)'
              : 'Operational Cost Breakdown'}
        </h2>
        <div className="h-80">
          {reportType === 'cost' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={(entry) => formatCurrency(entry.value)}
                >
                  {costData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportType === 'roi' ? roiData : efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#33415555' }} />
                <Bar
                  dataKey={reportType === 'roi' ? 'roi' : 'mpg'}
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
