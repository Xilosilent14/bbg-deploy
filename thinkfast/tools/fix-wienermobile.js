#!/usr/bin/env node
/**
 * Remove the backwards "Oscar Mayer" label from the wienermobile sprite.
 * Clone-stamps the hot dog body texture from either side of the label.
 */
const sharp = require('sharp');
const path = require('path');

const spritePath = path.join(__dirname, '..', 'img', 'cars', 'wienermobile.png');

async function fix() {
    const img = sharp(spritePath);
    const { width, height } = await img.metadata();
    console.log(`Image: ${width}x${height}`);

    const rawBuffer = await img.ensureAlpha().raw().toBuffer();
    const pixels = new Uint8Array(rawBuffer);
    // Keep original for sampling
    const original = new Uint8Array(rawBuffer);

    // The label rectangle in the sprite (generous bounds)
    const LX1 = 110, LX2 = 200;
    const LY1 = 64, LY2 = 124;

    // The hot dog body to the LEFT of the label is clean starting ~x=80
    // The hot dog body to the RIGHT of the label is clean starting ~x=210
    // We'll sample from both sides and blend

    const leftSampleOffset = LX1 - 80;  // sample ~33px to the left
    const rightSampleOffset = 210 - LX2; // sample ~12px to the right

    function getOrigPixel(x, y) {
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        const i = (y * width + x) * 4;
        return { r: original[i], g: original[i+1], b: original[i+2], a: original[i+3] };
    }

    function setPixel(x, y, r, g, b) {
        const i = (y * width + x) * 4;
        pixels[i] = Math.max(0, Math.min(255, r));
        pixels[i+1] = Math.max(0, Math.min(255, g));
        pixels[i+2] = Math.max(0, Math.min(255, b));
    }

    let replaced = 0;

    for (let y = LY1; y <= LY2; y++) {
        for (let x = LX1; x <= LX2; x++) {
            const p = getOrigPixel(x, y);
            if (!p || p.a < 50) continue;

            // How far across the label are we? 0=left edge, 1=right edge
            const t = (x - LX1) / (LX2 - LX1);

            // Sample from left side (mirror position relative to left edge)
            const leftSrcX = LX1 - (x - LX1) - 5;
            const leftP = getOrigPixel(leftSrcX, y);

            // Sample from right side (mirror position relative to right edge)
            const rightSrcX = LX2 + (LX2 - x) + 5;
            const rightP = getOrigPixel(rightSrcX, y);

            let r, g, b;

            if (leftP && leftP.a > 128 && rightP && rightP.a > 128) {
                // Blend: favor left when near left edge, right when near right
                r = Math.round(leftP.r * (1 - t) + rightP.r * t);
                g = Math.round(leftP.g * (1 - t) + rightP.g * t);
                b = Math.round(leftP.b * (1 - t) + rightP.b * t);
            } else if (leftP && leftP.a > 128) {
                r = leftP.r; g = leftP.g; b = leftP.b;
            } else if (rightP && rightP.a > 128) {
                r = rightP.r; g = rightP.g; b = rightP.b;
            } else {
                continue;
            }

            setPixel(x, y, r, g, b);
            replaced++;
        }
    }

    console.log(`Clone-stamped ${replaced} pixels`);

    // Light blur pass for smooth blending
    const buf = Buffer.from(pixels);
    for (let pass = 0; pass < 2; pass++) {
        for (let y = LY1 + 1; y < LY2 - 1; y++) {
            for (let x = LX1 + 1; x < LX2 - 1; x++) {
                const i = (y * width + x) * 4;
                if (pixels[i + 3] < 50) continue;

                let sr = 0, sg = 0, sb = 0, cnt = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const ni = ((y + dy) * width + (x + dx)) * 4;
                        if (pixels[ni + 3] > 50) {
                            sr += pixels[ni]; sg += pixels[ni+1]; sb += pixels[ni+2]; cnt++;
                        }
                    }
                }
                if (cnt > 0) {
                    buf[i] = Math.round(sr / cnt);
                    buf[i+1] = Math.round(sg / cnt);
                    buf[i+2] = Math.round(sb / cnt);
                }
            }
        }
        for (let y = LY1; y <= LY2; y++) {
            for (let x = LX1; x <= LX2; x++) {
                const i = (y * width + x) * 4;
                pixels[i] = buf[i]; pixels[i+1] = buf[i+1]; pixels[i+2] = buf[i+2];
            }
        }
    }

    await sharp(Buffer.from(pixels), {
        raw: { width, height, channels: 4 }
    }).png().toFile(spritePath);

    console.log(`Saved: ${spritePath}`);
}

fix().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
