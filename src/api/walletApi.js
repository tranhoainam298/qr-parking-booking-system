import { delay, generateId, getState, setState } from './mockStore'
import { processCardPayment } from './paymentGatewayApi'

export async function getWalletByUser(userId) {
  await delay()
  const state = getState()
  const wallet = state.wallets[userId]
  if (!wallet) return { success: false, message: 'Wallet not found.' }
  return { success: true, wallet }
}

export async function rechargeWalletByCard({ userId, amount, cardInfo }) {
  await delay()
  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) return { success: false, message: 'Amount must be positive.' }

  const state = getState()
  const user = state.users.find((u) => u.id === userId)
  if (!user) return { success: false, message: 'User not found.' }

  // Call payment gateway
  const gateway = await processCardPayment({ userId, amount: numAmount, cardInfo })
  if (!gateway.success) {
    return { success: false, message: gateway.message || 'Payment gateway failed.', gatewayStatus: 'failed' }
  }

  // Update wallet
  const wallet = state.wallets[userId] || { userId, balance: 0 }
  wallet.balance += numAmount
  state.wallets[userId] = wallet
  user.walletBalance = wallet.balance

  // Create recharge transaction
  const rechargeTx = {
    id: generateId('TXN'),
    userId,
    userName: user.name,
    amount: numAmount,
    method: cardInfo?.method || 'Card',
    gatewayRef: gateway.reference,
    handlerId: null,
    date: new Date().toISOString(),
    status: 'Completed',
  }
  state.walletTransactions.unshift(rechargeTx)

  // Create payment transaction
  state.paymentTransactions.push({
    id: generateId('PTX'),
    userId,
    userName: user.name,
    amount: numAmount,
    method: 'Card',
    gatewayRef: gateway.reference,
    date: new Date().toISOString(),
    status: 'Completed',
    type: 'Recharge',
  })

  setState(state)
  return { success: true, transaction: rechargeTx, newBalance: wallet.balance, gatewayRef: gateway.reference }
}

export async function rechargeWalletByHandlerCash({ userId, handlerId, amount, note }) {
  await delay()
  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) return { success: false, message: 'Amount must be positive.' }

  const state = getState()
  const user = state.users.find((u) => u.id === userId)
  if (!user) return { success: false, message: 'User not found.' }

  const handler = state.handlers.find((h) => h.id === handlerId)

  // Update wallet
  const wallet = state.wallets[userId] || { userId, balance: 0 }
  wallet.balance += numAmount
  state.wallets[userId] = wallet
  user.walletBalance = wallet.balance

  // Create recharge transaction
  const rechargeTx = {
    id: generateId('TXN'),
    userId,
    userName: user.name,
    amount: numAmount,
    newBalance: wallet.balance,
    method: 'Cash',
    gatewayRef: `CASH-HANDLER-${Date.now()}`,
    handlerId: handlerId || null,
    handlerName: handler?.name || 'Unknown Handler',
    date: new Date().toISOString(),
    status: 'Completed',
    note: note || '',
  }
  state.walletTransactions.unshift(rechargeTx)

  // Audit log
  state.auditLogs.push({
    id: generateId('AUD'),
    action: 'HandlerCashRecharge',
    handlerId,
    userId,
    amount: numAmount,
    date: new Date().toISOString(),
  })

  setState(state)
  return { success: true, transaction: rechargeTx, newBalance: wallet.balance }
}

export async function deductWallet({ userId, amount, reference }) {
  await delay()
  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0) return { success: false, message: 'Amount must be positive.' }

  const state = getState()
  const wallet = state.wallets[userId]
  if (!wallet || wallet.balance < numAmount) {
    return { success: false, message: 'Insufficient wallet balance.' }
  }

  wallet.balance -= numAmount
  const user = state.users.find((u) => u.id === userId)
  if (user) user.walletBalance = wallet.balance

  state.paymentTransactions.push({
    id: generateId('PTX'),
    userId,
    userName: user?.name || 'Unknown',
    amount: numAmount,
    method: 'Wallet',
    gatewayRef: reference || `DEDUCT-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'Completed',
    type: 'Deduction',
  })

  setState(state)
  return { success: true, newBalance: wallet.balance }
}

export async function getRechargeHistory(userId) {
  await delay()
  const state = getState()
  const transactions = state.walletTransactions.filter((t) => t.userId === userId)
  return { success: true, transactions }
}

export async function getWalletTransactions(userId) {
  await delay()
  const state = getState()
  const all = [
    ...state.walletTransactions.filter((t) => t.userId === userId),
    ...state.paymentTransactions.filter((t) => t.userId === userId),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))
  return { success: true, transactions: all }
}
