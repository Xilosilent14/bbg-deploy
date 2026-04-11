const CACHE_NAME = 'think-fast-v93';
const ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/style.css',
    '/css/shared/design-system.css',
    '/css/shared/fonts/fredoka-one.woff2',
    '/css/shared/fonts/nunito-regular.woff2',
    '/css/shared/fonts/nunito-semibold.woff2',
    '/js/otb-config.js',
    '/js/ecosystem.js',
    '/js/cloud-tts.js',
    '/js/main.js',
    '/js/game-renderer.js',
    '/js/game.js',
    '/js/car-data.js',
    '/js/cars.js',
    '/js/questions.js',
    '/js/math-data.js',
    '/js/reading-data.js',
    '/js/progress.js',
    '/js/adaptive.js',
    '/js/audio.js',
    '/js/celebration.js',
    '/js/achievements.js',
    '/js/garage.js',
    '/js/parent-dashboard.js',
    '/js/settings.js',
    '/js/tutorial.js',
    '/js/story.js',
    '/assets/sounds/sfx/click.mp3',
    '/assets/sounds/sfx/correct.mp3',
    '/assets/sounds/sfx/wrong.mp3',
    '/assets/sounds/sfx/nitro.mp3',
    '/assets/sounds/sfx/star.mp3',
    '/assets/sounds/sfx/victory.mp3',
    '/assets/sounds/sfx/levelup.mp3',
    '/assets/sounds/sfx/achievement.mp3',
    '/assets/sounds/sfx/countdown.mp3',
    '/assets/sounds/sfx/countdown-go.mp3',
    '/assets/sounds/sfx/streak.mp3',
    '/assets/sounds/sfx/purchase.mp3',
    '/assets/sounds/sfx/coin.mp3',
    '/assets/sounds/sfx/lane-change.mp3',
    '/assets/sounds/sfx/transition.mp3',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-192.png',
    '/icons/icon-maskable-512.png',
    '/img/cars/c1.png',
    '/img/cars/c2.png',
    '/img/cars/c3.png',
    '/img/cars/c4.png',
    '/img/cars/c5.png',
    '/img/cars/c6.png',
    '/img/cars/c7.png',
    '/img/cars/c8.png',
    '/img/cars/beetle.png',
    '/img/cars/mustang.png',
    '/img/cars/delorean.png',
    '/img/cars/hotrod.png',
    '/img/cars/porsche911.png',
    '/img/cars/countach.png',
    '/img/cars/cybertruck.png',
    '/img/cars/bronco.png',
    '/img/cars/wrangler.png',
    '/img/cars/batmobile.png',
    '/img/cars/monstertruck.png',
    '/img/cars/schoolbus.png',
    '/img/cars/firetruck.png',
    '/img/cars/wienermobile.png',
    '/img/cars/policecar.png',
    '/img/cars/ambulance.png',
    '/img/cars/towtruck.png',
    '/img/cars/icecreamtruck.png',
    '/img/cars/gokart.png',
    '/img/cars/limo.png',
    '/img/cars/tank.png',
    '/img/cars/zamboni.png',
    '/img/cars/tractor.png',
    '/img/cars/grandam.png',
    '/img/cars/focus.png',
    '/img/cars/bronco2023.png',
    '/img/cars/ferrari.png',
    // V16: 15 new cars
    '/img/cars/dumptruck.png',
    '/img/cars/tacotruck.png',
    '/img/cars/f1car.png',
    '/img/cars/pizzacar.png',
    '/img/cars/cementmixer.png',
    '/img/cars/garbagetruck.png',
    '/img/cars/hummerh1.png',
    '/img/cars/nascar.png',
    '/img/cars/bulldozer.png',
    '/img/cars/vwbus.png',
    '/img/cars/mailtruck.png',
    '/img/cars/taxi.png',
    '/img/cars/minicooper.png',
    '/img/cars/fordf150.png',
    '/img/cars/rocketcar.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle same-origin GET requests
    if (event.request.method !== 'GET') return;
if (event.request.url.includes('version.json') || event.request.url.includes('auto-update.js')) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).catch(() => {
                // If fetch fails and it's a navigation request, show offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});
