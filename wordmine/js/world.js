/* ============================================
   WORLD — 2D Minecraft Pixel Art Canvas Renderer
   ============================================ */
const World = (() => {
    let canvas, ctx;
    let W = 320, H = 180;
    let S = 1; // Scale factor: ratio of actual canvas to 320x180 base
    let frame = 0;
    let animId = null;
    let particles = [];
    let renderCallback = null;

    // Pre-loaded background images
    const bgImages = {};
    const BG_PATHS = {
        plains: 'assets/bg-plains.png',
        bridge: 'assets/bg-bridge.png',
        enchant: 'assets/bg-enchant.png',
        craft: 'assets/bg-craft.png',
        cave: 'assets/bg-cave.png',
        forest: 'assets/bg-forest.png',
        desert: 'assets/bg-desert.png',
        snow: 'assets/bg-snow.png',
        nether: 'assets/bg-nether.png',
        end: 'assets/bg-end.png'
    };
    let titleLogoImg = null;
    let spritesheetImg = null;

    // Preload all images
    function preloadImages() {
        Object.entries(BG_PATHS).forEach(([key, path]) => {
            const img = new Image();
            img.src = path;
            bgImages[key] = img;
        });
        titleLogoImg = new Image();
        titleLogoImg.src = 'assets/title-logo.png';
        spritesheetImg = new Image();
        spritesheetImg.src = 'assets/spritesheet.png';
    }
    preloadImages();

    // Block colors
    const BLOCK_COLORS = {
        grass_top: '#5daa3a',
        grass_side: '#8B6914',
        dirt: '#96712B',
        stone: '#7f7f7f',
        stone_dark: '#5f5f5f',
        diamond: '#4AEDD9',
        gold: '#FFD700',
        iron: '#D8D8D8',
        obsidian: '#1B0B2E',
        obsidian_glow: '#4a1a6e',
        wood: '#8B5E3C',
        leaves: '#3a7232',
        sky: '#78b9ff',
        sky_dark: '#1a1a4e',
        lava: '#FF4500',
        water: '#3B7FCC',
        bedrock: '#333333'
    };

    // Character sprites (simple pixel grids) — fallback when sprite PNGs not loaded
    const SKINS = {
        steve: {
            head: '#c8956c',
            body: '#3b8ed0',
            legs: '#2b2b7f',
            eyes: '#ffffff',
            hair: '#4a2a0a'
        },
        alex: {
            head: '#c8956c',
            body: '#5daa3a',
            legs: '#4a3728',
            eyes: '#ffffff',
            hair: '#c05020'
        },
        link: {
            head: '#c8956c',
            body: '#2d8a2d',
            legs: '#8B6914',
            eyes: '#4488ff',
            hair: '#e8c840'
        },
        younglink: {
            head: '#c8956c',
            body: '#3a9a3a',
            legs: '#8B6914',
            eyes: '#4488ff',
            hair: '#d4b030'
        },
        zelda: {
            head: '#c8956c',
            body: '#d4a0d4',
            legs: '#d4a0d4',
            eyes: '#4488ff',
            hair: '#e8c840'
        },
        sheik: {
            head: '#c8956c',
            body: '#3a4a8a',
            legs: '#3a4a8a',
            eyes: '#cc2222',
            hair: '#e8c840'
        },
        zombie: {
            head: '#5a8a5a',
            body: '#3b8ed0',
            legs: '#2b2b7f',
            eyes: '#000000',
            hair: '#3a6a3a'
        },
        creeper: {
            head: '#5daa3a',
            body: '#5daa3a',
            legs: '#3a7232',
            eyes: '#000000',
            hair: '#5daa3a'
        },
        enderman: {
            head: '#1a1a1a',
            body: '#1a1a1a',
            legs: '#1a1a1a',
            eyes: '#cc44ff',
            hair: '#1a1a1a'
        },
        diamond: {
            head: '#c8956c',
            body: '#4AEDD9',
            legs: '#3ac8c0',
            eyes: '#ffffff',
            hair: '#2a1a0a'
        },
        netherite: {
            head: '#c8956c',
            body: '#3a3a3a',
            legs: '#2a2a2a',
            eyes: '#ffffff',
            hair: '#2a1a0a'
        }
    };

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        // Size canvas to actual display dimensions for crisp rendering
        const displayW = canvas.clientWidth || canvas.parentElement?.offsetWidth || 1024;
        const displayH = canvas.clientHeight || canvas.parentElement?.offsetHeight || 600;
        S = Math.max(1, Math.floor(displayW / 320)); // Integer scale for crisp pixels
        W = 320; // Keep logical width at 320
        H = 180; // Keep logical height at 180
        canvas.width = 320 * S;
        canvas.height = 180 * S;
        ctx.scale(S, S); // Scale all drawing ops automatically
        ctx.imageSmoothingEnabled = false;
    }

    function resize(w, h) {
        if (canvas) {
            const displayW = canvas.clientWidth || canvas.parentElement?.offsetWidth || 1024;
            const displayH = canvas.clientHeight || canvas.parentElement?.offsetHeight || 600;
            S = Math.max(1, Math.floor(displayW / 320));
            W = 320;
            H = 180;
            canvas.width = 320 * S;
            canvas.height = 180 * S;
            ctx.scale(S, S);
            ctx.imageSmoothingEnabled = false;
        }
    }

    // Draw a single Minecraft-style block
    function drawBlock(x, y, size, type, highlight = false) {
        const s = size;
        switch (type) {
            case 'grass':
                ctx.fillStyle = BLOCK_COLORS.grass_side;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.grass_top;
                ctx.fillRect(x, y, s, Math.floor(s * 0.3));
                break;
            case 'dirt':
                ctx.fillStyle = BLOCK_COLORS.dirt;
                ctx.fillRect(x, y, s, s);
                // Texture dots
                ctx.fillStyle = '#7a5a1a';
                for (let i = 0; i < 3; i++) {
                    const dx = Math.floor(Math.random() * (s - 2)) + 1;
                    const dy = Math.floor(Math.random() * (s - 2)) + 1;
                    ctx.fillRect(x + dx, y + dy, 1, 1);
                }
                break;
            case 'stone':
                ctx.fillStyle = BLOCK_COLORS.stone;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.stone_dark;
                ctx.fillRect(x + 1, y + Math.floor(s / 2), Math.floor(s / 2), 1);
                ctx.fillRect(x + Math.floor(s / 2), y + Math.floor(s / 4), Math.floor(s / 3), 1);
                break;
            case 'diamond':
                ctx.fillStyle = BLOCK_COLORS.stone;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.diamond;
                ctx.fillRect(x + Math.floor(s * 0.25), y + Math.floor(s * 0.25), Math.floor(s * 0.2), Math.floor(s * 0.2));
                ctx.fillRect(x + Math.floor(s * 0.55), y + Math.floor(s * 0.5), Math.floor(s * 0.2), Math.floor(s * 0.2));
                break;
            case 'gold':
                ctx.fillStyle = BLOCK_COLORS.stone;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.gold;
                ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.3), Math.floor(s * 0.25), Math.floor(s * 0.25));
                ctx.fillRect(x + Math.floor(s * 0.55), y + Math.floor(s * 0.5), Math.floor(s * 0.2), Math.floor(s * 0.15));
                break;
            case 'iron':
                ctx.fillStyle = BLOCK_COLORS.stone;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.iron;
                ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.2), Math.floor(s * 0.3), Math.floor(s * 0.2));
                ctx.fillRect(x + Math.floor(s * 0.5), y + Math.floor(s * 0.55), Math.floor(s * 0.2), Math.floor(s * 0.25));
                break;
            case 'obsidian':
                ctx.fillStyle = BLOCK_COLORS.obsidian;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = BLOCK_COLORS.obsidian_glow;
                ctx.fillRect(x + Math.floor(s * 0.3), y + Math.floor(s * 0.3), Math.floor(s * 0.15), Math.floor(s * 0.15));
                ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.6), Math.floor(s * 0.1), Math.floor(s * 0.1));
                break;
            case 'wood':
                ctx.fillStyle = BLOCK_COLORS.wood;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#6a4420';
                for (let i = 0; i < s; i += 3) {
                    ctx.fillRect(x, y + i, s, 1);
                }
                break;
            case 'lava':
                ctx.fillStyle = BLOCK_COLORS.lava;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#FF6B2B';
                const lavaOff = Math.sin(frame * 0.04 + x) * 2;
                ctx.fillRect(x + 2, y + Math.floor(s / 3) + lavaOff, s - 4, 2);
                break;
            case 'water':
                ctx.fillStyle = BLOCK_COLORS.water;
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#5599DD';
                const waveOff = Math.sin(frame * 0.03 + x * 0.5) * 1;
                ctx.fillRect(x, y + waveOff + 2, s, 1);
                break;
            case 'sand':
                ctx.fillStyle = '#e8c874';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#d4b460';
                ctx.fillRect(x + 2, y + Math.floor(s * 0.4), Math.floor(s * 0.3), 1);
                ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.7), Math.floor(s * 0.25), 1);
                break;
            case 'sandstone':
                ctx.fillStyle = '#d4a850';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#c09840';
                ctx.fillRect(x, y + Math.floor(s * 0.5), s, 1);
                ctx.fillRect(x + Math.floor(s * 0.3), y + Math.floor(s * 0.25), Math.floor(s * 0.4), 1);
                break;
            case 'snow':
                ctx.fillStyle = '#f0f0f8';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#e0e0ee';
                ctx.fillRect(x + 1, y + Math.floor(s * 0.6), s - 2, 1);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, s, Math.floor(s * 0.25));
                break;
            default:
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y, s, s);
        }
        // Highlight border
        if (highlight) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        }
        // Block border
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    }

    // Draw character
    function drawCharacter(x, y, size, skinName = 'steve', facingRight = true, walking = false) {
        // Walking bob offset for sprite-based rendering — gentle 1px bob
        const walkBob = walking ? Math.floor(Math.sin(frame * 0.12) * 1) : 0;

        // Try sprite-based rendering first
        if (typeof Sprites !== 'undefined' && Sprites.has(skinName)) {
            Sprites.draw(ctx, skinName, x, y + walkBob, size, !facingRight);
            return;
        }

        // Fallback: fillRect pixel drawing
        const skin = SKINS[skinName] || SKINS.steve;
        const s = size;
        const hs = Math.floor(s * 0.4); // head size
        const bs = Math.floor(s * 0.35); // body height
        const ls = Math.floor(s * 0.25); // leg height

        // Walking leg animation: alternate which leg is raised every ~25 frames (~0.4s steps)
        let leftLegOff = 0, rightLegOff = 0;
        if (walking) {
            const legCycle = Math.floor(frame / 25) % 2;
            if (legCycle === 0) {
                leftLegOff = -2; // left leg raised
            } else {
                rightLegOff = -2; // right leg raised
            }
        }

        // Legs
        ctx.fillStyle = skin.legs;
        ctx.fillRect(x + Math.floor(s * 0.15), y + hs + bs + leftLegOff, Math.floor(s * 0.3), ls);
        ctx.fillRect(x + Math.floor(s * 0.55), y + hs + bs + rightLegOff, Math.floor(s * 0.3), ls);

        // Body
        ctx.fillStyle = skin.body;
        ctx.fillRect(x + Math.floor(s * 0.1), y + hs, Math.floor(s * 0.8), bs);

        // Head
        ctx.fillStyle = skin.head;
        ctx.fillRect(x + Math.floor(s * 0.1), y, hs, hs);

        // Hair
        ctx.fillStyle = skin.hair;
        ctx.fillRect(x + Math.floor(s * 0.1), y, hs, Math.floor(hs * 0.3));

        // Eyes
        ctx.fillStyle = skin.eyes;
        const eyeX = facingRight ? x + Math.floor(s * 0.3) : x + Math.floor(s * 0.15);
        ctx.fillRect(eyeX, y + Math.floor(hs * 0.4), 2, 2);
        ctx.fillRect(eyeX + 4, y + Math.floor(hs * 0.4), 2, 2);

        // Pupil
        ctx.fillStyle = '#000';
        ctx.fillRect(eyeX + 1, y + Math.floor(hs * 0.45), 1, 1);
        ctx.fillRect(eyeX + 5, y + Math.floor(hs * 0.45), 1, 1);
    }

    // Draw character on an arbitrary canvas context (for skin previews)
    function drawCharacterDirect(targetCtx, x, y, size, skinName) {
        const saved = ctx;
        ctx = targetCtx;
        drawCharacter(x, y, size, skinName);
        ctx = saved;
    }

    // Draw a mob
    function drawMob(x, y, size, type = 'zombie') {
        // Try sprite-based rendering first (check mob_ prefixed name for shared names)
        const mobSpriteName = 'mob_' + type;
        if (typeof Sprites !== 'undefined' && Sprites.has(mobSpriteName)) {
            Sprites.draw(ctx, mobSpriteName, x, y, size, false);
            return;
        }
        if (typeof Sprites !== 'undefined' && Sprites.has(type)) {
            Sprites.draw(ctx, type, x, y, size, false);
            return;
        }

        // Fallback: fillRect pixel drawing
        const s = size;
        const colors = {
            zombie: { head: '#5a8a5a', body: '#3b8ed0', eyes: '#000' },
            skeleton: { head: '#d8d8d8', body: '#c8c8c8', eyes: '#000' },
            creeper: { head: '#5daa3a', body: '#5daa3a', eyes: '#000' },
            enderman: { head: '#1a1a1a', body: '#1a1a1a', eyes: '#cc44ff' },
            octorok: { head: '#cc3333', body: '#cc3333', eyes: '#fff' },
            keese: { head: '#2a2a3a', body: '#2a2a3a', eyes: '#ff4444' },
            dekuscrub: { head: '#5a8a3a', body: '#7a5a2a', eyes: '#000' },
            ganondorf: { head: '#6a4a2a', body: '#2a2a2a', eyes: '#ff2222' },
            enderdragon: { head: '#1a1a2a', body: '#1a1a2a', eyes: '#cc44ff' },
            wither: { head: '#2a2a2a', body: '#1a1a1a', eyes: '#ffffff' }
        };
        const c = colors[type] || colors.zombie;
        // Body
        ctx.fillStyle = c.body;
        ctx.fillRect(x + 2, y + Math.floor(s * 0.4), s - 4, Math.floor(s * 0.4));
        // Head
        ctx.fillStyle = c.head;
        ctx.fillRect(x, y, s, Math.floor(s * 0.4));
        // Eyes
        ctx.fillStyle = c.eyes;
        if (type === 'creeper') {
            // Creeper face
            ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.1), 3, 3);
            ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.1), 3, 3);
            ctx.fillRect(x + Math.floor(s * 0.35), y + Math.floor(s * 0.2), 4, 4);
        } else {
            ctx.fillRect(x + Math.floor(s * 0.15), y + Math.floor(s * 0.15), 3, 2);
            ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.15), 3, 2);
        }
        // Legs
        ctx.fillStyle = c.body;
        ctx.fillRect(x + 2, y + Math.floor(s * 0.8), Math.floor(s * 0.35), Math.floor(s * 0.2));
        ctx.fillRect(x + s - Math.floor(s * 0.35) - 2, y + Math.floor(s * 0.8), Math.floor(s * 0.35), Math.floor(s * 0.2));
    }

    // Draw a companion pet next to the player
    function drawPet(x, y, size, petType, frame) {
        const s = size || 10;
        const reactionBounce = getPetReactionBounce();
        const bobY = Math.sin(frame * 0.04) * 1 - reactionBounce;
        const py = y + bobY;

        // Draw heart particle during reaction
        if (isPetReacting() && petReactionTimer % 10 === 0) {
            addParticle(x + s / 2, py - 4, '#e94560', '\u2764', 25);
        }

        // Try sprite-based rendering first
        const spriteName = 'pet_' + petType;
        if (Sprites.has(spriteName)) {
            Sprites.draw(ctx, spriteName, x, py, s);
            return;
        }

        // Fallback to procedural drawing
        const pets = {
            wolf: { body: '#c8c8c8', head: '#d8d8d8', eyes: '#333', accent: '#8B6914', tail: true },
            cat: { body: '#f5a623', head: '#f5b840', eyes: '#2a8a2a', accent: '#d48c1a', tail: true },
            parrot: { body: '#e83030', head: '#30c030', eyes: '#000', accent: '#3060e8', tail: false, wings: true },
            fox: { body: '#d47020', head: '#e88030', eyes: '#333', accent: '#fff', tail: true },
            axolotl: { body: '#e890b0', head: '#f0a0c0', eyes: '#333', accent: '#ff6090', frills: true },
            bee: { body: '#f5c518', head: '#f5d030', eyes: '#000', accent: '#2a2a2a', wings: true },
            rabbit: { body: '#b08060', head: '#c09070', eyes: '#333', accent: '#e8d8c8', tail: true },
            turtle: { body: '#3a8a3a', head: '#4a9a4a', eyes: '#333', accent: '#2a6a2a', shell: true }
        };

        const p = pets[petType];
        if (!p) return;

        // Body
        ctx.fillStyle = p.body;
        ctx.fillRect(x + 1, py + Math.floor(s * 0.4), s - 2, Math.floor(s * 0.35));

        // Head
        ctx.fillStyle = p.head;
        ctx.fillRect(x, py, Math.floor(s * 0.7), Math.floor(s * 0.45));

        // Eyes
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 1, py + Math.floor(s * 0.15), 1, 1);
        ctx.fillRect(x + Math.floor(s * 0.4), py + Math.floor(s * 0.15), 1, 1);

        // Legs (tiny)
        ctx.fillStyle = p.body;
        ctx.fillRect(x + 1, py + Math.floor(s * 0.75), 2, Math.floor(s * 0.25));
        ctx.fillRect(x + s - 4, py + Math.floor(s * 0.75), 2, Math.floor(s * 0.25));

        // Tail
        if (p.tail) {
            ctx.fillStyle = p.accent;
            const tailWag = Math.sin(frame * 0.06) * 2;
            ctx.fillRect(x + s - 1, py + Math.floor(s * 0.3) + tailWag, 2, 3);
        }

        // Wings (parrot)
        if (p.wings) {
            ctx.fillStyle = p.accent;
            const wingFlap = Math.sin(frame * 0.08) > 0 ? -1 : 0;
            ctx.fillRect(x - 1, py + Math.floor(s * 0.4) + wingFlap, 2, 3);
            ctx.fillRect(x + s - 1, py + Math.floor(s * 0.4) + wingFlap, 2, 3);
        }

        // Frills (axolotl)
        if (p.frills) {
            ctx.fillStyle = p.accent;
            ctx.fillRect(x - 1, py + 1, 1, 3);
            ctx.fillRect(x + Math.floor(s * 0.7), py + 1, 1, 3);
        }

        // Shell (turtle)
        if (p.shell) {
            ctx.fillStyle = p.accent;
            ctx.fillRect(x + 2, py + Math.floor(s * 0.3), s - 3, Math.floor(s * 0.4));
            // Shell pattern
            ctx.fillStyle = '#1a5a1a';
            ctx.fillRect(x + Math.floor(s * 0.4), py + Math.floor(s * 0.35), 2, Math.floor(s * 0.25));
        }

        // Stripes (bee)
        if (petType === 'bee') {
            ctx.fillStyle = p.accent;
            ctx.fillRect(x + 3, py + Math.floor(s * 0.45), 2, Math.floor(s * 0.25));
            ctx.fillRect(x + s - 5, py + Math.floor(s * 0.45), 2, Math.floor(s * 0.25));
        }
    }

    // Draw sky background
    function drawSky(biome = 'plains', timeOfDay = 'day') {
        const gradient = ctx.createLinearGradient(0, 0, 0, H);
        if (timeOfDay === 'night') {
            gradient.addColorStop(0, '#0a0a2e');
            gradient.addColorStop(1, '#1a1a4e');
        } else {
            const skies = {
                plains: ['#78b9ff', '#a8d4ff'],
                forest: ['#5a9acc', '#88bbdd'],
                desert: ['#c8a850', '#e8d090'],
                snow: ['#b8d0e8', '#d8e8f4'],
                cave: ['#1a1a2e', '#2a2a3e'],
                nether: ['#330000', '#660000'],
                end: ['#0a0020', '#1a0040']
            };
            const s = skies[biome] || skies.plains;
            gradient.addColorStop(0, s[0]);
            gradient.addColorStop(1, s[1]);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Stars at night or in cave/nether
        // Desert sun heat shimmer
        if (biome === 'desert' && timeOfDay !== 'night') {
            ctx.fillStyle = '#FFE87C';
            ctx.fillRect(W - 28, 12, 16, 16); // bigger sun for desert
        }

        // Snow: gentle snowflakes
        if (biome === 'snow') {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 30; i++) {
                const sx = (i * 41 + frame * 0.3) % W;
                const sy = (i * 31 + frame * 0.5) % H;
                ctx.globalAlpha = 0.4 + Math.sin(frame * 0.02 + i) * 0.2;
                ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
            }
            ctx.globalAlpha = 1;
        }

        if (timeOfDay === 'night' || biome === 'cave' || biome === 'end') {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 20; i++) {
                const sx = (i * 37 + frame * 0.008) % W;
                const sy = (i * 23) % (H * 0.6);
                const blink = Math.sin(frame * 0.02 + i) > 0.3 ? 1 : 0;
                if (blink) ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
            }
        }

        // Sun/Moon
        if (timeOfDay === 'day' && biome !== 'cave' && biome !== 'nether') {
            ctx.fillStyle = '#FFE87C';
            ctx.fillRect(W - 30, 15, 12, 12);
        }
    }

    // Draw ground blocks
    function drawGround(biome = 'plains', groundY) {
        groundY = groundY || Math.floor(H * 0.75);
        const bs = 16; // block size (ctx.scale handles display scaling)
        const biomeBlocks = {
            nether: ['lava', 'obsidian'],
            cave: ['stone', 'stone'],
            end: ['obsidian', 'obsidian'],
            desert: ['sand', 'sandstone'],
            snow: ['snow', 'dirt']
        };
        const [topBlock, underBlock] = biomeBlocks[biome] || ['grass', 'dirt'];

        for (let x = 0; x < W; x += bs) {
            drawBlock(x, groundY, bs, topBlock);
            for (let y = groundY + bs; y < H; y += bs) {
                drawBlock(x, y, bs, underBlock);
            }
        }
    }

    // Draw a pre-loaded background image, scaled to fill the canvas
    function drawBackground(type) {
        const img = bgImages[type];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, W, H);
            return true;
        }
        // Fallback to programmatic drawing if image not loaded
        return false;
    }

    // Draw the title logo image
    function drawTitleLogo(x, y, w, h) {
        if (titleLogoImg && titleLogoImg.complete && titleLogoImg.naturalWidth > 0) {
            ctx.drawImage(titleLogoImg, x, y, w, h);
            return true;
        }
        return false;
    }

    // Draw a simple tree
    function drawTree(x, y) {
        // Trunk
        ctx.fillStyle = BLOCK_COLORS.wood;
        ctx.fillRect(x + 5, y - 20, 6, 20);
        // Leaves
        ctx.fillStyle = BLOCK_COLORS.leaves;
        ctx.fillRect(x - 2, y - 36, 20, 16);
        ctx.fillRect(x + 2, y - 42, 12, 8);
    }

    // Particles
    function addParticle(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 1,
                life: 20 + Math.random() * 15,
                color,
                size: 1 + Math.floor(Math.random() * 2)
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, p.life / 10);
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    // Draw text on canvas (pixel-style)
    function drawText(text, x, y, size = 8, color = '#ffffff', align = 'left') {
        ctx.font = `${size}px "Press Start 2P", monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'top';
        // Strong outline for readability
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    // Title screen scene — animated Steve mines blocks, pet follows
    let titleBlocks = [];
    let titleCharX = -10;
    let titleTargetX = 30;
    let titleMining = false;
    let titleMineTimer = 0;
    let titlePickSwing = 0;
    let titleBlockBreaks = 0;
    let titlePetX = -30;

    function resetTitleBlocks() {
        titleBlocks = [];
        const words = ['the', 'can', 'look', 'play', 'run', 'see', 'go', 'he'];
        const types = ['diamond', 'gold', 'iron', 'dirt', 'stone', 'gold', 'diamond', 'iron'];
        for (let i = 0; i < words.length; i++) {
            titleBlocks.push({
                x: 50 + (i % 4) * 68,
                y: 25 + Math.floor(i / 4) * 40 + Math.sin(i * 1.3) * 6,
                word: words[i],
                type: types[i],
                alive: true,
                cracking: 0,
                shakeTimer: 0
            });
        }
        titleBlockBreaks = 0;
    }

    function drawTitleScene() {
        // Note: frame is incremented by startLoop(), NOT here (avoids double-speed bug)

        // Initialize blocks on first frame or when all mined
        if (titleBlocks.length === 0 || titleBlocks.every(b => !b.alive)) {
            resetTitleBlocks();
            titleCharX = -10;
            titleTargetX = 30;
        }

        const biome = Progress.get().world || 'plains';

        // Try background image first, fall back to programmatic
        if (!drawBackground(biome)) {
            drawSky(biome);
            // Mountains in background
            ctx.fillStyle = '#6a8a5a';
            ctx.beginPath();
            ctx.moveTo(0, H * 0.6);
            ctx.lineTo(60, H * 0.35);
            ctx.lineTo(120, H * 0.55);
            ctx.lineTo(180, H * 0.3);
            ctx.lineTo(240, H * 0.5);
            ctx.lineTo(320, H * 0.45);
            ctx.lineTo(320, H * 0.6);
            ctx.fill();
            // Trees
            if (biome === 'plains' || biome === 'forest') {
                drawTree(30, H * 0.75);
                drawTree(250, H * 0.75);
            }
            // Ground
            drawGround(biome);
        }

        const groundLevel = H * 0.75;
        const charSize = 24;
        const skin = Progress.get().skin || 'steve';
        const petType = Progress.get().pet;

        // Find next alive block to target
        const nextBlock = titleBlocks.find(b => b.alive);
        if (nextBlock) {
            titleTargetX = nextBlock.x - 20;
        }

        // Smooth walk toward target
        const dx = titleTargetX - titleCharX;
        if (Math.abs(dx) > 2) {
            titleCharX += Math.sign(dx) * Math.max(Math.abs(dx) * 0.06, 0.5);
            titleMining = false;
        } else {
            titleCharX = titleTargetX;
            // Mine the block!
            if (nextBlock && nextBlock.alive) {
                titleMining = true;
                titleMineTimer++;
                // Swing pick every 20 frames
                if (titleMineTimer % 20 === 0) {
                    titlePickSwing = 12;
                    nextBlock.shakeTimer = 8;
                    nextBlock.cracking++;
                    addParticle(nextBlock.x + 10, nextBlock.y + 10, BLOCK_COLORS[nextBlock.type] || '#888', 3);
                }
                // Break after 2 hits
                if (nextBlock.cracking >= 2) {
                    nextBlock.alive = false;
                    titleMineTimer = 0;
                    titleBlockBreaks++;
                    addParticle(nextBlock.x + 10, nextBlock.y + 10, BLOCK_COLORS[nextBlock.type] || '#888', 10);
                }
            }
        }

        // Draw blocks
        titleBlocks.forEach(b => {
            if (!b.alive) return;
            const bobY = Math.sin(frame * 0.025 + b.x * 0.1) * 3;
            const shakeX = b.shakeTimer > 0 ? (Math.random() - 0.5) * 3 : 0;
            const shakeY = b.shakeTimer > 0 ? (Math.random() - 0.5) * 2 : 0;
            if (b.shakeTimer > 0) b.shakeTimer--;

            drawBlock(b.x + shakeX, b.y + bobY + shakeY, 20, b.type);

            // Crack overlay
            if (b.cracking > 0) {
                ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                ctx.lineWidth = 1.5;
                const cx = b.x + shakeX + 10;
                const cy = b.y + bobY + shakeY + 10;
                ctx.beginPath();
                ctx.moveTo(cx - 4, cy - 4);
                ctx.lineTo(cx + 3, cy + 5);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx + 4, cy - 3);
                ctx.lineTo(cx - 3, cy + 4);
                ctx.stroke();
            }

            // Word label
            const tw = b.word.length * (7 * 0.8);
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(b.x + 10 - tw / 2 - 3, b.y + bobY - 12, tw + 6, 12);
            drawText(b.word, b.x + 10, b.y + bobY - 11, 7, '#fff', 'center');
        });

        // Character
        const isWalking = Math.abs(dx) > 2;
        const bobY = isWalking ? Math.sin(frame * 0.12) * 1.5 : Math.sin(frame * 0.04) * 0.5;
        const facingRight = dx >= 0;
        drawCharacter(titleCharX, groundLevel - charSize - 4 + bobY, charSize, skin, facingRight, isWalking);

        // Pickaxe swing when mining
        if (titlePickSwing > 0) titlePickSwing--;
        if (titleMining || titlePickSwing > 0) {
            const swingAngle = titlePickSwing > 0 ? Math.sin(titlePickSwing * 0.5) * 0.8 : Math.sin(frame * 0.05) * 0.1;
            const toolX = titleCharX + (facingRight ? 18 : -4);
            const toolY = groundLevel - charSize + 4 + bobY;
            ctx.save();
            ctx.translate(toolX, toolY);
            ctx.rotate(swingAngle);
            ctx.fillStyle = '#4AEDD9';
            ctx.fillRect(-1, -5, 3, 3);
            ctx.fillRect(1, -3, 3, 2);
            ctx.fillStyle = '#8B5E3C';
            ctx.fillRect(0, -1, 2, 8);
            ctx.restore();
        }

        // Pet companion following Steve
        if (petType) {
            // Pet follows behind Steve
            titlePetX += (titleCharX - 18 - titlePetX) * 0.05;
            drawPet(titlePetX, groundLevel - 14 + Math.sin(frame * 0.04) * 0.5, 12, petType, frame);
        }

        updateParticles();
        drawParticles();
    }

    // Generic game loop
    function startLoop(callback) {
        renderCallback = callback;
        function loop() {
            frame++;
            if (renderCallback) renderCallback(ctx, W, H, frame);
            updateParticles();
            drawParticles();
            animId = requestAnimationFrame(loop);
        }
        loop();
    }

    function stopLoop() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        renderCallback = null;
    }

    function clear() {
        if (ctx) ctx.clearRect(0, 0, W, H);
    }

    function getCtx() { return ctx; }
    function getFrame() { return frame; }

    // Pet reaction system — bounce + heart on correct answer
    let petReactionTimer = 0;
    function triggerPetReaction() {
        petReactionTimer = 30; // half a second at 60fps
    }
    function getPetReactionBounce() {
        if (petReactionTimer > 0) {
            petReactionTimer--;
            return Math.sin(petReactionTimer * 0.4) * 3;
        }
        return 0;
    }
    function isPetReacting() { return petReactionTimer > 0; }

    return {
        init, resize, clear, getCtx, getFrame,
        drawBlock, drawCharacter, drawCharacterDirect, drawMob, drawPet, drawSky, drawGround, drawTree,
        drawBackground, drawTitleLogo, drawText, drawTitleScene, addParticle,
        startLoop, stopLoop, triggerPetReaction, getPetReactionBounce, isPetReacting,
        getScale: () => S,
        BLOCK_COLORS, SKINS, W, H
    };
})();
