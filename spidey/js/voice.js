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
    }

    function _findVoice() {
        if (!synth) return;
        const voices = synth.getVoices();
        // Prefer a friendly English female voice
        const preferred = [
            'Google US English',
            'Samantha',
            'Microsoft Zira',
            'Google UK English Female',
            'Karen',
            'Moira'
        ];
        for (const name of preferred) {
            const v = voices.find(v => v.name.includes(name));
            if (v) { preferredVoice = v; return; }
        }
        // Fallback: any English voice
        preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
    }

    function speak(text, options = {}) {
        if (!enabled || !synth) return Promise.resolve();
        // Cancel any current speech
        synth.cancel();

        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(text);
            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.rate = options.rate || 0.85; // Slower for young kids
            utterance.pitch = options.pitch || 1.1; // Slightly higher, friendlier
            utterance.volume = options.volume || 1.0;
            utterance.onend = resolve;
            utterance.onerror = resolve;
            currentUtterance = utterance;
            synth.speak(utterance);
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
