// HyperTrack Pro - Service Worker for PWA Functionality
// Provides offline capabilities and caching strategies

const CACHE_NAME = 'hypertrack-pro-v1.0.0';
const RUNTIME_CACHE_NAME = 'hypertrack-pro-runtime';

// Core files to cache for offline functionality
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/exercises',
  '/api/health'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Core assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE_NAME
            )
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    // Don't cache non-GET requests
    return;
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Core app files - cache first with network fallback
  if (CORE_ASSETS.some(asset => url.pathname === asset || url.pathname === asset.slice(1))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // External resources - network first
  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Default - network first with cache fallback
  event.respondWith(networkFirstStrategy(request));
});

// Cache first strategy (for app shell)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network and cache
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      console.log('[SW] Cached new resource:', request.url);
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/index.html');
      return offlinePage || new Response('Offline - Please check your connection');
    }
    
    throw error;
  }
}

// Network first strategy (for dynamic content)
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, response.clone());
      console.log('[SW] Cached runtime resource:', request.url);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // For API requests, return a proper error response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline - API unavailable',
          offline: true 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For navigation requests, return the cached app shell
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Background sync for workout data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  }
});

// Sync workout data when online
async function syncWorkoutData() {
  try {
    console.log('[SW] Syncing workout data...');
    
    // Get pending workout data from IndexedDB or localStorage
    const pendingData = await getPendingWorkoutData();
    
    if (pendingData && pendingData.length > 0) {
      for (const workout of pendingData) {
        try {
          const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
          });
          
          if (response.ok) {
            console.log('[SW] Workout synced successfully');
            await removePendingWorkoutData(workout.id);
          }
        } catch (error) {
          console.error('[SW] Failed to sync workout:', error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper function to get pending workout data
async function getPendingWorkoutData() {
  try {
    // In Phase 1, this would read from localStorage
    // In Phase 2, this would read from IndexedDB
    return [];
  } catch (error) {
    console.error('[SW] Failed to get pending data:', error);
    return [];
  }
}

// Helper function to remove synced data
async function removePendingWorkoutData(workoutId) {
  try {
    // Remove from pending sync queue
    console.log('[SW] Removed synced workout:', workoutId);
  } catch (error) {
    console.error('[SW] Failed to remove synced data:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'HyperTrack Pro notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'HyperTrack Pro',
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Log service worker lifecycle
console.log('[SW] Service worker script loaded');

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      cacheSize: getCacheSize()
    });
  }
});

// Get cache size for debugging
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch (error) {
    return 0;
  }
}