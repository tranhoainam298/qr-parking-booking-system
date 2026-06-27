import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function DetailDrawer({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, onClose])

  return createPortal(
    <div className={`fixed inset-0 z-50 transition ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <button type="button" aria-label="Close drawer" onClick={onClose} tabIndex={isOpen ? 0 : -1}
        className={`absolute inset-0 h-full w-full bg-slate-950/45 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      <aside role="dialog" aria-modal="true" aria-labelledby="drawer-title"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <h2 id="drawer-title" className="truncate text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close drawer" className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">×</button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}
