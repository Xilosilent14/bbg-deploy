// ===== GAME RENDERER — Visual rendering methods for the racing engine =====
// Extracted from game.js for modularity. Mixed into Game via Object.assign.
const GameRenderer = {
    _drawRainParticles() {
        const ctx = this.ctx;
        // V36 fix: Wrap in save/restore to prevent strokeStyle/lineWidth leaking
        ctx.save();
        ctx.strokeStyle = 'rgba(180,200,255,0.5)';
        ctx.lineWidth = 1;
        this.rainParticles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
            ctx.stroke();
        });
        ctx.restore();
    },

    _drawWeatherEffects() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const weather = (this.tracks[this.trackIndex] || this.tracks[0]).weather;

        if (weather === 'sunset') {
            ctx.fillStyle = 'rgba(255, 140, 50, 0.08)';
            ctx.fillRect(0, 0, w, h);
            const sunX = w * 0.75;
            const sunY = h * 0.3;
            const grad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 60);
            grad.addColorStop(0, 'rgba(255,200,50,0.4)');
            grad.addColorStop(1, 'rgba(255,100,50,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(sunX - 60, sunY - 60, 120, 120);
        } else if (weather === 'rain') {
            ctx.fillStyle = 'rgba(0,0,30,0.1)';
            ctx.fillRect(0, 0, w, h);
        } else if (weather === 'neon') {
            ctx.save();
            // V36 fix: Calculate headlight position from actual car width (respects big_car/tiny_car mods)
            let carW = 75;
            if (typeof Progress !== 'undefined' && Progress.isModActive) {
                if (Progress.isModActive('big_car')) carW = Math.round(75 * 1.5);
                else if (Progress.isModActive('tiny_car')) carW = Math.round(75 * 0.6);
            }
            const hx = this.playerX + Math.round(carW * 0.55);
            const hy = this.playerY + this.suspensionOffset;
            const grad = ctx.createRadialGradient(hx, hy, 5, hx + 80, hy, 120);
            grad.addColorStop(0, 'rgba(255,255,200,0.15)');
            grad.addColorStop(1, 'rgba(255,255,200,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(hx, hy - 5);
            ctx.lineTo(hx + 160, hy - 40);
            ctx.lineTo(hx + 160, hy + 40);
            ctx.lineTo(hx, hy + 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    },

    _drawFinishLine() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const roadTop = this.roadY - 65;
        const roadHeight = 130;

        // V35: Finish line scrolls as a world-position object so the car drives through it
        const flagX = this._finishWorldX != null
            ? this.playerX + (this._finishWorldX - this.scrollX)
            : w * 0.65; // fallback

        // V25: Checkered flag strip across road surface
        const checkerSize = 14;
        ctx.save();
        ctx.globalAlpha = 0.7;
        for (let row = 0; row < Math.ceil(roadHeight / checkerSize); row++) {
            for (let col = 0; col < 4; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#000' : '#fff';
                ctx.fillRect(flagX + col * checkerSize, roadTop + row * checkerSize, checkerSize, checkerSize);
            }
        }
        ctx.restore();

        // V25: Waving flag pole on the side
        const poleX = flagX - 5;
        ctx.fillStyle = '#666';
        ctx.fillRect(poleX, roadTop - 40, 3, 50);
        const flagW = 28, flagH = 18;
        const wave = Math.sin(Date.now() * 0.006) * 3;
        ctx.fillStyle = '#000';
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                ctx.fillStyle = (r + c) % 2 === 0 ? '#000' : '#fff';
                ctx.fillRect(poleX + 3 + c * 7, roadTop - 40 + r * 6 + wave * (c / 4), 7, 6);
            }
        }

        // V25: Enhanced FINISH text with glow and pulse
        // V35: Fixed progress divisor to match actual finishTimer (60, not 90)
        const progress = 1 - (this.finishTimer / 60);
        const scale = 0.5 + progress * 1.5;
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.05;
        ctx.save();
        ctx.translate(w / 2, h / 2 - 40);
        ctx.scale(scale * pulse, scale * pulse);
        // Glow effect
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.008) * 10;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText('🏁 FINISH! 🏁', 0, 0);
        ctx.fillText('🏁 FINISH! 🏁', 0, 0);
        ctx.restore();

        // V25: Crowd cheering emoji particles above the road
        if (!this._finishParticles) this._finishParticles = [];
        if (this.finishTimer > 20 && this._finishParticles.length < 30) {
            const emojis = ['🎉', '🎊', '👏', '🙌', '⭐', '🏆'];
            this._finishParticles.push({
                x: Math.random() * w,
                y: roadTop - 10 - Math.random() * 30,
                vy: -0.5 - Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 1,
                life: 60,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                size: 12 + Math.random() * 8
            });
        }
        // V36 fix: Swap-and-pop instead of splice for O(1) removal (consistency with V33 pattern)
        ctx.save();
        let fpLen = this._finishParticles.length;
        for (let i = fpLen - 1; i >= 0; i--) {
            const p = this._finishParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) { this._finishParticles[i] = this._finishParticles[fpLen - 1]; fpLen--; continue; }
            ctx.globalAlpha = Math.min(1, p.life / 20);
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(p.emoji, p.x, p.y);
        }
        this._finishParticles.length = fpLen;
        ctx.restore();
    },

    _drawParticles(arr) {
        if (arr.length === 0) return;
        const ctx = this.ctx;
        ctx.save();
        let lastColor = '';
        let lastAlpha = -1;
        for (let i = 0; i < arr.length; i++) {
            const p = arr[i];
            const alpha = Math.round(p.life * 20) / 20; // quantize alpha
            if (p.color !== lastColor) { ctx.fillStyle = p.color; lastColor = p.color; }
            if (alpha !== lastAlpha) { ctx.globalAlpha = alpha; lastAlpha = alpha; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    },

    _drawBackground() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const theme = this.tracks[this.trackIndex] || this.tracks[0];
        const horizonY = h * 0.42;

        // V25: Day-to-dusk sky transition — sky color shifts as race progresses
        const raceProgress = Math.min(1, this.scrollX / this.trackLength);
        let skyTop = theme.sky;
        let skyMid = theme.bg;
        const weather = theme.weather;
        if (weather === 'clear' || weather === 'sunset') {
            // Blend toward warm dusk tones in the last 40% of the race
            const duskT = Math.max(0, (raceProgress - 0.6) / 0.4);
            if (duskT > 0) {
                skyTop = this._lerpColor(theme.sky, '#1a1a3e', duskT * 0.4);
                skyMid = this._lerpColor(theme.bg, '#e67e22', duskT * 0.35);
            }
        }

        // Sky gradient — richer 4-stop
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, skyTop);
        skyGrad.addColorStop(0.5, skyMid);
        skyGrad.addColorStop(0.85, this._lightenRoad(skyMid, 15));
        skyGrad.addColorStop(1, this._lightenRoad(theme.ground, 30));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, horizonY + 10);

        // V15: Star field for night/neon tracks (drawn before celestial so stars are behind sun/moon)
        if (weather === 'neon') {
            if (!this._stars) this._generateStars();
            const now = Date.now();
            this._stars.forEach(star => {
                const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(now * 0.001 * star.speed + star.phase));
                ctx.globalAlpha = twinkle;
                ctx.fillStyle = '#fff';
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });
            ctx.globalAlpha = 1;
        }

        // Sun / Moon — positioned in upper sky
        this._drawCelestial(ctx, w, h, theme);

        // V15: God rays on sunset tracks
        if (weather === 'sunset') {
            const sunX = w * 0.8, sunY = h * 0.18;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const rayCount = 7;
            const now = Date.now();
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI + Math.sin(now * 0.0003) * 0.1;
                const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 280);
                grad.addColorStop(0, 'rgba(255,180,80,0.05)');
                grad.addColorStop(1, 'rgba(255,180,80,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(sunX, sunY);
                ctx.arc(sunX, sunY, 280, angle - 0.09, angle + 0.09);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }

        // Layer 1: Distant mountains — asymmetric peaks, very slow parallax
        const hillOffset0 = -(this.scrollX * 0.03) % 600;
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = theme.bg;
        for (let x = hillOffset0 - 400; x < w + 400; x += 600) {
            ctx.beginPath();
            ctx.moveTo(x, horizonY);
            ctx.bezierCurveTo(x + 80, h * 0.18, x + 200, h * 0.06, x + 320, h * 0.14);
            ctx.bezierCurveTo(x + 400, h * 0.10, x + 500, h * 0.20, x + 600, horizonY);
            ctx.fill();
        }

        // Layer 2: Mid hills — rolling varied shapes
        const hillOffset1 = -(this.scrollX * 0.08) % 420;
        ctx.globalAlpha = 0.4;
        const midColor = this._lightenRoad(theme.ground, 25);
        ctx.fillStyle = midColor;
        for (let x = hillOffset1 - 250; x < w + 300; x += 420) {
            ctx.beginPath();
            ctx.moveTo(x, horizonY);
            ctx.bezierCurveTo(x + 60, h * 0.28, x + 140, h * 0.16, x + 210, h * 0.22);
            ctx.quadraticCurveTo(x + 310, h * 0.14, x + 420, horizonY);
            ctx.fill();
        }

        // Layer 3: Near foothills — faster parallax, more opaque, varied
        const hillOffset2 = -(this.scrollX * 0.18) % 300;
        ctx.globalAlpha = 0.6;
        const nearColor = this._lightenRoad(theme.ground, 12);
        ctx.fillStyle = nearColor;
        for (let x = hillOffset2 - 200; x < w + 250; x += 300) {
            ctx.beginPath();
            ctx.moveTo(x, horizonY);
            ctx.bezierCurveTo(x + 50, h * 0.34, x + 120, h * 0.26, x + 180, h * 0.32);
            ctx.quadraticCurveTo(x + 240, h * 0.28, x + 300, horizonY);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Ground fill
        ctx.fillStyle = theme.ground;
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // Ground variation — subtle patches of lighter/darker ground
        const patchOffset = -(this.scrollX * 0.35) % 180;
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#fff';
        for (let px = patchOffset - 90; px < w + 90; px += 180) {
            ctx.beginPath();
            ctx.ellipse(px, horizonY + 50, 60, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        const patchOffset2 = -(this.scrollX * 0.5) % 140;
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.04;
        for (let px = patchOffset2 - 70; px < w + 70; px += 140) {
            ctx.beginPath();
            ctx.ellipse(px, horizonY + 100, 45, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Ground texture — scrolling horizontal stripes
        const stripeOffset = -(this.scrollX * 0.4) % 12;
        ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#000';
        for (let sy = horizonY + 2; sy < h; sy += 12) {
            ctx.fillRect(0, sy + stripeOffset, w, 2);
        }
        ctx.globalAlpha = 1;

        // V15: Horizon glow — atmospheric haze at the horizon line
        const hGlowColor = weather === 'sunset' ? 'rgba(255,200,120,' :
                           weather === 'neon' ? 'rgba(80,60,160,' :
                           weather === 'rain' ? 'rgba(140,160,180,' :
                           'rgba(255,240,210,';
        const horizonGlow = ctx.createRadialGradient(w / 2, horizonY, 0, w / 2, horizonY, w * 0.6);
        horizonGlow.addColorStop(0, hGlowColor + '0.12)');
        horizonGlow.addColorStop(1, hGlowColor + '0)');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, horizonY - 50, w, 100);
    },

    // V5: Sun/Moon based on theme weather
    _drawCelestial(ctx, w, h, theme) {
        const weather = theme.weather;
        let cx, cy, radius, color, glowColor;

        if (weather === 'sunset') {
            cx = w * 0.8; cy = h * 0.18; radius = 28;
            color = '#f39c12'; glowColor = 'rgba(243,156,18,0.15)';
        } else if (weather === 'neon' || weather === 'rain') {
            cx = w * 0.75; cy = h * 0.12; radius = 18;
            color = '#ddd'; glowColor = 'rgba(200,210,255,0.08)';
        } else {
            cx = w * 0.82; cy = h * 0.14; radius = 22;
            color = '#fff3b0'; glowColor = 'rgba(255,243,176,0.12)';
        }

        // Glow rings
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Moon crescent for night/neon
        if (weather === 'neon') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(cx + radius * 0.35, cy - radius * 0.15, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();
    },

    // V5: Multi-puff clouds with theme awareness
    _drawClouds() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const theme = this.tracks[this.trackIndex] || this.tracks[0];

        // Cloud color based on theme
        let cloudColor = 'rgba(255,255,255,';
        if (theme.weather === 'sunset') cloudColor = 'rgba(255,220,180,';
        else if (theme.weather === 'neon') cloudColor = 'rgba(100,80,160,';
        else if (theme.weather === 'rain') cloudColor = 'rgba(160,170,180,';

        this.clouds.forEach(cloud => {
            cloud.x -= this.playerSpeed * cloud.speed;
            if (cloud.x + cloud.width < -80) {
                cloud.x = w + 80 + Math.random() * 300;
                cloud.y = 10 + Math.random() * 80;
            }

            ctx.save();

            // V15: Cloud self-shadow — darker bottom for volume feel
            ctx.fillStyle = 'rgba(0,0,0,' + (cloud.alpha * 0.08).toFixed(3) + ')';
            ctx.beginPath();
            ctx.ellipse(cloud.x + 3, cloud.y + 4, cloud.width * 0.48, cloud.height * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = cloudColor + (cloud.alpha * 0.9).toFixed(2) + ')';

            // Main body — wide flat ellipse
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.5, cloud.height * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();

            // Top puff left
            ctx.beginPath();
            ctx.ellipse(cloud.x - cloud.width * 0.18, cloud.y - cloud.height * 0.22, cloud.width * 0.28, cloud.height * 0.38, 0, 0, Math.PI * 2);
            ctx.fill();

            // Top puff right (larger)
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.15, cloud.y - cloud.height * 0.28, cloud.width * 0.32, cloud.height * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();

            // Small puff far right
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.35, cloud.y - cloud.height * 0.05, cloud.width * 0.18, cloud.height * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Highlight on top puffs
            ctx.fillStyle = cloudColor + (cloud.alpha * 0.3).toFixed(2) + ')';
            ctx.beginPath();
            ctx.ellipse(cloud.x + cloud.width * 0.1, cloud.y - cloud.height * 0.35, cloud.width * 0.2, cloud.height * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    },

    // V5: Canvas-drawn scenery
    _drawScenery() {
        const ctx = this.ctx;
        const roadTop = this.roadY - 65;
        const roadBottom = this.roadY + 65;
        const w = this.canvas.width;

        this.sceneryObjects.forEach(obj => {
            const screenX = this.playerX + (obj.worldX - this.scrollX) * 0.8;
            if (screenX < -60 || screenX > w + 60) return;
            // Above road: base just above road edge (trees grow up from here)
            // Below road: base far below road (trees grow up, tops near road edge)
            const baseY = obj.side < 0 ? roadTop - 4 : roadBottom + 55 * obj.scale;
            this._drawSceneryItem(ctx, obj.type, screenX, baseY, obj.side, obj.scale, obj.colorSeed);
        });
    },

    // Individual scenery item renderer
    // dir = away-from-road direction: -1 above road (upward), +1 below road (downward)
    _drawSceneryItem(ctx, type, x, baseY, side, scale, seed) {
        ctx.save();
        const s = scale;
        const dir = side < 0 ? -1 : 1; // offset direction from road
        const up = -1; // tall objects ALWAYS grow upward

        // V15: Drop shadow at base of tall scenery items
        const hasShadow = type !== 'post' && type !== 'tumbleweed' && type !== 'barrier' && type !== 'dune_grass';
        if (hasShadow) {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            const shadowW = (type.includes('building') || type === 'house' || type === 'factory' || type === 'barn') ? 14 * s : 10 * s;
            const shadowH = 3.5 * s;
            ctx.ellipse(x + 4, baseY + 1, shadowW, shadowH, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // V15: Tree sway animation — subtle wind effect on canopies
        const isTree = type === 'tree_deciduous' || type === 'pine_tree' || type === 'palm_tree' || type === 'cherry_tree';
        const swayAngle = isTree ? Math.sin(Date.now() * 0.0018 + x * 0.012 + seed * 6) * 0.03 : 0;

        switch (type) {
        case 'tree_deciduous': {
            // Trunk — always grows upward from base
            const trunkH = 22 * s;
            ctx.fillStyle = '#6b4226';
            ctx.fillRect(x - 2 * s, baseY - trunkH, 4 * s, trunkH);
            // V15: Apply sway to canopy
            ctx.translate(x, baseY - trunkH);
            ctx.rotate(swayAngle);
            ctx.translate(-x, -(baseY - trunkH));
            // Canopy — circles above trunk
            const canopyY = baseY - 28 * s;
            ctx.fillStyle = seed < 0.5 ? '#27ae60' : '#2ecc71';
            ctx.beginPath();
            ctx.arc(x, canopyY, 10 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = seed < 0.5 ? '#2ecc71' : '#27ae60';
            ctx.beginPath();
            ctx.arc(x + 4 * s, canopyY - 3 * s, 8 * s, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'pine_tree': {
            // Trunk — always grows upward
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(x - 2 * s, baseY - 18 * s, 4 * s, 18 * s);
            // V15: Apply sway to canopy
            ctx.translate(x, baseY - 14 * s);
            ctx.rotate(swayAngle);
            ctx.translate(-x, -(baseY - 14 * s));
            // Three triangle layers stacked upward
            const tipY = baseY - 38 * s;
            const midY = baseY - 24 * s;
            const lowY = baseY - 14 * s;
            ctx.fillStyle = '#1a5c2a';
            for (const [ty, bw] of [[tipY, 7], [midY, 9], [lowY, 11]]) {
                ctx.beginPath();
                ctx.moveTo(x, ty);           // tip points up
                ctx.lineTo(x - bw * s, ty + 12 * s); // base below
                ctx.lineTo(x + bw * s, ty + 12 * s);
                ctx.fill();
            }
            break;
        }
        case 'palm_tree': {
            // Curved trunk — always grows upward
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 3 * s;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.quadraticCurveTo(x + 6 * s, baseY - 18 * s, x + 2 * s, baseY - 32 * s);
            ctx.stroke();
            // V15: Apply sway to fronds
            const topX = x + 2 * s;
            const topY = baseY - 32 * s;
            ctx.translate(topX, topY);
            ctx.rotate(swayAngle * 1.5); // palms sway more
            ctx.translate(-topX, -topY);
            // Fronds at top
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 2 * s;
            for (let a = -2.5; a <= 0.5; a += 0.5) {
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.quadraticCurveTo(topX + Math.cos(a) * 16 * s, topY + Math.abs(Math.sin(a)) * 10 * s, topX + Math.cos(a) * 20 * s, topY + 4 * s);
                ctx.stroke();
            }
            break;
        }
        case 'bush':
        case 'bush_tropical': {
            const c = type === 'bush_tropical' ? '#2d8a4e' : '#3a7d44';
            const by = baseY + dir * 3 * s;
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.ellipse(x, by, 8 * s, 5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = seed < 0.5 ? '#4a9e5e' : '#2e7d32';
            ctx.beginPath();
            ctx.ellipse(x + 3 * s, by + dir * 2 * s, 5 * s, 4 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'house': {
            const hw = 14 * s, hh = 12 * s;
            // Wall: base at baseY, grows upward
            ctx.fillStyle = seed < 0.5 ? '#c0846a' : '#a0c4e8';
            ctx.fillRect(x - hw / 2, baseY - hh, hw, hh);
            // Roof triangle above the wall
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.moveTo(x - hw / 2 - 3 * s, baseY - hh);
            ctx.lineTo(x, baseY - hh - 8 * s);
            ctx.lineTo(x + hw / 2 + 3 * s, baseY - hh);
            ctx.fill();
            // Window
            ctx.fillStyle = '#ffe066';
            ctx.fillRect(x - 2 * s, baseY - hh + hh * 0.3, 4 * s, 4 * s);
            break;
        }
        case 'cactus': {
            // Main stem — always grows upward
            const stemH = 26 * s;
            ctx.fillStyle = '#2d6b2d';
            ctx.fillRect(x - 3 * s, baseY - stemH, 6 * s, stemH);
            // Left arm
            const armY = baseY - 16 * s;
            ctx.fillRect(x - 10 * s, armY - 8 * s, 7 * s, 8 * s);
            // Right arm (higher)
            ctx.fillRect(x + 3 * s, armY - 14 * s, 7 * s, 10 * s);
            break;
        }
        case 'cactus_small': {
            ctx.fillStyle = '#3d8b3d';
            const h = 14 * s;
            ctx.fillRect(x - 2 * s, baseY - h, 4 * s, h);
            break;
        }
        case 'rock': {
            // Rocks sit on the ground, slight bump upward
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(x - 6 * s, baseY);
            ctx.lineTo(x - 4 * s, baseY - 8 * s);
            ctx.lineTo(x + 5 * s, baseY - 6 * s);
            ctx.lineTo(x + 7 * s, baseY);
            ctx.fill();
            break;
        }
        case 'building':
        case 'building_tall': {
            const bh = (type === 'building_tall' ? 40 : 24) * s;
            const bw = 16 * s;
            const wy = baseY - bh;
            ctx.fillStyle = '#5a6a7a';
            ctx.fillRect(x - bw / 2, wy, bw, bh);
            // Windows — grid
            ctx.fillStyle = '#ffe066';
            const rows = type === 'building_tall' ? 5 : 3;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < 2; c++) {
                    const wy2 = wy + 4 * s + r * (bh / (rows + 1));
                    const wx = x - 4 * s + c * 6 * s;
                    if (seed + r * 0.1 + c * 0.2 < 0.7) {
                        ctx.fillRect(wx, wy2, 3 * s, 3 * s);
                    }
                }
            }
            break;
        }
        case 'building_neon': {
            const bh = (25 + seed * 20) * s;
            const bw = 14 * s;
            const wy = baseY - bh;
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(x - bw / 2, wy, bw, bh);
            // V15: Neon glow windows with additive blending
            const colors = ['#ff00ff', '#00ffff', '#ff6600', '#00ff66'];
            const neonColor = colors[Math.floor(seed * 4)];
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = neonColor;
            ctx.globalAlpha = 0.7;
            for (let r = 0; r < 3; r++) {
                ctx.fillRect(x - 4 * s, wy + 3 * s + r * 8 * s, 8 * s, 2 * s);
            }
            // Soft building-top glow
            ctx.globalAlpha = 0.08;
            ctx.beginPath();
            ctx.arc(x, wy, bw * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            break;
        }
        case 'lamp_post':
        case 'lamp_post_neon': {
            // Lamp posts always grow upward
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 28 * s);
            ctx.stroke();
            // Lamp head at top
            const lampColor = type === 'lamp_post_neon' ? '#00ffff' : '#ffe066';
            ctx.fillStyle = lampColor;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(x, baseY - 30 * s, 3 * s, 0, Math.PI * 2);
            ctx.fill();
            // V15: Additive blending glow for neon lamps
            if (type === 'lamp_post_neon') {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.2 + Math.sin(Date.now() * 0.004 + x) * 0.06;
            } else {
                ctx.globalAlpha = 0.15;
            }
            ctx.beginPath();
            ctx.arc(x, baseY - 30 * s, 10 * s, 0, Math.PI * 2);
            ctx.fill();
            // V15: Second glow ring for neon
            if (type === 'lamp_post_neon') {
                ctx.globalAlpha = 0.06;
                ctx.beginPath();
                ctx.arc(x, baseY - 30 * s, 18 * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
            ctx.globalAlpha = 1;
            break;
        }
        case 'fence_section': {
            // Fence posts grow upward
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 8 * s, baseY);
            ctx.lineTo(x - 8 * s, baseY - 10 * s);
            ctx.moveTo(x + 8 * s, baseY);
            ctx.lineTo(x + 8 * s, baseY - 10 * s);
            // Horizontal rail
            const railY = baseY - 7 * s;
            ctx.moveTo(x - 8 * s, railY);
            ctx.lineTo(x + 8 * s, railY);
            ctx.stroke();
            break;
        }
        case 'barrier': {
            const by = baseY + dir * 4 * s;
            ctx.fillStyle = '#d44';
            ctx.fillRect(x - 8 * s, by - 4 * s, 16 * s, 8 * s);
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - 6 * s, by - 2 * s, 4 * s, 4 * s);
            ctx.fillRect(x + 2 * s, by - 2 * s, 4 * s, 4 * s);
            break;
        }
        case 'umbrella': {
            // Pole grows upward, canopy at top
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 18 * s);
            ctx.stroke();
            ctx.fillStyle = seed < 0.5 ? '#e74c3c' : '#3498db';
            ctx.beginPath();
            ctx.arc(x, baseY - 18 * s, 10 * s, Math.PI, 0); // dome on top
            ctx.fill();
            break;
        }
        case 'banner': {
            // Pole grows upward
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 30 * s);
            ctx.stroke();
            ctx.fillStyle = '#e94560';
            ctx.fillRect(x, baseY - 30 * s, 12 * s, 10 * s);
            break;
        }
        case 'flag': {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 24 * s);
            ctx.stroke();
            // Checkered flag at top
            const fy = baseY - 24 * s;
            ctx.fillStyle = '#fff';
            ctx.fillRect(x, fy, 8 * s, 8 * s);
            ctx.fillStyle = '#000';
            ctx.fillRect(x, fy, 4 * s, 4 * s);
            ctx.fillRect(x + 4 * s, fy + 4 * s, 4 * s, 4 * s);
            break;
        }
        case 'sign': {
            // Sign post grows upward
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 20 * s);
            ctx.stroke();
            ctx.fillStyle = '#1a6b1a';
            ctx.fillRect(x - 8 * s, baseY - 20 * s, 16 * s, 6 * s);
            break;
        }
        case 'post': {
            // Simple fence post grows upward
            ctx.fillStyle = '#aaa';
            ctx.fillRect(x - 1, baseY - 6, 2, 6);
            ctx.fillStyle = '#f44';
            ctx.fillRect(x - 2, baseY - 7, 4, 2);
            break;
        }
        case 'tumbleweed': {
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(x, baseY, 5 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
        }
        // V40: Michigan-specific scenery types
        case 'factory': {
            // Main building body
            const fW = 18 * s, fH = 28 * s;
            ctx.fillStyle = '#5a5a6a';
            ctx.fillRect(x - fW / 2, baseY - fH, fW, fH);
            // Windows — 2×3 grid
            ctx.fillStyle = '#ffe066';
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 2; c++) {
                    if (seed + r * 0.15 + c * 0.25 < 0.8) {
                        ctx.fillRect(x - 5 * s + c * 7 * s, baseY - fH + 4 * s + r * 8 * s, 3 * s, 3 * s);
                    }
                }
            }
            // Smokestack chimney
            ctx.fillStyle = '#444';
            ctx.fillRect(x + fW / 2 - 4 * s, baseY - fH - 14 * s, 5 * s, fH + 14 * s);
            // Smoke puffs
            ctx.fillStyle = '#888';
            ctx.globalAlpha = 0.3;
            const smokeTime = Date.now() * 0.001 + seed * 10;
            for (let i = 0; i < 3; i++) {
                const sy = baseY - fH - 18 * s - i * 8 * s + Math.sin(smokeTime + i) * 2;
                const sx = x + fW / 2 - 1.5 * s + Math.sin(smokeTime * 0.7 + i * 2) * 3;
                ctx.beginPath();
                ctx.arc(sx, sy, (3 + i * 1.5) * s, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            // Door
            ctx.fillStyle = '#333';
            ctx.fillRect(x - 3 * s, baseY - 8 * s, 6 * s, 8 * s);
            break;
        }
        case 'cherry_tree': {
            // Trunk — reuse deciduous pattern
            const ctH = 22 * s;
            ctx.fillStyle = '#6b4226';
            ctx.fillRect(x - 2 * s, baseY - ctH, 4 * s, ctH);
            // Apply sway
            ctx.translate(x, baseY - ctH);
            ctx.rotate(swayAngle);
            ctx.translate(-x, -(baseY - ctH));
            // Pink blossom canopy
            const cY = baseY - 28 * s;
            ctx.fillStyle = '#ffb7c5';
            ctx.beginPath();
            ctx.arc(x, cY, 10 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff9bb5';
            ctx.beginPath();
            ctx.arc(x + 4 * s, cY - 3 * s, 8 * s, 0, Math.PI * 2);
            ctx.fill();
            // Cherry dots
            ctx.fillStyle = '#cc0022';
            for (let i = 0; i < 5; i++) {
                const cx2 = x + (Math.sin(seed * 20 + i * 1.8) * 8) * s;
                const cy2 = cY + (Math.cos(seed * 15 + i * 2.1) * 7) * s;
                ctx.beginPath();
                ctx.arc(cx2, cy2, 1.5 * s, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
        case 'dune_grass': {
            // Sandy mound
            ctx.fillStyle = '#e8c870';
            ctx.beginPath();
            ctx.moveTo(x - 12 * s, baseY);
            ctx.quadraticCurveTo(x - 4 * s, baseY - 10 * s, x, baseY - 12 * s);
            ctx.quadraticCurveTo(x + 4 * s, baseY - 10 * s, x + 12 * s, baseY);
            ctx.fill();
            // Grass tufts on top
            ctx.strokeStyle = '#5a8a3a';
            ctx.lineWidth = 1.5;
            for (let i = -2; i <= 2; i++) {
                const gx = x + i * 3 * s;
                const gy = baseY - 10 * s - Math.abs(i) * s;
                ctx.beginPath();
                ctx.moveTo(gx, gy);
                ctx.lineTo(gx + (i < 0 ? -3 : 3) * s, gy - 6 * s);
                ctx.stroke();
            }
            break;
        }
        case 'lighthouse': {
            // Base
            ctx.fillStyle = '#ddd';
            ctx.fillRect(x - 5 * s, baseY - 6 * s, 10 * s, 6 * s);
            // Tower with red/white stripes
            const ltH = 32 * s;
            const ltWBot = 6 * s, ltWTop = 3.5 * s;
            for (let stripe = 0; stripe < 4; stripe++) {
                const t0 = stripe / 4, t1 = (stripe + 1) / 4;
                const y0 = baseY - 6 * s - t0 * ltH, y1 = baseY - 6 * s - t1 * ltH;
                const w0 = ltWBot + (ltWTop - ltWBot) * t0;
                const w1 = ltWBot + (ltWTop - ltWBot) * t1;
                ctx.fillStyle = stripe % 2 === 0 ? '#fff' : '#cc3333';
                ctx.beginPath();
                ctx.moveTo(x - w0, y0);
                ctx.lineTo(x - w1, y1);
                ctx.lineTo(x + w1, y1);
                ctx.lineTo(x + w0, y0);
                ctx.fill();
            }
            // Light room
            ctx.fillStyle = '#333';
            ctx.fillRect(x - 3 * s, baseY - 6 * s - ltH - 3 * s, 6 * s, 3 * s);
            // Light glow
            ctx.fillStyle = '#ffe066';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, baseY - 6 * s - ltH - 1.5 * s, 2.5 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(x, baseY - 6 * s - ltH - 1.5 * s, 10 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            break;
        }
        case 'bridge_tower': {
            // Tower
            const btW = 6 * s, btH = 36 * s;
            ctx.fillStyle = '#447744';
            ctx.fillRect(x - btW / 2, baseY - btH, btW, btH);
            // Cross beam at 30% height
            ctx.fillRect(x - btW, baseY - btH * 0.7, btW * 2, 2 * s);
            // Cables going down from top
            ctx.strokeStyle = '#99bb99';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, baseY - btH);
            ctx.lineTo(x - 25 * s, baseY - 4 * s);
            ctx.moveTo(x, baseY - btH);
            ctx.lineTo(x + 25 * s, baseY - 4 * s);
            ctx.stroke();
            // Base
            ctx.fillStyle = '#336633';
            ctx.fillRect(x - btW, baseY - 3 * s, btW * 2, 3 * s);
            break;
        }
        case 'barn': {
            const bW = 18 * s, bH = 16 * s;
            // Wall
            ctx.fillStyle = '#cc3333';
            ctx.fillRect(x - bW / 2, baseY - bH, bW, bH);
            // Gambrel roof
            ctx.fillStyle = '#992222';
            ctx.beginPath();
            ctx.moveTo(x - bW / 2 - 2 * s, baseY - bH);
            ctx.lineTo(x - bW / 4, baseY - bH - 8 * s);
            ctx.lineTo(x, baseY - bH - 10 * s);
            ctx.lineTo(x + bW / 4, baseY - bH - 8 * s);
            ctx.lineTo(x + bW / 2 + 2 * s, baseY - bH);
            ctx.fill();
            // White door
            ctx.fillStyle = '#eee';
            ctx.fillRect(x - 3.5 * s, baseY - 10 * s, 7 * s, 10 * s);
            // X-brace on door
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 3 * s, baseY - 9 * s);
            ctx.lineTo(x + 3 * s, baseY - 1 * s);
            ctx.moveTo(x + 3 * s, baseY - 9 * s);
            ctx.lineTo(x - 3 * s, baseY - 1 * s);
            ctx.stroke();
            break;
        }
        }

        ctx.restore();
    },

    _drawRoad() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const theme = this.tracks[this.trackIndex] || this.tracks[0];
        const roadTop = this.roadY - 65;
        const roadHeight = 130;

        // Road surface with depth gradient — darker at edges, lighter center
        const roadGrad = ctx.createLinearGradient(0, roadTop, 0, roadTop + roadHeight);
        roadGrad.addColorStop(0, theme.road);
        roadGrad.addColorStop(0.15, this._lightenRoad(theme.road, 12));
        roadGrad.addColorStop(0.5, this._lightenRoad(theme.road, 18));
        roadGrad.addColorStop(0.85, this._lightenRoad(theme.road, 12));
        roadGrad.addColorStop(1, theme.road);
        ctx.fillStyle = roadGrad;
        ctx.fillRect(0, roadTop, w, roadHeight);

        // Asphalt grain texture — cached tile, scrolled via drawImage offset
        if (!this._grainCache || this._grainCache.h !== roadHeight) {
            const gc = document.createElement('canvas');
            gc.width = 256;
            gc.height = roadHeight;
            const gx = gc.getContext('2d');
            gx.fillStyle = 'rgba(255,255,255,0.025)';
            for (let i = 0; i < 60; i++) {
                const tx = (Math.sin(i * 7.3) * 0.5 + 0.5) * 256;
                const ty = (Math.cos(i * 13.7) * 0.5 + 0.5) * roadHeight;
                gx.fillRect(tx, ty, 2, 1);
            }
            gx.fillStyle = 'rgba(0,0,0,0.03)';
            for (let i = 0; i < 40; i++) {
                const tx = (Math.cos(i * 11.1) * 0.5 + 0.5) * 256;
                const ty = (Math.sin(i * 9.3) * 0.5 + 0.5) * roadHeight;
                gx.fillRect(tx, ty, 3, 1);
            }
            this._grainCache = { canvas: gc, h: roadHeight };
        }
        const grainOff = -(this.scrollX * 0.3) % 256;
        for (let gx = grainOff; gx < w; gx += 256) {
            ctx.drawImage(this._grainCache.canvas, gx, roadTop);
        }

        // V15: Faint tire tracks on road surface
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = '#000';
        const tireOff = -(this.scrollX) % 200;
        for (let tx = tireOff - 200; tx < w; tx += 200) {
            ctx.fillRect(tx, roadTop + 35, 50, 1.5);
            ctx.fillRect(tx, roadTop + 39, 50, 1.5);
            ctx.fillRect(tx + 70, roadTop + 85, 45, 1.5);
            ctx.fillRect(tx + 70, roadTop + 89, 45, 1.5);
        }
        // V15: Subtle road patches
        ctx.globalAlpha = 0.025;
        const patchRoadOff = -(this.scrollX * 0.6) % 400;
        for (let px = patchRoadOff - 200; px < w; px += 400) {
            ctx.fillRect(px + 50, roadTop + 20, 35, 25);
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(px + 200, roadTop + 60, 40, 20);
            ctx.fillStyle = '#000';
        }
        ctx.globalAlpha = 1;

        // Road shoulder/curb strips — gravel between road and grass
        ctx.fillStyle = 'rgba(150,140,120,0.3)';
        ctx.fillRect(0, roadTop - 6, w, 6);                  // Top shoulder
        ctx.fillRect(0, roadTop + roadHeight, w, 6);          // Bottom shoulder

        // Rumble strips — animated edge markers
        const stripOffset = -(this.scrollX * 2) % 20;
        if (theme.weather === 'neon') {
            // V15: Additive blending for neon glow rumble strips
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const neonColors = ['#ff00ff', '#00ffff'];
            for (let x = stripOffset; x < w; x += 20) {
                ctx.fillStyle = neonColors[Math.floor(x / 10) % 2];
                ctx.fillRect(x, roadTop, 10, 4);
                ctx.fillRect(x, roadTop + roadHeight - 4, 10, 4);
            }
            // Neon glow haze along edges
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, roadTop - 2, w, 8);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(0, roadTop + roadHeight - 6, w, 8);
            ctx.restore();
        } else {
            // Red and white alternating rumble strips
            for (let x = stripOffset; x < w; x += 20) {
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x, roadTop, 10, 4);
                ctx.fillRect(x, roadTop + roadHeight - 4, 10, 4);
                ctx.fillStyle = '#ddd';
                ctx.fillRect(x + 10, roadTop, 10, 4);
                ctx.fillRect(x + 10, roadTop + roadHeight - 4, 10, 4);
            }
        }

        // Road edge lines — white borders
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, roadTop + 4, w, 2);
        ctx.fillRect(0, roadTop + roadHeight - 6, w, 2);

        // V25: Draw bridges and tunnels at set points along the track
        if (this._bridgePositions) {
            this._bridgePositions.forEach(bp => {
                const screenX = this.playerX + (bp.worldX - this.scrollX);
                const bridgeW = 250;
                if (screenX > -bridgeW && screenX < w + bridgeW) {
                    if (bp.type === 'bridge') {
                        // Bridge — darker road stripe with railing lines
                        ctx.save();
                        ctx.fillStyle = 'rgba(0,0,0,0.12)';
                        ctx.fillRect(screenX, roadTop, bridgeW, roadHeight);
                        // Metal railings on both sides
                        ctx.strokeStyle = '#888';
                        ctx.lineWidth = 2;
                        // Top railing
                        ctx.beginPath();
                        ctx.moveTo(screenX, roadTop - 2);
                        ctx.lineTo(screenX + bridgeW, roadTop - 2);
                        ctx.stroke();
                        // Bottom railing
                        ctx.beginPath();
                        ctx.moveTo(screenX, roadTop + roadHeight + 2);
                        ctx.lineTo(screenX + bridgeW, roadTop + roadHeight + 2);
                        ctx.stroke();
                        // Railing posts
                        ctx.fillStyle = '#777';
                        for (let px = screenX; px < screenX + bridgeW; px += 30) {
                            ctx.fillRect(px, roadTop - 8, 3, 8);
                            ctx.fillRect(px, roadTop + roadHeight, 3, 8);
                        }
                        // Bridge girder pattern underneath
                        ctx.strokeStyle = 'rgba(100,100,100,0.2)';
                        ctx.lineWidth = 1;
                        for (let px = screenX; px < screenX + bridgeW; px += 50) {
                            ctx.beginPath();
                            ctx.moveTo(px, roadTop);
                            ctx.lineTo(px + 25, roadTop + roadHeight);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(px + 25, roadTop);
                            ctx.lineTo(px, roadTop + roadHeight);
                            ctx.stroke();
                        }
                        ctx.restore();
                    } else if (bp.type === 'tunnel') {
                        // Tunnel — dark arch overlay
                        const tunnelW = 200;
                        ctx.save();
                        // Tunnel darkness
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(screenX, roadTop - 20, tunnelW, roadHeight + 40);
                        // Tunnel arch top
                        ctx.fillStyle = '#333';
                        ctx.beginPath();
                        ctx.moveTo(screenX, roadTop - 20);
                        ctx.quadraticCurveTo(screenX + tunnelW / 2, roadTop - 55, screenX + tunnelW, roadTop - 20);
                        ctx.lineTo(screenX + tunnelW, roadTop - 10);
                        ctx.lineTo(screenX, roadTop - 10);
                        ctx.closePath();
                        ctx.fill();
                        // Tunnel entrance/exit highlight
                        const entryGrad = ctx.createLinearGradient(screenX, 0, screenX + 25, 0);
                        entryGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
                        entryGrad.addColorStop(1, 'rgba(0,0,0,0)');
                        ctx.fillStyle = entryGrad;
                        ctx.fillRect(screenX, roadTop - 20, 25, roadHeight + 40);
                        const exitGrad = ctx.createLinearGradient(screenX + tunnelW - 25, 0, screenX + tunnelW, 0);
                        exitGrad.addColorStop(0, 'rgba(0,0,0,0)');
                        exitGrad.addColorStop(1, 'rgba(255,255,255,0.08)');
                        ctx.fillStyle = exitGrad;
                        ctx.fillRect(screenX + tunnelW - 25, roadTop - 20, 25, roadHeight + 40);
                        // Tunnel wall on bottom
                        ctx.fillStyle = '#333';
                        ctx.fillRect(screenX, roadTop + roadHeight, tunnelW, 20);
                        ctx.restore();
                    }
                }
            });
        }
    },

    // V25: Lerp between two hex colors (t = 0..1)
    _lerpColor(hex1, hex2, t) {
        const parse = (h) => {
            h = h.replace('#', '');
            if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
            return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
        };
        const [r1,g1,b1] = parse(hex1);
        const [r2,g2,b2] = parse(hex2);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return '#' + [r,g,b].map(c => Math.max(0,Math.min(255,c)).toString(16).padStart(2,'0')).join('');
    },

    // V25: Draw birds flying across the sky
    _drawBirds() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const horizonY = h * 0.42;
        const theme = this.tracks[this.trackIndex] || this.tracks[0];

        // Skip birds on neon/night tracks
        if (theme.weather === 'neon') return;

        // Initialize bird flock on first call
        if (!this._birds) {
            this._birds = [];
            for (let i = 0; i < 4; i++) {
                this._birds.push({
                    x: Math.random() * w * 2,
                    y: 15 + Math.random() * (horizonY * 0.5),
                    speed: 0.6 + Math.random() * 1.2,
                    wingPhase: Math.random() * Math.PI * 2,
                    size: 3 + Math.random() * 3
                });
            }
        }

        const birdColor = theme.weather === 'sunset' ? '#2c1810' :
                          theme.weather === 'rain' ? '#334' : '#333';
        ctx.strokeStyle = birdColor;
        ctx.lineWidth = 1.5;

        const now = Date.now();
        this._birds.forEach(bird => {
            // Move bird left (parallax with player speed)
            bird.x -= this.playerSpeed * bird.speed * 0.3;
            // Respawn off right side
            if (bird.x < -30) {
                bird.x = w + 20 + Math.random() * 200;
                bird.y = 15 + Math.random() * (horizonY * 0.5);
            }
            // Wing flap animation
            const wingAngle = Math.sin(now * 0.008 + bird.wingPhase) * 0.4;
            const s = bird.size;
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            // Left wing
            ctx.moveTo(bird.x - s * 2, bird.y - s * wingAngle);
            ctx.quadraticCurveTo(bird.x - s, bird.y - s * 0.5 * wingAngle, bird.x, bird.y);
            // Right wing
            ctx.quadraticCurveTo(bird.x + s, bird.y - s * 0.5 * wingAngle, bird.x + s * 2, bird.y - s * wingAngle);
            ctx.stroke();
            ctx.restore();
        });
    },

    // Helper for road gradient
    _lightenRoad(hex, pct) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const f = pct / 100;
        return '#' + [r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f]
            .map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
    },

    _drawRoadMarkings() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const markOffset = -(this.scrollX * 1) % 80;

        ctx.setLineDash([30, 50]);
        ctx.lineDashOffset = markOffset;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, this.laneYs[0] + this.laneHeight / 2);
        ctx.lineTo(w, this.laneYs[0] + this.laneHeight / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, this.laneYs[1] + this.laneHeight / 2);
        ctx.lineTo(w, this.laneYs[1] + this.laneHeight / 2);
        ctx.stroke();

        ctx.setLineDash([]);
    },

    _drawObstacles() {
        const ctx = this.ctx;
        const w = this.canvas.width;

        this.obstacles.forEach(obs => {
            const screenX = this.playerX + (obs.worldX - this.scrollX);
            const y = this.laneYs[obs.lane];

            // Warning indicator for approaching obstacles (off-screen right)
            if (!obs.hit && screenX > w && screenX < w + 200) {
                const warningAlpha = 0.4 + Math.sin(Date.now() * 0.01) * 0.3;
                ctx.save();
                ctx.globalAlpha = warningAlpha;
                ctx.fillStyle = '#e74c3c';
                // Warning triangle
                ctx.beginPath();
                ctx.moveTo(w - 20, y - 10);
                ctx.lineTo(w - 10, y + 8);
                ctx.lineTo(w - 30, y + 8);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('!', w - 20, y + 1);
                // Arrow
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(w - 5, y - 5);
                ctx.lineTo(w, y);
                ctx.lineTo(w - 5, y + 5);
                ctx.fill();
                ctx.restore();
            }

            if (screenX < -50 || screenX > w + 50) return;

            // V36 fix: Use save/restore for hit alpha to prevent leaks on early returns
            if (obs.hit) { ctx.save(); ctx.globalAlpha = 0.3; }

            // Canvas-drawn obstacles
            if (obs.type === 'cone') {
                // Orange traffic cone
                ctx.fillStyle = '#ff6b00';
                ctx.beginPath();
                ctx.moveTo(screenX, y - 12);
                ctx.lineTo(screenX + 8, y + 6);
                ctx.lineTo(screenX - 8, y + 6);
                ctx.closePath();
                ctx.fill();
                // White stripes
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(screenX - 4, y);
                ctx.lineTo(screenX + 4, y);
                ctx.stroke();
                // Base
                ctx.fillStyle = '#cc5500';
                ctx.fillRect(screenX - 9, y + 6, 18, 4);
            } else if (obs.type === 'puddle') {
                // Blue water puddle (ellipse)
                ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
                ctx.beginPath();
                ctx.ellipse(screenX, y + 2, 14, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Highlight
                ctx.fillStyle = 'rgba(150, 220, 255, 0.5)';
                ctx.beginPath();
                ctx.ellipse(screenX - 3, y, 5, 3, -0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'oil') {
                // Brown barrel/oil drum
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(screenX - 7, y - 10, 14, 20);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(screenX - 7, y - 5);
                ctx.lineTo(screenX + 7, y - 5);
                ctx.moveTo(screenX - 7, y + 5);
                ctx.lineTo(screenX + 7, y + 5);
                ctx.stroke();
                ctx.fillStyle = '#a0522d';
                ctx.beginPath();
                ctx.ellipse(screenX, y - 10, 7, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'rock') {
                // Gray boulder
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.ellipse(screenX, y, 10, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#aaa';
                ctx.beginPath();
                ctx.ellipse(screenX - 2, y - 3, 5, 3, -0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'log') {
                // Brown log
                ctx.fillStyle = '#6b4226';
                ctx.fillRect(screenX - 14, y - 4, 28, 8);
                ctx.fillStyle = '#5a3520';
                ctx.beginPath();
                ctx.arc(screenX - 14, y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8b6240';
                ctx.beginPath();
                ctx.arc(screenX + 14, y, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'crab') {
                // Red crab
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.ellipse(screenX, y, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Claws
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX - 10, y - 3, 4, 0, Math.PI, true);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(screenX + 10, y - 3, 4, 0, Math.PI, true);
                ctx.stroke();
            } else if (obs.type === 'sandpile') {
                // Sandy mound
                ctx.fillStyle = '#d4a437';
                ctx.beginPath();
                ctx.moveTo(screenX - 12, y + 6);
                ctx.quadraticCurveTo(screenX, y - 10, screenX + 12, y + 6);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#c49530';
                ctx.beginPath();
                ctx.ellipse(screenX, y + 5, 12, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (obs.type === 'tumbleweed') {
                // Brown tumbleweed with bouncing animation
                const bounce = Math.sin(Date.now() * 0.008 + screenX) * 4;
                ctx.fillStyle = '#a0763a';
                ctx.beginPath();
                ctx.arc(screenX, y - 2 + bounce, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#7a5a2a';
                ctx.lineWidth = 1;
                for (let t = 0; t < 4; t++) {
                    ctx.beginPath();
                    ctx.arc(screenX, y - 2 + bounce, 5 + t, t * 0.8, t * 0.8 + 1.5);
                    ctx.stroke();
                }
            } else if (obs.type === 'trashcan') {
                // Metal trash can
                ctx.fillStyle = '#777';
                ctx.fillRect(screenX - 6, y - 8, 12, 16);
                ctx.fillStyle = '#999';
                ctx.fillRect(screenX - 7, y - 10, 14, 4);
                ctx.fillStyle = '#555';
                ctx.fillRect(screenX - 3, y - 2, 6, 2);
            } else if (obs.type === 'neon_sign') {
                // Fallen neon sign with glow
                const glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
                ctx.save();
                ctx.shadowColor = '#ff00ff';
                ctx.shadowBlur = 8 * glow;
                ctx.fillStyle = `rgba(255,0,255,${0.5 * glow})`;
                ctx.fillRect(screenX - 12, y - 5, 24, 10);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 8px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('BAR', screenX, y);
                ctx.restore();
            } else {
                // Fallback: generic cone
                ctx.fillStyle = '#ff6b00';
                ctx.beginPath();
                ctx.moveTo(screenX, y - 12);
                ctx.lineTo(screenX + 8, y + 6);
                ctx.lineTo(screenX - 8, y + 6);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#cc5500';
                ctx.fillRect(screenX - 9, y + 6, 18, 4);
            }

            if (obs.hit) ctx.restore(); // V36: Match save above
        });
    },

    _drawPowerUps() {
        const ctx = this.ctx;
        const bob = Math.sin(Date.now() * 0.005) * 3;
        this.powerUps.forEach(pu => {
            if (pu.collected) return;
            const screenX = this.playerX + (pu.worldX - this.scrollX);
            if (screenX < -50 || screenX > this.canvas.width + 50) return;
            const y = this.laneYs[pu.lane] + bob;

            ctx.save();

            if (pu.type === 'shield') {
                // Blue shield shape
                ctx.fillStyle = '#3498db';
                ctx.shadowColor = 'rgba(52,152,219,0.6)';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(screenX, y - 12);
                ctx.lineTo(screenX + 10, y - 6);
                ctx.lineTo(screenX + 10, y + 4);
                ctx.quadraticCurveTo(screenX, y + 14, screenX, y + 14);
                ctx.quadraticCurveTo(screenX, y + 14, screenX - 10, y + 4);
                ctx.lineTo(screenX - 10, y - 6);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('+', screenX, y);
            } else if (pu.type === 'magnet') {
                // Red/blue horseshoe magnet
                ctx.shadowColor = 'rgba(255,215,0,0.6)';
                ctx.shadowBlur = 8;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                // Left arm (red)
                ctx.strokeStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(screenX, y - 2, 8, Math.PI, Math.PI * 1.5);
                ctx.stroke();
                // Right arm (blue)
                ctx.strokeStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(screenX, y - 2, 8, Math.PI * 1.5, Math.PI * 2);
                ctx.stroke();
                // Tips
                ctx.fillStyle = '#ccc';
                ctx.fillRect(screenX - 12, y - 2, 4, 6);
                ctx.fillRect(screenX + 8, y - 2, 4, 6);
            } else if (pu.type === 'freeze') {
                // Snowflake / freeze
                ctx.fillStyle = '#7ec8e3';
                ctx.shadowColor = 'rgba(100,200,255,0.6)';
                ctx.shadowBlur = 8;
                // Diamond shape
                ctx.beginPath();
                ctx.moveTo(screenX, y - 12);
                ctx.lineTo(screenX + 10, y);
                ctx.lineTo(screenX, y + 12);
                ctx.lineTo(screenX - 10, y);
                ctx.closePath();
                ctx.fill();
                // Inner star
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(screenX, y - 6);
                ctx.lineTo(screenX, y + 6);
                ctx.moveTo(screenX - 5, y - 3);
                ctx.lineTo(screenX + 5, y + 3);
                ctx.moveTo(screenX + 5, y - 3);
                ctx.lineTo(screenX - 5, y + 3);
                ctx.stroke();
            } else if (pu.type === 'speed_burst') {
                // V7: Orange lightning bolt
                ctx.fillStyle = '#ff6b35';
                ctx.shadowColor = 'rgba(255,107,53,0.7)';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(screenX + 2, y - 12);
                ctx.lineTo(screenX - 6, y + 1);
                ctx.lineTo(screenX - 1, y + 1);
                ctx.lineTo(screenX - 3, y + 12);
                ctx.lineTo(screenX + 6, y - 1);
                ctx.lineTo(screenX + 1, y - 1);
                ctx.closePath();
                ctx.fill();
            } else if (pu.type === 'double_stars') {
                // V7: Golden double-star
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = 'rgba(255,215,0,0.7)';
                ctx.shadowBlur = 10;
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('x2', screenX, y);
            }

            ctx.restore();
        });
    },

    // V31: Draw collectible coins on road
    _drawCoins() {
        const ctx = this.ctx;
        const bob = Math.sin(Date.now() * 0.006) * 3;
        const spin = (Date.now() * 0.003) % (Math.PI * 2);
        this.coins.forEach(coin => {
            if (coin.collected) return;
            const screenX = this.playerX + (coin.worldX - this.scrollX);
            if (screenX < -50 || screenX > this.canvas.width + 50) return;
            const y = this.laneYs[coin.lane] + bob;
            const r = 10;
            const squeeze = Math.abs(Math.cos(spin)); // 3D spin effect

            ctx.save();
            // Glow
            ctx.shadowColor = 'rgba(255,215,0,0.6)';
            ctx.shadowBlur = 10;
            // Coin body
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.ellipse(screenX, y, r * Math.max(0.3, squeeze), r, 0, 0, Math.PI * 2);
            ctx.fill();
            // Inner circle
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.ellipse(screenX, y, (r - 3) * Math.max(0.3, squeeze), r - 3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Dollar sign
            if (squeeze > 0.5) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', screenX, y);
            }
            ctx.restore();
        });
    },

    // V34: Free Drive scenic collectibles (emoji-based with bobbing animation)
    _drawScenicCollectibles() {
        if (this.gameMode !== 'free-drive') return;
        const ctx = this.ctx;
        const bob = Math.sin(Date.now() * 0.004) * 4;
        const pulse = 0.9 + Math.sin(Date.now() * 0.005) * 0.1; // gentle size pulse
        this.scenicCollectibles.forEach(sc => {
            if (sc.collected) return;
            const screenX = this.playerX + (sc.worldX - this.scrollX);
            if (screenX < -50 || screenX > this.canvas.width + 50) return;
            const y = this.laneYs[sc.lane] + bob;
            ctx.save();
            // Glow effect
            ctx.shadowColor = 'rgba(255,255,100,0.5)';
            ctx.shadowBlur = 8;
            ctx.font = `${Math.round(20 * pulse)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sc.emoji, screenX, y);
            ctx.restore();
        });
    },

    // V4 _drawDetailedCar removed — V5 uses CorvetteRenderer

    _drawSpeedometer() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w - 65;
        const cy = h - 60;
        const r = 48;

        ctx.save();
        ctx.globalAlpha = 0.85;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
        ctx.fill();

        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const zoneColors = ['#2ecc71', '#2ecc71', '#f39c12', '#f39c12', '#e74c3c'];
        const zoneCount = zoneColors.length;

        zoneColors.forEach((color, i) => {
            const a1 = startAngle + (endAngle - startAngle) * (i / zoneCount);
            const a2 = startAngle + (endAngle - startAngle) * ((i + 1) / zoneCount);
            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(cx, cy, r - 3, a1, a2);
            ctx.stroke();
        });

        const maxSpeed = 12;
        const speedPct = Math.min(this.playerSpeed / maxSpeed, 1);
        const needleAngle = startAngle + (endAngle - startAngle) * speedPct;

        // V5.8: Glowing needle during nitro
        if (this.nitroTimer > 0) {
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 6;
        }
        ctx.strokeStyle = this.nitroTimer > 0 ? '#ffd700' : '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(needleAngle) * (r - 10),
            cy + Math.sin(needleAngle) * (r - 10)
        );
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        const mph = Math.round(this.playerSpeed * 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${mph}`, cx, cy + 18);
        ctx.font = '9px sans-serif';
        ctx.fillText('MPH', cx, cy + 28);

        ctx.restore();
    },
};
