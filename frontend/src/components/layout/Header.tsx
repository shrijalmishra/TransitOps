import { useEffect, useRef, useState } from 'react'
import { Menu, ChevronDown, LogOut, User as UserIcon, Search, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/statusHelpers'

// Removing Breadcrumb map to replace with standard Enterprise branding

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/5 bg-slate-950/20 px-6 backdrop-blur-xl">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle menu"
        className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-col">
        <h1 className="text-sm font-semibold tracking-wide text-slate-200 sm:text-base">
          TransitOps
        </h1>
        <p className="hidden text-xs text-slate-500 sm:block">
          Fleet Operations Platform
        </p>
      </div>

      <div className="relative ml-auto flex items-center gap-2 sm:gap-4" ref={menuRef}>
        
        {/* Fake Search & Notifications to match enterprise look */}
        <div className="hidden items-center gap-3 pr-4 border-r border-white/10 sm:flex">
          <button type="button" className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <Search className="h-4 w-4" />
          </button>
          <button type="button" className="relative rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
            {initials}
          </span>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">Admin User</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
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
