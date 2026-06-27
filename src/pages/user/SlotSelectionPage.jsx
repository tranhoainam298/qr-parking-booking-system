import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StatusBadge from '../../components/shared/StatusBadge'
import { parkingSites, parkingSlots } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const slotStyles = {
  Available: 'border-green-500 bg-green-100 text-green-800 hover:bg-green-200',
  Reserved: 'border-orange-500 bg-orange-100 text-orange-800',
  Occupied: 'border-red-500 bg-red-100 text-red-800',
  Maintenance: 'border-slate-400 bg-slate-200 text-slate-600',
}

export default function SlotSelectionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const site = parkingSites.find((item) => item.id === searchParams.get('siteId')) || parkingSites[0]
  const [filters, setFilters] = useState({ type: 'All', sort: 'none', availableOnly: false })
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [duration, setDuration] = useState('1')

  const siteSlots = useMemo(() => parkingSlots.filter((slot) => slot.siteId === site.id), [site.id])
  const slotTypes = useMemo(() => [...new Set(siteSlots.map((slot) => slot.slotType))].sort(), [siteSlots])
  const filteredSlots = useMemo(() => {
    const list = siteSlots.filter((slot) => (filters.type === 'All' || slot.slotType === filters.type) && (!filters.availableOnly || slot.status === 'Available'))
    if (filters.sort === 'low') return [...list].sort((a, b) => a.rate - b.rate)
    if (filters.sort === 'high') return [...list].sort((a, b) => b.rate - a.rate)
    return list
  }, [filters, siteSlots])

  const estimatedFee = selectedSlot ? selectedSlot.rate * Number(duration) : 0

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Choose your parking space</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{site.name} — Select a Slot</h1></div>

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4"><Info label="Parking Site" value={site.name} /><Info label="Address" value={`${site.address}, ${site.area}`} /><Info label="Available" value={`${site.availableSlots} slots`} accent="text-green-600" /><Info label="Starting Rate" value={`${money.format(site.rate)} / hour`} /></section>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="All">All slot types</option>{slotTypes.map((type) => <option key={type}>{type}</option>)}</select>
        <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="none">Sort by rate</option><option value="low">Rate: Low to High</option><option value="high">Rate: High to Low</option></select>
        <label className="flex items-center justify-between rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Show available only<input type="checkbox" checked={filters.availableOnly} onChange={(event) => setFilters((current) => ({ ...current, availableOnly: event.target.checked }))} className="h-5 w-5 accent-primary" /></label>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Slot Grid</h2>
          <div className="mt-5 grid grid-cols-4 justify-items-center gap-4 sm:grid-cols-5 lg:grid-cols-6">
            {filteredSlots.map((slot) => {
              const selected = selectedSlot?.id === slot.id
              const number = slot.slotNumber || slot.id.replace('SLOT-', '')
              return <button key={slot.id} type="button" disabled={slot.status !== 'Available'} onClick={() => setSelectedSlot(slot)} aria-label={`${slot.id}, ${slot.status}`}
                className={`relative grid h-20 w-20 place-items-center rounded-xl border-2 text-sm font-bold transition ${slotStyles[slot.status]} ${selected ? 'border-primary ring-4 ring-primary/20' : ''} disabled:cursor-not-allowed`}>
                {selected && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">✓</span>}{number}
              </button>
            })}
          </div>
          {!filteredSlots.length && <p className="py-12 text-center text-sm text-slate-500">No slots match these filters.</p>}
          <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-5">{Object.entries(slotStyles).map(([status, classes]) => <div key={status} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className={`h-4 w-4 rounded border-2 ${classes.split(' ').slice(0, 2).join(' ')}`} />{status}</div>)}</div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
          <h2 className="text-lg font-bold text-slate-900">Selected Slot</h2>
          {selectedSlot ? <div className="mt-5 space-y-4"><Info label="Slot ID" value={selectedSlot.id} /><Info label="Site" value={selectedSlot.siteName} /><Info label="Slot Type" value={selectedSlot.slotType} /><Info label="Rate per hour" value={money.format(selectedSlot.rate)} /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p><div className="mt-2"><StatusBadge status={selectedSlot.status} /></div></div><label className="block text-sm font-semibold text-slate-700">Estimated Duration<select value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary">{[1, 2, 3, 4, 8].map((hours) => <option key={hours} value={hours}>{hours}h</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Estimated Fee<input readOnly value={money.format(estimatedFee)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 font-bold text-primary" /></label><button type="button" onClick={() => navigate(`/user/book?slotId=${encodeURIComponent(selectedSlot.id)}`)} className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary/90">Continue to Booking</button></div> : <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Select an available slot from the grid.</div>}
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value, accent = 'text-slate-900' }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-1 font-bold ${accent}`}>{value}</p></div>
}
