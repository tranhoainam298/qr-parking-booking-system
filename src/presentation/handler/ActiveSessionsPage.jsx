import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/shared/DataTable'
import DetailDrawer from '../../components/shared/DetailDrawer'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const dateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

const durations = ['1h 23m', '2h 08m', '45m', '3h 17m', '1h 51m', '4h 02m', '2h 36m', '58m']

export default function ActiveSessionsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: '', site: 'All', status: 'Active' })
  const [selected, setSelected] = useState(null)

  const state = getState()
  const bookings = state.bookings
  const users = state.users
  const parkingSites = state.parkingSites

  const sessions = useMemo(() => state.parkingSessions.map((session, index) => {
    // Determine hourly rate to compute live estimated fee
    const b = state.bookings.find((item) => item.id === session.bookingId)
    const slot = state.parkingSlots.find((item) => item.id === b?.slotId)
    const hourlyRate = slot?.rate ?? 40000

    let currentDuration = session.duration
    let estimatedFee = session.fee
    if (session.status === 'Active') {
      currentDuration = durations[index % durations.length]
      const durationHours = parseFloat(currentDuration) || 1
      estimatedFee = Math.ceil(durationHours) * hourlyRate
    }

    return {
      ...session,
      computedDuration: currentDuration,
      estimatedFee,
    }
  }), [state.parkingSessions, state.bookings, state.parkingSlots])

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return sessions.filter((session) => (
      (!query || session.userName.toLowerCase().includes(query) || session.vehiclePlate.toLowerCase().includes(query))
      && (filters.site === 'All' || session.siteName === filters.site)
      && (filters.status === 'All' || session.status === filters.status)
    ))
  }, [filters, sessions])

  const processExit = (session) => navigate(`/handler/scan-qr?mode=exit&session=${encodeURIComponent(session.id)}`)
  const columns = [
    { key: 'id', label: 'Session ID' }, { key: 'userName', label: 'User' },
    { key: 'vehiclePlate', label: 'Vehicle Plate' }, { key: 'siteName', label: 'Parking Site' },
    { key: 'slotNumber', label: 'Slot' }, { key: 'entryTime', label: 'Entry Time', render: dateTime },
    { key: 'computedDuration', label: 'Duration' }, { key: 'estimatedFee', label: 'Est. Fee', render: (fee) => money.format(fee) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'actions', label: 'Actions', render: (_, session) => <div className="flex gap-2"><button type="button" onClick={() => setSelected(session)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">View</button><button type="button" disabled={session.status !== 'Active'} onClick={() => processExit(session)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">Process Exit</button></div> },
  ]

  const booking = selected ? bookings.find((item) => item.id === selected.bookingId) : null
  const user = selected ? users.find((item) => item.id === selected.userId) : null
  const timeline = [
    ['Booking Created', true, booking?.date], ['Entry Confirmed', true, selected ? dateTime(selected.entryTime) : ''],
    ['Exit Pending', false, 'In progress'], ['Payment Completed', false, 'Pending'],
  ]

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Live parking operations</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Active Parking Sessions</h1></div>
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search user or vehicle plate" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <select value={filters.site} onChange={(event) => setFilters((current) => ({ ...current, site: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All parking sites</option>{parkingSites.map((site) => <option key={site.id} value={site.name}>{site.name}</option>)}</select>
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All statuses</option><option>Active</option><option>Completed</option></select>
      </section>
      <DataTable columns={columns} data={filtered} />

      <DetailDrawer isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.id || 'Session Details'}>
        {selected && <div className="flex min-h-full flex-col"><div className="mb-6"><StatusBadge status={selected.status} /></div><div className="space-y-6">
          <section className="rounded-2xl bg-slate-900 p-5 text-white"><h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">QR Ticket</h3><p className="mt-3 break-all font-mono font-bold text-green-400">{booking?.qrCode || `QR-${selected.bookingId}`}</p><p className="mt-2 text-sm text-slate-300">Booking ID: {selected.bookingId}</p></section>
          <section><h3 className="mb-3 font-bold text-slate-900">Booking Info</h3><dl className="space-y-3"><DrawerItem label="User" value={selected.userName} /><DrawerItem label="Vehicle" value={selected.vehiclePlate} /><DrawerItem label="Parking site" value={selected.siteName} /><DrawerItem label="Slot" value={selected.slotNumber} /><DrawerItem label="Booking date" value={booking?.date || selected.entryTime.slice(0, 10)} /></dl></section>
          <section><h3 className="mb-3 font-bold text-slate-900">Wallet Info</h3><div className="grid grid-cols-2 gap-3"><DrawerItem label="Current balance" value={money.format(user?.walletBalance || 0)} /><DrawerItem label="Estimated fee" value={money.format(selected.estimatedFee)} /></div></section>
          <section><h3 className="mb-4 font-bold text-slate-900">Session Timeline</h3><div>{timeline.map(([label, done, detail], index) => <div key={label} className="relative flex gap-3 pb-6 last:pb-0">{index < timeline.length - 1 && <span className={`absolute bottom-0 left-3 top-6 w-px ${done ? 'bg-green-400' : 'bg-slate-200'}`} />}<span className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : index === 2 ? 'animate-pulse bg-orange-400 text-white' : 'bg-slate-200 text-slate-500'}`}>{done ? '✓' : '•'}</span><div><p className="text-sm font-bold text-slate-900">{label}</p><p className="mt-0.5 text-xs text-slate-500">{detail}</p></div></div>)}</div></section>
        </div><button type="button" disabled={selected.status !== 'Active'} onClick={() => processExit(selected)} className="mt-8 w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-40">Process Exit</button></div>}
      </DetailDrawer>
    </div>
  )
}

function DrawerItem({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-slate-900">{value}</dd></div>
}
