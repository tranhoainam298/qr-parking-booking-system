import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const markerSvg = (color, inner = 'P') => `
  <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 47C16 41 3 29 3 19a16 16 0 1 1 32 0c0 10-13 22-16 28Z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="19" cy="19" r="9" fill="white" fill-opacity=".95"/>
    <text x="19" y="23" text-anchor="middle" font-size="11" font-family="Arial" font-weight="700" fill="${color}">${inner}</text>
  </svg>`

const createIcon = (color, label, selected = false) => L.divIcon({
  className: `qr-parking-marker${selected ? ' qr-parking-marker--selected' : ''}`,
  html: markerSvg(color, label),
  iconSize: selected ? [46, 58] : [38, 48],
  iconAnchor: selected ? [23, 58] : [19, 48],
  popupAnchor: [0, -46],
})

const userIcon = createIcon('#2563EB', '●')

function parkingIcon(site, selected) {
  const color = site.availableSlots === 0 ? '#EF4444' : site.availableSlots <= 5 ? '#F97316' : '#22C55E'
  return createIcon(color, 'P', selected)
}

function RecenterMap({ userLocation }) {
  const map = useMap()
  useEffect(() => {
    if (userLocation) map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.2 })
  }, [map, userLocation])
  return null
}

function RecenterSelectedSite({ site }) {
  const map = useMap()
  useEffect(() => {
    if (site) map.flyTo([site.lat, site.lng], 16, { duration: 1 })
  }, [map, site])
  return null
}

export default function ParkingMap({
  userLocation = null,
  sites = [],
  selectedSiteId = null,
  searchRadiusKm = 10,
  onSiteClick,
}) {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [16.0544, 108.2022]
  const selectedSite = sites.find((site) => site.id === selectedSiteId)

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <style>{`
        .qr-parking-marker { background: transparent; border: 0; filter: drop-shadow(0 4px 5px rgba(15,23,42,.28)); }
        .qr-parking-marker--selected svg { transform: scale(1.18); transform-origin: bottom center; }
        .qr-parking-marker--selected::before { content: ''; position: absolute; inset: -7px; border: 3px solid #1E3A5F; border-radius: 999px; animation: parking-marker-pulse 1.4s ease-out infinite; }
        @keyframes parking-marker-pulse { 0% { transform: scale(.75); opacity: .9; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
      <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <RecenterMap userLocation={userLocation} />
        <RecenterSelectedSite site={selectedSite} />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup><strong>Your Location</strong></Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={Number(searchRadiusKm) * 1000}
              pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.05, weight: 2 }}
            />
          </>
        )}

        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={parkingIcon(site, site.id === selectedSiteId)}
            eventHandlers={{ click: () => onSiteClick?.(site.id) }}
          >
            <Popup>
              <div className="min-w-52 space-y-2">
                <strong className="block text-sm">{site.name}</strong>
                <p className="m-0 text-xs text-slate-600">{site.address}</p>
                <p className="m-0 text-xs"><strong>Available:</strong> {site.availableSlots} / {site.totalSlots} slots</p>
                <p className="m-0 text-xs"><strong>Rate:</strong> ₫ {site.rate.toLocaleString('vi-VN')}/hour</p>
                <button type="button" onClick={() => onSiteClick?.(site.id)} className="mt-1 w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Book Now</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
