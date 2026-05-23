/* ============================================
   RHYTHM BLAST — Structured Analytics
   Lightweight client-side event log. Persists last 200 events to localStorage
   so the parent dashboard can show a rolling activity feed without a backend.
   Every event also goes to console as a single-line JSON for Hub scraping:
     [bbg.evt] {"game":"rhythmblast","event":"song_start",...}
   ============================================ */
const Analytics = (() => {
    'use strict';

    const STORAGE_KEY = 'rhythmblast_events_v1';
    const MAX_EVENTS = 200;

    let _sessionId = null;
    let _sessionStart = 0;
    let _events = [];
    let _loaded = false;
    // Per-song running totals (reset on song_start)
    let _current = null;

    function _load() {
        if (_loaded) return;
        _loaded = true;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) _events = parsed.slice(-MAX_EVENTS);
            }
        } catch (_) { _events = []; }
        if (!_sessionId) {
            _sessionId = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
            _sessionStart = Date.now();
        }
    }

    function _persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_events.slice(-MAX_EVENTS)));
        } catch (_) { /* quota or SES — non-fatal */ }
    }

    function track(event, details) {
        _load();
        const rec = Object.assign(
            { game: 'rhythmblast', session: _sessionId, ts: Date.now(), event: event || 'unknown' },
            details || {}
        );
        _events.push(rec);
        if (_events.length > MAX_EVENTS) _events = _events.slice(-MAX_EVENTS);
        _persist();
        try { console.log('[bbg.evt] ' + JSON.stringify(rec)); } catch (_) {}
        return rec;
    }

    // Song lifecycle helpers
    function songStart(songId, songName, difficulty, bpm) {
        _current = {
            songId: songId,
            songName: songName,
            difficulty: difficulty,
            bpm: bpm,
            startedAt: Date.now(),
            perfects: 0, greats: 0, oks: 0, misses: 0,
            maxStreak: 0
        };
        track('song_start', { songId: songId, songName: songName, difficulty: difficulty, bpm: bpm });
    }

    function hit(quality) {
        if (!_current) return;
        if (quality === 'perfect') _current.perfects++;
        else if (quality === 'great') _current.greats++;
        else if (quality === 'ok') _current.oks++;
        else if (quality === 'miss') _current.misses++;
    }

    function streak(value) {
        if (!_current) return;
        if (value > _current.maxStreak) _current.maxStreak = value;
        if (value === 5 || value === 10 || value === 25 || value === 50) {
            track('streak_achievement', { songId: _current.songId, streak: value });
        }
    }

    function songComplete(result) {
        const payload = Object.assign(
            { durationMs: _current ? Date.now() - _current.startedAt : 0 },
            _current || {},
            result || {}
        );
        track('song_complete', payload);
        _current = null;
    }

    function sessionEnd() {
        track('session_end', { durationMs: Date.now() - _sessionStart, events: _events.length });
    }

    function getEvents() {
        _load();
        return _events.slice();
    }

    function getSessionSummary() {
        _load();
        const songs = _events.filter(e => e.event === 'song_complete');
        const totalPerfects = songs.reduce((s, e) => s + (e.perfects || 0), 0);
        const totalGreats = songs.reduce((s, e) => s + (e.greats || 0), 0);
        const totalOks = songs.reduce((s, e) => s + (e.oks || 0), 0);
        const totalMisses = songs.reduce((s, e) => s + (e.misses || 0), 0);
        return {
            sessionId: _sessionId,
            sessionStart: _sessionStart,
            songsPlayed: songs.length,
            totalPerfects: totalPerfects,
            totalGreats: totalGreats,
            totalOks: totalOks,
            totalMisses: totalMisses,
            recentEvents: _events.slice(-20)
        };
    }

    // Initialize session immediately so the session id is available everywhere.
    _load();
    // Flush a session_end event when the tab is closed/hidden (best-effort).
    try {
        window.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                track('session_pause', { events: _events.length });
            }
        });
        window.addEventListener('pagehide', sessionEnd);
    } catch (_) {}

    return { track, songStart, hit, streak, songComplete, sessionEnd, getEvents, getSessionSummary };
})();
