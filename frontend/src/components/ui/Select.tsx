import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
  error?: string
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, placeholder, className, id, ...props },
    ref,
  ) => {
    const generatedId = useId()
    const selectId = id ?? generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-11 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-200 shadow-sm transition-all duration-200',
              'focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-rose-500/70 focus:border-rose-500/70 focus:ring-rose-500/20' : '',
              className,
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1em',
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-slate-900 text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 animate-fade-in">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
