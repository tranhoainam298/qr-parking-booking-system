import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = {
  Admin: [
    ['Dashboard', '', '▦'], ['User Management', 'users', '♙'],
    ['Parking Slot Management', 'parking-slots', 'P'], ['Parking History', 'parking-history', '↺'],
    ['Recharge History', 'recharge-history', '$'], ['Feedback', 'feedback', '✦'], ['Settings', 'settings', '⚙'],
  ],
  Handler: [
    ['Dashboard', '', '▦'], ['Scan QR Entry/Exit', 'scan', '⌗'], ['Onsite Booking', 'onsite-booking', '+'],
    ['Recharge User Wallet', 'recharge-wallet', '$'], ['Active Sessions', 'active-sessions', '●'],
    ['Parking History', 'parking-history', '↺'], ['Recharge History', 'recharge-history', '⇄'], ['Profile', 'profile', '♙'],
  ],
  User: [
    ['Home', '', '⌂'], ['Search Parking', 'search-parking', '⌕'], ['My Bookings', 'bookings', '▣'],
    ['QR Ticket', 'qr-ticket', '⌗'], ['Wallet & Recharge', 'wallet', '$'],
    ['Parking History', 'parking-history', '↺'], ['Recharge History', 'recharge-history', '⇄'],
    ['Profile', 'profile', '♙'], ['Feedback', 'feedback', '✦'],
  ],
}

const rolePaths = { Admin: 'admin', Handler: 'handler', User: 'user' }

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, currentRole, setRole } = useAuth()
  const segment = location.pathname.split('/')[1]
  const role = segment === 'handler' ? 'Handler' : segment === 'user' ? 'User' : 'Admin'

  useEffect(() => {
    if (currentRole !== role) setRole(role)
  }, [currentRole, role, setRole])

  useEffect(() => {
    const close = (event) => !profileRef.current?.contains(event.target) && setProfileOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const changeRole = (nextRole) => {
    setRole(nextRole)
    navigate(`/${rolePaths[nextRole]}`)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`sticky top-0 flex h-screen shrink-0 flex-col bg-primary text-white shadow-xl transition-[width] duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white font-black text-primary">P</span>
            {!collapsed && <span className="truncate text-sm font-bold">QR Parking</span>}
          </div>
          {!collapsed && <button className="rounded-lg p-2 text-white/70 hover:bg-white/10" onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">‹</button>}
        </div>

        {collapsed && <button className="mx-auto mt-3 rounded-lg p-2 text-white/70 hover:bg-white/10" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">›</button>}

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems[role].map(([label, path, icon]) => {
            const target = `/${rolePaths[role]}${path ? `/${path}` : ''}`
            return (
              <NavLink key={label} to={target} end={!path} title={collapsed ? label : undefined}
                className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${isActive ? 'bg-white text-primary shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <span className="grid w-6 shrink-0 place-items-center text-lg font-semibold" aria-hidden="true">{icon}</span>
                {!collapsed && <span className="leading-tight">{label}</span>}
              </NavLink>
            )
          })}
        </nav>
        {!collapsed && <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">© 2026 QR Parking</div>}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-bold text-primary">QR Parking Booking System</p>
            <p className="text-xs text-slate-500">Smart parking, simplified</p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <select value={role} onChange={(event) => changeRole(event.target.value)} aria-label="Current role"
              className="rounded-full border-0 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
              <option>Admin</option><option>Handler</option><option>User</option>
            </select>
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-primary" aria-label="Notifications">
              <span className="text-xl" aria-hidden="true">♢</span>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-occupied ring-2 ring-white" />
            </button>

            <div className="relative" ref={profileRef}>
              <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">{currentUser.avatar}</span>
                <span className="hidden text-left md:block">
                  <span className="block text-sm font-semibold leading-4 text-slate-800">{currentUser.name}</span>
                  <span className="block text-xs text-slate-500">{role}</span>
                </span>
                <span className="text-xs text-slate-400">⌄</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                    <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                  <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50">View profile</button>
                  <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-occupied hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
