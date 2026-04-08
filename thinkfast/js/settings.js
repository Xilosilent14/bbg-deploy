// ===== SETTINGS MANAGER V4 =====
const Settings = {
    STORAGE_KEY: 'corvette-racer-settings',

    defaults() {
        return {
            sound: true,
            music: true,
            voice: true,
            contrast: false,
            tilt: false
        };
    },

    data: null,

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.data = { ...this.defaults(), ...JSON.parse(saved) };
            } else {
                this.data = this.defaults();
            }
        } catch (e) {
            this.data = this.defaults();
        }
        return this.data;
    },

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) { /* ignore */ }
    },

    get(key) {
        if (!this.data) this.load();
        return this.data[key];
    },

    set(key, val) {
        if (!this.data) this.load();
        this.data[key] = val;
        this.save();
    },

    toggle(key) {
        this.set(key, !this.get(key));
        return this.get(key);
    },

    // V18: Reduced motion detection for Canvas animations
    prefersReducedMotion: false,
    _initMotionPref() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.prefersReducedMotion = mq.matches;
            mq.addEventListener('change', (e) => { this.prefersReducedMotion = e.matches; });
        }
    }
};

Settings.load();
Settings._initMotionPref();
