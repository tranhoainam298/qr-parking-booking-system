import { delay } from './mockStore'
import { getUserLocation, haversineDistance, reverseGeocode } from '../utils/geoUtils'

export async function getCurrentLocation() {
  try {
    const location = await getUserLocation()
    return { success: true, location }
  } catch (error) {
    return { success: false, message: typeof error === 'string' ? error : 'Location unavailable.' }
  }
}

export async function calculateDistanceKm(origin, destination) {
  await delay(50)
  if (!origin || !destination) return { success: false, message: 'Both origin and destination are required.' }
  const km = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng)
  return { success: true, distanceKm: km }
}

export { reverseGeocode }

export function getMapProviderInfo() {
  return {
    provider: 'OpenStreetMap',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    geocodingService: 'Nominatim',
  }
}
