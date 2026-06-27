import { delay, generateId, getState, setState } from './mockStore'

export async function validateQrTicket(qrValue) {
  await delay()
  const state = getState()

  // Find QR ticket
  const qr = state.qrTickets.find((t) => t.qrValue === qrValue && t.qrType === 'ParkingTicket')
  if (!qr) return { success: false, message: 'QR ticket not found.' }
  if (qr.status !== 'Active') return { success: false, message: `QR ticket is ${qr.status}.` }

  // Find booking
  const booking = state.bookings.find((b) => b.id === qr.bookingId)
  if (!booking) return { success: false, message: 'Associated booking not found.' }
  if (!['Reserved', 'Active'].includes(booking.status)) {
    return { success: false, message: `Booking status is ${booking.status}. Expected Reserved or Active.` }
  }

  const user = state.users.find((u) => u.id === booking.userId)
  const slot = state.parkingSlots.find((s) => s.id === booking.slotId)
  const site = state.parkingSites.find((s) => s.id === booking.siteId)
  const wallet = state.wallets[booking.userId]

  return {
    success: true,
    booking,
    user: user ? { ...user, walletBalance: wallet?.balance ?? user.walletBalance } : null,
    slot,
    site,
    wallet,
    qrTicket: qr,
  }
}

export async function startParkingSession({ qrValue, handlerId }) {
  await delay()
  const state = getState()

  // Validate
  const validation = await validateQrTicket(qrValue)
  if (!validation.success) return validation
  const { booking, slot } = validation

  if (booking.status !== 'Reserved') {
    return { success: false, message: `Cannot start session — booking is ${booking.status}. Expected Reserved.` }
  }

  // Update booking → Active
  booking.status = 'Active'

  // Update slot → Occupied
  if (slot) slot.status = 'Occupied'

  // Create parking session
  const session = {
    id: generateId('SES'),
    bookingId: booking.id,
    userId: booking.userId,
    userName: booking.userName,
    vehiclePlate: booking.vehiclePlate,
    siteName: booking.siteName,
    slotNumber: booking.slotNumber,
    entryTime: new Date().toISOString(),
    exitTime: null,
    duration: 'In progress',
    fee: null,
    paymentMethod: null,
    handlerId: handlerId || null,
    status: 'Active',
  }

  state.parkingSessions.unshift(session)
  setState(state)

  return { success: true, session, booking }
}

export async function endParkingSession({ sessionId, paymentMethod = 'Wallet' }) {
  await delay()
  const state = getState()

  const session = state.parkingSessions.find((s) => s.id === sessionId)
  if (!session) return { success: false, message: 'Session not found.' }
  if (session.status !== 'Active') return { success: false, message: `Session is already ${session.status}.` }

  const booking = state.bookings.find((b) => b.id === session.bookingId)
  const slot = state.parkingSlots.find((s) => s.id === booking?.slotId)
  const site = state.parkingSites.find((s) => s.id === booking?.siteId)
  const wallet = state.wallets[session.userId]

  // Calculate duration & fee
  const entryTime = new Date(session.entryTime)
  const exitTime = new Date()
  const durationMs = exitTime - entryTime
  const durationHours = Math.max(0.5, durationMs / (1000 * 60 * 60))
  const hourlyRate = slot?.rate || site?.rate || 5000
  const totalFee = Math.ceil(durationHours) * hourlyRate

  const durationMinutes = Math.round(durationMs / (1000 * 60))
  const durationString = durationMinutes >= 60
    ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
    : `${durationMinutes}m`

  // Process payment
  if (paymentMethod === 'Wallet') {
    if (!wallet || wallet.balance < totalFee) {
      return {
        success: false,
        message: `Insufficient wallet balance (${wallet?.balance ?? 0} < ${totalFee}). Use Cash payment instead.`,
        fee: totalFee,
        walletBalance: wallet?.balance ?? 0,
        requiresCash: true,
      }
    }
    wallet.balance -= totalFee
    // Also update user record
    const user = state.users.find((u) => u.id === session.userId)
    if (user) user.walletBalance = wallet.balance
  }

  // Create payment transaction
  const paymentTx = {
    id: generateId('PTX'),
    userId: session.userId,
    userName: session.userName,
    sessionId: session.id,
    bookingId: session.bookingId,
    amount: totalFee,
    method: paymentMethod,
    gatewayRef: paymentMethod === 'Wallet' ? `WALLET-${Date.now()}` : `CASH-${Date.now()}`,
    date: exitTime.toISOString(),
    status: 'Completed',
  }
  state.paymentTransactions.push(paymentTx)

  // Complete session
  session.exitTime = exitTime.toISOString()
  session.duration = durationString
  session.fee = totalFee
  session.paymentMethod = paymentMethod
  session.status = 'Completed'

  // Complete booking
  if (booking) booking.status = 'Completed'

  // Release slot
  if (slot) slot.status = 'Available'

  // Create parking history
  state.parkingHistories.push({
    id: generateId('PH'),
    sessionId: session.id,
    bookingId: session.bookingId,
    userId: session.userId,
    userName: session.userName,
    vehiclePlate: session.vehiclePlate,
    siteName: session.siteName,
    slotNumber: session.slotNumber,
    entryTime: session.entryTime,
    exitTime: session.exitTime,
    duration: durationString,
    fee: totalFee,
    paymentMethod,
    handlerId: session.handlerId,
    date: exitTime.toISOString(),
  })

  setState(state)

  return {
    success: true,
    session,
    booking,
    payment: paymentTx,
    fee: totalFee,
    duration: durationString,
    walletBalance: wallet?.balance ?? null,
  }
}

export async function getActiveSessions(handlerId) {
  await delay()
  const state = getState()
  let sessions = state.parkingSessions.filter((s) => s.status === 'Active')
  if (handlerId) sessions = sessions.filter((s) => s.handlerId === handlerId || !s.handlerId)
  return { success: true, sessions }
}

export async function getAllSessions(filters = {}) {
  await delay()
  const state = getState()
  let sessions = [...state.parkingSessions]
  if (filters.status && filters.status !== 'All') sessions = sessions.filter((s) => s.status === filters.status)
  if (filters.handlerId) sessions = sessions.filter((s) => s.handlerId === filters.handlerId)
  if (filters.userId) sessions = sessions.filter((s) => s.userId === filters.userId)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    sessions = sessions.filter((s) =>
      [s.userName, s.vehiclePlate, s.bookingId].some((v) => String(v).toLowerCase().includes(q)))
  }
  if (filters.site && filters.site !== 'All') sessions = sessions.filter((s) => s.siteName === filters.site)
  if (filters.startDate) sessions = sessions.filter((s) => s.entryTime.slice(0, 10) >= filters.startDate)
  if (filters.endDate) sessions = sessions.filter((s) => s.entryTime.slice(0, 10) <= filters.endDate)
  return { success: true, sessions }
}

export async function getSessionByBooking(bookingId) {
  await delay()
  const session = getState().parkingSessions.find((s) => s.bookingId === bookingId)
  return session ? { success: true, session } : { success: false, message: 'No session found.' }
}
