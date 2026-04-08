/**
 * Test setup — Mock browser globals and load IIFE modules for Node.js
 * Word Mine modules use IIFEs: const ModuleName = (() => { ... })();
 * We rewrite "const X =" to "var X = global.X =" so they're accessible in tests.
 */
const fs = require('fs');
const path = require('path');

// Mock localStorage
const store = {};
global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Mock document
global.document = {
    getElementById: () => ({
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        style: {},
        textContent: '',
        innerHTML: '',
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild: () => {},
        removeChild: () => {},
        getBoundingClientRect: () => ({ width: 1024, height: 600, top: 0, left: 0 })
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => ({
        tagName: tag, style: {}, classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {}, appendChild: () => {},
        getContext: () => mockCanvasContext(),
        setAttribute: () => {}, getAttribute: () => null,
        textContent: '', innerHTML: ''
    }),
    body: { appendChild: () => {}, removeChild: () => {} },
    addEventListener: () => {},
    dispatchEvent: () => {}
};

// Mock window
global.window = {
    addEventListener: () => {}, removeEventListener: () => {},
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    innerWidth: 1024, innerHeight: 600,
    navigator: { vibrate: () => {} },
    speechSynthesis: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
};

global.navigator = global.window.navigator;
global.speechSynthesis = global.window.speechSynthesis;
global.SpeechSynthesisUtterance = function() { return { text: '' }; };

// Mock AudioContext
global.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 440, setValueAtTime: () => {} }, type: 'sine', disconnect: () => {} }; }
    createGain() { return { connect: () => {}, gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, disconnect: () => {} }; }
    createDynamicsCompressor() { return { connect: () => {}, threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 }, attack: { value: 0 }, release: { value: 0 } }; }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
};
global.webkitAudioContext = global.AudioContext;
global.Image = class { constructor() { this.onload = null; this.onerror = null; this.src = ''; } };

function mockCanvasContext() {
    return {
        fillRect: () => {}, clearRect: () => {}, drawImage: () => {},
        fillText: () => {}, measureText: (t) => ({ width: (t||'').length * 8 }),
        beginPath: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
        arc: () => {}, fill: () => {}, stroke: () => {}, save: () => {}, restore: () => {},
        translate: () => {}, rotate: () => {}, scale: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }), putImageData: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        canvas: { width: 320, height: 180 },
        fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
        textAlign: '', textBaseline: '', globalAlpha: 1,
        globalCompositeOperation: 'source-over', shadowBlur: 0, shadowColor: '',
        imageSmoothingEnabled: true
    };
}

/**
 * Load a game JS file and inject its IIFE into global scope.
 * Rewrites "const ModuleName =" to "var ModuleName = global.ModuleName ="
 */
const ROOT = path.join(__dirname, '..');
function loadScript(relPath) {
    let src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
    // Convert IIFE global assignments to be accessible in Node
    src = src.replace(/^const (\w+)\s*=/m, 'var $1 = global.$1 =');
    // Use Function constructor to evaluate in a context with our globals
    try {
        new Function(src)();
    } catch (e) {
        // Some modules may fail on DOM-heavy init; that's okay for data modules
    }
}

function resetStorage() {
    Object.keys(store).forEach(k => delete store[k]);
}

module.exports = { loadScript, resetStorage, mockCanvasContext, ROOT };
