import { useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const dateTime = (value) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export default function UserRechargeHistoryPage() {
  const { currentUser } = useAuth()
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: 'All' })
  const [selected, setSelected] = useState(null)
  const data = useMemo(() => walletTransactions.filter((transaction) => {
    const date = transaction.date.slice(0, 10)
    return transaction.userId === currentUser.id && (filters.status === 'All' || transaction.status === filters.status) && (!filters.startDate || date >= filters.startDate) && (!filters.endDate || date <= filters.endDate)
  }), [currentUser.id, filters])
  const columns = [
    { key: 'id', label: 'Transaction ID' }, { key: 'amount', label: 'Amount (₫)', render: (amount) => money.format(amount) },
    { key: 'method', label: 'Payment Method' }, { key: 'date', label: 'Date', render: dateTime },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> }, { key: 'gatewayRef', label: 'Gateway Reference' },
  ]
  return <div className="w-full space-y-6"><div><p className="text-sm font-medium text-slate-500">Wallet funding records</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Recharge History</h1></div><section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"><DateInput label="Start date" value={filters.startDate} onChange={(value) => setFilters((current) => ({ ...current, startDate: value }))} /><DateInput label="End date" value={filters.endDate} onChange={(value) => setFilters((current) => ({ ...current, endDate: value }))} /><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All statuses</option><option>Completed</option><option>Pending</option><option>Failed</option></select></section><DataTable columns={columns} data={data} onRowClick={setSelected} /><Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Transaction Details" size="sm">{selected && <div className="space-y-3"><Detail label="Transaction ID" value={selected.id} /><Detail label="Amount" value={money.format(selected.amount)} /><Detail label="Payment Method" value={selected.method} /><Detail label="Gateway Reference" value={selected.gatewayRef} /><Detail label="Date" value={dateTime(selected.date)} /><Detail label="User" value={selected.userName} /><div className="pt-2"><StatusBadge status={selected.status} /></div></div>}</Modal></div>
}

function DateInput({ label, value, onChange }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label> }
function Detail({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-900">{value}</p></div> }
