import { useState } from 'react'
import './shared.css'

export default function QRScannerPlaceholder({ onScan, mode = 'entry' }) {
  const [scanning, setScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const validate = () => onScan?.(manualCode.trim() || `BKG-MOCK-${mode.toUpperCase()}-001`)

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-900">QR {mode === 'exit' ? 'Exit' : 'Entry'} Scanner</p><p className="text-xs text-slate-500">Position the QR code inside the frame</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${scanning ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{scanning ? 'Scanning' : 'Stopped'}</span></div>
      <div className="relative aspect-[16/7] min-h-72 overflow-hidden rounded-2xl border-2 border-dashed border-slate-500 bg-slate-900">
        <div className="absolute inset-8 border border-white/40"><span className="absolute -left-0.5 -top-0.5 h-8 w-8 border-l-4 border-t-4 border-orange-400" /><span className="absolute -right-0.5 -top-0.5 h-8 w-8 border-r-4 border-t-4 border-orange-400" /><span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 border-b-4 border-l-4 border-orange-400" /><span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 border-b-4 border-r-4 border-orange-400" />{scanning && <span className="qr-scan-line absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_12px_2px_rgba(74,222,128,0.8)]" />}</div>
        <div className="absolute inset-0 grid place-items-center text-center text-white/60"><span className="text-5xl">⌗</span></div>
      </div>
      <label className="mt-5 block text-sm font-medium text-slate-700">Enter QR code manually<input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="e.g. BKG-0001" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => setScanning(true)} disabled={scanning} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40">Start Scanner</button><button type="button" onClick={() => setScanning(false)} disabled={!scanning} className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40">Stop Scanner</button><button type="button" onClick={validate} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">Validate QR</button></div>
    </section>
  )
}
