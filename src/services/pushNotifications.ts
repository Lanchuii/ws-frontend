import { api } from './api'

export type PushAvailability =
  | 'checking'
  | 'available'
  | 'enabled'
  | 'denied'
  | 'install-required'
  | 'unavailable'
  | 'unsupported'

interface PublicKeyResponse {
  publicKey: string
}

const isStandalone = () => {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

const isIos = () => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export const getPushAvailability = async (): Promise<PushAvailability> => {
  if (isIos() && !isStandalone()) {
    return 'install-required'
  }

  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    return 'unsupported'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await api.post('/push-notifications/subscriptions', subscription.toJSON())
    return 'enabled'
  }

  return 'available'
}

export const enablePushNotifications = async () => {
  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return permission === 'denied' ? 'denied' : 'available'
  }

  const registration = await navigator.serviceWorker.ready
  const current = await registration.pushManager.getSubscription()
  const response = await api.get<{ data: PublicKeyResponse }>(
    '/push-notifications/public-key',
  )
  const subscription =
    current ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(response.data.data.publicKey),
    }))

  try {
    await api.post('/push-notifications/subscriptions', subscription.toJSON())
  } catch (error) {
    if (!current) {
      await subscription.unsubscribe()
    }
    throw error
  }

  return 'enabled' as const
}

export const disablePushNotifications = async () => {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    return 'available' as const
  }

  await api.delete('/push-notifications/subscriptions', {
    data: { endpoint: subscription.endpoint },
  })
  await subscription.unsubscribe()
  return 'available' as const
}

const urlBase64ToUint8Array = (value: string) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)))
}
