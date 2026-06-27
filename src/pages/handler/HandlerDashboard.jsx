import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/shared/DataTable'
import KpiCard from '../../components/shared/KpiCard'
import StatusBadge from '../../components/shared/StatusBadge'
import { parkingSessions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const formatTime = (value) => new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const actions = [
  { label: 'Scan Entry QR', path: '/handler/scan?mode=entry', icon: '↘', tone: 'bg-green-600 hover:bg-green-700' },
  { label: 'Scan Exit QR', path: '/handler/scan?mode=exit', icon: '↗', tone: 'bg-red-600 hover:bg-red-700' },
  { label: 'Create Onsite Booking', path: '/handler/onsite-booking', icon: '+', tone: 'bg-primary hover:bg-primary/90' },
  { label: 'Recharge User Wallet', path: '/handler/recharge-wallet', icon: '₫', tone: 'bg-orange-500 hover:bg-orange-600' },
]

export default function HandlerDashboard() {
  const navigate = useNavigate()
  const activeSessions = useMemo(() => parkingSessions.slice(0, 5).map((session, index) => ({
    ...session,
    status: 'Active',
    currentDuration: `${1 + index}h ${15 + index * 5}m`,
    estimatedFee: 50000 + index * 15000,
  })), [])

  const activity = useMemo(() => parkingSessions.slice(0, 8).map((session, index) => ({
    id: `${session.id}-${index}`,
    type: index % 3 === 2 ? 'Exit' : 'Entry',
    userName: session.userName,
    vehiclePlate: session.vehiclePlate,
    slotNumber: session.slotNumber,
    time: index % 3 === 2 && session.exitTime ? formatTime(session.exitTime) : formatTime(session.entryTime),
  })), [])

  const columns = [
    { key: 'id', label: 'Session ID' }, { key: 'userName', label: 'User' },
    { key: 'vehiclePlate', label: 'Vehicle Plate' }, { key: 'slotNumber', label: 'Slot' },
    { key: 'entryTime', label: 'Entry Time', render: formatTime }, { key: 'currentDuration', label: 'Current Duration' },
    { key: 'estimatedFee', label: 'Est. Fee', render: (fee) => money.format(fee) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  const kpis = [
    { title: 'Active Sessions', value: activeSessions.length, icon: '◉', color: 'primary' },
    { title: 'Today Entry Scans', value: 7, icon: '↘', color: 'green' },
    { title: 'Today Exit Scans', value: 6, icon: '↗', color: 'red' },
    { title: 'Onsite Bookings Created', value: 3, icon: '+', color: 'blue' },
    { title: 'Wallet Recharges Processed', value: 4, icon: '₫', color: 'orange' },
    { title: 'Cash Payments Collected', value: '₫ 150,000', icon: '▤', color: 'yellow' },
  ]

  return (
    <div className="w-full space-y-8">
      <div><p className="text-sm font-medium text-slate-500">Parking operations</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Handler Dashboard</h1></div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}</section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => (
            <button key={action.label} type="button" onClick={() => navigate(action.path)} className={`flex min-h-28 items-center gap-4 rounded-2xl p-5 text-left text-white shadow-lg transition hover:-translate-y-0.5 ${action.tone}`}>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-3xl font-bold">{action.icon}</span>
              <span className="text-base font-bold leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">Active Sessions</h2><button type="button" onClick={() => navigate('/handler/active-sessions')} className="text-sm font-bold text-primary hover:underline">View All →</button></div>
          <DataTable columns={columns} data={activeSessions} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recent Scan Activity</h2>
          <div className="mt-5 space-y-0">
            {activity.map((event, index) => (
              <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
                {index < activity.length - 1 && <span className="absolute bottom-0 left-5 top-10 w-px bg-slate-200" />}
                <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-bold text-white ${event.type === 'Entry' ? 'bg-green-500' : 'bg-red-500'}`}>{event.type === 'Entry' ? '↘' : '↗'}</span>
                <div className="min-w-0 flex-1 pt-0.5"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-bold text-slate-900">{event.userName}</p><time className="text-xs font-medium text-slate-400">{event.time}</time></div><p className="mt-1 text-xs text-slate-500">{event.vehiclePlate} · Slot {event.slotNumber}</p><p className={`mt-1 text-xs font-semibold ${event.type === 'Entry' ? 'text-green-600' : 'text-red-600'}`}>{event.type} scan</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
