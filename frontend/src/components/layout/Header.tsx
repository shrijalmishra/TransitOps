import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Moon, Sun, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/statusHelpers'

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  trips: 'Trips',
  maintenance: 'Maintenance',
  'fuel-expenses': 'Fuel & Expenses',
  reports: 'Reports',
}

function useBreadcrumb(): string {
  const { pathname } = useLocation()
  const segment = pathname.split('/')[1] || 'dashboard'
  return BREADCRUMB_MAP[segment] ?? 'Dashboard'
}

const Header = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const breadcrumb = useBreadcrumb()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user ? getInitials(user.name) : 'U'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur lg:px-6">
      <div className="hidden text-sm text-slate-400 sm:block">
        <span className="text-slate-200">TransitOps</span>
        <span className="mx-2 text-slate-600">/</span>
        <span className="font-medium text-slate-100">{breadcrumb}</span>
      </div>

      <div className="relative ml-auto hidden w-72 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search..."
          className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none"
        />
      </div>

      <button
        onClick={() => setDarkMode((d) => !d)}
        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-800"
        aria-label="Toggle theme"
        title="Dark mode toggle (placeholder)"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-2 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-800"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950">
            {initials}
          </span>
          <span className="hidden sm:block">
            {user ? user.name : 'User'}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
            <div className="border-b border-slate-700 px-4 py-3">
              <p className="text-sm font-medium text-slate-100">
                {user ? user.name : 'User'}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-700">
              <UserIcon className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-400 transition-colors hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
