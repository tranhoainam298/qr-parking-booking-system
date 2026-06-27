import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import { createBooking } from '../../api/bookingApi'
import { getState } from '../../api/mockStore'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const localDate = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
const localTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-normal text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const store = getState()
  const slot = store.parkingSlots.find((item) => item.id === searchParams.get('slotId')) || store.parkingSlots.find((item) => item.status === 'Available')
  const site = store.parkingSites.find((item) => item.id === slot.siteId)
  const user = store.users.find((item) => item.id === currentUser.id) || store.users[0]
  const wallet = store.wallets[user.id]
  const walletBalance = wallet?.balance ?? user.walletBalance

  const [form, setForm] = useState({ date: localDate(), time: localTime(), duration: '1', vehiclePlate: user.vehiclePlate })
  const [pendingBooking, setPendingBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fee = Number(form.duration) * slot.rate
  const afterDeduction = walletBalance - fee
  const insufficient = afterDeduction < 0

  const requestConfirmation = (event) => {
    event.preventDefault()
    setError('')
    setPendingBooking({
      userId: user.id,
      vehiclePlate: form.vehiclePlate,
      siteId: site.id,
      slotId: slot.id,
      date: form.date,
      startTime: form.time,
      duration: form.duration,
    })
  }

  const confirmBooking = async () => {
    setSubmitting(true)
    setError('')
    try {
      const result = await createBooking(pendingBooking)
      if (!result.success) {
        setError(result.message)
        setSubmitting(false)
        return
      }
      setPendingBooking(null)
      navigate('/user/bookings', { state: { message: 'Booking confirmed. Your QR ticket is now available.' } })
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Review and reserve</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Confirm Booking</h1></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Selected Parking Site</p><h2 className="mt-2 text-xl font-bold text-slate-900">{site.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{site.address}, {site.area}</p><p className="mt-4 font-bold text-primary">{money.format(site.rate)} / hour</p></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-orange-600">Selected Slot</p><h2 className="mt-2 text-xl font-bold text-slate-900">{slot.id}</h2><div className="mt-4 grid grid-cols-2 gap-4"><Info label="Type" value={slot.slotType} /><Info label="Rate" value={`${money.format(slot.rate)} / hour`} /></div></section></div>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Booking Form</h2><form onSubmit={requestConfirmation} className="mt-5 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Date"><input required type="date" min={localDate()} value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className={inputClass} /></Field><Field label="Start Time"><input required type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} className={inputClass} /></Field></div><Field label="Estimated Duration"><select value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} className={inputClass}>{[1, 2, 3, 4, 8].map((hours) => <option key={hours} value={hours}>{hours}h</option>)}</select></Field><Field label="Vehicle Plate"><input required value={form.vehiclePlate} onChange={(event) => setForm((current) => ({ ...current, vehiclePlate: event.target.value }))} className={inputClass} /></Field><div className="rounded-2xl bg-slate-50 p-5"><h3 className="font-bold text-slate-900">Fee Estimate</h3><div className="mt-4 space-y-3 text-sm"><Summary label="Calculation" value={`${form.duration}h × ${money.format(slot.rate)} = ${money.format(fee)}`} /><Summary label="Wallet Balance" value={money.format(walletBalance)} /><Summary label="After Deduction" value={money.format(Math.max(0, afterDeduction))} strong /></div>{insufficient && <p className="mt-4 rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">Insufficient wallet balance. Please recharge before booking.</p>}</div>{error && <p className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}<button type="submit" disabled={insufficient} className="w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">Confirm Booking</button></form></section>
      </div>
      <ConfirmModal isOpen={Boolean(pendingBooking)} onClose={() => setPendingBooking(null)} onConfirm={confirmBooking} title="Confirm Booking" confirmLabel={submitting ? 'Processing...' : 'Confirm Booking'} confirmColor="primary"
        message={`Slot: ${slot.slotNumber || slot.id.replace('SLOT-', '')} at ${site.name}. Time: ${form.date} ${form.time} for ${form.duration}h. Fee: ${money.format(fee)}. A QR ticket will be generated after confirmation.`} />
    </div>
  )
}

function Field({ label, children }) { return <label className="block text-sm font-semibold text-slate-700">{label}{children}</label> }
function Info({ label, value }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div> }
function Summary({ label, value, strong }) { return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className={`text-right ${strong ? 'text-lg font-bold text-primary' : 'font-semibold text-slate-900'}`}>{value}</span></div> }
