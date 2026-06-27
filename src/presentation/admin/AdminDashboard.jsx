import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DataTable from '../../components/shared/DataTable'
import KpiCard from '../../components/shared/KpiCard'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'

const revenueData = [
  { day: 'Mon', revenue: 720000 },
  { day: 'Tue', revenue: 890000 },
  { day: 'Wed', revenue: 780000 },
  { day: 'Thu', revenue: 1100000 },
  { day: 'Fri', revenue: 1250000 },
  { day: 'Sat', revenue: 1480000 },
  { day: 'Sun', revenue: 1320000 },
]

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const bookingColumns = [
  { key: 'id', label: 'Booking ID' },
  { key: 'userName', label: 'User' },
  { key: 'siteName', label: 'Site' },
  { key: 'slotNumber', label: 'Slot' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
]

const transactionColumns = [
  { key: 'id', label: 'Transaction ID' },
  { key: 'userName', label: 'User' },
  { key: 'amount', label: 'Amount', render: (amount) => money.format(amount) },
  { key: 'method', label: 'Method' },
  { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleDateString('en-GB') },
  { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
]

const alerts = [
  'Low slot availability at City Center Parking',
  'High traffic at Airport Parking',
  'Failed recharge — TXN-009',
]

const quickActions = [
  { label: 'Add Parking Slot', path: '/admin/parking-slots', icon: '+' },
  { label: 'View Parking History', path: '/admin/parking-history', icon: '↺' },
  { label: 'View Recharge History', path: '/admin/recharge-history', icon: '₫' },
  { label: 'Manage Users', path: '/admin/users', icon: '♙' },
]

function ChartCard({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-5 h-80">{children}</div>
    </section>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  const state = getState()
  const bookings = state.bookings
  const parkingSites = state.parkingSites
  const parkingSlots = state.parkingSlots
  const users = state.users
  const walletTransactions = state.walletTransactions
  const activeSessions = state.parkingSessions.filter((s) => s.status === 'Active').length

  const counts = useMemo(() => ({
    available: parkingSlots.filter((slot) => slot.status === 'Available').length,
    occupied: parkingSlots.filter((slot) => slot.status === 'Occupied').length,
    reserved: parkingSlots.filter((slot) => slot.status === 'Reserved').length,
    maintenance: parkingSlots.filter((slot) => slot.status === 'Maintenance').length,
  }), [parkingSlots])

  const slotDistribution = useMemo(() => [
    { name: 'Available', value: counts.available, color: '#22C55E' },
    { name: 'Occupied', value: counts.occupied, color: '#EF4444' },
    { name: 'Reserved', value: counts.reserved, color: '#F97316' },
    { name: 'Maintenance', value: counts.maintenance, color: '#9CA3AF' },
  ], [counts])

  const kpis = [
    { title: 'Total Users', value: users.length, subtitle: 'Registered accounts', icon: '♙', color: 'primary', trend: 'up', trendValue: '8.4%' },
    { title: 'Total Parking Sites', value: parkingSites.length, subtitle: 'Across all areas', icon: '⌖', color: 'purple' },
    { title: 'Total Parking Slots', value: parkingSlots.length, subtitle: 'Managed inventory', icon: 'P', color: 'blue' },
    { title: 'Available Slots', value: counts.available, subtitle: 'Ready for booking', icon: '✓', color: 'green' },
    { title: 'Occupied Slots', value: counts.occupied, subtitle: 'Currently in use', icon: '●', color: 'red' },
    { title: 'Reserved Slots', value: counts.reserved, subtitle: 'Upcoming arrivals', icon: '◆', color: 'orange' },
    { title: "Today's Bookings", value: bookings.filter((b) => b.date === new Date().toISOString().slice(0, 10)).length || 12, subtitle: 'Since midnight', icon: '▣', color: 'teal', trend: 'up', trendValue: '12%' },
    { title: "Today's Revenue", value: '₫ 1,250,000', subtitle: 'Gross parking revenue', icon: '₫', color: 'yellow', trend: 'up', trendValue: '6.2%' },
    { title: 'Active Sessions', value: activeSessions, subtitle: 'Vehicles currently parked', icon: '◉', color: 'primary', trend: 'neutral', trendValue: 'Live' },
  ]

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">System overview</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500">Live operational summary</p>
      </div>

      <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Slot Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slotDistribution} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={72} outerRadius={112} paddingAngle={3} strokeWidth={0}>
                {slotDistribution.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(value) => [`${value} Slots`, 'Count']} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue (Last 7 Days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 10, right: 16, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `₫${value / 1000000}M`} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(value) => [money.format(value), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#1E3A5F" strokeWidth={3} dot={{ r: 4, fill: '#1E3A5F', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-2">
        <section className="min-w-0">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Bookings</h2>
          <DataTable columns={bookingColumns} data={bookings.slice(0, 5)} />
        </section>
        <section className="min-w-0">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Recharge Transactions</h2>
          <DataTable columns={transactionColumns} data={walletTransactions.slice(0, 5)} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">System Alerts</h2>
          <div className="mt-5 space-y-3">
            {alerts.map((alert) => (
              <div key={alert} className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-yellow-400 font-bold text-yellow-950">!</span>
                <p className="pt-1 text-sm font-medium text-yellow-900">{alert}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button key={action.label} type="button" onClick={() => navigate(action.path)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
