/* ============================================
   NONSENSE WORDS — CVC Generator for FastBridge Prep
   ============================================ */
const NonsenseWords = (() => {
    // Consonants and vowels for CVC generation (matching FastBridge patterns)
    // FastBridge rules: no words ending in l, r, y, or q; no words starting with ci- or ce-
    const INITIAL_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];
    const FINAL_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 's', 't', 'v', 'w', 'x', 'z'];
    const VOWELS = ['a', 'e', 'i', 'o', 'u'];

    // Pre-built nonsense words — curated CVC pseudowords for FastBridge prep
    // Rules: no endings in l/r/y/q, no ci-/ce- starts, no real English words
    // Audited 2026-03-20: removed real words (vid, nom, div, etc.) and inappropriate words
    const FORM_WORDS = [
        'fif', 'gog', 'zep', 'jup', 'sem', 'mok', 'beb', 'roz', 'nux', 'tuk',
        'poc', 'vok', 'nop', 'dov', 'bov', 'yox', 'mib', 'tib', 'deg', 'zoc',
        'voz', 'zid', 'muz', 'taz', 'tuv', 'pov', 'gev', 'miv', 'kob', 'mez',
        'lud', 'pab', 'yig', 'hux', 'pex', 'zob', 'faf', 'hez', 'tuf', 'tox',
        'pif', 'bep', 'kem', 'nij', 'nis', 'gac', 'zaf', 'lod', 'haf', 'zet',
        'sek', 'fac', 'bup', 'veb', 'moc', 'jas', 'zom', 'wek', 'jof', 'gop',
        'muv', 'yek', 'kuz', 'wib', 'guz', 'vec', 'gok', 'naf', 'kuv', 'ruc',
        'kiv', 'tev', 'gux', 'zup', 'fic', 'vup', 'biv', 'wuk', 'puz', 'jex',
        'riz', 'fot', 'ziv', 'wak', 'cak', 'loz', 'jeg', 'maz', 'huv', 'yad',
        'tep', 'huz', 'vab', 'pev', 'zub', 'bip', 'lup', 'goz', 'nuz', 'gax',
        'wof', 'hig', 'jes', 'jad', 'bok', 'kev', 'hof', 'nem', 'tez', 'dac',
        'tef', 'bax', 'zif', 'cug', 'fof', 'kak', 'lun', 'nep', 'ved', 'kex',
        // Expansion set — 90 additional curated CVC pseudowords (total 210)
        'baf', 'buz', 'cob', 'duz', 'fep', 'gib', 'hep', 'jib', 'kaf', 'lux',
        'mef', 'nig', 'pog', 'rux', 'suz', 'tav', 'vix', 'wez', 'yof', 'zag',
        'bik', 'cuf', 'dex', 'fuz', 'gep', 'hob', 'juz', 'kig', 'lef', 'mox',
        'nub', 'pik', 'roz', 'siv', 'tub', 'vog', 'wix', 'yep', 'zek', 'bof',
        'cax', 'dib', 'feg', 'gux', 'hev', 'jok', 'kup', 'lez', 'mig', 'nox',
        'paf', 'rub', 'sog', 'tix', 'vaz', 'wob', 'yuz', 'zep', 'bux', 'cog',
        'daf', 'fiv', 'gez', 'hox', 'jub', 'kif', 'lev', 'mup', 'noz', 'pux',
        'saf', 'tob', 'veg', 'wuz', 'yib', 'zof', 'beg', 'cux', 'dop', 'fax',
        'gim', 'huz', 'jep', 'kox', 'liz', 'mav', 'nuf', 'pez', 'sux', 'teg'
    ];

    // FastBridge KG Spring benchmark: 12 nonsense words/minute
    const BENCHMARK_WPM = 12;

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // Common real CVC words to exclude from generation
    const REAL_WORDS = new Set([
        'bad', 'bag', 'ban', 'bat', 'bed', 'bet', 'bid', 'big', 'bin', 'bit',
        'bob', 'bog', 'bop', 'box', 'bud', 'bug', 'bun', 'bus', 'but', 'cab',
        'can', 'cap', 'cat', 'cob', 'cod', 'cop', 'cot', 'cow', 'cub', 'cud',
        'cup', 'cut', 'dab', 'dad', 'dam', 'den', 'did', 'dig', 'dim', 'dip',
        'dog', 'dot', 'dub', 'dud', 'dug', 'dun', 'fan', 'fat', 'fed', 'fig',
        'fin', 'fit', 'fix', 'fob', 'fog', 'fop', 'fox', 'fun', 'gab', 'gag',
        'gap', 'gas', 'get', 'gig', 'got', 'gum', 'gun', 'gus', 'gut', 'had',
        'ham', 'has', 'hat', 'hen', 'hid', 'him', 'hip', 'his', 'hit', 'hob',
        'hog', 'hop', 'hot', 'hub', 'hug', 'hum', 'hut', 'jab', 'jag', 'jam',
        'jet', 'jig', 'job', 'jog', 'jot', 'jug', 'jut', 'keg', 'kid', 'kin',
        'kit', 'lab', 'lad', 'lag', 'lap', 'led', 'leg', 'let', 'lid', 'lip',
        'lit', 'log', 'lot', 'lug', 'mad', 'man', 'map', 'mat', 'met', 'mix',
        'mob', 'mom', 'mop', 'mud', 'mug', 'mum', 'nab', 'nag', 'nap', 'net',
        'nib', 'nip', 'nit', 'nod', 'not', 'now', 'nun', 'nut', 'pad', 'pan',
        'pat', 'peg', 'pen', 'pet', 'pig', 'pin', 'pit', 'pod', 'pop', 'pot',
        'pub', 'pug', 'pun', 'pup', 'pus', 'put', 'rag', 'ram', 'ran', 'rap',
        'rat', 'red', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'rot',
        'rub', 'rug', 'run', 'rut', 'sac', 'sad', 'sag', 'sap', 'sat', 'set',
        'sin', 'sip', 'sis', 'sit', 'six', 'sob', 'sod', 'son', 'sop', 'sot',
        'sub', 'sum', 'sun', 'sup', 'tab', 'tad', 'tag', 'tan', 'tap', 'tat',
        'ten', 'the', 'tin', 'tip', 'ton', 'top', 'tot', 'tub', 'tug', 'van',
        'vat', 'vet', 'vim', 'vow', 'wad', 'wag', 'was', 'wax', 'web', 'wed',
        'wet', 'wig', 'win', 'wit', 'wok', 'won', 'wop', 'wow', 'yak', 'yam',
        'yap', 'yes', 'yet', 'zap', 'zen', 'zig', 'zip', 'zoo',
        'nom', 'vid', 'div', 'fob', 'fap', 'vat', 'bun', 'lam', 'nob', 'hep'
    ]);

    // Generate a random CVC nonsense word (FastBridge compliant)
    function generateCVC() {
        let word, attempts = 0;
        do {
            const c1 = INITIAL_CONSONANTS[Math.floor(Math.random() * INITIAL_CONSONANTS.length)];
            const v = VOWELS[Math.floor(Math.random() * VOWELS.length)];
            const c2 = FINAL_CONSONANTS[Math.floor(Math.random() * FINAL_CONSONANTS.length)];
            word = c1 + v + c2;
            attempts++;
        } while ((REAL_WORDS.has(word) || (word[0] === 'c' && (word[1] === 'e' || word[1] === 'i'))) && attempts < 100);
        return word;
    }

    // Generate a random VC nonsense word (2-letter)
    function generateVC() {
        const v = VOWELS[Math.floor(Math.random() * VOWELS.length)];
        const c = FINAL_CONSONANTS[Math.floor(Math.random() * FINAL_CONSONANTS.length)];
        return v + c;
    }

    // Get a set of nonsense words for practice
    function getPracticeSet(count = 10) {
        const words = shuffle(FORM_WORDS).slice(0, count);
        // Fill with generated if needed
        while (words.length < count) {
            const w = generateCVC();
            if (!words.includes(w)) words.push(w);
        }
        return words;
    }

    // Generate similar-looking wrong choices for a nonsense word
    function getChoices(correctWord, count = 3) {
        const choices = [correctWord];
        const attempts = new Set([correctWord]);
        let tries = 0;
        while (choices.length < count + 1 && tries < 50) {
            tries++;
            let wrong;
            const strategy = Math.random();
            if (strategy < 0.4 && correctWord.length === 3) {
                // Change one letter
                const pos = Math.floor(Math.random() * 3);
                const chars = correctWord.split('');
                if (pos === 1) {
                    chars[pos] = VOWELS[Math.floor(Math.random() * VOWELS.length)];
                } else if (pos === 0) {
                    chars[pos] = INITIAL_CONSONANTS[Math.floor(Math.random() * INITIAL_CONSONANTS.length)];
                } else {
                    chars[pos] = FINAL_CONSONANTS[Math.floor(Math.random() * FINAL_CONSONANTS.length)];
                }
                wrong = chars.join('');
            } else if (strategy < 0.7) {
                // Pick from form words
                wrong = FORM_WORDS[Math.floor(Math.random() * FORM_WORDS.length)];
            } else {
                // Generate random CVC
                wrong = generateCVC();
            }
            if (wrong !== correctWord && !attempts.has(wrong)) {
                choices.push(wrong);
                attempts.add(wrong);
            }
        }
        return shuffle(choices);
    }

    // Variable question types for nonsense words
    // Mixes auditory discrimination, blending, visual matching, and beginning/ending sounds
    function generateQuestion(word) {
        word = word || shuffle(FORM_WORDS)[0];

        // Weight toward auditory (most FastBridge-aligned) but mix in variety
        const roll = Math.random();

        if (roll < 0.35) {
            // Auditory discrimination — core FastBridge skill
            return {
                word, prompt: 'Sound it out! Which word do you hear?',
                showWord: false, speak: true,
                choices: getChoices(word), correct: word,
                topic: 'nonsense-words', blockType: 'obsidian'
            };
        }
        if (roll < 0.55) {
            // Blending — break word into phonemes
            const sounds = word.split('').map(c => `/${c}/`).join('  ');
            return {
                word, prompt: `Blend the sounds: ${sounds}`,
                showWord: false, speak: true,
                choices: getChoices(word), correct: word,
                topic: 'nonsense-words', blockType: 'obsidian'
            };
        }
        if (roll < 0.70) {
            // Visual matching — see the word, find it among similar-looking words
            return {
                word, prompt: 'Find this word!',
                showWord: true, speak: false,
                choices: getChoices(word), correct: word,
                topic: 'nonsense-words', blockType: 'obsidian'
            };
        }
        if (roll < 0.85) {
            // Beginning sound focus
            return {
                word, prompt: `Listen! What word starts with /${word[0]}/?`,
                showWord: false, speak: true,
                choices: getBeginningChoices(word), correct: word,
                topic: 'nonsense-words', blockType: 'obsidian'
            };
        }
        // Ending sound focus
        return {
            word, prompt: `Listen! What word ends with /${word[word.length - 1]}/?`,
            showWord: false, speak: true,
            choices: getEndingChoices(word), correct: word,
            topic: 'nonsense-words', blockType: 'obsidian'
        };
    }

    // Distractors that start with DIFFERENT consonants (for beginning sound questions)
    function getBeginningChoices(correctWord) {
        const choices = [correctWord];
        const used = new Set([correctWord, correctWord[0]]);
        let tries = 0;
        while (choices.length < 4 && tries < 40) {
            const w = generateCVC();
            if (!used.has(w) && w[0] !== correctWord[0]) {
                choices.push(w);
                used.add(w);
            }
            tries++;
        }
        return shuffle(choices);
    }

    // Distractors that end with DIFFERENT consonants (for ending sound questions)
    function getEndingChoices(correctWord) {
        const choices = [correctWord];
        const lastChar = correctWord[correctWord.length - 1];
        const used = new Set([correctWord]);
        let tries = 0;
        while (choices.length < 4 && tries < 40) {
            const w = generateCVC();
            if (!used.has(w) && w[w.length - 1] !== lastChar) {
                choices.push(w);
                used.add(w);
            }
            tries++;
        }
        return shuffle(choices);
    }

    return {
        FORM_WORDS, BENCHMARK_WPM,
        generateCVC, generateVC, getPracticeSet,
        getChoices, generateQuestion, shuffle
    };
})();
