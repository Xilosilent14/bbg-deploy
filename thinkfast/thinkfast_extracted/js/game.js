// ===== RACING GAME ENGINE V4 =====
const Game = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,

    // Race state
    subject: null,
    topic: null,
    trackIndex: 0,

    // Player
    playerX: 0,
    playerY: 0,
    playerLane: 1,
    targetLane: 1,
    playerSpeed: 3,
    targetSpeed: 3,
    baseSpeed: 3,
    nitroTimer: 0,
    wheelAngle: 0,
    suspensionOffset: 0,
    leanAngle: 0, // V4: car lean during lane change
    wobbleTimer: 0, // V6: wrong answer wobble
    exhaustParticles: [],
    speedLines: [],
    nitroParticles: [],
    screenShake: 0,    // V5.5: screen shake timer on obstacle hit
    hitFlash: 0,       // V5.5: red flash on obstacle hit
    boostFlash: 0,     // V5.7: golden flash on correct answer

    // Lanes
    laneYs: [],
    laneHeight: 35,

    // Opponents
    opponents: [],
    numOpponents: 3,

    // Obstacles
    obstacles: [],
    nextObstacleAt: 0,

    // Power-ups (V3)
    powerUps: [],
    activePowerUp: null,
    shieldActive: false,
    magnetActive: false,
    magnetBonusEarned: false,
    freezeTimer: 0,

    // Drafting
    draftingBehind: null,
    draftBoost: 0,

    // Track / scrolling
    scrollX: 0,
    roadY: 0,
    trackLength: 12000,

    // Scenery objects
    sceneryObjects: [],

    // Clouds (V4)
    clouds: [],

    // Rain particles (V3)
    rainParticles: [],

    // Questions
    questionsAsked: 0,
    questionsTotal: 8,
    correctCount: 0,
    streak: 0,
    bestStreak: 0,
    consecutiveWrong: 0,
    nextQuestionAt: 0,
    questionInterval: 0,
    awaitingAnswer: false,

    // Finish line (V3)
    finishing: false,
    finishTimer: 0,

    // Bonus challenge (V3)
    bonusChallengeGiven: false,
    bonusCorrect: false,

    // Race timing (V3)
    raceStartTime: 0,

    // V4: Tutorial tracking
    _tutorialObstacleShown: false,
    _tutorialPowerUpShown: false,
    _tutorialQuestionShown: false,

    // V7: Near-miss tracking
    nearMissBonus: 0,
    nearMissFlash: 0,
    nearMissCount: 0,
    doubleStarsActive: false,

    // V7: Weather modifiers (computed per-track)
    weatherSpeedMod: 1.0,
    weatherHandlingMod: 1.0,

    // V9: Ghost car
    _ghostRecording: [],
    _ghostPlayback: null,
    _ghostFrame: 0,
    _frameCount: 0,

    // V9: Get medal type for a track + time
    getMedal(trackIndex, time) {
        const track = this.tracks[trackIndex];
        if (!track || !track.medals) return null;
        if (time <= track.medals.gold) return 'gold';
        if (time <= track.medals.silver) return 'silver';
        if (time <= track.medals.bronze) return 'bronze';
        return null;
    },

    // V8: Track-specific challenges (bonus goal per track)
    trackChallenges: [
        { id: 'streak3', desc: 'Get a 3x streak', icon: '🔥', check: (g) => g.bestStreak >= 3 },
        { id: 'dodge3', desc: 'Dodge 3 obstacles', icon: '💨', check: (g) => g.nearMissCount >= 3 },
        { id: 'perfect4', desc: 'First 4 answers correct', icon: '🎯', check: (g) => g.correctCount >= 4 && g.questionsAsked <= 4 },
        { id: 'fast', desc: 'Finish under 3 minutes', icon: '⏱️', check: (g) => ((Date.now() - g.raceStartTime) / 1000) < 180 },
        { id: 'streak5', desc: 'Get a 5x streak', icon: '🔥', check: (g) => g.bestStreak >= 5 },
        { id: 'no_hit', desc: 'No obstacle hits', icon: '🛡️', check: (g) => g._obstacleHitCount === 0 },
        { id: 'all_correct', desc: 'Get 8/8 correct', icon: '💯', check: (g) => g.correctCount === g.questionsTotal }
    ],
    _activeChallenge: null,
    _challengeCompleted: false,
    _obstacleHitCount: 0,

    // V8: Opponent personality names
    opponentNames: [
        { name: 'Turbo Tom', title: 'The Speedster' },
        { name: 'Dash Diane', title: 'Track Star' },
        { name: 'Blaze Bobby', title: 'Nitro King' },
        { name: 'Zippy Zoe', title: 'Road Runner' },
        { name: 'Rev Rex', title: 'Engine Master' },
        { name: 'Flash Fiona', title: 'Lightning Fast' }
    ],

    // Track themes with weather + V8: themed obstacles + V9: medal times (seconds)
    tracks: [
        { name: 'Hometown Speedway', sky: '#4a90d9', ground: '#2d5a27', road: '#444', bg: '#87ceeb', scenery: ['🌳', '🏠', '🌲', '⛽'], weather: 'clear', obstacles: ['cone', 'puddle', 'trashcan'], medals: { gold: 120, silver: 180, bronze: 240 } },
        { name: 'Beach Boulevard', sky: '#87ceeb', ground: '#f4d03f', road: '#555', bg: '#e8d5b7', scenery: ['🌴', '🏖️', '⛱️', '🐚'], weather: 'clear', obstacles: ['cone', 'crab', 'sandpile'], medals: { gold: 120, silver: 180, bronze: 240 } },
        { name: 'Mountain Pass', sky: '#2c3e50', ground: '#27ae60', road: '#3a3a3a', bg: '#95a5a6', scenery: ['🌲', '⛰️', '🦌', '🌲'], weather: 'rain', obstacles: ['puddle', 'rock', 'log'], medals: { gold: 130, silver: 190, bronze: 250 } },
        { name: 'Desert Highway', sky: '#e67e22', ground: '#d4a437', road: '#333', bg: '#f0c27f', scenery: ['🌵', '🏜️', '🦎', '🌵'], weather: 'sunset', obstacles: ['cone', 'tumbleweed', 'sandpile'], medals: { gold: 130, silver: 190, bronze: 250 } },
        { name: 'City Circuit', sky: '#2c3e50', ground: '#7f8c8d', road: '#222', bg: '#34495e', scenery: ['🏢', '🏗️', '🏬', '🏪'], weather: 'clear', obstacles: ['cone', 'oil', 'trashcan'], medals: { gold: 125, silver: 185, bronze: 245 } },
        { name: 'Night Neon Strip', sky: '#0a0a2a', ground: '#1a1a3a', road: '#111', bg: '#16213e', scenery: ['🌃', '🎰', '💡', '🌉'], weather: 'neon', obstacles: ['cone', 'oil', 'neon_sign'], medals: { gold: 135, silver: 195, bronze: 255 } },
        { name: 'Championship Finale', sky: '#1a1a2e', ground: '#2d2d4e', road: '#222', bg: '#e94560', scenery: ['🏟️', '🎆', '🏁', '🏟️'], weather: 'clear', obstacles: ['cone', 'oil', 'puddle'], medals: { gold: 140, silver: 200, bronze: 260 } },
        { name: 'Galaxy Speedway', sky: '#050510', ground: '#0a0a20', road: '#111', bg: '#0d0d2b', scenery: ['🌟', '🪐', '🛸', '☄️'], weather: 'neon', obstacles: ['cone', 'neon_sign', 'rock'], medals: { gold: 130, silver: 190, bronze: 250 }, secret: true }
    ],

    carColors: {
        red: '#e94560', blue: '#3498db', yellow: '#f1c40f', black: '#2c3e50',
        green: '#2ecc71', orange: '#e67e22', purple: '#9b59b6', white: '#ecf0f1',
        // V16: Premium colors
        neonpink: '#ff1493', chrome: '#c0c0c0', gold: '#ffd700', galaxy: '#4b0082'
    },

    // V5: Resolve color hex from universal or bonus color ID
    // V16: Rainbow color support — time-varying hue
    getPlayerColor() {
        const id = Progress.data.carColor;
        if (id === 'rainbow') {
            const hue = (Date.now() / 20) % 360;
            return `hsl(${hue}, 80%, 55%)`;
        }
        if (this.carColors[id]) return this.carColors[id];
        const bonus = CorvetteRenderer.bonusColors[id];
        if (bonus) return bonus.hex;
        return '#e94560';
    },

    opponentColors: ['#c0392b', '#2980b9', '#708090', '#e67e22', '#27ae60'],

    init() {
        this.canvas = document.getElementById('race-canvas');
        this.ctx = this.canvas.getContext('2d');
        this._resize();
        window.addEventListener('resize', () => this._resize());
    },

    _resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        this.roadY = this.canvas.height * 0.55;
        this.laneYs = [this.roadY - this.laneHeight, this.roadY, this.roadY + this.laneHeight];
    },

    startRace(subject, topic, trackIndex) {
        this.init();
        this.subject = subject;
        this.topic = topic;
        this.trackIndex = trackIndex || Progress.data.currentTrack;

        const stats = Progress.getCarStats();
        this.baseSpeed = (2.5 + stats.speed * 0.8);

        // Slow down for Pre-K Easy (gentler pace for young learners)
        const grade = Progress.data.gradeLevel || 'prek';
        if (grade === 'prek') this.baseSpeed *= 0.85;

        // Reset race state
        this.scrollX = 0;
        this.playerX = 120;
        this.playerLane = 1;
        this.targetLane = 1;
        this.playerY = this.laneYs[1];
        this.playerSpeed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;
        this.nitroTimer = 0;
        this.wheelAngle = 0;
        this.suspensionOffset = 0;
        this.leanAngle = 0;
        this.wobbleTimer = 0;
        this.screenShake = 0;
        this.hitFlash = 0;
        this.boostFlash = 0;
        this.exhaustParticles = [];
        this.speedLines = [];
        this.nitroParticles = [];
        this.questionsAsked = 0;
        this.correctCount = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.consecutiveWrong = 0;
        this.awaitingAnswer = false;
        this.paused = false;
        this.draftingBehind = null;
        this.draftBoost = 0;

        // V3 resets
        this.powerUps = [];
        this.activePowerUp = null;
        this.shieldActive = false;
        this.magnetActive = false;
        this.magnetBonusEarned = false;
        this.freezeTimer = 0;
        this.finishing = false;
        this.finishTimer = 0;
        this.bonusChallengeGiven = false;
        this.bonusCorrect = false;
        this.rainParticles = [];
        this.raceStartTime = Date.now();

        // V4 resets
        this._tutorialObstacleShown = false;
        this._tutorialPowerUpShown = false;
        this._tutorialQuestionShown = false;

        // V7 resets
        this.nearMissBonus = 0;
        this.nearMissFlash = 0;
        this.nearMissCount = 0;
        this.doubleStarsActive = false;
        this.doubleStarBonuses = 0;

        // V15: Visual enhancement resets
        this.boostZoom = 0;
        this.foregroundParticles = [];
        this._stars = null; // lazy-init per track

        // V8: Track challenge
        this._activeChallenge = this.trackChallenges[this.trackIndex] || this.trackChallenges[0];
        this._challengeCompleted = false;
        this._obstacleHitCount = 0;

        // V9: Ghost car — load best ghost for this track, start recording
        this._ghostRecording = [];
        this._ghostFrame = 0;
        this._frameCount = 0;
        this._ghostPlayback = (Progress.data.ghostData && Progress.data.ghostData[this.trackIndex]) || null;

        // V7: Weather modifiers — rain slows, desert saps handling, neon reduces visibility
        const weather = (this.tracks[this.trackIndex] || this.tracks[0]).weather;
        if (weather === 'rain') {
            this.weatherSpeedMod = 0.92;
            this.weatherHandlingMod = 0.8;
        } else if (weather === 'sunset') {
            this.weatherSpeedMod = 1.0;
            this.weatherHandlingMod = 0.9;
        } else if (weather === 'neon') {
            this.weatherSpeedMod = 0.95;
            this.weatherHandlingMod = 0.95;
        } else {
            this.weatherSpeedMod = 1.0;
            this.weatherHandlingMod = 1.0;
        }

        Progress.recordTrackRaced(this.trackIndex);

        // Questions spacing
        this.questionInterval = this.trackLength / (this.questionsTotal + 1);
        this.nextQuestionAt = this.questionInterval;

        // Opponents with baseSpeed for rubber-banding + V5 random generations
        const trackSpeedBonus = this.trackIndex * 0.15;
        const allGens = Object.keys(CorvetteRenderer.generations);
        const playerGen = Progress.data.carType || 'c1';
        const oppGens = allGens.filter(g => g !== playerGen);
        this.opponents = [];
        // V8: Shuffle opponent names for variety
        const shuffledNames = [...this.opponentNames].sort(() => Math.random() - 0.5);
        // V10: AI personality types affect speed variance and lane behavior
        const aiTypes = ['aggressive', 'cautious', 'steady'];
        for (let i = 0; i < this.numOpponents; i++) {
            const ai = aiTypes[i % aiTypes.length];
            const speedVar = ai === 'aggressive' ? 0.3 : ai === 'cautious' ? -0.2 : 0;
            let oppSpeed = 2.3 + Math.random() * 1.0 + trackSpeedBonus + speedVar;
            if (grade === 'prek') oppSpeed *= 0.85;
            const personality = shuffledNames[i] || this.opponentNames[i];
            this.opponents.push({
                worldX: -30 + Math.random() * 50,
                lane: i,
                y: this.laneYs[i],
                targetY: this.laneYs[i],
                speed: oppSpeed,
                baseSpeed: oppSpeed,
                color: this.opponentColors[i],
                width: 55,
                height: 22,
                laneChangeTimer: 200 + Math.random() * 300,
                generation: oppGens[Math.floor(Math.random() * oppGens.length)],
                name: personality.name,
                title: personality.title,
                ai: ai
            });
        }

        this.obstacles = [];
        this.nextObstacleAt = 2000 + Math.random() * 1500;

        this._generateScenery();
        this._generateClouds();
        this._setupControls();
        this._updateHUD();

        // V4: Start race music
        Audio.startRaceMusic();

        // V9: Weather ambient sounds
        const trackWeather = (this.tracks[this.trackIndex] || this.tracks[0]).weather;
        Audio.startWeatherAmbient(trackWeather);

        // V4: Start tutorial if needed
        if (Tutorial.isNeeded()) {
            Tutorial.start();
        }

        this.running = true;
        this._countdown(() => {
            // V4: Show lane tutorial
            Tutorial.show('lanes');
            this._gameLoop();
        });
    },

    _setupControls() {
        if (this._touchHandler) {
            this.canvas.removeEventListener('touchstart', this._touchHandler);
            this.canvas.removeEventListener('mousedown', this._touchHandler);
        }

        this._touchHandler = (e) => {
            if (this.paused || !this.running) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            const h = this.canvas.height;

            // V17: Simple thirds — top third = up, bottom third = down (more forgiving for kids)
            if (y < h / 3) {
                this._changeLane(-1);
            } else if (y > h * 2 / 3) {
                this._changeLane(1);
            }
        };

        this.canvas.addEventListener('touchstart', this._touchHandler, { passive: false });
        this.canvas.addEventListener('mousedown', this._touchHandler);

        // V4: Keyboard controls
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
        this._keyHandler = (e) => {
            if (this.paused || !this.running) return;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this._changeLane(-1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this._changeLane(1);
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    },

    // V4: Centralized lane change with sound
    _changeLane(direction) {
        const newLane = this.playerLane + direction;
        if (newLane < 0 || newLane > 2) return;
        if (newLane === this.targetLane) return;
        this.targetLane = newLane;
        Audio.playLaneChange();
    },

    // V5: Canvas-drawn scenery generation
    _generateScenery() {
        this.sceneryObjects = [];
        const theme = this.tracks[this.trackIndex] || this.tracks[0];

        // Scenery types per theme
        const sceneryTypes = {
            'Hometown Speedway':     ['tree_deciduous', 'bush', 'house', 'fence_section', 'lamp_post'],
            'Beach Boulevard':       ['palm_tree', 'bush_tropical', 'umbrella', 'fence_section'],
            'Mountain Pass':         ['pine_tree', 'pine_tree', 'rock', 'bush', 'fence_section'],
            'Desert Highway':        ['cactus', 'cactus_small', 'rock', 'tumbleweed'],
            'City Circuit':          ['building', 'building_tall', 'lamp_post', 'barrier'],
            'Night Neon Strip':      ['building_neon', 'lamp_post_neon', 'barrier', 'sign'],
            'Championship Finale':   ['banner', 'barrier', 'lamp_post', 'flag']
        };
        const types = sceneryTypes[theme.name] || ['tree_deciduous', 'bush', 'fence_section'];

        // Generate objects — denser placement with variety, larger scale
        for (let x = 150; x < this.trackLength; x += 70 + Math.random() * 100) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const type = types[Math.floor(Math.random() * types.length)];
            const scale = 1.2 + Math.random() * 0.8;
            this.sceneryObjects.push({
                worldX: x, side, type, scale,
                colorSeed: Math.random()
            });
        }

        // Add fence posts along road edges at regular intervals
        for (let x = 100; x < this.trackLength; x += 50) {
            this.sceneryObjects.push({ worldX: x, side: -1, type: 'post', scale: 1.5, colorSeed: 0 });
            this.sceneryObjects.push({ worldX: x, side: 1, type: 'post', scale: 1.5, colorSeed: 0 });
        }
    },

    // V15: Generate star field for night/neon tracks
    _generateStars() {
        const w = this.canvas ? this.canvas.width : 1024;
        const h = this.canvas ? this.canvas.height : 600;
        const horizonY = h * 0.42;
        this._stars = [];
        for (let i = 0; i < 80; i++) {
            this._stars.push({
                x: Math.random() * w,
                y: Math.random() * horizonY * 0.85,
                size: 0.5 + Math.random() * 1.8,
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 2.5
            });
        }
    },

    // V5: Bigger varied clouds
    _generateClouds() {
        this.clouds = [];
        const cw = this.canvas ? this.canvas.width : 1024;
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * cw * 2.5,
                y: 8 + Math.random() * 90,
                width: 50 + Math.random() * 80,
                height: 16 + Math.random() * 16,
                speed: 0.015 + Math.random() * 0.035,
                alpha: 0.12 + Math.random() * 0.2
            });
        }
    },

    // Starting grid + countdown
    _countdown(callback) {
        // Show starting grid first, then 3-2-1
        this._drawStartingGrid();
        setTimeout(() => {
            this._runCountdown(callback);
        }, 1500);
    },

    _drawStartingGrid() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this._drawBackground();
        this._drawRoad();

        // Draw opponents at staggered start positions
        const carColor = this.getPlayerColor();
        const carType = Progress.data.carType || 'c1';
        const laneYs = this._getLaneYPositions ? [this.playerY - 25, this.playerY, this.playerY + 25] : [];

        // Draw 3 opponents behind/alongside the player
        this.opponents.forEach((opp, i) => {
            const ox = this.playerX - 60 - i * 40;
            const oy = this.playerY + (i === 0 ? -22 : i === 1 ? 22 : 0);
            CorvetteRenderer.drawOpponent(ctx, opp.generation, ox, oy, opp.width, opp.height, opp.color);
        });

        // Draw player car in pole position
        this._drawPlayerCar(this.playerX, this.playerY, carColor, 75, 30);

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);

        // "STARTING GRID" title
        const cx = w / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillText('STARTING GRID', cx, h * 0.3);
        ctx.shadowBlur = 0;

        // Track name
        const theme = this.tracks[this.trackIndex] || this.tracks[0];
        if (theme && theme.name) {
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#aaa';
            ctx.fillText(theme.name, cx, h * 0.3 + 35);
        }

        // V8: Track challenge goal
        if (this._activeChallenge) {
            ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`${this._activeChallenge.icon} Challenge: ${this._activeChallenge.desc}`, cx, h * 0.3 + 55);
        }

        // Position labels next to cars — V8: show names
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('YOU', this.playerX, this.playerY - 22);
        this.opponents.forEach((opp, i) => {
            const ox = this.playerX - 60 - i * 40;
            const oy = this.playerY + (i === 0 ? -22 : i === 1 ? 22 : 0);
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
            ctx.fillText(opp.name || ('P' + (i + 2)), ox, oy - 18);
        });
    },

    _runCountdown(callback) {
        let count = 3;
        const tick = () => {
            if (count > 0) {
                this._drawCountdown(count);
                Audio.playCountdown();
                for (let i = 0; i < 5; i++) {
                    this.exhaustParticles.push({
                        x: this.playerX - 35,
                        y: this.playerY + 5 + (Math.random() - 0.5) * 10,
                        vx: -1.5 - Math.random() * 2,
                        vy: (Math.random() - 0.5) * 1.5,
                        life: 1,
                        size: 3 + Math.random() * 4,
                        color: count === 1 ? 'rgba(255,150,50,0.5)' : 'rgba(150,150,150,0.4)'
                    });
                }
                if (typeof Audio.playRevving === 'function') Audio.playRevving(count);
                count--;
                setTimeout(tick, 800);
            } else {
                this._drawCountdown('GO!');
                Audio.playNitro();
                // V16: Turbo Start mod — extended nitro at race start
                this.nitroTimer = Progress.isModActive('turbo_start') ? 60 : 30;
                this.targetSpeed = this.baseSpeed + (Progress.isModActive('turbo_start') ? 6 : 4);
                for (let i = 0; i < 12; i++) {
                    this.nitroParticles.push({
                        x: this.playerX - 35,
                        y: this.playerY + (Math.random() - 0.5) * 18,
                        vx: -4 - Math.random() * 5,
                        vy: (Math.random() - 0.5) * 3,
                        life: 1,
                        color: ['#ffd700', '#e94560', '#ff6b35'][Math.floor(Math.random() * 3)],
                        size: 4 + Math.random() * 6
                    });
                }
                setTimeout(callback, 500);
            }
        };
        tick();
    },

    _countdownAnim: 0,

    // V16: Floating text popups for Lucky Star etc.
    _floatingTexts: [],
    _showFloatingText(text, color, x, y) {
        this._floatingTexts.push({ text, color, x, y, life: 40, startY: y });
    },
    _drawFloatingTexts() {
        const ctx = this.ctx;
        this._floatingTexts = this._floatingTexts.filter(ft => {
            ft.life--;
            const alpha = Math.min(1, ft.life / 15);
            const rise = (40 - ft.life) * 1.2;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x, ft.startY - rise);
            ctx.restore();
            return ft.life > 0;
        });
    },

    _drawCountdown(text) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Animate the countdown pulse
        this._countdownAnim = Date.now();

        this._drawBackground();
        this._drawRoad();
        const carColor = this.getPlayerColor();
        this._drawPlayerCar(this.playerX, this.playerY, carColor, 75, 30);
        this._drawParticles(this.exhaustParticles);
        this._drawParticles(this.nitroParticles);
        this._updateParticles(this.exhaustParticles);
        this._updateParticles(this.nitroParticles);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2, cy = h / 2 - 20;

        // Traffic light housing
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(cx - 32, cy - 52, 64, 104, 12);
        } else {
            ctx.rect(cx - 32, cy - 52, 64, 104);
        }
        ctx.fill();
        ctx.stroke();

        const colors = text === 'GO!' ? ['#333', '#333', '#2ecc71'] :
            text === 1 ? ['#e74c3c', '#333', '#333'] :
            text === 2 ? ['#e74c3c', '#f39c12', '#333'] :
            ['#e74c3c', '#333', '#333'];

        [-30, 0, 30].forEach((offset, i) => {
            // Active light gets a glow
            if (colors[i] !== '#333') {
                ctx.save();
                ctx.shadowColor = colors[i];
                ctx.shadowBlur = 15;
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.arc(cx, cy + offset, 13, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(cx, cy + offset, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Big number/text with pulse animation
        const isGo = text === 'GO!';
        const displayText = isGo ? 'GO!' : String(text);
        const pulsePhase = ((Date.now() % 800) / 800) * Math.PI * 2;
        const scale = isGo ? 1.3 + Math.sin(pulsePhase) * 0.15 : 1.0;

        ctx.save();
        ctx.translate(cx, cy + 70);
        ctx.scale(scale, scale);
        ctx.fillStyle = isGo ? '#2ecc71' : '#ffd700';
        ctx.font = `bold ${isGo ? 56 : 48}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (isGo) {
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 20;
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(displayText, 0, 0);
        ctx.fillText(displayText, 0, 0);
        ctx.restore();

        // Show track name
        const trackName = (this.tracks[this.trackIndex] || this.tracks[0]).name;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(trackName, cx, cy - 80);
    },

    _gameLoop() {
        if (!this.running) return;
        if (!this.paused) {
            this._update();
        }
        this._draw();
        requestAnimationFrame(() => this._gameLoop());
    },

    _update() {
        const stats = Progress.getCarStats();

        // Finish line deceleration
        if (this.finishing) {
            this.finishTimer--;
            this.playerSpeed *= 0.97;
            this.scrollX += this.playerSpeed;
            this.wheelAngle += this.playerSpeed * 0.15;
            this.opponents.forEach(opp => {
                opp.speed *= 0.97;
                opp.worldX += opp.speed;
            });
            if (this.finishTimer <= 0) {
                this.finishing = false;
                this._completeFinalRace();
            }
            return;
        }

        // Lane switching (V7: weather affects handling)
        const handlingSpeed = (0.08 + stats.handling * 0.04) * this.weatherHandlingMod;
        if (this.playerLane !== this.targetLane) {
            this.playerLane = this.targetLane;
        }
        const targetY = this.laneYs[this.playerLane];
        const yDiff = targetY - this.playerY;
        this.playerY += yDiff * handlingSpeed;

        // V4: Car lean based on Y movement
        const targetLean = yDiff * 0.02;
        this.leanAngle += (targetLean - this.leanAngle) * 0.15;
        // Decay lean when settled
        if (Math.abs(yDiff) < 1) this.leanAngle *= 0.9;

        // Speed (V7: weather modifier applied)
        const effectiveTarget = this.targetSpeed * this.weatherSpeedMod;
        this.playerSpeed += (effectiveTarget - this.playerSpeed) * 0.1;

        // Nitro timer
        if (this.nitroTimer > 0) {
            this.nitroTimer--;
            if (this.nitroTimer === 0) {
                this.targetSpeed = this.baseSpeed;
            }
        }

        // Drafting check
        this.draftingBehind = null;
        this.draftBoost = 0;
        this.opponents.forEach(opp => {
            const screenX = this.playerX + (opp.worldX - this.scrollX);
            const sameLane = Math.abs(opp.y - this.playerY) < 20;
            const behind = screenX > this.playerX + 30 && screenX < this.playerX + 90;
            if (sameLane && behind) {
                this.draftingBehind = opp;
                this.draftBoost = 0.3;
            }
        });

        if (this.draftBoost > 0 && this.nitroTimer === 0) {
            this.targetSpeed = this.baseSpeed + this.draftBoost;
        }

        this.scrollX += this.playerSpeed;
        this.wheelAngle += this.playerSpeed * 0.15;
        this.suspensionOffset = Math.sin(this.scrollX * 0.05) * (this.nitroTimer > 0 ? 2 : 0.8);

        // Freeze timer
        if (this.freezeTimer > 0) this.freezeTimer--;
        // V5.5: Screen shake + hit flash decay
        if (this.screenShake > 0) this.screenShake--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.boostFlash > 0) this.boostFlash--;
        if (this.wobbleTimer > 0) this.wobbleTimer--;
        // V15: Camera zoom pulse decay
        if (this.boostZoom > 0) this.boostZoom = Math.max(0, this.boostZoom - 0.065);

        // Update opponents with rubber-banding + V10: AI personality modifiers
        this.opponents.forEach(opp => {
            const dist = opp.worldX - this.scrollX;
            // Aggressive: tighter rubber-band (catches up faster, slows less)
            // Cautious: looser rubber-band (slower catch-up, slows more)
            const catchMod = opp.ai === 'aggressive' ? 1.4 : opp.ai === 'cautious' ? 1.2 : 1.3;
            const slowMod = opp.ai === 'aggressive' ? 0.7 : opp.ai === 'cautious' ? 0.5 : 0.6;
            if (dist > 2000) {
                opp.speed = Math.max(opp.baseSpeed * slowMod, opp.speed * 0.985);
            } else if (dist < -1000) {
                opp.speed = Math.min(opp.baseSpeed * catchMod, opp.speed * 1.01);
            } else {
                opp.speed += (opp.baseSpeed - opp.speed) * 0.01;
            }

            // Aggressive opponents add random bursts
            if (opp.ai === 'aggressive' && Math.random() < 0.005) {
                opp.speed = Math.min(opp.baseSpeed * 1.5, opp.speed * 1.15);
            }

            if (this.freezeTimer > 0) {
                opp.worldX += opp.speed * 0.1;
            } else {
                opp.worldX += opp.speed;
            }

            opp.laneChangeTimer--;
            if (opp.laneChangeTimer <= 0) {
                // V7: Smart obstacle avoidance — check if obstacle ahead in current lane
                let dodging = false;
                for (const obs of this.obstacles) {
                    if (obs.hit) continue;
                    const ahead = obs.worldX - opp.worldX;
                    if (ahead > 0 && ahead < 300 && obs.lane === opp.lane) {
                        // Obstacle ahead! Dodge to an adjacent lane
                        const safeLanes = [0, 1, 2].filter(l => l !== opp.lane);
                        opp.lane = safeLanes[Math.floor(Math.random() * safeLanes.length)];
                        opp.targetY = this.laneYs[opp.lane];
                        opp.laneChangeTimer = 60 + Math.random() * 100;
                        dodging = true;
                        break;
                    }
                }
                if (!dodging) {
                    const newLane = Math.floor(Math.random() * 3);
                    opp.lane = newLane;
                    opp.targetY = this.laneYs[newLane];
                    // V10: AI personality affects lane change frequency
                    const lcBase = opp.ai === 'aggressive' ? 100 : opp.ai === 'cautious' ? 300 : 200;
                    opp.laneChangeTimer = lcBase + Math.random() * 400;
                }
            }
            opp.y += (opp.targetY - opp.y) * 0.05;
        });

        // Spawn obstacles + power-ups
        if (this.scrollX >= this.nextObstacleAt && this.obstacles.length < 5) {
            if (Math.random() < 0.25 && !this.activePowerUp) {
                const types = ['shield', 'magnet', 'freeze', 'speed_burst', 'double_stars'];
                this.powerUps.push({
                    worldX: this.scrollX + this.canvas.width + 100,
                    lane: Math.floor(Math.random() * 3),
                    type: types[Math.floor(Math.random() * types.length)],
                    collected: false
                });
                // V4: Tutorial hint
                if (!this._tutorialPowerUpShown) {
                    this._tutorialPowerUpShown = true;
                    Tutorial.show('powerups');
                }
            } else {
                // V8: Track-themed obstacles
                const trackObs = (this.tracks[this.trackIndex] || this.tracks[0]).obstacles || ['cone', 'puddle', 'oil'];
                this.obstacles.push({
                    worldX: this.scrollX + this.canvas.width + 100,
                    lane: Math.floor(Math.random() * 3),
                    type: trackObs[Math.floor(Math.random() * trackObs.length)],
                    hit: false
                });
                // V4: Tutorial hint
                if (!this._tutorialObstacleShown) {
                    this._tutorialObstacleShown = true;
                    Tutorial.show('obstacles');
                }
            }
            this.nextObstacleAt = this.scrollX + 800 + Math.random() * 1200;
        }

        // Obstacle collisions
        this.obstacles.forEach(obs => {
            if (obs.hit) return;
            const screenX = this.playerX + (obs.worldX - this.scrollX);
            const obsY = this.laneYs[obs.lane];
            if (Math.abs(screenX - this.playerX) < 30 && Math.abs(obsY - this.playerY) < 20) {
                obs.hit = true;
                if (this.shieldActive) {
                    this.shieldActive = false;
                    this.activePowerUp = null;
                    Audio.playCountdown();
                } else {
                    Audio.playHit();
                    // V16: Durability reduces shake, flash, and slow penalty
                    const durability = stats.durability || 1;
                    const durReduction = Math.max(0.3, 1 - (durability - 1) * 0.6); // 1.0→1x, 1.8→0.52x
                    this.screenShake = Math.round(12 * durReduction);
                    this.hitFlash = Math.round(8 * durReduction);
                    // Debris particles
                    for (let d = 0; d < 8; d++) {
                        this.exhaustParticles.push({
                            x: this.playerX + (Math.random() - 0.5) * 30,
                            y: this.playerY + (Math.random() - 0.5) * 15,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -1 - Math.random() * 3,
                            life: 1,
                            size: 2 + Math.random() * 4,
                            color: obs.type === 'oil' ? 'rgba(30,30,30,0.7)' : 'rgba(255,150,50,0.6)'
                        });
                    }
                    this._obstacleHitCount++;
                    const slowPenalty = Math.max(0.3, (1.5 - stats.handling * 0.3) * durReduction);
                    this.targetSpeed = this.baseSpeed - slowPenalty;
                    const recoveryTime = Math.round(600 * durReduction);
                    setTimeout(() => {
                        if (this.running && this.nitroTimer === 0) this.targetSpeed = this.baseSpeed;
                    }, recoveryTime);
                }
            }
        });

        // V7: Near-miss detection — reward dodging obstacles closely
        this.obstacles.forEach(obs => {
            if (obs.hit || obs.nearMissChecked) return;
            const screenX = this.playerX + (obs.worldX - this.scrollX);
            if (screenX < this.playerX - 40) {
                obs.nearMissChecked = true;
                const obsY = this.laneYs[obs.lane];
                const yDist = Math.abs(obsY - this.playerY);
                // Close but not hit: within 35px vertically (one lane away)
                if (yDist > 15 && yDist < 45) {
                    this.nearMissCount++;
                    this.nearMissFlash = 20;
                    this.boostFlash = 8;
                    // Small speed burst
                    this.targetSpeed = this.baseSpeed + 1.5;
                    setTimeout(() => {
                        if (this.running && this.nitroTimer === 0) this.targetSpeed = this.baseSpeed;
                    }, 800);
                }
            }
        });

        // V7: Near-miss flash decay
        if (this.nearMissFlash > 0) this.nearMissFlash--;

        // Power-up collisions
        this.powerUps.forEach(pu => {
            if (pu.collected) return;
            const screenX = this.playerX + (pu.worldX - this.scrollX);
            const puY = this.laneYs[pu.lane];
            if (Math.abs(screenX - this.playerX) < 35 && Math.abs(puY - this.playerY) < 25) {
                pu.collected = true;
                Audio.playPowerUp();
                if (pu.type === 'shield') {
                    this.activePowerUp = { type: 'shield' };
                    this.shieldActive = true;
                } else if (pu.type === 'magnet') {
                    this.activePowerUp = { type: 'magnet' };
                    this.magnetActive = true;
                } else if (pu.type === 'freeze') {
                    this.freezeTimer = 180;
                } else if (pu.type === 'speed_burst') {
                    // V7: Instant speed burst for 3 seconds
                    this.nitroTimer = 180;
                    this.targetSpeed = this.baseSpeed + 3;
                    this.boostFlash = 10;
                } else if (pu.type === 'double_stars') {
                    // V7: Double XP for next correct answer
                    this.activePowerUp = { type: 'double_stars' };
                    this.doubleStarsActive = true;
                }
            }
        });

        // Clean up off-screen
        this.obstacles = this.obstacles.filter(obs => {
            const screenX = this.playerX + (obs.worldX - this.scrollX);
            return screenX > -200;
        });
        this.powerUps = this.powerUps.filter(pu => {
            const screenX = this.playerX + (pu.worldX - this.scrollX);
            return screenX > -200 && !pu.collected;
        });

        // Exhaust particles (V18: skip if reduced motion preferred)
        if (!Settings.prefersReducedMotion && Math.random() < 0.3) {
            this.exhaustParticles.push({
                x: this.playerX - 35,
                y: this.playerY + 5 + (Math.random() - 0.5) * 6,
                vx: -1 - Math.random(),
                vy: (Math.random() - 0.5) * 0.5,
                life: 1,
                size: 2 + Math.random() * 3,
                color: 'rgba(150,150,150,0.4)'
            });
        }

        // V5.5: Enhanced nitro particles — more plume with inner glow colors
        if (!Settings.prefersReducedMotion && this.nitroTimer > 0) {
            for (let i = 0; i < 6; i++) {
                const spread = (Math.random() - 0.5) * 20;
                this.nitroParticles.push({
                    x: this.playerX - 35 + (Math.random() - 0.5) * 8,
                    y: this.playerY + spread,
                    vx: -4 - Math.random() * 5,
                    vy: spread * 0.15 + (Math.random() - 0.5) * 1.5,
                    life: 1,
                    color: ['#ffd700', '#e94560', '#ff6b35', '#fff', '#ffaa00'][Math.floor(Math.random() * 5)],
                    size: 3 + Math.random() * 7
                });
            }
            // Inner bright core particles
            if (Math.random() < 0.5) {
                this.nitroParticles.push({
                    x: this.playerX - 32,
                    y: this.playerY + (Math.random() - 0.5) * 6,
                    vx: -2 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 0.8,
                    life: 1,
                    color: '#fff',
                    size: 2 + Math.random() * 3
                });
            }
        }

        // V16: Trail mod particles (V18: skip if reduced motion preferred)
        if (!Settings.prefersReducedMotion && Progress.isModActive('fire_trail')) {
            for (let i = 0; i < 3; i++) {
                this.exhaustParticles.push({
                    x: this.playerX - 30 + (Math.random() - 0.5) * 10,
                    y: this.playerY + (Math.random() - 0.5) * 12,
                    vx: -2 - Math.random() * 3,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 1,
                    size: 3 + Math.random() * 5,
                    color: ['#ff4500', '#ff6600', '#ff8800', '#ffaa00', '#ffd700'][Math.floor(Math.random() * 5)]
                });
            }
        } else if (Progress.isModActive('star_trail')) {
            if (Math.random() < 0.4) {
                this.exhaustParticles.push({
                    x: this.playerX - 25 + (Math.random() - 0.5) * 20,
                    y: this.playerY + (Math.random() - 0.5) * 15,
                    vx: -1 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 1,
                    life: 1,
                    size: 2 + Math.random() * 4,
                    color: ['#ffd700', '#fff', '#ffe066'][Math.floor(Math.random() * 3)]
                });
            }
        } else if (Progress.isModActive('rainbow_trail')) {
            for (let i = 0; i < 2; i++) {
                const hue = ((Date.now() / 10) + Math.random() * 60) % 360;
                this.exhaustParticles.push({
                    x: this.playerX - 30 + (Math.random() - 0.5) * 10,
                    y: this.playerY + (Math.random() - 0.5) * 12,
                    vx: -2 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 1,
                    life: 1,
                    size: 3 + Math.random() * 4,
                    color: `hsl(${hue}, 90%, 60%)`
                });
            }
        }

        // V14: Enhanced speed lines — more during nitro, with varying lengths
        if (this.playerSpeed > 5) {
            const lineChance = this.nitroTimer > 0 ? 3 : 1;
            for (let i = 0; i < lineChance; i++) {
                this.speedLines.push({
                    x: this.canvas.width + 10,
                    y: Math.random() * this.canvas.height,
                    length: (this.nitroTimer > 0 ? 50 : 30) + Math.random() * 80,
                    life: 1
                });
            }
        }

        // Rain particles
        const weather = (this.tracks[this.trackIndex] || this.tracks[0]).weather;
        if (weather === 'rain') {
            for (let i = 0; i < 3; i++) {
                this.rainParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: -5,
                    vx: -2,
                    vy: 8 + Math.random() * 4,
                    life: 1,
                    size: 1,
                    color: 'rgba(180,200,255,0.6)'
                });
            }
        }

        // V15: Foreground parallax particles — speed-dependent debris/grass
        if (this.playerSpeed > 3) {
            const fgCount = Math.floor((this.playerSpeed - 3) * 0.4);
            const h = this.canvas ? this.canvas.height : 600;
            const cw = this.canvas ? this.canvas.width : 1024;
            const roadBottom = this.roadY + 65;
            for (let i = 0; i < fgCount; i++) {
                // Spawn at screen right, either above or below the road area
                const aboveRoad = Math.random() < 0.3;
                const py = aboveRoad ? (Math.random() * (this.roadY - 80)) : (roadBottom + 15 + Math.random() * (h - roadBottom - 25));
                this.foregroundParticles.push({
                    x: cw + Math.random() * 30,
                    y: py,
                    vx: -(this.playerSpeed * (1.3 + Math.random() * 0.8)),
                    size: 1 + Math.random() * 2.5,
                    alpha: 0.15 + Math.random() * 0.25,
                    life: 80
                });
            }
        }
        // Update foreground particles
        for (let i = this.foregroundParticles.length - 1; i >= 0; i--) {
            const p = this.foregroundParticles[i];
            p.x += p.vx;
            p.life--;
            if (p.life <= 0 || p.x < -20) this.foregroundParticles.splice(i, 1);
        }

        // Update particles
        this._updateParticles(this.exhaustParticles);
        this._updateParticles(this.nitroParticles);
        this._updateParticles(this.rainParticles);
        this.speedLines = this.speedLines.filter(l => {
            l.x -= this.playerSpeed * 3;
            l.life -= 0.03;
            return l.life > 0 && l.x > -100;
        });

        // Questions
        if (!this.awaitingAnswer && this.questionsAsked < this.questionsTotal && this.scrollX >= this.nextQuestionAt) {
            this._askQuestion();
        }

        // Start finish line sequence
        if (this.scrollX >= this.trackLength && !this.awaitingAnswer && !this.finishing) {
            this.finishing = true;
            this.finishTimer = 90;
        }

        this._updateHUD();

        // V9: Record ghost data every 10 frames
        this._frameCount++;
        if (this._frameCount % 10 === 0) {
            this._ghostRecording.push({ x: this.scrollX, y: this.playerY });
        }
    },

    _updateParticles(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            const p = arr[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            if (p.life <= 0 || p.y > (this.canvas ? this.canvas.height + 10 : 700)) arr.splice(i, 1);
        }
    },

    _draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // V15: Camera zoom pulse on correct answer (subtle punch-in effect)
        if (this.boostZoom > 0) {
            const zoom = 1 + this.boostZoom * 0.025;
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.scale(zoom, zoom);
            ctx.translate(-w / 2, -h / 2);
        }

        // V5.5: Screen shake offset (V14: exponential decay for smoother feel)
        if (this.screenShake > 0) {
            const intensity = this.screenShake * 0.6;
            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * intensity,
                (Math.random() - 0.5) * intensity * 0.6
            );
        }

        this._drawBackground();
        this._drawClouds();
        this._drawScenery();
        this._drawRoad();
        this._drawRoadMarkings();
        this._drawObstacles();
        this._drawPowerUps();

        // V14: Enhanced speed lines — golden during nitro, thicker at high speed
        const isNitro = this.nitroTimer > 0;
        this.speedLines.forEach(l => {
            ctx.globalAlpha = l.life * (isNitro ? 0.7 : 0.35);
            ctx.strokeStyle = isNitro ? `rgba(255,215,0,${l.life * 0.7})` : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isNitro ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + l.length, l.y);
            ctx.stroke();
        });
        ctx.globalAlpha = 1;

        // Opponents (V5: each has a random Corvette generation)
        this.opponents.forEach(opp => {
            const screenX = this.playerX + (opp.worldX - this.scrollX);
            if (screenX > -100 && screenX < w + 100) {
                const oppColor = this.freezeTimer > 0 ? '#4a9dcc' : opp.color;
                CorvetteRenderer.drawOpponent(this.ctx, opp.generation || 'c1', screenX, opp.y, opp.width, opp.height, oppColor);
            }
        });

        this._drawParticles(this.exhaustParticles);
        this._drawParticles(this.nitroParticles);
        this._drawRainParticles();

        // V15: Foreground parallax particles (drawn over road, before player car)
        if (this.foregroundParticles.length > 0) {
            const theme = this.tracks[this.trackIndex] || this.tracks[0];
            const fgColor = theme.weather === 'neon' ? '#88aaff' :
                            theme.weather === 'sunset' ? '#ddb888' :
                            theme.weather === 'rain' ? '#aabbcc' : '#8a9a6a';
            this.foregroundParticles.forEach(p => {
                ctx.globalAlpha = p.alpha * Math.min(1, p.life / 15);
                ctx.fillStyle = fgColor;
                ctx.fillRect(p.x, p.y, p.size * 2.5, p.size * 0.8);
            });
            ctx.globalAlpha = 1;
        }

        // V9: Ghost car (translucent replay of best run)
        if (this._ghostPlayback && this._ghostPlayback.length > 0) {
            const gi = Math.min(Math.floor(this._frameCount / 10), this._ghostPlayback.length - 1);
            const gd = this._ghostPlayback[gi];
            if (gd) {
                const ghostScreenX = this.playerX + (gd.x - this.scrollX);
                if (ghostScreenX > -100 && ghostScreenX < w + 100) {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    CorvetteRenderer.drawCar(ctx, Progress.data.carType || 'c1', ghostScreenX, gd.y, 65, 26, '#aaa', { lod: 'race' });
                    ctx.restore();
                }
            }
        }

        // Player car (V4: uses car type + lean)
        const carColor = this.getPlayerColor();
        this._drawPlayerCar(this.playerX, this.playerY + this.suspensionOffset, carColor, 75, 30);

        // Shield glow
        if (this.shieldActive) {
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.7)';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#3498db';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(this.playerX, this.playerY + this.suspensionOffset, 42, 22, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // V15: Nitro glow with additive blending
        if (this.nitroTimer > 0) {
            const glowSize = 15 + Progress.getCarStats().nitro * 5;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.06)';
            ctx.fillRect(this.playerX - 45, this.playerY - 25, 90, 50);
            // Exhaust flame glow trail
            ctx.fillStyle = 'rgba(255, 150, 0, 0.08)';
            ctx.beginPath();
            ctx.ellipse(this.playerX - 42, this.playerY, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Drafting indicator
        if (this.draftingBehind) {
            ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('DRAFT!', this.playerX, this.playerY - 25);
        }

        // Active power-up HUD
        if (this.activePowerUp) {
            const icons = { shield: '🛡️', magnet: '🧲', double_stars: '⭐' };
            const icon = icons[this.activePowerUp.type];
            if (icon) {
                ctx.font = '20px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText(icon, 10, h - 15);
            }
        }

        // Freeze overlay
        if (this.freezeTimer > 0) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❄️ FREEZE!', w / 2, 60);
        }

        // Finish line
        if (this.finishing) {
            this._drawFinishLine();
        }

        this._drawSpeedometer();
        this._drawWeatherEffects();

        // V5.5: Hit flash overlay
        if (this.hitFlash > 0) {
            ctx.fillStyle = `rgba(255, 50, 50, ${this.hitFlash * 0.04})`;
            ctx.fillRect(0, 0, w, h);
        }

        // V5.8: Enhanced boost flash — golden vignette on correct answer
        if (this.boostFlash > 0) {
            const alpha = this.boostFlash * 0.025;
            const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h);
            grad.addColorStop(0, `rgba(255, 215, 0, 0)`);
            grad.addColorStop(1, `rgba(255, 215, 0, ${alpha})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        // V7: Near-miss text popup
        if (this.nearMissFlash > 0) {
            const alpha = Math.min(1, this.nearMissFlash / 10);
            const rise = (20 - this.nearMissFlash) * 1.5;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#2ecc71';
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 6;
            ctx.fillText('NICE DODGE!', this.playerX, this.playerY - 35 - rise);
            ctx.restore();
        }

        // V16: Draw floating texts (Lucky Star etc.)
        this._drawFloatingTexts();

        // V5.5: Restore screen shake transform
        if (this.screenShake > 0) {
            ctx.restore();
        }

        // V15: Restore camera zoom transform
        if (this.boostZoom > 0) {
            ctx.restore();
        }
    },

    // V5: Draw player car via CorvetteRenderer
    // V16: Mod effects — size, bouncy
    _drawPlayerCar(x, y, color, width, height) {
        const ctx = this.ctx;
        ctx.save();

        // V16: Size mods — visual only
        if (Progress.isModActive('big_car')) {
            width = Math.round(width * 1.5);
            height = Math.round(height * 1.5);
        } else if (Progress.isModActive('tiny_car')) {
            width = Math.round(width * 0.6);
            height = Math.round(height * 0.6);
        }

        // V16: Bouncy mode — extra suspension bounce
        if (Progress.isModActive('bouncy')) {
            y += Math.sin(this.scrollX * 0.12) * 5;
        }

        // Wrong answer wobble
        if (this.wobbleTimer > 0) {
            const decay = this.wobbleTimer / 30;
            y += Math.sin(this.wobbleTimer * 0.8) * 3 * decay;
            ctx.translate(x, y);
            ctx.rotate(Math.sin(this.wobbleTimer * 0.6) * 0.05 * decay);
            ctx.translate(-x, -y);
        }
        // Apply lean rotation
        else if (Math.abs(this.leanAngle) > 0.001) {
            ctx.translate(x, y);
            ctx.rotate(this.leanAngle);
            ctx.translate(-x, -y);
        }

        // V14: Squash & stretch based on acceleration
        let scaleX = 1, scaleY = 1;
        if (this.nitroTimer > 0) {
            // Stretch when boosting — wider, shorter
            const boostStretch = Math.min(0.08, this.nitroTimer * 0.001);
            scaleX = 1 + boostStretch;
            scaleY = 1 - boostStretch * 0.6;
        } else if (this.wobbleTimer > 0) {
            // Squash on wrong answer — shorter, taller
            const squash = Math.sin(this.wobbleTimer * 0.5) * 0.04 * (this.wobbleTimer / 30);
            scaleX = 1 - Math.abs(squash);
            scaleY = 1 + Math.abs(squash);
        }

        if (scaleX !== 1 || scaleY !== 1) {
            ctx.translate(x, y);
            ctx.scale(scaleX, scaleY);
            ctx.translate(-x, -y);
        }

        const carType = Progress.data.carType || 'c1';
        CorvetteRenderer.drawCar(ctx, carType, x, y, width, height, color, {
            lod: 'race', isPlayer: true, wheelAngle: this.wheelAngle
        });

        ctx.restore();
    },

    // V4 car type renderers removed — V5 uses CorvetteRenderer


    // ===== RENDERING METHODS (loaded from game-renderer.js) =====
    // _drawRainParticles, _drawWeatherEffects, _drawFinishLine, _drawParticles,
    // _drawBackground, _drawCelestial, _drawClouds, _drawScenery, _drawSceneryItem,
    // _drawRoad, _lightenRoad, _drawRoadMarkings, _drawObstacles, _drawPowerUps,
    // _drawSpeedometer — all mixed in via Object.assign below


    _askQuestion() {
        this.awaitingAnswer = true;
        this.paused = true;
        this.questionsAsked++;
        Audio.playCheckpoint();

        // V4: Tutorial hint
        if (!this._tutorialQuestionShown) {
            this._tutorialQuestionShown = true;
            Tutorial.show('questions');
        }

        Questions.show(this.subject, this.topic, (correct) => {
            this.awaitingAnswer = false;
            this.paused = false;

            const stats = Progress.getCarStats();

            if (correct) {
                this.correctCount++;
                this.streak++;
                this.consecutiveWrong = 0;
                if (this.streak > this.bestStreak) this.bestStreak = this.streak;

                const nitroBoost = (6 + Math.min(this.streak, 5)) * stats.nitro;
                this.targetSpeed = this.baseSpeed + nitroBoost * 0.5;
                this.nitroTimer = Math.round(90 * stats.nitro);
                Audio.playNitro();

                // V14: Streak milestone chime
                if (this.streak === 3 || this.streak === 5 || this.streak === 8 || this.streak === 10) {
                    setTimeout(() => Audio.playStreakChime(this.streak), 200);
                }

                // V14: Gentle screen shake on boost (less intense than obstacle hits)
                this.screenShake = Math.min(6, 3 + this.streak);

                // V15: Camera zoom pulse on correct answer/boost
                this.boostZoom = Math.min(1, 0.6 + this.streak * 0.05);

                // V5.7: Visual speed boost — burst of particles + boost flash
                // V14: Scale particle count with streak for escalating juice
                const particleCount = Math.min(30, 12 + this.streak * 2);
                this.boostFlash = Math.min(20, 12 + this.streak);
                for (let i = 0; i < particleCount; i++) {
                    this.nitroParticles.push({
                        x: this.playerX - 10 + Math.random() * 30,
                        y: this.playerY + (Math.random() - 0.5) * 20,
                        vx: -3 - Math.random() * 5,
                        vy: (Math.random() - 0.5) * 3,
                        life: 1,
                        size: 3 + Math.random() * 5,
                        color: ['#ffd700', '#ff6b35', '#fff', '#ffaa00'][Math.floor(Math.random() * 4)]
                    });
                }
                // Speed lines burst — more lines during streaks
                const lineCount = Math.min(16, 6 + this.streak * 2);
                for (let i = 0; i < lineCount; i++) {
                    this.speedLines.push({
                        x: this.canvas.width + Math.random() * 100,
                        y: Math.random() * this.canvas.height,
                        len: 40 + Math.random() * 80,
                        speed: 8 + Math.random() * 12,
                        alpha: 0.6 + Math.random() * 0.4
                    });
                }

                // Magnet bonus
                if (this.magnetActive) {
                    this.magnetActive = false;
                    this.magnetBonusEarned = true;
                    this.activePowerUp = null;
                }
                // V7: Double stars bonus — extra boost on correct answer
                if (this.doubleStarsActive) {
                    this.doubleStarsActive = false;
                    this.activePowerUp = null;
                    // Award bonus star instead of inflating correctCount (fixes >100% accuracy bug)
                    this.doubleStarBonuses = (this.doubleStarBonuses || 0) + 1;
                }
                // V16: Lucky Star mod — 15% chance of bonus star on correct answer
                if (Progress.isModActive('lucky_star') && Math.random() < 0.15) {
                    this.luckyStarsEarned = (this.luckyStarsEarned || 0) + 1;
                    // Show lucky star popup
                    this._showFloatingText('+1 LUCKY!', '#2ecc71', this.playerX, this.playerY - 40);
                }
            } else {
                this.streak = 0;
                this.consecutiveWrong++;
                this.wobbleTimer = 30;
                this.targetSpeed = this.baseSpeed * 0.5;
                setTimeout(() => {
                    if (this.running && this.nitroTimer === 0) this.targetSpeed = this.baseSpeed;
                }, 1000);
            }

            this.nextQuestionAt = this.scrollX + this.questionInterval;
        });
    },

    _updateHUD() {
        let position = 1;
        this.opponents.forEach(opp => {
            if (opp.worldX > this.scrollX) position++;
        });

        const posText = ['1st', '2nd', '3rd', '4th'][position - 1] || `${position}th`;
        const posEl = document.getElementById('hud-position');
        if (posEl) posEl.textContent = `Position: ${posText}`;

        const progressFill = document.getElementById('hud-progress-fill');
        const playerProgress = this.scrollX / this.trackLength;
        if (progressFill) progressFill.style.width = `${Math.min(100, playerProgress * 100)}%`;

        // V9: Mini-map dots on progress bar
        const playerDot = document.getElementById('hud-player-dot');
        if (playerDot) playerDot.style.left = `${Math.min(98, playerProgress * 100)}%`;
        this.opponents.forEach((opp, i) => {
            const dot = document.getElementById('hud-opp-dot-' + i);
            if (dot) dot.style.left = `${Math.min(98, (opp.worldX / this.trackLength) * 100)}%`;
        });

        const qCount = document.getElementById('hud-question-count');
        if (qCount) qCount.textContent = `${this.questionsAsked}/${this.questionsTotal}`;

        const streakEl = document.getElementById('hud-streak');
        if (streakEl) {
            const prev = streakEl.textContent;
            if (this.streak > 1) {
                streakEl.textContent = `🔥 ${this.streak}x`;
                // Pulse animation when streak increases
                if (prev !== `🔥 ${this.streak}x`) {
                    streakEl.classList.remove('streak-pulse');
                    void streakEl.offsetWidth; // force reflow
                    streakEl.classList.add('streak-pulse');
                }
            } else {
                streakEl.textContent = '';
            }
        }

        // Power-up indicator
        const puEl = document.getElementById('hud-powerup');
        if (puEl) {
            let puText = '';
            if (this.shieldActive) puText = '🛡️ Shield';
            else if (this.doubleStarsActive) puText = '⭐ x2 Stars!';
            else if (this.nitroTimer > 0) puText = '🚀 Nitro!';
            else if (this.freezeTimer > 0) puText = '❄️ Freeze!';
            if (puText) {
                puEl.textContent = puText;
                puEl.style.display = 'block';
            } else {
                puEl.style.display = 'none';
            }
        }
    },

    // Check for bonus challenge before finishing
    _completeFinalRace() {
        if (this.correctCount >= 7 && !this.bonusChallengeGiven) {
            this._showBonusChallenge();
        } else {
            this._finishRace();
        }
    },

    // Bonus challenge question
    _showBonusChallenge() {
        this.bonusChallengeGiven = true;
        this.paused = true;

        const feedback = document.getElementById('race-feedback');
        if (feedback) {
            feedback.textContent = '⭐ BONUS CHALLENGE! ⭐';
            feedback.className = 'race-feedback correct-feedback';
            feedback.style.display = 'block';
            setTimeout(() => { feedback.style.display = 'none'; }, 1200);
        }

        setTimeout(() => {
            const currentLevel = Adaptive.getLevel(this.subject, this.topic);
            const bonusLevel = Math.min(currentLevel + 1, 3);
            const key = `${this.subject}_${this.topic}`;
            const savedLevel = Progress.data.adaptiveLevels[key];

            Progress.data.adaptiveLevels[key] = bonusLevel;

            Questions.show(this.subject, this.topic, (correct) => {
                if (savedLevel !== undefined) {
                    Progress.data.adaptiveLevels[key] = savedLevel;
                } else {
                    delete Progress.data.adaptiveLevels[key];
                }

                this.paused = false;
                this.bonusCorrect = correct;

                if (correct) {
                    Audio.playCorrect();
                    Audio.encourageCorrect();
                } else {
                    Audio.speak('Good try on the bonus!', { rate: 1.0, pitch: 1.1 });
                }

                setTimeout(() => this._finishRace(), 500);
            });
        }, 1300);
    },

    _finishRace() {
        this.running = false;

        // V4: Stop race music, resume menu music
        Audio.stopMusic();
        Audio.stopWeatherAmbient();

        // V4: Stop tutorial if still active
        Tutorial.stop();

        // Clean up keyboard handler
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }

        const accuracy = this.questionsTotal > 0 ? this.correctCount / this.questionsTotal : 0;
        let stars = 1;
        if (accuracy >= 0.6) stars = 2;
        if (accuracy >= 0.85) stars = 3;

        const difficultyBonus = Adaptive.getLevel(this.subject, this.topic) >= 2 ? 1.5 : 1;
        const perfectBonus = this.correctCount === this.questionsTotal ? 30 : 0;
        let xpEarned = Math.round((this.correctCount * 10 + this.bestStreak * 5 + perfectBonus) * difficultyBonus);

        // Star economy bonuses
        let bonusStars = 0;

        if (this.bestStreak >= 5) bonusStars += 2;
        else if (this.bestStreak >= 3) bonusStars += 1;

        if (Progress.isFirstTimeOnTrack(this.trackIndex)) {
            bonusStars += 3;
            Progress.recordTrackFirstComplete(this.trackIndex);
        }

        if (this.bonusCorrect) {
            bonusStars += 1;
            xpEarned += 25;
        }

        if (this.magnetBonusEarned) {
            bonusStars += 1;
        }

        // V16 fix: Double star power-up bonus (no longer inflates correctCount)
        if (this.doubleStarBonuses > 0) {
            bonusStars += this.doubleStarBonuses;
            xpEarned += this.doubleStarBonuses * 10;
        }

        const daily = Progress.getDailyChallenge();
        if (daily.subject === this.subject && daily.topicId === this.topic && !Progress.isDailyChallengeCompleted()) {
            bonusStars += 2;
            xpEarned += 25;
            Progress.completeDailyChallenge();
        }

        // V8: Check track challenge
        let challengeCompleted = false;
        if (this._activeChallenge && this._activeChallenge.check(this)) {
            challengeCompleted = true;
            bonusStars += 1;
            xpEarned += 15;
        }

        // V16: Lucky Star mod bonus
        const luckyStars = this.luckyStarsEarned || 0;
        bonusStars += luckyStars;

        Progress.addStars(stars + bonusStars);
        const levelResult = Progress.addXP(xpEarned);
        Progress.recordRace({
            subject: this.subject, topic: this.topic,
            correct: this.correctCount, total: this.questionsTotal,
            stars, streak: this.bestStreak
        });

        // V5: Track generation wins and unlock bonus colors
        const currentGen = Progress.data.carType || 'c1';
        const genWins = Progress.recordGenerationWin(currentGen);
        const bonusColorEntries = Object.entries(CorvetteRenderer.bonusColors)
            .filter(([, bc]) => bc.gen === currentGen);
        bonusColorEntries.forEach(([colorId, bc]) => {
            if (genWins >= bc.winsNeeded && !Progress.hasBonusColor(colorId)) {
                Progress.unlockBonusColor(colorId);
                Audio.playPowerUp();
                setTimeout(() => {
                    Audio.speak(`New color unlocked: ${bc.name}! Check the garage.`);
                }, 1500);
            }
        });

        if (stars >= 2 && Progress.data.currentTrack === this.trackIndex) {
            const nextTrack = this.trackIndex + 1;
            // Don't auto-advance into secret tracks via normal progression
            if (nextTrack < this.tracks.length && !this.tracks[nextTrack].secret) {
                Progress.unlockTrack(nextTrack);
                Progress.data.currentTrack = nextTrack;
                Progress.save();
            }
        }

        // V10: Check if bonus track should unlock (3 stars on all 7 regular tracks)
        if (!Progress.data.tracksUnlocked[7]) {
            const threeStars = Progress.data._threeStarTracks || [];
            const allRegularPerfect = [0,1,2,3,4,5,6].every(t => threeStars.includes(t));
            if (allRegularPerfect) {
                Progress.unlockTrack(7);
                setTimeout(() => {
                    Audio.playLevelUp();
                    Audio.speak('Secret track unlocked! Galaxy Speedway!');
                }, 2000);
            }
        }

        const raceTime = (Date.now() - this.raceStartTime) / 1000;

        // V8: Record best time per track
        let playerPosition = 1;
        this.opponents.forEach(opp => { if (opp.worldX > this.scrollX) playerPosition++; });
        const isNewBest = Progress.recordTrackResult(this.trackIndex, raceTime, playerPosition, stars);

        // V9: Save ghost data if this was a best time (or first run)
        // Cap at 500 frames (~83 seconds at 10-frame intervals) to prevent localStorage bloat
        if (isNewBest || !Progress.data.ghostData[this.trackIndex]) {
            if (!Progress.data.ghostData) Progress.data.ghostData = {};
            const ghostData = this._ghostRecording.slice(0, 500);
            Progress.data.ghostData[this.trackIndex] = ghostData;
            Progress.save();
        }

        const newAchievements = Achievements.checkAfterRace({
            stars, correct: this.correctCount, total: this.questionsTotal,
            streak: this.bestStreak, accuracy: Math.round(accuracy * 100),
            raceTime, bonusStars, subject: this.subject
        }, this.trackIndex);

        // Show "FINISH!" celebration before results
        const feedback = document.getElementById('race-feedback');
        if (feedback) {
            feedback.textContent = '🏁 FINISH!';
            feedback.className = 'race-feedback correct-feedback';
            feedback.style.display = 'block';
            feedback.style.fontSize = '3.5rem';
            feedback.style.animation = 'none';
            void feedback.offsetHeight;
            feedback.style.animation = 'feedback-pop 1.2s forwards';
        }
        Audio.playLevelUp();

        // Delay results by 1.5s for celebration moment
        setTimeout(() => {
            if (feedback) { feedback.style.display = 'none'; feedback.style.fontSize = ''; }
            if (typeof Main !== 'undefined') {
                // Build podium standings — V8: include names
                const standings = [{ gen: Progress.data.carType || 'c1', color: this.getPlayerColor(), isPlayer: true, worldX: this.scrollX, name: 'You' }];
                this.opponents.forEach(opp => standings.push({ gen: opp.generation, color: opp.color, isPlayer: false, worldX: opp.worldX, name: opp.name || 'Racer' }));
                standings.sort((a, b) => b.worldX - a.worldX);

                Main.showResults({
                    stars,
                    correct: this.correctCount,
                    total: this.questionsTotal,
                    streak: this.bestStreak,
                    xp: xpEarned,
                    accuracy: Math.round(accuracy * 100),
                    levelUp: levelResult,
                    newAchievements,
                    bonusStars,
                    bonusCorrect: this.bonusCorrect,
                    standings,
                    raceTime,
                    isNewBest,
                    playerPosition,
                    trackIndex: this.trackIndex,
                    challengeCompleted,
                    challengeDesc: this._activeChallenge ? this._activeChallenge.desc : null,
                    challengeIcon: this._activeChallenge ? this._activeChallenge.icon : null,
                    medal: this.getMedal(this.trackIndex, raceTime)
                });
            }
        }, 1500);
    },

    stop() {
        this.running = false;
        Audio.stopMusic();
        Audio.stopWeatherAmbient();
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
    }
};
Object.assign(Game, GameRenderer);

