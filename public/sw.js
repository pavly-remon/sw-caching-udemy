const version = '0.2.1';
const staticCacheName = `static-${version}`;
const dynamicCacheName = `dynamic-${version}`;
self.addEventListener('install', function (event) {
    const STATIC_FILES = ["/", "/offline.html", "/src/js/app.js", "/src/js/feed.js", "/src/js/material.min.js", "/src/css/app.css", "/src/css/feed.css", "/src/images/main-image.jpg",];
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(caches.open(staticCacheName).then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
    }));

});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== `static-${version}` && key !== `dynamic-${version}`) {
                console.log('[Service Worker] Removing old cache.', key);
                return caches.delete(key);
            }
        }));
    }));
    return self.clients.claim();
});

// self.addEventListener('fetch', function (event) {
//     console.log("[Service Worker] Fetching something ....", event);
//     event.respondWith(caches.match(event.request)
//         .then(function (response) {
//             if (response) {
//                 return response;
//             } else {
//                 return fetch(event.request)
//                     .then((res) => {
//                         return caches.open(dynamicCacheName).then((cache) => {
//                             cache.put(event.request.url, res.clone());
//                             return res;
//                         });
//                     })
//                     .catch((err) => {
//                         return caches.open(staticCacheName).then((cache) => {
//                             return cache.match('/offline.html')
//                         });
//                     });
//             }
//         }));
// });

/* Strategy: Network with Cache Fallback */
self.addEventListener('fetch', function (event) {
    console.log("[Service Worker] Fetching something ....", event);
    event.respondWith(
        fetch(event.request)
            .then((res) => {
                return caches.open(dynamicCacheName).then((cache) => {
                    cache.put(event.request.url, res.clone());
                    return res;
                });
            })
            .catch((err) => {
                return caches.match(event.request);
            })
    );
});