/**
 * Voice — Web Speech API wrapper for spoken instructions
 * All game instructions are spoken aloud since the player can't read yet.
 */
const Voice = (() => {
    let synth = null;
    let currentUtterance = null;
    let enabled = true;
    let voiceReady = false;
    let preferredVoice = null;

    let _warmedUp = false;

    function init() {
        synth = window.speechSynthesis;
        if (!synth) {
            console.warn('[Voice] SpeechSynthesis not available');
            enabled = false;
            return;
        }
        _findVoice();
        // Voices may load async
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = _findVoice;
        }
        voiceReady = true;

        // Warm up speech engine on first user interaction (required for Fire/Android)
        const warmUp = () => {
            if (_warmedUp || !synth) return;
            _warmedUp = true;
            synth.cancel();
            try {
                const u = new SpeechSynthesisUtterance(' ');
                u.volume = 0.01;
                u.rate = 5;
                synth.speak(u);
            } catch (e) { /* ignore */ }
            // Re-check voices after warm-up (Android may load them late)
            setTimeout(() => { if (!preferredVoice) _findVoice(); }, 500);
        };
        document.addEventListener('click', warmUp, { once: true });
        document.addEventListener('touchstart', warmUp, { once: true });
    }

    function _findVoice() {
        if (!synth) return;
        const voices = synth.getVoices();
        // Prefer a friendly English female voice
        // Includes Android/Fire tablet voices for Silk browser
        const en = voices.filter(v => /^en[-_]/i.test(v.lang));
        const preferred = [
            'Google US English',
            'Samantha',
            'Microsoft Zira',
            'Microsoft Aria',
            'Microsoft Jenny',
            'en-us-x-sfg-local',        // Android/Fire female (high quality)
            'en-us-x-tpd-local',        // Android/Fire female (alt)
            'en-us-x-sfg-network',      // Android/Fire female (network)
            'English United States',    // Android/Silk generic
            'Google UK English Female',
            'Karen',
            'Moira'
        ];
        for (const name of preferred) {
            const v = en.find(v => v.name.includes(name));
            if (v) { preferredVoice = v; return; }
        }
        // Fallback: prefer local English voice (lower latency on tablets)
        preferredVoice = en.find(v => v.localService) || en[0] || voices[0] || null;
    }

    function speak(text, options = {}) {
        if (!enabled) return Promise.resolve();

        // Use Google Cloud TTS (works on Silk tablets)
        if (typeof CloudTTS !== 'undefined') {
            return CloudTTS.speakSpidey(text, { onEnd: options.onEnd });
        }

        // Legacy speechSynthesis fallback
        if (!synth) return Promise.resolve();
        synth.cancel();

        return new Promise(resolve => {
            let resolved = false;
            const done = () => { if (resolved) return; resolved = true; clearTimeout(timeout); resolve(); };

            const utterance = new SpeechSynthesisUtterance(text);
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = options.rate || 0.85;   // Slower for young kids
            utterance.pitch = options.pitch || 1.05;  // Slightly higher, friendlier (reduced for Silk)
            utterance.volume = options.volume || 1.0;
            utterance.onend = done;
            utterance.onerror = done;
            currentUtterance = utterance;
            synth.speak(utterance);

            // Retry if speech engine fails to start (common on Fire/Android)
            setTimeout(() => {
                if (!resolved && synth && !synth.speaking && !synth.pending) {
                    try { synth.speak(utterance); } catch (e) { /* ignore */ }
                }
            }, 250);

            // Timeout fallback (Silk can hang on speechSynthesis)
            const timeout = setTimeout(done, 8000);
        });
    }

    function stop() {
        if (synth) synth.cancel();
    }

    function toggle(on) {
        enabled = on;
        if (!on) stop();
    }

    return { init, speak, stop, toggle, get enabled() { return enabled; } };
})();
