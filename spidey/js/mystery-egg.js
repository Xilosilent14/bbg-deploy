/**
 * Mystery Egg — variable-reward sticker bonus.
 *
 * Roughly once per session (with diminishing chance after the first roll),
 * the kid sees a tappable "mystery egg". Cracking it has a 70% chance of
 * a bonus sticker, otherwise a coin reward (so it always feels positive).
 *
 * Variable-reward research: intermittent reinforcement boosts engagement
 * far more than predictable rewards. Capped to once-per-session so it
 * doesn't desensitize.
 */
const MysteryEgg = (() => {
    'use strict';

    const SESSION_FLAG = 'bbg_spidey_egg_session';

    function _shownThisSession() {
        try { return sessionStorage.getItem(SESSION_FLAG) === '1'; } catch (_) { return false; }
    }
    function _markShown() {
        try { sessionStorage.setItem(SESSION_FLAG, '1'); } catch (_) {}
    }

    /**
     * Roll for a mystery egg appearance.
     * Called by activity-complete flows. Chance scales with correct answers
     * in the session so a kid who's been doing well is more likely to see one.
     */
    function maybeOffer(correctThisSession) {
        if (_shownThisSession()) return false;
        // Need at least a few correct answers to earn the chance
        const base = Math.min(0.5, 0.15 + (Math.max(0, correctThisSession) * 0.05));
        if (Math.random() > base) return false;
        offer();
        return true;
    }

    function offer() {
        _markShown();
        try { if (typeof Analytics !== 'undefined') Analytics.event('mystery_egg_offered'); } catch (_) {}

        const overlay = document.createElement('div');
        overlay.className = 'mystery-egg-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Mystery egg! Tap to crack it open!');
        overlay.innerHTML = `
            <div class="mystery-egg-card">
                <div class="mystery-egg-title">A Mystery Egg!</div>
                <div class="mystery-egg-sub">Tap the egg to see what's inside!</div>
                <button class="mystery-egg-img" id="mystery-egg-btn" aria-label="Crack the mystery egg">🥚</button>
                <div class="mystery-egg-tap-hint">Tap the egg!</div>
            </div>
        `;
        document.body.appendChild(overlay);

        try { if (typeof Voice !== 'undefined') Voice.speak('A mystery egg! Tap it to see what is inside!'); } catch (_) {}
        try { if (typeof Audio !== 'undefined') Audio.playWhoosh && Audio.playWhoosh(); } catch (_) {}

        const btn = overlay.querySelector('#mystery-egg-btn');
        let tapped = false;
        const onTap = () => {
            if (tapped) return;
            tapped = true;
            _crack(overlay, btn);
        };
        btn.addEventListener('click', onTap);
        btn.addEventListener('touchend', (e) => { e.preventDefault(); onTap(); }, { passive: false });

        // Auto-close fallback if kid wanders away
        setTimeout(() => {
            if (!tapped) {
                try { overlay.remove(); } catch (_) {}
            }
        }, 12000);
    }

    function _crack(overlay, btn) {
        // 70% sticker, 30% coins. Always positive.
        const winSticker = Math.random() < 0.7;
        try { if (typeof Audio !== 'undefined') Audio.playSticker && Audio.playSticker(); } catch (_) {}
        try { if (typeof Celebration !== 'undefined') Celebration.starBurst(window.innerWidth / 2, window.innerHeight / 2); } catch (_) {}

        if (winSticker && typeof StickerBook !== 'undefined') {
            const sticker = StickerBook.getNextUnearned();
            if (sticker) {
                try { Progress.awardSticker(sticker.id); } catch (_) {}
                try { Analytics.event('mystery_egg_reward', { type: 'sticker', id: sticker.id }); } catch (_) {}
                btn.textContent = '✨';
                setTimeout(() => {
                    try { overlay.remove(); } catch (_) {}
                    try { if (typeof Main !== 'undefined' && Main.showStickerEarned) Main.showStickerEarned(sticker); } catch (_) {}
                }, 600);
                try { Voice.speak('A bonus sticker!'); } catch (_) {}
                return;
            }
        }
        // Fallback: coins
        const coins = 10;
        try {
            if (typeof OTBEcosystem !== 'undefined') {
                OTBEcosystem.addCoins(coins, 'spidey-mystery-egg');
            }
        } catch (_) {}
        try { Analytics.event('mystery_egg_reward', { type: 'coins', amount: coins }); } catch (_) {}
        btn.textContent = '💰';
        try { Voice.speak('Wow! You got ' + coins + ' bonus coins!'); } catch (_) {}
        setTimeout(() => { try { overlay.remove(); } catch (_) {} }, 1600);
    }

    return { maybeOffer, offer };
})();
