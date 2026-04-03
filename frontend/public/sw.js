// ━━━ Cosmic Collective Service Worker ━━━
// Push Notifications + Offline Solfeggio Oscillator Cache + App Shell

const CACHE_VERSION = 'cosmic-v3';
const SOLFEGGIO_CACHE = 'solfeggio-wavetables-v1';
const INSTRUMENT_CACHE = 'organic-instruments-v1';

// Core Solfeggio frequencies to pre-cache as wave table data
const SOLFEGGIO_FREQUENCIES = [396, 432, 528, 639, 741, 852, 963];

// Organic instrument profiles — pre-generated AudioBuffer-compatible data
const INSTRUMENT_PROFILES = {
  singing_bowl: { harmonics: [1, 2.02, 3.01, 4.98], amps: [1, 0.5, 0.3, 0.15], type: 'sine', duration: 6 },
  flute: { harmonics: [1, 2.0, 3.0], amps: [1, 0.2, 0.05], type: 'triangle', duration: 4 },
  tabla: { harmonics: [1, 1.5], amps: [1, 0.6], type: 'sine', duration: 1.2 },
  crystal_bowl: { harmonics: [1, 2.0, 3.0, 5.0], amps: [1, 0.3, 0.15, 0.08], type: 'sine', duration: 8 },
};

// App shell resources to cache for offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
];

// Generate a simple wave table for a frequency (sine wave samples)
function generateWaveTable(frequency, sampleRate = 44100, duration = 2) {
  const numSamples = sampleRate * duration;
  const table = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    table[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return table;
}

// Install: cache app shell + pre-generate Solfeggio wave tables
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_VERSION).then((cache) => {
        return cache.addAll(APP_SHELL).catch(() => {
          // Individual fallback — some assets may fail in preview
          return Promise.allSettled(APP_SHELL.map(url => cache.add(url)));
        });
      }),
      // Pre-generate Solfeggio wave table data
      caches.open(SOLFEGGIO_CACHE).then((cache) => {
        const promises = SOLFEGGIO_FREQUENCIES.map((freq) => {
          const table = generateWaveTable(freq);
          const blob = new Blob([table.buffer], { type: 'application/octet-stream' });
          const response = new Response(blob, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'X-Solfeggio-Freq': freq.toString(),
              'X-Sample-Rate': '44100',
              'X-Duration': '2',
            },
          });
          return cache.put(`/solfeggio/${freq}`, response);
        });
        return Promise.all(promises);
      }),
      // Pre-cache instrument profiles as JSON
      caches.open(INSTRUMENT_CACHE).then((cache) => {
        const profileData = JSON.stringify(INSTRUMENT_PROFILES);
        const response = new Response(profileData, {
          headers: { 'Content-Type': 'application/json' },
        });
        return cache.put('/instruments/profiles', response);
      }),
    ]).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches, claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_VERSION && n !== SOLFEGGIO_CACHE && n !== INSTRUMENT_CACHE)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first for app shell + solfeggio, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Instrument profiles — always from cache
  if (url.pathname.startsWith('/instruments/')) {
    event.respondWith(
      caches.open(INSTRUMENT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => cached || new Response('{}', { status: 200 }))
      )
    );
    return;
  }

  // Solfeggio wave tables — always from cache
  if (url.pathname.startsWith('/solfeggio/')) {
    event.respondWith(
      caches.open(SOLFEGGIO_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          // Regenerate if missing
          const freq = parseInt(url.pathname.split('/').pop());
          if (freq && SOLFEGGIO_FREQUENCIES.includes(freq)) {
            const table = generateWaveTable(freq);
            const blob = new Blob([table.buffer], { type: 'application/octet-stream' });
            const response = new Response(blob, {
              headers: { 'Content-Type': 'application/octet-stream', 'X-Solfeggio-Freq': freq.toString() },
            });
            cache.put(event.request, response.clone());
            return response;
          }
          return new Response('Not found', { status: 404 });
        })
      )
    );
    return;
  }

  // API calls — network only (don't cache dynamic data)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // App shell — cache-first, network fallback
  if (event.request.mode === 'navigate' || APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => caches.match('/'));
      })
    );
    return;
  }
});

// Push: display notification
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
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
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
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', () => {});
