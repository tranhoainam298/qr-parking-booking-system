import { useMemo, useRef, useState } from 'react'
import ConfirmModal from '../../components/shared/ConfirmModal'
import DataTable from '../../components/shared/DataTable'
import KpiCard from '../../components/shared/KpiCard'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'
import { createSlot as apiCreateSlot, updateSlot as apiUpdateSlot, deleteSlot as apiDeleteSlot } from '../../api/slotApi'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const emptyForm = {
  siteId: '',
  area: '',
  postalCode: '',
  slotNumber: '',
  slotType: 'Standard',
  rate: '',
  status: 'Available',
}

export default function ParkingSlotManagement() {
  const state = getState()
  const parkingSites = state.parkingSites

  const [slots, setSlots] = useState(() => state.parkingSlots.map((slot, index) => ({
    ...slot,
    slotNumber: slot.slotNumber || slot.id.replace('SLOT-', ''),
    lastUpdated: slot.lastUpdated || `2026-06-${String(27 - (index % 6)).padStart(2, '0')} ${String(8 + (index % 9)).padStart(2, '0')}:30`,
  })))
  const [filters, setFilters] = useState({ search: '', area: 'All', postalCode: 'All', status: 'All' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const importRef = useRef(null)

  const areas = useMemo(() => [...new Set(parkingSites.map((site) => site.area))].sort(), [parkingSites])
  const postalCodes = useMemo(() => [...new Set(parkingSites.map((site) => site.postalCode))].sort(), [parkingSites])
  const counts = useMemo(() => ({
    total: slots.length,
    available: slots.filter((slot) => slot.status === 'Available').length,
    occupied: slots.filter((slot) => slot.status === 'Occupied').length,
    reserved: slots.filter((slot) => slot.status === 'Reserved').length,
    maintenance: slots.filter((slot) => slot.status === 'Maintenance').length,
  }), [slots])

  const filteredSlots = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return slots.filter((slot) => {
      const matchesSearch = !query || slot.id.toLowerCase().includes(query) || slot.siteName.toLowerCase().includes(query)
      return matchesSearch
        && (filters.area === 'All' || slot.area === filters.area)
        && (filters.postalCode === 'All' || slot.postalCode === filters.postalCode)
        && (filters.status === 'All' || slot.status === filters.status)
    })
  }, [filters, slots])

  const openAdd = () => {
    const firstSite = parkingSites[0]
    setEditingSlot(null)
    setForm({ ...emptyForm, siteId: firstSite.id, area: firstSite.area, postalCode: firstSite.postalCode, rate: firstSite.rate })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (slot) => {
    setEditingSlot(slot)
    setForm({
      siteId: slot.siteId,
      area: slot.area,
      postalCode: slot.postalCode,
      slotNumber: slot.slotNumber || slot.id.replace('SLOT-', ''),
      slotType: slot.slotType,
      rate: slot.rate,
      status: slot.status === 'Maintenance' ? 'Maintenance' : 'Available',
    })
    setFormError('')
    setModalOpen(true)
  }

  const selectSite = (siteId) => {
    const site = parkingSites.find((item) => item.id === siteId)
    setForm((current) => ({ ...current, siteId, area: site.area, postalCode: site.postalCode, rate: site.rate }))
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingSlot(null)
    setFormError('')
  }

  const saveSlot = async (event) => {
    event.preventDefault()
    const site = parkingSites.find((item) => item.id === form.siteId)
    const normalizedNumber = form.slotNumber.trim().toUpperCase()
    if (!site || !normalizedNumber || Number(form.rate) < 0) {
      setFormError('Complete all required fields with valid values.')
      return
    }
    const id = `SLOT-${normalizedNumber}`
    if (slots.some((slot) => slot.id !== editingSlot?.id && slot.id.toLowerCase() === id.toLowerCase())) {
      setFormError('A slot with this number already exists.')
      return
    }

    const payload = {
      siteId: site.id,
      area: form.area.trim(),
      postalCode: form.postalCode.trim(),
      slotNumber: normalizedNumber,
      slotType: form.slotType,
      rate: Number(form.rate),
      status: form.status,
    }

    let result
    if (editingSlot) {
      result = await apiUpdateSlot(editingSlot.id, payload)
    } else {
      result = await apiCreateSlot(payload)
    }

    if (result.success) {
      // Reload slots from state
      setSlots(getState().parkingSlots.map((slot, index) => ({
        ...slot,
        slotNumber: slot.slotNumber || slot.id.replace('SLOT-', ''),
        lastUpdated: slot.lastUpdated || `2026-06-${String(27 - (index % 6)).padStart(2, '0')} ${String(8 + (index % 9)).padStart(2, '0')}:30`,
      })))
      closeModal()
    } else {
      setFormError(result.message || 'Failed to save slot.')
    }
  }

  const deleteSlot = async () => {
    const result = await apiDeleteSlot(deleteTarget.id)
    if (result.success) {
      setSlots((current) => current.filter((slot) => slot.id !== deleteTarget.id))
      setDeleteTarget(null)
    } else {
      window.alert(result.message || 'Failed to delete slot.')
      setDeleteTarget(null)
    }
  }

  const handleImport = (event) => {
    if (event.target.files?.[0]) window.alert(`Import queued: ${event.target.files[0].name}`)
    event.target.value = ''
  }

  const columns = [
    { key: 'id', label: 'Slot ID' },
    { key: 'siteName', label: 'Parking Site' },
    { key: 'area', label: 'Area' },
    { key: 'postalCode', label: 'Postal Code' },
    { key: 'slotType', label: 'Slot Type' },
    { key: 'rate', label: 'Hourly Rate', render: (rate) => `${money.format(rate)} / hr` },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'lastUpdated', label: 'Last Updated' },
    {
      key: 'actions', label: 'Actions', render: (_, slot) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => openEdit(slot)} title={`Edit ${slot.id}`} aria-label={`Edit ${slot.id}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600">✎</button>
          <button type="button" onClick={() => setDeleteTarget(slot)} title={`Delete ${slot.id}`} aria-label={`Delete ${slot.id}`}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600">⌫</button>
        </div>
      ),
    },
  ]

  const kpis = [
    { title: 'Total Slots', value: counts.total, icon: 'P', color: 'primary' },
    { title: 'Available', value: counts.available, icon: '✓', color: 'green' },
    { title: 'Occupied', value: counts.occupied, icon: '●', color: 'red' },
    { title: 'Reserved', value: counts.reserved, icon: '◆', color: 'orange' },
    { title: 'Maintenance', value: counts.maintenance, icon: '⚙', color: 'primary' },
  ]

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Parking inventory</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Parking Slot Management</h1>
      </div>

      <section aria-label="Slot totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <span className="sr-only">Search by slot or site</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search Slot ID or site"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <select aria-label="Filter by area" value={filters.area} onChange={(event) => setFilters((current) => ({ ...current, area: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="All">All areas</option>{areas.map((area) => <option key={area}>{area}</option>)}
          </select>
          <select aria-label="Filter by postal code" value={filters.postalCode} onChange={(event) => setFilters((current) => ({ ...current, postalCode: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="All">All postal codes</option>{postalCodes.map((code) => <option key={code}>{code}</option>)}
          </select>
          <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="All">All statuses</option><option>Available</option><option>Occupied</option><option>Reserved</option><option>Maintenance</option>
          </select>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={openAdd} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90">+ Add Slot</button>
          <button type="button" onClick={() => importRef.current?.click()} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Import Slots</button>
          <input ref={importRef} type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
          <button type="button" onClick={() => window.alert('Export will be available soon.')} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Export List</button>
        </div>
      </section>

      <DataTable columns={columns} data={filteredSlots} />

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingSlot ? `Edit Slot ${editingSlot.id}` : 'Add Parking Slot'} size="md">
        <form onSubmit={saveSlot} className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Parking Site
            <select required value={form.siteId} onChange={(event) => selectSite(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary">
              {parkingSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">Area<input required value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label>
          <label className="block text-sm font-semibold text-slate-700">Postal Code<input required value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label>
          <label className="block text-sm font-semibold text-slate-700">Slot Number<input required value={form.slotNumber} onChange={(event) => setForm((current) => ({ ...current, slotNumber: event.target.value }))} placeholder="A-01" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label>
          <label className="block text-sm font-semibold text-slate-700">Slot Type<select value={form.slotType} onChange={(event) => setForm((current) => ({ ...current, slotType: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary"><option>Standard</option><option>Compact</option><option>Large</option><option>Disabled</option></select></label>
          <label className="block text-sm font-semibold text-slate-700">Hourly Rate (₫)<input required min="0" type="number" value={form.rate} onChange={(event) => setForm((current) => ({ ...current, rate: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary" /></label>
          <label className="block text-sm font-semibold text-slate-700">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary"><option>Available</option><option>Maintenance</option></select></label>
          {formError && <p className="text-sm font-medium text-red-600 sm:col-span-2">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2 sm:col-span-2"><button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Save</button></div>
        </form>
      </Modal>

      <ConfirmModal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={deleteSlot} title="Delete parking slot"
        message={`Are you sure you want to delete Slot ${deleteTarget?.id || ''} at ${deleteTarget?.siteName || ''}?`}
        confirmLabel="Confirm Delete" confirmColor="red" />
    </div>
  )
}
