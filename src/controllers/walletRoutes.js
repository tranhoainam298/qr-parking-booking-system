/**
 * Wallet Routes — Controller / Route Layer
 * Handles: Wallet balance, recharge, recharge history, payment processing
 */

// GET  /api/wallet/balance
// POST /api/wallet/recharge
// GET  /api/wallet/recharge-history
// GET  /api/wallet/transactions/:id

export const walletRoutes = {
  getBalance: '/api/wallet/balance',
  recharge: '/api/wallet/recharge',
  rechargeHistory: '/api/wallet/recharge-history',
  getTransaction: '/api/wallet/transactions/:id',
}
