import { delay, generateId, getState, setState } from './mockStore'

export async function getBookingsByUser(userId, filters = {}) {
  await delay()
  const state = getState()
  let list = state.bookings.filter((b) => b.userId === userId)
  if (filters.status && filters.status !== 'All') list = list.filter((b) => b.status === filters.status)
  if (filters.startDate) list = list.filter((b) => b.date >= filters.startDate)
  if (filters.endDate) list = list.filter((b) => b.date <= filters.endDate)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((b) => [b.id, b.siteName, b.vehiclePlate].some((v) => String(v).toLowerCase().includes(q)))
  }
  return { success: true, bookings: list }
}

export async function getBookingById(bookingId) {
  await delay()
  const booking = getState().bookings.find((b) => b.id === bookingId)
  if (!booking) return { success: false, message: 'Booking not found.' }
  return { success: true, booking }
}

export async function createBooking(payload) {
  await delay()
  const state = getState()

  // Validate user
  const user = state.users.find((u) => u.id === payload.userId)
  if (!user) return { success: false, message: 'User not found.' }

  // Validate slot
  const slot = state.parkingSlots.find((s) => s.id === payload.slotId)
  if (!slot) return { success: false, message: 'Slot not found.' }
  if (slot.status !== 'Available') return { success: false, message: `Slot is not available (current status: ${slot.status}).` }

  // Validate site
  const site = state.parkingSites.find((s) => s.id === (payload.siteId || slot.siteId))
  if (!site) return { success: false, message: 'Parking site not found.' }

  const durationHours = Number(payload.duration) || 1
  const estimatedFee = durationHours * slot.rate
  const bookingId = generateId('BKG')

  const booking = {
    id: bookingId,
    userId: user.id,
    userName: user.name,
    vehiclePlate: payload.vehiclePlate || user.vehiclePlate,
    siteId: site.id,
    siteName: site.name,
    slotId: slot.id,
    slotNumber: slot.slotNumber || slot.id.replace('SLOT-', ''),
    date: payload.date || new Date().toISOString().slice(0, 10),
    startTime: payload.startTime || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    duration: `${durationHours}h`,
    durationHours,
    estimatedFee,
    status: 'Reserved',
    qrCode: `QR-${bookingId}`,
    createdAt: new Date().toISOString(),
  }

  // Update slot status → Reserved
  slot.status = 'Reserved'

  // Generate QR ticket
  const qrTicket = {
    id: generateId('QRT'),
    bookingId,
    userId: user.id,
    qrValue: `QR-${bookingId}`,
    qrType: 'ParkingTicket',
    status: 'Active',
    createdAt: new Date().toISOString(),
  }

  state.bookings.unshift(booking)
  state.qrTickets.push(qrTicket)
  setState(state)

  return { success: true, booking, qrTicket }
}

export async function cancelBooking(bookingId) {
  await delay()
  const state = getState()
  const booking = state.bookings.find((b) => b.id === bookingId)
  if (!booking) return { success: false, message: 'Booking not found.' }
  if (booking.status !== 'Reserved') return { success: false, message: 'Only reserved bookings can be cancelled.' }

  booking.status = 'Cancelled'

  // Release slot
  const slot = state.parkingSlots.find((s) => s.id === booking.slotId)
  if (slot && slot.status === 'Reserved') slot.status = 'Available'

  // Revoke QR
  const qr = state.qrTickets.find((t) => t.bookingId === bookingId && t.status === 'Active')
  if (qr) qr.status = 'Revoked'

  setState(state)
  return { success: true, booking }
}

export async function generateQrTicket(bookingId) {
  await delay()
  const state = getState()
  const booking = state.bookings.find((b) => b.id === bookingId)
  if (!booking) return { success: false, message: 'Booking not found.' }

  const existing = state.qrTickets.find((t) => t.bookingId === bookingId && t.status === 'Active')
  if (existing) return { success: true, qrTicket: existing }

  const qrTicket = {
    id: generateId('QRT'),
    bookingId,
    userId: booking.userId,
    qrValue: booking.qrCode || `QR-${bookingId}`,
    qrType: 'ParkingTicket',
    status: 'Active',
    createdAt: new Date().toISOString(),
  }
  state.qrTickets.push(qrTicket)
  setState(state)
  return { success: true, qrTicket }
}

export async function getLatestQrTicketByBooking(bookingId) {
  await delay()
  const tickets = getState().qrTickets.filter((t) => t.bookingId === bookingId)
  const active = tickets.find((t) => t.status === 'Active') || tickets[tickets.length - 1]
  if (!active) return { success: false, message: 'No QR ticket found.' }
  return { success: true, qrTicket: active }
}

export async function rebook(bookingId) {
  await delay()
  const state = getState()
  const original = state.bookings.find((b) => b.id === bookingId)
  if (!original) return { success: false, message: 'Original booking not found.' }
  return createBooking({
    userId: original.userId,
    slotId: original.slotId,
    siteId: original.siteId,
    vehiclePlate: original.vehiclePlate,
    duration: original.durationHours || 1,
  })
}

/** Get all bookings (admin) */
export async function getAllBookings(filters = {}) {
  await delay()
  const state = getState()
  let list = [...state.bookings]
  if (filters.status && filters.status !== 'All') list = list.filter((b) => b.status === filters.status)
  return { success: true, bookings: list }
}
