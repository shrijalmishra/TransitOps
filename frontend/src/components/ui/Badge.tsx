import { cn } from '../../utils/cn'
import { getStatusClassName, getStatusLabel } from '../../utils/statusHelpers'

interface BadgeProps {
  status: string
  className?: string
  label?: string
}

const Badge = ({ status, className, label }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        getStatusClassName(status),
        className,
      )}
    >
      {label ?? getStatusLabel(status)}
    </span>
  )
}

export default Badge
