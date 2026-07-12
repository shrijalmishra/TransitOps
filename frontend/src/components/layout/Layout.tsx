import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../../context/ToastContext'
import Toaster from '../ui/Toaster'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  )
}

export default Layout
