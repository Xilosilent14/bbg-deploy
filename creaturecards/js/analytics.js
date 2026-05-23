// ===== STRUCTURED ANALYTICS =====
// Lightweight per-game event logger. Emits structured console logs that can
// be scraped + stored locally for the parent dashboard. No network calls.
(function () {
    'use strict';

    const GAME_NAME = 'creaturecards';
    const MAX_EVENTS = 200;
    const LS_KEY = 'bbg_creaturecards_events';
    const SESSION_ID = 's_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);

    function persist(entry) {
        try {
            const raw = localStorage.getItem(LS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(entry);
            while (arr.length > MAX_EVENTS) arr.shift();
            localStorage.setItem(LS_KEY, JSON.stringify(arr));
        } catch (_) { /* quota or disabled - drop silently */ }
    }

    function emit(name, props) {
        try {
            const entry = Object.assign({
                game: GAME_NAME,
                sid: SESSION_ID,
                t: Date.now(),
                name: String(name || 'unknown').substring(0, 40)
            }, props || {});
            console.log('[bbg.ev]', JSON.stringify(entry));
            persist(entry);
        } catch (_) { /* never throw */ }
    }

    window.Analytics = {
        SESSION_ID: SESSION_ID,
        event: emit,
        gameStart: function (props) { emit('game_start', props); },
        battleStart: function (props) { emit('battle_start', props); },
        battleEnd: function (props) { emit('battle_end', props); },
        answer: function (correct, props) {
            emit('answer', Object.assign({ correct: !!correct }, props || {}));
        },
        packOpened: function (props) { emit('pack_opened', props); },
        cardRevealed: function (props) { emit('card_revealed', props); },
        creatureEvolved: function (props) { emit('creature_evolved', props); },
        nearMiss: function (props) { emit('near_miss', props); },
        levelUp: function (props) { emit('level_up', props); },
        sessionEnd: function (props) { emit('session_end', props); },
        getRecent: function () {
            try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
            catch (_) { return []; }
        },
        clear: function () { try { localStorage.removeItem(LS_KEY); } catch (_) {} }
    };

    // Auto-emit session start on load + session end on hide/unload
    emit('session_open');
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) emit('session_pause');
        else emit('session_resume');
    });
    window.addEventListener('pagehide', function () { emit('session_end'); });
})();
