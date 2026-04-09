// Rhythm Blast — Service Worker
const CACHE_NAME = 'rhythm-blast-v16';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/shared/design-system.css',
    './css/shared/fonts/fredoka-one.woff2',
    './css/shared/fonts/nunito-regular.woff2',
    './css/shared/fonts/nunito-semibold.woff2',
    './js/audio.js',
    './js/game.js',
    './js/main.js',
    './js/note-generator.js',
    './js/song-data.js',
    './js/progress.js',
    './js/math-data.js',
    './js/reading-data.js',
    './js/ecosystem.js',
    './js/otb-config.js',
    './assets/banner.png',
    './manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const fetchPromise = fetch(e.request).then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
