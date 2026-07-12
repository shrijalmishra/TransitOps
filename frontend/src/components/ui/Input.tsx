import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, type = 'text', ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 shadow-sm transition-all duration-200',
              'placeholder:text-slate-500',
              'focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error ? 'border-rose-500/70 focus:border-rose-500/70 focus:ring-rose-500/20' : '',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 animate-fade-in">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
