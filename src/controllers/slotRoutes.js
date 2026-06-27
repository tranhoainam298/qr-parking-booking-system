/**
 * Slot Routes — Controller / Route Layer
 * Handles: CRUD parking slots, slot status, slot filtering
 */

// GET    /api/slots
// GET    /api/slots/:id
// POST   /api/slots
// PUT    /api/slots/:id
// DELETE /api/slots/:id
// PATCH  /api/slots/:id/status

export const slotRoutes = {
  list: '/api/slots',
  getById: '/api/slots/:id',
  create: '/api/slots',
  update: '/api/slots/:id',
  delete: '/api/slots/:id',
  updateStatus: '/api/slots/:id/status',
}
