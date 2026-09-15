import axios from 'axios'
import { FormEvent, useEffect, useState } from 'react'
import {
  FaBell,
  FaCheckCircle,
  FaIdBadge,
  FaMoon,
  FaPalette,
  FaSignOutAlt,
  FaSun,
  FaUser,
} from 'react-icons/fa'
import NotificationToggle from '../components/Notifications/NotificationToggle'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { WorkerRole } from '../models/Worker'
import { fetchMyAssignments } from '../services/schedules'
import { updateMyUsername } from '../services/users'

const Settings = () => {
  const { user, isAdmin, logout, updateCurrentUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [username, setUsername] = useState(user?.username ?? '')
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [linkedWorker, setLinkedWorker] = useState<LinkedWorker | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  useEffect(() => {
    setUsername(user?.username ?? '')
  }, [user?.username])

  useEffect(() => {
    fetchMyAssignments()
      .then((result) => {
        setLinkedWorker(result.worker)
        setProfileError(false)
      })
      .catch(() => setProfileError(true))
      .finally(() => setProfileLoading(false))
  }, [])

  const saveUsername = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUsername = username.trim()

    if (nextUsername.length < 2) {
      setError('Username must be at least 2 characters.')
      setSaved(false)
      return
    }

    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const updatedUser = await updateMyUsername(nextUsername)
      updateCurrentUser(updatedUser)
      setUsername(updatedUser.username ?? '')
      setSaved(true)
    } catch (requestError) {
      setError(getRequestError(requestError))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const darkMode = theme === 'dark'

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Account</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage how TLLCC Worship looks, keeps you updated, and identifies your account.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <FaPalette aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Theme</h2>
              <p className="text-sm text-slate-600">Choose the appearance on this device.</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="flex min-w-0 items-center gap-3">
              {darkMode ? (
                <FaMoon className="shrink-0 text-amber-500" aria-hidden="true" />
              ) : (
                <FaSun className="shrink-0 text-amber-600" aria-hidden="true" />
              )}
              <div>
                <p className="font-bold text-slate-950">{darkMode ? 'Dark mode' : 'Light mode'}</p>
                <p className="text-sm text-slate-600">Switch between light and dark.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              aria-label="Use dark mode"
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 ${
                darkMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <FaBell aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Notifications</h2>
              <p className="text-sm text-slate-600">Control alerts for this device.</p>
            </div>
          </div>
          <div className="p-5">
            <NotificationToggle isAdmin={isAdmin} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <FaUser aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-950">User settings</h2>
              <p className="text-sm text-slate-600">Update your profile or end this session.</p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <FaUser className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-slate-950">User type</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Your access level in TLLCC Worship.
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    {formatUserType(user?.role)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <FaIdBadge className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">Linked worker profile</p>
                  {profileLoading ? (
                    <p className="mt-1 text-sm text-slate-600">Checking your team profile…</p>
                  ) : profileError ? (
                    <p className="mt-1 text-sm text-red-700">Worker profile could not be loaded.</p>
                  ) : linkedWorker ? (
                    <>
                      <p className="mt-1 font-semibold text-slate-950">{linkedWorker.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {linkedWorker.roles.map((role) => (
                          <span
                            key={role}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-sm font-semibold text-slate-700">No worker linked</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Ask an admin to link your account to your worship-team profile.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 border-t border-slate-200 p-5 md:grid-cols-[1fr_auto] md:items-end">
            <form onSubmit={saveUsername} className="max-w-lg">
              <label htmlFor="settings-username" className="text-sm font-bold text-slate-700">
                Username
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="settings-username"
                  type="text"
                  minLength={2}
                  maxLength={50}
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setSaved(false)
                    setError('')
                  }}
                  className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
                <button
                  type="submit"
                  disabled={saving || username.trim() === (user?.username ?? '')}
                  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save username'}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500">Signed in as {user?.email}</p>
              {saved && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <FaCheckCircle aria-hidden="true" /> Username updated.
                </p>
              )}
              {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
            </form>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              <FaSignOutAlt aria-hidden="true" />
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

interface LinkedWorker {
  id: string
  name: string
  roles: WorkerRole[]
}

const formatUserType = (role?: string) => {
  if (role === 'super_admin') return 'Super admin'
  if (role === 'admin') return 'Admin'
  return 'Member'
}

const getRequestError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
  }

  return 'Username could not be updated. Please try again.'
}

export default Settings
