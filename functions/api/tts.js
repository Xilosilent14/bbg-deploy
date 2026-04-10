/**
 * BBG TTS Proxy — Cloudflare Pages Function
 * Route: /api/tts (POST)
 * Proxies Google Cloud Text-to-Speech API with CORS headers.
 */

const GCP_API_KEY = 'AIzaSyDdzRiraLscYjIxX3zpyPZEQpsgDXtHDQk';
const TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + GCP_API_KEY;

export async function onRequestPost(context) {
    const origin = context.request.headers.get('Origin') || '';
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400'
    };

    try {
        const body = await context.request.text();
        const resp = await fetch(TTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const data = await resp.text();
        return new Response(data, {
            status: resp.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
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
