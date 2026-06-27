import { delay, getState, setState } from './mockStore'

export async function getUsers(filters = {}) {
  await delay()
  const state = getState()
  let list = [...state.users]
  if (filters.role && filters.role !== 'All') list = list.filter((u) => u.role === filters.role)
  if (filters.status && filters.status !== 'All') list = list.filter((u) => u.status === filters.status)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((u) => [u.name, u.email, u.phone].some((v) => String(v).toLowerCase().includes(q)))
  }
  // Attach live wallet balance
  list = list.map((u) => ({ ...u, walletBalance: state.wallets[u.id]?.balance ?? u.walletBalance }))
  return { success: true, users: list }
}

export async function getUserById(userId) {
  await delay()
  const state = getState()
  const user = state.users.find((u) => u.id === userId)
  if (!user) return { success: false, message: 'User not found.' }
  return { success: true, user: { ...user, walletBalance: state.wallets[userId]?.balance ?? user.walletBalance } }
}

export async function updateUser(userId, payload) {
  await delay()
  const state = getState()
  const index = state.users.findIndex((u) => u.id === userId)
  if (index === -1) return { success: false, message: 'User not found.' }
  Object.assign(state.users[index], payload)
  setState(state)
  return { success: true, user: state.users[index] }
}

export async function blockUser(userId) {
  return updateUser(userId, { status: 'Blocked' })
}

export async function unblockUser(userId) {
  return updateUser(userId, { status: 'Active' })
}
