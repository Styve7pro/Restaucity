const CACHE_NAME = "restaucity-cache-v1"
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/icons/icon-192x192.jpg", "/icons/icon-512x512.jpg"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log("[ServiceWorker] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension")) {
    return
  }

  // Skip API calls to Supabase - always fetch from network
  if (event.request.url.includes("supabase.co")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone()

        // Only cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }

        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }

          return new Response("Offline", { status: 503 })
        })
      }),
  )
})

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || "Restaucity"
  const options = {
    body: data.body || "Nouvelle notification",
    icon: "/icons/icon-192x192.jpg",
    badge: "/icons/icon-72x72.jpg",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data.url || "/"))
})
