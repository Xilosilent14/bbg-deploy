// Word Mine — Service Worker for offline support
const CACHE_NAME = 'wordmine-v53';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/shared/design-system.css',
    './css/shared/fonts/fredoka-one.woff2',
    './css/shared/fonts/nunito-regular.woff2',
    './css/shared/fonts/nunito-semibold.woff2',
    './css/shared/fonts/press-start-2p.woff2',
    './js/otb-config.js',
    './js/ecosystem.js',
    './js/audio.js',
    './js/progress.js',
    './js/sight-words.js',
    './js/nonsense.js',
    './js/math-data.js',
    './js/reading-data.js',
    './js/sprites.js',
    './js/world.js',
    './js/achievements.js',
    './js/celebration.js',
    './js/mine-mode.js',
    './js/bridge.js',
    './js/enchant.js',
    './js/craft.js',
    './js/survival.js',
    './js/speed-round.js',
    './js/parent.js',
    './js/settings.js',
    './js/main.js',
    './manifest.json',
    './assets/spritesheet.png',
    './assets/title-logo.png',
    './assets/bg-plains.png',
    './assets/bg-bridge.png',
    './assets/bg-enchant.png',
    './assets/bg-craft.png',
    './assets/bg-cave.png',
    './assets/bg-forest.png',
    './assets/bg-desert.png',
    './assets/bg-snow.png',
    './assets/bg-nether.png',
    './assets/bg-end.png',
    './assets/sprites/player-skins.png',
    './assets/sprites/enemies-bosses.png',
    './assets/sprites/tools-items.png',
    './assets/sprites/extra-skins.png',
    './assets/sprites/pets.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-192-maskable.png',
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
    './assets/sounds/sfx/block-break.mp3',
    './assets/sounds/sfx/swing.mp3',
    './assets/sounds/sfx/gem.mp3'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
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
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
