import { delay } from './mockStore'

/**
 * Simulate a real payment gateway with deterministic failure conditions.
 * - Card number shorter than 12 digits → fail
 * - Amount <= 0 → fail
 * - Card number ending in '0000' → fail (test failure)
 * - Everything else → success after simulated processing
 */
export async function processCardPayment({ userId, amount, cardInfo }) {
  // Phase 1: connecting
  await delay(800)

  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) {
    return { success: false, message: 'Invalid payment amount.', status: 'failed' }
  }

  const rawCard = (cardInfo?.cardNumber || '').replace(/\D/g, '')
  if (rawCard.length < 12) {
    return { success: false, message: 'Invalid card number.', status: 'failed' }
  }

  // Deterministic failure for test card
  if (rawCard.endsWith('0000')) {
    return { success: false, message: 'Card declined by issuing bank.', status: 'failed' }
  }

  // Phase 2: processing
  await delay(1200)

  // Mask card number
  const maskedCard = `**** **** **** ${rawCard.slice(-4)}`

  return {
    success: true,
    status: 'success',
    reference: `GATE-${Date.now().toString().slice(-10)}`,
    maskedCard,
    amount: numAmount,
    userId,
    // Never store raw CVV
  }
}
