import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRScannerPlaceholder from '../../components/shared/QRScannerPlaceholder'
import StatusBadge from '../../components/shared/StatusBadge'
import { bookings, parkingSessions, parkingSites, parkingSlots, users } from '../../data/mockData'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

function ResultItem({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value}</dd></div>
}

export default function ScanQRPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'exit' ? 'exit' : 'entry'
  const preloadedSession = parkingSessions.find((session) => session.id === searchParams.get('session'))
  const preloadedBooking = preloadedSession ? bookings.find((booking) => booking.id === preloadedSession.bookingId) : null
  const preloadedUser = preloadedBooking ? users.find((user) => user.id === preloadedBooking.userId) : null
  const [mode, setMode] = useState(initialMode)
  const [localBookings, setLocalBookings] = useState(bookings)
  const [localSessions, setLocalSessions] = useState([])
  const [scanResult, setScanResult] = useState(() => preloadedBooking ? {
    ...preloadedBooking,
    walletBalance: preloadedUser?.walletBalance || 0,
    scannedCode: preloadedBooking.qrCode,
    sessionId: preloadedSession.id,
  } : null)
  const [paymentMethod, setPaymentMethod] = useState('Wallet')
  const [toast, setToast] = useState('')
  const [scannerKey, setScannerKey] = useState(0)

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setSearchParams({ mode: nextMode })
    setScanResult(null)
    setPaymentMethod('Wallet')
    setScannerKey((value) => value + 1)
  }

  const handleScan = (code) => {
    const booking = localBookings.find((item) => item.id === code || item.qrCode === code) || localBookings[0]
    const user = users.find((item) => item.id === booking.userId)
    setScanResult({ ...booking, walletBalance: user?.walletBalance || 0, scannedCode: code })
    setToast('')
  }

  const fee = useMemo(() => {
    if (!scanResult) return { duration: 0, hourlyRate: 0, total: 0, entryTime: null, exitTime: null }
    const slot = parkingSlots.find((item) => item.id === scanResult.slotId)
    const site = parkingSites.find((item) => item.id === scanResult.siteId)
    const hourlyRate = slot?.rate || site?.rate || 40000
    const duration = 2.5
    const exitTime = new Date()
    const entryTime = new Date(exitTime.getTime() - duration * 60 * 60 * 1000)
    return { duration, hourlyRate, total: Math.ceil(duration) * hourlyRate, entryTime, exitTime }
  }, [scanResult])

  const resetAfterSuccess = (message) => {
    setToast(message)
    setScanResult(null)
    setPaymentMethod('Wallet')
    setScannerKey((value) => value + 1)
    window.setTimeout(() => setToast(''), 3500)
  }

  const confirmEntry = () => {
    setLocalBookings((current) => current.map((booking) => booking.id === scanResult.id ? { ...booking, status: 'Active' } : booking))
    setLocalSessions((current) => [{ id: `SES-LOCAL-${current.length + 1}`, bookingId: scanResult.id, entryTime: new Date().toISOString(), status: 'Active' }, ...current])
    resetAfterSuccess(`Vehicle entry confirmed for ${scanResult.vehiclePlate}. Session started.`)
  }

  const confirmExit = () => {
    setLocalBookings((current) => current.map((booking) => booking.id === scanResult.id ? { ...booking, status: 'Completed' } : booking))
    setLocalSessions((current) => current.map((session) => session.bookingId === scanResult.id ? { ...session, exitTime: new Date().toISOString(), status: 'Completed', fee: fee.total } : session))
    resetAfterSuccess(paymentMethod === 'Wallet' && scanResult.walletBalance >= fee.total ? `Exit confirmed. ${money.format(fee.total)} deducted from wallet.` : `Exit confirmed. Cash payment of ${money.format(fee.total)} recorded.`)
  }

  const walletSufficient = scanResult ? scanResult.walletBalance >= fee.total : false
  const remaining = scanResult ? Math.max(0, scanResult.walletBalance - fee.total) : 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Gate operations</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Scan QR — Entry / Exit</h1></div>

      <div className="inline-flex rounded-xl bg-slate-200 p-1">
        {['entry', 'exit'].map((item) => <button key={item} type="button" onClick={() => changeMode(item)} className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${mode === item ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{item === 'entry' ? 'Entry Scan' : 'Exit Scan'}</button>)}
      </div>

      <QRScannerPlaceholder key={`${mode}-${scannerKey}`} mode={mode} onScan={handleScan} />

      {scanResult && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">Scan Result</h2><StatusBadge status={scanResult.status} /></div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultItem label="QR Ticket ID" value={scanResult.qrCode} /><ResultItem label="User Name" value={scanResult.userName} />
            <ResultItem label="Vehicle Plate" value={scanResult.vehiclePlate} /><ResultItem label="Parking Site" value={scanResult.siteName} />
            <ResultItem label="Slot Number" value={scanResult.slotNumber} /><ResultItem label="Booking Status" value={scanResult.status} />
            <ResultItem label="Wallet Balance" value={money.format(scanResult.walletBalance)} />
          </dl>
        </section>
      )}

      {scanResult && mode === 'entry' && (
        <section className="rounded-2xl border border-green-300 bg-green-50 p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-green-900">Parking Entry Confirmed</h2><p className="mt-1 text-sm text-green-700">Verify the vehicle and start its parking session.</p></div><button type="button" onClick={confirmEntry} className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700">Confirm Vehicle Entry</button></div>
        </section>
      )}

      {scanResult && mode === 'exit' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Fee Calculation</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ResultItem label="Entry Time" value={fee.entryTime.toLocaleString('en-GB')} /><ResultItem label="Exit Time" value={fee.exitTime.toLocaleString('en-GB')} /><ResultItem label="Duration" value={`${fee.duration} hours`} /><ResultItem label="Hourly Rate" value={money.format(fee.hourlyRate)} /><ResultItem label="Total Fee" value={money.format(fee.total)} /><ResultItem label="Wallet Balance" value={money.format(scanResult.walletBalance)} /><ResultItem label="Remaining After Deduction" value={money.format(remaining)} /></dl>
          <fieldset className="mt-6"><legend className="text-sm font-bold text-slate-700">Payment Method</legend><div className="mt-3 flex gap-5">{['Wallet', 'Cash'].map((method) => <label key={method} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(event) => setPaymentMethod(event.target.value)} className="h-4 w-4 accent-primary" />{method}</label>)}</div></fieldset>

          {walletSufficient && paymentMethod === 'Wallet' ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4"><p className="font-semibold text-green-800">✓ Wallet balance sufficient. Auto-deducting...</p><button type="button" onClick={confirmExit} className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700">Confirm Vehicle Exit — Deduct Wallet</button></div>
          ) : (
            <div className={`mt-6 rounded-xl border p-4 ${!walletSufficient ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}><p className={`font-semibold ${!walletSufficient ? 'text-red-800' : 'text-orange-800'}`}>{!walletSufficient ? '⚠ Insufficient wallet balance.' : 'Cash payment selected.'}</p><button type="button" onClick={confirmExit} className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">Record Cash Payment — Confirm Exit</button></div>
          )}
        </section>
      )}

      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-2xl">✓ {toast}</div>}
    </div>
  )
}
