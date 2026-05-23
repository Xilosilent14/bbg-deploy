/* ============================================
   CREATURE CARDS — Achievements System
   15 achievements tracking battles, collection, streaks
   ============================================ */
const Achievements = (() => {
    const SAVE_KEY = 'creature_cards_achievements';

    const definitions = [
        // Getting started
        { id: 'first-battle', name: 'First Battle', icon: '⚔️', desc: 'Win your first battle' },
        { id: 'card-collector', name: 'Card Collector', icon: '🃏', desc: 'Collect 10 creatures' },
        { id: 'full-deck', name: 'Full Deck', icon: '🎴', desc: 'Fill all 5 deck slots' },

        // Battle milestones
        { id: 'ten-wins', name: 'Battle Veteran', icon: '🛡️', desc: 'Win 10 battles' },
        { id: 'fifty-wins', name: 'War Hero', icon: '🏆', desc: 'Win 50 battles' },
        { id: 'zone-master', name: 'Zone Master', icon: '🗺️', desc: 'Win in all 5 zones' },

        // Collection
        { id: 'half-collection', name: 'Halfway There', icon: '📖', desc: 'Collect 15 creatures' },
        { id: 'full-collection', name: 'Gotta Catch Em All', icon: '👑', desc: 'Collect all 30 creatures' },
        { id: 'first-evolve', name: 'Evolution!', icon: '✨', desc: 'Evolve a creature for the first time' },

        // Streaks
        { id: 'streak-3', name: 'Getting Started', icon: '🔥', desc: 'Play 3 days in a row' },
        { id: 'streak-7', name: 'Dedicated Duelist', icon: '🔥', desc: 'Play 7 days in a row' },

        // Economy
        { id: 'stardust-100', name: 'Stardust Saver', icon: '💎', desc: 'Earn 100 stardust' },
        { id: 'ten-packs', name: 'Pack Rat', icon: '📦', desc: 'Open 10 card packs' },

        // Progression
        { id: 'tier-3', name: 'Rising Challenger', icon: '⭐', desc: 'Reach tier 3 in any zone' },
        { id: 'tier-5', name: 'Ultimate Champion', icon: '🌟', desc: 'Reach tier 5 in any zone' }
    ];

    function _load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function _save(earned) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(earned)); } catch (e) {}
    }

    function _award(id) {
        const earned = _load();
        if (earned.includes(id)) return false;
        earned.push(id);
        _save(earned);
        return true;
    }

    function hasAchievement(id) {
        return _load().includes(id);
    }

    function checkAfterBattle(won) {
        const newlyEarned = [];
        const prog = Progress.get();
        const coll = Collection.get();
        const ownedCount = Object.keys(coll.owned).length;

        // First win
        if (won && prog.totalWins >= 1) {
            if (_award('first-battle')) newlyEarned.push(get('first-battle'));
        }

        // 10 wins
        if (prog.totalWins >= 10) {
            if (_award('ten-wins')) newlyEarned.push(get('ten-wins'));
        }

        // 50 wins
        if (prog.totalWins >= 50) {
            if (_award('fifty-wins')) newlyEarned.push(get('fifty-wins'));
        }

        // Zone master: win in all 5 zones
        const zones = ['ember', 'tidal', 'terra', 'spark', 'shadow'];
        const allZones = zones.every(z => {
            const zp = prog.zoneProgress[z];
            return zp && zp.wins > 0;
        });
        if (allZones) {
            if (_award('zone-master')) newlyEarned.push(get('zone-master'));
        }

        // Collection milestones
        if (ownedCount >= 10) {
            if (_award('card-collector')) newlyEarned.push(get('card-collector'));
        }
        if (ownedCount >= 15) {
            if (_award('half-collection')) newlyEarned.push(get('half-collection'));
        }
        if (ownedCount >= 30) {
            if (_award('full-collection')) newlyEarned.push(get('full-collection'));
        }

        // Full deck
        if (prog.deck.length >= 5) {
            if (_award('full-deck')) newlyEarned.push(get('full-deck'));
        }

        // Stardust
        if (coll.stardust >= 100) {
            if (_award('stardust-100')) newlyEarned.push(get('stardust-100'));
        }

        // Packs opened
        if (coll.packsOpened >= 10) {
            if (_award('ten-packs')) newlyEarned.push(get('ten-packs'));
        }

        // Tier milestones
        const maxTier = Math.max(0, ...Object.values(prog.zoneProgress).map(z => z.tier || 1));
        if (maxTier >= 3) {
            if (_award('tier-3')) newlyEarned.push(get('tier-3'));
        }
        if (maxTier >= 5) {
            if (_award('tier-5')) newlyEarned.push(get('tier-5'));
        }

        // Streak (from ecosystem)
        if (typeof OTBEcosystem !== 'undefined') {
            const profile = OTBEcosystem.getProfile();
            if (profile.dailyStreak >= 3) {
                if (_award('streak-3')) newlyEarned.push(get('streak-3'));
            }
            if (profile.dailyStreak >= 7) {
                if (_award('streak-7')) newlyEarned.push(get('streak-7'));
            }
        }

        return newlyEarned;
    }

    function checkAfterEvolve() {
        const newlyEarned = [];
        if (_award('first-evolve')) newlyEarned.push(get('first-evolve'));
        return newlyEarned;
    }

    function get(id) {
        return definitions.find(a => a.id === id);
    }

    function getAll() {
        const earned = _load();
        return definitions.map(a => ({
            ...a,
            earned: earned.includes(a.id)
        }));
    }

    function getEarnedCount() {
        return _load().length;
    }

    return {
        definitions,
        checkAfterBattle,
        checkAfterEvolve,
        hasAchievement,
        get,
        getAll,
        getEarnedCount
    };
})();
