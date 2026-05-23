const CACHE_NAME = 'spidey-academy-v23';

const ASSETS = [
    '/', '/index.html', '/offline.html',
    '/css/style.css', '/css/shared/design-system.css',
    '/js/error-boundary.js', '/js/analytics.js',
    '/js/otb-config.js', '/js/ecosystem.js', '/js/cloud-tts.js',
    '/js/voice.js', '/js/audio.js', '/js/audio-enhancer.js',
    '/js/progress.js', '/js/streak-ui.js',
    '/js/celebration.js', '/js/character.js',
    '/js/backgrounds.js', '/js/badges.js',
    '/js/encouragement.js', '/js/hint-cascade.js',
    '/js/sticker-book.js', '/js/mystery-egg.js', '/js/main.js',
    '/js/activities/color-catch.js', '/js/activities/shape-builder.js',
    '/js/activities/number-bugs.js', '/js/activities/letter-web.js',
    '/js/activities/sort-sweep.js',
    '/manifest.json',
    '/assets/banner.png',
    '/assets/hero.png',
    '/assets/webby.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/assets/sounds/sfx/click.mp3',
    '/assets/sounds/sfx/correct.mp3',
    '/assets/sounds/sfx/wrong.mp3',
    '/assets/sounds/sfx/pop.mp3',
    '/assets/sounds/sfx/sticker.mp3',
    '/assets/sounds/sfx/whoosh.mp3',
    '/assets/sounds/sfx/celebration.mp3',
    '/assets/sounds/sfx/tap.mp3',
    '/assets/sounds/sfx/star.mp3',
    '/assets/sounds/sfx/coin.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
            .catch(() => {
                if (event.request.mode === 'navigate') return caches.match('/offline.html');
            })
    );
});
