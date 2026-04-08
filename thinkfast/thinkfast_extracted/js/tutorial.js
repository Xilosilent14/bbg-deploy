// ===== FIRST-RACE TUTORIAL V5.7 =====
const Tutorial = {
    active: false,
    shownSteps: new Set(),
    overlay: null,
    _dismissTimer: null,

    steps: {
        lanes: { text: 'Tap ABOVE or BELOW to change lanes!', icon: '👆👇' },
        questions: { text: 'Answer correctly for a SPEED BOOST!', icon: '🧠💨' },
        obstacles: { text: 'Dodge obstacles by changing lanes!', icon: '⚠️' },
        powerups: { text: 'Collect power-ups for special abilities!', icon: '🛡️🧲❄️' }
    },

    isNeeded() {
        return !Progress.data.tutorialCompleted;
    },

    start() {
        if (!this.isNeeded()) return;
        this.active = true;
        this.shownSteps = new Set();
        this.overlay = document.getElementById('tutorial-overlay');
    },

    show(stepId) {
        if (!this.active || this.shownSteps.has(stepId)) return;
        const step = this.steps[stepId];
        if (!step || !this.overlay) return;

        this.shownSteps.add(stepId);
        if (this._dismissTimer) clearTimeout(this._dismissTimer);

        const stepNum = this.shownSteps.size;
        const totalSteps = Object.keys(this.steps).length;

        this.overlay.innerHTML = `
            <div class="tutorial-bubble" style="cursor:pointer">
                <div class="tutorial-icon">${step.icon}</div>
                <div class="tutorial-text">${step.text}</div>
                <div class="tutorial-hint">Tap to continue (${stepNum}/${totalSteps})</div>
                <button class="tutorial-skip" onclick="Tutorial.complete()">Skip Tutorial</button>
            </div>
        `;
        this.overlay.style.display = 'flex';

        // Tap to dismiss
        const bubble = this.overlay.querySelector('.tutorial-bubble');
        if (bubble) {
            bubble.addEventListener('click', (e) => {
                if (e.target.classList.contains('tutorial-skip')) return;
                this._dismiss();
            }, { once: true });
        }

        // Auto-dismiss after 6s as fallback (longer for kids to read)
        this._dismissTimer = setTimeout(() => this._dismiss(), 6000);
    },

    _dismiss() {
        if (this._dismissTimer) clearTimeout(this._dismissTimer);
        if (this.overlay) this.overlay.style.display = 'none';
        if (this.shownSteps.size >= Object.keys(this.steps).length) {
            this.complete();
        }
    },

    complete() {
        this.active = false;
        Progress.data.tutorialCompleted = true;
        Progress.save();
        if (this.overlay) this.overlay.style.display = 'none';
    },

    stop() {
        this.active = false;
        if (this._dismissTimer) clearTimeout(this._dismissTimer);
        if (this.overlay) this.overlay.style.display = 'none';
    }
};
