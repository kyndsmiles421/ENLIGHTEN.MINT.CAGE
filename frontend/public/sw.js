/**
 * Enlightenment Cafe Service Worker v1.2.0
 * Smart Caching for PWA Performance
 * - Network-First for API/Auth (always fresh data)
 * - Stale-While-Revalidate for UI assets (instant load + background update)
 * - Background Sync for offline form submissions
 */

const CACHE_NAME = 'enlightenment-v2.1.0-creator-console';
const OFFLINE_URL = '/offline.html';

// Core assets to pre-cache for instant loading
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// 1. INSTALL: Pre-cache the sanctuary essentials
self.addEventListener('install', (event) => {
  console.log('[SW] Energizing Sanctuary Cache v2.0.0...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.log('[SW] Cache install error:', err);
      })
  );
});

// 2. ACTIVATE: Clear out old vibrations (stale cache versions)
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new sanctuary version...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Clearing old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. FETCH: Smart Routing Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // NETWORK-FIRST: API calls, Auth, dynamic data
  // Always get fresh data, fall back to cache if offline
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/auth') ||
      url.pathname.includes('socket') ||
      event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // STALE-WHILE-REVALIDATE: UI assets, fonts, images
  // Return cached version instantly, update cache in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful GET responses
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached if available
          return cachedResponse;
        });
      
      // Return cached immediately, update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// 4. BACKGROUND SYNC: Offline form submissions (waitlist, etc.)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-waitlist') {
    event.waitUntil(processWaitlistQueue());
  }
  if (event.tag === 'sync-mood') {
    event.waitUntil(processMoodQueue());
  }
});

// Process queued waitlist submissions
async function processWaitlistQueue() {
  try {
    const queue = await getFromIndexedDB('waitlist-queue');
    for (const item of queue) {
      await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    }
    await clearIndexedDB('waitlist-queue');
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Process queued mood entries
async function processMoodQueue() {
  try {
    const queue = await getFromIndexedDB('mood-queue');
    for (const item of queue) {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': item.token
        },
        body: JSON.stringify(item.data)
      });
    }
    await clearIndexedDB('mood-queue');
  } catch (error) {
    console.log('[SW] Mood sync failed:', error);
  }
}

// IndexedDB helpers for offline queue
function getFromIndexedDB(storeName) {
  return new Promise((resolve) => {
    const request = indexedDB.open('enlightenment-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => resolve([]);
    };
    request.onerror = () => resolve([]);
  });
}

function clearIndexedDB(storeName) {
  return new Promise((resolve) => {
    const request = indexedDB.open('enlightenment-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
      resolve();
    };
    request.onerror = () => resolve();
  });
}

// 5. PUSH NOTIFICATIONS (Future: Daily affirmations)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Your daily vibration awaits',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: { url: data.url || '/' }
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Enlightenment Cafe', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('[SW] Enlightenment Cafe Service Worker v2.0.0 loaded');
