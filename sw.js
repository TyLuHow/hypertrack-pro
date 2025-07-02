// HyperTrack Pro Service Worker - Fixed Paths
// Enables offline functionality and app-like experience

const CACHE_NAME = 'hypertrack-pro-v2.0.0';
const STATIC_CACHE_NAME = 'hypertrack-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'hypertrack-dynamic-v2.0.0';

// Files to cache for offline functionality - Updated paths
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/tyler-data-integration.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📁 Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Fetch from network and cache dynamic content
        return fetch(request)
          .then(response => {
            // Don't cache if not a successful response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache dynamic content (but not API calls)
            if (!request.url.includes('/api/')) {
              caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => {
                  console.log('💾 Caching dynamic content:', request.url);
                  cache.put(request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.log('🔌 Network failed, checking cache for:', request.url);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return generic error for other requests
            console.error('❌ Fetch failed:', error);
            throw error;
          });
      })
  );
});

console.log('🎯 HyperTrack Pro Service Worker v2.0.0 loaded successfully');