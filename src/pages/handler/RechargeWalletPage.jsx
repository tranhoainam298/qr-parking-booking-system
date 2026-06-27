import { useMemo, useRef, useState } from 'react'
import ConfirmModal from '../../components/shared/ConfirmModal'
import DataTable from '../../components/shared/DataTable'
import QRScannerPlaceholder from '../../components/shared/QRScannerPlaceholder'
import StatusBadge from '../../components/shared/StatusBadge'
import WalletCard from '../../components/shared/WalletCard'
import { useAuth } from '../../context/AuthContext'
import { users as mockUsers, walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export default function RechargeWalletPage() {
  const { currentUser: handler } = useAuth()
  const [users, setUsers] = useState(mockUsers)
  const [searchMode, setSearchMode] = useState('qr')
  const [query, setQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [localTransactions, setLocalTransactions] = useState([])
  const amountRef = useRef(null)

  const findUser = (value = query) => {
    const normalized = String(value).trim().toLowerCase()
    const user = searchMode === 'qr'
      ? users.find((item) => item.id.toLowerCase() === normalized) || users[0]
      : users.find((item) => item.phone.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized))
    if (!user || (!normalized && searchMode !== 'qr')) {
      setSelectedUser(null)
      setSearchError('No matching user found.')
      return
    }
    setSelectedUser(user)
    setSearchError('')
    setAmount('')
    setNote('')
    setReceipt(null)
  }

  const lastRecharge = selectedUser
    ? walletTransactions.find((transaction) => transaction.userId === selectedUser.id && transaction.status === 'Completed')
    : null

  const requestConfirmation = (event) => {
    event.preventDefault()
    if (Number(amount) < 10000) {
      window.alert('Minimum recharge amount is ₫10,000.')
      return
    }
    setConfirmOpen(true)
  }

  const confirmRecharge = () => {
    const rechargeAmount = Number(amount)
    const newBalance = selectedUser.walletBalance + rechargeAmount
    const transaction = {
      id: `TXN-H-${Date.now().toString().slice(-8)}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      amount: rechargeAmount,
      newBalance,
      method: 'Cash',
      handlerId: handler.id,
      handlerName: handler.name,
      date: new Date().toISOString(),
      status: 'Successful',
      note,
    }
    setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, walletBalance: newBalance } : user))
    setSelectedUser((current) => ({ ...current, walletBalance: newBalance }))
    setLocalTransactions((current) => [transaction, ...current])
    setReceipt(transaction)
    setConfirmOpen(false)
    setAmount('')
    setNote('')
  }

  const recentHistory = useMemo(() => {
    const existing = walletTransactions
      .filter((transaction) => transaction.handlerId === handler.id)
      .map((transaction) => ({ ...transaction, newBalance: (mockUsers.find((user) => user.id === transaction.userId)?.walletBalance || 0) + transaction.amount }))
    return [...localTransactions, ...existing].slice(0, 5)
  }, [handler.id, localTransactions])

  const columns = [
    { key: 'userName', label: 'User' },
    { key: 'amount', label: 'Amount', render: (value) => money.format(value) },
    { key: 'date', label: 'Date', render: (value) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
    { key: 'newBalance', label: 'New Balance', render: (value) => money.format(value) },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Cash wallet funding</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Recharge User Wallet</h1></div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Find User</h2>
        <div className="my-5 flex gap-2"><button type="button" onClick={() => { setSearchMode('qr'); setSearchError('') }} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${searchMode === 'qr' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>Scan User QR</button><button type="button" onClick={() => { setSearchMode('lookup'); setSearchError('') }} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${searchMode === 'lookup' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>Search by Phone or Name</button></div>
        {searchMode === 'qr' ? <QRScannerPlaceholder mode="entry" onScan={findUser} /> : <div className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && findUser()} placeholder="Enter phone number or user name" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /><button type="button" onClick={() => findUser()} className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">Search</button></div>}
        {searchError && <p className="mt-3 text-sm font-semibold text-red-600">{searchError}</p>}
      </section>

      {selectedUser && (
        <>
          <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-xl font-bold text-white">{selectedUser.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><h2 className="mt-4 text-xl font-bold text-slate-900">{selectedUser.name}</h2><p className="mt-1 text-sm text-slate-500">{selectedUser.phone}</p><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last recharge</p><p className="mt-2 font-bold text-slate-900">{lastRecharge ? money.format(lastRecharge.amount) : 'No recharge yet'}</p>{lastRecharge && <p className="mt-1 text-xs text-slate-500">{new Date(lastRecharge.date).toLocaleDateString('en-GB')}</p>}</div></div>
            <WalletCard balance={selectedUser.walletBalance} threshold={50000} onRecharge={() => amountRef.current?.focus()} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Recharge Form</h2>
            <form onSubmit={requestConfirmation} className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Amount (₫)<input ref={amountRef} required type="number" min="10000" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Minimum 10,000" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
              <label className="text-sm font-semibold text-slate-700">Payment Method<input readOnly value="Cash — collected by Handler" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-700" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Handler Note (optional)<textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note..." className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
              <button type="submit" className="rounded-xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary/90 sm:col-span-2">Recharge Wallet</button>
            </form>
          </section>
        </>
      )}

      {receipt && <section className="rounded-2xl border border-green-300 bg-green-50 p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-green-700">Recharge Receipt</p><h2 className="mt-1 text-xl font-bold text-green-950">{receipt.id}</h2></div><StatusBadge status="Successful" /></div><dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><ReceiptItem label="User" value={receipt.userName} /><ReceiptItem label="Amount" value={money.format(receipt.amount)} /><ReceiptItem label="New Balance" value={money.format(receipt.newBalance)} /><ReceiptItem label="Handler Name" value={receipt.handlerName} /><ReceiptItem label="Date" value={new Date(receipt.date).toLocaleString('en-GB')} /><ReceiptItem label="Status" value="Successful" /></dl></section>}

      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Recent Handler Recharge History</h2><DataTable columns={columns} data={recentHistory} /></section>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmRecharge} title="Confirm Wallet Recharge"
        message={`User: ${selectedUser?.name || ''}. Recharge amount: ${money.format(Number(amount) || 0)}. New balance: ${money.format((selectedUser?.walletBalance || 0) + (Number(amount) || 0))}.`}
        confirmLabel="Confirm Recharge" confirmColor="green" />
    </div>
  )
}

function ReceiptItem({ label, value }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-green-700">{label}</dt><dd className="mt-1 font-bold text-green-950">{value}</dd></div>
}
