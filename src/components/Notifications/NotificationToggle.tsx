import { useEffect, useState } from 'react'
import { FaBell, FaBellSlash, FaMobileAlt } from 'react-icons/fa'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushAvailability,
  PushAvailability,
} from '../../services/pushNotifications'

interface NotificationToggleProps {
  isAdmin?: boolean
}

const NotificationToggle = ({ isAdmin = false }: NotificationToggleProps) => {
  const [availability, setAvailability] =
    useState<PushAvailability>('checking')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPushAvailability()
      .then(setAvailability)
      .catch(() => {
        setAvailability('unavailable')
      })
  }, [])

  const toggleNotifications = async () => {
    setBusy(true)
    setError('')

    try {
      const next =
        availability === 'enabled'
          ? await disablePushNotifications()
          : await enablePushNotifications()
      setAvailability(next)
    } catch {
      setError('Notifications could not be updated. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (availability === 'checking') {
    return (
      <p className="text-sm font-medium text-slate-500">
        Checking notification support…
      </p>
    )
  }

  if (availability === 'install-required') {
    return (
      <div className="flex items-start gap-3 text-sm text-slate-700">
        <FaMobileAlt className="mt-0.5 shrink-0 text-amber-700" />
        <p>
          On iPhone or iPad, add TLLCC Worship to your Home Screen, open the
          installed app, then enable reminders here.
        </p>
      </div>
    )
  }

  if (availability === 'unsupported') {
    return (
      <p className="text-sm text-slate-600">
        This browser does not support web push notifications.
      </p>
    )
  }

  if (availability === 'unavailable') {
    return (
      <p className="text-sm text-slate-600">
        Notifications are temporarily unavailable. Please try again later.
      </p>
    )
  }

  if (availability === 'denied') {
    return (
      <div className="flex items-start gap-3 text-sm text-slate-700">
        <FaBellSlash className="mt-0.5 shrink-0 text-slate-500" />
        <p>
          Notifications are blocked. Allow them in your browser or device
          settings, then reload this page.
        </p>
      </div>
    )
  }

  const enabled = availability === 'enabled'

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <FaBell className="mt-0.5 shrink-0 text-amber-700" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950">Notifications</p>
            <p className="text-sm text-slate-600">
              {isAdmin
                ? enabled
                  ? 'This device will be notified when a worker creates a request.'
                  : 'Receive an alert on this device when a worker creates a request.'
                : enabled
                  ? 'This device will receive schedule, lineup, and request updates.'
                  : 'Receive schedule reminders, lineup posts, and request actions on this device.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleNotifications}
          disabled={busy}
          role="switch"
          aria-checked={enabled}
          aria-label={`${enabled ? 'Disable' : 'Enable'} notifications`}
          className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
            enabled ? 'bg-amber-600' : 'bg-slate-300'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {busy && <p className="mt-2 text-xs font-medium text-slate-500">Updating…</p>}
      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  )
}

export default NotificationToggle
