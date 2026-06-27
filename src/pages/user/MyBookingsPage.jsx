import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { bookings as mockBookings, parkingSites } from '../../data/mockData'

const PAGE_SIZE = 6
const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const statusSteps = ['Reserved', 'Active', 'Completed']
const getUserBookings = (userId) => mockBookings
  .filter((booking) => booking.userId === userId)
  .map((booking) => ({
    ...booking,
    status: booking.status === 'Confirmed' ? 'Reserved' : booking.status,
  }))

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState(() => getUserBookings(currentUser.id))
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'All',
    siteId: 'All',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])
  useEffect(() => setBookings(getUserBookings(currentUser.id)), [currentUser.id])

  const summary = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((booking) => ['Reserved', 'Active'].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === 'Completed').length,
    cancelled: bookings.filter((booking) => booking.status === 'Cancelled').length,
  }), [bookings])

  const filteredBookings = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return bookings.filter((booking) => (
      (!filters.startDate || booking.date >= filters.startDate)
      && (!filters.endDate || booking.date <= filters.endDate)
      && (filters.status === 'All' || booking.status === filters.status)
      && (filters.siteId === 'All' || booking.siteId === filters.siteId)
      && (!query || booking.id.toLowerCase().includes(query) || String(booking.slotNumber).toLowerCase().includes(query))
    ))
  }, [bookings, filters])

  const pageCount = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE))
  const visibleBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [filters])
  useEffect(() => setPage((current) => Math.min(current, pageCount)), [pageCount])

  const resetFilters = () => setFilters({
    startDate: '',
    endDate: '',
    status: 'All',
    siteId: 'All',
    search: '',
  })

  const cancelBooking = () => {
    setBookings((current) => current.map((booking) => (
      booking.id === cancelTarget.id ? { ...booking, status: 'Cancelled' } : booking
    )))
    setCancelTarget(null)
    setToast('Booking cancelled successfully.')
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <nav aria-label="Breadcrumb" className="text-sm font-medium text-slate-500">
          <span>QR Parking Booking System</span>
          <span className="mx-2 text-slate-300">›</span>
          <span className="text-primary">My Bookings</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Bookings</h1>
      </div>

      <section aria-label="Booking summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Bookings" value={summary.total} icon="▣" color="bg-primary/10 text-primary" />
        <SummaryCard title="Active / Reserved" value={summary.active} icon="◉" color="bg-orange-100 text-orange-600" />
        <SummaryCard title="Completed" value={summary.completed} icon="✓" color="bg-green-100 text-green-600" />
        <SummaryCard title="Cancelled" value={summary.cancelled} icon="×" color="bg-red-100 text-red-600" />
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[165px_165px_180px_220px_minmax(240px,1fr)_auto]">
        <DateInput
          label="Start date"
          value={filters.startDate}
          onChange={(value) => setFilters((current) => ({ ...current, startDate: value }))}
        />
        <DateInput
          label="End date"
          value={filters.endDate}
          onChange={(value) => setFilters((current) => ({ ...current, endDate: value }))}
        />
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="All">All statuses</option>
          <option>Reserved</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <select
          aria-label="Filter by parking site"
          value={filters.siteId}
          onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value }))}
          className="self-end rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="All">All parking sites</option>
          {parkingSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
        </select>
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Search Booking ID or slot"
          className="self-end rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={resetFilters}
          className="self-end rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Reset Filters
        </button>
      </section>

      {visibleBookings.length ? (
        <section className="space-y-4">
          {visibleBookings.map((booking) => {
            const site = parkingSites.find((item) => item.id === booking.siteId)
            return (
              <article key={booking.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid gap-5 p-5 md:grid-cols-[3fr_4fr_3fr] md:p-6">
                  <div>
                    <h2 className="font-bold text-slate-900">{booking.siteName}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{site ? `${site.address}, ${site.area}` : 'Address unavailable'}</p>
                    <p className="mt-4 text-sm font-semibold text-slate-700">{booking.date} · {booking.startTime}</p>
                  </div>

                  <div className="border-slate-100 md:border-x md:px-5">
                    <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Slot {booking.slotNumber}</span>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <BookingDetail label="Vehicle Plate" value={booking.vehiclePlate} />
                      <BookingDetail label="Duration" value={booking.duration} />
                      <BookingDetail label="Estimated Fee" value={money.format(booking.estimatedFee)} />
                    </dl>
                  </div>

                  <div className="flex flex-col items-start md:items-end">
                    <StatusBadge status={booking.status} />
                    <div className="mt-4 flex w-full flex-col gap-2 md:max-w-48">
                      <button
                        type="button"
                        onClick={() => navigate(`/user/qr-ticket?bookingId=${encodeURIComponent(booking.id)}`)}
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
                      >
                        View QR Ticket
                      </button>
                      {booking.status === 'Reserved' && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(booking)}
                          className="rounded-xl border border-red-500 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <BookingProgress status={booking.status} />
              </article>
            )
          })}
        </section>
      ) : (
        <EmptyState onSearch={() => navigate('/user/search')} />
      )}

      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={cancelBooking}
        title="Cancel Booking"
        message={`Cancel booking ${cancelTarget?.id || ''} at ${cancelTarget?.siteName || ''}?`}
        confirmLabel="Cancel Booking"
        confirmColor="red"
      />

      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-2xl">✓ {toast}</div>}
    </div>
  )
}

function SummaryCard({ title, value, icon, color }) {
  return <article className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div><span className={`grid h-12 w-12 place-items-center rounded-xl text-xl font-bold ${color}`}>{icon}</span></article>
}

function DateInput({ label, value, onChange }) {
  return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
}

function BookingDetail({ label, value }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>
}

function BookingProgress({ status }) {
  const currentStep = statusSteps.indexOf(status)
  return <div className="border-t border-slate-100 px-5 py-3 md:px-6"><div className="grid grid-cols-3 gap-2">{statusSteps.map((step, index) => <div key={step}><div className={`h-1.5 rounded-full ${status === 'Cancelled' ? 'bg-slate-200' : index <= currentStep ? 'bg-primary' : 'bg-slate-200'}`} /><p className={`mt-1.5 text-center text-[10px] font-bold uppercase tracking-wide ${index <= currentStep && status !== 'Cancelled' ? 'text-primary' : 'text-slate-400'}`}>{step}</p></div>)}</div></div>
}

function EmptyState({ onSearch }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="mx-auto h-28 w-28 text-primary">
        <rect x="20" y="42" width="80" height="46" rx="12" fill="currentColor" opacity="0.12" />
        <path d="M34 66h52l-8-18H42l-8 18Zm8 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm36 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" fill="currentColor" />
        <path d="M52 24h16a12 12 0 0 1 0 24H52V24Zm0 0v48" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 className="mt-4 text-xl font-bold text-slate-900">No bookings found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Search for nearby parking and book a slot to get started.</p>
      <button type="button" onClick={onSearch} className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">Search Parking</button>
    </section>
  )
}
