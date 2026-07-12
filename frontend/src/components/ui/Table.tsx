import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  getRowId: (row: T) => string
  pageSize?: number
  actions?: (row: T) => ReactNode
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  initialSort?: { key: string; direction: 'asc' | 'desc' }
}

function Table<T>({
  columns,
  data,
  getRowId,
  pageSize = 10,
  actions,
  onSort,
  initialSort,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSort?.key)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSort?.direction ?? 'asc')
  const [page, setPage] = useState(0)

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    const sorted = [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      const result =
        typeof aVal === 'string' && typeof bVal === 'string'
          ? aVal.localeCompare(bVal)
          : (aVal as number) - (bVal as number)
      return sortDir === 'asc' ? result : -result
    })
    return sorted
  }, [data, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const pagedData = sortedData.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  )

  const handleSort = (key: string) => {
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDir(nextDir)
    onSort?.(key, nextDir)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 font-semibold', col.className)}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-100"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-amber-500" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pagedData.map((row) => (
                <tr key={getRowId(row)} className="bg-slate-900 hover:bg-slate-800/60">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-slate-300', col.className)}>
                      {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">{actions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800 px-4 py-3">
        <span className="text-xs text-slate-400">
          Showing {sortedData.length === 0 ? 0 : currentPage * pageSize + 1}–
          {Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-400">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Table
