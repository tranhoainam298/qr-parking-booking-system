import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', closeOnEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${sizes[size] || sizes.md}`}>
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">×</button>
        </header>
        <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto p-6">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
