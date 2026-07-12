import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../utils/cn'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const renderLogo = (showClose: boolean) => (
    <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
          <Truck className="h-5 w-5 text-slate-900" />
        </span>
        <span className="text-xl font-bold text-white">TransitOps</span>
      </div>
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )

  const renderNav = () => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 border-r-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            )
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900 lg:flex">
        {renderLogo(false)}
        {renderNav()}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900">
            {renderLogo(true)}
            {renderNav()}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
