/**
 * Letter Web — Find the matching letter!
 * V3: Grade-based content (Pre-K through 2nd grade)
 *   Pre-K: Letter recognition, uppercase/lowercase matching, sound hints
 *   K: Letter sounds, beginning sounds, simple CVC words (cat, dog, sun, hat)
 *   1st: Blends (bl, cr, st), digraphs (sh, ch, th), sight words
 *   2nd: Vowel teams (ea, oa, ai), r-controlled vowels, multi-syllable words
 */
const LetterWeb = (() => {
    const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const LETTER_COLORS = ['#e23636','#2196F3','#4CAF50','#FFD600','#FF9800','#9C27B0','#00BCD4','#E056A0','#8BC34A','#FF5722'];

    const LETTER_SOUNDS = {
        A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fff', G: 'guh', H: 'huh',
        I: 'ih', J: 'juh', K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'oh', P: 'puh',
        Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh', U: 'uh', V: 'vvv', W: 'wuh',
        X: 'ks', Y: 'yuh', Z: 'zzz'
    };

    // K: CVC words with beginning sounds
    const CVC_WORDS = [
        { word: 'cat', start: 'C', image: '🐱' },
        { word: 'dog', start: 'D', image: '🐶' },
        { word: 'sun', start: 'S', image: '☀️' },
        { word: 'hat', start: 'H', image: '🎩' },
        { word: 'bat', start: 'B', image: '🦇' },
        { word: 'map', start: 'M', image: '🗺️' },
        { word: 'pig', start: 'P', image: '🐷' },
        { word: 'net', start: 'N', image: '🥅' },
        { word: 'fox', start: 'F', image: '🦊' },
        { word: 'rug', start: 'R', image: '🟫' },
        { word: 'top', start: 'T', image: '🔝' },
        { word: 'bug', start: 'B', image: '🐛' },
        { word: 'cup', start: 'C', image: '🥤' },
        { word: 'van', start: 'V', image: '🚐' },
        { word: 'jet', start: 'J', image: '✈️' },
        { word: 'log', start: 'L', image: '🪵' },
        { word: 'web', start: 'W', image: '🕸️' },
        { word: 'zip', start: 'Z', image: '🤐' }
    ];

    // 1st grade: Blends and digraphs
    const BLENDS_DIGRAPHS = [
        { word: 'block', pattern: 'bl', type: 'blend' },
        { word: 'clap', pattern: 'cl', type: 'blend' },
        { word: 'crab', pattern: 'cr', type: 'blend' },
        { word: 'drum', pattern: 'dr', type: 'blend' },
        { word: 'flag', pattern: 'fl', type: 'blend' },
        { word: 'frog', pattern: 'fr', type: 'blend' },
        { word: 'grin', pattern: 'gr', type: 'blend' },
        { word: 'plug', pattern: 'pl', type: 'blend' },
        { word: 'skip', pattern: 'sk', type: 'blend' },
        { word: 'snap', pattern: 'sn', type: 'blend' },
        { word: 'spin', pattern: 'sp', type: 'blend' },
        { word: 'stop', pattern: 'st', type: 'blend' },
        { word: 'swim', pattern: 'sw', type: 'blend' },
        { word: 'trip', pattern: 'tr', type: 'blend' },
        { word: 'ship', pattern: 'sh', type: 'digraph' },
        { word: 'chin', pattern: 'ch', type: 'digraph' },
        { word: 'thin', pattern: 'th', type: 'digraph' },
        { word: 'whip', pattern: 'wh', type: 'digraph' }
    ];

    // 1st grade: Sight words
    const SIGHT_WORDS_G1 = [
        'the', 'and', 'was', 'you', 'are', 'his', 'they', 'have',
        'said', 'each', 'which', 'their', 'will', 'other', 'about', 'many',
        'then', 'them', 'could', 'people', 'from', 'been', 'some', 'would'
    ];

    // 2nd grade: Vowel teams
    const VOWEL_TEAMS = [
        { word: 'rain', team: 'ai', sound: 'long A' },
        { word: 'boat', team: 'oa', sound: 'long O' },
        { word: 'read', team: 'ea', sound: 'long E' },
        { word: 'leaf', team: 'ea', sound: 'long E' },
        { word: 'pail', team: 'ai', sound: 'long A' },
        { word: 'coat', team: 'oa', sound: 'long O' },
        { word: 'meat', team: 'ea', sound: 'long E' },
        { word: 'tail', team: 'ai', sound: 'long A' },
        { word: 'goat', team: 'oa', sound: 'long O' },
        { word: 'bead', team: 'ea', sound: 'long E' },
        { word: 'seed', team: 'ee', sound: 'long E' },
        { word: 'feet', team: 'ee', sound: 'long E' },
        { word: 'moon', team: 'oo', sound: 'long OO' },
        { word: 'food', team: 'oo', sound: 'long OO' }
    ];

    // 2nd grade: R-controlled vowels
    const R_CONTROLLED = [
        { word: 'car', pattern: 'ar', sound: 'ar' },
        { word: 'star', pattern: 'ar', sound: 'ar' },
        { word: 'bird', pattern: 'ir', sound: 'er' },
        { word: 'girl', pattern: 'ir', sound: 'er' },
        { word: 'fern', pattern: 'er', sound: 'er' },
        { word: 'her', pattern: 'er', sound: 'er' },
        { word: 'corn', pattern: 'or', sound: 'or' },
        { word: 'fork', pattern: 'or', sound: 'or' },
        { word: 'turn', pattern: 'ur', sound: 'er' },
        { word: 'burn', pattern: 'ur', sound: 'er' }
    ];

    // 2nd grade: Multi-syllable words
    const MULTI_SYLLABLE = [
        { word: 'basket', syllables: ['bas', 'ket'], count: 2 },
        { word: 'spider', syllables: ['spi', 'der'], count: 2 },
        { word: 'pencil', syllables: ['pen', 'cil'], count: 2 },
        { word: 'rabbit', syllables: ['rab', 'bit'], count: 2 },
        { word: 'butter', syllables: ['but', 'ter'], count: 2 },
        { word: 'pumpkin', syllables: ['pump', 'kin'], count: 2 },
        { word: 'animal', syllables: ['an', 'i', 'mal'], count: 3 },
        { word: 'elephant', syllables: ['el', 'e', 'phant'], count: 3 },
        { word: 'butterfly', syllables: ['but', 'ter', 'fly'], count: 3 },
        { word: 'dinosaur', syllables: ['di', 'no', 'saur'], count: 3 }
    ];

    let container = null, onComplete = null;
    let currentRound = 0, totalRounds = 8, targetLetter = '';
    let roundCorrect = 0, roundTotal = 0;
    let useLowercase = false;
    let questionType = 'letter'; // 'letter', 'cvc', 'blend', 'sight', 'vowelteam', 'rcontrolled', 'syllable'
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
            // K: alternate letter recognition, beginning sounds, CVC words
            const types = ['letter', 'cvc', 'cvc', 'letter'];
            questionType = types[currentRound % types.length];
            if (questionType === 'letter') _preKQuestion();
            else _cvcQuestion();
        } else if (grade === 2) {
            // 1st: blends/digraphs, sight words
            const types = ['blend', 'sight', 'blend', 'sight'];
            questionType = types[currentRound % types.length];
            if (questionType === 'blend') _blendQuestion();
            else _sightWordQuestion();
        } else {
            // 2nd: vowel teams, r-controlled, syllables
            const types = ['vowelteam', 'rcontrolled', 'syllable', 'vowelteam'];
            questionType = types[currentRound % types.length];
            if (questionType === 'vowelteam') _vowelTeamQuestion();
            else if (questionType === 'rcontrolled') _rControlledQuestion();
            else _syllableQuestion();
        }
    }

    // ---------- Pre-K: Letter recognition ----------
    function _preKQuestion() {
        questionType = 'letter';
        const stats = Progress.getStats('letter-web');
        const available = (stats.lettersLearned && stats.lettersLearned.length > 0) ? stats.lettersLearned : ['A','B','C','O'];
        targetLetter = available[Math.floor(Math.random() * available.length)];
        const targetColor = LETTER_COLORS[ALL_LETTERS.indexOf(targetLetter) % LETTER_COLORS.length];
        const distractors = available.filter(l => l !== targetLetter).sort(() => Math.random() - 0.5);
        const choices = [targetLetter, ...distractors.slice(0, 2)].sort(() => Math.random() - 0.5);

        useLowercase = available.length >= 6 && currentRound % 3 === 2;
        const displayTarget = useLowercase ? targetLetter.toLowerCase() : targetLetter;
        const displayChoices = useLowercase ? choices.map(l => l.toLowerCase()) : choices;
        const useSoundHint = currentRound % 3 === 1;

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="letter-web-display">
                <div class="letter-web-frame">
                    <svg class="web-bg" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
                        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                    </svg>
                    <div class="letter-web-target" style="color:${targetColor}">${displayTarget}</div>
                </div>
            </div>
            <div class="letter-choices">
                ${displayChoices.map((l, i) => {
                    const origLetter = choices[i];
                    const color = LETTER_COLORS[ALL_LETTERS.indexOf(origLetter) % LETTER_COLORS.length];
                    return `<button class="letter-choice-btn" data-letter="${origLetter}" style="--letter-color:${color}"><span class="letter-text">${l}</span></button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onLetterChoice(btn)));

        setTimeout(() => {
            if (useSoundHint) {
                const sound = LETTER_SOUNDS[targetLetter] || targetLetter;
                Voice.speak(`Find the letter that says "${sound}"!`);
            } else if (useLowercase) {
                Voice.speak(`Find the lowercase ${targetLetter}!`);
            } else {
                Voice.speak(`Find the letter ${targetLetter}!`);
            }
        }, 400);
    }

    function _onLetterChoice(btn) {
        const chosen = btn.dataset.letter;
        roundTotal++;
        if (chosen === targetLetter) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            const sound = LETTER_SOUNDS[targetLetter] || '';
            Voice.speak(`Yes! ${targetLetter} says "${sound}"!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('letter-web', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-letter="${targetLetter}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`That's ${chosen}. Look for ${targetLetter}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    // ---------- K: CVC Beginning Sounds ----------
    function _cvcQuestion() {
        const word = CVC_WORDS[Math.floor(Math.random() * CVC_WORDS.length)];
        currentAnswer = word.start;

        const distractors = ALL_LETTERS.filter(l => l !== word.start).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [word.start, ...distractors].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="cvc-display">
                <div class="cvc-image">${word.image}</div>
                <div class="cvc-word">${word.word}</div>
                <div class="cvc-ask">What letter does <strong>${word.word}</strong> start with?</div>
            </div>
            <div class="letter-choices">
                ${choices.map(l => {
                    const color = LETTER_COLORS[ALL_LETTERS.indexOf(l) % LETTER_COLORS.length];
                    return `<button class="letter-choice-btn" data-answer="${l}" style="--letter-color:${color}"><span class="letter-text">${l}</span></button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`What letter does ${word.word} start with?`), 400);
    }

    // ---------- 1st Grade: Blends & Digraphs ----------
    function _blendQuestion() {
        const item = BLENDS_DIGRAPHS[Math.floor(Math.random() * BLENDS_DIGRAPHS.length)];
        currentAnswer = item.pattern;

        const allPatterns = [...new Set(BLENDS_DIGRAPHS.map(b => b.pattern))];
        const distractors = allPatterns.filter(p => p !== item.pattern).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [item.pattern, ...distractors].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="blend-display">
                <div class="blend-word">${item.word}</div>
                <div class="blend-type">${item.type === 'blend' ? 'Blend' : 'Digraph'}</div>
                <div class="blend-ask">What ${item.type} does <strong>${item.word}</strong> start with?</div>
            </div>
            <div class="letter-choices">
                ${choices.map(p => `<button class="letter-choice-btn blend-choice" data-answer="${p}"><span class="letter-text">${p}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`What ${item.type} does ${item.word} start with?`), 400);
    }

    // ---------- 1st Grade: Sight Words ----------
    function _sightWordQuestion() {
        // Show a sight word with a missing letter
        const word = SIGHT_WORDS_G1[Math.floor(Math.random() * SIGHT_WORDS_G1.length)];
        const pos = Math.floor(Math.random() * word.length);
        const missingLetter = word[pos].toUpperCase();
        const displayed = word.slice(0, pos) + '_' + word.slice(pos + 1);
        currentAnswer = missingLetter;

        const distractors = ALL_LETTERS.filter(l => l !== missingLetter).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [missingLetter, ...distractors].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="sight-display">
                <div class="sight-label">Sight Word</div>
                <div class="sight-word">${displayed}</div>
                <div class="sight-ask">What letter is missing?</div>
            </div>
            <div class="letter-choices">
                ${choices.map(l => {
                    const color = LETTER_COLORS[ALL_LETTERS.indexOf(l) % LETTER_COLORS.length];
                    return `<button class="letter-choice-btn" data-answer="${l}" style="--letter-color:${color}"><span class="letter-text">${l}</span></button>`;
                }).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onSightChoice(btn, word)));
        setTimeout(() => Voice.speak(`What letter is missing from ${displayed.replace('_', 'blank')}?`), 400);
    }

    function _onSightChoice(btn, fullWord) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! The word is ${fullWord}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('letter-web', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Not quite. The missing letter is ${currentAnswer}. The word is ${fullWord}.`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    // ---------- 2nd Grade: Vowel Teams ----------
    function _vowelTeamQuestion() {
        const item = VOWEL_TEAMS[Math.floor(Math.random() * VOWEL_TEAMS.length)];
        currentAnswer = item.team;

        const allTeams = [...new Set(VOWEL_TEAMS.map(v => v.team))];
        const distractors = allTeams.filter(t => t !== item.team).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [item.team, ...distractors].sort(() => Math.random() - 0.5);

        // Highlight the vowel team in the word
        const highlighted = item.word.replace(item.team, `<span class="vt-highlight">${item.team}</span>`);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="vowelteam-display">
                <div class="vt-label">Vowel Team</div>
                <div class="vt-word">${highlighted}</div>
                <div class="vt-sound">Makes the ${item.sound} sound</div>
                <div class="vt-ask">Which vowel team do you see?</div>
            </div>
            <div class="letter-choices">
                ${choices.map(t => `<button class="letter-choice-btn vt-choice" data-answer="${t}"><span class="letter-text">${t}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`Look at the word ${item.word}. Which vowel team do you see?`), 400);
    }

    // ---------- 2nd Grade: R-Controlled Vowels ----------
    function _rControlledQuestion() {
        const item = R_CONTROLLED[Math.floor(Math.random() * R_CONTROLLED.length)];
        currentAnswer = item.pattern;

        const allPatterns = [...new Set(R_CONTROLLED.map(r => r.pattern))];
        const distractors = allPatterns.filter(p => p !== item.pattern).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [item.pattern, ...distractors].sort(() => Math.random() - 0.5);

        const highlighted = item.word.replace(item.pattern, `<span class="vt-highlight">${item.pattern}</span>`);

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="vowelteam-display">
                <div class="vt-label">Bossy R</div>
                <div class="vt-word">${highlighted}</div>
                <div class="vt-ask">Which r-controlled vowel is in <strong>${item.word}</strong>?</div>
            </div>
            <div class="letter-choices">
                ${choices.map(p => `<button class="letter-choice-btn vt-choice" data-answer="${p}"><span class="letter-text">${p}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.letter-choice-btn').forEach(btn => btn.addEventListener('click', () => _onGenericChoice(btn)));
        setTimeout(() => Voice.speak(`Which bossy R pattern is in the word ${item.word}?`), 400);
    }

    // ---------- 2nd Grade: Syllable Counting ----------
    function _syllableQuestion() {
        const item = MULTI_SYLLABLE[Math.floor(Math.random() * MULTI_SYLLABLE.length)];
        currentAnswer = String(item.count);

        const choices = ['1', '2', '3'].sort(() => Math.random() - 0.5);
        if (!choices.includes(String(item.count))) {
            choices[0] = String(item.count);
            choices.sort(() => Math.random() - 0.5);
        }

        container.innerHTML = `
            <div class="activity-prompt"><span class="round-counter">${currentRound + 1} / ${totalRounds}</span></div>
            <div class="syllable-display">
                <div class="syl-label">Syllables</div>
                <div class="syl-word">${item.word}</div>
                <div class="syl-ask">How many syllables does <strong>${item.word}</strong> have?</div>
            </div>
            <div class="number-choices">
                ${choices.map(n => `<button class="number-choice-btn" data-answer="${n}"><span class="number-text">${n}</span></button>`).join('')}
            </div>
        `;
        container.querySelectorAll('.number-choice-btn').forEach(btn => btn.addEventListener('click', () => _onSyllableChoice(btn, item)));
        setTimeout(() => Voice.speak(`How many syllables in the word ${item.word}? Clap it out!`), 400);
    }

    function _onSyllableChoice(btn, item) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${item.word} has ${item.count} syllables: ${item.syllables.join(', ')}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 2000);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('letter-web', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Let's clap it: ${item.syllables.join(', ')}. ${item.count} syllables!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 3000);
        }
    }

    // ---------- Generic choice handler (blend, cvc, vowel team, r-controlled) ----------
    function _onGenericChoice(btn) {
        const chosen = btn.dataset.answer;
        roundTotal++;
        if (chosen === currentAnswer) {
            roundCorrect++;
            Audio.playCorrect();
            Progress.recordAnswer('letter-web', true);
            Character.happy();
            btn.classList.add('choice-correct');
            const rect = btn.getBoundingClientRect();
            Celebration.sparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            Voice.speak(`Yes! ${currentAnswer}!`);
            if (Progress.shouldAwardSticker()) _awardSticker();
            currentRound++;
            setTimeout(_nextQuestion, 1500);
        } else {
            Audio.playWrong();
            Progress.recordAnswer('letter-web', false);
            Character.encourage();
            btn.classList.add('choice-wrong');
            const correctBtn = container.querySelector(`[data-answer="${currentAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('choice-hint');
            Voice.speak(`Not quite. The answer is ${currentAnswer}!`);
            setTimeout(() => { btn.classList.remove('choice-wrong'); if (correctBtn) correctBtn.classList.remove('choice-hint'); }, 2500);
        }
    }

    // ---------- Completion ----------
    function _completeActivity() {
        Audio.playCelebration(); Character.celebrate(); Celebration.confetti();
        Voice.speak('You found all the letters! Super!');
        _maybeUnlock();
        setTimeout(() => { if (onComplete) onComplete(roundCorrect, roundTotal); }, 3000);
    }

    function _maybeUnlock() {
        const stats = Progress.getStats('letter-web');
        if (stats.played >= 2 && stats.lettersLearned && stats.lettersLearned.length < ALL_LETTERS.length) {
            const toAdd = ALL_LETTERS.filter(l => !stats.lettersLearned.includes(l)).slice(0, 3);
            toAdd.forEach(l => Progress.expandContent('letter-web', l));
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
