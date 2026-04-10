// Creature Cards — Service Worker
const CACHE_NAME = 'creature-cards-v17';
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
    './assets/creatures/shadow-type.png',
    './assets/sounds/sfx/click.mp3',
    './assets/sounds/sfx/correct.mp3',
    './assets/sounds/sfx/wrong.mp3',
    './assets/sounds/sfx/coin.mp3',
    './assets/sounds/sfx/purchase.mp3',
    './assets/sounds/sfx/levelup.mp3',
    './assets/sounds/sfx/achievement.mp3',
    './assets/sounds/sfx/victory.mp3',
    './assets/sounds/sfx/star.mp3',
    './assets/sounds/sfx/streak.mp3',
    './assets/sounds/sfx/transition.mp3',
    './assets/sounds/sfx/attack.mp3',
    './assets/sounds/sfx/damage.mp3',
    './assets/sounds/sfx/heal.mp3',
    './assets/sounds/sfx/card-reveal.mp3',
    './assets/sounds/sfx/pack-open.mp3',
    './assets/sounds/sfx/faint.mp3'
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
// Always fetch version.json from network (auto-update check)    if (e.request.url.includes('version.json') || e.request.url.includes('auto-update.js')) return;
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
