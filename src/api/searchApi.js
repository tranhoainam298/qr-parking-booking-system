import { delay, getState } from './mockStore'
import { haversineDistance } from '../utils/geoUtils'

export async function searchParkingSites({ query, area, postalCode, radius, availableOnly, userLocation } = {}) {
  await delay()
  const state = getState()
  let sites = state.parkingSites.map((site) => {
    const available = state.parkingSlots.filter((s) => s.siteId === site.id && s.status === 'Available').length
    const distance = userLocation
      ? haversineDistance(userLocation.lat, userLocation.lng, site.lat, site.lng)
      : null
    return { ...site, availableSlots: available, distance }
  })

  if (userLocation && radius && radius !== 'any') {
    sites = sites.filter((s) => s.distance !== null && s.distance <= Number(radius))
  }
  if (area && area !== 'All') sites = sites.filter((s) => s.area === area)
  if (postalCode) sites = sites.filter((s) => s.postalCode.includes(postalCode.trim()))
  if (availableOnly) sites = sites.filter((s) => s.availableSlots > 0)
  if (query) {
    const q = query.toLowerCase()
    sites = sites.filter((s) => `${s.name} ${s.address} ${s.area}`.toLowerCase().includes(q))
  }

  // Sort by distance if location available
  if (userLocation) sites.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))

  return { success: true, sites }
}

export async function getAvailableSlotsBySite(siteId) {
  await delay()
  const state = getState()
  const slots = state.parkingSlots.filter((s) => s.siteId === siteId && s.status === 'Available')
  return { success: true, slots }
}

export async function filterSlots(filters = {}) {
  await delay()
  const state = getState()
  let slots = [...state.parkingSlots]
  if (filters.siteId && filters.siteId !== 'All') slots = slots.filter((s) => s.siteId === filters.siteId)
  if (filters.slotType && filters.slotType !== 'All') slots = slots.filter((s) => s.slotType === filters.slotType)
  if (filters.availableOnly) slots = slots.filter((s) => s.status === 'Available')
  if (filters.sort === 'low') slots.sort((a, b) => a.rate - b.rate)
  if (filters.sort === 'high') slots.sort((a, b) => b.rate - a.rate)
  return { success: true, slots }
}
