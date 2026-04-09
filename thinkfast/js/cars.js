// ===== CORVETTE RENDERER V7 — 37 Cars =====
const CorvetteRenderer = {

    // ===== COLOR UTILITIES =====
    _hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    },
    _lighten(hex, pct) {
        const c = this._hexToRgb(hex);
        const f = pct / 100;
        const r = Math.min(255, Math.round(c.r + (255 - c.r) * f));
        const g = Math.min(255, Math.round(c.g + (255 - c.g) * f));
        const b = Math.min(255, Math.round(c.b + (255 - c.b) * f));
        return `rgb(${r},${g},${b})`;
    },
    _darken(hex, pct) {
        const c = this._hexToRgb(hex);
        const f = 1 - pct / 100;
        return `rgb(${Math.round(c.r*f)},${Math.round(c.g*f)},${Math.round(c.b*f)})`;
    },

    _gradientCache: {},

    // ===== SPRITE SYSTEM =====
    _sprites: {},        // genId -> Image (loaded PNGs)
    _spriteStatus: {},   // genId -> 'loading' | 'loaded' | 'failed'
    _tintCache: {},      // 'genId_color_w_h' -> Canvas (tinted + scaled)
    _cropBounds: {},     // genId -> { sx, sy, sw, sh } (tight non-transparent bounds)

    // Sprite-specific wheel/light positions (auto-detected from sprite images)
    // These override the Canvas path positions when rendering with sprites
    _spriteCoords: {
        // Corvettes — radii measured from actual wheel arch openings in sprites
        c1:    { wheels: { rear: 0.247, front: 0.80, y: 0.73, radius: 0.14 },
                 headlights: [{ x: 0.97, y: 0.47 }], taillights: [{ x: 0.04, y: 0.41 }] },
        c2:    { wheels: { rear: 0.264, front: 0.80, y: 0.72, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.44 }] },
        c3:    { wheels: { rear: 0.251, front: 0.77, y: 0.71, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.48 }], taillights: [{ x: 0.03, y: 0.43 }] },
        c4:    { wheels: { rear: 0.24, front: 0.755, y: 0.71, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.44 }], taillights: [{ x: 0.04, y: 0.43 }] },
        c5:    { wheels: { rear: 0.21, front: 0.77, y: 0.72, radius: 0.15 },
                 headlights: [{ x: 0.97, y: 0.43 }], taillights: [{ x: 0.03, y: 0.44 }] },
        c6:    { wheels: { rear: 0.198, front: 0.776, y: 0.72, radius: 0.15 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.025, y: 0.45 }] },
        c7:    { wheels: { rear: 0.209, front: 0.778, y: 0.73, radius: 0.15 },
                 headlights: [{ x: 0.96, y: 0.40 }], taillights: [{ x: 0.025, y: 0.41 }] },
        c8:    { wheels: { rear: 0.21, front: 0.764, y: 0.72, radius: 0.15 },
                 headlights: [{ x: 0.96, y: 0.44 }], taillights: [{ x: 0.03, y: 0.41 }] },
        // Legends
        beetle:{ wheels: { rear: 0.23, front: 0.789, y: 0.78, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.50 }], taillights: [{ x: 0.04, y: 0.43 }] },
        mustang:{ wheels: { rear: 0.244, front: 0.788, y: 0.71, radius: 0.13 },
                 headlights: [{ x: 0.98, y: 0.41 }], taillights: [{ x: 0.02, y: 0.39 }] },
        delorean:{ wheels: { rear: 0.236, front: 0.783, y: 0.71, radius: 0.13 },
                 headlights: [{ x: 0.975, y: 0.44 }], taillights: [{ x: 0.02, y: 0.41 }] },
        hotrod:{ wheels: { rear: 0.193, front: 0.73, y: 0.69, radius: 0.20, frontRadius: 0.12 },
                 headlights: [{ x: 0.95, y: 0.53 }], taillights: [{ x: 0.03, y: 0.36 }] },
        porsche911:{ wheels: { rear: 0.254, front: 0.779, y: 0.74, radius: 0.14 },
                 headlights: [{ x: 0.97, y: 0.46 }], taillights: [{ x: 0.025, y: 0.40 }] },
        countach:{ wheels: { rear: 0.198, front: 0.768, y: 0.69, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.43 }], taillights: [{ x: 0.02, y: 0.40 }] },
        // Modern
        cybertruck:{ wheels: { rear: 0.213, front: 0.815, y: 0.72, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.41 }], taillights: [{ x: 0.025, y: 0.41 }] },
        bronco:{ wheels: { rear: 0.249, front: 0.815, y: 0.83, radius: 0.15 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.41 }] },
        wrangler:{ wheels: { rear: 0.231, front: 0.814, y: 0.84, radius: 0.17 },
                 headlights: [{ x: 0.97, y: 0.50 }], taillights: [{ x: 0.025, y: 0.48 }] },
        // Wild Cards
        batmobile:{ wheels: { rear: 0.22, front: 0.788, y: 0.70, radius: 0.13 },
                 headlights: [{ x: 0.96, y: 0.49 }], taillights: [{ x: 0.03, y: 0.34 }] },
        monstertruck:{ wheels: { rear: 0.201, front: 0.823, y: 0.82, radius: 0.22 },
                 headlights: [{ x: 0.875, y: 0.25 }], taillights: [{ x: 0.13, y: 0.24 }] },
        schoolbus:{ wheels: { rear: 0.289, front: 0.866, y: 0.74, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.48 }], taillights: [{ x: 0.03, y: 0.41 }] },
        firetruck:{ wheels: { rear: 0.22, mid: 0.33, front: 0.785, y: 0.65, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.45 }], taillights: [{ x: 0.03, y: 0.43 }] },
        wienermobile:{ wheels: { rear: 0.26, front: 0.775, y: 0.76, radius: 0.12 },
                 headlights: [{ x: 0.96, y: 0.59 }], taillights: [{ x: 0.03, y: 0.54 }] },
        // Emergency
        policecar:{ wheels: { rear: 0.22, front: 0.79, y: 0.75, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.45 }], taillights: [{ x: 0.03, y: 0.45 }] },
        ambulance:{ wheels: { rear: 0.18, front: 0.78, y: 0.75, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.45 }], taillights: [{ x: 0.03, y: 0.43 }] },
        towtruck:{ wheels: { rear: 0.20, front: 0.80, y: 0.75, radius: 0.14 },
                 headlights: [{ x: 0.97, y: 0.42 }], taillights: [{ x: 0.03, y: 0.42 }] },
        // Fun Rides
        icecreamtruck:{ wheels: { rear: 0.20, front: 0.80, y: 0.76, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.45 }], taillights: [{ x: 0.03, y: 0.45 }] },
        gokart:{ wheels: { rear: 0.18, front: 0.82, y: 0.72, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.45 }], taillights: [{ x: 0.04, y: 0.45 }] },
        limo:{ wheels: { rear: 0.15, front: 0.85, y: 0.74, radius: 0.12 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.44 }] },
        tank:{ wheels: { rear: 0.12, front: 0.88, y: 0.78, radius: 0.10 },
                 headlights: [{ x: 0.95, y: 0.35 }], taillights: [{ x: 0.05, y: 0.40 }] },
        zamboni:{ wheels: { rear: 0.20, front: 0.80, y: 0.78, radius: 0.12 },
                 headlights: [{ x: 0.96, y: 0.42 }], taillights: [{ x: 0.04, y: 0.42 }] },
        tractor:{ wheels: { rear: 0.22, front: 0.78, y: 0.76, radius: 0.18, frontRadius: 0.12 },
                 headlights: [{ x: 0.95, y: 0.38 }], taillights: [{ x: 0.05, y: 0.42 }] },
        // Daily Drivers
        grandam:{ wheels: { rear: 0.22, front: 0.79, y: 0.73, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.44 }] },
        focus:{ wheels: { rear: 0.22, front: 0.79, y: 0.73, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.44 }] },
        bronco2023:{ wheels: { rear: 0.22, front: 0.80, y: 0.78, radius: 0.15 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.44 }] },
        ferrari:{ wheels: { rear: 0.20, front: 0.79, y: 0.71, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.42 }], taillights: [{ x: 0.03, y: 0.42 }] },
        // V16: New cars
        dumptruck:{ wheels: { rear: 0.20, front: 0.80, y: 0.76, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.42 }], taillights: [{ x: 0.04, y: 0.30 }] },
        tacotruck:{ wheels: { rear: 0.18, front: 0.82, y: 0.76, radius: 0.12 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.04, y: 0.28 }] },
        f1car:{ wheels: { rear: 0.16, front: 0.84, y: 0.68, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.44 }], taillights: [{ x: 0.03, y: 0.42 }] },
        pizzacar:{ wheels: { rear: 0.20, front: 0.80, y: 0.72, radius: 0.12 },
                 headlights: [{ x: 0.97, y: 0.42 }], taillights: [{ x: 0.04, y: 0.36 }] },
        cementmixer:{ wheels: { rear: 0.18, front: 0.82, y: 0.78, radius: 0.13 },
                 headlights: [{ x: 0.96, y: 0.42 }], taillights: [{ x: 0.04, y: 0.34 }] },
        garbagetruck:{ wheels: { rear: 0.18, front: 0.82, y: 0.78, radius: 0.13 },
                 headlights: [{ x: 0.96, y: 0.44 }], taillights: [{ x: 0.04, y: 0.30 }] },
        hummerh1:{ wheels: { rear: 0.20, front: 0.80, y: 0.78, radius: 0.15 },
                 headlights: [{ x: 0.96, y: 0.36 }], taillights: [{ x: 0.04, y: 0.28 }] },
        nascar:{ wheels: { rear: 0.20, front: 0.80, y: 0.70, radius: 0.13 },
                 headlights: [{ x: 0.97, y: 0.40 }], taillights: [{ x: 0.04, y: 0.38 }] },
        bulldozer:{ wheels: { rear: 0.22, front: 0.78, y: 0.76, radius: 0.16 },
                 headlights: [{ x: 0.95, y: 0.44 }], taillights: [{ x: 0.08, y: 0.38 }] },
        vwbus:{ wheels: { rear: 0.18, front: 0.82, y: 0.78, radius: 0.13 },
                 headlights: [{ x: 0.96, y: 0.42 }], taillights: [{ x: 0.04, y: 0.30 }] },
        mailtruck:{ wheels: { rear: 0.20, front: 0.82, y: 0.76, radius: 0.12 },
                 headlights: [{ x: 0.96, y: 0.44 }], taillights: [{ x: 0.06, y: 0.28 }] },
        taxi:{ wheels: { rear: 0.20, front: 0.80, y: 0.72, radius: 0.12 },
                 headlights: [{ x: 0.97, y: 0.40 }], taillights: [{ x: 0.04, y: 0.38 }] },
        minicooper:{ wheels: { rear: 0.22, front: 0.78, y: 0.70, radius: 0.12 },
                 headlights: [{ x: 0.95, y: 0.42 }], taillights: [{ x: 0.06, y: 0.38 }] },
        fordf150:{ wheels: { rear: 0.20, front: 0.80, y: 0.78, radius: 0.14 },
                 headlights: [{ x: 0.96, y: 0.40 }], taillights: [{ x: 0.04, y: 0.30 }] },
        rocketcar:{ wheels: { rear: 0.18, front: 0.82, y: 0.68, radius: 0.12 },
                 headlights: [{ x: 0.98, y: 0.38 }], taillights: [{ x: 0.03, y: 0.36 }] },
    },

    loadSprite(genId) {
        if (this._spriteStatus[genId]) return; // already loading/loaded
        this._spriteStatus[genId] = 'loading';
        const img = new Image();
        img.onload = () => {
            this._sprites[genId] = img;
            this._computeCropBounds(genId, img);
            this._spriteStatus[genId] = 'loaded';
        };
        img.onerror = () => {
            this._spriteStatus[genId] = 'failed';
        };
        img.src = 'img/cars/' + genId + '.png';
    },

    loadAllSprites() {
        Object.keys(this.generations).forEach(id => this.loadSprite(id));
    },

    _computeCropBounds(genId, img) {
        const c = document.createElement('canvas');
        const W = img.naturalWidth, H = img.naturalHeight;
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, W, H).data;
        let minX = W, minY = H, maxX = 0, maxY = 0;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                if (data[(y * W + x) * 4 + 3] > 10) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < minX) { this._cropBounds[genId] = null; return; }
        minX = Math.max(0, minX - 1);
        minY = Math.max(0, minY - 1);
        maxX = Math.min(W - 1, maxX + 1);
        maxY = Math.min(H - 1, maxY + 1);
        this._cropBounds[genId] = { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
    },

    _getTintedSprite(genId, color, w, h) {
        const key = genId + '_' + color + '_' + Math.round(w) + '_' + Math.round(h);
        if (this._tintCache[key]) return this._tintCache[key];

        const sprite = this._sprites[genId];
        if (!sprite) return null;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        const sctx = canvas.getContext('2d');

        // Draw sprite cropped to tight bounds (removes transparent padding)
        const crop = this._cropBounds[genId];
        if (crop) {
            sctx.drawImage(sprite, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
        } else {
            sctx.drawImage(sprite, 0, 0, w, h);
        }

        // Apply color tint via multiply — preserves luminance detail
        sctx.globalCompositeOperation = 'multiply';
        sctx.fillStyle = color;
        sctx.fillRect(0, 0, w, h);

        // Restore original alpha (multiply affects alpha on some browsers)
        sctx.globalCompositeOperation = 'destination-in';
        if (crop) {
            sctx.drawImage(sprite, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
        } else {
            sctx.drawImage(sprite, 0, 0, w, h);
        }

        // Limit tint cache size (LRU-ish: just cap total entries)
        const keys = Object.keys(this._tintCache);
        if (keys.length > 50) {
            delete this._tintCache[keys[0]];
        }
        this._tintCache[key] = canvas;
        return canvas;
    },


    // ===== DATA (loaded from car-data.js) =====
    categories: CarData.categories,
    generations: CarData.generations,
    bonusColors: CarData.bonusColors,


    // ===== PATH RENDERER =====
    _tracePath(ctx, commands, x, y, w, h) {
        ctx.beginPath();
        for (const cmd of commands) {
            switch (cmd[0]) {
                case 'M':
                    ctx.moveTo(x + cmd[1] * w, y + (cmd[2] - 0.5) * h);
                    break;
                case 'L':
                    ctx.lineTo(x + cmd[1] * w, y + (cmd[2] - 0.5) * h);
                    break;
                case 'Q':
                    ctx.quadraticCurveTo(
                        x + cmd[1] * w, y + (cmd[2] - 0.5) * h,
                        x + cmd[3] * w, y + (cmd[4] - 0.5) * h
                    );
                    break;
                case 'C':
                    ctx.bezierCurveTo(
                        x + cmd[1] * w, y + (cmd[2] - 0.5) * h,
                        x + cmd[3] * w, y + (cmd[4] - 0.5) * h,
                        x + cmd[5] * w, y + (cmd[6] - 0.5) * h
                    );
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    },

    // ===== SHARED COMPONENT RENDERERS =====

    _drawGroundShadow(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + h * 0.42, w * 0.48, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawWheel(ctx, x, y, radius, angle, lod) {
        const r = Math.round(radius);
        const px = Math.round(x);
        const py = Math.round(y);

        if (lod === 'title') {
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Tire
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sidewall
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(px, py, r * 0.82, 0, Math.PI * 2);
        ctx.fill();

        // Tread marks
        if (lod === 'race') {
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 0.8;
            for (let i = 0; i < 12; i++) {
                const a = angle + (i * Math.PI / 6);
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * r * 0.82, py + Math.sin(a) * r * 0.82);
                ctx.lineTo(px + Math.cos(a) * r * 0.98, py + Math.sin(a) * r * 0.98);
                ctx.stroke();
            }
        }

        // Rim
        const rimGrad = ctx.createRadialGradient(px - r * 0.1, py - r * 0.1, 0, px, py, r * 0.65);
        rimGrad.addColorStop(0, '#e8e8e8');
        rimGrad.addColorStop(0.5, '#c0c0c0');
        rimGrad.addColorStop(1, '#888');
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Spokes
        if (lod === 'race' || lod === 'garage') {
            ctx.lineWidth = r > 8 ? 2.2 : 1.5;
            for (let s = 0; s < 5; s++) {
                const a = angle + (s * Math.PI * 2 / 5);
                ctx.strokeStyle = '#666';
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * r * 0.14, py + Math.sin(a) * r * 0.14);
                ctx.lineTo(px + Math.cos(a) * r * 0.58, py + Math.sin(a) * r * 0.58);
                ctx.stroke();
                ctx.strokeStyle = '#bbb';
                ctx.lineWidth = r > 8 ? 1.2 : 0.8;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * r * 0.14 + 0.5, py + Math.sin(a) * r * 0.14 - 0.5);
                ctx.lineTo(px + Math.cos(a) * r * 0.55 + 0.5, py + Math.sin(a) * r * 0.55 - 0.5);
                ctx.stroke();
            }
        }

        // Center cap
        const capGrad = ctx.createRadialGradient(px - r * 0.03, py - r * 0.03, 0, px, py, r * 0.16);
        capGrad.addColorStop(0, '#fff');
        capGrad.addColorStop(0.5, '#ddd');
        capGrad.addColorStop(1, '#aaa');
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Brake caliper
        if (lod === 'race') {
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(px - r * 0.20, py + r * 0.28, r * 0.40, r * 0.18);
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(px - r * 0.16, py + r * 0.30, r * 0.32, r * 0.06);
        }
    },

    _drawHeadlight(ctx, x, y, size, lod) {
        if (lod === 'title') return;
        const s = Math.round(size);
        const px = Math.round(x);
        const py = Math.round(y);

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(px, py, s * 1.3, s * 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        if (lod === 'race' || lod === 'garage') {
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#fffacd';
            ctx.beginPath();
            ctx.ellipse(px, py, s, s * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(px + s * 0.15, py - s * 0.15, s * 0.35, s * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(px, py, s, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    _drawTaillight(ctx, x, y, size, lod) {
        if (lod === 'title') return;
        const s = Math.round(size);
        const px = Math.round(x);
        const py = Math.round(y);

        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.ellipse(px, py, s * 1.3, s * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        if (lod === 'race' || lod === 'garage') {
            ctx.save();
            ctx.shadowColor = '#ff2222';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.ellipse(px, py, s, s * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#ff8888';
            ctx.beginPath();
            ctx.ellipse(px - s * 0.15, py - s * 0.1, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#cc2222';
            ctx.beginPath();
            ctx.arc(px, py, s, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    _drawBodyReflection(ctx, x, y, w, h) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.20, y - h * 0.30);
        ctx.quadraticCurveTo(x + w * 0.45, y - h * 0.38, x + w * 0.70, y - h * 0.24);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y - h * 0.18);
        ctx.lineTo(x + w * 0.65, y - h * 0.12);
        ctx.stroke();
    },

    _drawChromeBumper(ctx, x1, y1, x2, y2) {
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(Math.round(x1), Math.round(y1));
        ctx.lineTo(Math.round(x2), Math.round(y2));
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x1), Math.round(y1) - 1);
        ctx.lineTo(Math.round(x2), Math.round(y2) - 1);
        ctx.stroke();
    },

    _drawSideVents(ctx, x, y, w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
            const vx = x + w * (0.64 + i * 0.03);
            ctx.beginPath();
            ctx.moveTo(vx, y - h * 0.05);
            ctx.lineTo(vx + w * 0.015, y + h * 0.08);
            ctx.stroke();
        }
    },

    _drawEngineCover(ctx, gen, x, y, w, h) {
        if (!gen.engineCover) return;
        ctx.fillStyle = 'rgba(60,60,60,0.5)';
        this._tracePath(ctx, gen.engineCover, x, y, w, h);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
    },

    _drawChromeSideTrim(ctx, gen, x, y, w, h) {
        ctx.strokeStyle = 'rgba(200,200,200,0.6)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (gen.features.chromeBumpers) {
            ctx.moveTo(x + w * 0.06, y + h * 0.08);
            ctx.lineTo(x + w * 0.92, y + h * 0.06);
        } else if (gen.features.midEngine) {
            ctx.moveTo(x + w * 0.38, y + h * 0.08);
            ctx.lineTo(x + w * 0.85, y + h * 0.04);
        } else {
            ctx.moveTo(x + w * 0.08, y + h * 0.06);
            ctx.lineTo(x + w * 0.88, y + h * 0.02);
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
    },

    _drawWheelArchFlares(ctx, gen, x, y, w, h, color) {
        const wDef = gen.wheels;
        const archColor = this._darken(color, 30);
        ctx.fillStyle = archColor;

        const ry = y + (wDef.y - 0.5) * h;

        ctx.beginPath();
        const rrx = x + wDef.rear * w;
        ctx.arc(rrx, ry, wDef.radius * h * 1.15, Math.PI, 0);
        ctx.arc(rrx, ry, wDef.radius * h * 0.95, 0, Math.PI, true);
        ctx.fill();

        ctx.beginPath();
        const frx = x + wDef.front * w;
        ctx.arc(frx, ry, wDef.radius * h * 1.15, Math.PI, 0);
        ctx.arc(frx, ry, wDef.radius * h * 0.95, 0, Math.PI, true);
        ctx.fill();
    },

    _drawRockerPanel(ctx, gen, x, y, w, h, color) {
        const wDef = gen.wheels;
        const rearEnd = x + wDef.rear * w + wDef.radius * h;
        const frontStart = x + wDef.front * w - wDef.radius * h;
        const panelY = y + (wDef.y - 0.5) * h - wDef.radius * h * 0.4;
        const panelH = h * 0.06;
        ctx.fillStyle = this._darken(color, 35);
        ctx.beginPath();
        ctx.moveTo(rearEnd, panelY);
        ctx.lineTo(frontStart, panelY);
        ctx.lineTo(frontStart, panelY + panelH);
        ctx.lineTo(rearEnd, panelY + panelH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(rearEnd + 2, panelY);
        ctx.lineTo(frontStart - 2, panelY);
        ctx.stroke();
    },

    _drawExhaustTips(ctx, x, y, w, h) {
        const ex = x + w * 0.02;
        const ey1 = y + h * 0.22;
        const ey2 = y + h * 0.28;
        const er = Math.max(1.5, w * 0.012);
        for (const ey of [ey1, ey2]) {
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(ex, ey, er, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#c0c0c0';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ddd';
            ctx.beginPath();
            ctx.arc(ex - er * 0.2, ey - er * 0.2, er * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    _drawRearSpoiler(ctx, gen, x, y, w, h, color) {
        if (!gen.features.rearSpoiler) return;
        ctx.fillStyle = this._darken(color, 40);
        ctx.beginPath();
        if (gen.features.midEngine) {
            ctx.moveTo(x + w * 0.04, y - h * 0.34);
            ctx.lineTo(x + w * 0.02, y - h * 0.38);
            ctx.lineTo(x + w * 0.12, y - h * 0.37);
            ctx.lineTo(x + w * 0.12, y - h * 0.34);
        } else {
            ctx.moveTo(x + w * 0.04, y - h * 0.26);
            ctx.lineTo(x + w * 0.02, y - h * 0.30);
            ctx.lineTo(x + w * 0.10, y - h * 0.29);
            ctx.lineTo(x + w * 0.10, y - h * 0.26);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
    },

    _drawPanelLines(ctx, gen, x, y, w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.42, y - h * 0.30);
        ctx.lineTo(x + w * 0.42, y + h * 0.20);
        ctx.stroke();
        if (gen.features.longHood || gen.features.smoothBody || gen.features.angularBody) {
            ctx.beginPath();
            ctx.moveTo(x + w * 0.65, y - h * 0.20);
            ctx.lineTo(x + w * 0.90, y - h * 0.15);
            ctx.stroke();
        }
    },

    // ===== NEW FEATURE RENDERERS =====

    _drawBatFins(ctx, x, y, w, h, color) {
        ctx.fillStyle = this._darken(color, 50);
        // Left fin
        ctx.beginPath();
        ctx.moveTo(x + w * 0.04, y - h * 0.20);
        ctx.lineTo(x + w * 0.06, y - h * 0.42);
        ctx.lineTo(x + w * 0.10, y - h * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
    },

    _drawBigWing(ctx, x, y, w, h, color) {
        ctx.fillStyle = this._darken(color, 35);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.02, y - h * 0.34);
        ctx.lineTo(x - w * 0.02, y - h * 0.40);
        ctx.lineTo(x + w * 0.16, y - h * 0.38);
        ctx.lineTo(x + w * 0.14, y - h * 0.34);
        ctx.closePath();
        ctx.fill();
        // Wing supports
        ctx.strokeStyle = this._darken(color, 45);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.04, y - h * 0.34);
        ctx.lineTo(x + w * 0.02, y - h * 0.38);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.12, y - h * 0.34);
        ctx.lineTo(x + w * 0.12, y - h * 0.38);
        ctx.stroke();
    },

    _drawGullwingLine(ctx, x, y, w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.30, y - h * 0.28);
        ctx.quadraticCurveTo(x + w * 0.38, y - h * 0.38, x + w * 0.46, y - h * 0.36);
        ctx.stroke();
    },

    _drawRearLouvers(ctx, x, y, w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 4; i++) {
            const ly = y - h * (0.22 - i * 0.04);
            ctx.beginPath();
            ctx.moveTo(x + w * 0.06, ly);
            ctx.lineTo(x + w * 0.14, ly);
            ctx.stroke();
        }
    },

    _drawExposedEngine(ctx, x, y, w, h) {
        // Engine block poking through hood
        ctx.fillStyle = '#444';
        ctx.fillRect(x + w * 0.61, y - h * 0.30, w * 0.10, h * 0.14);
        // Intake scoop
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.62, y - h * 0.30);
        ctx.lineTo(x + w * 0.66, y - h * 0.36);
        ctx.lineTo(x + w * 0.70, y - h * 0.30);
        ctx.closePath();
        ctx.fill();
        // Chrome details
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + w * 0.62, y - h * (0.20 - i * 0.04));
            ctx.lineTo(x + w * 0.70, y - h * (0.20 - i * 0.04));
            ctx.stroke();
        }
    },

    _drawSideScoop(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.54, y + h * 0.0);
        ctx.lineTo(x + w * 0.60, y - h * 0.04);
        ctx.lineTo(x + w * 0.60, y + h * 0.06);
        ctx.closePath();
        ctx.fill();
    },

    _drawSideIntakes(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.36, y + h * 0.02);
        ctx.lineTo(x + w * 0.42, y - h * 0.02);
        ctx.lineTo(x + w * 0.42, y + h * 0.16);
        ctx.lineTo(x + w * 0.36, y + h * 0.14);
        ctx.closePath();
        ctx.fill();
    },

    _drawRunningBoard(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(40,40,40,0.6)';
        const wDef = { rear: 0.28, front: 0.66 };
        ctx.fillRect(x + w * wDef.rear, y + h * 0.14, w * (wDef.front - wDef.rear), h * 0.04);
        ctx.strokeStyle = 'rgba(200,200,200,0.4)';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(x + w * wDef.rear, y + h * 0.14, w * (wDef.front - wDef.rear), h * 0.04);
    },

    _drawFenderGills(ctx, x, y, w, h) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const gx = x + w * (0.14 + i * 0.025);
            ctx.beginPath();
            ctx.moveTo(gx, y + h * 0.10);
            ctx.lineTo(gx + w * 0.01, y + h * 0.18);
            ctx.stroke();
        }
    },

    _drawFireLadder(ctx, x, y, w, h) {
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1.5;
        // Rails
        ctx.beginPath();
        ctx.moveTo(x + w * 0.08, y - h * 0.44);
        ctx.lineTo(x + w * 0.50, y - h * 0.44);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.08, y - h * 0.40);
        ctx.lineTo(x + w * 0.50, y - h * 0.40);
        ctx.stroke();
        // Rungs
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const rx = x + w * (0.10 + i * 0.07);
            ctx.beginPath();
            ctx.moveTo(rx, y - h * 0.44);
            ctx.lineTo(rx, y - h * 0.40);
            ctx.stroke();
        }
    },

    _drawLightBar(ctx, x, y, w, h) {
        // Red/blue alternating lights on roof
        const lx = x + w * 0.48;
        const ly = y - h * 0.44;
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(lx - w * 0.04, ly, w * 0.04, h * 0.04);
        ctx.fillStyle = '#2244cc';
        ctx.fillRect(lx, ly, w * 0.04, h * 0.04);
        // Glow
        ctx.save();
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(lx - w * 0.03, ly + h * 0.01, w * 0.02, h * 0.02);
        ctx.shadowColor = '#0044ff';
        ctx.fillStyle = '#4466ff';
        ctx.fillRect(lx + w * 0.01, ly + h * 0.01, w * 0.02, h * 0.02);
        ctx.restore();
    },

    _drawBusWindows(ctx, x, y, w, h) {
        // Individual bus windows
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.8;
        const wy1 = y - h * 0.36;
        const wh = h * 0.16;
        for (let i = 0; i < 7; i++) {
            const wx = x + w * (0.10 + i * 0.10);
            ctx.strokeRect(wx, wy1, w * 0.07, wh);
        }
    },

    _drawSpareTire(ctx, x, y, w, h) {
        const cx = x - w * 0.02;
        const cy = y - h * 0.06;
        const r = h * 0.14;
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawHotDogDetails(ctx, x, y, w, h, color) {
        // Mustard line along the top
        ctx.strokeStyle = '#e8c820';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.20, y - h * 0.44);
        ctx.quadraticCurveTo(x + w * 0.50, y - h * 0.46, x + w * 0.78, y - h * 0.42);
        ctx.stroke();
        // Ketchup zigzag
        ctx.strokeStyle = '#cc2020';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.22, y - h * 0.40);
        for (let i = 0; i < 8; i++) {
            const zx = x + w * (0.26 + i * 0.06);
            const zy = y - h * (i % 2 === 0 ? 0.38 : 0.42);
            ctx.lineTo(zx, zy);
        }
        ctx.stroke();
    },

    _drawVerticalGrille(ctx, x, y, w, h) {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.94, y - h * 0.10);
        ctx.lineTo(x + w * 0.96, y - h * 0.14);
        ctx.lineTo(x + w * 0.98, y - h * 0.10);
        ctx.lineTo(x + w * 0.98, y + h * 0.08);
        ctx.lineTo(x + w * 0.94, y + h * 0.08);
        ctx.closePath();
        ctx.fill();
        // Grille slats
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 4; i++) {
            const gy = y - h * 0.08 + i * h * 0.04;
            ctx.beginPath();
            ctx.moveTo(x + w * 0.94, gy);
            ctx.lineTo(x + w * 0.98, gy);
            ctx.stroke();
        }
    },

    // ===== MAIN ENTRY POINT =====
    drawCar(ctx, genId, x, y, w, h, color, options) {
        const gen = this.generations[genId];
        if (!gen) return;

        const lod = (options && options.lod) || 'race';
        const isPlayer = options ? options.isPlayer !== false : true;
        const wheelAngle = (options && options.wheelAngle) || 0;

        // Apply height ratio for different vehicle types
        const hr = gen.heightRatio || 1.0;
        const actualH = h * hr;
        const adjustedY = y - (actualH - h) / 2;

        const bx = x - w * 0.5;
        const by = adjustedY;

        // === SPRITE PATH: Use PNG sprite if loaded ===
        if (this._spriteStatus[genId] === 'loaded') {
            // Ground shadow
            if (lod === 'race' && isPlayer) {
                this._drawGroundShadow(ctx, bx, by, w, actualH);
            }

            // Get tinted sprite — wheels, headlights, taillights are baked into sprite
            const tinted = this._getTintedSprite(genId, color, w, actualH);
            if (tinted) {
                ctx.drawImage(tinted, bx, by - actualH * 0.5, w, actualH);
                return; // Done — sprite has everything, skip Canvas path rendering
            }
        }

        // === CANVAS PATH FALLBACK ===

        // Ground shadow
        if (lod === 'race' && isPlayer) {
            this._drawGroundShadow(ctx, bx, by, w, actualH);
        }

        // Body fill
        ctx.save();
        if (lod !== 'title' && isPlayer) {
            const g = ctx.createLinearGradient(x, by - actualH * 0.5, x, by + actualH * 0.5);
            const effect = gen.paintEffect || 'metallic';
            if (effect === 'classic') {
                g.addColorStop(0, this._lighten(color, 25));
                g.addColorStop(0.3, color);
                g.addColorStop(0.7, this._darken(color, 15));
                g.addColorStop(1, this._darken(color, 30));
            } else if (effect === 'metallic') {
                g.addColorStop(0, this._lighten(color, 40));
                g.addColorStop(0.2, this._lighten(color, 15));
                g.addColorStop(0.5, color);
                g.addColorStop(0.8, this._darken(color, 20));
                g.addColorStop(1, this._darken(color, 38));
            } else if (effect === 'modern') {
                g.addColorStop(0, this._lighten(color, 45));
                g.addColorStop(0.15, this._lighten(color, 12));
                g.addColorStop(0.5, color);
                g.addColorStop(0.85, this._darken(color, 25));
                g.addColorStop(1, this._darken(color, 42));
            } else if (effect === 'chrome') {
                g.addColorStop(0, this._lighten(color, 60));
                g.addColorStop(0.15, this._lighten(color, 35));
                g.addColorStop(0.3, color);
                g.addColorStop(0.5, this._darken(color, 10));
                g.addColorStop(0.65, this._lighten(color, 20));
                g.addColorStop(0.8, this._darken(color, 25));
                g.addColorStop(1, this._darken(color, 40));
            } else if (effect === 'matte') {
                g.addColorStop(0, this._lighten(color, 8));
                g.addColorStop(0.5, color);
                g.addColorStop(1, this._darken(color, 12));
            } else if (effect === 'flat') {
                g.addColorStop(0, this._lighten(color, 4));
                g.addColorStop(1, this._darken(color, 6));
            } else {
                // exotic
                g.addColorStop(0, this._lighten(color, 55));
                g.addColorStop(0.1, this._lighten(color, 28));
                g.addColorStop(0.4, color);
                g.addColorStop(0.75, this._darken(color, 18));
                g.addColorStop(1, this._darken(color, 35));
            }
            ctx.fillStyle = g;
        } else {
            ctx.fillStyle = color;
        }

        this._tracePath(ctx, gen.body, bx, by, w, actualH);
        ctx.fill();

        // Body outline
        ctx.strokeStyle = this._darken(color, 55);
        ctx.lineWidth = lod === 'title' ? 1.5 : 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        // Window
        if (lod !== 'title') {
            ctx.fillStyle = 'rgba(80, 170, 230, 0.45)';
            this._tracePath(ctx, gen.window, bx, by, w, actualH);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Windshield glare
            if (lod === 'race' || lod === 'garage') {
                ctx.save();
                ctx.clip();
                ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(bx + w * 0.48, by - actualH * 0.30);
                ctx.lineTo(bx + w * 0.58, by - actualH * 0.05);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx + w * 0.44, by - actualH * 0.28);
                ctx.lineTo(bx + w * 0.54, by - actualH * 0.03);
                ctx.stroke();
                ctx.restore();
            }
        }

        // Bus windows
        if (gen.features.busWindows && lod !== 'title') {
            this._drawBusWindows(ctx, bx, by, w, actualH);
        }

        // Engine cover (C8)
        if (gen.features.engineCover && lod !== 'title') {
            this._drawEngineCover(ctx, gen, bx, by, w, actualH);
        }

        // Chrome bumpers (C1, C3)
        if (gen.features.chromeBumpers && (lod === 'race' || lod === 'garage')) {
            this._drawChromeBumper(ctx,
                bx + w * 1.0, by + (0.40 - 0.5) * actualH,
                bx + w * 1.0, by + (0.56 - 0.5) * actualH);
            this._drawChromeBumper(ctx,
                bx, by + (0.40 - 0.5) * actualH,
                bx, by + (0.56 - 0.5) * actualH);
        }

        // Panel lines
        if ((lod === 'race' || lod === 'garage') && isPlayer) {
            this._drawPanelLines(ctx, gen, bx, by, w, actualH);
        }

        // Body character lines (belt line, creases)
        if (gen.bodyLines && lod !== 'title') {
            ctx.strokeStyle = isPlayer ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)';
            ctx.lineWidth = isPlayer ? 1.2 : 0.8;
            ctx.lineCap = 'round';
            this._tracePath(ctx, gen.bodyLines, bx, by, w, actualH);
            ctx.stroke();
        }

        // Chrome side trim
        if ((lod === 'race' || lod === 'garage') && isPlayer && gen.category === 'corvettes') {
            this._drawChromeSideTrim(ctx, gen, bx, by, w, actualH);
        }

        // Side vents (C7)
        if (gen.features.sideVents && (lod === 'race' || lod === 'garage')) {
            this._drawSideVents(ctx, bx, by, w, actualH);
        }

        // Side intakes (C8, Countach)
        if (gen.features.sideIntakes && (lod === 'race' || lod === 'garage')) {
            this._drawSideIntakes(ctx, bx, by, w, actualH);
        }

        // Split window (C2)
        if (gen.features.splitWindow && lod !== 'title') {
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx + w * 0.37, by + (0.08 - 0.5) * actualH);
            ctx.lineTo(bx + w * 0.37, by + (0.25 - 0.5) * actualH);
            ctx.stroke();
        }

        // Pop-up headlights (C4)
        if (gen.features.popUpHeadlights && lod !== 'title' && gen.category === 'corvettes') {
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(bx + w * 0.74, by + (0.22 - 0.5) * actualH, w * 0.06, actualH * 0.06);
        }

        // Wheel arch flares
        if ((lod === 'race' || lod === 'garage') && isPlayer && !gen.features.monsterWheels) {
            this._drawWheelArchFlares(ctx, gen, bx, by, w, actualH, color);
        }

        // Rocker panel
        if ((lod === 'race' || lod === 'garage') && isPlayer && !gen.features.liftedBody && !gen.features.highClearance) {
            this._drawRockerPanel(ctx, gen, bx, by, w, actualH, color);
        }

        // Body reflection
        if (((lod === 'race' && isPlayer) || lod === 'garage') && !gen.features.flatRoof) {
            this._drawBodyReflection(ctx, bx, by, w, actualH);
        }

        // Bat fins
        if (gen.features.batFins && (lod === 'race' || lod === 'garage')) {
            this._drawBatFins(ctx, bx, by, w, actualH, color);
        }

        // Big wing (Countach)
        if (gen.features.bigWing && (lod === 'race' || lod === 'garage')) {
            this._drawBigWing(ctx, bx, by, w, actualH, color);
        }

        // Gullwing line (DeLorean)
        if (gen.features.gullwingLine && (lod === 'race' || lod === 'garage')) {
            this._drawGullwingLine(ctx, bx, by, w, actualH);
        }

        // Rear louvers (DeLorean)
        if (gen.features.rearLouvers && (lod === 'race' || lod === 'garage')) {
            this._drawRearLouvers(ctx, bx, by, w, actualH);
        }

        // Exposed engine (Hot Rod)
        if (gen.features.exposedEngine && (lod === 'race' || lod === 'garage')) {
            this._drawExposedEngine(ctx, bx, by, w, actualH);
        }

        // Vertical grille (Hot Rod)
        if (gen.features.verticalGrille && (lod === 'race' || lod === 'garage')) {
            this._drawVerticalGrille(ctx, bx, by, w, actualH);
        }

        // Side scoop (Mustang)
        if (gen.features.sideScoop && (lod === 'race' || lod === 'garage')) {
            this._drawSideScoop(ctx, bx, by, w, actualH);
        }

        // Running board (Beetle)
        if (gen.features.runningBoard && (lod === 'race' || lod === 'garage')) {
            this._drawRunningBoard(ctx, bx, by, w, actualH);
        }

        // Fender gills (C5)
        if (gen.features.fenderGills && (lod === 'race' || lod === 'garage')) {
            this._drawFenderGills(ctx, bx, by, w, actualH);
        }

        // Fire ladder
        if (gen.features.fireLadder && (lod === 'race' || lod === 'garage')) {
            this._drawFireLadder(ctx, bx, by, w, actualH);
        }

        // Light bar
        if (gen.features.lightBar && (lod === 'race' || lod === 'garage') && !gen.features.monsterWheels) {
            this._drawLightBar(ctx, bx, by, w, actualH);
        }

        // Spare tire (Wrangler/Bronco)
        if (gen.features.spareTire && (lod === 'race' || lod === 'garage')) {
            this._drawSpareTire(ctx, bx, by, w, actualH);
        }

        // Hot dog details (Wienermobile)
        if (gen.features.hotdogBody && (lod === 'race' || lod === 'garage')) {
            this._drawHotDogDetails(ctx, bx, by, w, actualH, color);
        }

        // Wheels
        const wDef = gen.wheels;
        const wheelR = wDef.radius * actualH;
        const wheelY = by + (wDef.y - 0.5) * actualH;
        const frontWheelX = bx + wDef.front * w;
        const rearWheelX = bx + wDef.rear * w;
        const frontR = wDef.frontRadius ? wDef.frontRadius * actualH : wheelR;

        const wheelLod = (!isPlayer && lod === 'race') ? 'title' : lod;
        this._drawWheel(ctx, rearWheelX, wheelY, wheelR, wheelAngle, wheelLod);
        if (wDef.mid) {
            const midWheelX = bx + wDef.mid * w;
            this._drawWheel(ctx, midWheelX, wheelY, wheelR, wheelAngle, wheelLod);
        }
        this._drawWheel(ctx, frontWheelX, wheelY, frontR, wheelAngle, wheelLod);

        // Headlights
        if (isPlayer || lod === 'garage') {
            gen.headlights.forEach(hl => {
                this._drawHeadlight(ctx,
                    bx + hl.x * w,
                    by + (hl.y - 0.5) * actualH,
                    Math.max(2, w * 0.025),
                    lod);
            });
        }

        // Taillights
        gen.taillights.forEach(tl => {
            this._drawTaillight(ctx,
                bx + tl.x * w,
                by + (tl.y - 0.5) * actualH,
                Math.max(2, w * 0.022),
                lod);
        });

        // Exhaust tips
        if ((lod === 'race' || lod === 'garage') && isPlayer && gen.category === 'corvettes') {
            this._drawExhaustTips(ctx, bx, by, w, actualH);
        }

        // Rear spoiler (C7, C8)
        if ((lod === 'race' || lod === 'garage') && isPlayer) {
            this._drawRearSpoiler(ctx, gen, bx, by, w, actualH, color);
        }
    },

    drawOpponent(ctx, genId, x, y, w, h, color) {
        this.drawCar(ctx, genId, x, y, w, h, color, {
            lod: 'race',
            isPlayer: false,
            wheelAngle: 0
        });
    },

    clearCaches() {
        this._gradientCache = {};
        this._tintCache = {};
    }
};
