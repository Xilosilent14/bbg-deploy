/* ============================================
   SPRITES — Character & Mob Sprite Loader
   Loads PNG spritesheets, removes magenta bg,
   and provides draw functions for game entities.
   ============================================ */
const Sprites = (() => {
    const loaded = {};       // name -> HTMLCanvasElement (processed sprite)
    const sheets = {};       // sheet name -> Image element
    let ready = false;
    let onReadyCallbacks = [];

    // Sprite definitions: where each character lives in its sheet
    // Format: { sheet, row, col } — row/col in the 3-col grid
    const PLAYER_SPRITES = {
        steve:     { sheet: 'players', row: 0, col: 0 },
        alex:      { sheet: 'players', row: 0, col: 1 },
        link:      { sheet: 'players', row: 0, col: 2 },
        younglink: { sheet: 'players', row: 1, col: 0 },
        zelda:     { sheet: 'players', row: 1, col: 1 },
        sheik:     { sheet: 'players', row: 1, col: 2 },
        creeper:   { sheet: 'extra_skins', row: 0, col: 0 },
        enderman:  { sheet: 'extra_skins', row: 0, col: 1 },
        diamond:   { sheet: 'extra_skins', row: 1, col: 0 },
        netherite: { sheet: 'extra_skins', row: 1, col: 1 }
    };

    const PET_SPRITES = {
        pet_wolf:    { sheet: 'pets', row: 0, col: 0 },
        pet_cat:     { sheet: 'pets', row: 0, col: 1 },
        pet_bee:     { sheet: 'pets', row: 0, col: 2 },
        pet_parrot:  { sheet: 'pets', row: 0, col: 3 },
        pet_rabbit:  { sheet: 'pets', row: 1, col: 0 },
        pet_fox:     { sheet: 'pets', row: 1, col: 1 },
        pet_turtle:  { sheet: 'pets', row: 1, col: 2 },
        pet_axolotl: { sheet: 'pets', row: 1, col: 3 }
    };

    const ENEMY_SPRITES = {
        zombie:      { sheet: 'enemies', row: 0, col: 0 },
        skeleton:    { sheet: 'enemies', row: 0, col: 1 },
        mob_creeper: { sheet: 'enemies', row: 0, col: 2 },
        octorok:     { sheet: 'enemies', row: 1, col: 0 },
        keese:       { sheet: 'enemies', row: 1, col: 1 },
        dekuscrub:   { sheet: 'enemies', row: 1, col: 2 },
        ganondorf:   { sheet: 'enemies', row: 2, col: 0 },
        enderdragon: { sheet: 'enemies', row: 2, col: 1 },
        wither:      { sheet: 'enemies', row: 2, col: 2 }
    };

    const TOOL_SPRITES = {
        wood_pickaxe:    { sheet: 'tools', row: 0, col: 0 },
        stone_pickaxe:   { sheet: 'tools', row: 0, col: 1 },
        iron_pickaxe:    { sheet: 'tools', row: 0, col: 2 },
        gold_pickaxe:    { sheet: 'tools', row: 1, col: 0 },
        diamond_pickaxe: { sheet: 'tools', row: 1, col: 1 },
        master_sword:    { sheet: 'tools', row: 1, col: 2 }
    };

    const ALL_SPRITES = Object.assign({}, PLAYER_SPRITES, ENEMY_SPRITES, TOOL_SPRITES, PET_SPRITES);

    // Sheet configs: how to slice each spritesheet
    const SHEET_CONFIG = {
        players:     { src: 'assets/sprites/player-skins.png', cols: 3, rows: 3 },
        extra_skins: { src: 'assets/sprites/extra-skins.png', cols: 2, rows: 2 },
        enemies:     { src: 'assets/sprites/enemies-bosses.png', cols: 3, rows: 3 },
        tools:       { src: 'assets/sprites/tools-items.png', cols: 3, rows: 2 },
        pets:        { src: 'assets/sprites/pets.png', cols: 4, rows: 2 }
    };

    /**
     * Load all spritesheets and extract individual sprites
     */
    function load() {
        const sheetNames = Object.keys(SHEET_CONFIG);
        let loadedCount = 0;

        sheetNames.forEach(name => {
            const cfg = SHEET_CONFIG[name];
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                sheets[name] = img;
                extractSprites(name, img, cfg);
                loadedCount++;
                if (loadedCount === sheetNames.length) {
                    ready = true;
                    onReadyCallbacks.forEach(cb => cb());
                    onReadyCallbacks = [];
                }
            };
            img.onerror = () => {
                console.warn(`Sprites: failed to load ${cfg.src}, using fallback`);
                loadedCount++;
                if (loadedCount === sheetNames.length) {
                    ready = true;
                    onReadyCallbacks.forEach(cb => cb());
                    onReadyCallbacks = [];
                }
            };
            img.src = cfg.src;
        });
    }

    /**
     * Extract individual sprites from a loaded spritesheet
     * Removes magenta (#FF00FF) background -> transparent
     */
    function extractSprites(sheetName, img, cfg) {
        const cellW = Math.floor(img.width / cfg.cols);
        const cellH = Math.floor(img.height / cfg.rows);

        // Find all sprites that belong to this sheet
        Object.entries(ALL_SPRITES).forEach(([spriteName, def]) => {
            if (def.sheet !== sheetName) return;

            const sx = def.col * cellW;
            const sy = def.row * cellH;

            // Create a temp canvas to extract and process this sprite
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cellW;
            tempCanvas.height = cellH;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, sx, sy, cellW, cellH, 0, 0, cellW, cellH);

            // Remove magenta background
            const imageData = tempCtx.getImageData(0, 0, cellW, cellH);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                // Magenta and near-magenta detection (wide tolerance for AI-generated art)
                // Catches pure magenta, dark magenta, pink-magenta, and anti-aliased edges
                // Key: R and B both significantly higher than G, forming magenta hue
                const magentaScore = (r + b) / 2 - g;
                if (r > 140 && b > 140 && magentaScore > 60) {
                    data[i + 3] = 0; // Make transparent
                }
            }
            tempCtx.putImageData(imageData, 0, 0);

            // Crop to tight bounding box (remove empty space)
            const cropped = cropToContent(tempCanvas);
            loaded[spriteName] = cropped;
        });
    }

    /**
     * Crop a canvas to its non-transparent content
     */
    function cropToContent(sourceCanvas) {
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        const ctx = sourceCanvas.getContext('2d');
        const data = ctx.getImageData(0, 0, w, h).data;

        let top = h, bottom = 0, left = w, right = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const alpha = data[(y * w + x) * 4 + 3];
                if (alpha > 10) {
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                    if (x < left) left = x;
                    if (x > right) right = x;
                }
            }
        }

        // If empty, return 1x1 transparent
        if (top >= bottom || left >= right) {
            const c = document.createElement('canvas');
            c.width = 1; c.height = 1;
            return c;
        }

        const cropW = right - left + 1;
        const cropH = bottom - top + 1;
        const cropped = document.createElement('canvas');
        cropped.width = cropW;
        cropped.height = cropH;
        const cropCtx = cropped.getContext('2d');
        cropCtx.drawImage(sourceCanvas, left, top, cropW, cropH, 0, 0, cropW, cropH);
        return cropped;
    }

    /**
     * Draw a sprite onto a canvas context
     * @param {CanvasRenderingContext2D} ctx - Target context
     * @param {string} name - Sprite name (e.g., 'steve', 'zombie')
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Target size (width = height)
     * @param {boolean} flipH - Flip horizontally (face left)
     */
    function draw(ctx, name, x, y, size, flipH = false) {
        const sprite = loaded[name];
        if (!sprite) return false; // Sprite not loaded

        ctx.save();
        if (flipH) {
            ctx.translate(x + size, y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0, size, size);
        } else {
            ctx.drawImage(sprite, x, y, size, size);
        }
        ctx.restore();
        return true;
    }

    /**
     * Check if a sprite exists and is loaded
     */
    function has(name) {
        return !!loaded[name];
    }

    /**
     * Check if all sprites are loaded
     */
    function isReady() {
        return ready;
    }

    /**
     * Register a callback for when sprites finish loading
     */
    function onReady(cb) {
        if (ready) { cb(); return; }
        onReadyCallbacks.push(cb);
    }

    /**
     * Get list of all available player skin names
     */
    function getPlayerSkins() {
        return Object.keys(PLAYER_SPRITES);
    }

    /**
     * Get list of all available enemy/boss names
     */
    function getEnemyNames() {
        return Object.keys(ENEMY_SPRITES);
    }

    // Auto-load on script include
    load();

    return {
        draw,
        has,
        isReady,
        onReady,
        getPlayerSkins,
        getEnemyNames,
        loaded // expose for debugging
    };
})();
