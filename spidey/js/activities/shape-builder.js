/**
 * Shape Builder — Match shapes to complete Spidey's web!
 * V3: Grade-based content (Pre-K through 2nd grade)
 *   Pre-K: 2D shape recognition (circle, square, triangle, star, heart, diamond, rectangle, oval)
 *   K: 3D shapes (sphere, cube, cone, cylinder), counting sides/corners
 *   1st: Symmetry, equal parts (halves, fourths), composing shapes
 *   2nd: Area with unit squares, perimeter intro, angles (right angles)
 */
const ShapeBuilder = (() => {
    const ALL_SHAPES = [
        { name: 'circle', svg: '<circle cx="50" cy="50" r="40"/>', color: '#e23636', sides: 0, corners: 0 },
        { name: 'square', svg: '<rect x="10" y="10" width="80" height="80" rx="4"/>', color: '#2196F3', sides: 4, corners: 4 },
        { name: 'triangle', svg: '<polygon points="50,5 95,90 5,90"/>', color: '#4CAF50', sides: 3, corners: 3 },
        { name: 'star', svg: '<polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"/>', color: '#FFD600', sides: 10, corners: 5 },
        { name: 'heart', svg: '<path d="M50,85 C20,60 0,40 10,20 C20,0 40,5 50,25 C60,5 80,0 90,20 C100,40 80,60 50,85Z"/>', color: '#E056A0', sides: 0, corners: 1 },
        { name: 'diamond', svg: '<polygon points="50,5 90,50 50,95 10,50"/>', color: '#9C27B0', sides: 4, corners: 4 },
        { name: 'rectangle', svg: '<rect x="5" y="20" width="90" height="60" rx="4"/>', color: '#FF5722', sides: 4, corners: 4 },
        { name: 'oval', svg: '<ellipse cx="50" cy="50" rx="45" ry="30"/>', color: '#00BCD4', sides: 0, corners: 0 }
    ];

    // K: 3D shapes
    const SHAPES_3D = [
        { name: 'sphere', desc: 'ball shape', realWorld: '🏀', faces: 0, edges: 0, vertices: 0,
          svg: '<circle cx="50" cy="50" r="40" fill="url(#sphere-grad)"/><defs><radialGradient id="sphere-grad" cx="35%" cy="35%"><stop offset="0%" stop-color="#fff" stop-opacity="0.4"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs>' },
        { name: 'cube', desc: 'box shape', realWorld: '🎁', faces: 6, edges: 12, vertices: 8,
          svg: '<polygon points="20,30 50,15 80,30 80,70 50,85 20,70" fill="currentColor" opacity="0.8"/><polygon points="20,30 50,15 80,30 50,45" fill="currentColor" opacity="0.5"/><line x1="50" y1="45" x2="50" y2="85" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>' },
        { name: 'cone', desc: 'ice cream cone shape', realWorld: '🍦', faces: 2, edges: 1, vertices: 1,
          svg: '<polygon points="50,10 80,80 20,80" fill="currentColor" opacity="0.8"/><ellipse cx="50" cy="80" rx="30" ry="8" fill="currentColor" opacity="0.6"/>' },
        { name: 'cylinder', desc: 'can shape', realWorld: '🥫', faces: 3, edges: 2, vertices: 0,
          svg: '<rect x="20" y="25" width="60" height="50" fill="currentColor" opacity="0.8"/><ellipse cx="50" cy="25" rx="30" ry="10" fill="currentColor" opacity="0.6"/><ellipse cx="50" cy="75" rx="30" ry="10" fill="currentColor" opacity="0.5"/>' }
    ];

    // 1st grade: symmetry line check
    const SYMMETRY_SHAPES = [
        { name: 'butterfly', symmetric: true, svg: '<path d="M50,20 Q20,10 15,40 Q10,65 50,50 Q90,65 85,40 Q80,10 50,20Z"/>', emoji: '🦋' },
        { name: 'heart', symmetric: true, svg: '<path d="M50,85 C20,60 0,40 10,20 C20,0 40,5 50,25 C60,5 80,0 90,20 C100,40 80,60 50,85Z"/>', emoji: '❤️' },
        { name: 'star', symmetric: true, svg: '<polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"/>', emoji: '⭐' },
        { name: 'arrow', symmetric: false, svg: '<polygon points="50,10 80,40 65,40 65,90 35,90 35,40 20,40"/>', emoji: '➡️' },
        { name: 'cloud', symmetric: false, svg: '<circle cx="35" cy="50" r="20"/><circle cx="55" cy="40" r="25"/><circle cx="70" cy="55" r="18"/>', emoji: '☁️' },
        { name: 'circle', symmetric: true, svg: '<circle cx="50" cy="50" r="40"/>', emoji: '⭕' }
    ];

    // 1st grade: equal parts
    const FRACTION_QUESTIONS = [
        { shape: 'circle', parts: 2, label: 'halves', svg: '<circle cx="50" cy="50" r="40"/><line x1="50" y1="10" x2="50" y2="90" stroke="white" stroke-width="2"/>' },
        { shape: 'circle', parts: 4, label: 'fourths', svg: '<circle cx="50" cy="50" r="40"/><line x1="50" y1="10" x2="50" y2="90" stroke="white" stroke-width="2"/><line x1="10" y1="50" x2="90" y2="50" stroke="white" stroke-width="2"/>' },
        { shape: 'rectangle', parts: 2, label: 'halves', svg: '<rect x="10" y="20" width="80" height="60" rx="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="white" stroke-width="2"/>' },
        { shape: 'rectangle', parts: 4, label: 'fourths', svg: '<rect x="10" y="20" width="80" height="60" rx="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="white" stroke-width="2"/><line x1="10" y1="50" x2="90" y2="50" stroke="white" stroke-width="2"/>' }
    ];

    // 2nd grade: area grids (unit squares)
    const AREA_PROBLEMS = [
        { width: 2, height: 3, area: 6 },
        { width: 3, height: 3, area: 9 },
        { width: 4, height: 2, area: 8 },
        { width: 3, height: 4, area: 12 },
        { width: 5, height: 2, area: 10 },
        { width: 4, height: 3, area: 12 },
        { width: 2, height: 5, area: 10 }
    ];

    // 2nd grade: perimeter
    const PERIMETER_PROBLEMS = [
        { width: 3, height: 2, perimeter: 10 },
        { width: 4, height: 3, perimeter: 14 },
        { width: 5, height: 2, perimeter: 14 },
        { width: 3, height: 3, perimeter: 12 },
        { width: 4, height: 4, perimeter: 16 },
        { width: 5, height: 3, perimeter: 16 }
    ];

    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 8, targetShape = null;
    let roundCorrect = 0, roundTotal = 0;
    let questionType = 'match';
    let currentAnswer = null;

    function start(containerEl, callback) {
        container = containerEl;
        onComplete = callback;
        currentRound = 0;
        roundCorrect = 0;
        roundTotal = 0;
        _nextQuestion();
    }

    function _nextQuestion() {
        if (currentRound >= totalRounds) { _completeActivity(); return; }
        const grade = Progress.getGradeLevel();

        if (grade === 0) {
            _preKQuestion();
        } else if (grade === 1) {
            // K: 3D shapes, sides/corners
            const types = ['match', '3d', 'sides', '3d', 'match', 'sides', '3d', 'sides'];
            questionType = types[currentRound % types.length];
            if (questionType === 'match') _preKQuestion();
            else if (questionType === '3d') _3dShapeQuestion();
            else _sidesQuestion();
        } else if (grade === 2) {
            // 1st: symmetry, fractions, composing
            const types = ['symmetry', 'fraction', 'symmetry', 'fraction', 'symmetry', 'fraction', 'symmetry', 'fraction'];
            questionType = types[currentRound % types.length];
            if (questionType === 'symmetry') _symmetryQuestion();
            else _fractionQuestion();
        } else {
            // 2nd: area, perimeter, angles
            const types = ['area', 'perimeter', 'angle', 'area', 'perimeter', 'angle', 'area', 'perimeter'];
            questionType = types[currentRound % types.length];
            if (questionType === 'area') _areaQuestion();
            else if (questionType === 'perimeter') _perimeterQuestion();
            else _angleQuestion();
        }
    }

    // ---------- Pre-K: Shape matching ----------
    function _preKQuestion() {
        questionType = 'match';
        const stats = Progress.getStats('shape-builder');
        const learned = (stats.shapesLearned && stats.shapesLearned.length > 0) ? stats.shapesLearned : ['circle', 'square', 'triangle'];
        const available = ALL_SHAPES.filter(s => learned.includes(s.name));
        targetShape = available[Math.floor(Math.random() * available.length)];
        const distractors = available.filter(s => s.name !== targetShape.name).sort(() => Math.random() - 0.5);
        const choiceCount = available.length >= 4 ? 4 : 3;
        const choices = [targetShape, ...distractors.slice(0, choiceCount - 1)].sort(() => Math.random() - 0.5);

        const webProgress = _buildWebProgress(currentRound, totalRounds);

        container.innerHTML = `
            <div class="activity-prompt">
                <div class="shape-web-frame">
                    <svg viewBox="0 0 100 100" class="shape-outline">${targetShape.svg}</svg>
                </div>
                <span class="round-counter">${currentRound + 1} / ${totalRounds}</span>
            </div>
            ${webProgress}
            <div class="shape-choices">
                ${choices.map(s => `
                    <button class="shape-choice-btn" data-shape="${s.name}">
                        <svg viewBox="0 0 100 100" class="shape-filled" style="fill:${s.color}">${s.svg}</svg>
                    </button>
                `).join('')}
            </div>
        `;
        container.querySelectorAll('.shape-choice-btn').forEach(btn => btn.addEventListener('click', () => _onShapeChoice(btn)));
        setTimeout(() => Voice.speak(`Spidey needs the ${targetShape.name}!`), 300);
    }

    function _onShapeChoice(btn) {
        const chosen = btn.dataset.shape;
        roundTotal++;
        if (chosen === targetShape.name) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('shape-builder', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1200);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('shape-builder', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-shape="${targetShape.name}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`That's the ${chosen}. Look for the ${targetShape.name}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2000);
        }
    }

    // ---------- K: 3D Shapes ----------
    function _3dShapeQuestion() {
        const shape = SHAPES_3D[Math.floor(Math.random() * SHAPES_3D.length)];
        currentAnswer = shape.name;

        const distractors = SHAPES_3D.filter(s => s.name !== shape.name).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [shape, ...distractors].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="shape3d-display">
                <div class="shape3d-real">${shape.realWorld}</div>
                <div class="shape3d-desc">This looks like a ${shape.desc}!</div>
                <div class="shape3d-ask">What 3D shape is this?</div>
            </div>
            <div class="shape-choices">
                ${choices.map(s => `
                    <button class="shape-choice-btn shape3d-btn" data-answer="${s.name}">
                        <svg viewBox="0 0 100 100" class="shape-filled" style="fill:#e23636">${s.svg}</svg>
                        <div class="shape3d-label">${s.name}</div>
                    </button>
                `).join('')}
            </div>
        `;
        container.querySelectorAll('.shape-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`What 3D shape looks like a ${shape.desc}?`), 400);
    }

    // ---------- K: Count Sides/Corners ----------
    function _sidesQuestion() {
        const countable = ALL_SHAPES.filter(s => s.sides > 0 && s.sides <= 6);
        const shape = countable[Math.floor(Math.random() * countable.length)];
        const askSides = Math.random() < 0.5;
        currentAnswer = String(askSides ? shape.sides : shape.corners);
        const askLabel = askSides ? 'sides' : 'corners';

        const choices = new Set([parseInt(currentAnswer)]);
        while (choices.size < 3) {
            choices.add(Math.max(0, parseInt(currentAnswer) + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="sides-display">
                <svg viewBox="0 0 100 100" class="shape-filled sides-shape" style="fill:${shape.color}">${shape.svg}</svg>
                <div class="sides-name">${shape.name}</div>
                <div class="sides-ask">How many <strong>${askLabel}</strong>?</div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`How many ${askLabel} does a ${shape.name} have?`), 400);
    }

    // ---------- 1st Grade: Symmetry ----------
    function _symmetryQuestion() {
        const shape = SYMMETRY_SHAPES[Math.floor(Math.random() * SYMMETRY_SHAPES.length)];
        currentAnswer = shape.symmetric ? 'yes' : 'no';

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="symmetry-display">
                <div class="symmetry-shape">
                    <svg viewBox="0 0 100 100" class="shape-filled" style="fill:#e23636">${shape.svg}</svg>
                    <div class="symmetry-line"></div>
                </div>
                <div class="symmetry-emoji">${shape.emoji}</div>
                <div class="symmetry-ask">Is this shape <strong>symmetrical</strong>?<br><small>(Same on both sides of the line)</small></div>
            </div>
            <div class="symmetry-choices">
                <button class="warmcool-btn" data-answer="yes" style="background:#4CAF50">✓ Yes</button>
                <button class="warmcool-btn" data-answer="no" style="background:#e23636">✗ No</button>
            </div>
        `;
        container.querySelectorAll('.warmcool-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`Is the ${shape.name} symmetrical? Is it the same on both sides?`), 400);
    }

    // ---------- 1st Grade: Equal Parts / Fractions ----------
    function _fractionQuestion() {
        const frac = FRACTION_QUESTIONS[Math.floor(Math.random() * FRACTION_QUESTIONS.length)];
        currentAnswer = String(frac.parts);

        const choices = [2, 3, 4].sort(() => Math.random() - 0.5);
        if (!choices.includes(frac.parts)) { choices[0] = frac.parts; choices.sort(() => Math.random() - 0.5); }

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="fraction-display">
                <svg viewBox="0 0 100 100" class="fraction-shape" style="fill:#2196F3">${frac.svg}</svg>
                <div class="fraction-ask">How many <strong>equal parts</strong>?</div>
            </div>
            <div class="number-choices">
                ${choices.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n} (${n === 2 ? 'halves' : n === 3 ? 'thirds' : 'fourths'})</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`How many equal parts is this ${frac.shape} split into?`), 400);
    }

    // ---------- 2nd Grade: Area ----------
    function _areaQuestion() {
        const prob = AREA_PROBLEMS[Math.floor(Math.random() * AREA_PROBLEMS.length)];
        currentAnswer = String(prob.area);

        // Draw grid
        const cellSize = Math.min(40, 200 / Math.max(prob.width, prob.height));
        const gridW = prob.width * cellSize;
        const gridH = prob.height * cellSize;
        const offsetX = (200 - gridW) / 2;
        const offsetY = (150 - gridH) / 2;

        let gridSvg = '';
        for (let r = 0; r < prob.height; r++) {
            for (let c = 0; c < prob.width; c++) {
                gridSvg += `<rect x="${offsetX + c * cellSize}" y="${offsetY + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="rgba(33,150,243,0.3)" stroke="white" stroke-width="1"/>`;
            }
        }

        const choices = new Set([prob.area]);
        while (choices.size < 3) {
            choices.add(Math.max(1, prob.area + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="area-display">
                <svg viewBox="0 0 200 150" class="area-grid">${gridSvg}</svg>
                <div class="area-label">${prob.width} x ${prob.height}</div>
                <div class="area-ask">What is the <strong>area</strong>?<br><small>(Count the squares)</small></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n} sq</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`What is the area? Count all the unit squares!`), 400);
    }

    // ---------- 2nd Grade: Perimeter ----------
    function _perimeterQuestion() {
        const prob = PERIMETER_PROBLEMS[Math.floor(Math.random() * PERIMETER_PROBLEMS.length)];
        currentAnswer = String(prob.perimeter);

        const choices = new Set([prob.perimeter]);
        while (choices.size < 3) {
            choices.add(Math.max(4, prob.perimeter + (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3))));
        }
        const sorted = [...choices].sort((a, b) => a - b);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="perimeter-display">
                <div class="perimeter-rect" style="width:${prob.width * 40}px; height:${prob.height * 40}px">
                    <span class="perim-top">${prob.width}</span>
                    <span class="perim-right">${prob.height}</span>
                    <span class="perim-bottom">${prob.width}</span>
                    <span class="perim-left">${prob.height}</span>
                </div>
                <div class="perimeter-ask">What is the <strong>perimeter</strong>?<br><small>(Add all the sides)</small></div>
            </div>
            <div class="number-choices">
                ${sorted.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`What is the perimeter? Add up all the sides: ${prob.width} plus ${prob.height} plus ${prob.width} plus ${prob.height}.`), 400);
    }

    // ---------- 2nd Grade: Angles ----------
    function _angleQuestion() {
        const angles = [
            { type: 'right', degrees: 90, desc: 'a right angle (90 degrees)', svg: '<line x1="50" y1="80" x2="50" y2="20" stroke="white" stroke-width="3"/><line x1="50" y1="80" x2="100" y2="80" stroke="white" stroke-width="3"/><rect x="50" y="65" width="15" height="15" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>' },
            { type: 'acute', degrees: 45, desc: 'an acute angle (less than 90)', svg: '<line x1="30" y1="80" x2="70" y2="20" stroke="white" stroke-width="3"/><line x1="30" y1="80" x2="100" y2="80" stroke="white" stroke-width="3"/>' },
            { type: 'obtuse', degrees: 120, desc: 'an obtuse angle (more than 90)', svg: '<line x1="60" y1="80" x2="10" y2="30" stroke="white" stroke-width="3"/><line x1="60" y1="80" x2="100" y2="80" stroke="white" stroke-width="3"/>' }
        ];

        const angle = angles[Math.floor(Math.random() * angles.length)];
        currentAnswer = angle.type;
        const choices = angles.map(a => a.type).sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="angle-display">
                <svg viewBox="0 0 120 100" class="angle-svg">${angle.svg}</svg>
                <div class="angle-ask">What kind of angle is this?</div>
            </div>
            <div class="angle-choices">
                ${choices.map(t => {
                    const labels = { right: 'Right (90°)', acute: 'Acute (<90°)', obtuse: 'Obtuse (>90°)' };
                    return `<button class="shape-choice-btn angle-btn" data-answer="${t}"><span>${labels[t]}</span></button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.shape-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak('What kind of angle is this?'), 400);
    }

    // ---------- Generic choice handler ----------
    function _onGenericChoice(btn) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('shape-builder', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak('That is correct!');
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1200);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('shape-builder', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Not quite. The answer is ${currentAnswer}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2000);
        }
    }

    // ---------- Shared ----------
    function _buildWebProgress(done, total) {
        const strands = [];
        for (let i = 0; i < total; i++) {
            const angle = (i / total) * 360;
            const opacity = i < done ? 1 : 0.15;
            const color = i < done ? '#e23636' : '#fff';
            strands.push(`<line x1="50" y1="50" x2="${50 + 40 * Math.cos(angle * Math.PI / 180)}" y2="${50 + 40 * Math.sin(angle * Math.PI / 180)}" stroke="${color}" stroke-width="2" opacity="${opacity}"/>`);
        }
        const rings = [];
        if (done >= 2) rings.push(`<circle cx="50" cy="50" r="15" fill="none" stroke="#e23636" stroke-width="1.5" opacity="0.8"/>`);
        if (done >= 4) rings.push(`<circle cx="50" cy="50" r="25" fill="none" stroke="#e23636" stroke-width="1.5" opacity="0.6"/>`);
        if (done >= 6) rings.push(`<circle cx="50" cy="50" r="35" fill="none" stroke="#e23636" stroke-width="1.5" opacity="0.4"/>`);

        return `<div class="web-progress-indicator"><svg viewBox="0 0 100 100" class="web-progress-svg"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>${strands.join('')}${rings.join('')}</svg></div>`;
    }

    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You built the whole web! Great job!');
        _maybeUnlock();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeUnlock() {
        const stats = Progress.getStats('shape-builder');
        if (stats.played >= 2 && stats.shapesLearned && stats.shapesLearned.length < ALL_SHAPES.length) {
            const next = ALL_SHAPES.find(s => !stats.shapesLearned.includes(s.name));
            if (next) Progress.expandContent('shape-builder', next.name);
        }
    }

    function _awardSticker() {
        const sticker = StickerBook.getNextUnearned();
        if (!sticker) return;
        Progress.awardSticker(sticker.id);
        Main.showStickerEarned(sticker);
    }

    function stop() { currentRound = totalRounds; }
    return { start, stop };
})();
