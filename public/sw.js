self.addEventListener('push', (event) => {
  let payload = {
    title: 'TLLCC Worship',
    body: 'You have a worship schedule reminder.',
    data: { url: '/#my-serving-dates' },
  }

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() }
    } catch {
      payload.body = event.data.text()
    }
  }

  const { title, ...options } = payload
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(
    event.notification.data?.url || '/#my-serving-dates',
    self.location.origin,
  )

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (windowClients) => {
        const appClient = windowClients.find((client) => {
          return new URL(client.url).origin === targetUrl.origin
        })

        if (appClient) {
          if ('navigate' in appClient) {
            await appClient.navigate(targetUrl.href)
          }
          return appClient.focus()
        }

        return self.clients.openWindow(targetUrl.href)
      }),
  )
})
