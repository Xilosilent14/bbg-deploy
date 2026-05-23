/**
 * BBG TTS Proxy — Cloudflare Pages Function
 * Route: /api/tts (POST)
 * Proxies Google Cloud Text-to-Speech API with CORS headers.
 *
 * Requires Cloudflare Pages env var: GCP_API_KEY
 * (Set in Cloudflare dashboard → Pages project → Settings → Environment variables)
 *
 * v2 (2026-05-23): Added in-flight dedup, per-IP rate limiting, input validation,
 *                  structured logging. Defends against budget blowup from buggy
 *                  game loops, multi-tab spam, or malicious traffic.
 */

// ---- Tunables --------------------------------------------------------------
const MAX_TEXT_LEN = 200;
const RATE_LIMIT_PER_MIN = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_LRU_MAX = 5000;       // cap memory of the rate-limit map
const INFLIGHT_LRU_MAX = 500;          // cap dedup map size

// ---- Module-scope state (per-isolate, not global) --------------------------
// Cloudflare may spin up multiple isolates, so this catches the common case
// (one device or one bad tab hammering the same isolate) without needing KV.
const inflight = new Map();            // key -> Promise<{status, body, headers}>
const rateBuckets = new Map();         // ip -> { count, windowStart }

// ---- Helpers ---------------------------------------------------------------
function lruTouch(map, key, value) {
    if (map.has(key)) map.delete(key);
    map.set(key, value);
}

function lruCap(map, max) {
    while (map.size > max) {
        const firstKey = map.keys().next().value;
        if (firstKey === undefined) break;
        map.delete(firstKey);
    }
}

function checkRateLimit(ip) {
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
        bucket = { count: 0, windowStart: now };
    }
    bucket.count++;
    lruTouch(rateBuckets, ip, bucket);
    lruCap(rateBuckets, RATE_LIMIT_LRU_MAX);
    if (bucket.count > RATE_LIMIT_PER_MIN) {
        const retryAfter = Math.max(1, Math.ceil((bucket.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000));
        return { ok: false, retryAfter };
    }
    return { ok: true };
}

// Abuse heuristics: control chars (except \t\n\r), or any single char repeated
// 20+ times in a row (e.g. "aaaaaaaaaaaaaaaaaaaaa…" stress payloads).
function isAbusive(text) {
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) return true;
    if (/(.)\1{19,}/u.test(text)) return true;
    return false;
}

function validatePayload(parsed) {
    if (!parsed || typeof parsed !== 'object') return 'Missing JSON body';
    const text = parsed.input && parsed.input.text;
    if (typeof text !== 'string') return 'input.text must be a string';
    if (text.length === 0) return 'input.text is empty';
    if (text.length > MAX_TEXT_LEN) return `input.text exceeds ${MAX_TEXT_LEN} chars`;
    if (isAbusive(text)) return 'input.text contains disallowed characters';

    // voice: optional, but if present must be an object with string fields
    if (parsed.voice !== undefined) {
        if (typeof parsed.voice !== 'object' || parsed.voice === null) return 'voice must be an object';
        for (const k of ['languageCode', 'name', 'ssmlGender']) {
            if (parsed.voice[k] !== undefined && typeof parsed.voice[k] !== 'string') {
                return `voice.${k} must be a string`;
            }
        }
    }

    // audioConfig.speakingRate ("rate"): optional, must be a finite number 0.25-4.0
    if (parsed.audioConfig !== undefined) {
        if (typeof parsed.audioConfig !== 'object' || parsed.audioConfig === null) return 'audioConfig must be an object';
        const r = parsed.audioConfig.speakingRate;
        if (r !== undefined) {
            if (typeof r !== 'number' || !isFinite(r) || r < 0.25 || r > 4.0) {
                return 'audioConfig.speakingRate must be a number between 0.25 and 4.0';
            }
        }
    }
    return null;
}

function dedupeKey(parsed) {
    const text = parsed.input.text;
    const voice = parsed.voice || {};
    const voiceStr = [voice.languageCode || '', voice.name || '', voice.ssmlGender || ''].join(':');
    const rate = (parsed.audioConfig && parsed.audioConfig.speakingRate) || '';
    return `${text}|${voiceStr}|${rate}`;
}

function logEvent(obj) {
    try { console.log(JSON.stringify(obj)); } catch (_) { /* noop */ }
}

// ---- Main handler ----------------------------------------------------------
export async function onRequestPost(context) {
    const startedAt = Date.now();
    const origin = context.request.headers.get('Origin') || '';
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400'
    };
    const jsonHeaders = { 'Content-Type': 'application/json', ...corsHeaders };

    // 1. Env check
    const apiKey = context.env && context.env.GCP_API_KEY;
    if (!apiKey) {
        logEvent({ event: 'tts_misconfigured', ip, status: 500, duration: Date.now() - startedAt });
        return new Response(
            JSON.stringify({ error: 'Server misconfigured: GCP_API_KEY env var is not set in Cloudflare Pages.' }),
            { status: 500, headers: jsonHeaders }
        );
    }

    // 2. Rate limit (cheap, before body parse)
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
        logEvent({ event: 'tts_rate_limited', ip, status: 429, retryAfter: rl.retryAfter, duration: Date.now() - startedAt });
        return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Slow down.' }),
            { status: 429, headers: { ...jsonHeaders, 'Retry-After': String(rl.retryAfter) } }
        );
    }

    // 3. Parse + validate body
    let raw, parsed;
    try {
        raw = await context.request.text();
        parsed = JSON.parse(raw);
    } catch (_) {
        logEvent({ event: 'tts_bad_json', ip, status: 400, duration: Date.now() - startedAt });
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: jsonHeaders });
    }
    const validationErr = validatePayload(parsed);
    if (validationErr) {
        logEvent({
            event: 'tts_validation_failed',
            ip,
            status: 400,
            textLen: (parsed && parsed.input && typeof parsed.input.text === 'string') ? parsed.input.text.length : -1,
            reason: validationErr,
            duration: Date.now() - startedAt
        });
        return new Response(JSON.stringify({ error: validationErr }), { status: 400, headers: jsonHeaders });
    }

    const textLen = parsed.input.text.length;
    const key = dedupeKey(parsed);

    // 4. In-flight dedup: if an identical request is already calling Google, await it.
    let cached = false;
    let inflightPromise = inflight.get(key);
    if (inflightPromise) {
        cached = true;
    } else {
        inflightPromise = (async () => {
            const ttsUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apiKey;
            const resp = await fetch(ttsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: raw
            });
            const body = await resp.text();
            return { status: resp.status, body };
        })();
        inflight.set(key, inflightPromise);
        lruCap(inflight, INFLIGHT_LRU_MAX);
        // Always clean up after settle so we don't leak permanent entries.
        inflightPromise.finally(() => {
            if (inflight.get(key) === inflightPromise) inflight.delete(key);
        });
    }

    try {
        const { status, body } = await inflightPromise;
        logEvent({ event: 'tts_proxied', ip, textLen, cached, status, duration: Date.now() - startedAt });
        return new Response(body, { status, headers: jsonHeaders });
    } catch (e) {
        logEvent({ event: 'tts_upstream_error', ip, textLen, cached, status: 500, error: e && e.message, duration: Date.now() - startedAt });
        return new Response(JSON.stringify({ error: e && e.message ? e.message : 'Upstream error' }), {
            status: 500,
            headers: jsonHeaders
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
