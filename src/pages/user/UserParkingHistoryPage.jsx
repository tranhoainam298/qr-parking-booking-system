import { useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getState } from '../../api/mockStore'
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const dateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'

export default function UserParkingHistoryPage() {
  const { currentUser } = useAuth()
  
  const _s = getState()
  const bookings = _s.bookings
  const parkingSessions = _s.parkingSessions
  const parkingSites = _s.parkingSites
  const parkingSlots = _s.parkingSlots

  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: 'All', site: 'All' })
  const [selected, setSelected] = useState(null)
  const data = useMemo(() => parkingSessions.filter((session) => {
    const date = session.entryTime.slice(0, 10)
    return session.userId === currentUser.id && (filters.status === 'All' || session.status === filters.status) && (filters.site === 'All' || session.siteName === filters.site) && (!filters.startDate || date >= filters.startDate) && (!filters.endDate || date <= filters.endDate)
  }), [currentUser.id, filters])

  const columns = [
    { key: 'bookingId', label: 'Booking ID' }, { key: 'siteName', label: 'Parking Site' }, { key: 'slotNumber', label: 'Slot' },
    { key: 'entryTime', label: 'Entry Time', render: dateTime }, { key: 'exitTime', label: 'Exit Time', render: dateTime },
    { key: 'duration', label: 'Duration' }, { key: 'fee', label: 'Fee (₫)', render: (fee) => fee == null ? 'Pending' : money.format(fee) },
    { key: 'paymentMethod', label: 'Payment Method' }, { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]
  const booking = selected ? bookings.find((item) => item.id === selected.bookingId) : null
  const slot = booking ? parkingSlots.find((item) => item.id === booking.slotId) : null
  const rate = slot?.rate || (selected?.fee ? Math.round(selected.fee / (Number.parseFloat(selected.duration) || 1)) : 0)
  const completed = selected?.status === 'Completed'
  const timeline = [
    ['Booking Created', true], ['Waiting for Entry', true], ['Vehicle Entered', true],
    ['Vehicle Exited', completed], ['Payment Completed', completed],
  ]

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Your parking sessions</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Parking History</h1></div>
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4"><DateInput label="Start date" value={filters.startDate} onChange={(value) => setFilters((current) => ({ ...current, startDate: value }))} /><DateInput label="End date" value={filters.endDate} onChange={(value) => setFilters((current) => ({ ...current, endDate: value }))} /><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All statuses</option><option>Active</option><option>Completed</option></select><select value={filters.site} onChange={(event) => setFilters((current) => ({ ...current, site: event.target.value }))} className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All parking sites</option>{parkingSites.map((site) => <option key={site.id} value={site.name}>{site.name}</option>)}</select></section>
      <DataTable columns={columns} data={data} onRowClick={setSelected} />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Parking Session Details" size="lg">
        {selected && <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">QR Ticket Code</p><p className="mt-2 break-all font-mono text-lg font-bold text-primary">{booking?.qrCode || `QR-${selected.bookingId}`}</p></div><StatusBadge status={selected.status} /></div><section><h3 className="mb-4 font-bold text-slate-900">Booking Timeline</h3><div>{timeline.map(([label, done], index) => { const current = !done && (index === timeline.findIndex((item) => !item[1])); return <div key={label} className="relative flex gap-3 pb-6 last:pb-0">{index < timeline.length - 1 && <span className={`absolute bottom-0 left-3 top-6 w-px ${done ? 'bg-green-400' : 'bg-slate-200'}`} />}<span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : current ? 'animate-pulse bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{done ? '✓' : current ? '⟳' : ''}</span><p className={`text-sm font-bold ${done || current ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p></div>})}</div></section><section className="rounded-2xl bg-slate-50 p-5"><h3 className="font-bold text-slate-900">Fee Breakdown</h3><div className="mt-4 space-y-3"><Row label="Duration" value={selected.duration} /><Row label="Hourly Rate" value={money.format(rate)} /><Row label="Total" value={selected.fee == null ? 'Pending' : money.format(selected.fee)} strong /><Row label="Payment Method" value={selected.paymentMethod} /><Row label={selected.paymentMethod === 'Wallet' ? 'Wallet Deduction' : 'Cash Paid'} value={selected.fee == null ? 'Pending' : money.format(selected.fee)} /></div></section></div>}
      </Modal>
    </div>
  )
}

function DateInput({ label, value, onChange }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label> }
function Row({ label, value, strong }) { return <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500">{label}</span><span className={strong ? 'text-lg font-bold text-primary' : 'font-semibold text-slate-900'}>{value}</span></div> }
