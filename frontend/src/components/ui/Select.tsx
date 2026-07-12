import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  icon?: ReactNode
  options: { value: string | number; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, className, id, options, placeholder, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-slate-300"
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
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border bg-slate-900 px-3 text-sm text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/60',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error
                ? 'border-rose-500 focus:ring-rose-500/60'
                : 'border-slate-700',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            ▾
          </span>
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
