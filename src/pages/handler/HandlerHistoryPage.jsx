import { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { parkingSessions, walletTransactions } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const dateTime = (value) => value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—'

export default function HandlerHistoryPage({ initialTab = 'parking' }) {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState(initialTab)
  const [parkingFilters, setParkingFilters] = useState({ startDate: '', endDate: '', search: '' })
  const [rechargeFilters, setRechargeFilters] = useState({ startDate: '', endDate: '' })
  const [detail, setDetail] = useState(null)

  useEffect(() => setTab(initialTab), [initialTab])

  const parkingData = useMemo(() => parkingSessions.filter((session) => {
    const date = session.entryTime.slice(0, 10)
    const query = parkingFilters.search.trim().toLowerCase()
    return session.handlerId === currentUser.id
      && (!query || session.userName.toLowerCase().includes(query) || session.vehiclePlate.toLowerCase().includes(query))
      && (!parkingFilters.startDate || date >= parkingFilters.startDate)
      && (!parkingFilters.endDate || date <= parkingFilters.endDate)
  }), [currentUser.id, parkingFilters])

  const rechargeData = useMemo(() => walletTransactions.filter((transaction) => {
    const date = transaction.date.slice(0, 10)
    return transaction.handlerId === currentUser.id
      && (!rechargeFilters.startDate || date >= rechargeFilters.startDate)
      && (!rechargeFilters.endDate || date <= rechargeFilters.endDate)
  }), [currentUser.id, rechargeFilters])

  const parkingColumns = [
    { key: 'id', label: 'Session ID' }, { key: 'userName', label: 'User' }, { key: 'vehiclePlate', label: 'Vehicle Plate' },
    { key: 'siteName', label: 'Site' }, { key: 'slotNumber', label: 'Slot' }, { key: 'entryTime', label: 'Entry', render: dateTime },
    { key: 'exitTime', label: 'Exit', render: dateTime }, { key: 'duration', label: 'Duration' },
    { key: 'fee', label: 'Fee', render: (fee) => fee == null ? 'Pending' : money.format(fee) },
    { key: 'paymentMethod', label: 'Payment' }, { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]
  const rechargeColumns = [
    { key: 'id', label: 'Transaction ID' }, { key: 'userName', label: 'User' },
    { key: 'amount', label: 'Amount', render: (amount) => money.format(amount) },
    { key: 'date', label: 'Date', render: dateTime }, { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
  ]

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Handler activity records</p><h1 className="mt-1 text-3xl font-bold text-slate-900">My History</h1></div>
      <div className="inline-flex rounded-xl bg-slate-200 p-1"><button type="button" onClick={() => setTab('parking')} className={`rounded-lg px-5 py-2.5 text-sm font-bold ${tab === 'parking' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'}`}>Parking History</button><button type="button" onClick={() => setTab('recharge')} className={`rounded-lg px-5 py-2.5 text-sm font-bold ${tab === 'recharge' ? 'bg-primary text-white shadow-sm' : 'text-slate-600'}`}>Recharge History</button></div>

      {tab === 'parking' ? <>
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[170px_170px_minmax(240px,1fr)_auto]"><DateInput label="Start date" value={parkingFilters.startDate} onChange={(value) => setParkingFilters((current) => ({ ...current, startDate: value }))} /><DateInput label="End date" value={parkingFilters.endDate} onChange={(value) => setParkingFilters((current) => ({ ...current, endDate: value }))} /><input value={parkingFilters.search} onChange={(event) => setParkingFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search user or vehicle plate" className="self-end rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary" /><button type="button" onClick={() => window.alert('Handler parking history export will be available soon.')} className="self-end rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Export</button></section>
        <DataTable columns={parkingColumns} data={parkingData} onRowClick={(row) => setDetail({ type: 'parking', data: row })} />
      </> : <>
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"><DateInput label="Start date" value={rechargeFilters.startDate} onChange={(value) => setRechargeFilters((current) => ({ ...current, startDate: value }))} /><DateInput label="End date" value={rechargeFilters.endDate} onChange={(value) => setRechargeFilters((current) => ({ ...current, endDate: value }))} /></section>
        <DataTable columns={rechargeColumns} data={rechargeData} onRowClick={(row) => setDetail({ type: 'recharge', data: row })} />
      </>}

      <Modal isOpen={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.type === 'parking' ? 'Parking Session' : 'Recharge Transaction'} size="sm">
        {detail && <div className="space-y-3">{detail.type === 'parking' ? <><ModalItem label="ID" value={detail.data.id} /><ModalItem label="User" value={`${detail.data.userName} · ${detail.data.vehiclePlate}`} /><ModalItem label="Location" value={`${detail.data.siteName} · ${detail.data.slotNumber}`} /><ModalItem label="Entry / Exit" value={`${dateTime(detail.data.entryTime)} / ${dateTime(detail.data.exitTime)}`} /><ModalItem label="Fee" value={detail.data.fee == null ? 'Pending' : money.format(detail.data.fee)} /></> : <><ModalItem label="Transaction ID" value={detail.data.id} /><ModalItem label="User" value={detail.data.userName} /><ModalItem label="Amount" value={money.format(detail.data.amount)} /><ModalItem label="Method" value={detail.data.method} /><ModalItem label="Date" value={dateTime(detail.data.date)} /></>}<div className="pt-2"><StatusBadge status={detail.data.status} /></div></div>}
      </Modal>
    </div>
  )
}

function DateInput({ label, value, onChange }) {
  return <label className="text-xs font-semibold text-slate-600">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
}

function ModalItem({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-900">{value}</p></div>
}
