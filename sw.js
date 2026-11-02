/**
 * Arc Tracker - High-Durability Offline Service Worker
 * Protocol: v2026 // Airgapped Offline PWA Engine
 * Ensures 100% functionality in Google Chrome when offline or disconnected.
 */

const CACHE_NAME = 'arc-tracker-cache-v2026.5';

// Core static assets required to render and operate the application offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './terms-and-conditions.html',
  './privacy-policy.html',
  './assets/tailwind.js',
  './assets/fontawesome/css/all.min.css',
  './assets/fonts/inter.css',
  './assets/fontawesome/webfonts/fa-solid-900.woff2',
  './assets/fontawesome/webfonts/fa-brands-400.woff2',
  './assets/fontawesome/webfonts/fa-regular-400.woff2',
  './assets/fontawesome/webfonts/fa-v4compatibility.woff2',
  './assets/fontawesome/webfonts/fa-solid-900.ttf',
  './assets/fontawesome/webfonts/fa-brands-400.ttf',
  './assets/fontawesome/webfonts/fa-regular-400.ttf',
  './assets/fontawesome/webfonts/fa-v4compatibility.ttf',
  './assets/fonts/files/inter-1.woff2',
  './assets/fonts/files/inter-2.woff2',
  './assets/fonts/files/inter-3.woff2',
  './assets/fonts/files/inter-4.woff2',
  './assets/fonts/files/inter-5.woff2',
  './assets/fonts/files/inter-6.woff2',
  './assets/fonts/files/inter-7.woff2',
  './assets/phone-homescreen-bg.jpg',
  './assets/wallpapers/ego-4k.jpg',
  './assets/wallpapers/ego-mobile.jpg',
  './assets/wallpapers/winner-4k.jpg',
  './assets/wallpapers/winner-mobile.jpg',
  './assets/wallpapers/gym-iron-4k.jpg',
  './assets/wallpapers/gym-iron-mobile.jpg',
  './assets/wallpapers/sports-apex-4k.jpg',
  './assets/wallpapers/sports-apex-mobile.jpg',
  './assets/wallpapers/studies-scholar-4k.jpg',
  './assets/wallpapers/studies-scholar-mobile.jpg',
  './assets/favicons/chess.ico',
  './assets/favicons/chrome-webstore.png',
  './assets/favicons/gemini.png',
  './assets/favicons/google.ico',
  './assets/favicons/pw.ico',
  './assets/favicons/youtube.ico',
  './icons/192x192.png',
  './icons/128x128.png',
  './icons/128x128@2x.png',
  './icons/32x32.png',
  './icons/app-store-1024.png',
  './icons/apple-touch-icon.png',
  './icons/icon.png',
  './src/main.js',
  './src/storage.js',
  './src/hardware.js',
  './src/screentime.js',
  './src/apptracker.js',
  './src/notifications.js',
  './src/faq.js',
  './src/terms.js'
];

// Install Event: Pre-cache static assets with resilient fallbacks
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Arc SW] Pre-caching static assets for offline Chrome support...');
      // Use individual caching so one missing optional asset does not abort the install
      const cachePromises = STATIC_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response && response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          // Precache non-blocking error
          // console.warn('[Arc SW] Precache skipped for:', url);
        }
      });
      await Promise.all(cachePromises);
      console.log('[Arc SW] Offline core assets cached successfully.');
    })
  );
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Arc SW] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intercept network requests for instant offline execution
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. External Google Sign-In script offline handler (prevent console error when offline)
  if (url.hostname === 'accounts.google.com' && url.pathname.includes('/gsi/client')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response('/* Google Identity Services offline mock */', {
          status: 200,
          headers: { 'Content-Type': 'application/javascript' }
        });
      })
    );
    return;
  }

  // Ignore other external third-party requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Navigation Requests (User navigating to page or refreshing in Chrome)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Network-first with short timeout to catch online updates fast
          const networkPromise = fetch(request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 2500)
          );
          const networkResponse = await Promise.race([networkPromise, timeoutPromise]);

          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (_) {
          // Network failed or offline: serve cached index.html immediately!
        }

        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        // Fallback to cached root or index.html
        const fallback = await caches.match('./index.html') || await caches.match('./') || await caches.match('/index.html');
        if (fallback) return fallback;

        return new Response('<h1>Arc Tracker is offline. Please reconnect once to reload assets.</h1>', {
          headers: { 'Content-Type': 'text/html' }
        });
      })()
    );
    return;
  }

  // 3. Static Assets: Stale-While-Revalidate caching strategy
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => null);

      // Return cached version immediately if available, while network updates in background
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, wait for network
      const networkResponse = await fetchPromise;
      if (networkResponse) return networkResponse;

      // Check without query string parameters
      const cleanUrl = url.pathname;
      const fallbackClean = await caches.match(cleanUrl);
      if (fallbackClean) return fallbackClean;

      return new Response('', { status: 404, statusText: 'Offline Resource Not Found' });
    })()
  );
});

// Message Listener for client communication
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
