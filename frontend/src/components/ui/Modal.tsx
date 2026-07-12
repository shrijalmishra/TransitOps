import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const Modal = ({ open, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl border border-slate-700 bg-slate-800 shadow-2xl',
          SIZES[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {title ?? 'Modal'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm text-slate-300">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-700 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
