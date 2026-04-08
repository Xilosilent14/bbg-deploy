#!/usr/bin/env node
/**
 * render-sprites.js — Generate car sprite PNGs from CorvetteRenderer.
 * Renders each car as a white sprite on transparent background.
 * Output: img/cars/{genId}.png
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Load cars.js by evaluating it (it defines a global CorvetteRenderer)
const vm = require('vm');
const carsCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'cars.js'), 'utf8');
// Replace browser APIs with Node equivalents
const cleanCode = carsCode
    .replace('const CorvetteRenderer =', 'CorvetteRenderer =') // make global in VM context
    .replace(/new Image\(\)/g, '({src:"",onload:null,onerror:null})')
    .replace(/document\.createElement\('canvas'\)/g, 'require("canvas").createCanvas(1,1)');
// Run in a context that exposes CorvetteRenderer globally
const context = vm.createContext({
    require: require,
    console: console,
    Math: Math,
    parseInt: parseInt,
    document: { createElement: (tag) => {
        if (tag === 'canvas') return require('canvas').createCanvas(1, 1);
        return {};
    }}
});
vm.runInContext(cleanCode, context);
const CorvetteRenderer = context.CorvetteRenderer;

const SPRITE_W = 400;
const SPRITE_H = 200;
const outDir = path.join(__dirname, '..', 'img', 'cars');

// Ensure output directory exists
fs.mkdirSync(outDir, { recursive: true });

// Patch _getTintedSprite to use node-canvas
CorvetteRenderer._getTintedSprite = function() { return null; };

// Stub out wheels, headlights, taillights — game draws these dynamically
const origWheel = CorvetteRenderer._drawWheel;
const origHead = CorvetteRenderer._drawHeadlight;
const origTail = CorvetteRenderer._drawTaillight;
const origShadow = CorvetteRenderer._drawGroundShadow;
CorvetteRenderer._drawWheel = function() {};
CorvetteRenderer._drawHeadlight = function() {};
CorvetteRenderer._drawTaillight = function() {};
CorvetteRenderer._drawGroundShadow = function() {};

let count = 0;
const genIds = Object.keys(CorvetteRenderer.generations);

for (const genId of genIds) {
    const gen = CorvetteRenderer.generations[genId];
    const canvas = createCanvas(SPRITE_W, SPRITE_H);
    const ctx = canvas.getContext('2d');

    try {
        // Render white car body only at garage LOD (no wheels/lights/shadow)
        CorvetteRenderer.drawCar(ctx, genId,
            SPRITE_W * 0.5, SPRITE_H * 0.5,
            SPRITE_W * 0.85, SPRITE_H * 0.65,
            '#FFFFFF', { lod: 'garage', isPlayer: true }
        );

        // Save as PNG
        const outPath = path.join(outDir, genId + '.png');
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outPath, buffer);
        count++;
        console.log(`  OK: ${genId}.png (${buffer.length} bytes) — ${gen.name}`);
    } catch (e) {
        console.error(`  FAIL: ${genId} — ${e.message}`);
    }
}

console.log(`\nGenerated ${count}/${genIds.length} sprites in ${outDir}`);
