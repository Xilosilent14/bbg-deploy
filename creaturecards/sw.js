// Creature Cards — Service Worker
const CACHE_NAME = 'creature-cards-v15';
const ASSETS = [
    './', './index.html', './css/style.css',
    './css/shared/design-system.css',
    './css/shared/fonts/fredoka-one.woff2',
    './css/shared/fonts/nunito-regular.woff2',
    './css/shared/fonts/nunito-semibold.woff2',
    './js/creature-data.js', './js/battle-engine.js',
    './js/question-bridge.js', './js/collection.js',
    './js/progress.js', './js/audio.js', './js/main.js',
    './js/math-data.js', './js/reading-data.js',
    './js/ecosystem.js', './js/otb-config.js',
    './manifest.json',
    './assets/creatures/ember-type.png',
    './assets/creatures/tidal-type.png',
    './assets/creatures/terra-type.png',
    './assets/creatures/spark-type.png',
    './assets/creatures/shadow-type.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const fetchP = fetch(e.request).then(r => {
                if (r && r.status === 200) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, c)); }
                return r;
            }).catch(() => cached);
            return cached || fetchP;
        })
    );
});
