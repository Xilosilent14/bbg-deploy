/* ============================================
   CREATURE CARDS — Progress System
   Deck, zone progress, battle history
   ============================================ */
const Progress = (() => {
    const SAVE_KEY = 'creature_cards_save';

    function _default() {
        return {
            version: 2,
            deck: [],           // array of creatureIds (max 5)
            zoneProgress: {},   // zoneId -> { tier, wins }
            totalBattles: 0,
            totalWins: 0,
            totalXP: 0,
            totalQuestionsAnswered: 0,
            totalQuestionsCorrect: 0,
            totalTimePlayed: 0,     // seconds
            battleHistory: [],      // last 50 battles: { date, zone, won, turns, questionsCorrect, questionsTotal, xpEarned }
            settings: { sfx: true, music: true, voice: true },
            tutorialDone: false,
            lastDailyPack: null, // date string
            xpBoostLeft: 0,     // battles remaining with 2x XP
            coinBoostLeft: 0    // battles remaining with 2x coins
        };
    }

    function get() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return _default();
            return Object.assign(_default(), JSON.parse(raw));
        } catch (e) { return _default(); }
    }

    function save(data) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    function getDeck() {
        const d = get();
        // Return full creature objects for deck IDs, applying evolved stats if applicable
        return d.deck.map(id => {
            const evolved = Collection.isEvolved(id);
            const resolved = CreatureData.getCreatureResolved(id, evolved);
            const owned = Collection.get().owned[id];
            return resolved ? { ...resolved, ...(owned || {}), _evolved: evolved } : null;
        }).filter(Boolean);
    }

    function setDeck(deckIds) {
        const d = get();
        d.deck = deckIds.slice(0, 5);
        save(d);
    }

    function autoFillDeck() {
        const owned = Collection.getOwnedList();
        if (owned.length === 0) return;
        // Pick top 5 by total stats, with type diversity
        const sorted = owned.sort((a, b) => {
            const ta = (a.stats.pwr + a.stats.grd + a.stats.spd + a.stats.mag);
            const tb = (b.stats.pwr + b.stats.grd + b.stats.spd + b.stats.mag);
            return tb - ta;
        });
        const deck = [];
        const usedTypes = new Set();
        // First pass: one per type
        for (const c of sorted) {
            if (!usedTypes.has(c.type) && deck.length < 5) {
                deck.push(c.id);
                usedTypes.add(c.type);
            }
        }
        // Fill remaining slots with strongest
        for (const c of sorted) {
            if (!deck.includes(c.id) && deck.length < 5) {
                deck.push(c.id);
            }
        }
        setDeck(deck);
        return deck;
    }

    function getZoneProgress(zoneId) {
        const d = get();
        return d.zoneProgress[zoneId] || { tier: 1, wins: 0 };
    }

    // Track individual question answers
    function recordQuestion(correct) {
        const d = get();
        d.totalQuestionsAnswered = (d.totalQuestionsAnswered || 0) + 1;
        if (correct) d.totalQuestionsCorrect = (d.totalQuestionsCorrect || 0) + 1;
        save(d);
    }

    // Add play time (call periodically during battles)
    function addPlayTime(seconds) {
        const d = get();
        d.totalTimePlayed = (d.totalTimePlayed || 0) + seconds;
        save(d);
    }

    function recordBattleResult(zoneId, won, xpEarned, battleStats) {
        const d = get();
        d.totalBattles++;
        if (won) d.totalWins++;
        d.totalXP += xpEarned;

        if (!d.zoneProgress[zoneId]) {
            d.zoneProgress[zoneId] = { tier: 1, wins: 0 };
        }
        if (won) {
            d.zoneProgress[zoneId].wins++;
            // Advance tier if won current tier
            if (d.zoneProgress[zoneId].wins >= d.zoneProgress[zoneId].tier) {
                d.zoneProgress[zoneId].tier = Math.min(5, d.zoneProgress[zoneId].tier + 1);
            }
        }

        // Record battle history entry
        if (!d.battleHistory) d.battleHistory = [];
        d.battleHistory.push({
            date: new Date().toISOString(),
            zone: zoneId,
            won: won,
            turns: battleStats?.turns || 0,
            questionsCorrect: battleStats?.questionsCorrect || 0,
            questionsTotal: battleStats?.questionsTotal || 0,
            xpEarned: xpEarned
        });
        // Keep last 50
        if (d.battleHistory.length > 50) d.battleHistory = d.battleHistory.slice(-50);

        save(d);
    }

    function canClaimDailyPack() {
        const d = get();
        const today = new Date().toISOString().slice(0, 10);
        return d.lastDailyPack !== today;
    }

    function claimDailyPack() {
        const d = get();
        d.lastDailyPack = new Date().toISOString().slice(0, 10);
        save(d);
    }

    function getSettings() { return get().settings; }
    function saveSetting(key, value) {
        const d = get();
        d.settings[key] = value;
        save(d);
    }

    function markTutorialDone() {
        const d = get();
        d.tutorialDone = true;
        save(d);
    }

    function isTutorialDone() { return get().tutorialDone; }

    // === Boost System ===
    function getXPBoostLeft() { return get().xpBoostLeft || 0; }
    function getCoinBoostLeft() { return get().coinBoostLeft || 0; }

    function addXPBoost(battles) {
        const d = get();
        d.xpBoostLeft = (d.xpBoostLeft || 0) + battles;
        save(d);
    }

    function addCoinBoost(battles) {
        const d = get();
        d.coinBoostLeft = (d.coinBoostLeft || 0) + battles;
        save(d);
    }

    function consumeBoosts() {
        // Call after each battle to decrement active boosts. Returns multipliers.
        const d = get();
        const xpMult = (d.xpBoostLeft > 0) ? 2 : 1;
        const coinMult = (d.coinBoostLeft > 0) ? 2 : 1;
        if (d.xpBoostLeft > 0) d.xpBoostLeft--;
        if (d.coinBoostLeft > 0) d.coinBoostLeft--;
        save(d);
        return { xpMult, coinMult };
    }

    // === Stardust Shop ===
    function spendStardust(amount) {
        const coll = Collection.get();
        if (coll.stardust < amount) return false;
        coll.stardust -= amount;
        Collection.save(coll);
        return true;
    }

    return {
        get, save, getDeck, setDeck, autoFillDeck,
        getZoneProgress, recordBattleResult,
        recordQuestion, addPlayTime,
        canClaimDailyPack, claimDailyPack,
        getSettings, saveSetting,
        markTutorialDone, isTutorialDone,
        getXPBoostLeft, getCoinBoostLeft,
        addXPBoost, addCoinBoost, consumeBoosts,
        spendStardust
    };
})();
