import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'
import DataTable from '../../components/shared/DataTable'
import DetailDrawer from '../../components/shared/DetailDrawer'
import Modal from '../../components/shared/Modal'
import QRCodeDisplay from '../../components/shared/QRCodeDisplay'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getBookingsByUser, cancelBooking as apiCancelBooking } from '../../api/bookingApi'
import { getSessionByBooking } from '../../api/sessionApi'
import { getState } from '../../api/mockStore'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const tabs = ['All', 'Reserved', 'Active', 'Completed', 'Cancelled']

export default function MyBookingsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [filters, setFilters] = useState({ search: '', status: 'All', startDate: '', endDate: '' })
  const [detailBooking, setDetailBooking] = useState(null)
  const [detailSession, setDetailSession] = useState(null)
  const [qrBooking, setQrBooking] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [toast, setToast] = useState(location.state?.message || '')
  const toastTimer = useRef(null)

  const loadBookings = useCallback(async () => {
    const result = await getBookingsByUser(currentUser.id)
    if (result.success) setBookings(result.bookings)
  }, [currentUser.id])

  useEffect(() => { loadBookings() }, [loadBookings])

  useEffect(() => {
    if (!toast) return undefined
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(toastTimer.current)
  }, [toast])

  const counts = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((booking) => booking.status === 'Active').length,
    reserved: bookings.filter((booking) => booking.status === 'Reserved').length,
    completed: bookings.filter((booking) => booking.status === 'Completed').length,
    cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
  }), [bookings])

  const filteredBookings = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return bookings.filter((booking) => (
      (activeTab === 'All' || booking.status === activeTab)
      && (filters.status === 'All' || booking.status === filters.status)
      && (!filters.startDate || booking.date >= filters.startDate)
      && (!filters.endDate || booking.date <= filters.endDate)
      && (!query || [booking.id, booking.siteName, booking.vehiclePlate].some((value) => String(value).toLowerCase().includes(query)))
    ))
  }, [activeTab, bookings, filters])

  const cancelBooking = async () => {
    const result = await apiCancelBooking(cancelTarget.id)
    if (result.success) {
      await loadBookings()
      if (detailBooking?.id === cancelTarget.id) setDetailBooking((current) => ({ ...current, status: 'Cancelled' }))
      setCancelTarget(null)
      setToast('Booking cancelled successfully.')
    }
  }

  const openDetail = async (booking) => {
    setDetailBooking(booking)
    const sessionResult = await getSessionByBooking(booking.id)
    setDetailSession(sessionResult.success ? sessionResult.session : null)
  }

  const actionButton = (event, callback) => {
    event.stopPropagation()
    callback()
  }

  const columns = [
    { key: 'id', label: 'Booking ID' }, { key: 'siteName', label: 'Parking Site' },
    { key: 'slotNumber', label: 'Slot' }, { key: 'vehiclePlate', label: 'Vehicle Plate' },
    { key: 'startTime', label: 'Start Time', render: (_, booking) => `${booking.date} ${booking.startTime}` },
    { key: 'duration', label: 'Estimated Duration' },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'estimatedFee', label: 'Estimated Fee', render: (fee) => money.format(fee) },
    {
      key: 'actions', label: 'Actions', render: (_, booking) => (
        <div className="flex min-w-48 flex-wrap gap-1.5">
          <button type="button" onClick={(event) => actionButton(event, () => openDetail(booking))} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">View Details</button>
          <button type="button" onClick={(event) => actionButton(event, () => setQrBooking(booking))} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">Show QR Ticket</button>
          {booking.status === 'Reserved' && <button type="button" onClick={(event) => actionButton(event, () => setCancelTarget(booking))} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">Cancel Booking</button>}
          {['Completed', 'Cancelled'].includes(booking.status) && <button type="button" onClick={(event) => actionButton(event, () => navigate(`/user/book?slotId=${encodeURIComponent(booking.slotId)}`))} className="rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100">Rebook</button>}
        </div>
      ),
    },
  ]

  const site = detailBooking ? getState().parkingSites.find((item) => item.id === detailBooking.siteId) : null

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Manage reservations and parking activity</p><h1 className="mt-1 text-3xl font-bold text-slate-900">My Bookings</h1></div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi title="Total Bookings" value={counts.total} icon="▣" color="bg-primary/10 text-primary" />
        <Kpi title="Active Booking" value={counts.active} icon="◉" color="bg-blue-100 text-blue-600" />
        <Kpi title="Reserved Bookings" value={counts.reserved} icon="◆" color="bg-orange-100 text-orange-600" />
        <Kpi title="Completed Bookings" value={counts.completed} icon="✓" color="bg-green-100 text-green-600" />
        <Kpi title="Cancelled Bookings" value={counts.cancelled} icon="×" color="bg-red-100 text-red-600" />
      </section>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200 p-1">
        {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-bold transition ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{tab}</button>)}
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_170px_170px_auto]">
        <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search Booking ID, parking site, or vehicle plate" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All statuses</option>{tabs.slice(1).map((status) => <option key={status}>{status}</option>)}</select>
        <DateInput label="Start date" value={filters.startDate} onChange={(value) => setFilters((current) => ({ ...current, startDate: value }))} />
        <DateInput label="End date" value={filters.endDate} onChange={(value) => setFilters((current) => ({ ...current, endDate: value }))} />
        <button type="button" onClick={() => setFilters({ search: '', status: 'All', startDate: '', endDate: '' })} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset</button>
      </section>

      <DataTable columns={columns} data={filteredBookings} onRowClick={openDetail} />

      <DetailDrawer isOpen={Boolean(detailBooking)} onClose={() => setDetailBooking(null)} title={detailBooking?.id || 'Booking Details'}>
        {detailBooking && <div className="space-y-6"><StatusBadge status={detailBooking.status} /><section><h3 className="mb-3 font-bold text-slate-900">Booking Information</h3><dl className="space-y-2"><Detail label="Booking ID" value={detailBooking.id} /><Detail label="Parking site" value={detailBooking.siteName} /><Detail label="Address" value={site?.address || '—'} /><Detail label="Slot number" value={detailBooking.slotNumber} /><Detail label="Vehicle plate" value={detailBooking.vehiclePlate} /><Detail label="Created time" value={detailBooking.createdAt ? new Date(detailBooking.createdAt).toLocaleString('en-GB') : `${detailBooking.date} ${detailBooking.startTime}`} /><Detail label="Start time" value={`${detailBooking.date} ${detailBooking.startTime}`} /><Detail label="Entry time" value={detailSession?.entryTime ? new Date(detailSession.entryTime).toLocaleString('en-GB') : 'Pending'} /><Detail label="Exit time" value={detailSession?.exitTime ? new Date(detailSession.exitTime).toLocaleString('en-GB') : 'Pending'} /><Detail label="Duration" value={detailSession?.duration || detailBooking.duration} /><Detail label="Fee" value={money.format(detailSession?.fee ?? detailBooking.estimatedFee)} /><Detail label="Payment method" value={detailSession?.paymentMethod || 'Wallet'} /></dl></section><Timeline status={detailBooking.status} /><button type="button" onClick={() => setQrBooking(detailBooking)} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary/90">Show QR Ticket</button></div>}
      </DetailDrawer>

      <Modal isOpen={Boolean(qrBooking)} onClose={() => setQrBooking(null)} title="QR Ticket" size="lg">
        {qrBooking && <div className="space-y-5 text-center"><QRCodeDisplay value={qrBooking.qrCode || qrBooking.id} label={qrBooking.id} size={240} /><div className="grid gap-3 text-left sm:grid-cols-2"><Detail label="Parking Site" value={qrBooking.siteName} /><Detail label="Slot Number" value={qrBooking.slotNumber} /><Detail label="Vehicle Plate" value={qrBooking.vehiclePlate} /><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p><div className="mt-2"><StatusBadge status={qrBooking.status} /></div></div></div><p className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">Show this QR code to Handler at entry and exit.</p><button type="button" onClick={() => navigate(`/user/qr-ticket?bookingId=${encodeURIComponent(qrBooking.id)}`, { state: { booking: qrBooking } })} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Open Full Ticket</button></div>}
      </Modal>

      <ConfirmModal isOpen={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} onConfirm={cancelBooking} title="Cancel Booking" message={`Cancel booking ${cancelTarget?.id || ''} at ${cancelTarget?.siteName || ''}?`} confirmLabel="Cancel Booking" confirmColor="red" />
      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-2xl">✓ {toast}</div>}
    </div>
  )
}

function Kpi({ title, value, icon, color }) { return <article className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl font-bold ${color}`}>{icon}</span></article> }
function DateInput({ label, value, onChange }) { return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label> }
function Detail({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-slate-900">{value}</dd></div> }

function Timeline({ status }) {
  const completed = status === 'Completed'
  const active = status === 'Active'
  const steps = [
    ['Booking Created', true], ['Waiting for Entry', true], ['Vehicle Entered', active || completed],
    ['Vehicle Exited', completed], ['Payment Completed', completed],
  ]
  const currentIndex = steps.findIndex(([, done]) => !done)
  return <section><h3 className="mb-4 font-bold text-slate-900">Status Timeline</h3>{steps.map(([label, done], index) => <div key={label} className="relative flex gap-3 pb-5 last:pb-0">{index < steps.length - 1 && <span className={`absolute bottom-0 left-3 top-6 w-px ${done ? 'bg-green-400' : 'bg-slate-200'}`} />}<span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : index === currentIndex ? 'animate-pulse bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{done ? '✓' : index === currentIndex ? '•' : ''}</span><p className={`text-sm font-bold ${done || index === currentIndex ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p></div>)}</section>
}
