// Cosmic Collective Service Worker — Push Notifications + Cache Management

// Install: activate immediately
self.addEventListener('install', () => self.skipWaiting());

// Activate: clear old caches, claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Push: display notification from server payload
self.addEventListener('push', (event) => {
  let data = {
    title: 'Cosmic Collective',
    body: 'Your quantum field is calling.',
    url: '/',
    tag: 'cosmic',
    icon: '/logo192.png',
    badge: '/logo192.png',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    // If payload isn't JSON, use the text as body
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/logo192.png',
    tag: data.tag || 'cosmic',
    data: { url: data.url || '/' },
    vibrate: [120, 60, 120, 60, 200],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Later' },
    ],
    requireInteraction: false,
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click: open the app to the specified URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if available
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(targetUrl);
      })
  );
});

// Notification close: track dismissals (optional analytics)
self.addEventListener('notificationclose', (event) => {
  // Could send analytics here
});
