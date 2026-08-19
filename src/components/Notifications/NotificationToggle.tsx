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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FaBell className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-bold text-slate-950">Notifications</p>
            <p className="text-sm text-slate-600">
              {isAdmin
                ? enabled
                  ? 'This device will be notified when a worker creates a request.'
                  : 'Receive an alert on this device when a worker creates a request.'
                : enabled
                  ? 'This device will receive Monday schedule reminders and request approval or denial updates.'
                  : 'Receive Monday schedule reminders and request approval or denial updates on this device.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleNotifications}
          disabled={busy}
          className={`shrink-0 rounded-md px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
            enabled
              ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              : 'bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          {busy
            ? 'Updating…'
            : enabled
              ? 'Disable notifications'
              : 'Enable notifications'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  )
}

export default NotificationToggle
