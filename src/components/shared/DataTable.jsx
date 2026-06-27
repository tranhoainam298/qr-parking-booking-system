import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 10

export default function DataTable({ columns = [], data = [], onRowClick, selectedRowId }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE))

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return data.slice(start, start + PAGE_SIZE)
  }, [data, page])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? rows.map((row, rowIndex) => (
              <tr
                key={row.id ?? `${page}-${rowIndex}`}
                onClick={() => onRowClick?.(row)}
                className={`${row.id === selectedRowId ? 'bg-blue-100/80 ring-1 ring-inset ring-primary/20' : rowIndex % 2 ? 'bg-slate-50/70' : 'bg-white'} transition-colors hover:bg-blue-50/70 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-5 py-4 text-slate-700">
                    {column.render ? column.render(row[column.key], row, (page - 1) * PAGE_SIZE + rowIndex) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={Math.max(columns.length, 1)} className="px-5 py-12 text-center text-slate-500">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
        <p className="text-xs text-slate-500">
          {data.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, data.length)} of ${data.length}` : '0 results'}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            Previous
          </button>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={page === pageCount || !data.length}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
