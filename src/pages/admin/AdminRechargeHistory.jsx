import { useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import KpiCard from '../../components/shared/KpiCard'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export default function AdminRechargeHistory() {
  const state = getState()
  const handlers = state.handlers
  const walletTransactions = state.walletTransactions

  const displayMethod = (transaction) => transaction.handlerId ? 'Handler' : transaction.method === 'Cash' ? 'Cash' : 'Card'
  const handlerName = (handlerId) => handlers.find((handler) => handler.id === handlerId)?.name || '—'

  const transactions = useMemo(() => walletTransactions.map((transaction) => ({ ...transaction, displayMethod: displayMethod(transaction), handlerName: handlerName(transaction.handlerId) })), [walletTransactions, handlers])
  const [filters, setFilters] = useState({ method: 'All', status: 'All', startDate: '', endDate: '' })
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => transactions.filter((transaction) => {
    const date = transaction.date.slice(0, 10)
    return (filters.method === 'All' || transaction.displayMethod === filters.method)
      && (filters.status === 'All' || transaction.status === filters.status)
      && (!filters.startDate || date >= filters.startDate)
      && (!filters.endDate || date <= filters.endDate)
  }), [filters, transactions])

  const columns = [
    { key: 'id', label: 'Transaction ID' }, { key: 'userName', label: 'User' },
    { key: 'amount', label: 'Amount (₫)', render: (amount) => money.format(amount) },
    { key: 'displayMethod', label: 'Method' }, { key: 'gatewayRef', label: 'Gateway Reference' },
    { key: 'handlerName', label: 'Handler Name' },
    { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  const kpis = [
    { title: 'Total Recharge Today', value: '₫ 3,500,000', icon: '₫', color: 'primary' },
    { title: 'Successful', value: 8, icon: '✓', color: 'green' },
    { title: 'Failed', value: 1, icon: '×', color: 'red' },
    { title: 'Cash Recharge', value: 3, icon: '▤', color: 'orange' },
    { title: 'Card Recharge', value: 5, icon: '▰', color: 'blue' },
  ]

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Wallet funding records</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Recharge History</h1></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}</section>
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        <select aria-label="Method filter" value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All methods</option><option>Card</option><option>Cash</option><option>Handler</option></select>
        <select aria-label="Status filter" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All statuses</option><option>Completed</option><option>Pending</option><option>Failed</option></select>
        <label className="text-xs font-semibold text-slate-600">Start date<input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold text-slate-600">End date<input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
      </section>
      <DataTable columns={columns} data={filtered} onRowClick={setSelected} />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Transaction Details" size="lg">
        {selected && <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction</p><p className="mt-1 text-xl font-bold text-primary">{selected.id}</p></div><StatusBadge status={selected.status} /></div><dl className="grid gap-3 sm:grid-cols-2"><Detail label="User" value={selected.userName} /><Detail label="User ID" value={selected.userId} /><Detail label="Amount" value={money.format(selected.amount)} /><Detail label="Method" value={selected.displayMethod} /><Detail label="Gateway reference" value={selected.gatewayRef} /><Detail label="Handler" value={selected.handlerName} /><Detail label="Date" value={new Date(selected.date).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })} /><Detail label="Original payment channel" value={selected.method} /></dl></div>}
      </Modal>
    </div>
  )
}

function Detail({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value}</dd></div>
}
