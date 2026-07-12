import {
  useEffect,
  useState,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { cn } from '../../utils/cn'

interface ModalProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  children?: ReactNode
  footer?: ReactNode
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const Modal = ({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  children,
  footer,
}: ModalProps) => {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent<Document>) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown as unknown as (e: globalThis.KeyboardEvent) => void)
    return () => {
      document.removeEventListener('keydown', onKeyDown as unknown as (e: globalThis.KeyboardEvent) => void)
    }
  }, [open])

  const onOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false)
  }

  return (
    <>
      {trigger && !isControlled && (
        <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </div>
      )}
      {isControlled && trigger}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onOverlayClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative mx-4 max-w-lg w-full rounded-xl border border-slate-700 bg-slate-900 shadow-2xl',
              'animate-in fade-in-0 zoom-in-95 duration-200',
            )}
          >
            {title && (
              <div className="border-b border-slate-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-200"
            >
              <CloseIcon />
            </button>
            <div className="px-6 py-5 text-sm text-slate-300">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-slate-700 px-6 py-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
