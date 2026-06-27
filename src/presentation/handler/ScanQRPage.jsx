import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRScannerPlaceholder from '../../components/shared/QRScannerPlaceholder'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'
import { useAuth } from '../../context/AuthContext'
import { validateQrTicket, startParkingSession, endParkingSession, getSessionByBooking } from '../../api/sessionApi'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

function ResultItem({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value}</dd></div>
}

export default function ScanQRPage() {
  const { currentUser: handler } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'exit' ? 'exit' : 'entry'

  const state = getState()
  const preloadedSession = state.parkingSessions.find((session) => session.id === searchParams.get('session'))
  const preloadedBooking = preloadedSession ? state.bookings.find((booking) => booking.id === preloadedSession.bookingId) : null
  const preloadedUser = preloadedBooking ? state.users.find((user) => user.id === preloadedBooking.userId) : null
  const preloadedWallet = preloadedUser ? state.wallets[preloadedUser.id] : null

  const [mode, setMode] = useState(initialMode)
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState(() => preloadedBooking ? {
    ...preloadedBooking,
    walletBalance: preloadedWallet?.balance ?? preloadedUser?.walletBalance ?? 0,
    scannedCode: preloadedBooking.qrCode,
    sessionId: preloadedSession.id,
  } : null)
  const [sessionInfo, setSessionInfo] = useState(preloadedSession || null)
  const [paymentMethod, setPaymentMethod] = useState('Wallet')
  const [toast, setToast] = useState('')
  const [scannerKey, setScannerKey] = useState(0)

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setSearchParams({ mode: nextMode })
    setScanResult(null)
    setSessionInfo(null)
    setError('')
    setPaymentMethod('Wallet')
    setScannerKey((value) => value + 1)
  }

  const handleScan = async (code) => {
    setError('')
    const result = await validateQrTicket(code)
    if (result.success) {
      setScanResult({
        ...result.booking,
        walletBalance: result.wallet?.balance ?? result.user?.walletBalance ?? 0,
        scannedCode: code,
      })
      if (mode === 'exit') {
        const sessionRes = await getSessionByBooking(result.booking.id)
        if (sessionRes.success) {
          setSessionInfo(sessionRes.session)
        } else {
          setError('No active session found for this booking.')
        }
      }
      setToast('')
    } else {
      setScanResult(null)
      setSessionInfo(null)
      setError(result.message || 'Invalid QR code.')
    }
  }

  const fee = useMemo(() => {
    if (!scanResult) return { duration: 0, hourlyRate: 0, total: 0, entryTime: null, exitTime: null }
    // Get live slot/site rate
    const liveState = getState()
    const slot = liveState.parkingSlots.find((item) => item.id === scanResult.slotId)
    const site = liveState.parkingSites.find((item) => item.id === scanResult.siteId)
    const hourlyRate = slot?.rate || site?.rate || 40000

    const exitTime = new Date()
    const entryTime = sessionInfo?.entryTime ? new Date(sessionInfo.entryTime) : new Date(exitTime.getTime() - 2.5 * 60 * 60 * 1000)
    const durationMs = exitTime - entryTime
    const duration = Math.max(0.5, durationMs / (1000 * 60 * 60))
    return {
      duration: duration.toFixed(1),
      hourlyRate,
      total: Math.ceil(duration) * hourlyRate,
      entryTime,
      exitTime,
    }
  }, [scanResult, sessionInfo])

  const resetAfterSuccess = (message) => {
    setToast(message)
    setScanResult(null)
    setSessionInfo(null)
    setError('')
    setPaymentMethod('Wallet')
    setScannerKey((value) => value + 1)
    window.setTimeout(() => setToast(''), 3500)
  }

  const confirmEntry = async () => {
    setError('')
    const result = await startParkingSession({
      qrValue: scanResult.scannedCode,
      handlerId: handler.id,
    })
    if (result.success) {
      resetAfterSuccess(`Vehicle entry confirmed for ${scanResult.vehiclePlate}. Session started.`)
    } else {
      setError(result.message || 'Failed to start entry session.')
    }
  }

  const confirmExit = async () => {
    setError('')
    let targetSessionId = sessionInfo?.id
    if (!targetSessionId) {
      const sessionRes = await getSessionByBooking(scanResult.id)
      if (sessionRes.success) {
        targetSessionId = sessionRes.session.id
      }
    }
    if (!targetSessionId) {
      setError('Active session ID not found.')
      return
    }

    const result = await endParkingSession({
      sessionId: targetSessionId,
      paymentMethod,
    })

    if (result.success) {
      resetAfterSuccess(
        paymentMethod === 'Wallet'
          ? `Exit confirmed. ${money.format(result.fee)} deducted from wallet.`
          : `Exit confirmed. Cash payment of ${money.format(result.fee)} recorded.`
      )
    } else {
      setError(result.message || 'Exit checkout failed.')
    }
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

      {error && (
        <div className="rounded-xl bg-red-100 p-4 font-semibold text-red-700">{error}</div>
      )}

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
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><ResultItem label="Entry Time" value={fee.entryTime ? fee.entryTime.toLocaleString('en-GB') : '—'} /><ResultItem label="Exit Time" value={fee.exitTime ? fee.exitTime.toLocaleString('en-GB') : '—'} /><ResultItem label="Duration" value={`${fee.duration} hours`} /><ResultItem label="Hourly Rate" value={money.format(fee.hourlyRate)} /><ResultItem label="Total Fee" value={money.format(fee.total)} /><ResultItem label="Wallet Balance" value={money.format(scanResult.walletBalance)} /><ResultItem label="Remaining After Deduction" value={money.format(remaining)} /></dl>
          <fieldset className="mt-6"><legend className="text-sm font-bold text-slate-700">Payment Method</legend><div className="mt-3 flex gap-5">{['Wallet', 'Cash'].map((method) => <label key={method} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(event) => setPaymentMethod(event.target.value)} className="h-4 w-4 accent-primary" />{method}</label>)}</div></fieldset>

          {walletSufficient && paymentMethod === 'Wallet' ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4"><p className="font-semibold text-green-800">✓ Wallet balance sufficient. Auto-deducting...</p><button type="button" onClick={confirmExit} className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700">Confirm Vehicle Exit — Deduct Wallet</button></div>
          ) : (
            <div className={`mt-6 rounded-xl border p-4 ${!walletSufficient && paymentMethod === 'Wallet' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}><p className={`font-semibold ${!walletSufficient && paymentMethod === 'Wallet' ? 'text-red-800' : 'text-orange-800'}`}>{!walletSufficient && paymentMethod === 'Wallet' ? '⚠ Insufficient wallet balance.' : 'Cash payment selected.'}</p><button type="button" onClick={confirmExit} className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">Record Cash Payment — Confirm Exit</button></div>
          )}
        </section>
      )}

      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-2xl">✓ {toast}</div>}
    </div>
  )
}
