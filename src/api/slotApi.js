import { delay, generateId, getState, setState } from './mockStore'

const VALID_STATUSES = ['Available', 'Reserved', 'Occupied', 'Maintenance']

export async function getParkingSites(filters = {}) {
  await delay()
  const state = getState()
  let sites = [...state.parkingSites]
  if (filters.area && filters.area !== 'All') sites = sites.filter((s) => s.area === filters.area)
  if (filters.postalCode) sites = sites.filter((s) => s.postalCode.includes(filters.postalCode))

  // Compute live available slots from slot data
  sites = sites.map((site) => {
    const available = state.parkingSlots.filter((s) => s.siteId === site.id && s.status === 'Available').length
    return { ...site, availableSlots: available }
  })

  return { success: true, sites }
}

export async function getParkingSlots(filters = {}) {
  await delay()
  const state = getState()
  let slots = [...state.parkingSlots]
  if (filters.siteId && filters.siteId !== 'All') slots = slots.filter((s) => s.siteId === filters.siteId)
  if (filters.status && filters.status !== 'All') slots = slots.filter((s) => s.status === filters.status)
  if (filters.slotType && filters.slotType !== 'All') slots = slots.filter((s) => s.slotType === filters.slotType)
  if (filters.area && filters.area !== 'All') slots = slots.filter((s) => s.area === filters.area)
  if (filters.postalCode && filters.postalCode !== 'All') slots = slots.filter((s) => s.postalCode === filters.postalCode)
  if (filters.availableOnly) slots = slots.filter((s) => s.status === 'Available')
  if (filters.search) {
    const q = filters.search.toLowerCase()
    slots = slots.filter((s) => s.id.toLowerCase().includes(q) || s.siteName.toLowerCase().includes(q))
  }
  return { success: true, slots }
}

export async function getSlotById(slotId) {
  await delay()
  const slot = getState().parkingSlots.find((s) => s.id === slotId)
  if (!slot) return { success: false, message: 'Slot not found.' }
  return { success: true, slot }
}

export async function createSlot(payload) {
  await delay()
  const state = getState()
  const site = state.parkingSites.find((s) => s.id === payload.siteId)
  if (!site) return { success: false, message: 'Invalid parking site.' }

  const slotNumber = (payload.slotNumber || '').trim().toUpperCase()
  if (!slotNumber) return { success: false, message: 'Slot number is required.' }

  const id = `SLOT-${slotNumber}`
  if (state.parkingSlots.some((s) => s.id.toLowerCase() === id.toLowerCase())) {
    return { success: false, message: 'A slot with this number already exists.' }
  }

  const newSlot = {
    id,
    siteId: site.id,
    siteName: site.name,
    area: payload.area || site.area,
    postalCode: payload.postalCode || site.postalCode,
    slotNumber,
    slotType: payload.slotType || 'Standard',
    rate: Number(payload.rate) || site.rate,
    status: payload.status || 'Available',
    lastUpdated: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
  }
  state.parkingSlots.unshift(newSlot)
  setState(state)
  return { success: true, slot: newSlot }
}

export async function updateSlot(slotId, payload) {
  await delay()
  const state = getState()
  const index = state.parkingSlots.findIndex((s) => s.id === slotId)
  if (index === -1) return { success: false, message: 'Slot not found.' }

  if (payload.siteId) {
    const site = state.parkingSites.find((s) => s.id === payload.siteId)
    if (site) payload.siteName = site.name
  }
  if (payload.slotNumber) {
    const newId = `SLOT-${payload.slotNumber.trim().toUpperCase()}`
    if (state.parkingSlots.some((s) => s.id !== slotId && s.id.toLowerCase() === newId.toLowerCase())) {
      return { success: false, message: 'A slot with this number already exists.' }
    }
    payload.id = newId
  }
  payload.lastUpdated = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  Object.assign(state.parkingSlots[index], payload)
  setState(state)
  return { success: true, slot: state.parkingSlots[index] }
}

export async function deleteSlot(slotId) {
  await delay()
  const state = getState()
  const slot = state.parkingSlots.find((s) => s.id === slotId)
  if (!slot) return { success: false, message: 'Slot not found.' }
  if (slot.status === 'Occupied') return { success: false, message: 'Cannot delete an occupied slot.' }
  if (slot.status === 'Reserved') return { success: false, message: 'Cannot delete a reserved slot.' }
  state.parkingSlots = state.parkingSlots.filter((s) => s.id !== slotId)
  setState(state)
  return { success: true }
}

export async function updateSlotStatus(slotId, status) {
  if (!VALID_STATUSES.includes(status)) return { success: false, message: `Invalid status: ${status}` }
  return updateSlot(slotId, { status })
}
