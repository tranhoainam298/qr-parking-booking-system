import { delay, findById, generateId, getState, setState } from './mockStore'

const ROLES = ['Admin', 'Handler', 'User']

export async function login({ email, password, role }) {
  await delay()
  if (!email || !password) return { success: false, message: 'Email and password are required.' }
  if (!ROLES.includes(role)) return { success: false, message: 'Invalid role.' }
  if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' }

  const state = getState()
  if (role === 'Handler') {
    const handler = state.handlers.find((h) => h.email === email) || state.handlers[0]
    return { success: true, user: { ...handler, role: 'Handler' } }
  }
  if (role === 'Admin') {
    return { success: true, user: { id: 'ADM-001', name: 'Alex Morgan', email, role: 'Admin', status: 'Active' } }
  }
  const user = state.users.find((u) => u.email === email) || state.users[0]
  return { success: true, user: { ...user, role: 'User' } }
}

export async function registerUser(payload) {
  await delay()
  const { fullName, email, phone, vehiclePlate, password } = payload || {}
  if (!fullName || !email || !phone || !vehiclePlate || !password) {
    return { success: false, message: 'All fields are required.' }
  }
  if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' }

  const state = getState()
  if (state.users.some((u) => u.email === email)) {
    return { success: false, message: 'Email already registered.' }
  }

  const id = generateId('USR')
  const newUser = { id, name: fullName, role: 'User', email, phone, vehiclePlate, walletBalance: 0, status: 'Active' }
  state.users.push(newUser)
  state.wallets[id] = { userId: id, balance: 0 }
  // Create a UserProfile QR
  state.qrTickets.push({
    id: generateId('QRP'),
    bookingId: null,
    userId: id,
    qrValue: id,
    qrType: 'UserProfile',
    status: 'Active',
    createdAt: new Date().toISOString(),
  })
  setState(state)
  return { success: true, user: newUser }
}

export async function getCurrentUser(userId) {
  await delay()
  const user = findById('users', userId)
  if (!user) return { success: false, message: 'User not found.' }
  const wallet = getState().wallets[userId]
  return { success: true, user: { ...user, walletBalance: wallet?.balance ?? user.walletBalance } }
}

export async function updateProfile(userId, payload) {
  await delay()
  const state = getState()
  const index = state.users.findIndex((u) => u.id === userId)
  if (index === -1) return { success: false, message: 'User not found.' }
  Object.assign(state.users[index], payload)
  setState(state)
  return { success: true, user: state.users[index] }
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  await delay()
  if (!currentPassword || !newPassword) return { success: false, message: 'Both passwords required.' }
  if (newPassword.length < 6) return { success: false, message: 'New password must be at least 6 characters.' }
  // In a real app we'd verify currentPassword against a hash
  return { success: true, message: 'Password updated successfully.' }
}
