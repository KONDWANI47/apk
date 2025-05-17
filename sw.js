const CACHE_NAME = 'melodify-v1';
const urlsToCache = [
    'index.html',
    'manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// Handle background sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-music') {
        event.waitUntil(syncMusic());
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: 'res/icon/android/icon-96-xhdpi.png',
        badge: 'res/icon/android/icon-96-xhdpi.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'play',
                title: 'Play',
                icon: 'res/icon/android/icon-96-xhdpi.png'
            },
            {
                action: 'pause',
                title: 'Pause',
                icon: 'res/icon/android/icon-96-xhdpi.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Melodify', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'play') {
        // Handle play action
        clients.openWindow('index.html?action=play');
    } else if (event.action === 'pause') {
        // Handle pause action
        clients.openWindow('index.html?action=pause');
    } else {
        // Default action
        clients.openWindow('index.html');
    }
}); 