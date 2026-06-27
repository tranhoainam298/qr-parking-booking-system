/**
 * GPS / Map Service Integration — External Integrations
 * 
 * Integrates with:
 * - Browser Geolocation API (GPS)
 * - OpenStreetMap / Leaflet (Map display)
 * - Nominatim (Reverse geocoding)
 */

// Haversine formula — returns distance in km between 2 coordinates
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Get user's current GPS position using browser Geolocation API.
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        const messages = {
          1: 'Location access denied. Please allow location permission.',
          2: 'Position unavailable. Check your GPS signal.',
          3: 'Location request timed out. Try again.',
        }
        reject(messages[error.code] || 'Unknown location error.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  })
}

// Reverse geocode using Nominatim (OpenStreetMap free API).
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'QRParkingApp/1.0' } },
    )
    const data = await res.json()
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}
