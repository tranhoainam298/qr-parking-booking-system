import { useEffect, useMemo, useRef, useState } from 'react'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getState } from '../../api/mockStore'
import { submitFeedback as apiSubmitFeedback } from '../../api/feedbackApi'

export default function UserFeedbackPage() {
  const { currentUser } = useAuth()
  
  const _s = getState()
  const mockFeedbacks = _s.feedbacks
  const parkingSites = _s.parkingSites

  const [feedbacks, setFeedbacks] = useState(() => mockFeedbacks.filter((item) => item.userId === currentUser.id).map((item, index) => ({ ...item, status: item.status || ['Submitted', 'Reviewed', 'Resolved'][index % 3] })))
  const [form, setForm] = useState({ siteId: parkingSites[0]?.id || '', rating: 0, message: '' })
  const [toast, setToast] = useState('')
  const timer = useRef(null)
  
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const selectedSite = useMemo(() => parkingSites.find((site) => site.id === form.siteId), [form.siteId, parkingSites])
  
  const submit = async (event) => {
    event.preventDefault()
    if (!form.rating || !form.message.trim()) {
      window.alert('Choose a star rating and enter your feedback.')
      return
    }
    
    const result = await apiSubmitFeedback({
      userId: currentUser.id,
      userName: currentUser.name,
      siteId: form.siteId,
      rating: form.rating,
      message: form.message.trim()
    })

    if (result.success) {
      setFeedbacks((current) => [result.feedback, ...current])
      setForm((current) => ({ ...current, rating: 0, message: '' }))
      setToast('Feedback submitted successfully.')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setToast(''), 3000)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div><p className="text-sm font-medium text-slate-500">Share your parking experience</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Feedback & Reviews</h1></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-900">Submit Feedback</h2><form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm font-semibold text-slate-700">Parking Site<select value={form.siteId} onChange={(event) => setForm((current) => ({ ...current, siteId: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-primary">{parkingSites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label><fieldset><legend className="text-sm font-semibold text-slate-700">Star Rating</legend><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => setForm((current) => ({ ...current, rating }))} aria-label={`${rating} stars`} className={`text-3xl transition hover:scale-110 ${rating <= form.rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</button>)}</div></fieldset><label className="block text-sm font-semibold text-slate-700">Feedback<textarea required rows="5" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Tell us about your experience..." className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><button type="submit" className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">Submit Feedback</button></form></section>

      <section><h2 className="mb-4 text-lg font-bold text-slate-900">My Previous Feedback</h2><div className="space-y-4">{feedbacks.map((feedback) => <article key={feedback.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{feedback.siteName}</h3><div className="mt-2"><span className="text-yellow-400">{'★'.repeat(feedback.rating)}</span><span className="text-slate-300">{'★'.repeat(5 - feedback.rating)}</span></div></div><div className="text-right"><StatusBadge status={feedback.status} /><p className="mt-2 text-xs text-slate-500">{feedback.date}</p></div></div><p className="mt-4 leading-7 text-slate-700">{feedback.message}</p></article>)}{!feedbacks.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">You have not submitted feedback yet.</div>}</div></section>
      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-2xl">✓ {toast}</div>}
    </div>
  )
}
