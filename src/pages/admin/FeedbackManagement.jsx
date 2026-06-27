import { useMemo, useState } from 'react'
import DataTable from '../../components/shared/DataTable'
import KpiCard from '../../components/shared/KpiCard'
import Modal from '../../components/shared/Modal'
import StatusBadge from '../../components/shared/StatusBadge'
import { getState } from '../../api/mockStore'
import { respondToFeedback as apiRespondToFeedback, markFeedbackResolved as apiMarkFeedbackResolved } from '../../api/feedbackApi'

function Stars({ rating }) {
  return <span aria-label={`${rating} out of 5 stars`} className="whitespace-nowrap text-base tracking-tight"><span className="text-yellow-400">{'★'.repeat(rating)}</span><span className="text-slate-300">{'★'.repeat(5 - rating)}</span></span>
}

export default function FeedbackManagement() {
  const state = getState()
  const users = state.users

  const [feedbacks, setFeedbacks] = useState(() => state.feedbacks.map((feedback, index) => ({
    ...feedback,
    status: feedback.status || (index < 2 ? 'New' : 'Resolved'),
    adminResponse: feedback.adminResponse || '',
  })))
  const [selected, setSelected] = useState(null)
  const [response, setResponse] = useState('')

  const counts = useMemo(() => ({
    total: feedbacks.length,
    new: feedbacks.filter((feedback) => feedback.status === 'New' || feedback.status === 'Submitted').length,
    resolved: feedbacks.filter((feedback) => feedback.status === 'Resolved').length,
  }), [feedbacks])

  const openDetail = (feedback) => {
    setSelected(feedback)
    setResponse(feedback.adminResponse || '')
  }

  const markResolved = async () => {
    const result = await apiMarkFeedbackResolved(selected.id)
    if (result.success) {
      const updated = { ...selected, status: 'Resolved' }
      setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? updated : feedback))
      setSelected(updated)
    }
  }

  const sendResponse = async () => {
    if (!response.trim()) {
      window.alert('Enter an admin response before sending.')
      return
    }
    const result = await apiRespondToFeedback(selected.id, response.trim())
    if (result.success) {
      const updated = { ...selected, adminResponse: response.trim(), status: 'Reviewed' }
      setFeedbacks((current) => current.map((feedback) => feedback.id === selected.id ? updated : feedback))
      setSelected(updated)
      window.alert('Response sent successfully.')
    }
  }

  const columns = [
    { key: 'id', label: 'Feedback ID' }, { key: 'userName', label: 'User' },
    { key: 'siteName', label: 'Parking Site' },
    { key: 'rating', label: 'Rating', render: (rating) => <Stars rating={rating} /> },
    { key: 'message', label: 'Message', render: (message) => <span className="block max-w-64 truncate" title={message}>{message}</span> },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'actions', label: 'Actions', render: (_, feedback) => <button type="button" onClick={() => openDetail(feedback)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20">View</button> },
  ]

  const contact = selected ? users.find((user) => user.id === selected.userId) : null
  const kpis = [
    { title: 'Total Feedback', value: counts.total, icon: '✦', color: 'primary' },
    { title: 'New', value: counts.new, icon: '●', color: 'yellow' },
    { title: 'Resolved', value: counts.resolved, icon: '✓', color: 'green' },
  ]

  return (
    <div className="w-full space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Customer experience</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Feedback Management</h1></div>
      <section className="grid gap-4 sm:grid-cols-3">{kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}</section>
      <DataTable columns={columns} data={feedbacks} />

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Feedback Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{selected.id}</p><h3 className="mt-1 text-xl font-bold text-slate-900">{selected.userName}</h3><div className="mt-2"><Stars rating={selected.rating} /></div></div>
              <StatusBadge status={selected.status} />
            </div>
            <section className="rounded-2xl bg-slate-50 p-5"><h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full message</h4><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-800">{selected.message}</p></section>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info label="Email" value={contact?.email || 'Not available'} /><Info label="Phone" value={contact?.phone || 'Not available'} />
              <Info label="Parking site" value={selected.siteName} /><Info label="Submitted" value={selected.date} />
            </dl>
            <label className="block text-sm font-semibold text-slate-700">Admin response
              <textarea rows="5" value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Write a response to the user..." className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={markResolved} disabled={selected.status === 'Resolved'} className="rounded-xl border border-green-600 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40">Mark as Resolved</button>
              <button type="button" onClick={sendResponse} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Send Response</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Info({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words font-semibold text-slate-900">{value}</dd></div>
}
