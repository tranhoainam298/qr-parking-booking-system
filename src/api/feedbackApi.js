import { delay, generateId, getState, setState } from './mockStore'

export async function submitFeedback(payload) {
  await delay()
  const { userId, userName, siteId, rating, message } = payload
  if (!userId || !message?.trim() || !rating) {
    return { success: false, message: 'User, rating, and message are required.' }
  }

  const state = getState()
  const site = state.parkingSites.find((s) => s.id === siteId)

  const feedback = {
    id: generateId('FDB'),
    userId,
    userName: userName || state.users.find((u) => u.id === userId)?.name || 'Unknown',
    siteName: site?.name || 'Unknown Site',
    rating: Number(rating),
    message: message.trim(),
    date: new Date().toISOString().slice(0, 10),
    status: 'Submitted',
    adminResponse: '',
  }

  state.feedbacks.unshift(feedback)
  setState(state)
  return { success: true, feedback }
}

export async function getFeedbacks(filters = {}) {
  await delay()
  const state = getState()
  let list = [...state.feedbacks]
  if (filters.userId) list = list.filter((f) => f.userId === filters.userId)
  if (filters.status && filters.status !== 'All') list = list.filter((f) => f.status === filters.status)
  return { success: true, feedbacks: list }
}

export async function respondToFeedback(feedbackId, responseText) {
  await delay()
  const state = getState()
  const feedback = state.feedbacks.find((f) => f.id === feedbackId)
  if (!feedback) return { success: false, message: 'Feedback not found.' }
  if (!responseText?.trim()) return { success: false, message: 'Response text is required.' }

  feedback.adminResponse = responseText.trim()
  if (feedback.status === 'Submitted') feedback.status = 'Reviewed'
  setState(state)
  return { success: true, feedback }
}

export async function markFeedbackResolved(feedbackId) {
  await delay()
  const state = getState()
  const feedback = state.feedbacks.find((f) => f.id === feedbackId)
  if (!feedback) return { success: false, message: 'Feedback not found.' }
  feedback.status = 'Resolved'
  setState(state)
  return { success: true, feedback }
}
