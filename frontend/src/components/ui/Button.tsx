import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:ring-amber-500',
  secondary:
    'bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-slate-300 hover:bg-slate-800 focus-visible:ring-slate-600',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, className, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
