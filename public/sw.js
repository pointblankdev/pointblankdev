// Self-destroying service worker: unregisters the old next-pwa worker
// and clears its caches for returning visitors.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', async () => {
  const keys = await caches.keys()
  await Promise.all(keys.map((key) => caches.delete(key)))
  await self.registration.unregister()
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((client) => client.navigate(client.url))
})
