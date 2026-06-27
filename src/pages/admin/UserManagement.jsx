import { useMemo, useState } from 'react'
import ConfirmModal from '../../components/shared/ConfirmModal'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { bookings, users as mockUsers, walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const roleStyles = {
  Admin: 'bg-purple-100 text-purple-700',
  Handler: 'bg-blue-100 text-blue-700',
  User: 'bg-teal-100 text-teal-700',
}

function RoleBadge({ role }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${roleStyles[role] || 'bg-slate-100 text-slate-700'}`}>{role}</span>
}

function ActionButton({ label, children, tone = 'slate', onClick }) {
  const tones = {
    slate: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    blue: 'text-blue-600 hover:bg-blue-50',
    red: 'text-red-600 hover:bg-red-50',
    green: 'text-green-600 hover:bg-green-50',
  }
  return (
    <button type="button" title={label} aria-label={label} onClick={(event) => { event.stopPropagation(); onClick() }}
      className={`grid h-8 w-8 place-items-center rounded-lg text-base transition ${tones[tone]}`}>
      {children}
    </button>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState(() => mockUsers.map((user, index) => ({
    ...user,
    status: user.status === 'Active' ? 'Active' : 'Blocked',
    createdDate: `2026-${String(1 + (index % 5)).padStart(2, '0')}-${String(4 + index * 2).padStart(2, '0')}`,
  })))
  const [filters, setFilters] = useState({ search: '', role: 'All', status: 'All' })
  const [detailUser, setDetailUser] = useState(null)
  const [detailTab, setDetailTab] = useState('Information')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'User', status: 'Active' })
  const [statusTarget, setStatusTarget] = useState(null)

  const filteredUsers = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch = !query || [user.name, user.email, user.phone].some((value) => String(value).toLowerCase().includes(query))
      return matchesSearch && (filters.role === 'All' || user.role === filters.role) && (filters.status === 'All' || user.status === filters.status)
    })
  }, [filters, users])

  const openDetails = (user) => {
    setDetailUser(user)
    setDetailTab('Information')
  }

  const openEdit = (user) => {
    setEditUser(user)
    setEditForm({ name: user.name, phone: user.phone, role: user.role, status: user.status })
  }

  const saveUser = (event) => {
    event.preventDefault()
    const updated = { ...editUser, ...editForm }
    setUsers((current) => current.map((user) => user.id === editUser.id ? updated : user))
    if (detailUser?.id === updated.id) setDetailUser(updated)
    setEditUser(null)
  }

  const toggleStatus = () => {
    const nextStatus = statusTarget.status === 'Blocked' ? 'Active' : 'Blocked'
    setUsers((current) => current.map((user) => user.id === statusTarget.id ? { ...user, status: nextStatus } : user))
    if (detailUser?.id === statusTarget.id) setDetailUser((current) => ({ ...current, status: nextStatus }))
    setStatusTarget(null)
  }

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role', render: (role) => <RoleBadge role={role} /> },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'walletBalance', label: 'Wallet Balance (₫)', render: (balance) => money.format(balance) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'createdDate', label: 'Created Date' },
    {
      key: 'actions', label: 'Actions', render: (_, user) => (
        <div className="flex items-center gap-1">
          <ActionButton label={`View ${user.name}`} onClick={() => openDetails(user)} tone="blue">◉</ActionButton>
          <ActionButton label={`Edit ${user.name}`} onClick={() => openEdit(user)} tone="slate">✎</ActionButton>
          <ActionButton label={`${user.status === 'Blocked' ? 'Unblock' : 'Block'} ${user.name}`} onClick={() => setStatusTarget(user)} tone={user.status === 'Blocked' ? 'green' : 'red'}>
            {user.status === 'Blocked' ? '♢' : '⊘'}
          </ActionButton>
        </div>
      ),
    },
  ]

  const userBookings = detailUser ? bookings.filter((booking) => booking.userId === detailUser.id).slice(0, 5) : []
  const userTransactions = detailUser ? walletTransactions.filter((transaction) => transaction.userId === detailUser.id).slice(0, 5) : []

  const bookingColumns = [
    { key: 'id', label: 'Booking ID' }, { key: 'siteName', label: 'Site' }, { key: 'slotNumber', label: 'Slot' },
    { key: 'date', label: 'Date' }, { key: 'estimatedFee', label: 'Fee', render: (fee) => money.format(fee) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]
  const rechargeColumns = [
    { key: 'id', label: 'Transaction ID' }, { key: 'amount', label: 'Amount', render: (amount) => money.format(amount) },
    { key: 'method', label: 'Method' }, { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleDateString('en-GB') },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Accounts and access</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">User Management</h1>
      </div>

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
        <label className="relative">
          <span className="sr-only">Search users</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search name, email or phone" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <select aria-label="Filter by role" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
          <option value="All">All roles</option><option>Admin</option><option>Handler</option><option>User</option>
        </select>
        <select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
          <option value="All">All statuses</option><option>Active</option><option>Blocked</option>
        </select>
        <button type="button" onClick={() => setFilters({ search: '', role: 'All', status: 'All' })}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset filters</button>
      </section>

      <DataTable columns={columns} data={filteredUsers} onRowClick={openDetails} />

      <Modal isOpen={Boolean(detailUser)} onClose={() => setDetailUser(null)} title="User Details" size="xl">
        {detailUser && (
          <div>
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
              {['Information', 'Booking History', 'Recharge History'].map((tab) => (
                <button key={tab} type="button" onClick={() => setDetailTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${detailTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === 'Information' && (
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary text-2xl font-bold text-white">{detailUser.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{detailUser.name}</h3>
                  <div className="mt-3 flex justify-center gap-2"><RoleBadge role={detailUser.role} /><StatusBadge status={detailUser.status} /></div>
                  {detailUser.role === 'User' && <p className="mt-5 text-sm text-slate-500">Vehicle plate<br /><strong className="mt-1 block text-base text-slate-900">{detailUser.vehiclePlate}</strong></p>}
                </div>
                <dl className="grid content-start gap-5 sm:grid-cols-2">
                  {[
                    ['Email', detailUser.email], ['Phone', detailUser.phone],
                    ['Wallet balance', money.format(detailUser.walletBalance)], ['Created date', detailUser.createdDate],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value}</dd></div>
                  ))}
                </dl>
              </div>
            )}
            {detailTab === 'Booking History' && <DataTable columns={bookingColumns} data={userBookings} />}
            {detailTab === 'Recharge History' && <DataTable columns={rechargeColumns} data={userTransactions} />}
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(editUser)} onClose={() => setEditUser(null)} title="Edit User" size="md">
        {editUser && (
          <form onSubmit={saveUser} className="space-y-5">
            <label className="block text-sm font-semibold text-slate-700">Full Name<input required value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label className="block text-sm font-semibold text-slate-700">Phone<input required value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label className="block text-sm font-semibold text-slate-700">Role<select value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary"><option>Admin</option><option>Handler</option><option>User</option></select></label>
            <label className="block text-sm font-semibold text-slate-700">Status<select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary"><option>Active</option><option>Blocked</option></select></label>
            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setEditUser(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Save</button></div>
          </form>
        )}
      </Modal>

      <ConfirmModal isOpen={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} onConfirm={toggleStatus}
        title={`${statusTarget?.status === 'Blocked' ? 'Unblock' : 'Block'} user`}
        message={`Are you sure you want to ${statusTarget?.status === 'Blocked' ? 'unblock' : 'block'} ${statusTarget?.name || 'this user'}?`}
        confirmLabel={statusTarget?.status === 'Blocked' ? 'Unblock' : 'Block'} confirmColor={statusTarget?.status === 'Blocked' ? 'green' : 'red'} />
    </div>
  )
}
