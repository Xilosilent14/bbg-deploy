/* ============================================
   CELEBRATION — Confetti & Particle Animations
   ============================================ */
const Celebration = (() => {
    let canvas = null, ctx = null;
    let particles = [];
    let animating = false;
    let animId = null;
    const MAX = 300;

    function setCanvas(canvasEl) {
        if (!canvasEl) return;
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth || 400;
        canvas.height = canvas.offsetHeight || 300;
    }

    function start(canvasEl) {
        setCanvas(canvasEl);
        confetti();
    }

    function confetti(duration = 3000) {
        if (!ctx) return;
        stop();
        particles = [];
        const colors = ['#e94560', '#ffd700', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#ff6b6b'];
        const w = canvas.width, h = canvas.height;
        const count = Math.min(200, MAX);

        for (let i = 0; i < count; i++) {
            particles.push({
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
        animate(duration);
    }

    function fireworks(duration = 4000) {
        if (!ctx) return;
        stop();
        particles = [];
        const w = canvas.width, h = canvas.height;
        const colors = ['#e94560', '#ffd700', '#2ecc71', '#3498db', '#f39c12'];
        const bursts = 3 + Math.floor(Math.random() * 3);

        for (let b = 0; b < bursts; b++) {
            setTimeout(() => {
                if (!animating) return;
                const cx = w * (0.2 + Math.random() * 0.6);
                const cy = h * (0.15 + Math.random() * 0.3);
                const color = colors[Math.floor(Math.random() * colors.length)];
                const avail = MAX - particles.length;
                const count = Math.min(40, avail);
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / 40) * i + Math.random() * 0.2;
                    const speed = 3 + Math.random() * 4;
                    particles.push({
                        x: cx, y: cy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color, size: 3 + Math.random() * 3,
                        life: 1, decay: 0.015 + Math.random() * 0.01,
                        gravity: 0.05, type: 'firework'
                    });
                }
                Audio.blockBreak();
            }, b * 600);
        }
        animate(duration);
    }

    function animate(duration) {
        if (animating) return;
        animating = true;
        const startTime = Date.now();

        const loop = () => {
            if (Date.now() - startTime > duration || !animating) {
                animating = false;
                animId = null;
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let len = particles.length;
            for (let i = len - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity || 0.15;
                if (p.rotation !== undefined) p.rotation += p.rotSpeed || 0;

                let remove = false;
                if (p.life !== undefined) {
                    p.life -= p.decay || 0.02;
                    if (p.life <= 0) remove = true;
                }
                if (p.y > canvas.height + 50) remove = true;

                if (remove) {
                    particles[i] = particles[len - 1];
                    len--;
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.life !== undefined ? p.life : 1;
                ctx.fillStyle = p.color;

                if (p.delay && p.delay > 0) {
                    p.delay--;
                    ctx.restore();
                    continue;
                }

                if (p.type === 'rainbow') {
                    const glow = 0.6 + Math.sin(p.sparkle * 10 + Date.now() * 0.005) * 0.4;
                    ctx.globalAlpha = (p.life || 1) * glow;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (p.life || 1), 0, Math.PI * 2);
                    ctx.fill();
                    // Add a sparkle dot
                    if (Math.random() < 0.3) {
                        ctx.fillStyle = '#fff';
                        ctx.globalAlpha = (p.life || 1) * 0.8;
                        ctx.beginPath();
                        ctx.arc(p.x + (Math.random() - 0.5) * 6, p.y + (Math.random() - 0.5) * 6, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (p.type === 'firework') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (p.life || 1), 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'rect') {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation || 0);
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            particles.length = len;
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
    }

    // Rainbow trail — burst of rainbow-colored arcs that sweep across the canvas
    function rainbow(duration = 3500) {
        if (!ctx) return;
        stop();
        particles = [];
        const w = canvas.width, h = canvas.height;
        const rainbowColors = ['#e94560', '#f39c12', '#ffd700', '#2ecc71', '#3498db', '#6c5ce7', '#9b59b6'];

        // Create rainbow arcs sweeping from left to right
        for (let wave = 0; wave < 3; wave++) {
            for (let c = 0; c < rainbowColors.length; c++) {
                const count = 12;
                for (let i = 0; i < count; i++) {
                    particles.push({
                        x: -20 - wave * 80,
                        y: (h * 0.15) + (c * h * 0.1) + (Math.random() - 0.5) * 10,
                        vx: 4 + Math.random() * 3 + wave * 0.5,
                        vy: (Math.random() - 0.5) * 2,
                        color: rainbowColors[c],
                        size: 5 + Math.random() * 4,
                        life: 1,
                        decay: 0.008 + Math.random() * 0.005,
                        gravity: 0,
                        type: 'rainbow',
                        delay: wave * 8 + i * 2 + c * 1,
                        sparkle: Math.random()
                    });
                }
            }
        }
        animate(duration);
    }

    function stop() {
        animating = false;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        particles = [];
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return { start, setCanvas, confetti, fireworks, rainbow, stop };
})();
