// ===== VARIABLE REWARD ENGINE =====
// Ethical variable-ratio reward layer on top of fixed XP/star rewards.
// Per research/game-design/variable-reward-psychology.md:
//   - 60% fixed + 40% variable mix
//   - Mystery Box on a variable-ratio schedule with a pity timer
//   - Streak-aware multipliers
//   - No artificial scarcity, no purchase pressure, no dark patterns
(function () {
    'use strict';

    const LS_KEY = 'bbg_thinkfast_vr';

    // Drop-rate config
    const BASE_DROP_CHANCE = 0.10;       // baseline 10% on correct
    const STREAK_BOOST = 0.02;           // +2% per streak point, capped
    const STREAK_BOOST_CAP = 0.10;       // hard cap on streak contribution
    const PITY_THRESHOLD = 12;           // force drop after N correct without one
    const COOLDOWN_AFTER_DROP = 2;       // suppress drops for N answers post-box

    const REWARDS = [
        // weights are RELATIVE — drawn with weighted random
        { id: 'double-coins', label: 'Double Coins!', weight: 40, payload: { coins: 2 } },
        { id: 'bonus-star',   label: 'Bonus Star!',   weight: 30, payload: { stars: 1 } },
        { id: 'bonus-xp',     label: 'Bonus XP!',     weight: 20, payload: { xp: 15 } },
        { id: 'jackpot',      label: 'Jackpot!',      weight: 10, payload: { stars: 2, xp: 25 } }
    ];

    function readState() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return { correctSinceDrop: 0, cooldown: 0, totalDrops: 0 };
            const obj = JSON.parse(raw);
            return {
                correctSinceDrop: Math.max(0, obj.correctSinceDrop | 0),
                cooldown: Math.max(0, obj.cooldown | 0),
                totalDrops: Math.max(0, obj.totalDrops | 0)
            };
        } catch (_) { return { correctSinceDrop: 0, cooldown: 0, totalDrops: 0 }; }
    }

    function writeState(s) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (_) {}
    }

    function pickReward() {
        const total = REWARDS.reduce((sum, r) => sum + r.weight, 0);
        let roll = Math.random() * total;
        for (const r of REWARDS) {
            roll -= r.weight;
            if (roll <= 0) return r;
        }
        return REWARDS[0];
    }

    // Decide whether to drop a reward on this correct answer.
    // Returns null (no drop) or a reward object.
    function rollOnCorrect(streakCount) {
        const s = readState();

        // Cooldown to prevent back-to-back drops
        if (s.cooldown > 0) {
            s.cooldown--;
            s.correctSinceDrop++;
            writeState(s);
            return null;
        }

        // Pity timer: guaranteed drop if too long without one
        const pityHit = s.correctSinceDrop >= PITY_THRESHOLD;

        const streakBoost = Math.min(STREAK_BOOST_CAP, Math.max(0, (streakCount | 0)) * STREAK_BOOST);
        const dropChance = Math.min(0.4, BASE_DROP_CHANCE + streakBoost);

        if (pityHit || Math.random() < dropChance) {
            const reward = pickReward();
            // Reset counters + start cooldown
            s.correctSinceDrop = 0;
            s.cooldown = COOLDOWN_AFTER_DROP;
            s.totalDrops++;
            writeState(s);

            // Apply payload immediately to Progress, with safety checks
            try {
                if (typeof Progress !== 'undefined' && Progress && Progress.data) {
                    if (reward.payload.stars) Progress.addStars(reward.payload.stars);
                    if (reward.payload.xp)    Progress.addXP(reward.payload.xp);
                    // coins multiplier is consumed by the caller via `multiplier`
                }
            } catch (_) {}

            // Log to analytics
            try {
                if (typeof Analytics !== 'undefined') {
                    Analytics.event('mystery_drop', {
                        id: reward.id,
                        streak: streakCount | 0,
                        pity: !!pityHit,
                        totalDrops: s.totalDrops
                    });
                }
            } catch (_) {}

            return {
                id: reward.id,
                label: reward.label,
                multiplier: reward.payload.coins || 1,
                payload: reward.payload
            };
        }

        s.correctSinceDrop++;
        writeState(s);
        return null;
    }

    // Lightweight floating UI for a mystery drop. Respects reduced-motion.
    function showRewardBanner(reward) {
        try {
            if (!reward) return;
            // Honor reduced motion
            const reduce = typeof Settings !== 'undefined' && Settings && Settings.prefersReducedMotion;
            const el = document.createElement('div');
            el.className = 'mystery-banner';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            el.textContent = '🎁 ' + reward.label;
            el.style.cssText =
                'position:fixed;left:50%;top:18%;transform:translate(-50%,-50%);' +
                'background:linear-gradient(135deg,#ffd700,#ff9800);color:#1a1a2e;' +
                'font-family:var(--otb-font-heading,Fredoka One,sans-serif);' +
                'font-size:1.4rem;font-weight:700;padding:14px 26px;border-radius:14px;' +
                'box-shadow:0 10px 30px rgba(0,0,0,0.5),0 0 0 3px rgba(255,255,255,0.4) inset;' +
                'z-index:10001;pointer-events:none;';
            document.body.appendChild(el);
            if (!reduce && el.animate) {
                el.animate([
                    { transform: 'translate(-50%,-130%) scale(0.6)', opacity: 0 },
                    { transform: 'translate(-50%,-50%) scale(1.05)', opacity: 1, offset: 0.25 },
                    { transform: 'translate(-50%,-50%) scale(1)',    opacity: 1, offset: 0.75 },
                    { transform: 'translate(-50%,-180%) scale(0.9)', opacity: 0 }
                ], { duration: 2200, easing: 'cubic-bezier(0.2,0.8,0.3,1)', fill: 'forwards' })
                    .onfinish = () => el.remove();
            } else {
                setTimeout(() => el.remove(), 2200);
            }
            // Sound: piggyback on existing star/streak chime if available
            try {
                if (typeof Audio !== 'undefined') {
                    if (Audio.playStarEarn) Audio.playStarEarn();
                    if (Audio.speak)        Audio.speak(reward.label, { context: 'excited' });
                }
            } catch (_) {}
        } catch (_) {}
    }

    window.VariableReward = {
        rollOnCorrect: rollOnCorrect,
        showRewardBanner: showRewardBanner,
        getStats: function () { return readState(); },
        // For dev/parent dashboard
        reset: function () { try { localStorage.removeItem(LS_KEY); } catch (_) {} }
    };
})();
