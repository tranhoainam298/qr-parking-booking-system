import { useEffect, useState } from 'react'
import QRCodeDisplay from '../../components/shared/QRCodeDisplay'
import StatusBadge from '../../components/shared/StatusBadge'
import { useAuth } from '../../context/AuthContext'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function ProfilePage() {
  const { currentUser, currentRole, updateCurrentUser } = useAuth()
  const [profile, setProfile] = useState({ name: currentUser.name, phone: currentUser.phone })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [qrVersion, setQrVersion] = useState(0)

  useEffect(() => {
    setProfile({ name: currentUser.name, phone: currentUser.phone })
    setProfileMessage('')
  }, [currentUser.id, currentUser.name, currentUser.phone])

  const saveProfile = (event) => {
    event.preventDefault()
    if (!profile.name.trim() || profile.phone.trim().length < 8) {
      setProfileMessage('Enter a valid name and phone number.')
      return
    }
    updateCurrentUser({ name: profile.name.trim(), phone: profile.phone.trim() })
    setProfileMessage('Profile updated successfully.')
  }

  const updatePassword = (event) => {
    event.preventDefault()
    if (!passwords.current || passwords.next.length < 6 || passwords.next !== passwords.confirm) {
      setPasswordMessage('Check your current password and ensure the new passwords match.')
      return
    }
    setPasswords({ current: '', next: '', confirm: '' })
    setPasswordMessage('Password updated successfully.')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Account settings</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Profile</h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-primary text-2xl font-bold text-white ring-8 ring-primary/10">{currentUser.avatar}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{currentRole}</span>
              <StatusBadge status={currentUser.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">{currentUser.email}</p>
            <p className="mt-1 text-sm text-slate-500">{currentUser.phone}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Personal information</h2>
          <p className="mt-1 text-sm text-slate-500">Update the contact details linked to your account.</p>
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Full Name
              <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Phone Number
              <input type="tel" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} className={inputClass} />
            </label>
            {profileMessage && <p className={`text-sm font-medium ${profileMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{profileMessage}</p>}
            <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Save Changes</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">Use at least six characters for your new password.</p>
          <form onSubmit={updatePassword} className="mt-6 space-y-4">
            {[['current', 'Current Password'], ['next', 'New Password'], ['confirm', 'Confirm New Password']].map(([name, label]) => (
              <label key={name} className="block text-sm font-semibold text-slate-700">{label}
                <input type="password" value={passwords[name]} onChange={(event) => setPasswords((current) => ({ ...current, [name]: event.target.value }))} className={inputClass} />
              </label>
            ))}
            {passwordMessage && <p className={`text-sm font-medium ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage}</p>}
            <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">Update Password</button>
          </form>
        </section>
      </div>

      {currentRole === 'User' && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My QR Profile</h2>
                <p className="mt-1 text-sm text-slate-500">Show this QR to Handler for wallet recharge or onsite booking.</p>
              </div>
              <button type="button" onClick={() => setQrVersion((value) => value + 1)} className="rounded-xl border border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5">Refresh QR</button>
            </div>
            <div key={qrVersion}><QRCodeDisplay value={currentUser.id} label={currentUser.id} size={180} /></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Vehicle information</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle plate</p><p className="mt-2 text-lg font-bold text-slate-900">{currentUser.vehiclePlate}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle type</p><p className="mt-2 text-lg font-bold text-slate-900">{currentUser.vehicleType}</p></div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
