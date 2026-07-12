import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../../context/ToastContext'
import Toaster from '../ui/Toaster'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="ml-0 flex-1 overflow-auto bg-slate-950 p-4 sm:p-6 lg:ml-64 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  )
}

export default Layout
