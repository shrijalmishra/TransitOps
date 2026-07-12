import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Bus,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { to: '/vehicles', label: 'Vehicles', icon: <Truck className="h-5 w-5" /> },
  { to: '/drivers', label: 'Drivers', icon: <Users className="h-5 w-5" /> },
  { to: '/trips', label: 'Trips', icon: <Route className="h-5 w-5" /> },
  { to: '/maintenance', label: 'Maintenance', icon: <Wrench className="h-5 w-5" /> },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: <Fuel className="h-5 w-5" /> },
  { to: '/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
]

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  const renderNav = (onClose?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-amber-500/15 text-amber-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-800 p-2 text-slate-200 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Bus className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-slate-100">TransitOps</span>
        </div>
        {renderNav()}
        {user && (
          <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
            Signed in as <span className="text-slate-300">{user.role}</span>
          </div>
        )}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
                  <Bus className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold text-slate-100">TransitOps</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNav(() => setMobileOpen(false))}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
