// Define cache name
const CACHE_NAME = 'offline-form-cache-v1';

// Files to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/js/index.js'
];

// Install service worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event
self.addEventListener('fetch', function(event) {
    console.log("fetch");
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// Sync event
// self.addEventListener('sync', function(event) {
self.addEventListener('message', function(event) {
    console.log("sync");
    if (event.tag === 'syncFormData') {
        event.waitUntil(syncFormData());
    }
});

// Function to sync form data
function syncFormData() {
    console.log("syncFormData");
    const savedData = JSON.parse(localStorage.getItem('offlineFormData')) || [];
    return fetch('http://localhost:8000/ks_test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedData)
    })
    .then(function(response) {
        if (response.ok) {
            console.log("response ok");
            localStorage.removeItem('offlineFormData');
        } else {
            console.log("response no ok");
        }
    })
    .catch(function(error) {
        console.error('Error syncing form data:', error);
    });
}
