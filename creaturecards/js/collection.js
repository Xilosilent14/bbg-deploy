/* ============================================
   CREATURE CARDS — Collection System
   Card packs, rarity rolls, stardust, ownership
   ============================================ */
const Collection = (() => {
    const SAVE_KEY = 'creature_cards_collection';

    function _default() {
        return {
            owned: {},      // creatureId -> { count, level, evolved, wins }
            stardust: 0,
            packsOpened: 0,
            sinceLastRare: 0,   // pity timer
            sinceLastEpic: 0
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

    function addCreature(creatureId) {
        const d = get();
        if (d.owned[creatureId]) {
            // Duplicate: convert to stardust
            const creature = CreatureData.getCreature(creatureId);
            const dustMap = { common: 3, uncommon: 8, rare: 20, epic: 50, legendary: 150 };
            const dust = dustMap[creature?.rarity] || 3;
            d.stardust += dust;
            d.owned[creatureId].count++;
        } else {
            d.owned[creatureId] = { count: 1, level: 0, evolved: false, wins: 0 };
        }
        save(d);
        return d;
    }

    function isOwned(creatureId) {
        return !!get().owned[creatureId];
    }

    function getOwnedList() {
        const d = get();
        return Object.keys(d.owned).map(id => ({
            ...CreatureData.getCreature(id),
            ...d.owned[id]
        })).filter(c => c.id); // filter out any orphaned IDs
    }

    function getOwnedCount() {
        return Object.keys(get().owned).length;
    }

    function recordWin(creatureId) {
        const d = get();
        if (d.owned[creatureId]) {
            d.owned[creatureId].wins++;
            // Level up every 5 wins (max 3 level-ups before evolution)
            const wins = d.owned[creatureId].wins;
            const level = d.owned[creatureId].level;
            if (wins % 5 === 0 && level < 3) {
                d.owned[creatureId].level++;
            }
        }
        save(d);
    }

    // Open a card pack and return array of creature IDs
    function openPack(packType) {
        const d = get();
        d.packsOpened++;
        d.sinceLastRare++;
        d.sinceLastEpic++;

        const cards = [];
        const count = packType === 'milestone' ? 5 : 3;

        for (let i = 0; i < count; i++) {
            let rarity = _rollRarity(packType, d);
            const creature = _pickCreatureByRarity(rarity);
            if (creature) {
                cards.push(creature.id);
                addCreature(creature.id);
                if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
                    d.sinceLastRare = 0;
                }
                if (rarity === 'epic' || rarity === 'legendary') {
                    d.sinceLastEpic = 0;
                }
            }
        }

        save(d);
        return cards;
    }

    function _rollRarity(packType, d) {
        // Pity timer: guarantee rare after 15 packs, epic after 40
        if (d.sinceLastRare >= 15) return 'rare';
        if (d.sinceLastEpic >= 40) return 'epic';

        const weights = {
            daily:     { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 },
            victory:   { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
            boss:      { common: 20, uncommon: 35, rare: 30, epic: 12, legendary: 3 },
            milestone: { common: 10, uncommon: 25, rare: 35, epic: 25, legendary: 5 }
        };
        const w = weights[packType] || weights.daily;
        const total = Object.values(w).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;

        for (const [rarity, weight] of Object.entries(w)) {
            roll -= weight;
            if (roll <= 0) return rarity;
        }
        return 'common';
    }

    function _pickCreatureByRarity(rarity) {
        const pool = CreatureData.getAllCreatures().filter(c => c.rarity === rarity);
        if (pool.length === 0) return CreatureData.getAllCreatures()[0];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function getStardust() { return get().stardust; }

    // Give starter pack (1 of each type, common)
    function giveStarterPack() {
        const starters = ['blazepup', 'splashkit', 'seedling', 'zapbit', 'duskkit'];
        starters.forEach(id => addCreature(id));
    }

    function hasStarterPack() {
        const d = get();
        return Object.keys(d.owned).length > 0;
    }

    // --- Evolution functions ---
    function getCreatureWins(creatureId) {
        const d = get();
        return d.owned[creatureId]?.wins || 0;
    }

    function isEvolved(creatureId) {
        const d = get();
        return !!d.owned[creatureId]?.evolved;
    }

    function canEvolve(creatureId) {
        const d = get();
        const owned = d.owned[creatureId];
        if (!owned || owned.evolved) return false;
        const creature = CreatureData.getCreature(creatureId);
        if (!creature || !creature.evolvesAt) return false;
        return owned.wins >= creature.evolvesAt;
    }

    function evolveCreature(creatureId) {
        const d = get();
        if (d.owned[creatureId]) {
            d.owned[creatureId].evolved = true;
        }
        save(d);
    }

    return {
        get, save, addCreature, isOwned, getOwnedList, getOwnedCount,
        recordWin, openPack, getStardust, giveStarterPack, hasStarterPack,
        getCreatureWins, isEvolved, canEvolve, evolveCreature
    };
})();
