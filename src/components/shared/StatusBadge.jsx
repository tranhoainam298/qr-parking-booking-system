const statusStyles = {
  available: 'bg-available text-white', occupied: 'bg-occupied text-white', reserved: 'bg-reserved text-white',
  maintenance: 'bg-maintenance text-white', pending: 'bg-pending text-slate-900', completed: 'bg-completed text-white',
  confirmed: 'bg-completed text-white', cancelled: 'bg-maintenance text-white', failed: 'bg-occupied text-white',
  full: 'bg-occupied text-white', blocked: 'bg-occupied text-white', successful: 'bg-available text-white',
  success: 'bg-available text-white', active: 'bg-available text-white', new: 'bg-pending text-slate-900',
  submitted: 'bg-pending text-slate-900', reviewed: 'bg-completed text-white', resolved: 'bg-available text-white',
}

export default function StatusBadge({ status = '' }) {
  const style = statusStyles[String(status).toLowerCase()] || 'bg-slate-200 text-slate-700'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{status || 'Unknown'}</span>
}
