const fallbackPositions = [
  [18, 28], [72, 24], [30, 70], [78, 68], [48, 18], [12, 58], [62, 82], [88, 43],
]

function Pin({ color, label, style, current = false }) {
  return (
    <div className="group absolute -translate-x-1/2 -translate-y-full" style={style}>
      <div className={`grid h-9 w-9 place-items-center rounded-full rounded-bl-none border-2 border-white text-sm text-white shadow-lg rotate-[-45deg] ${color}`}>
        <span className="rotate-45">{current ? '●' : 'P'}</span>
      </div>
      <span className="pointer-events-none absolute left-1/2 top-11 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </div>
  )
}

export default function MapPlaceholder({ sites = [], userLocation, highlightedSiteId, heightClass = 'h-[420px]' }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">GPS / Map Service — Live Map</h3>
          {userLocation && <p className="mt-0.5 text-xs text-slate-500">{userLocation.lat}, {userLocation.lng}</p>}
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" /> GPS Active
        </span>
      </header>
      <div className={`relative overflow-hidden bg-slate-200 ${heightClass}`}
        style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <div className="absolute left-[8%] top-[38%] h-2 w-[84%] -rotate-6 rounded-full bg-white/75 shadow-sm" />
        <div className="absolute left-[45%] top-[-10%] h-[120%] w-3 rotate-12 rounded-full bg-white/75 shadow-sm" />
        <Pin color="bg-blue-500" label="Current location" current style={{ left: '50%', top: '52%' }} />
        {sites.map((site, index) => {
          const [left, top] = fallbackPositions[index % fallbackPositions.length]
          const highlighted = site.id === highlightedSiteId
          return <Pin key={site.id ?? site.name ?? index} color={highlighted ? 'bg-yellow-400 ring-4 ring-orange-300/70' : 'bg-orange-500'} label={site.name || `Parking site ${index + 1}`} style={{ left: `${left}%`, top: `${top}%`, zIndex: highlighted ? 20 : 1 }} />
        })}
      </div>
    </section>
  )
}
