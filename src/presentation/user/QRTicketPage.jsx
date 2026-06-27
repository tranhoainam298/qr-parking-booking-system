import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'
import QRCodeDisplay from '../../components/shared/QRCodeDisplay'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export default function QRTicketPage() {
  const location = useLocation()
  const { currentUser } = useAuth()

  const _s = getState()
  const bookings = _s.bookings
  const users = _s.users

  const fallback = bookings.find((booking) => booking.userId === currentUser.id) || bookings[0]
  const initialBooking = location.state?.booking || { ...fallback, status: fallback.status === 'Confirmed' ? 'Reserved' : fallback.status }
  const [booking, setBooking] = useState(initialBooking)
  const [cancelOpen, setCancelOpen] = useState(false)

  const validity = useMemo(() => {
    const start = new Date(`${booking.date}T${booking.startTime || '00:00'}`)
    const hours = booking.durationHours || Number.parseInt(booking.duration, 10) || 1
    return new Date(start.getTime() + hours * 60 * 60 * 1000).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  }, [booking])

  const downloadQR = () => {
    const canvas = document.querySelector('#user-qr-ticket canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${booking.id}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const shareQR = async () => {
    const data = { title: 'QR Parking Ticket', text: `Booking ${booking.id} at ${booking.siteName}` }
    if (navigator.share) await navigator.share(data)
    else window.alert(`Share ticket: ${booking.id}`)
  }

  const cancelBooking = () => {
    setBooking((current) => ({ ...current, status: 'Cancelled' }))
    setCancelOpen(false)
  }

  const details = [
    ['Parking Site', booking.siteName], ['Slot Number', booking.slotNumber], ['Vehicle Plate', booking.vehiclePlate],
    ['Date', `${booking.date} ${booking.startTime || ''}`], ['Duration', booking.duration], ['Estimated Fee', money.format(booking.estimatedFee)],
  ]
  const timeline = [
    ['Booking Created', 'done', '✓'], ['Waiting for Entry', 'current', '⟳'],
    ['Vehicle Entered', 'future', ''], ['Vehicle Exited', 'future', ''], ['Payment Completed', 'future', ''],
  ]

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="text-center"><p className="text-sm font-medium text-slate-500">Your active parking pass</p><h1 className="mt-1 text-3xl font-bold text-slate-900">My QR Ticket</h1></div>

      <section id="user-qr-ticket" className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/50 sm:p-9">
        <QRCodeDisplay value={booking.id} label={booking.id} size={260} />
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-slate-500">Booking ID</p><p className="mt-1 text-2xl font-bold text-primary">{booking.id}</p>
        <div className="mt-3"><StatusBadge status={booking.status} /></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Valid until <strong className="text-slate-900">{validity}</strong></p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><h2 className="border-b border-slate-200 px-6 py-4 text-lg font-bold text-slate-900">Ticket Details</h2><dl className="divide-y divide-slate-100">{details.map(([label, value]) => <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr]"><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="text-sm font-bold text-slate-900">{value}</dd></div>)}</dl></section>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold text-blue-900">ⓘ Show this QR code to the Handler when entering and exiting the parking lot.</div>

      <div className="grid gap-3 sm:grid-cols-3"><button type="button" onClick={downloadQR} className="rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary/90">Download QR</button><button type="button" onClick={shareQR} className="rounded-xl border border-primary px-5 py-3 font-bold text-primary hover:bg-primary/5">Share QR</button><button type="button" disabled={booking.status === 'Cancelled'} onClick={() => setCancelOpen(true)} className="rounded-xl border border-red-500 px-5 py-3 font-bold text-red-600 hover:bg-red-50 disabled:opacity-40">Cancel Booking</button></div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Booking Timeline</h2><div className="mt-6">{timeline.map(([label, state, icon], index) => <div key={label} className="relative flex gap-4 pb-7 last:pb-0">{index < timeline.length - 1 && <span className={`absolute bottom-0 left-4 top-8 w-0.5 ${state === 'done' ? 'bg-green-400' : 'bg-slate-200'}`} />}<span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${state === 'done' ? 'bg-green-500 text-white' : state === 'current' ? 'animate-pulse bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{icon}</span><div className="pt-1"><p className={`font-bold ${state === 'future' ? 'text-slate-400' : 'text-slate-900'}`}>{label}</p>{state === 'current' && <p className="mt-1 text-xs font-medium text-orange-600">Current step</p>}</div></div>)}</div></section>

      <ConfirmModal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={cancelBooking} title="Cancel Booking" message={`Are you sure you want to cancel booking ${booking.id}? This action cannot be undone.`} confirmLabel="Cancel Booking" confirmColor="red" />
    </div>
  )
}
