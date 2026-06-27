/**
 * Auth Routes — Controller / Route Layer
 * Handles: Login, Register, Logout, Profile update, Password change
 */

// POST /api/auth/login
// POST /api/auth/register
// POST /api/auth/logout
// GET  /api/auth/profile
// PUT  /api/auth/profile
// PUT  /api/auth/password

export const authRoutes = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  getProfile: '/api/auth/profile',
  updateProfile: '/api/auth/profile',
  changePassword: '/api/auth/password',
}
