const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  teal: 'bg-teal-100 text-teal-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-600',
}

const trendStyles = {
  up: { icon: '↗', className: 'text-green-600' },
  down: { icon: '↘', className: 'text-red-600' },
  neutral: { icon: '→', className: 'text-slate-500' },
}

export default function KpiCard({ title, value, subtitle, icon, color = 'primary', trend, trendValue }) {
  const trendStyle = trendStyles[trend]
  const colorClass = colorClasses[color] || colorClasses.primary
  const customColor = color && (color.startsWith('#') || color.startsWith('rgb')) ? { backgroundColor: `${color}1A`, color } : undefined

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${customColor ? '' : colorClass}`} style={customColor}>
          {icon}
        </div>
      </div>
      {(subtitle || trendStyle) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trendStyle && (
            <span className={`font-semibold ${trendStyle.className}`}>
              {trendStyle.icon} {trendValue}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </article>
  )
}
