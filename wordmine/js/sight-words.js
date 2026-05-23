/* ============================================
   SIGHT WORDS — FastBridge KG Sight Words Bank
   Aligned to FastBridge earlyReading high-frequency word lists
   Based on Educator's Word Frequency Guide (Zeno et al., 1995)
   Audited 2026-03-20 against best available FastBridge reference data
   ============================================ */
const SightWords = (() => {
    // FastBridge KG Sight Words (50) — the main assessment words
    // These are the 50 highest-frequency words tested on the KG earlyReading form
    const WORDS = [
        'all', 'are', 'as', 'ball', 'be',
        'boy', 'by', 'come', 'day', 'did',
        'eat', 'for', 'get', 'girl', 'got',
        'had', 'has', 'her', 'him', 'his',
        'how', 'if', 'jump', 'look', 'man',
        'mom', 'not', 'now', 'of', 'or',
        'out', 'play', 'put', 'ran', 'read',
        'run', 'sat', 'saw', 'say', 'she',
        'sit', 'then', 'they', 'this', 'too',
        'us', 'was', 'went', 'will', 'yes'
    ];

    // Prerequisite 25 — simpler words children should know before the KG test
    // Used for beginner practice and as wrong-answer distractors
    const PREREQ_WORDS = [
        'a', 'I', 'see', 'am', 'in',
        'so', 'an', 'is', 'the', 'and',
        'it', 'to', 'at', 'like', 'up',
        'can', 'me', 'we', 'do', 'my',
        'you', 'go', 'no', 'he', 'on'
    ];

    // 1st Grade sight words (75) — extends KG list for growing readers
    // Based on Dolch/Fry high-frequency word lists aligned to FastBridge Grade 1
    const GRADE1_WORDS = [
        'about', 'after', 'again', 'any', 'ask',
        'back', 'been', 'before', 'best', 'big',
        'black', 'blue', 'bring', 'brown', 'but',
        'buy', 'call', 'came', 'cold', 'could',
        'cut', 'down', 'draw', 'drink', 'each',
        'every', 'fall', 'far', 'fast', 'find',
        'first', 'five', 'fly', 'found', 'from',
        'full', 'fun', 'gave', 'give', 'going',
        'good', 'green', 'grow', 'hand', 'have',
        'help', 'here', 'hold', 'hot', 'house',
        'into', 'just', 'keep', 'kind', 'know',
        'last', 'let', 'light', 'little', 'long',
        'made', 'make', 'many', 'may', 'much',
        'must', 'new', 'old', 'once', 'only',
        'open', 'over', 'own', 'pick', 'pull'
    ];

    // Combined pool for practice (150 total)
    const ALL_WORDS = [...WORDS, ...PREREQ_WORDS, ...GRADE1_WORDS];

    // FastBridge KG Spring benchmark: 13 words/minute
    const BENCHMARK_WPM = 13;

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Get all 50 words in random order (like FastBridge test forms)
    function getTestSet() {
        return shuffle(WORDS);
    }

    // Get a set of words for practice, weighted by mastery + recency
    // Spaced repetition: words the child struggles with appear more often,
    // and recently-wrong words get extra priority
    function getPracticeSet(count = 10) {
        const weighted = [];
        ALL_WORDS.forEach(w => {
            const mastery = Progress.getSightWordMastery(w);
            const acc = Progress.getSightWordAccuracy(w);

            // Base weight: new=3, learning=2, mastered=1
            let weight = mastery === 'new' ? 3 : mastery === 'learning' ? 2 : 1;

            // Boost recently-wrong words: check last 5 attempts
            if (acc && acc.recent && acc.recent.length > 0) {
                const recentWrong = acc.recent.slice(-5).filter(r => r === 0).length;
                weight += recentWrong * 2; // +2 per recent miss
            }

            // Boost words with low accuracy that have been attempted
            if (acc && acc.total >= 3 && acc.accuracy < 0.6) {
                weight += 3; // struggling words get big boost
            }

            // Ensure at least some mastered words appear for reinforcement (1 in ~4 chance)
            if (mastery === 'mastered' && Math.random() < 0.25) {
                weight += 1;
            }

            for (let i = 0; i < weight; i++) weighted.push(w);
        });

        // Shuffle and pick unique
        const shuffled = shuffle(weighted);
        const picked = [];
        const seen = new Set();
        for (const w of shuffled) {
            if (!seen.has(w)) {
                seen.add(w);
                picked.push(w);
                if (picked.length >= count) break;
            }
        }
        // Fill remaining if needed
        if (picked.length < count) {
            for (const w of shuffle(ALL_WORDS)) {
                if (!seen.has(w)) {
                    picked.push(w);
                    seen.add(w);
                    if (picked.length >= count) break;
                }
            }
        }
        return picked;
    }

    // Generate wrong answer choices for a sight word
    // Uses same-difficulty pool so distractors are appropriate
    function getChoices(correctWord, count = 3) {
        const isPrereq = PREREQ_WORDS.includes(correctWord);
        const isGrade1 = GRADE1_WORDS.includes(correctWord);
        const pool = isPrereq ? PREREQ_WORDS : isGrade1 ? GRADE1_WORDS : WORDS;
        const others = pool.filter(w => w !== correctWord);
        const shuffled = shuffle(others);
        const choices = [correctWord, ...shuffled.slice(0, count)];
        return shuffle(choices);
    }

    // Generate a question for a sight word
    // 5 question types for variety — visual, auditory, spelling awareness
    function generateQuestion(word) {
        const questionTypes = [
            { prompt: 'Which word do you see?', showWord: true },
            { prompt: 'Tap the word you hear!', showWord: false, speak: true },
            { prompt: 'Find this word!', showWord: true },
            { prompt: `Which word starts with "${word[0].toUpperCase()}"?`, showWord: false, speak: true },
            { prompt: `How many letters? ${word.length}! Find the word:`, showWord: false, speak: true }
        ];
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        return {
            word,
            prompt: type.prompt,
            showWord: type.showWord,
            speak: type.speak || false,
            choices: getChoices(word),
            correct: word,
            topic: 'sight-words',
            blockType: 'dirt'
        };
    }

    return {
        WORDS, PREREQ_WORDS, GRADE1_WORDS, ALL_WORDS, BENCHMARK_WPM,
        getTestSet, getPracticeSet, getChoices, generateQuestion, shuffle
    };
})();
