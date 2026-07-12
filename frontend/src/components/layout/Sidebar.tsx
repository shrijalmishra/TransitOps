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
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  allowedRoles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Truck, allowedRoles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'] },
  { to: '/drivers', label: 'Drivers', icon: DriversIcon, allowedRoles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'] },
  { to: '/trips', label: 'Trips', icon: Route, allowedRoles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst', 'Driver'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, allowedRoles: ['Admin', 'Fleet Manager', 'Safety Officer'] },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, allowedRoles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, allowedRoles: ['Admin', 'Fleet Manager', 'Financial Analyst', 'Safety Officer'] },
]

// Avoid name collision with Drivers page icon if needed, but imported correctly above
function DriversIcon(props: any) {
  return <Users {...props} />
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth()
  
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!item.allowedRoles) return true
    if (!user?.role) return false
    return item.allowedRoles.includes(user.role)
  })

  const renderLogo = (showClose: boolean) => (
      <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Truck className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">TransitOps</span>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    )
  
    const renderNav = () => (
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-blue-600/10 text-blue-400 shadow-[inset_2px_0_0_0_rgba(59,130,246,1)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:shadow-[inset_2px_0_0_0_rgba(255,255,255,0.2)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-blue-500/5 blur-md" />
                )}
                <item.icon
                  className={cn(
                    'relative h-5 w-5 shrink-0 transition-transform duration-300',
                    isActive ? 'scale-110' : 'group-hover:scale-110',
                  )}
                />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    )
  
    return (
      <>
        <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col overflow-y-auto border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl lg:flex">
        {renderLogo(false)}
        {renderNav()}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-white/5 bg-slate-950/80 backdrop-blur-xl">
            {renderLogo(true)}
            {renderNav()}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
