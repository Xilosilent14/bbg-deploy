/**
 * Backgrounds — SVG background scenes for each screen
 * Subtle, low-opacity backgrounds that don't distract from gameplay.
 */
const Backgrounds = (() => {

    function createStars(count, w, h) {
        let stars = '';
        for (let i = 0; i < count; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = 0.5 + Math.random() * 1.5;
            const o = 0.3 + Math.random() * 0.5;
            const delay = Math.random() * 4;
            stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${o}"><animate attributeName="opacity" values="${o};${o * 0.3};${o}" dur="${2 + Math.random() * 3}s" begin="${delay}s" repeatCount="indefinite"/></circle>`;
        }
        return stars;
    }

    // Home: City skyline with webs and stars
    function home() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            ${createStars(40, 1024, 300)}
            <!-- Moon -->
            <circle cx="880" cy="80" r="35" fill="#FFE4B5" opacity="0.15"/>
            <circle cx="870" cy="75" r="30" fill="#1a1a2e"/>
            <!-- Buildings silhouette -->
            <g opacity="0.08" fill="white">
                <rect x="50" y="440" width="80" height="160"/>
                <rect x="140" y="470" width="60" height="130"/>
                <rect x="210" y="420" width="90" height="180"/>
                <rect x="310" y="460" width="70" height="140"/>
                <rect x="400" y="400" width="50" height="200"/>
                <rect x="460" y="450" width="80" height="150"/>
                <rect x="560" y="430" width="60" height="170"/>
                <rect x="640" y="470" width="90" height="130"/>
                <rect x="750" y="410" width="70" height="190"/>
                <rect x="840" y="450" width="80" height="150"/>
                <rect x="930" y="440" width="94" height="160"/>
            </g>
            <!-- Web strings -->
            <g stroke="white" stroke-width="0.5" opacity="0.06" fill="none">
                <path d="M200 0 Q300 200 500 300"/>
                <path d="M600 0 Q550 150 400 350"/>
                <path d="M800 0 Q750 250 600 400"/>
                <path d="M100 100 Q400 150 700 100"/>
            </g>
        </svg>`;
    }

    // Color Catch: Garden with grass and flowers
    function colorCatch() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            <!-- Grass -->
            <path d="M0 550 Q100 530 200 545 Q300 535 400 550 Q500 540 600 548 Q700 535 800 545 Q900 538 1024 550 L1024 600 L0 600Z" fill="#2d5a27" opacity="0.1"/>
            <path d="M0 560 Q150 545 300 555 Q450 548 600 558 Q750 550 900 555 Q960 552 1024 558 L1024 600 L0 600Z" fill="#1e4a1b" opacity="0.08"/>
            <!-- Flowers -->
            <g opacity="0.12">
                <circle cx="100" cy="540" r="6" fill="#e23636"/><circle cx="100" cy="545" r="2" fill="#FFD600"/>
                <circle cx="300" cy="535" r="5" fill="#FFD600"/><circle cx="300" cy="540" r="2" fill="#FF9800"/>
                <circle cx="500" cy="542" r="7" fill="#9C27B0"/><circle cx="500" cy="547" r="2" fill="#FFD600"/>
                <circle cx="700" cy="538" r="5" fill="#2196F3"/><circle cx="700" cy="543" r="2" fill="white"/>
                <circle cx="900" cy="540" r="6" fill="#4CAF50"/><circle cx="900" cy="545" r="2" fill="#FFD600"/>
            </g>
            <!-- Stems -->
            <g stroke="#2d5a27" stroke-width="1.5" opacity="0.08">
                <line x1="100" y1="546" x2="100" y2="570"/>
                <line x1="300" y1="541" x2="300" y2="565"/>
                <line x1="500" y1="548" x2="500" y2="575"/>
                <line x1="700" y1="544" x2="700" y2="568"/>
                <line x1="900" y1="546" x2="900" y2="572"/>
            </g>
            ${createStars(15, 1024, 400)}
        </svg>`;
    }

    // Shape Builder: Spider web pattern
    function shapeBuilder() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            <g stroke="white" stroke-width="0.8" opacity="0.05" fill="none">
                <!-- Radial web -->
                <circle cx="512" cy="300" r="80"/>
                <circle cx="512" cy="300" r="160"/>
                <circle cx="512" cy="300" r="240"/>
                <circle cx="512" cy="300" r="320"/>
                <circle cx="512" cy="300" r="420"/>
                <!-- Spokes -->
                <line x1="512" y1="300" x2="512" y2="-120"/>
                <line x1="512" y1="300" x2="512" y2="720"/>
                <line x1="512" y1="300" x2="0" y2="300"/>
                <line x1="512" y1="300" x2="1024" y2="300"/>
                <line x1="512" y1="300" x2="100" y2="0"/>
                <line x1="512" y1="300" x2="924" y2="0"/>
                <line x1="512" y1="300" x2="100" y2="600"/>
                <line x1="512" y1="300" x2="924" y2="600"/>
            </g>
        </svg>`;
    }

    // Number Bugs: Night sky with moon and constellations
    function numberBugs() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            ${createStars(50, 1024, 600)}
            <!-- Moon -->
            <circle cx="150" cy="100" r="45" fill="#FFE4B5" opacity="0.1"/>
            <circle cx="140" cy="90" r="40" fill="#1a1a2e"/>
            <!-- Simple constellations -->
            <g stroke="white" stroke-width="0.5" opacity="0.06">
                <line x1="600" y1="80" x2="640" y2="120"/>
                <line x1="640" y1="120" x2="680" y2="90"/>
                <line x1="680" y1="90" x2="720" y2="130"/>
                <line x1="800" y1="200" x2="830" y2="180"/>
                <line x1="830" y1="180" x2="870" y2="210"/>
            </g>
        </svg>`;
    }

    // Letter Web: Bookshelf feel
    function letterWeb() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            <!-- Shelves -->
            <g opacity="0.06" fill="white">
                <rect x="30" y="100" width="160" height="4" rx="2"/>
                <rect x="30" y="250" width="160" height="4" rx="2"/>
                <rect x="30" y="400" width="160" height="4" rx="2"/>
                <rect x="834" y="100" width="160" height="4" rx="2"/>
                <rect x="834" y="250" width="160" height="4" rx="2"/>
                <rect x="834" y="400" width="160" height="4" rx="2"/>
            </g>
            <!-- Books -->
            <g opacity="0.05">
                <rect x="40" y="70" width="12" height="30" rx="1" fill="#e23636"/>
                <rect x="55" y="65" width="10" height="35" rx="1" fill="#2196F3"/>
                <rect x="68" y="72" width="14" height="28" rx="1" fill="#4CAF50"/>
                <rect x="85" y="68" width="11" height="32" rx="1" fill="#FFD600"/>
                <rect x="100" y="74" width="12" height="26" rx="1" fill="#9C27B0"/>
                <rect x="115" y="66" width="10" height="34" rx="1" fill="#FF9800"/>
                <rect x="844" y="70" width="12" height="30" rx="1" fill="#FF9800"/>
                <rect x="860" y="65" width="10" height="35" rx="1" fill="#e23636"/>
                <rect x="874" y="72" width="14" height="28" rx="1" fill="#2196F3"/>
                <rect x="892" y="68" width="11" height="32" rx="1" fill="#9C27B0"/>
                <rect x="908" y="74" width="12" height="26" rx="1" fill="#4CAF50"/>
            </g>
            ${createStars(10, 1024, 600)}
        </svg>`;
    }

    // Sort Sweep: Cave with two sides
    function sortSweep() {
        return `<svg class="bg-scene" viewBox="0 0 1024 600" preserveAspectRatio="xMidYMid slice">
            <!-- Cave walls -->
            <path d="M0 0 Q80 100 60 300 Q40 500 0 600" stroke="white" stroke-width="2" fill="none" opacity="0.04"/>
            <path d="M1024 0 Q944 100 964 300 Q984 500 1024 600" stroke="white" stroke-width="2" fill="none" opacity="0.04"/>
            <!-- Stalactites -->
            <g fill="white" opacity="0.04">
                <path d="M200 0 L210 40 L220 0Z"/>
                <path d="M400 0 L408 30 L416 0Z"/>
                <path d="M600 0 L610 35 L620 0Z"/>
                <path d="M800 0 L806 25 L812 0Z"/>
            </g>
            <!-- Web divider -->
            <line x1="512" y1="0" x2="512" y2="600" stroke="white" stroke-width="1" opacity="0.04" stroke-dasharray="8 8"/>
            ${createStars(8, 1024, 600)}
        </svg>`;
    }

    // Inject a background into a screen element
    function apply(screenId, bgFn) {
        const screen = document.getElementById('screen-' + screenId);
        if (!screen) return;
        let existing = screen.querySelector('.bg-scene-wrap');
        if (existing) existing.remove();
        const wrap = document.createElement('div');
        wrap.className = 'bg-scene-wrap';
        wrap.innerHTML = bgFn();
        screen.insertBefore(wrap, screen.firstChild);
    }

    function init() {
        apply('home', home);
        apply('activities', shapeBuilder); // Web pattern for activity select
        apply('stickers', numberBugs); // Starry night for stickers
    }

    // Apply activity-specific background
    function setActivity(activityId) {
        const map = {
            'color-catch': colorCatch,
            'shape-builder': shapeBuilder,
            'number-bugs': numberBugs,
            'letter-web': letterWeb,
            'sort-sweep': sortSweep
        };
        apply('activity', map[activityId] || shapeBuilder);
    }

    return { init, setActivity };
})();
