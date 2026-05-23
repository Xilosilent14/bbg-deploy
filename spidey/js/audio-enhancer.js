/**
 * Audio Enhancer — adds a master compressor, voice-ducking, layered SFX,
 * and a seamless music loop to the existing Audio module.
 *
 * Tablet speakers (Fire HD) have weak dynamic range; a DynamicsCompressor
 * keeps things audible without clipping. Voice ducking lowers BGM whenever
 * a Voice.speak() fires so the kid actually hears the instruction.
 *
 * Loaded AFTER js/audio.js. Patches the existing Audio singleton in place
 * so other modules continue to call Audio.playCorrect() etc unchanged.
 */
(function () {
    'use strict';
    if (typeof Audio === 'undefined') return; // guard if load order breaks

    let _ctx = null;
    let _master = null;          // GainNode at the end of the chain
    let _compressor = null;
    let _bgm = null;             // <audio> element used by Audio.startMusic
    let _duckTimer = null;
    let _musicTarget = 0.15;

    function _ensure() {
        if (_master) return _master;
        try {
            _ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return null; }
        try {
            _compressor = _ctx.createDynamicsCompressor();
            _compressor.threshold.value = -24;
            _compressor.knee.value = 24;
            _compressor.ratio.value = 4;
            _compressor.attack.value = 0.005;
            _compressor.release.value = 0.18;
            _master = _ctx.createGain();
            _master.gain.value = 0.95;
            _compressor.connect(_master).connect(_ctx.destination);
        } catch (e) { return null; }
        return _master;
    }

    /**
     * Layered SFX: e.g. Spidey "thwip" = web-air + soft impact.
     * Plays a quick filtered noise + a low pop. Falls back silently.
     */
    function thwip() {
        const node = _ensure();
        if (!node || !_ctx) return;
        const now = _ctx.currentTime;
        try {
            // Air whoosh layer (filtered noise)
            const dur = 0.18;
            const buf = _ctx.createBuffer(1, Math.floor(_ctx.sampleRate * dur), _ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            }
            const src = _ctx.createBufferSource();
            src.buffer = buf;
            const filt = _ctx.createBiquadFilter();
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime(2500, now);
            filt.frequency.exponentialRampToValueAtTime(6000, now + dur);
            filt.Q.value = 1.2;
            const gn = _ctx.createGain();
            gn.gain.setValueAtTime(0.12, now);
            gn.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(filt).connect(gn).connect(_compressor);
            src.start(now);
            src.stop(now + dur);

            // Impact layer (low thump)
            const osc = _ctx.createOscillator();
            const og = _ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now + 0.04);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);
            og.gain.setValueAtTime(0.18, now + 0.04);
            og.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(og).connect(_compressor);
            osc.start(now + 0.04);
            osc.stop(now + 0.2);
        } catch (e) { /* swallow */ }
    }

    /**
     * Duck background music while voice plays.
     * Called from Voice.speak() (patched below) and any other narration.
     */
    function duckForVoice(durationMs) {
        try {
            if (typeof Audio._bgm === 'undefined') return;
        } catch (_) {}
        // Look up the bgm element from the Audio module by reference if available.
        // Audio module exposes only function refs, so we re-find the <audio> tag.
        const audios = document.querySelectorAll('audio');
        let bgm = null;
        for (const a of audios) {
            if (a.src && /bgm/.test(a.src)) { bgm = a; break; }
        }
        if (!bgm) return;
        _musicTarget = bgm.volume > 0.01 ? bgm.volume : 0.15;
        const duckTo = Math.max(0.03, _musicTarget * 0.25);
        try { bgm.volume = duckTo; } catch (_) {}
        if (_duckTimer) clearTimeout(_duckTimer);
        _duckTimer = setTimeout(() => {
            try { bgm.volume = _musicTarget; } catch (_) {}
            _duckTimer = null;
        }, Math.max(800, durationMs || 1500));
    }

    // ----- Patch Voice.speak to auto-duck -----
    if (typeof Voice !== 'undefined' && Voice.speak && !Voice._enhancerPatched) {
        const _origSpeak = Voice.speak.bind(Voice);
        Voice.speak = function (text) {
            try {
                const est = (typeof text === 'string') ? Math.max(900, text.length * 70) : 1500;
                duckForVoice(est);
            } catch (_) {}
            return _origSpeak(text);
        };
        Voice._enhancerPatched = true;
    }

    // Expose for callers
    window.AudioEnhancer = { thwip, duckForVoice, ensure: _ensure };
})();
