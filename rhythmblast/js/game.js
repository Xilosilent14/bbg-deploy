/* ============================================
   RHYTHM BLAST — Core Game Engine
   Note falling, hit detection, scoring, canvas rendering
   ============================================ */
const Game = (() => {
    let canvas, ctx;
    let W, H;
    let running = false;
    let animId = null;

    // Lane config
    const LANES = 3;
    const LANE_COLORS = ['#22d3ee', '#a855f7', '#ec4899']; // cyan, purple, magenta
    const LANE_GLOW = ['rgba(34,211,238,0.3)', 'rgba(168,85,247,0.3)', 'rgba(236,72,153,0.3)'];
    let laneWidth = 0;
    let laneXs = [];
    let hitZoneY = 0;
    const HIT_ZONE_HEIGHT = 14;

    // Notes
    let activeNotes = []; // Currently visible on screen
    let noteQueue = []; // Generated but not yet spawned
    let noteSpeed = 0; // pixels per frame
    let fallDuration = 6.0; // seconds, set per song in startSong()
    const SPAWN_Y = -60; // Above screen

    // Timing windows (ms) per difficulty — Easy is extremely forgiving for young kids
    const DIFFICULTY_WINDOWS = {
        easy:   { PERFECT: 600, GREAT: 1000, OK: 1500 },
        normal: { PERFECT: 250, GREAT: 500, OK: 750 },
        hard:   { PERFECT: 120, GREAT: 250, OK: 400 }
    };

    // Fall duration (seconds) per difficulty — how long a note takes to travel from spawn to hit zone
    const DIFFICULTY_FALL_DURATION = {
        easy:   10.0,  // 10 seconds — very slow crawl for ages 3-5
        normal: 6.5,   // 6.5 seconds — comfortable for ages 6-8
        hard:   4.0    // 4 seconds — challenging
    };

    function _getWindows() {
        const diff = (Progress.getSettings && Progress.getSettings().difficulty) || 'normal';
        return DIFFICULTY_WINDOWS[diff] || DIFFICULTY_WINDOWS.normal;
    }

    // Legacy constants (kept for reference, actual values come from _getWindows())
    const PERFECT_WINDOW = 120;
    const GREAT_WINDOW = 250;
    const OK_WINDOW = 400;

    // Song state
    let currentSong = null;
    let songBeatDuration = 0; // ms per beat
    let songStartTime = 0;
    let beatsElapsed = 0;
    let lastBeatProcessed = -1;

    // Scoring
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let totalNotes = 0;
    let perfects = 0;
    let greats = 0;
    let oks = 0;
    let misses = 0;
    let noteResults = []; // For ecosystem tracking

    // Visual effects
    let particles = [];
    let screenShake = 0;
    let hitFeedbackEl = null;
    let hitFeedbackTimer = 0;
    let bgHue = 240; // slowly shifting background

    // Lane flash (per-lane activation glow on hit)
    let laneFlash = [0, 0, 0];

    // Miss splash effects
    let missEffects = [];

    // Combo meter animation
    let comboMeterValue = 0; // smoothly animates toward target
    let comboMeterBreaking = 0; // shrink animation on combo break

    // Beat pulse
    let beatPulse = 0;

    // Question Phase state (separates cognitive from motor tasks)
    let qPhase = null; // { question, answers, correctIndex, topic, domain, answered: false }
    let qPhaseTimer = 0; // auto-advance timer
    const Q_PHASE_TIMEOUT = 12000; // 12s before auto-advancing

    function _startQuestionPhase(questionData) {
        qPhase = { ...questionData, answered: false, startTime: Date.now() };
        running = false; // pause note falling
        Audio.stopSong();

        const overlay = document.getElementById('question-phase');
        const textEl = document.getElementById('qp-text');
        const answersEl = document.getElementById('qp-answers');
        const feedbackEl = document.getElementById('qp-feedback');
        if (!overlay) return;

        // Show the VISUAL question (with emojis, objects, line breaks)
        textEl.innerHTML = (questionData.question || '').replace(/\n/g, '<br>');
        feedbackEl.textContent = '';
        feedbackEl.style.color = '';

        // SPEAK the TTS-friendly version (without visual clutter)
        if (typeof Audio !== 'undefined' && Audio.speak) {
            setTimeout(() => Audio.speak(questionData.questionSpeak || questionData.question), 200);
        }

        answersEl.innerHTML = questionData.answers.map((a, i) =>
            `<button class="qp-answer-btn" data-idx="${i}">${a}</button>`
        ).join('');

        answersEl.querySelectorAll('.qp-answer-btn').forEach(btn => {
            btn.addEventListener('click', () => _onQuestionAnswer(parseInt(btn.dataset.idx)));
        });

        overlay.style.display = 'flex';

        // Auto-advance timer
        qPhaseTimer = setTimeout(() => {
            if (qPhase && !qPhase.answered) _onQuestionAnswer(-1); // timeout = skip
        }, Q_PHASE_TIMEOUT);
    }

    function _onQuestionAnswer(idx) {
        if (!qPhase || qPhase.answered) return;
        qPhase.answered = true;
        clearTimeout(qPhaseTimer);

        const correct = idx === qPhase.correctIndex;
        const feedbackEl = document.getElementById('qp-feedback');
        const btns = document.querySelectorAll('#qp-answers .qp-answer-btn');

        // Highlight correct/wrong
        btns.forEach((btn, i) => {
            if (i === qPhase.correctIndex) btn.classList.add('correct');
            else if (i === idx) btn.classList.add('wrong');
            btn.style.pointerEvents = 'none';
        });

        if (correct) {
            feedbackEl.textContent = 'Correct!';
            feedbackEl.style.color = '#2ecc71';
            Audio.perfectHit();
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            score += 100;
        } else {
            feedbackEl.textContent = idx === -1 ? 'Time up!' : 'Not quite!';
            feedbackEl.style.color = '#f59e0b';
            Audio.miss();
            // Don't reset combo on easy
            const diff = (Progress.getSettings && Progress.getSettings().difficulty) || 'normal';
            if (diff === 'easy') combo = Math.max(0, combo - 1);
            else combo = 0;
        }

        // Track for ecosystem
        noteResults.push({ topic: qPhase.domain || 'math', correct });

        // Resume after feedback delay
        setTimeout(() => {
            document.getElementById('question-phase').style.display = 'none';
            qPhase = null;
            // Resume rhythm with tap-on-beat notes
            running = true;
            Audio.startSong(currentSong, _onBeat);
            // Spawn 4-6 simple rhythm notes for the kid to tap
            const rhythmCount = 4 + Math.floor(Math.random() * 3);
            for (let i = 0; i < rhythmCount; i++) {
                const lane = Math.floor(Math.random() * LANES);
                activeNotes.push({
                    text: '●',
                    lane: lane,
                    type: 'rhythm',
                    isCorrect: true,
                    hitBeat: beatsElapsed + i * 2,
                    y: SPAWN_Y - (i * noteSpeed * 30),
                    spawned: true,
                    hit: false,
                    missed: false,
                    alpha: 1
                });
                totalNotes++;
            }
            _loop();
        }, correct ? 1200 : 1800);
    }

    // Callbacks
    let onSongEnd = null;

    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        hitFeedbackEl = document.getElementById('hit-feedback');
        _resize();
        window.addEventListener('resize', _resize);
    }

    function _resize() {
        W = canvas.parentElement.offsetWidth || 1024;
        H = canvas.parentElement.offsetHeight || 600;
        canvas.width = W;
        canvas.height = H;

        // Lane geometry
        const totalLaneWidth = W * 0.6; // lanes take center 60% of screen for wider tap targets
        laneWidth = totalLaneWidth / LANES;
        const laneStart = (W - totalLaneWidth) / 2;
        laneXs = [];
        for (let i = 0; i < LANES; i++) {
            laneXs.push(laneStart + laneWidth * i + laneWidth / 2);
        }
        hitZoneY = H * 0.82;
    }

    function startSong(song, endCallback) {
        currentSong = song;
        onSongEnd = endCallback;
        songBeatDuration = 60000 / song.bpm;

        // Calculate note speed based on difficulty
        // Easy = 6s fall time (very slow, kids can read and react)
        // Normal = 4s, Hard = 2.5s
        const diff = (Progress.getSettings && Progress.getSettings().difficulty) || 'normal';
        fallDuration = DIFFICULTY_FALL_DURATION[diff] || DIFFICULTY_FALL_DURATION.normal;
        const fallDistance = hitZoneY - SPAWN_Y;
        const fallFrames = (fallDuration * 1000 / (1000 / 60)); // convert seconds to frames at 60fps
        noteSpeed = fallDistance / fallFrames;

        // Reset state
        score = 0;
        combo = 0;
        maxCombo = 0;
        totalNotes = 0;
        perfects = 0;
        greats = 0;
        oks = 0;
        misses = 0;
        noteResults = [];
        activeNotes = [];
        particles = [];
        missEffects = [];
        laneFlash = [0, 0, 0];
        comboMeterValue = 0;
        comboMeterBreaking = 0;
        screenShake = 0;
        beatPulse = 0;
        beatsElapsed = 0;
        lastBeatProcessed = -1;

        // Generate all notes from chart
        noteQueue = [];
        const level = Progress.getLevel ? Progress.getLevel() : 0;
        const fallDurationMs = fallDuration * 1000;
        song.noteChart.forEach(entry => {
            const generated = NoteGenerator.fromChartEntry(entry, level);
            const notes = generated.notes;
            const ttsText = generated.ttsText;
            const questionText = generated.question || '';

            // Store question data on each note for the question phase overlay
            const qData = generated.questionData || null;
            notes.forEach(n => { n._questionText = questionText; n._questionData = qData; });

            notes.forEach(n => {
                noteQueue.push({
                    ...n,
                    y: SPAWN_Y,
                    spawned: false,
                    hit: false,
                    missed: false,
                    spawnBeat: Math.max(0, n.hitBeat - Math.round(fallDurationMs / songBeatDuration)), // spawn fallDuration before hit
                    alpha: 1
                });
                // Count identify notes as question phase answers (1 per group, not per lane)
                if (n.type === 'identify' && n.isCorrect) totalNotes++;
                else if (n.type !== 'sequence-lead' && n.type !== 'identify' && n.isCorrect !== false) totalNotes++;
            });
            // Schedule TTS for reading notes
            if (ttsText && notes[0]) {
                const ttsNote = notes[0];
                const ttsBeat = ttsNote.hitBeat - Math.round((fallDurationMs + 1500) / songBeatDuration); // speak 1.5s before note appears
                noteQueue.push({
                    _tts: true,
                    text: ttsText,
                    spawnBeat: Math.max(0, ttsBeat),
                    hitBeat: ttsBeat,
                    spawned: false
                });
            }
        });

        songStartTime = Date.now();
        running = true;

        // Start audio
        Audio.startSong(song, _onBeat);

        // Start game loop
        _loop();
    }

    function _onBeat(beatIdx) {
        beatsElapsed = beatIdx;
        beatPulse = 1.0;

        // Spawn notes that are due this beat
        noteQueue.forEach(n => {
            if (!n.spawned && beatIdx >= n.spawnBeat) {
                n.spawned = true;
                if (n._tts) {
                    // Skip TTS scheduling (question phase handles it now)
                    return;
                }
                // Identify notes: show Question Phase overlay instead of falling notes
                if (n.type === 'identify' && n._questionData) {
                    // Mark all notes in this beat group as spawned/handled
                    noteQueue.forEach(other => {
                        if (other.hitBeat === n.hitBeat && other.type === 'identify') {
                            other.spawned = true;
                            other.hit = true; // prevent miss counting
                        }
                    });
                    _startQuestionPhase(n._questionData);
                    return;
                }
                // Regular rhythm notes: fall as usual
                if (n.type !== 'identify') {
                    n.y = SPAWN_Y;
                    activeNotes.push(n);
                }
            }
        });
    }

    function _showQuestionPrompt(text) {
        const el = document.getElementById('question-prompt');
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
        // Auto-hide after the note passes
        clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(() => { el.style.display = 'none'; }, fallDuration * 1000 + 1000);
    }

    function _showLaneLabels(identifyNotes) {
        const container = document.getElementById('lane-labels');
        if (!container || identifyNotes.length === 0) return;
        container.style.display = 'flex';
        for (let i = 0; i < 3; i++) {
            const label = document.getElementById('lane-label-' + i);
            if (!label) continue;
            const note = identifyNotes.find(n => n.lane === i);
            label.textContent = note ? note.text : '';
        }
        // Auto-hide when notes pass
        clearTimeout(container._hideTimer);
        container._hideTimer = setTimeout(() => { container.style.display = 'none'; }, fallDuration * 1000 + 1000);
    }

    function stop() {
        running = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        Audio.stopSong();
        // Hide overlays
        const prompt = document.getElementById('question-prompt');
        if (prompt) prompt.style.display = 'none';
        const labels = document.getElementById('lane-labels');
        if (labels) labels.style.display = 'none';
        // Clean up question phase
        const qpOverlay = document.getElementById('question-phase');
        if (qpOverlay) qpOverlay.style.display = 'none';
        clearTimeout(qPhaseTimer);
        qPhase = null;
    }

    function pause() {
        running = false;
        Audio.stopSong();
    }

    function resume() {
        if (!currentSong) return;
        running = true;
        Audio.startSong(currentSong, _onBeat);
        _loop();
    }

    function _loop() {
        if (!running) return;
        _update();
        _render();
        animId = requestAnimationFrame(_loop);
    }

    function _update() {
        // Move notes down
        activeNotes.forEach(n => {
            if (!n.hit && !n.missed) {
                n.y += noteSpeed;
            }
            // Fade hit/missed notes
            if (n.hit || n.missed) {
                n.alpha -= 0.08;
            }
        });

        // Check for missed notes (passed hit zone by too much)
        // On Easy, use a bigger grace window before counting a miss
        const diff = (Progress.getSettings && Progress.getSettings().difficulty) || 'normal';
        const missThreshold = diff === 'easy' ? 100 : diff === 'normal' ? 75 : 60;

        activeNotes.forEach(n => {
            if (!n.hit && !n.missed && n.y > hitZoneY + missThreshold) {
                n.missed = true;
                if (n.type === 'sequence-lead') return; // lead notes auto-pass
                if (n.type === 'sequence-answer' && !n.isCorrect) return; // wrong answer in sequence, don't count
                if (n.type === 'identify' && !n.isCorrect) return; // wrong answer in identify, don't count as miss
                misses++;

                if (diff === 'easy') {
                    // On Easy: softer punishment. Don't break combo for first miss, just reduce it
                    if (combo > 2) {
                        combo = Math.max(0, combo - 2);
                    } else {
                        combo = 0;
                    }
                    _showFeedback('MISS', '#f59e0b'); // amber instead of angry red
                } else {
                    if (combo > 0) {
                        Audio.comboBreak();
                        comboMeterBreaking = 1.0;
                    }
                    combo = 0;
                    _spawnMissEffect(laneXs[n.lane], hitZoneY);
                    _showFeedback('MISS', '#e74c3c');
                }
            }
        });

        // Remove dead notes
        activeNotes = activeNotes.filter(n => n.alpha > 0);

        // Update particles
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= 0.02;
            return p.life > 0;
        });

        // Decay effects
        if (beatPulse > 0) beatPulse -= 0.05;
        if (screenShake > 0) screenShake *= 0.9;

        // Decay lane flash
        for (let i = 0; i < LANES; i++) {
            if (laneFlash[i] > 0) laneFlash[i] -= 0.05;
            if (laneFlash[i] < 0) laneFlash[i] = 0;
        }

        // Update miss splash effects
        const now = Date.now();
        missEffects = missEffects.filter(e => {
            const age = now - e.time;
            if (age > 400) return false;
            e.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15;
            });
            return true;
        });

        // Smooth combo meter toward target
        const comboTarget = Math.min(combo / 20, 1.0);
        if (comboMeterBreaking > 0) {
            comboMeterValue *= 0.85; // fast shrink
            comboMeterBreaking -= 0.05;
            if (comboMeterBreaking <= 0) comboMeterValue = 0;
        } else {
            comboMeterValue += (comboTarget - comboMeterValue) * 0.1;
        }
        if (hitFeedbackTimer > 0) {
            hitFeedbackTimer--;
            if (hitFeedbackTimer <= 0 && hitFeedbackEl) {
                hitFeedbackEl.classList.remove('show');
            }
        }

        // Shift background hue slowly
        bgHue = (bgHue + 0.05) % 360;

        // Check if song is done
        if (noteQueue.length > 0) {
            const allSpawned = noteQueue.every(n => n.spawned);
            const nonTtsNotes = noteQueue.filter(n => !n._tts);
            const lastNoteBeat = nonTtsNotes.length > 0 ? Math.max(...nonTtsNotes.map(n => n.hitBeat)) : 0;
            const songDone = allSpawned && activeNotes.length === 0 && beatsElapsed > lastNoteBeat + 5;
            if (songDone) {
                _endSong();
            }
        }
    }

    function _render() {
        const shakeX = screenShake > 0.5 ? (Math.random() - 0.5) * screenShake * 4 : 0;
        const shakeY = screenShake > 0.5 ? (Math.random() - 0.5) * screenShake * 3 : 0;

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Background
        _drawBackground();

        // Lane glow
        _drawLanes();

        // Hit zone
        _drawHitZone();

        // Notes
        activeNotes.forEach(n => _drawNote(n));

        // Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        // Miss splash effects
        const now = Date.now();
        missEffects.forEach(e => {
            const age = now - e.time;
            const alpha = 1 - age / 400;
            e.particles.forEach(p => {
                ctx.globalAlpha = alpha * 0.8;
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            // Red flash ring
            ctx.globalAlpha = alpha * 0.4;
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 20 + age * 0.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Combo visual meter (top center arc)
        _drawComboMeter();

        ctx.restore();
    }

    function _drawBackground() {
        // Dark gradient with subtle color shift
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, `hsl(${bgHue}, 30%, 8%)`);
        grad.addColorStop(0.5, '#1a1a2e');
        grad.addColorStop(1, `hsl(${(bgHue + 30) % 360}, 25%, 10%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Starfield (more stars, twinkling)
        for (let i = 0; i < 50; i++) {
            const sx = (i * 137.5 + beatsElapsed * 0.2) % W;
            const sy = (i * 97.3 + i * i * 3.7) % (H * 0.65);
            const ss = 0.5 + (i % 3) * 0.5;
            const twinkle = 0.15 + Math.sin(beatsElapsed * 0.1 + i * 2.3) * 0.15;
            ctx.fillStyle = `rgba(255,255,255,${twinkle + 0.1})`;
            ctx.fillRect(sx, sy, ss, ss);
        }

        // Horizontal scan line effect (subtle)
        const scanY = (beatsElapsed * 2) % H;
        ctx.fillStyle = 'rgba(168,85,247,0.03)';
        ctx.fillRect(0, scanY, W, 2);
    }

    function _drawLanes() {
        for (let i = 0; i < LANES; i++) {
            const x = laneXs[i] - laneWidth / 2;
            // Lane background strip
            const laneAlpha = 0.06 + beatPulse * 0.04;
            ctx.fillStyle = LANE_GLOW[i].replace('0.3', String(laneAlpha));
            ctx.fillRect(x, 0, laneWidth, H);

            // Lane activation flash on hit
            if (laneFlash[i] > 0) {
                const flashAlpha = laneFlash[i] * 0.3;
                ctx.fillStyle = LANE_GLOW[i].replace('0.3', String(flashAlpha));
                ctx.fillRect(x, 0, laneWidth, H);

                // Bright flash at hit zone
                ctx.fillStyle = LANE_GLOW[i].replace('0.3', String(laneFlash[i] * 0.5));
                ctx.fillRect(x, hitZoneY - 30, laneWidth, 60);
            }

            // Lane border lines — more visible for lane clarity
            ctx.strokeStyle = `rgba(255,255,255,0.15)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
    }

    function _drawHitZone() {
        const pulse = 1 + beatPulse * 0.3;
        const totalLaneWidth = laneWidth * LANES;
        const laneStart = laneXs[0] - laneWidth / 2;

        // Glow
        ctx.shadowColor = 'rgba(168,85,247,0.5)';
        ctx.shadowBlur = 10 * pulse;
        ctx.fillStyle = `rgba(168,85,247,${0.4 + beatPulse * 0.3})`;
        ctx.fillRect(laneStart, hitZoneY - HIT_ZONE_HEIGHT / 2, totalLaneWidth, HIT_ZONE_HEIGHT * pulse);
        ctx.shadowBlur = 0;

        // Lane target circles — larger and more visible
        for (let i = 0; i < LANES; i++) {
            // Filled target background for visibility
            ctx.fillStyle = LANE_GLOW[i].replace('0.3', '0.12');
            ctx.beginPath();
            ctx.arc(laneXs[i], hitZoneY, 34 + beatPulse * 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = LANE_COLORS[i];
            ctx.lineWidth = 3 + beatPulse * 2;
            ctx.globalAlpha = 0.5 + beatPulse * 0.3;
            ctx.beginPath();
            ctx.arc(laneXs[i], hitZoneY, 34 + beatPulse * 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    function _drawNote(note) {
        if (note._tts) return;
        const x = laneXs[note.lane];
        const y = note.y;
        const color = LANE_COLORS[note.lane];
        const isLead = note.type === 'sequence-lead';
        const radius = isLead ? 26 : 44;

        ctx.globalAlpha = note.alpha;

        // Subtle trailing particles (reduced frequency)
        if (!note.hit && !note.missed && !isLead && Math.random() < 0.15) {
            particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + radius,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.5,
                color: color,
                size: 1.5 + Math.random() * 1.5,
                life: 0.3 + Math.random() * 0.2
            });
        }

        // Static gentle glow ring (no pulsing)
        if (!isLead && !note.hit && !note.missed) {
            ctx.fillStyle = color;
            ctx.globalAlpha = note.alpha * 0.08;
            ctx.beginPath();
            ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = note.alpha;
        }

        // Note glow (static, no breathing)
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;

        // Note body
        ctx.fillStyle = isLead ? 'rgba(255,255,255,0.15)' : color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = isLead ? 'rgba(255,255,255,0.3)' : '#1a1a2e';
        ctx.beginPath();
        ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // High-contrast dark background behind text for readability
        if (!isLead) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();
            ctx.arc(x, y, radius - 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Text on note — constant large size, no flickering
        ctx.fillStyle = isLead ? 'rgba(255,255,255,0.6)' : '#fff';
        ctx.font = `bold ${isLead ? 16 : 24}px 'Fredoka One', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayText = note.text.length > 8 ? note.text.substring(0, 8) : note.text;
        ctx.fillText(displayText, x, y);

        // Hit feedback glow on correct hit
        if (note.hit) {
            ctx.fillStyle = `rgba(46,204,113,${note.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    function _drawComboMeter() {
        if (comboMeterValue < 0.01 && combo < 1) return;

        const cx = W / 2;
        const cy = 50;
        const r = 22;

        // Determine color based on combo level
        let meterColor;
        if (combo >= 20) {
            meterColor = '#ffd700'; // gold
        } else if (combo >= 10) {
            meterColor = '#a855f7'; // purple
        } else {
            meterColor = '#22d3ee'; // cyan
        }

        // Background ring
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();

        // Filled arc
        if (comboMeterValue > 0.005) {
            const endAngle = -Math.PI / 2 + comboMeterValue * Math.PI * 2;
            ctx.strokeStyle = meterColor;
            ctx.lineWidth = 4;
            ctx.shadowColor = meterColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx, cy, r, -Math.PI / 2, endAngle);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Center text (combo count)
        if (combo >= 3) {
            ctx.fillStyle = meterColor;
            ctx.font = `bold 14px 'Fredoka One', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${combo}x`, cx, cy);
        }
    }

    function _spawnMissEffect(x, y) {
        const pArr = [];
        const count = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = 2 + Math.random() * 3;
            pArr.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1
            });
        }
        missEffects.push({ x, y, time: Date.now(), particles: pArr });
    }

    // === INPUT HANDLING ===
    function handleTap(x, y) {
        if (!running) return;

        const W = _getWindows();

        // Determine which lane was tapped
        let tappedLane = -1;
        for (let i = 0; i < LANES; i++) {
            const lx = laneXs[i] - laneWidth / 2;
            if (x >= lx && x < lx + laneWidth) {
                tappedLane = i;
                break;
            }
        }
        if (tappedLane === -1) return;

        // Find closest unhit note in this lane near the hit zone
        let closestNote = null;
        let closestDist = Infinity;

        activeNotes.forEach(n => {
            if (n.hit || n.missed || n.lane !== tappedLane || n._tts) return;
            if (n.type === 'sequence-lead') {
                // Auto-pass lead notes when tapped (guard against double-hit)
                if (n.hit) return;
                const dist = Math.abs(n.y - hitZoneY);
                if (dist < W.OK / (1000 / 60) * noteSpeed + 40) {
                    n.hit = true;
                    _spawnParticles(laneXs[n.lane], hitZoneY, LANE_COLORS[n.lane], 5);
                }
                return;
            }
            const dist = Math.abs(n.y - hitZoneY);
            if (dist < closestDist) {
                closestDist = dist;
                closestNote = n;
            }
        });

        if (!closestNote) return;

        // Check timing (convert pixel distance to time)
        const pixelDist = Math.abs(closestNote.y - hitZoneY);
        const timeDist = (pixelDist / noteSpeed) * (1000 / 60); // convert to ms

        if (timeDist > W.OK) return; // Too far, ignore tap

        if (closestNote.isCorrect) {
            closestNote.hit = true;
            // Auto-dismiss all other notes in the same beat group (wrong answers)
            activeNotes.forEach(n => {
                if (n.hitBeat === closestNote.hitBeat && n.type === 'identify' && !n.isCorrect) {
                    n.hit = true; // Remove them so they don't fall through as misses
                    n.alpha = 0.3; // Fade them out visually
                }
            });
            let points = 0;
            let label = '';
            let color = '';

            if (timeDist <= W.PERFECT) {
                points = 100;
                label = 'PERFECT!';
                color = '#ffd700';
                perfects++;
                Audio.perfectHit();
                screenShake = 2;
                laneFlash[closestNote.lane] = 1.0;
                _spawnParticles(laneXs[closestNote.lane], hitZoneY, '#ffd700', 20);
            } else if (timeDist <= W.GREAT) {
                points = 75;
                label = 'GREAT!';
                color = '#a855f7';
                greats++;
                Audio.greatHit();
                laneFlash[closestNote.lane] = 0.7;
                _spawnParticles(laneXs[closestNote.lane], hitZoneY, LANE_COLORS[closestNote.lane], 12);
            } else {
                points = 50;
                label = 'OK';
                color = '#22d3ee';
                oks++;
                Audio.okHit();
                laneFlash[closestNote.lane] = 0.4;
                _spawnParticles(laneXs[closestNote.lane], hitZoneY, LANE_COLORS[closestNote.lane], 6);
            }

            combo++;
            if (combo > maxCombo) maxCombo = combo;

            // Combo multiplier
            let multiplier = 1;
            if (combo >= 20) multiplier = 3;
            else if (combo >= 10) multiplier = 2;
            else if (combo >= 5) multiplier = 1.5;

            points = Math.round(points * multiplier);
            score += points;

            if (combo === 5 || combo === 10 || combo === 20 || combo === 25 || combo === 50) {
                Audio.comboMilestone();
                screenShake = combo >= 25 ? 8 : 4;
                // Big visual burst at 25x and 50x
                if (combo >= 25) _spawnComboParticles(combo);
            }

            _showFeedback(label + (combo >= 5 ? ` ${combo}x` : ''), color);

            // Track for ecosystem
            noteResults.push({
                topic: closestNote.domain === 'math' ? 'math' : 'reading',
                correct: true
            });
        } else {
            // Wrong answer
            closestNote.hit = true; // Remove it
            misses++;
            if (combo > 0) {
                Audio.comboBreak();
                comboMeterBreaking = 1.0;
            }
            combo = 0;
            Audio.miss();
            _spawnMissEffect(laneXs[closestNote.lane], hitZoneY);
            _showFeedback('WRONG', '#e74c3c');

            noteResults.push({
                topic: closestNote.domain === 'math' ? 'math' : 'reading',
                correct: false
            });
        }

        // Update HUD
        document.getElementById('hud-score').textContent = score;
        document.getElementById('hud-combo').textContent = combo >= 3 ? `${combo}x COMBO` : '';
    }

    function _showFeedback(text, color) {
        if (!hitFeedbackEl) return;
        hitFeedbackEl.textContent = text;
        hitFeedbackEl.style.color = color;
        hitFeedbackEl.classList.remove('show');
        void hitFeedbackEl.offsetWidth; // force reflow
        hitFeedbackEl.classList.add('show');
        hitFeedbackTimer = 30; // ~0.5s at 60fps
    }

    function _spawnParticles(x, y, color, count) {
        if (particles.length > 400) return; // Performance cap
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 5 - 2,
                color,
                size: 2 + Math.random() * 3,
                life: 0.6 + Math.random() * 0.4
            });
        }
    }

    function _endSong() {
        stop();
        Audio.songComplete();

        const accuracy = totalNotes > 0 ? (perfects + greats + oks) / totalNotes : 0;
        const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;
        const grade = accuracy >= 0.95 ? 'S' : accuracy >= 0.85 ? 'A' : accuracy >= 0.7 ? 'B' : accuracy >= 0.5 ? 'C' : 'D';

        // XP calculation
        const baseXP = Math.round(score / 10);
        const starBonus = stars * 5;
        const xpEarned = baseXP + starBonus;

        // Ecosystem tracking
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.addXP(xpEarned, 'rhythm-blast');
            OTBEcosystem.addCoins(stars, 'rhythm-blast');
            noteResults.forEach(r => {
                OTBEcosystem.recordAnswer(
                    r.topic === 'math' ? 'rhythm-math' : 'rhythm-reading',
                    r.topic,
                    r.correct,
                    0,
                    'rhythm-blast'
                );
            });
        }

        if (onSongEnd) {
            onSongEnd({
                songId: currentSong.id,
                score, accuracy, stars, grade, xpEarned,
                perfects, greats, oks, misses,
                maxCombo, totalNotes, combo: maxCombo
            });
        }
    }

    function startConfetti() {
        // Create a confetti canvas overlay for the results screen
        let confettiCanvas = document.getElementById('confetti-canvas');
        if (!confettiCanvas) {
            confettiCanvas = document.createElement('canvas');
            confettiCanvas.id = 'confetti-canvas';
            confettiCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60;';
            document.body.appendChild(confettiCanvas);
        }
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        confettiCanvas.style.display = 'block';

        const cCtx = confettiCanvas.getContext('2d');
        const colors = ['#ffd700', '#a855f7', '#22d3ee', '#ec4899', '#4ade80', '#f59e0b', '#e74c3c'];
        const cParts = [];

        for (let i = 0; i < 50; i++) {
            cParts.push({
                x: Math.random() * confettiCanvas.width,
                y: -20 - Math.random() * 200,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: 2 + Math.random() * 3,
                vx: (Math.random() - 0.5) * 2,
                spin: Math.random() * Math.PI * 2,
                spinSpeed: (Math.random() - 0.5) * 0.2,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 0.02 + Math.random() * 0.03
            });
        }

        const startTime = Date.now();
        const duration = 2500;

        function animConfetti() {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                confettiCanvas.style.display = 'none';
                return;
            }

            cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            const fadeAlpha = elapsed > duration - 500 ? (duration - elapsed) / 500 : 1;

            cParts.forEach(p => {
                p.y += p.vy;
                p.x += p.vx + Math.sin(p.sway) * 0.5;
                p.sway += p.swaySpeed;
                p.spin += p.spinSpeed;

                cCtx.save();
                cCtx.globalAlpha = fadeAlpha;
                cCtx.translate(p.x, p.y);
                cCtx.rotate(p.spin);
                cCtx.fillStyle = p.color;
                cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                cCtx.restore();
            });

            requestAnimationFrame(animConfetti);
        }

        requestAnimationFrame(animConfetti);
    }

    function getScore() { return score; }
    function getCombo() { return combo; }

    function _spawnComboParticles(count) {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const colors = ['#ffd700', '#ff6b6b', '#a855f7', '#4ecdc4', '#ff9f43'];
        const particleCount = count >= 50 ? 30 : 15;
        for (let i = 0; i < particleCount; i++) {
            const el = document.createElement('div');
            el.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;pointer-events:none;z-index:9999;background:${colors[i % colors.length]};left:${rect.left + cx}px;top:${rect.top + cy}px;`;
            document.body.appendChild(el);
            const angle = (Math.PI * 2 * i) / particleCount;
            const dist = 60 + Math.random() * 80;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            el.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
            ], { duration: 800, easing: 'ease-out' });
            setTimeout(() => el.remove(), 800);
        }
    }

    return {
        init, startSong, stop, pause, resume,
        handleTap, getScore, getCombo, startConfetti
    };
})();
