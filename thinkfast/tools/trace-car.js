#!/usr/bin/env node
/**
 * trace-car.js — Convert a car silhouette image to game contour coordinates.
 *
 * Usage: node tools/trace-car.js <image-path> [car-id]
 *
 * Input: A PNG/JPG image of a car side profile (silhouette or photo).
 *        Best results with: black car on white background, facing RIGHT.
 *        The script will auto-threshold to create a clean silhouette.
 *
 * Output: Prints the body contour array in our game's coordinate format
 *         (normalized 0-1 range, M/L/C/Q commands).
 */

const potrace = require('potrace');
const sharp = require('sharp');
const { parseSVG } = require('svg-path-parser');
const path = require('path');
const fs = require('fs');

const inputPath = process.argv[2];
const carId = process.argv[3] || path.basename(inputPath, path.extname(inputPath));

if (!inputPath) {
    console.error('Usage: node tools/trace-car.js <image-path> [car-id]');
    console.error('');
    console.error('The image should be a side-profile silhouette of a car.');
    console.error('Best results with black car on white background, car facing RIGHT.');
    process.exit(1);
}

async function processImage(imagePath) {
    console.error(`Processing: ${imagePath}`);

    // Step 1: Load image and convert to high-contrast grayscale
    const img = sharp(imagePath);
    const metadata = await img.metadata();
    console.error(`  Original size: ${metadata.width}x${metadata.height}`);

    // Resize to consistent width for tracing (larger = more detail in path)
    const targetWidth = 800;
    const resized = await img
        .resize(targetWidth, null, { fit: 'inside' })
        .grayscale()
        .threshold(128) // Convert to pure black/white
        .png()
        .toBuffer();

    const resizedMeta = await sharp(resized).metadata();
    console.error(`  Resized to: ${resizedMeta.width}x${resizedMeta.height}`);

    // Step 2: Trace with potrace
    return new Promise((resolve, reject) => {
        potrace.trace(resized, {
            threshold: 128,
            turdSize: 5,       // Remove small speckles
            optTolerance: 0.4, // Path optimization tolerance (lower = more accurate)
            color: 'black',
            background: 'transparent',
        }, (err, svg) => {
            if (err) return reject(err);

            // Step 3: Extract path data from SVG
            const pathMatch = svg.match(/d="([^"]+)"/);
            if (!pathMatch) return reject(new Error('No path found in SVG output'));

            const pathData = pathMatch[1];
            console.error(`  SVG path length: ${pathData.length} chars`);

            // Save the SVG for reference
            const svgOutPath = path.join(path.dirname(imagePath), `${carId}_traced.svg`);
            fs.writeFileSync(svgOutPath, svg);
            console.error(`  Saved SVG: ${svgOutPath}`);

            // Step 4: Parse SVG path commands
            const commands = parseSVG(pathData);
            console.error(`  Parsed ${commands.length} SVG commands`);

            // Step 5: Convert to our game format
            const result = convertToGameFormat(commands, resizedMeta.width, resizedMeta.height);
            resolve(result);
        });
    });
}

function convertToGameFormat(svgCommands, imgWidth, imgHeight) {
    // Find all points to determine bounding box of the car shape
    const points = [];
    let cx = 0, cy = 0;

    for (const cmd of svgCommands) {
        switch (cmd.code) {
            case 'M':
            case 'L':
                points.push({ x: cmd.x, y: cmd.y });
                cx = cmd.x; cy = cmd.y;
                break;
            case 'C':
                points.push({ x: cmd.x1, y: cmd.y1 });
                points.push({ x: cmd.x2, y: cmd.y2 });
                points.push({ x: cmd.x, y: cmd.y });
                cx = cmd.x; cy = cmd.y;
                break;
            case 'Q':
                points.push({ x: cmd.x1, y: cmd.y1 });
                points.push({ x: cmd.x, y: cmd.y });
                cx = cmd.x; cy = cmd.y;
                break;
            case 'm':
                cx += cmd.x; cy += cmd.y;
                points.push({ x: cx, y: cy });
                break;
            case 'l':
                cx += cmd.x; cy += cmd.y;
                points.push({ x: cx, y: cy });
                break;
            case 'c':
                points.push({ x: cx + cmd.x1, y: cy + cmd.y1 });
                points.push({ x: cx + cmd.x2, y: cy + cmd.y2 });
                cx += cmd.x; cy += cmd.y;
                points.push({ x: cx, y: cy });
                break;
            case 'q':
                points.push({ x: cx + cmd.x1, y: cy + cmd.y1 });
                cx += cmd.x; cy += cmd.y;
                points.push({ x: cx, y: cy });
                break;
        }
    }

    if (points.length === 0) {
        console.error('  ERROR: No points found in path');
        return null;
    }

    // Calculate bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;

    console.error(`  Bounding box: (${minX.toFixed(0)},${minY.toFixed(0)}) to (${maxX.toFixed(0)},${maxY.toFixed(0)})`);
    console.error(`  BBox size: ${bboxW.toFixed(0)}x${bboxH.toFixed(0)}`);

    // Normalize function: maps pixel coords to 0-1 range
    // In our game coordinate system:
    //   X: 0 = rear (left), 1 = front (right) — car faces right
    //   Y: 0.5 = center, <0.5 = above center (roof), >0.5 = below center (bottom)
    // The Y mapping centers the car vertically around 0.5
    const normalizeX = (x) => (x - minX) / bboxW;
    const normalizeY = (y) => {
        const normalized = (y - minY) / bboxH; // 0-1 within bbox
        // Map to our system: 0 = top of car, 1 = bottom.
        // Center around 0.5: top of car ~0.0-0.1, bottom ~0.55-0.65
        // The game's Y mapping is: y + (val - 0.5) * h
        // So val=0.0 means top, val=0.5 means center, val=1.0 means bottom
        // We want the roofline around 0.05-0.15 and wheelbase around 0.55-0.65
        return 0.05 + normalized * 0.60; // Map full range to 0.05-0.65
    };

    const round = (n) => Math.round(n * 100) / 100;

    // Convert commands to our format
    const gameCommands = [];
    cx = 0; cy = 0;
    let firstMove = true;

    // Find the longest contour (skip small sub-paths which are holes/artifacts)
    // Split by M commands to find sub-paths
    const subPaths = [];
    let currentSubPath = [];

    for (const cmd of svgCommands) {
        if ((cmd.code === 'M' || cmd.code === 'm') && currentSubPath.length > 0) {
            subPaths.push(currentSubPath);
            currentSubPath = [];
        }
        currentSubPath.push(cmd);
    }
    if (currentSubPath.length > 0) subPaths.push(currentSubPath);

    console.error(`  Found ${subPaths.length} sub-paths`);

    // Use the longest sub-path (main car outline)
    subPaths.sort((a, b) => b.length - a.length);
    const mainPath = subPaths[0];
    console.error(`  Using main path with ${mainPath.length} commands`);

    cx = 0; cy = 0;

    for (const cmd of mainPath) {
        switch (cmd.code) {
            case 'M':
                gameCommands.push(['M', round(normalizeX(cmd.x)), round(normalizeY(cmd.y))]);
                cx = cmd.x; cy = cmd.y;
                break;
            case 'L':
                gameCommands.push(['L', round(normalizeX(cmd.x)), round(normalizeY(cmd.y))]);
                cx = cmd.x; cy = cmd.y;
                break;
            case 'C':
                gameCommands.push([
                    'C',
                    round(normalizeX(cmd.x1)), round(normalizeY(cmd.y1)),
                    round(normalizeX(cmd.x2)), round(normalizeY(cmd.y2)),
                    round(normalizeX(cmd.x)),  round(normalizeY(cmd.y))
                ]);
                cx = cmd.x; cy = cmd.y;
                break;
            case 'Q':
                gameCommands.push([
                    'Q',
                    round(normalizeX(cmd.x1)), round(normalizeY(cmd.y1)),
                    round(normalizeX(cmd.x)),  round(normalizeY(cmd.y))
                ]);
                cx = cmd.x; cy = cmd.y;
                break;
            case 'm':
                cx += cmd.x; cy += cmd.y;
                gameCommands.push(['M', round(normalizeX(cx)), round(normalizeY(cy))]);
                break;
            case 'l':
                cx += cmd.x; cy += cmd.y;
                gameCommands.push(['L', round(normalizeX(cx)), round(normalizeY(cy))]);
                break;
            case 'c':
                gameCommands.push([
                    'C',
                    round(normalizeX(cx + cmd.x1)), round(normalizeY(cy + cmd.y1)),
                    round(normalizeX(cx + cmd.x2)), round(normalizeY(cy + cmd.y2)),
                    round(normalizeX(cx + cmd.x)),  round(normalizeY(cy + cmd.y))
                ]);
                cx += cmd.x; cy += cmd.y;
                break;
            case 'q':
                gameCommands.push([
                    'Q',
                    round(normalizeX(cx + cmd.x1)), round(normalizeY(cy + cmd.y1)),
                    round(normalizeX(cx + cmd.x)),  round(normalizeY(cy + cmd.y))
                ]);
                cx += cmd.x; cy += cmd.y;
                break;
            case 'Z':
            case 'z':
                gameCommands.push(['Z']);
                break;
        }
    }

    // Simplify: reduce point count by removing nearly-collinear L commands
    const simplified = simplifyPath(gameCommands);
    console.error(`  Output: ${gameCommands.length} commands -> ${simplified.length} simplified`);

    return {
        carId,
        original: gameCommands,
        simplified,
        stats: {
            originalPoints: points.length,
            svgCommands: svgCommands.length,
            subPaths: subPaths.length,
            outputCommands: simplified.length,
        }
    };
}

function simplifyPath(commands, tolerance = 0.015) {
    // Remove L commands that are nearly collinear with their neighbors
    const result = [commands[0]];

    for (let i = 1; i < commands.length - 1; i++) {
        const cmd = commands[i];

        // Always keep non-L commands (M, C, Q, Z)
        if (cmd[0] !== 'L') {
            result.push(cmd);
            continue;
        }

        // Check if this L point is close to the line from prev to next
        const prev = result[result.length - 1];
        const next = commands[i + 1];

        if (!prev || !next || next[0] === 'Z' || prev[0] === 'Z') {
            result.push(cmd);
            continue;
        }

        // Get coordinates
        const px = prev[prev.length - 2], py = prev[prev.length - 1];
        const cx = cmd[1], cy = cmd[2];
        const nx = next[next.length - 2], ny = next[next.length - 1];

        if (px === undefined || py === undefined || nx === undefined || ny === undefined) {
            result.push(cmd);
            continue;
        }

        // Distance from point to line
        const dist = pointToLineDistance(cx, cy, px, py, nx, ny);

        if (dist > tolerance) {
            result.push(cmd); // Keep significant points
        }
        // else: skip (nearly collinear)
    }

    // Always keep the last command
    if (commands.length > 1) {
        result.push(commands[commands.length - 1]);
    }

    return result;
}

function pointToLineDistance(px, py, lx1, ly1, lx2, ly2) {
    const dx = lx2 - lx1;
    const dy = ly2 - ly1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return Math.hypot(px - lx1, py - ly1);

    const t = Math.max(0, Math.min(1, ((px - lx1) * dx + (py - ly1) * dy) / lenSq));
    const projX = lx1 + t * dx;
    const projY = ly1 + t * dy;

    return Math.hypot(px - projX, py - projY);
}

// Main
(async () => {
    try {
        const result = await processImage(inputPath);

        if (!result) {
            process.exit(1);
        }

        // Output the game-format path
        console.log(`\n// === ${carId} — traced from image ===`);
        console.log(`// ${result.stats.outputCommands} path commands (simplified from ${result.stats.svgCommands} SVG commands)`);
        console.log(`body: [`);
        for (const cmd of result.simplified) {
            const parts = cmd.map(v => typeof v === 'number' ? v.toFixed(2) : `'${v}'`);
            console.log(`    [${parts.join(', ')}],`);
        }
        console.log(`],`);

        console.error('\nDone! Copy the body array above into cars.js');

    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
})();
