#!/usr/bin/env node
/**
 * process-sprite.js — Process a downloaded car image:
 *   1. Remove green (#00FF00) background -> transparent
 *   2. Auto-crop to car bounds
 *   3. Optionally flip horizontally (use --noflip if car already faces right)
 *   4. Resize to 400x200 (maintaining aspect ratio, centered)
 *   5. Save as PNG with transparency
 *
 * Usage: node tools/process-sprite.js <input-image> <output-name> [--noflip]
 * Example: node tools/process-sprite.js "Downloads/corvette.png" c1
 * Example: node tools/process-sprite.js "Downloads/corvette.png" c1 --noflip
 */
const sharp = require('sharp');
const path = require('path');

// Parse args - support --noflip anywhere in args
const args = process.argv.slice(2);
const noFlip = args.includes('--noflip');
const positionalArgs = args.filter(a => !a.startsWith('--'));
const inputPath = positionalArgs[0];
const outputName = positionalArgs[1];

if (!inputPath || !outputName) {
    console.error('Usage: node tools/process-sprite.js <input-image> <output-name> [--noflip]');
    console.error('Example: node tools/process-sprite.js "Downloads/car.png" c1');
    console.error('Use --noflip if car already faces RIGHT (no horizontal flip needed)');
    process.exit(1);
}

const OUTPUT_W = 400;
const OUTPUT_H = 200;
const outDir = path.join(__dirname, '..', 'img', 'cars');

async function processImage() {
    console.log(`Processing: ${inputPath}`);

    // Load the image
    const img = sharp(inputPath);
    const { width, height, channels } = await img.metadata();
    console.log(`  Input: ${width}x${height}, ${channels} channels`);

    // Get raw pixel data
    const rawBuffer = await img.ensureAlpha().raw().toBuffer();
    const pixels = new Uint8Array(rawBuffer);

    // Remove green background: any pixel close to #00FF00 becomes transparent
    let greenRemoved = 0;
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Check if pixel is "green-ish" (generous tolerance for anti-aliasing)
        if (g > 180 && r < 150 && b < 150 && g > r + 50 && g > b + 50) {
            pixels[i + 3] = 0; // Set alpha to 0 (transparent)
            greenRemoved++;
        }
        // Also handle anti-aliased edges (semi-green pixels)
        else if (g > 150 && r < 180 && b < 180 && g > r && g > b) {
            // Partial transparency based on how green it is
            const greenness = (g - Math.max(r, b)) / g;
            if (greenness > 0.2) {
                pixels[i + 3] = Math.round(255 * (1 - greenness));
                greenRemoved++;
            }
        }
    }
    console.log(`  Removed ${greenRemoved} green pixels`);

    // Create image from modified pixel data
    const processed = sharp(Buffer.from(pixels), {
        raw: { width, height, channels: 4 }
    });

    // Auto-trim transparent edges
    const trimmed = await processed.trim().toBuffer({ resolveWithObject: true });
    console.log(`  Trimmed to: ${trimmed.info.width}x${trimmed.info.height}`);

    // Optionally flip horizontally so car faces RIGHT
    // Use --noflip if the source image already faces right
    let pipeline = sharp(trimmed.data, {
        raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 }
    });
    if (!noFlip) {
        pipeline = pipeline.flop();  // Horizontal flip: left-facing -> right-facing
        console.log('  Flipped horizontally (use --noflip to skip)');
    } else {
        console.log('  Skipping flip (--noflip specified)');
    }
    const resized = await pipeline
    .resize(OUTPUT_W - 20, OUTPUT_H - 20, {  // Leave 10px margin
        fit: 'inside',
        withoutEnlargement: false
    })
    .png()
    .toBuffer({ resolveWithObject: true });

    console.log(`  Resized to: ${resized.info.width}x${resized.info.height}`);

    // Center on transparent canvas
    const outputPath = path.join(outDir, outputName + '.png');
    const left = Math.round((OUTPUT_W - resized.info.width) / 2);
    const top = Math.round((OUTPUT_H - resized.info.height) / 2);

    await sharp({
        create: {
            width: OUTPUT_W,
            height: OUTPUT_H,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
    .composite([{
        input: resized.data,
        left,
        top
    }])
    .png()
    .toFile(outputPath);

    console.log(`  Saved: ${outputPath}`);
    console.log('Done!');
}

processImage().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
