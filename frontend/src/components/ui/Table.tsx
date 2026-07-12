import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  getRowId: (row: T) => string
  pageSize?: number
  actions?: (row: T) => ReactNode
  emptyMessage?: string
}

function SortArrow({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === 'asc') return <span className="text-blue-400 text-xs transition-colors">▲</span>
  if (direction === 'desc') return <span className="text-blue-400 text-xs transition-colors">▼</span>
  return <span className="text-slate-600 text-xs transition-colors group-hover:text-slate-400">↕</span>
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}

function Table<T>({ columns, data, getRowId, pageSize = 10, actions, emptyMessage }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.key === sortKey)
    if (!col || !col.sortable) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const av = a[sortKey as keyof T]
      const bv = b[sortKey as keyof T]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return copy
  }, [data, columns, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const pagedData = sortedData.slice(start, start + pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div className="w-full overflow-hidden rounded-xl glass-panel">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/20 text-slate-400">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'group whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-slate-200 transition-colors',
                    col.className,
                  )}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <SortArrow
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {emptyMessage ?? 'No records found.'}
                </td>
              </tr>
            ) : (
              pagedData.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="group transition-colors duration-200 hover:bg-white/5"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3.5 text-slate-300 transition-colors group-hover:text-slate-200', col.className)}
                    >
                      {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-slate-300">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
          <span>
            Page <span className="font-medium text-slate-200">{currentPage}</span> of <span className="font-medium text-slate-200">{totalPages}</span> &nbsp;&middot;&nbsp; {sortedData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-300"
              aria-label="Previous page"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-slate-300"
              aria-label="Next page"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
