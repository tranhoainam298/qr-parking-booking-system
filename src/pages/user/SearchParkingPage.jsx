import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ParkingMap from '../../components/shared/ParkingMap'
import StatusBadge from '../../components/shared/StatusBadge'
import { parkingSites } from '../../data/mockData'
import { getUserLocation, haversineDistance, reverseGeocode } from '../../utils/geoUtils'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export default function SearchParkingPage() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('idle')
  const [gpsAddress, setGpsAddress] = useState('')
  const [gpsError, setGpsError] = useState('')
  const [sites] = useState(parkingSites)
  const [filteredSites, setFilteredSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState(null)
  const [searchRadius, setSearchRadius] = useState(10)
  const [areaFilter, setAreaFilter] = useState('All')
  const [postalFilter, setPostalFilter] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [autoSearch, setAutoSearch] = useState(false)
  const [sitesWithDistance, setSitesWithDistance] = useState([])
  const [siteSearch, setSiteSearch] = useState('')

  const updateDistances = useCallback((location) => {
    const rankedSites = sites
      .map((site) => ({
        ...site,
        distance: haversineDistance(location.lat, location.lng, site.lat, site.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
    setSitesWithDistance(rankedSites)
  }, [sites])

  const locateUser = useCallback(async () => {
    setGpsStatus('loading')
    setGpsError('')
    try {
      const location = await getUserLocation()
      setUserLocation(location)
      setGpsStatus('active')
      updateDistances(location)
      const address = await reverseGeocode(location.lat, location.lng)
      setGpsAddress(address)
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Unknown location error.'
      setGpsStatus(message.toLowerCase().includes('denied') ? 'denied' : 'error')
      setGpsError(message)
    }
  }, [updateDistances])

  useEffect(() => {
    locateUser()
  }, [locateUser])

  useEffect(() => {
    if (!autoSearch) return undefined
    const interval = window.setInterval(locateUser, 30000)
    return () => window.clearInterval(interval)
  }, [autoSearch, locateUser])

  useEffect(() => {
    const source = userLocation && sitesWithDistance.length ? sitesWithDistance : sites
    const query = siteSearch.trim().toLowerCase()
    const result = source.filter((site) => (
      (!userLocation || searchRadius === 'any' || site.distance <= Number(searchRadius))
      && (areaFilter === 'All' || site.area === areaFilter)
      && (!postalFilter.trim() || site.postalCode.includes(postalFilter.trim()))
      && (!availableOnly || site.availableSlots > 0)
      && (!query || `${site.name} ${site.address} ${site.area}`.toLowerCase().includes(query))
    ))
    setFilteredSites(result)
  }, [areaFilter, availableOnly, postalFilter, searchRadius, siteSearch, sites, sitesWithDistance, userLocation])

  const areas = useMemo(() => [...new Set(sites.map((site) => site.area))].sort(), [sites])
  const openSlots = (siteId) => navigate(`/user/slot-selection?siteId=${encodeURIComponent(siteId)}`)

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Live GPS parking finder</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Search Parking</h1>
      </div>

      <div className="grid min-h-[680px] gap-6 xl:grid-cols-[11fr_9fr]">
        <section className="min-w-0 space-y-3">
          <GpsStatusBar
            status={gpsStatus}
            address={gpsAddress}
            error={gpsError}
            onRetry={locateUser}
          />
          <div className="h-[calc(100vh-200px)] min-h-[560px]">
            <ParkingMap
              userLocation={userLocation}
              sites={filteredSites}
              selectedSiteId={selectedSiteId}
              searchRadiusKm={searchRadius === 'any' ? 20 : Number(searchRadius)}
              onSiteClick={(id) => setSelectedSiteId(id)}
            />
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <input
            value={siteSearch}
            onChange={(event) => setSiteSearch(event.target.value)}
            placeholder="Search parking location..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option value="All">All areas</option>
              {areas.map((area) => <option key={area}>{area}</option>)}
            </select>
            <input value={postalFilter} onChange={(event) => setPostalFilter(event.target.value)} placeholder="Postal code" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" />
            <select value={searchRadius} onChange={(event) => setSearchRadius(event.target.value === 'any' ? 'any' : Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value="any">Any distance</option>
            </select>
            <Toggle label="Available Only" checked={availableOnly} onChange={setAvailableOnly} />
            <div className="sm:col-span-2"><Toggle label="Auto search nearest parking while driving" checked={autoSearch} onChange={setAutoSearch} /></div>
          </div>

          <div className="my-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900">Parking Results</h2>
            <span className="text-xs font-semibold text-slate-500">{filteredSites.length} found</span>
          </div>
          {gpsStatus === 'active' && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">Sorted by distance from your location</p>}
          {!userLocation && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-800">Enable location for distance-based results</div>}

          <div className="max-h-[calc(100vh-480px)] min-h-64 space-y-4 overflow-y-auto pr-1">
            {filteredSites.map((site) => (
              <SiteResultCard
                key={site.id}
                site={site}
                selected={selectedSiteId === site.id}
                onSelect={() => setSelectedSiteId(site.id)}
                onOpenSlots={() => openSlots(site.id)}
              />
            ))}
            {!filteredSites.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <div className="text-4xl text-slate-300">P</div>
                <h3 className="mt-3 font-bold text-slate-800">No parking sites found</h3>
                <p className="mt-1 text-sm text-slate-500">Try increasing the radius or changing your filters.</p>
              </div>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs font-medium leading-5 text-yellow-900">
            Map data © OpenStreetMap contributors. GPS requires browser location permission and internet connection.
          </div>
        </aside>
      </div>
    </div>
  )
}

function GpsStatusBar({ status, address, error, onRetry }) {
  const styles = {
    idle: 'border-slate-200 bg-slate-100 text-slate-600',
    loading: 'border-blue-200 bg-blue-50 text-blue-800',
    active: 'border-green-200 bg-green-50 text-green-800',
    denied: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    error: 'border-red-200 bg-red-50 text-red-800',
  }
  return (
    <div className={`flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${styles[status]}`}>
      <span className="flex min-w-0 items-center gap-2">
        {status === 'loading' && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
        {status === 'active' && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />}
        {status === 'idle' && 'Waiting for GPS...'}
        {status === 'loading' && 'Getting your location...'}
        {status === 'active' && <span className="truncate">GPS Active — {address || 'Resolving address...'} — Last updated: just now</span>}
        {status === 'denied' && '⚠ Location access denied. Enable GPS to find nearby parking.'}
        {status === 'error' && `⚠ ${error}`}
      </span>
      {['denied', 'error'].includes(status) && <button type="button" onClick={onRetry} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-50">Retry</button>}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
      {label}
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

function SiteResultCard({ site, selected, onSelect, onOpenSlots }) {
  const distanceClass = site.distance < 2 ? 'bg-green-100 text-green-700' : site.distance < 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
  const availabilityClass = site.availableSlots === 0 ? 'text-red-600' : site.availableSlots <= 5 ? 'text-orange-600' : 'text-green-600'
  return (
    <article onClick={onSelect} className={`cursor-pointer rounded-2xl border p-4 transition ${selected ? 'border-primary bg-blue-50/40 ring-2 ring-primary/15' : 'border-slate-200 hover:border-primary/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-bold text-slate-900">{site.name}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{site.address}</p></div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${distanceClass}`}>{Number.isFinite(site.distance) ? `${site.distance.toFixed(2)} km away` : '-- km'}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`text-sm font-bold ${availabilityClass}`}>{site.availableSlots === 0 ? 'Full' : `${site.availableSlots} Available`}</span>
        <StatusBadge status={site.availableSlots === 0 ? 'Full' : 'Available'} />
        <span className="ml-auto text-sm font-bold text-primary">{money.format(site.rate)} / hour</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={(event) => { event.stopPropagation(); onSelect() }} className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">View on Map</button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpenSlots() }} className="rounded-lg border border-primary px-2 py-2 text-xs font-bold text-primary hover:bg-primary/5">View Slots</button>
        <button type="button" disabled={site.availableSlots === 0} onClick={(event) => { event.stopPropagation(); onOpenSlots() }} className="rounded-lg bg-primary px-2 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">Book Now</button>
      </div>
    </article>
  )
}
