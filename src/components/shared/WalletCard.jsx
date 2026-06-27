export default function WalletCard({ balance = 0, threshold = 50000, maxBalance = 500000, onRecharge }) {
  const percentage = Math.min(100, Math.max(0, (balance / maxBalance) * 100))
  const formattedBalance = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(balance)

  return (
    <article className="overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-100">Wallet balance</p>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{formattedBalance}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-2xl">₫</span>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-blue-300 transition-[width]" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-blue-100"><span>{Math.round(percentage)}% funded</span><span>Max {new Intl.NumberFormat('vi-VN').format(maxBalance)} ₫</span></div>
      {balance < threshold && (
        <p className="mt-4 rounded-xl bg-orange-400/20 px-3 py-2 text-sm font-medium text-orange-200">Low balance — please recharge</p>
      )}
      <button type="button" onClick={onRecharge} className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary hover:bg-blue-50">Recharge wallet</button>
    </article>
  )
}
