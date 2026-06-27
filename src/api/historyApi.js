import { delay, getState } from './mockStore'

export async function getParkingHistory({ role, userId, handlerId, filters = {} } = {}) {
  await delay()
  const state = getState()
  let sessions = [...state.parkingSessions]

  // Role-based filtering
  if (role === 'User' && userId) sessions = sessions.filter((s) => s.userId === userId)
  if (role === 'Handler' && handlerId) sessions = sessions.filter((s) => s.handlerId === handlerId)
  // Admin sees all

  if (filters.status && filters.status !== 'All') sessions = sessions.filter((s) => s.status === filters.status)
  if (filters.site && filters.site !== 'All') sessions = sessions.filter((s) => s.siteName === filters.site)
  if (filters.startDate) sessions = sessions.filter((s) => s.entryTime.slice(0, 10) >= filters.startDate)
  if (filters.endDate) sessions = sessions.filter((s) => s.entryTime.slice(0, 10) <= filters.endDate)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    sessions = sessions.filter((s) =>
      [s.userName, s.vehiclePlate, s.bookingId].some((v) => String(v).toLowerCase().includes(q)))
  }

  return { success: true, sessions }
}

export async function getRechargeHistory({ role, userId, handlerId, filters = {} } = {}) {
  await delay()
  const state = getState()
  let transactions = [...state.walletTransactions]

  if (role === 'User' && userId) transactions = transactions.filter((t) => t.userId === userId)
  if (role === 'Handler' && handlerId) transactions = transactions.filter((t) => t.handlerId === handlerId)

  if (filters.method && filters.method !== 'All') {
    transactions = transactions.filter((t) => {
      const display = t.handlerId ? 'Handler' : t.method === 'Cash' ? 'Cash' : 'Card'
      return display === filters.method
    })
  }
  if (filters.status && filters.status !== 'All') transactions = transactions.filter((t) => t.status === filters.status)
  if (filters.startDate) transactions = transactions.filter((t) => t.date.slice(0, 10) >= filters.startDate)
  if (filters.endDate) transactions = transactions.filter((t) => t.date.slice(0, 10) <= filters.endDate)

  return { success: true, transactions }
}

export async function getAdminDashboardSummary() {
  await delay()
  const state = getState()
  const slots = state.parkingSlots
  const bookings = state.bookings
  const sessions = state.parkingSessions
  const users = state.users

  return {
    success: true,
    summary: {
      totalUsers: users.length,
      totalSites: state.parkingSites.length,
      totalSlots: slots.length,
      availableSlots: slots.filter((s) => s.status === 'Available').length,
      occupiedSlots: slots.filter((s) => s.status === 'Occupied').length,
      reservedSlots: slots.filter((s) => s.status === 'Reserved').length,
      maintenanceSlots: slots.filter((s) => s.status === 'Maintenance').length,
      activeSessions: sessions.filter((s) => s.status === 'Active').length,
      todayBookings: bookings.filter((b) => b.date === new Date().toISOString().slice(0, 10)).length || bookings.length,
      recentBookings: bookings.slice(0, 5),
      recentTransactions: state.walletTransactions.slice(0, 5),
    },
  }
}

export async function getRecentBookings() {
  await delay()
  return { success: true, bookings: getState().bookings.slice(0, 5) }
}

export async function getRecentRechargeTransactions() {
  await delay()
  return { success: true, transactions: getState().walletTransactions.slice(0, 5) }
}
