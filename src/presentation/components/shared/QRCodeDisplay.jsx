import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodeDisplay({ value, label, size = 220 }) {
  const qrRef = useRef(null)

  const download = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${label || value || 'qr-code'}.png`.replace(/[^a-z0-9-_]/gi, '-')
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <article className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Booking ID</p>
      <h3 className="mt-1 text-lg font-bold text-primary">{label || value}</h3>
      <div ref={qrRef} className="mx-auto mt-5 inline-flex rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
        <QRCodeCanvas value={String(value || '')} size={size} level="H" marginSize={1} />
      </div>
      <p className="mx-auto mt-4 max-w-xs text-sm text-slate-500">Present this QR code to the parking handler at entry and exit.</p>
      <button type="button" onClick={download} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
        Download QR Code
      </button>
    </article>
  )
}
