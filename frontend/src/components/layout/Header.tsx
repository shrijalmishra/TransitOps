import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
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

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const breadcrumb = useBreadcrumb()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user ? getInitials(user.name) : 'U'
  const displayName = user?.name ?? 'User'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-700 bg-slate-800 px-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle menu"
        className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="text-sm" aria-label="Breadcrumb">
        <span className="text-slate-400">TransitOps</span>
        <span className="mx-2 text-slate-500">/</span>
        <span className="font-medium text-slate-100">{breadcrumb}</span>
      </nav>

      <div className="relative ml-auto" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-700"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-slate-900">
            {initials}
          </span>
          <span className="hidden text-sm font-medium text-slate-200 sm:block">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-4 top-14 min-w-[200px] rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl"
          >
            <div className="border-b border-slate-700 px-2 pb-3 pt-1">
              <p className="text-sm font-medium text-slate-100">{displayName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-rose-400 transition-colors hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
