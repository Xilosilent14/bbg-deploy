/**
 * Character — SVG Spidey and Webby with rich animations
 * Full inline SVG characters with expression states and smooth transitions.
 */
const Character = (() => {
    let spideyEl = null;
    let webbyEl = null;
    let stateTimeout = null;

    // ---- SPIDEY SVG ----
    function _spideySVG() {
        return `<svg viewBox="0 0 120 160" class="spidey-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Body -->
            <g class="spidey-body-group">
                <!-- Legs -->
                <rect class="spidey-leg-l" x="30" y="120" width="16" height="32" rx="8" fill="#e23636"/>
                <rect class="spidey-leg-r" x="74" y="120" width="16" height="32" rx="8" fill="#e23636"/>
                <!-- Feet -->
                <ellipse cx="38" cy="154" rx="12" ry="6" fill="#1565C0"/>
                <ellipse cx="82" cy="154" rx="12" ry="6" fill="#1565C0"/>
                <!-- Torso -->
                <rect x="28" y="75" width="64" height="52" rx="20" fill="#e23636"/>
                <!-- Blue section (belt/shorts) -->
                <rect x="28" y="100" width="64" height="28" rx="12" fill="#1565C0"/>
                <!-- Web pattern on chest -->
                <line x1="60" y1="75" x2="60" y2="100" stroke="#c62828" stroke-width="1" opacity="0.4"/>
                <line x1="40" y1="82" x2="80" y2="82" stroke="#c62828" stroke-width="0.8" opacity="0.3"/>
                <line x1="42" y1="92" x2="78" y2="92" stroke="#c62828" stroke-width="0.8" opacity="0.3"/>
                <!-- Spider emblem -->
                <ellipse cx="60" cy="88" rx="5" ry="4" fill="#c62828" opacity="0.5"/>
                <!-- Arms -->
                <g class="spidey-arms">
                    <rect class="spidey-arm-l" x="10" y="80" width="18" height="36" rx="9" fill="#e23636" transform="rotate(15, 19, 80)"/>
                    <rect class="spidey-arm-r" x="92" y="80" width="18" height="36" rx="9" fill="#e23636" transform="rotate(-15, 101, 80)"/>
                    <!-- Hands -->
                    <circle class="spidey-hand-l" cx="16" cy="118" r="7" fill="#e23636"/>
                    <circle class="spidey-hand-r" cx="104" cy="118" r="7" fill="#e23636"/>
                </g>
                <!-- Head -->
                <g class="spidey-head">
                    <ellipse cx="60" cy="50" rx="34" ry="32" fill="#e23636"/>
                    <!-- Web lines on mask -->
                    <line x1="60" y1="18" x2="60" y2="80" stroke="#c62828" stroke-width="0.8" opacity="0.3"/>
                    <line x1="26" y1="50" x2="94" y2="50" stroke="#c62828" stroke-width="0.8" opacity="0.25"/>
                    <path d="M60 18 Q40 35 26 50" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.2"/>
                    <path d="M60 18 Q80 35 94 50" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.2"/>
                    <path d="M60 82 Q40 65 26 50" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.2"/>
                    <path d="M60 82 Q80 65 94 50" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.2"/>
                    <!-- Eyes -->
                    <g class="spidey-eyes">
                        <ellipse class="spidey-eye-l" cx="44" cy="48" rx="12" ry="14" fill="white" stroke="#222" stroke-width="1.5"/>
                        <ellipse class="spidey-eye-r" cx="76" cy="48" rx="12" ry="14" fill="white" stroke="#222" stroke-width="1.5"/>
                        <!-- Pupils -->
                        <ellipse class="spidey-pupil-l" cx="46" cy="49" rx="5" ry="6" fill="#222"/>
                        <ellipse class="spidey-pupil-r" cx="74" cy="49" rx="5" ry="6" fill="#222"/>
                        <!-- Eye shine -->
                        <circle cx="48" cy="44" r="2.5" fill="white" opacity="0.8"/>
                        <circle cx="76" cy="44" r="2.5" fill="white" opacity="0.8"/>
                    </g>
                    <!-- Mouth (hidden by default, shown in happy state) -->
                    <path class="spidey-mouth" d="M48 62 Q60 72 72 62" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0"/>
                    <!-- Blink overlay -->
                    <g class="spidey-blink" opacity="0">
                        <ellipse cx="44" cy="48" rx="13" ry="15" fill="#e23636"/>
                        <ellipse cx="76" cy="48" rx="13" ry="15" fill="#e23636"/>
                    </g>
                </g>
            </g>
        </svg>`;
    }

    // ---- WEBBY SVG ----
    function _webbySVG() {
        return `<svg viewBox="0 0 70 55" class="webby-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Legs (8 legs) -->
            <g class="webby-legs-group">
                <line class="wleg wleg-1" x1="12" y1="28" x2="0" y2="18" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-2" x1="14" y1="32" x2="0" y2="30" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-3" x1="14" y1="36" x2="2" y2="42" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-4" x1="16" y1="40" x2="4" y2="50" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-5" x1="58" y1="28" x2="70" y2="18" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-6" x1="56" y1="32" x2="70" y2="30" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-7" x1="56" y1="36" x2="68" y2="42" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
                <line class="wleg wleg-8" x1="54" y1="40" x2="66" y2="50" stroke="#6b6b8d" stroke-width="2.5" stroke-linecap="round"/>
            </g>
            <!-- Body -->
            <ellipse cx="35" cy="32" rx="22" ry="18" fill="#5a5a7a"/>
            <ellipse cx="35" cy="32" rx="18" ry="14" fill="#6b6b8d"/>
            <!-- Cute pattern -->
            <ellipse cx="35" cy="36" rx="10" ry="6" fill="#5a5a7a" opacity="0.5"/>
            <!-- Eyes -->
            <g class="webby-eyes">
                <circle cx="28" cy="26" r="7" fill="white" stroke="#444" stroke-width="1"/>
                <circle cx="42" cy="26" r="7" fill="white" stroke="#444" stroke-width="1"/>
                <circle class="webby-pupil-l" cx="29" cy="27" r="3.5" fill="#222"/>
                <circle class="webby-pupil-r" cx="41" cy="27" r="3.5" fill="#222"/>
                <circle cx="30" cy="24" r="1.5" fill="white" opacity="0.8"/>
                <circle cx="43" cy="24" r="1.5" fill="white" opacity="0.8"/>
            </g>
            <!-- Smile -->
            <path class="webby-mouth" d="M30 36 Q35 40 40 36" stroke="#444" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <!-- Blink -->
            <g class="webby-blink" opacity="0">
                <circle cx="28" cy="26" r="8" fill="#6b6b8d"/>
                <circle cx="42" cy="26" r="8" fill="#6b6b8d"/>
            </g>
        </svg>`;
    }

    function init() {
        spideyEl = document.getElementById('spidey-character');
        webbyEl = document.getElementById('webby-character');

        if (spideyEl) spideyEl.innerHTML = _spideySVG();
        if (webbyEl) webbyEl.innerHTML = _webbySVG();

        // Start blink cycle
        _startBlinking();
    }

    function _startBlinking() {
        function blink() {
            // Spidey blink
            const sb = document.querySelector('.spidey-blink');
            if (sb) {
                sb.style.opacity = '1';
                setTimeout(() => { sb.style.opacity = '0'; }, 150);
            }
            // Webby blink
            const wb = document.querySelector('.webby-blink');
            if (wb) {
                wb.style.opacity = '1';
                setTimeout(() => { wb.style.opacity = '0'; }, 150);
            }
            // Random next blink
            setTimeout(blink, 2500 + Math.random() * 3000);
        }
        setTimeout(blink, 2000);
    }

    function setState(state, duration = 1500) {
        if (!spideyEl) return;
        if (stateTimeout) clearTimeout(stateTimeout);

        // Reset all classes
        spideyEl.className = 'spidey-char';
        if (webbyEl) webbyEl.className = 'webby-char';

        // Apply state class
        spideyEl.classList.add('spidey-' + state);
        if (webbyEl) webbyEl.classList.add('webby-' + state);

        // Show/hide mouth for happy states
        const mouth = spideyEl.querySelector('.spidey-mouth');
        if (mouth) {
            mouth.style.opacity = (state === 'happy' || state === 'celebrate' || state === 'excited') ? '1' : '0';
        }

        if (state !== 'idle') {
            stateTimeout = setTimeout(() => setState('idle'), duration);
        }
    }

    function happy() { setState('happy', 1200); }
    function excited() { setState('excited', 1500); }
    function encourage() { setState('encourage', 2000); }
    function celebrate() { setState('celebrate', 2500); }
    function idle() { setState('idle'); }
    function wave() { setState('wave', 2000); }

    function webbyPoint(targetEl) {
        if (!webbyEl || !targetEl) return;
        webbyEl.className = 'webby-char webby-point';
        const wRect = webbyEl.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();
        if (tRect.left < wRect.left) webbyEl.classList.add('point-left');
        else webbyEl.classList.add('point-right');
        setTimeout(() => { webbyEl.className = 'webby-char webby-idle'; }, 2500);
    }

    return { init, happy, excited, encourage, celebrate, idle, wave, webbyPoint, setState };
})();
