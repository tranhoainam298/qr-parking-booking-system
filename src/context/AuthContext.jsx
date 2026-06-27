import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const initialRoleUsers = {
  Admin: { id: 'ADM-001', name: 'Alex Morgan', email: 'alex@qrparking.test', phone: '+66 82 100 1001', status: 'Active', avatar: 'AM' },
  Handler: { id: 'HND-001', name: 'Jordan Lee', email: 'jordan@qrparking.test', phone: '+66 82 200 1001', status: 'Active', avatar: 'JL' },
  User: { id: 'USR-001', name: 'Taylor Smith', email: 'taylor@qrparking.test', phone: '+66 81 111 1001', status: 'Active', avatar: 'TS', vehiclePlate: '1กข-1001', vehicleType: 'Sedan' },
}

const getInitials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState('Admin')
  const [roleUsers, setRoleUsers] = useState(initialRoleUsers)

  const updateCurrentUser = (updates) => {
    setRoleUsers((users) => {
      const nextUser = { ...users[currentRole], ...updates }
      if (updates.name) nextUser.avatar = getInitials(updates.name)
      return { ...users, [currentRole]: nextUser }
    })
  }

  const value = useMemo(
    () => ({ currentUser: roleUsers[currentRole], currentRole, setRole: setCurrentRole, updateCurrentUser }),
    [currentRole, roleUsers],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
