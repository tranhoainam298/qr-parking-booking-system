import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import QRCodeDisplay from '../../components/shared/QRCodeDisplay'
import QRScannerPlaceholder from '../../components/shared/QRScannerPlaceholder'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'
import { createBooking as apiCreateBooking } from '../../api/bookingApi'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const localDateTime = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const searchModes = [
  ['qr', 'Scan User QR'], ['phone', 'Search by Phone'], ['plate', 'Search by Vehicle Plate'],
]

export default function OnsiteBookingPage() {
  const navigate = useNavigate()
  const [searchMode, setSearchMode] = useState('qr')
  const [query, setQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [filters, setFilters] = useState({ siteId: 'All', slotType: 'All', availableOnly: true })
  const [form, setForm] = useState({ vehiclePlate: '', startTime: localDateTime(), duration: '1' })
  const [createdBooking, setCreatedBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Use live data from state
  const state = getState()
  const users = state.users
  const parkingSites = state.parkingSites
  const parkingSlots = state.parkingSlots

  const findUser = (value = query) => {
    const normalized = String(value).trim().toLowerCase()
    const user = searchMode === 'phone'
      ? users.find((item) => item.phone.toLowerCase().includes(normalized))
      : searchMode === 'plate'
        ? users.find((item) => item.vehiclePlate.toLowerCase().includes(normalized))
        : users.find((item) => item.id.toLowerCase() === normalized) || users[0]
    if (!user || (!normalized && searchMode !== 'qr')) {
      setSearchError('No matching user found.')
      setSelectedUser(null)
      return
    }
    setSelectedUser(user)
    setSelectedSlot(null)
    setForm({ vehiclePlate: user.vehiclePlate, startTime: localDateTime(), duration: '1' })
    setSearchError('')
  }

  const slotTypes = useMemo(() => [...new Set(parkingSlots.map((slot) => slot.slotType))].sort(), [parkingSlots])
  const filteredSlots = useMemo(() => parkingSlots.filter((slot) => (
    (filters.siteId === 'All' || slot.siteId === filters.siteId)
    && (filters.slotType === 'All' || slot.slotType === filters.slotType)
    && (!filters.availableOnly || slot.status === 'Available')
  )), [filters, parkingSlots])

  const selectSlot = (slot) => {
    if (slot.status !== 'Available') {
      setSearchError('Only available slots can be selected.')
      return
    }
    setSelectedSlot(slot)
    setSearchError('')
  }

  const estimatedFee = selectedSlot ? Number(form.duration) * selectedSlot.rate : 0

  const handleCreateBooking = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSearchError('')

    const dt = new Date(form.startTime)
    const dateStr = dt.toISOString().slice(0, 10)
    const timeStr = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const result = await apiCreateBooking({
      userId: selectedUser.id,
      slotId: selectedSlot.id,
      siteId: selectedSlot.siteId,
      vehiclePlate: form.vehiclePlate,
      date: dateStr,
      startTime: timeStr,
      duration: form.duration,
    })

    setSubmitting(false)
    if (result.success) {
      setCreatedBooking(result.booking)
    } else {
      setSearchError(result.message || 'Failed to create booking.')
    }
  }

  const createAnother = () => {
    setCreatedBooking(null)
    setSelectedUser(null)
    setSelectedSlot(null)
    setQuery('')
    setSearchError('')
    setFilters({ siteId: 'All', slotType: 'All', availableOnly: true })
    setForm({ vehiclePlate: '', startTime: localDateTime(), duration: '1' })
  }

  const slotColumns = [
    { key: 'id', label: 'Slot ID' }, { key: 'siteName', label: 'Site' }, { key: 'area', label: 'Area' },
    { key: 'slotType', label: 'Type' }, { key: 'rate', label: 'Rate', render: (rate) => `${money.format(rate)} / hr` },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Walk-in parking</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Create Onsite Booking</h1></div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-white">1</span><div><h2 className="text-lg font-bold text-slate-900">Find User</h2><p className="text-sm text-slate-500">Locate an existing parking account.</p></div></div>
        <div className="mb-5 flex flex-wrap gap-2">{searchModes.map(([value, label]) => <button key={value} type="button" onClick={() => { setSearchMode(value); setQuery(''); setSearchError('') }} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${searchMode === value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>)}</div>
        {searchMode === 'qr' ? <QRScannerPlaceholder mode="entry" onScan={findUser} /> : <div className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && findUser()} placeholder={searchMode === 'phone' ? 'Enter phone number' : 'Enter vehicle plate'} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /><button type="button" onClick={() => findUser()} className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">Search</button></div>}
        {searchError && <p className="mt-3 text-sm font-semibold text-red-600">{searchError}</p>}
        {selectedUser && <div className="mt-6 grid gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:grid-cols-2 lg:grid-cols-5"><Info label="Name" value={selectedUser.name} /><Info label="Phone" value={selectedUser.phone} /><Info label="Vehicle Plate" value={selectedUser.vehiclePlate} /><Info label="Wallet Balance" value={money.format(selectedUser.walletBalance)} /><div><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Status</p><div className="mt-2"><StatusBadge status={selectedUser.status} /></div></div></div>}
      </section>

      {selectedUser && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-white">2</span><div><h2 className="text-lg font-bold text-slate-900">Select Parking Slot</h2><p className="text-sm text-slate-500">Choose an available space for this booking.</p></div></div>
          <div className="mb-4 grid gap-3 sm:grid-cols-3"><select value={filters.siteId} onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All parking sites</option>{parkingSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select><select value={filters.slotType} onChange={(event) => setFilters((current) => ({ ...current, slotType: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All slot types</option>{slotTypes.map((type) => <option key={type}>{type}</option>)}</select><label className="flex items-center justify-between rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Available only<input type="checkbox" checked={filters.availableOnly} onChange={(event) => setFilters((current) => ({ ...current, availableOnly: event.target.checked }))} className="h-5 w-5 accent-primary" /></label></div>
          <DataTable columns={slotColumns} data={filteredSlots} onRowClick={selectSlot} selectedRowId={selectedSlot?.id} />
        </section>
      )}

      {selectedSlot && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-bold text-white">3</span><div><h2 className="text-lg font-bold text-slate-900">Booking Form</h2><p className="text-sm text-slate-500">Confirm the booking details and estimated fee.</p></div></div>
          <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Selected user</p><p className="mt-2 font-bold text-slate-900">{selectedUser.name}</p><p className="mt-1 text-sm text-slate-500">{selectedUser.phone}</p></div><div className="rounded-xl bg-orange-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-orange-600">Selected slot</p><p className="mt-2 font-bold text-slate-900">{selectedSlot.id} · {selectedSlot.siteName}</p><p className="mt-1 text-sm text-slate-500">{selectedSlot.slotType} · {money.format(selectedSlot.rate)}/hr</p></div></div>
          <form onSubmit={handleCreateBooking} className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Vehicle Plate<input required value={form.vehiclePlate} onChange={(event) => setForm((current) => ({ ...current, vehiclePlate: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label><label className="text-sm font-semibold text-slate-700">Start Time<input required type="datetime-local" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label><label className="text-sm font-semibold text-slate-700">Estimated Duration<select value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary">{[1, 2, 3, 4, 8].map((hours) => <option key={hours} value={hours}>{hours}h</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Estimated Fee<input readOnly value={money.format(estimatedFee)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-bold text-primary" /></label><button type="submit" disabled={submitting} className="rounded-xl bg-primary px-5 py-3.5 font-bold text-white hover:bg-primary/90 sm:col-span-2">{submitting ? 'Creating...' : 'Create Onsite Booking'}</button></form>
        </section>
      )}

      <Modal isOpen={Boolean(createdBooking)} onClose={() => setCreatedBooking(null)} title="Booking Created Successfully" size="lg">
        {createdBooking && <div className="space-y-6"><div className="flex justify-center"><StatusBadge status="Reserved" /></div><QRCodeDisplay value={createdBooking.qrCode} label={createdBooking.id} size={180} /><dl className="grid gap-3 sm:grid-cols-2"><Info label="Booking ID" value={createdBooking.id} /><Info label="Slot" value={createdBooking.slotNumber} /><Info label="User" value={createdBooking.userName} /><Info label="Start Time" value={new Date(createdBooking.startTime).toLocaleString('en-GB')} /></dl><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => navigate('/handler/scan-qr?mode=entry')} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Proceed to Entry Scan</button><button type="button" onClick={createAnother} className="rounded-xl border border-primary px-5 py-3 font-bold text-primary hover:bg-primary/5">Create Another Booking</button></div></div>}
      </Modal>
    </div>
  )
}

function Info({ label, value }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>
}
