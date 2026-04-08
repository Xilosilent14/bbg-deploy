// ===== CELEBRATION ANIMATIONS =====
const Celebration = {
    canvas: null,
    ctx: null,
    particles: [],
    animating: false,
    _animationId: null, // V17: Track RAF for clean cancellation
    _pendingTimeouts: [], // V36: Track firework timeouts for cleanup
    MAX_PARTICLES: 400, // V17: Prevent particle count explosion

    init() {
        this.canvas = document.getElementById('celebration-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
    },

    _resize() {
        if (!this.canvas) return;
        const w = this.canvas.offsetWidth;
        const h = this.canvas.offsetHeight;
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    },

    // Confetti burst
    confetti(duration = 3000) {
        if (Settings.prefersReducedMotion) return; // V18: Respect reduced motion
        this.init();
        this._resize();
        this.particles = [];

        const colors = ['#e94560', '#ffd700', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#ff6b6b'];
        const w = this.canvas.width;
        const h = this.canvas.height;

        // V17: Cap particle count
        const count = Math.min(250, this.MAX_PARTICLES);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: w / 2 + (Math.random() - 0.5) * 200,
                y: h / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: Math.random() * -12 - 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.3,
                gravity: 0.15 + Math.random() * 0.1,
                type: Math.random() < 0.5 ? 'rect' : 'circle'
            });
        }

        this._animate(duration);
    },

    // Fireworks
    fireworks(duration = 4000) {
        if (Settings.prefersReducedMotion) return; // V18: Respect reduced motion
        this.init();
        this._resize();
        this.particles = [];

        const w = this.canvas.width;
        const h = this.canvas.height;
        const colors = ['#e94560', '#ffd700', '#2ecc71', '#3498db', '#f39c12'];

        // Launch 3-5 fireworks at intervals
        // V36 fix: Track timeouts for cleanup
        this._pendingTimeouts.forEach(id => clearTimeout(id));
        this._pendingTimeouts = [];
        const numBursts = 3 + Math.floor(Math.random() * 3);
        for (let b = 0; b < numBursts; b++) {
            const delay = b * 600;
            const cx = w * (0.2 + Math.random() * 0.6);
            const cy = h * (0.15 + Math.random() * 0.3);
            const color = colors[Math.floor(Math.random() * colors.length)];

            const tid = setTimeout(() => {
                if (!this.animating) return; // V36: Skip if stopped
                // V17: Respect particle cap
                const available = this.MAX_PARTICLES - this.particles.length;
                const count = Math.min(40, available);
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / 40) * i + Math.random() * 0.2;
                    const speed = 3 + Math.random() * 4;
                    this.particles.push({
                        x: cx, y: cy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color,
                        size: 3 + Math.random() * 3,
                        life: 1,
                        decay: 0.015 + Math.random() * 0.01,
                        gravity: 0.05,
                        type: 'firework'
                    });
                }
                Audio.playBoom();
            }, delay);
            this._pendingTimeouts.push(tid);
        }

        this._animate(duration);
    },

    // Trophy animation (for 3-star results)
    trophy() {
        this.confetti(4000);
        Audio.playVictory();
    },

    _animate(duration) {
        if (this.animating) return;
        this.animating = true;
        const startTime = Date.now();

        const loop = () => {
            if (Date.now() - startTime > duration || !this.animating) {
                this.animating = false;
                this._animationId = null;
                if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // V17: Swap-and-pop instead of splice for O(1) removal
            let len = this.particles.length;
            for (let i = len - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity || 0.15;

                if (p.rotation !== undefined) p.rotation += p.rotSpeed || 0;

                let remove = false;
                if (p.life !== undefined) {
                    p.life -= p.decay || 0.02;
                    if (p.life <= 0) remove = true;
                }
                if (p.y > this.canvas.height + 50) remove = true;

                if (remove) {
                    this.particles[i] = this.particles[len - 1];
                    len--;
                    continue;
                }

                this.ctx.save();
                this.ctx.globalAlpha = p.life !== undefined ? p.life : 1;
                this.ctx.fillStyle = p.color;

                if (p.type === 'firework') {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size * (p.life || 1), 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (p.type === 'rect') {
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rotation || 0);
                    this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }
            this.particles.length = len; // V17: Trim array once

            this._animationId = requestAnimationFrame(loop);
        };

        this._animationId = requestAnimationFrame(loop);
    },

    stop() {
        this.animating = false;
        // V17: Cancel scheduled RAF to prevent flicker
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }
        // V36: Clear pending firework timeouts
        this._pendingTimeouts.forEach(id => clearTimeout(id));
        this._pendingTimeouts = [];
        this.particles = [];
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
