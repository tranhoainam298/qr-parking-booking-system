/**
 * Session Routes — Controller / Route Layer
 * Handles: Entry scan, exit scan, active sessions, parking history
 */

// GET   /api/sessions
// GET   /api/sessions/active
// POST  /api/sessions/entry
// POST  /api/sessions/exit
// GET   /api/sessions/:id
// GET   /api/sessions/history

export const sessionRoutes = {
  list: '/api/sessions',
  active: '/api/sessions/active',
  confirmEntry: '/api/sessions/entry',
  confirmExit: '/api/sessions/exit',
  getById: '/api/sessions/:id',
  history: '/api/sessions/history',
}
