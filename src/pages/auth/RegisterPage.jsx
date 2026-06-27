import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/shared/ConfirmModal'
import { useAuth } from '../../context/AuthContext'

const initialForm = { fullName: '', email: '', phone: '', vehiclePlate: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [successOpen, setSuccessOpen] = useState(false)
  const { setRole } = useAuth()
  const navigate = useNavigate()

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (form.phone.trim().length < 8) nextErrors.phone = 'Enter a valid phone number.'
    if (!form.vehiclePlate.trim()) nextErrors.vehiclePlate = 'Vehicle plate is required.'
    if (form.password.length < 6) nextErrors.password = 'Use at least 6 characters.'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) setSuccessOpen(true)
  }

  const finishRegistration = () => {
    setSuccessOpen(false)
    setRole('User')
    navigate('/user/profile')
  }

  const fields = [
    ['fullName', 'Full Name', 'text', 'Taylor Smith'], ['email', 'Email', 'email', 'taylor@example.com'],
    ['phone', 'Phone Number', 'tel', '+66 81 234 5678'], ['vehiclePlate', 'Vehicle Plate Number', 'text', '1กข-1001'],
    ['password', 'Password', 'password', 'Create a password'], ['confirmPassword', 'Confirm Password', 'password', 'Repeat your password'],
  ]

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">← Back to login</Link>
        <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl text-white">🚗</span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Register once and start booking parking instantly.</p>
          </div>
          <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
            {fields.map(([name, label, type, placeholder]) => (
              <label key={name} className="block text-sm font-semibold text-slate-700">
                {label}
                <input name={name} type={type} value={form[name]} onChange={update} placeholder={placeholder}
                  autoComplete={name === 'confirmPassword' ? 'new-password' : undefined}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 font-normal text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 ${errors[name] ? 'border-red-500' : 'border-slate-300 focus:border-primary'}`} />
                {errors[name] && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors[name]}</span>}
              </label>
            ))}
            <button type="submit" className="mt-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 sm:col-span-2">Register</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-primary hover:underline">Login</Link></p>
        </section>
      </div>
      <ConfirmModal isOpen={successOpen} onClose={finishRegistration} onConfirm={finishRegistration} title="Registration successful" message="Your account is ready. Continue to complete your user profile." confirmLabel="Go to profile" confirmColor="green" />
    </main>
  )
}
