import { useEffect, useMemo, useRef, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import WalletCard from '../../components/shared/WalletCard'
import { useAuth } from '../../context/AuthContext'
import { users, walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const quickAmounts = [50000, 100000, 200000, 500000]

export default function WalletPage() {
  const { currentUser } = useAuth()
  const user = users.find((item) => item.id === currentUser.id) || users[0]
  const [balance, setBalance] = useState(user.walletBalance)
  const [form, setForm] = useState({ amount: '', method: 'Debit Card', cardNumber: '', expiry: '', cvv: '' })
  const [gatewayStatus, setGatewayStatus] = useState('idle')
  const [paidAmount, setPaidAmount] = useState(0)
  const [localTransactions, setLocalTransactions] = useState([])
  const [selected, setSelected] = useState(null)
  const timers = useRef([])
  const amountRef = useRef(null)

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const history = useMemo(() => [
    ...localTransactions,
    ...walletTransactions.filter((transaction) => transaction.userId === user.id),
  ], [localTransactions, user.id])

  const pay = (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (amount <= 0 || form.cardNumber.replace(/\D/g, '').length < 12 || !form.expiry || form.cvv.length < 3) {
      window.alert('Complete the amount and valid card details before paying.')
      return
    }
    timers.current.forEach(window.clearTimeout)
    setPaidAmount(amount)
    setGatewayStatus('connecting')
    timers.current = [
      window.setTimeout(() => setGatewayStatus('processing'), 1500),
      window.setTimeout(() => {
        const transaction = {
          id: `TXN-C-${Date.now().toString().slice(-8)}`,
          userId: user.id,
          amount,
          method: form.method,
          gatewayRef: `GATE-CARD-${Date.now().toString().slice(-10)}`,
          date: new Date().toISOString(),
          status: 'Successful',
        }
        setBalance((current) => current + amount)
        setLocalTransactions((current) => [transaction, ...current])
        setGatewayStatus('success')
        setForm((current) => ({ ...current, amount: '', cardNumber: '', expiry: '', cvv: '' }))
      }, 3000),
    ]
  }

  const formatCard = (value) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const columns = [
    { key: 'id', label: 'Transaction ID' }, { key: 'amount', label: 'Amount', render: (amount) => money.format(amount) },
    { key: 'method', label: 'Method' }, { key: 'gatewayRef', label: 'Gateway Reference' },
    { key: 'date', label: 'Date', render: (date) => new Date(date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Balance and card payments</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Wallet & Recharge</h1></div>
      <div className="mx-auto max-w-2xl"><WalletCard balance={balance} threshold={50000} onRecharge={() => amountRef.current?.focus()} /></div>

      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Recharge via Card</h2><p className="mt-1 text-sm text-slate-500">Securely add funds to your parking wallet.</p></div><span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">Powered by Payment Gateway</span></div>
        <form onSubmit={pay} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Amount (₫)<input ref={amountRef} required type="number" min="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Enter recharge amount" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
          <div className="flex flex-wrap gap-2">{quickAmounts.map((amount) => <button key={amount} type="button" onClick={() => setForm((current) => ({ ...current, amount: String(amount) }))} className={`rounded-full border px-4 py-2 text-sm font-bold ${Number(form.amount) === amount ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-600 hover:border-primary hover:text-primary'}`}>{amount / 1000}k</button>)}</div>
          <fieldset><legend className="text-sm font-semibold text-slate-700">Payment Method</legend><div className="mt-3 flex gap-5">{['Debit Card', 'Credit Card'].map((method) => <label key={method} className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="radio" name="cardMethod" value={method} checked={form.method === method} onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))} className="accent-primary" />{method}</label>)}</div></fieldset>
          <label className="block text-sm font-semibold text-slate-700">Card Number<input required inputMode="numeric" value={form.cardNumber} onChange={(event) => setForm((current) => ({ ...current, cardNumber: formatCard(event.target.value) }))} placeholder="**** **** **** 1234" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Expiry Date<input required value={form.expiry} onChange={(event) => setForm((current) => ({ ...current, expiry: event.target.value.slice(0, 5) }))} placeholder="MM/YY" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" /></label><label className="block text-sm font-semibold text-slate-700">CVV<input required type="password" inputMode="numeric" maxLength="4" value={form.cvv} onChange={(event) => setForm((current) => ({ ...current, cvv: event.target.value.replace(/\D/g, '') }))} placeholder="***" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" /></label></div>
          <button type="submit" disabled={['connecting', 'processing'].includes(gatewayStatus)} className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60">Pay with Card</button>
        </form>
      </section>

      {gatewayStatus !== 'idle' && <GatewayPanel status={gatewayStatus} amount={paidAmount} />}

      <section><h2 className="mb-4 text-lg font-bold text-slate-900">Recharge History</h2><DataTable columns={columns} data={history} onRowClick={setSelected} /></section>
      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Recharge Details" size="sm">{selected && <div className="space-y-3"><Detail label="Transaction ID" value={selected.id} /><Detail label="Amount" value={money.format(selected.amount)} /><Detail label="Method" value={selected.method} /><Detail label="Gateway Reference" value={selected.gatewayRef} /><Detail label="Date" value={new Date(selected.date).toLocaleString('en-GB')} /><div className="pt-2"><StatusBadge status={selected.status} /></div></div>}</Modal>
    </div>
  )
}

function GatewayPanel({ status, amount }) {
  const steps = [{ id: 'connecting', label: 'Connecting to Payment Gateway...' }, { id: 'processing', label: 'Processing payment...' }]
  return <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Payment Gateway Status</h2>{status === 'success' ? <div className="mt-5 rounded-2xl bg-green-50 p-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-500 text-2xl font-bold text-white">✓</span><p className="mt-4 text-lg font-bold text-green-900">Payment Successful! {money.format(amount)} added to wallet</p></div> : <div className="mt-5 space-y-3">{steps.map((step, index) => { const active = status === step.id; const done = status === 'processing' && index === 0; return <div key={step.id} className={`flex items-center gap-3 rounded-xl p-4 ${active ? 'bg-blue-50 text-blue-900' : 'bg-slate-50 text-slate-500'}`}><span className={`grid h-8 w-8 place-items-center rounded-full ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-100' : 'bg-slate-200'}`}>{done ? '✓' : active ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /> : index + 1}</span><span className="font-semibold">{step.label}</span></div>})}</div>}</section>
}

function Detail({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-900">{value}</p></div> }
