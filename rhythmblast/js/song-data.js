/* ============================================
   RHYTHM BLAST — Song Data
   3 MVP songs with note charts and melodies
   ============================================ */
const SongData = (() => {
    const S = Audio.SCALE;

    const songs = [
        {
            id: 'turbo-start',
            name: 'Turbo Start',
            album: 'starter-beats',
            bpm: 100,
            difficulty: 1,
            starsRequired: 0,
            emoji: '🏎️',
            bannerClass: 'banner-highway',
            themes: ['cars', 'neon'],
            topics: { math: ['counting', 'numbers'], reading: ['letters'] },
            // C major pentatonic melody (simple, catchy)
            melody: [
                S.C4, S.E4, S.G4, S.E4, S.C4, S.D4, S.E4, 0,
                S.G4, S.A4, S.G4, S.E4, S.D4, S.C4, S.D4, 0
            ],
            bass: [S.C4/2, S.C4/2, S.G4/2, S.G4/2, S.A4/2, S.A4/2, S.G4/2, S.G4/2],
            // Note chart: spaced out for young kids (every 6 beats at 100 BPM = 3.6s apart)
            noteChart: [
                { beat: 6,   type: 'identify', topic: 'reading:letters' },
                { beat: 12,  type: 'identify', topic: 'math:counting' },
                { beat: 18,  type: 'identify', topic: 'reading:letters' },
                { beat: 24,  type: 'identify', topic: 'math:counting' },
                { beat: 30,  type: 'identify', topic: 'reading:letters' },
                { beat: 36,  type: 'sequence', topic: 'math:counting', length: 3 },
                { beat: 44,  type: 'identify', topic: 'reading:letters' },
                { beat: 50,  type: 'identify', topic: 'math:numbers' },
                { beat: 56,  type: 'identify', topic: 'reading:letters' },
                { beat: 62,  type: 'sequence', topic: 'math:counting', length: 3 },
                { beat: 70,  type: 'identify', topic: 'reading:letters' },
                { beat: 76,  type: 'identify', topic: 'math:counting' },
                { beat: 82,  type: 'identify', topic: 'reading:letters' },
                { beat: 88,  type: 'identify', topic: 'math:numbers' }
            ]
        },
        {
            id: 'home-run-hero',
            name: 'Home Run Hero',
            album: 'starter-beats',
            bpm: 110,
            difficulty: 2,
            starsRequired: 4,
            emoji: '⚾',
            bannerClass: 'banner-stadium',
            themes: ['baseball', 'sports'],
            topics: { math: ['addition', 'counting'], reading: ['sight-words'] },
            melody: [
                S.G4, S.A4, S.C5, S.A4, S.G4, 0, S.E4, S.G4,
                S.A4, S.C5, S.D5, S.C5, S.A4, S.G4, 0, 0
            ],
            bass: [S.C4/2, S.E4/2, S.G4/2, S.E4/2, S.A4/2, S.G4/2, S.C4/2, S.C4/2],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'reading:sight-words' },
                { beat: 8,  type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 14, type: 'identify', topic: 'reading:sight-words' },
                { beat: 18, type: 'identify', topic: 'math:counting' },
                { beat: 22, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 28, type: 'identify', topic: 'reading:sight-words' },
                { beat: 32, type: 'identify', topic: 'math:counting' },
                { beat: 36, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 42, type: 'identify', topic: 'reading:sight-words' },
                { beat: 46, type: 'identify', topic: 'reading:sight-words' },
                { beat: 50, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 56, type: 'identify', topic: 'math:counting' },
                { beat: 60, type: 'identify', topic: 'reading:sight-words' },
                { beat: 64, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 70, type: 'identify', topic: 'reading:sight-words' },
                { beat: 74, type: 'identify', topic: 'math:counting' },
                { beat: 78, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 84, type: 'identify', topic: 'reading:sight-words' }
            ]
        },
        {
            id: 'hyrule-beats',
            name: 'Hyrule Beats',
            album: 'starter-beats',
            bpm: 120,
            difficulty: 3,
            starsRequired: 10,
            emoji: '🗡️',
            bannerClass: 'banner-hyrule',
            themes: ['zelda', 'adventure'],
            topics: { math: ['addition', 'patterns'], reading: ['sight-words', 'letters'] },
            // Zelda-inspired melody (adventurous, ascending)
            melody: [
                S.E4, S.G4, S.A4, S.C5, S.D5, S.C5, S.A4, S.G4,
                S.E4, S.G4, S.C5, S.D5, S.E5, S.D5, S.C5, S.A4,
                S.G4, S.A4, S.C5, S.E5, S.D5, S.C5, S.A4, S.G4,
                S.E4, 0, S.G4, S.A4, S.C5, S.D5, S.E5, 0
            ],
            bass: [
                S.C4/2, S.C4/2, S.G4/2, S.G4/2, S.A4/2, S.A4/2, S.E4/2, S.E4/2,
                S.C4/2, S.C4/2, S.G4/2, S.G4/2, S.A4/2, S.E4/2, S.C4/2, S.C4/2
            ],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'reading:letters' },
                { beat: 8,  type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 14, type: 'identify', topic: 'reading:sight-words' },
                { beat: 18, type: 'identify', topic: 'math:patterns' },
                { beat: 22, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 28, type: 'identify', topic: 'reading:sight-words' },
                { beat: 32, type: 'identify', topic: 'reading:letters' },
                { beat: 36, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 42, type: 'identify', topic: 'reading:sight-words' },
                { beat: 46, type: 'identify', topic: 'math:patterns' },
                { beat: 50, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 56, type: 'identify', topic: 'reading:letters' },
                { beat: 60, type: 'identify', topic: 'reading:sight-words' },
                { beat: 64, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 70, type: 'identify', topic: 'math:patterns' },
                { beat: 74, type: 'identify', topic: 'reading:sight-words' },
                { beat: 78, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 84, type: 'identify', topic: 'reading:letters' },
                { beat: 88, type: 'identify', topic: 'reading:sight-words' },
                { beat: 92, type: 'sequence', topic: 'math:addition', length: 3 }
            ]
        },
        {
            id: 'galaxy-quest',
            name: 'Galaxy Quest',
            album: 'starter-beats',
            bpm: 105,
            difficulty: 2,
            starsRequired: 6,
            emoji: '🚀',
            bannerClass: 'banner-highway',
            themes: ['space', 'adventure'],
            topics: { math: ['addition', 'subtraction'], reading: ['sight-words', 'phonics'] },
            // D major pentatonic: D4, E4, F#4, A4, B4 — soaring space melody
            melody: [
                293.66, 329.63, 369.99, S.A4, 493.88, S.A4, 369.99, 329.63,
                293.66, 369.99, S.A4, 493.88, S.A4, 369.99, 329.63, 293.66
            ],
            bass: [146.83, 146.83, 220, 220, 146.83, 146.83, 220, 220],
            noteChart: [
                { beat: 3,  type: 'identify', topic: 'reading:sight-words' },
                { beat: 6,  type: 'identify', topic: 'math:addition' },
                { beat: 9,  type: 'identify', topic: 'reading:phonics' },
                { beat: 12, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 18, type: 'identify', topic: 'reading:sight-words' },
                { beat: 21, type: 'identify', topic: 'math:subtraction' },
                { beat: 24, type: 'identify', topic: 'reading:phonics' },
                { beat: 27, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 33, type: 'identify', topic: 'reading:sight-words' },
                { beat: 36, type: 'identify', topic: 'math:addition' },
                { beat: 39, type: 'identify', topic: 'reading:phonics' },
                { beat: 42, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 48, type: 'identify', topic: 'reading:sight-words' },
                { beat: 51, type: 'identify', topic: 'math:subtraction' },
                { beat: 54, type: 'identify', topic: 'reading:phonics' },
                { beat: 57, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 63, type: 'identify', topic: 'reading:sight-words' },
                { beat: 66, type: 'identify', topic: 'math:addition' },
                { beat: 69, type: 'identify', topic: 'reading:phonics' },
                { beat: 72, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 78, type: 'identify', topic: 'reading:sight-words' },
                { beat: 81, type: 'identify', topic: 'math:subtraction' }
            ]
        },
        {
            id: 'dino-stomp',
            name: 'Dino Stomp',
            album: 'starter-beats',
            bpm: 90,
            difficulty: 2,
            starsRequired: 10,
            emoji: '🦕',
            bannerClass: 'banner-highway',
            themes: ['dinosaur', 'prehistoric'],
            topics: { math: ['comparing', 'patterns', 'shapes'], reading: ['word-families', 'rhyming'] },
            // G pentatonic low: G3, A3, B3, D4, E4 — heavy dinosaur stomp
            melody: [
                196, 220, 246.94, S.D4, S.E4, S.D4, 246.94, 220,
                196, 246.94, S.D4, S.E4, S.D4, 246.94
            ],
            bass: [98, 98, 98, 98, 98, 98, 98, 98],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'math:comparing' },
                { beat: 8,  type: 'identify', topic: 'reading:word-families' },
                { beat: 12, type: 'identify', topic: 'math:patterns' },
                { beat: 16, type: 'sequence', topic: 'math:comparing', length: 3 },
                { beat: 22, type: 'identify', topic: 'reading:rhyming' },
                { beat: 26, type: 'identify', topic: 'math:shapes' },
                { beat: 30, type: 'identify', topic: 'reading:word-families' },
                { beat: 34, type: 'sequence', topic: 'math:patterns', length: 3 },
                { beat: 40, type: 'identify', topic: 'reading:rhyming' },
                { beat: 44, type: 'identify', topic: 'math:comparing' },
                { beat: 48, type: 'identify', topic: 'reading:word-families' },
                { beat: 52, type: 'sequence', topic: 'math:shapes', length: 3 },
                { beat: 58, type: 'identify', topic: 'reading:rhyming' },
                { beat: 62, type: 'identify', topic: 'math:patterns' },
                { beat: 66, type: 'identify', topic: 'reading:word-families' },
                { beat: 70, type: 'sequence', topic: 'math:comparing', length: 3 },
                { beat: 76, type: 'identify', topic: 'reading:rhyming' },
                { beat: 80, type: 'identify', topic: 'math:shapes' }
            ]
        },
        {
            id: 'pixel-party',
            name: 'Pixel Party',
            album: 'starter-beats',
            bpm: 130,
            difficulty: 3,
            starsRequired: 14,
            emoji: '🎮',
            bannerClass: 'banner-hyrule',
            themes: ['retro', 'gaming'],
            topics: { math: ['word-problems', 'place-value'], reading: ['syllables', 'vocabulary'] },
            // C pentatonic high: C5, D5, E5, G5, A5 — rapid retro arpeggios
            melody: [
                S.C5, S.D5, S.E5, S.G5, S.A5, S.G5, S.E5, S.D5,
                S.C5, S.E5, S.G5, S.A5, S.G5, S.E5, S.D5, S.C5,
                S.E5, S.G5, S.A5, S.G5
            ],
            bass: [130.81, 196, 130.81, 196, 130.81, 196, 130.81, 196,
                   130.81, 196, 130.81, 196, 130.81, 196, 130.81, 196],
            // Spaced out from every-2-beats to every-4-beats (130 BPM = 1.85s apart)
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'reading:syllables' },
                { beat: 8,  type: 'identify', topic: 'math:place-value' },
                { beat: 12, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 16, type: 'sequence', topic: 'math:word-problems', length: 3 },
                { beat: 24, type: 'identify', topic: 'reading:syllables' },
                { beat: 28, type: 'identify', topic: 'math:place-value' },
                { beat: 32, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 36, type: 'sequence', topic: 'math:word-problems', length: 3 },
                { beat: 44, type: 'identify', topic: 'reading:syllables' },
                { beat: 48, type: 'identify', topic: 'math:place-value' },
                { beat: 52, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 56, type: 'sequence', topic: 'math:place-value', length: 3 },
                { beat: 64, type: 'identify', topic: 'reading:syllables' },
                { beat: 68, type: 'identify', topic: 'math:word-problems' },
                { beat: 72, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 76, type: 'sequence', topic: 'math:place-value', length: 3 },
                { beat: 84, type: 'identify', topic: 'reading:syllables' },
                { beat: 88, type: 'identify', topic: 'math:word-problems' }
            ]
        },
        {
            id: 'ocean-waves',
            name: 'Ocean Waves',
            album: 'starter-beats',
            bpm: 85,
            difficulty: 1,
            starsRequired: 3,
            emoji: '🌊',
            bannerClass: 'banner-highway',
            themes: ['ocean', 'calm'],
            topics: { math: ['counting', 'numbers'], reading: ['letters', 'beginning-sounds'] },
            // F pentatonic: F4, G4, A4, C5, D5 — flowing gentle ocean melody
            melody: [
                349.23, S.G4, S.A4, S.C5, S.D5, S.C5, S.A4, S.G4,
                349.23, S.A4, S.C5, S.D5
            ],
            bass: [174.61, 174.61, 174.61, 174.61, 174.61, 174.61, 174.61, 174.61],
            // Gentle spacing for difficulty 1 (every 6 beats at 85 BPM = 4.2s apart)
            noteChart: [
                { beat: 6,   type: 'identify', topic: 'reading:letters' },
                { beat: 12,  type: 'identify', topic: 'math:counting' },
                { beat: 18,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 24,  type: 'sequence', topic: 'math:counting', length: 3 },
                { beat: 32,  type: 'identify', topic: 'reading:letters' },
                { beat: 38,  type: 'identify', topic: 'math:numbers' },
                { beat: 44,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 50,  type: 'sequence', topic: 'math:numbers', length: 3 },
                { beat: 58,  type: 'identify', topic: 'reading:letters' },
                { beat: 64,  type: 'identify', topic: 'math:counting' },
                { beat: 70,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 76,  type: 'identify', topic: 'math:counting' }
            ]
        },
        // --- NEW SONGS ---
        {
            id: 'jungle-groove',
            name: 'Jungle Groove',
            album: 'adventure-tracks',
            bpm: 95,
            difficulty: 2,
            starsRequired: 8,
            emoji: '🌴',
            bannerClass: 'banner-highway',
            themes: ['jungle', 'tropical'],
            topics: { math: ['subtraction'], reading: ['rhyming'] },
            // C major bouncy: C4, E4, G4, A4, C5 with rests for bounce
            melody: [
                S.C4, 0, S.E4, S.G4, S.A4, 0, S.G4, S.E4,
                S.C4, S.E4, 0, S.G4, S.C5, S.A4, S.G4, 0
            ],
            // Walking bass line
            bass: [S.C4/2, S.D4/2, S.E4/2, S.G4/2, S.A4/2, S.G4/2, S.E4/2, S.D4/2],
            noteChart: [
                { beat: 3,  type: 'identify', topic: 'reading:rhyming' },
                { beat: 6,  type: 'identify', topic: 'math:subtraction' },
                { beat: 9,  type: 'identify', topic: 'reading:rhyming' },
                { beat: 12, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 18, type: 'identify', topic: 'reading:rhyming' },
                { beat: 21, type: 'identify', topic: 'math:subtraction' },
                { beat: 24, type: 'identify', topic: 'reading:rhyming' },
                { beat: 27, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 33, type: 'identify', topic: 'reading:rhyming' },
                { beat: 36, type: 'identify', topic: 'math:subtraction' },
                { beat: 39, type: 'identify', topic: 'reading:rhyming' },
                { beat: 42, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 48, type: 'identify', topic: 'reading:rhyming' },
                { beat: 51, type: 'identify', topic: 'math:subtraction' },
                { beat: 54, type: 'identify', topic: 'reading:rhyming' },
                { beat: 57, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 63, type: 'identify', topic: 'reading:rhyming' },
                { beat: 66, type: 'identify', topic: 'math:subtraction' },
                { beat: 69, type: 'identify', topic: 'reading:rhyming' },
                { beat: 72, type: 'identify', topic: 'math:subtraction' }
            ]
        },
        {
            id: 'castle-quest',
            name: 'Castle Quest',
            album: 'adventure-tracks',
            bpm: 115,
            difficulty: 3,
            starsRequired: 16,
            emoji: '🏰',
            bannerClass: 'banner-hyrule',
            themes: ['medieval', 'adventure'],
            topics: { math: ['multiplication'], reading: ['vocabulary'] },
            // D minor heroic: D4, F4, A4, D5 ascending with drama
            melody: [
                293.66, 349.23, S.A4, 587.33, S.A4, 349.23, 293.66, 0,
                349.23, S.A4, 587.33, 659.25, 587.33, S.A4, 349.23, 293.66,
                293.66, 349.23, S.A4, 587.33, 659.25, 587.33, S.A4, 0,
                349.23, 293.66, 349.23, S.A4, 587.33, 659.25, 0, 0
            ],
            // D minor power bass (root-fifth pattern)
            bass: [146.83, 146.83, 220, 220, 174.61, 174.61, 220, 220,
                   146.83, 146.83, 220, 220, 174.61, 220, 146.83, 146.83],
            noteChart: [
                { beat: 3,  type: 'identify', topic: 'reading:vocabulary' },
                { beat: 6,  type: 'identify', topic: 'math:multiplication' },
                { beat: 9,  type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 15, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 18, type: 'identify', topic: 'math:multiplication' },
                { beat: 21, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 24, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 30, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 33, type: 'identify', topic: 'math:multiplication' },
                { beat: 36, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 39, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 45, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 48, type: 'identify', topic: 'math:multiplication' },
                { beat: 51, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 57, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 60, type: 'identify', topic: 'math:multiplication' },
                { beat: 63, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 66, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 72, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 75, type: 'identify', topic: 'math:multiplication' },
                { beat: 78, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 84, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 87, type: 'identify', topic: 'math:multiplication' },
                { beat: 90, type: 'identify', topic: 'reading:vocabulary' }
            ]
        },
        {
            id: 'rocket-launch',
            name: 'Rocket Launch',
            album: 'adventure-tracks',
            bpm: 125,
            difficulty: 3,
            starsRequired: 20,
            emoji: '🚀',
            bannerClass: 'banner-stadium',
            themes: ['space', 'electronic'],
            topics: { math: ['fractions'], reading: ['comprehension'] },
            // E minor synth arpeggios: E4, G4, B4, E5, cycling fast
            melody: [
                329.63, S.G4, 493.88, 659.25, 493.88, S.G4, 329.63, 0,
                329.63, S.A4, 493.88, 659.25, 493.88, S.A4, 329.63, 0,
                329.63, S.G4, 493.88, 659.25, S.A5, 659.25, 493.88, S.G4,
                329.63, S.G4, 493.88, 659.25, 493.88, S.G4, 0, 0
            ],
            // Pulsing E bass
            bass: [164.81, 0, 164.81, 0, 164.81, 0, 196, 0,
                   164.81, 0, 164.81, 0, 220, 0, 196, 0],
            // Spaced out from every-2-beats to every-4-beats (125 BPM = 1.92s apart)
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'reading:comprehension' },
                { beat: 8,  type: 'identify', topic: 'math:fractions' },
                { beat: 12, type: 'identify', topic: 'reading:comprehension' },
                { beat: 16, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 24, type: 'identify', topic: 'reading:comprehension' },
                { beat: 28, type: 'identify', topic: 'math:fractions' },
                { beat: 32, type: 'identify', topic: 'reading:comprehension' },
                { beat: 36, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 44, type: 'identify', topic: 'reading:comprehension' },
                { beat: 48, type: 'identify', topic: 'math:fractions' },
                { beat: 52, type: 'identify', topic: 'reading:comprehension' },
                { beat: 56, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 64, type: 'identify', topic: 'reading:comprehension' },
                { beat: 68, type: 'identify', topic: 'math:fractions' },
                { beat: 72, type: 'identify', topic: 'reading:comprehension' },
                { beat: 76, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 84, type: 'identify', topic: 'reading:comprehension' },
                { beat: 88, type: 'identify', topic: 'math:fractions' }
            ]
        },
        // --- EXPANSION SONGS ---
        {
            id: 'ninja-dash',
            name: 'Ninja Dash',
            album: 'power-tracks',
            bpm: 135,
            difficulty: 3,
            starsRequired: 24,
            emoji: '🥷',
            bannerClass: 'banner-hyrule',
            themes: ['ninja', 'stealth'],
            topics: { math: ['division', 'multiplication'], reading: ['context-clues'] },
            melody: [
                S.E4, S.G4, S.A4, 0, S.C5, S.D5, S.C5, S.A4,
                S.G4, S.A4, S.C5, S.D5, S.E5, S.D5, 0, S.A4,
                S.E4, S.G4, S.C5, S.E5
            ],
            bass: [164.81, 0, 196, 0, 220, 0, 196, 0,
                   164.81, 0, 196, 0, 220, 0, 164.81, 0],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'math:division' },
                { beat: 8,  type: 'identify', topic: 'reading:context-clues' },
                { beat: 12, type: 'sequence', topic: 'math:multiplication', length: 3 },
                { beat: 20, type: 'identify', topic: 'reading:context-clues' },
                { beat: 24, type: 'identify', topic: 'math:division' },
                { beat: 28, type: 'identify', topic: 'reading:context-clues' },
                { beat: 32, type: 'sequence', topic: 'math:division', length: 3 },
                { beat: 40, type: 'identify', topic: 'reading:context-clues' },
                { beat: 44, type: 'identify', topic: 'math:multiplication' },
                { beat: 48, type: 'identify', topic: 'reading:context-clues' },
                { beat: 52, type: 'sequence', topic: 'math:division', length: 3 },
                { beat: 60, type: 'identify', topic: 'reading:context-clues' },
                { beat: 64, type: 'identify', topic: 'math:multiplication' },
                { beat: 68, type: 'sequence', topic: 'math:division', length: 3 },
                { beat: 76, type: 'identify', topic: 'reading:context-clues' },
                { beat: 80, type: 'identify', topic: 'math:division' }
            ]
        },
        {
            id: 'candy-rush',
            name: 'Candy Rush',
            album: 'power-tracks',
            bpm: 110,
            difficulty: 2,
            starsRequired: 12,
            emoji: '🍬',
            bannerClass: 'banner-stadium',
            themes: ['candy', 'sweet'],
            topics: { math: ['addition', 'subtraction'], reading: ['sight-words', 'phonics'] },
            melody: [
                S.C5, S.D5, S.E5, S.G5, S.E5, S.D5, S.C5, 0,
                S.D5, S.E5, S.G5, S.A5, S.G5, S.E5, S.D5, S.C5
            ],
            bass: [S.C4/2, S.E4/2, S.G4/2, S.C4/2, S.A4/2, S.G4/2, S.E4/2, S.C4/2],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'reading:sight-words' },
                { beat: 8,  type: 'identify', topic: 'math:addition' },
                { beat: 12, type: 'identify', topic: 'reading:phonics' },
                { beat: 16, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 22, type: 'identify', topic: 'reading:sight-words' },
                { beat: 26, type: 'identify', topic: 'math:subtraction' },
                { beat: 30, type: 'identify', topic: 'reading:phonics' },
                { beat: 34, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 40, type: 'identify', topic: 'reading:sight-words' },
                { beat: 44, type: 'identify', topic: 'math:addition' },
                { beat: 48, type: 'sequence', topic: 'math:subtraction', length: 3 },
                { beat: 54, type: 'identify', topic: 'reading:phonics' },
                { beat: 58, type: 'identify', topic: 'math:addition' },
                { beat: 62, type: 'identify', topic: 'reading:sight-words' },
                { beat: 66, type: 'sequence', topic: 'math:addition', length: 3 },
                { beat: 72, type: 'identify', topic: 'reading:phonics' },
                { beat: 76, type: 'identify', topic: 'math:subtraction' }
            ]
        },
        {
            id: 'volcano-run',
            name: 'Volcano Run',
            album: 'power-tracks',
            bpm: 140,
            difficulty: 3,
            starsRequired: 28,
            emoji: '🌋',
            bannerClass: 'banner-highway',
            themes: ['volcano', 'danger'],
            topics: { math: ['place-value', 'rounding'], reading: ['main-idea'] },
            melody: [
                S.A4, S.C5, S.D5, S.E5, S.D5, S.C5, S.A4, 0,
                S.C5, S.D5, S.E5, S.G5, S.E5, S.D5, S.C5, S.A4,
                S.A4, S.C5, S.E5, S.G5
            ],
            bass: [220, 0, 220, 0, 174.61, 0, 220, 0,
                   220, 0, 220, 0, 174.61, 0, 220, 0],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'math:place-value' },
                { beat: 8,  type: 'identify', topic: 'reading:main-idea' },
                { beat: 12, type: 'sequence', topic: 'math:rounding', length: 3 },
                { beat: 20, type: 'identify', topic: 'reading:main-idea' },
                { beat: 24, type: 'identify', topic: 'math:place-value' },
                { beat: 28, type: 'identify', topic: 'reading:main-idea' },
                { beat: 32, type: 'sequence', topic: 'math:place-value', length: 3 },
                { beat: 40, type: 'identify', topic: 'reading:main-idea' },
                { beat: 44, type: 'identify', topic: 'math:rounding' },
                { beat: 48, type: 'sequence', topic: 'math:place-value', length: 3 },
                { beat: 56, type: 'identify', topic: 'reading:main-idea' },
                { beat: 60, type: 'identify', topic: 'math:rounding' },
                { beat: 64, type: 'identify', topic: 'reading:main-idea' },
                { beat: 68, type: 'sequence', topic: 'math:rounding', length: 3 },
                { beat: 76, type: 'identify', topic: 'math:place-value' },
                { beat: 80, type: 'identify', topic: 'reading:main-idea' }
            ]
        },
        {
            id: 'rainbow-ride',
            name: 'Rainbow Ride',
            album: 'power-tracks',
            bpm: 100,
            difficulty: 1,
            starsRequired: 2,
            emoji: '🌈',
            bannerClass: 'banner-stadium',
            themes: ['rainbow', 'happy'],
            topics: { math: ['counting', 'shapes'], reading: ['letters', 'beginning-sounds'] },
            melody: [
                S.C4, S.D4, S.E4, S.G4, S.A4, S.G4, S.E4, S.D4,
                S.C4, S.E4, S.G4, S.A4
            ],
            bass: [S.C4/2, S.C4/2, S.G4/2, S.G4/2, S.A4/2, S.A4/2, S.G4/2, S.G4/2],
            noteChart: [
                { beat: 6,   type: 'identify', topic: 'reading:letters' },
                { beat: 12,  type: 'identify', topic: 'math:counting' },
                { beat: 18,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 24,  type: 'sequence', topic: 'math:counting', length: 3 },
                { beat: 32,  type: 'identify', topic: 'reading:letters' },
                { beat: 38,  type: 'identify', topic: 'math:shapes' },
                { beat: 44,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 50,  type: 'sequence', topic: 'math:shapes', length: 3 },
                { beat: 58,  type: 'identify', topic: 'reading:letters' },
                { beat: 64,  type: 'identify', topic: 'math:counting' },
                { beat: 70,  type: 'identify', topic: 'reading:beginning-sounds' },
                { beat: 76,  type: 'identify', topic: 'math:shapes' }
            ]
        },
        {
            id: 'thunder-bolt',
            name: 'Thunder Bolt',
            album: 'power-tracks',
            bpm: 145,
            difficulty: 3,
            starsRequired: 32,
            emoji: '⚡',
            bannerClass: 'banner-hyrule',
            themes: ['storm', 'electric'],
            topics: { math: ['fractions', 'word-problems'], reading: ['vocabulary', 'comprehension'] },
            melody: [
                S.E4, S.G4, S.A4, S.C5, S.E5, S.D5, S.C5, 0,
                S.A4, S.C5, S.D5, S.E5, S.G5, S.E5, S.D5, S.C5,
                S.A4, S.G4, S.A4, S.C5, S.E5, S.G5, S.E5, 0,
                S.C5, S.A4, S.G4, S.A4, S.C5, S.E5, 0, 0
            ],
            bass: [164.81, 0, 220, 0, 164.81, 0, 220, 0,
                   164.81, 0, 220, 0, 196, 0, 164.81, 0],
            noteChart: [
                { beat: 4,  type: 'identify', topic: 'math:fractions' },
                { beat: 8,  type: 'identify', topic: 'reading:vocabulary' },
                { beat: 12, type: 'sequence', topic: 'math:word-problems', length: 3 },
                { beat: 20, type: 'identify', topic: 'reading:comprehension' },
                { beat: 24, type: 'identify', topic: 'math:fractions' },
                { beat: 28, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 32, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 40, type: 'identify', topic: 'reading:comprehension' },
                { beat: 44, type: 'identify', topic: 'math:word-problems' },
                { beat: 48, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 52, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 60, type: 'identify', topic: 'reading:comprehension' },
                { beat: 64, type: 'identify', topic: 'math:word-problems' },
                { beat: 68, type: 'sequence', topic: 'math:fractions', length: 3 },
                { beat: 76, type: 'identify', topic: 'reading:vocabulary' },
                { beat: 80, type: 'identify', topic: 'math:fractions' },
                { beat: 84, type: 'identify', topic: 'reading:comprehension' },
                { beat: 88, type: 'sequence', topic: 'math:word-problems', length: 3 }
            ]
        }
    ];

    function getSong(id) {
        return songs.find(s => s.id === id);
    }

    function getAllSongs() {
        return songs;
    }

    function getUnlockedSongs(totalStars) {
        return songs.filter(s => totalStars >= s.starsRequired);
    }

    return { getSong, getAllSongs, getUnlockedSongs };
})();
