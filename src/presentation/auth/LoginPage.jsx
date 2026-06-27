import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as apiLogin } from '../../api/authApi'

const dashboardPaths = { Admin: '/admin', Handler: '/handler', User: '/user' }

function ParkingIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute left-[7%] top-[10%] grid h-28 w-28 rotate-[-8deg] place-items-center rounded-3xl bg-white/15 text-6xl shadow-2xl backdrop-blur">🚗</div>
      <div className="absolute right-[3%] top-[28%] grid h-32 w-32 rotate-[8deg] place-items-center rounded-3xl bg-orange-400 text-6xl shadow-2xl">⌗</div>
      <div className="absolute bottom-[8%] left-[28%] grid h-36 w-28 rotate-[-4deg] place-items-center rounded-[2rem] border-4 border-white/80 bg-white/10 text-6xl shadow-2xl backdrop-blur">▯</div>
      <div className="absolute left-[44%] top-[7%] h-4 w-4 rounded-full bg-orange-300" />
      <div className="absolute bottom-[19%] right-[10%] h-7 w-7 rounded-full border-4 border-white/30" />
    </div>
  )
}

export default function LoginPage() {
  const { currentRole, loginUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: currentRole || 'Admin' })
  const [errors, setErrors] = useState({})

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.password.length < 6) nextErrors.password = 'Password must contain at least 6 characters.'
    if (!form.role) nextErrors.role = 'Select a role.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const result = await apiLogin({ email: form.email, password: form.password, role: form.role })
    if (result.success) {
      loginUser(result.user, form.role)
      navigate(dashboardPaths[form.role])
    } else {
      setErrors({ email: result.message || 'Login failed.' })
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-5">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 lg:col-span-3">
        <div className="w-full max-w-lg">
          <Link to="/" className="mb-8 inline-flex items-center gap-3 text-primary">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-2xl text-white shadow-lg">🚗</span>
            <span className="text-xl font-bold sm:text-2xl">QR Parking Booking</span>
          </Link>

          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-9">
            <div className="mb-7">
              <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to manage your parking experience.</p>
            </div>
            <form onSubmit={submit} noValidate className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Email
                <input name="email" type="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@example.com"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 font-normal text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-red-500' : 'border-slate-300 focus:border-primary'}`} />
                {errors.email && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.email}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={update} placeholder="Enter your password"
                  className={`mt-2 w-full rounded-xl border px-4 py-3 font-normal text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/20 ${errors.password ? 'border-red-500' : 'border-slate-300 focus:border-primary'}`} />
                {errors.password && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.password}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Sign in as
                <select name="role" value={form.role} onChange={update}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option>Admin</option><option>Handler</option><option>User</option>
                </select>
                {errors.role && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.role}</span>}
              </label>
              <div className="flex justify-end">
                <Link to="/login?forgot=true" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link>
              </div>
              <button type="submit" className="w-full rounded-xl bg-primary px-5 py-3.5 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">Login</button>
            </form>
            {form.role === 'User' && (
              <p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Register</Link></p>
            )}
          </div>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-primary px-10 py-14 text-white lg:col-span-2 lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <ParkingIllustration />
        <div className="relative mt-8 text-center">
          <h2 className="text-3xl font-bold leading-tight">Smart parking.<br />Simple booking. Instant QR.</h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-blue-100">Find a space, reserve it, and enter with one secure QR code.</p>
        </div>
      </aside>
    </main>
  )
}
