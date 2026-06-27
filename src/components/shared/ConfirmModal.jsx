import Modal from './Modal'

const confirmColors = {
  primary: 'bg-primary hover:bg-primary/90',
  red: 'bg-red-600 hover:bg-red-700',
  green: 'bg-green-600 hover:bg-green-700',
  orange: 'bg-orange-500 hover:bg-orange-600',
  blue: 'bg-blue-600 hover:bg-blue-700',
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
}) {
  const colorClass = confirmColors[confirmColor] || confirmColors.primary

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={onConfirm} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${colorClass}`}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
