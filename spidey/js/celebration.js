/**
 * Celebration — Particle effects and visual celebrations
 * Sparkles, confetti, and big celebrations for correct answers.
 */
const Celebration = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animating = false;
    let rafId = null;

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        _resize();
        window.addEventListener('resize', _resize);
    }

    function _resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Small sparkle burst at a point (for correct answers)
    function sparkle(x, y, count = 12) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#E056A0'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 2 + Math.random() * 3;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                type: 'circle',
                gravity: 0.05
            });
        }
        _startAnim();
    }

    // Big confetti for round completion
    function confetti(duration = 2500) {
        const colors = ['#e23636', '#2196F3', '#FFD700', '#4CAF50', '#FF9800', '#9C27B0'];
        const count = 80;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 3,
                vy: 1 + Math.random() * 3,
                size: 6 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.004,
                type: Math.random() > 0.5 ? 'rect' : 'circle',
                gravity: 0.02,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
        _startAnim();
    }

    // Star burst for sticker earned
    function starBurst(x, y) {
        const colors = ['#FFD700', '#FFA500', '#FFEC8B', '#FFE4B5'];
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 3 + Math.random() * 5;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.015,
                type: 'star',
                gravity: 0.03
            });
        }
        _startAnim();
    }

    function _startAnim() {
        if (animating) return;
        animating = true;
        _animate();
    }

    function _animate() {
        if (!ctx || particles.length === 0) {
            animating = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= p.decay;
            if (p.rotation !== undefined) p.rotation += p.rotationSpeed;

            if (p.life <= 0 || p.y > canvas.height + 20) {
                particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'rect') {
                ctx.save();
                ctx.translate(p.x, p.y);
                if (p.rotation) ctx.rotate(p.rotation);
                const s = p.size * p.life;
                ctx.fillRect(-s / 2, -s / 2, s, s * 0.6);
                ctx.restore();
            } else if (p.type === 'star') {
                ctx.save();
                ctx.translate(p.x, p.y);
                const s = p.size * p.life;
                _drawStar(ctx, 0, 0, 5, s, s * 0.4);
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.globalAlpha = 1;
        rafId = requestAnimationFrame(_animate);
    }

    function _drawStar(ctx, cx, cy, spikes, outerR, innerR) {
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    function clear() {
        particles = [];
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (rafId) cancelAnimationFrame(rafId);
        animating = false;
    }

    return { init, sparkle, confetti, starBurst, clear };
})();
