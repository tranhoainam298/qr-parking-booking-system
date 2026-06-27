import { useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { bookings, handlers, parkingSessions, parkingSites, users } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const dateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'In progress'

function DetailItem({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value ?? '—'}</dd></div>
}

export default function AdminParkingHistory() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '', site: 'All' })
  const [selectedSession, setSelectedSession] = useState(null)

  const filteredSessions = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return parkingSessions.filter((session) => {
      const sessionDate = session.entryTime.slice(0, 10)
      const matchesSearch = !query || [session.userName, session.vehiclePlate, session.bookingId].some((value) => String(value).toLowerCase().includes(query))
      return matchesSearch
        && (filters.site === 'All' || session.siteName === filters.site)
        && (!filters.startDate || sessionDate >= filters.startDate)
        && (!filters.endDate || sessionDate <= filters.endDate)
    })
  }, [filters])

  const columns = [
    { key: 'id', label: 'Session ID' }, { key: 'userName', label: 'User' },
    { key: 'vehiclePlate', label: 'Vehicle Plate' }, { key: 'siteName', label: 'Parking Site' },
    { key: 'slotNumber', label: 'Slot' }, { key: 'entryTime', label: 'Entry Time', render: dateTime },
    { key: 'exitTime', label: 'Exit Time', render: dateTime }, { key: 'duration', label: 'Duration' },
    { key: 'fee', label: 'Fee (₫)', render: (fee) => fee == null ? 'Pending' : money.format(fee) },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  const booking = selectedSession ? bookings.find((item) => item.id === selectedSession.bookingId) : null
  const user = selectedSession ? users.find((item) => item.id === selectedSession.userId) : null
  const handler = selectedSession ? handlers.find((item) => item.id === selectedSession.handlerId) : null

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Completed and active sessions</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Parking History</h1>
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[170px_170px_minmax(260px,1fr)_220px_auto]">
        <label className="text-xs font-semibold text-slate-600">Start date<input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold text-slate-600">End date<input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
        <label className="self-end"><span className="sr-only">Search parking history</span><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search user, vehicle or booking ID" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
        <label className="self-end"><span className="sr-only">Parking site</span><select value={filters.site} onChange={(event) => setFilters((current) => ({ ...current, site: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All parking sites</option>{parkingSites.map((site) => <option key={site.id} value={site.name}>{site.name}</option>)}</select></label>
        <button type="button" onClick={() => window.alert('Parking history export will be available soon.')} className="self-end rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Export</button>
      </section>

      <DataTable columns={columns} data={filteredSessions} onRowClick={setSelectedSession} />

      <Modal isOpen={Boolean(selectedSession)} onClose={() => setSelectedSession(null)} title="Session Details" size="lg">
        {selectedSession && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p><p className="mt-1 text-xl font-bold text-primary">{selectedSession.id}</p></div><StatusBadge status={selectedSession.status} /></div>
            <section><h3 className="mb-3 font-bold text-slate-900">Booking details</h3><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><DetailItem label="Booking ID" value={selectedSession.bookingId} /><DetailItem label="User" value={selectedSession.userName} /><DetailItem label="Vehicle" value={selectedSession.vehiclePlate} /><DetailItem label="Parking site" value={selectedSession.siteName} /><DetailItem label="Slot" value={selectedSession.slotNumber} /><DetailItem label="Handler" value={handler?.name || selectedSession.handlerId} /></dl></section>
            <section className="rounded-2xl bg-slate-900 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">QR Ticket info</p><p className="mt-3 break-all font-mono text-lg font-bold text-green-400">{booking?.qrCode || `QR-${selectedSession.bookingId}`}</p></section>
            <section><h3 className="mb-3 font-bold text-slate-900">Session timeline</h3><dl className="grid gap-3 sm:grid-cols-2"><DetailItem label="Entry time" value={dateTime(selectedSession.entryTime)} /><DetailItem label="Exit time" value={dateTime(selectedSession.exitTime)} /><DetailItem label="Duration" value={selectedSession.duration} /><DetailItem label="Fee" value={selectedSession.fee == null ? 'Pending' : money.format(selectedSession.fee)} /></dl></section>
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><h3 className="font-bold text-blue-950">Payment information</h3>{selectedSession.paymentMethod === 'Wallet' ? <div className="mt-3 grid gap-2 text-sm text-blue-900 sm:grid-cols-2"><p>Amount deducted: <strong>{selectedSession.fee == null ? 'Pending' : money.format(selectedSession.fee)}</strong></p><p>Remaining balance: <strong>{money.format(Math.max(0, (user?.walletBalance || 0) - (selectedSession.fee || 0)))}</strong></p></div> : <p className="mt-3 text-sm text-blue-900">{selectedSession.paymentMethod === 'Cash' ? 'Cash paid' : `${selectedSession.paymentMethod} paid`}: <strong>{selectedSession.fee == null ? 'Pending' : money.format(selectedSession.fee)}</strong></p>}</section>
          </div>
        )}
      </Modal>
    </div>
  )
}
