// ===== CROSS-GAME CARD DROPS (RECEIVER) =====
// Other BBG games can drop a creature card into Creature Cards by writing
// an entry into the shared queue (localStorage key 'bbg_pending_card_drops').
// On title-screen load, Creature Cards drains the queue, awards cards, and
// shows a small "card earned" toast.
//
// Producer format (any game writes):
//   {
//     source: 'rhythm-blast' | 'thinkfast' | 'wordmine' | ...,
//     reason: 'song-3-star' | 'topic-mastery' | 'race-win',
//     packType: 'daily' | 'victory' | 'milestone'  (optional, default 'daily'),
//     t: <timestamp>
//   }
//
// On consume: we open a pack of the requested type, award the cards, and
// flag them so the user sees them next time they open Creature Cards.
(function () {
    'use strict';

    const QUEUE_KEY = 'bbg_pending_card_drops';
    const AWARDED_KEY = 'bbg_card_drops_awarded';   // ring buffer of recent drops for UI

    function _readQueue() {
        try {
            const raw = localStorage.getItem(QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    function _writeQueue(arr) {
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(arr)); }
        catch (_) {}
    }
    function _pushAwarded(entry) {
        try {
            const raw = localStorage.getItem(AWARDED_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(entry);
            while (arr.length > 20) arr.shift();
            localStorage.setItem(AWARDED_KEY, JSON.stringify(arr));
        } catch (_) {}
    }

    // Drain pending queue, award packs, return list of {source, reason, cards[]}
    function drain() {
        if (typeof Collection === 'undefined') return [];
        const pending = _readQueue();
        if (!pending.length) return [];
        const awarded = [];
        pending.forEach(item => {
            try {
                const packType = item.packType || 'daily';
                const cards = Collection.openPack(packType);
                const entry = {
                    source: item.source || 'unknown',
                    reason: item.reason || '',
                    cards: cards,
                    t: Date.now()
                };
                awarded.push(entry);
                _pushAwarded(entry);
                if (window.Analytics && Analytics.event) {
                    Analytics.event('cross_game_drop_received', {
                        source: entry.source,
                        reason: entry.reason,
                        cardCount: cards.length
                    });
                }
            } catch (_) {}
        });
        _writeQueue([]); // clear after drain
        return awarded;
    }

    // Producer-side helper exposed for other games to call locally.
    // (We host the function here so the pattern is documented. Each game can
    // copy this snippet into its own bundle, or read the queue directly.)
    function enqueueDrop(source, reason, packType) {
        try {
            const q = _readQueue();
            q.push({
                source: source || 'unknown',
                reason: reason || '',
                packType: packType || 'daily',
                t: Date.now()
            });
            while (q.length > 20) q.shift();   // hard cap
            _writeQueue(q);
            return true;
        } catch (_) { return false; }
    }

    window.CrossGameDrops = {
        drain: drain,
        enqueueDrop: enqueueDrop,
        getAwarded: function () {
            try { return JSON.parse(localStorage.getItem(AWARDED_KEY) || '[]'); }
            catch (_) { return []; }
        },
        clearAwarded: function () { try { localStorage.removeItem(AWARDED_KEY); } catch (_) {} }
    };
})();
