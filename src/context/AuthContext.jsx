import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { getState, setState } from '../api/mockStore'

const AuthContext = createContext(null)

const getInitials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('qr-parking-role') || 'Admin')
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('qr-parking-userid') || '')

  const [currentUser, setCurrentUser] = useState(() => {
    // Initial sync
    const state = getState()
    const role = localStorage.getItem('qr-parking-role') || 'Admin'
    const userId = localStorage.getItem('qr-parking-userid') || ''
    
    if (role === 'Admin') {
      return { id: 'ADM-001', name: 'Alex Morgan', email: 'alex@qrparking.test', phone: '+66 82 100 1001', status: 'Active', avatar: 'AM', role: 'Admin' }
    }
    if (role === 'Handler') {
      const handler = state.handlers.find((h) => h.id === userId) || state.handlers[0]
      return { ...handler, role: 'Handler' }
    }
    const user = state.users.find((u) => u.id === userId) || state.users[0]
    const wallet = state.wallets[user.id]
    return { ...user, walletBalance: wallet?.balance ?? user.walletBalance, role: 'User' }
  })

  // Sync state to current role/user changes
  useEffect(() => {
    const state = getState()
    let activeUser = null

    if (currentRole === 'Admin') {
      activeUser = { id: 'ADM-001', name: 'Alex Morgan', email: 'alex@qrparking.test', phone: '+66 82 100 1001', status: 'Active', avatar: 'AM', role: 'Admin' }
    } else if (currentRole === 'Handler') {
      const handler = state.handlers.find((h) => h.id === currentUserId) || state.handlers[0]
      activeUser = { ...handler, role: 'Handler' }
    } else {
      const user = state.users.find((u) => u.id === currentUserId) || state.users[0]
      const wallet = state.wallets[user.id]
      activeUser = { ...user, walletBalance: wallet?.balance ?? user.walletBalance, role: 'User' }
    }

    if (activeUser) {
      setCurrentUser(activeUser)
      localStorage.setItem('qr-parking-role', currentRole)
      localStorage.setItem('qr-parking-userid', activeUser.id)
    }
  }, [currentRole, currentUserId])

  const setRole = (role) => {
    const state = getState()
    setCurrentRole(role)
    if (role === 'Admin') {
      setCurrentUserId('ADM-001')
    } else if (role === 'Handler') {
      setCurrentUserId(state.handlers[0].id)
    } else {
      setCurrentUserId(state.users[0].id)
    }
  }

  const loginUser = (user, role) => {
    setCurrentRole(role)
    setCurrentUserId(user.id)
  }

  const updateCurrentUser = (updates) => {
    const state = getState()
    if (currentRole === 'User') {
      const idx = state.users.findIndex((u) => u.id === currentUser.id)
      if (idx !== -1) {
        Object.assign(state.users[idx], updates)
        if (updates.name) state.users[idx].avatar = getInitials(updates.name)
        setState(state)
        // trigger re-sync
        setCurrentUserId(currentUser.id)
      }
    } else if (currentRole === 'Handler') {
      const idx = state.handlers.findIndex((h) => h.id === currentUser.id)
      if (idx !== -1) {
        Object.assign(state.handlers[idx], updates)
        if (updates.name) state.handlers[idx].avatar = getInitials(updates.name)
        setState(state)
        setCurrentUserId(currentUser.id)
      }
    }
  }

  const value = useMemo(
    () => ({ currentUser, currentRole, setRole, loginUser, updateCurrentUser }),
    [currentRole, currentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
