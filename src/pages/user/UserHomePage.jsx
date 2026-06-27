import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../components/shared/StatusBadge'
import WalletCard from '../../components/shared/WalletCard'
import { useAuth } from '../../context/AuthContext'
import { bookings, parkingSessions, parkingSites, users, walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const quickActions = [
  { label: 'Search Parking', icon: '⌕', path: '/user/search', color: 'bg-blue-600' },
  { label: 'Book Slot', icon: 'P', path: '/user/search', color: 'bg-orange-500' },
  { label: 'Show QR Ticket', icon: '⌗', path: '/user/qr-ticket', color: 'bg-teal-600' },
  { label: 'Recharge Wallet', icon: '₫', path: '/user/wallet', color: 'bg-primary' },
]

const notifications = [
  { icon: '⌖', text: 'Nearest parking found: City Center — 0.8 km away', color: 'bg-blue-100 text-blue-600' },
  { icon: '◷', text: 'Booking reminder: Your slot is reserved for 3:00 PM today', color: 'bg-orange-100 text-orange-600' },
  { icon: '⚠', text: 'Low wallet balance: ₫ 25,000 remaining', color: 'bg-yellow-100 text-yellow-700' },
]

export default function UserHomePage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const user = users.find((item) => item.id === currentUser.id) || users[0]
  const currentBooking = bookings.find((booking) => booking.userId === user.id && ['Active', 'Reserved'].includes(booking.status))
  const lastSession = parkingSessions.find((session) => session.userId === user.id) || parkingSessions[0]
  const lastRecharge = walletTransactions.find((transaction) => transaction.userId === user.id) || walletTransactions[0]
  const nearestSite = parkingSites[0]

  return (
    <div className="w-full space-y-8">
      <div><p className="text-sm font-medium text-slate-500">Your parking overview</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Welcome back, {currentUser.name}!</h1></div>

      <section className="grid gap-5 xl:grid-cols-3">
        <WalletCard balance={user.walletBalance} onRecharge={() => navigate('/user/wallet')} />
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Current Booking</p><h2 className="mt-2 text-xl font-bold text-slate-900">{currentBooking ? currentBooking.siteName : 'No active booking'}</h2></div><span className="grid h-12 w-12 place-items-center rounded-xl bg-orange-100 text-2xl text-orange-600">▣</span></div>{currentBooking ? <div className="mt-5 space-y-2 text-sm text-slate-600"><p>Slot: <strong className="text-slate-900">{currentBooking.slotNumber}</strong></p><p>{currentBooking.date} · {currentBooking.startTime}</p><StatusBadge status={currentBooking.status} /></div> : <div className="mt-5"><p className="text-sm text-slate-500">Reserve a nearby space before you arrive.</p><button type="button" onClick={() => navigate('/user/search')} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Book Now</button></div>}</article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Nearest Parking</p><h2 className="mt-2 text-xl font-bold text-slate-900">{nearestSite.name}</h2></div><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-2xl text-blue-600">⌖</span></div><p className="mt-3 text-sm leading-6 text-slate-500">{nearestSite.address}, {nearestSite.area}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">1.2 km away</span><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Available: 8 slots</span></div></article>
      </section>

      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{quickActions.map((action) => <button key={action.label} type="button" onClick={() => navigate(action.path)} className="flex min-h-28 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white ${action.color}`}>{action.icon}</span><span className="font-bold text-slate-900">{action.label}</span></button>)}</div></section>

      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Recent Activity</h2><div className="grid gap-5 lg:grid-cols-2"><ActivityCard title="Last Parking Session" icon="P"><ActivityRow label="Parking site" value={lastSession.siteName} /><ActivityRow label="Date" value={lastSession.entryTime.slice(0, 10)} /><ActivityRow label="Duration" value={lastSession.duration} /><ActivityRow label="Fee" value={lastSession.fee == null ? 'In progress' : money.format(lastSession.fee)} /><div className="pt-2"><StatusBadge status={lastSession.status} /></div></ActivityCard><ActivityCard title="Last Recharge" icon="₫"><ActivityRow label="Amount" value={money.format(lastRecharge.amount)} /><ActivityRow label="Method" value={lastRecharge.method} /><ActivityRow label="Date" value={new Date(lastRecharge.date).toLocaleDateString('en-GB')} /><div className="pt-2"><StatusBadge status={lastRecharge.status} /></div></ActivityCard></div></section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Notifications</h2><div className="mt-5 divide-y divide-slate-100">{notifications.map((item) => <div key={item.text} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${item.color}`}>{item.icon}</span><p className="text-sm font-medium text-slate-700">{item.text}</p></div>)}</div></section>
    </div>
  )
}

function ActivityCard({ title, icon, children }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><h3 className="font-bold text-slate-900">{title}</h3><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">{icon}</span></div><div className="space-y-3">{children}</div></article>
}

function ActivityRow({ label, value }) {
  return <div className="flex items-start justify-between gap-4 text-sm"><span className="text-slate-500">{label}</span><strong className="text-right text-slate-900">{value}</strong></div>
}
