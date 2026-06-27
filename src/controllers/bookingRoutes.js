/**
 * Booking Routes — Controller / Route Layer
 * Handles: Create booking, cancel booking, list bookings, QR ticket generation
 */

// GET    /api/bookings
// GET    /api/bookings/:id
// POST   /api/bookings
// PATCH  /api/bookings/:id/cancel
// GET    /api/bookings/:id/qr-ticket
// POST   /api/bookings/onsite

export const bookingRoutes = {
  list: '/api/bookings',
  getById: '/api/bookings/:id',
  create: '/api/bookings',
  cancel: '/api/bookings/:id/cancel',
  getQrTicket: '/api/bookings/:id/qr-ticket',
  createOnsite: '/api/bookings/onsite',
}
 