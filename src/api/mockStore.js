/**
 * mockStore.js — Centralized in-memory + localStorage mock store.
 *
 * Every API module reads/writes through this store so that
 * bookings, slots, wallets, sessions, and history stay consistent
 * across all pages during a browser session.
 */

import {
  bookings as seedBookings,
  feedbacks as seedFeedbacks,
  handlers as seedHandlers,
  parkingSessions as seedSessions,
  parkingSites as seedSites,
  parkingSlots as seedSlots,
  users as seedUsers,
  walletTransactions as seedWalletTransactions,
} from '../data/mockData'

const STORAGE_KEY = 'qr-parking-store'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/** Generate a prefixed unique ID, e.g. generateId('BKG') → 'BKG-00001234' */
export function generateId(prefix = 'ID') {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${String(random).padStart(8, '0')}`
}

// ---------------------------------------------------------------------------
// Seed data preparation
// ---------------------------------------------------------------------------

function buildInitialState() {
  // Normalise booking statuses — seed uses 'Confirmed', API uses 'Reserved'
  const bookings = seedBookings.map((b) => ({
    ...b,
    status: b.status === 'Confirmed' ? 'Reserved' : b.status,
  }))

  // Create wallet records keyed by userId
  const wallets = {}
  for (const u of seedUsers) {
    wallets[u.id] = { userId: u.id, balance: u.walletBalance }
  }

  // Create QR tickets for existing bookings
  const qrTickets = bookings.map((b) => ({
    id: generateId('QRT'),
    bookingId: b.id,
    userId: b.userId,
    qrValue: b.qrCode || b.id,
    qrType: 'ParkingTicket',
    status: b.status === 'Cancelled' ? 'Revoked' : 'Active',
    createdAt: b.date ? `${b.date}T00:00:00+07:00` : new Date().toISOString(),
  }))

  // User-profile QR tickets (used by handler recharge / onsite booking)
  for (const u of seedUsers) {
    qrTickets.push({
      id: generateId('QRP'),
      bookingId: null,
      userId: u.id,
      qrValue: u.id,
      qrType: 'UserProfile',
      status: 'Active',
      createdAt: new Date().toISOString(),
    })
  }

  // Give each slot a slotNumber if it doesn't have one already
  const parkingSlots = seedSlots.map((s, i) => ({
    ...s,
    slotNumber: s.slotNumber || `${String.fromCharCode(65 + (i % 4))}-${String(i + 1).padStart(2, '0')}`,
  }))

  // Normalise sessions — attach more detail for lookups
  const parkingSessions = seedSessions.map((s) => ({ ...s }))

  // Feedback — normalise statuses
  const feedbacks = seedFeedbacks.map((f, i) => ({
    ...f,
    status: ['Submitted', 'Reviewed', 'Resolved'][i % 3],
    adminResponse: '',
  }))

  return {
    users: deepClone(seedUsers),
    handlers: deepClone(seedHandlers),
    parkingSites: deepClone(seedSites),
    parkingSlots: deepClone(parkingSlots),
    bookings: deepClone(bookings),
    parkingSessions: deepClone(parkingSessions),
    wallets,
    walletTransactions: deepClone(seedWalletTransactions),
    rechargeTransactions: [],
    paymentTransactions: [],
    parkingHistories: [],
    qrTickets: deepClone(qrTickets),
    feedbacks: deepClone(feedbacks),
    auditLogs: [],
    notifications: [],
  }
}

// ---------------------------------------------------------------------------
// Store singleton
// ---------------------------------------------------------------------------

let _state = null

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupt or unavailable — fall through
  }
  return null
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — state still lives in memory
  }
}

function ensureState() {
  if (!_state) {
    _state = loadFromStorage() || buildInitialState()
  }
  return _state
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getState() {
  return ensureState()
}

export function setState(nextState) {
  _state = nextState
  persist(_state)
}

export function resetState() {
  _state = buildInitialState()
  persist(_state)
  return _state
}

/**
 * Atomically update a top-level collection via an updater function.
 * @param {string} collectionName  e.g. 'bookings', 'users'
 * @param {(items: any[]) => any[]} updater
 */
export function updateCollection(collectionName, updater) {
  const state = ensureState()
  state[collectionName] = updater(state[collectionName])
  persist(state)
}

/** Find a single document by id in a collection array. */
export function findById(collectionName, id) {
  const state = ensureState()
  const collection = state[collectionName]
  if (!Array.isArray(collection)) return null
  return collection.find((item) => item.id === id) || null
}

/** Simulates async network delay (50-200 ms). */
export function delay(ms) {
  const wait = ms ?? 80 + Math.random() * 120
  return new Promise((resolve) => setTimeout(resolve, wait))
}
