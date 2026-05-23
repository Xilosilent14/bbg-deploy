// ===== READING QUESTION DATA V41 =====
const ReadingData = {
    topics: [
        { id: 'letters', name: 'Letters', icon: '🔤' },
        { id: 'phonics', name: 'Phonics', icon: '🗣️' },
        { id: 'sight-words', name: 'Sight Words', icon: '👀' },
        { id: 'rhyming', name: 'Rhyming', icon: '🎵' },
        { id: 'sentences', name: 'Sentences', icon: '📝' },
        { id: 'vocabulary', name: 'Vocabulary', icon: '📗' },
        { id: 'syllables', name: 'Syllables', icon: '👏' },
        // V20: 2nd grade topics
        { id: 'compound-words', name: 'Compound Words', icon: '🔗' },
        { id: 'prefix-suffix', name: 'Prefix & Suffix', icon: '🏗️' },
        { id: 'grammar', name: 'Grammar', icon: '📝' },
        { id: 'contractions', name: 'Contractions', icon: '✂️' },
        { id: 'comprehension', name: 'Reading Comp', icon: '📖' },
        // V34: 8 new reading topics
        { id: 'spelling', name: 'Spelling', icon: '✏️' },
        { id: 'antonyms', name: 'Antonyms', icon: '↔️' },
        { id: 'synonyms', name: 'Synonyms', icon: '🔄' },
        { id: 'alphabetical', name: 'ABC Order', icon: '🔤' },
        { id: 'word-families', name: 'Word Families', icon: '👨‍👩‍👧' },
        { id: 'sequencing', name: 'Story Order', icon: '📋' },
        { id: 'homophones', name: 'Homophones', icon: '👂' },
        { id: 'capitalization', name: 'Capitals', icon: '🅰️' },
        // V41: 3rd grade topics
        { id: 'multi-syllable', name: 'Syllable Decoding', icon: '🧩' },
        { id: 'context-clues', name: 'Context Clues', icon: '🔍' },
        { id: 'main-idea-detail', name: 'Main Idea & Details', icon: '🎯' },
        { id: 'cause-effect', name: 'Cause & Effect', icon: '⚡' },
        { id: 'compare-contrast', name: 'Compare & Contrast', icon: '⚖️' },
        { id: 'text-features', name: 'Text Features', icon: '📑' }
    ],

    generate(topic, level) {
        const generators = {
            letters: this._letters,
            phonics: this._phonics,
            'sight-words': this._sightWords,
            rhyming: this._rhyming,
            sentences: this._sentences,
            vocabulary: this._vocabulary,
            syllables: this._syllables,
            // V20: 2nd grade
            'compound-words': this._compoundWords,
            'prefix-suffix': this._prefixSuffix,
            grammar: this._grammar,
            contractions: this._contractions,
            comprehension: this._comprehension,
            // V34: 8 new topics
            spelling: this._spelling,
            antonyms: this._antonyms,
            synonyms: this._synonyms,
            alphabetical: this._alphabetical,
            'word-families': this._wordFamilies,
            sequencing: this._sequencing,
            homophones: this._homophones,
            capitalization: this._capitalization,
            // V41: 3rd grade topics
            'multi-syllable': this._multiSyllable,
            'context-clues': this._contextClues,
            'main-idea-detail': this._mainIdeaDetail,
            'cause-effect': this._causeEffect,
            'compare-contrast': this._compareContrast,
            'text-features': this._textFeatures
        };
        const gen = generators[topic];
        if (!gen) return this._letters(level);
        return gen.call(this, level);
    },

    _rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Safety-limited wrong answer generator to prevent infinite loops
    _fillWrongs(wrongs, pool, target, count = 3) {
        let attempts = 0;
        while (wrongs.length < count && attempts < 50) {
            const w = pool[this._rand(0, pool.length - 1)];
            if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            attempts++;
        }
        return wrongs;
    },

    // ---- LETTERS ----
    _letters(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._letters2nd(level);

        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const idx = this._rand(0, 25);

        if (level < 2) {
            // Pre-K: Simple uppercase letter recognition
            const target = upper[idx];
            const wrongs = [];
            let _sa1 = 0;
            while (wrongs.length < 3 && _sa1++ < 50) {
                const w = upper[this._rand(0, 25)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);
            return {
                question: `Which letter is this?\n${target}`,
                questionSpeak: `Which letter is this?`,
                answers,
                correctIndex: answers.indexOf(target),
                topic: 'letters',
                subtype: 'letter-name',
                explanation: `That letter is ${target}! ${target} is for ${this._letterWord(target)}!`,
                explanationSpeak: `That letter is ${target}! ${target} is for ${this._letterWord(target)}!`
            };
        } else if (level <= 3) {
            if (Math.random() < 0.5) {
                const target = upper[idx];
                const correct = lower[idx];
                const wrongs = [];
                let _sa2 = 0;
                while (wrongs.length < 3 && _sa2++ < 50) {
                    const w = lower[this._rand(0, 25)];
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `Which lowercase letter matches "${target}"?`,
                    questionSpeak: `Which lowercase letter matches ${target}?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'letters',
                    subtype: 'uppercase-match',
                    explanation: `Big ${target} and little ${correct} are the same letter!`,
                    explanationSpeak: `Big ${target} and little ${correct} are the same letter!`
                };
            } else {
                const target = Math.random() < 0.5 ? upper[idx] : lower[idx];
                const correct = upper[idx];
                const wrongs = [];
                let _sa3 = 0;
                while (wrongs.length < 3 && _sa3++ < 50) {
                    const w = upper[this._rand(0, 25)];
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
                const answers = this._shuffle([correct, ...wrongs]);
                return {
                    question: `What letter is this?\n${target}`,
                    questionSpeak: `What letter is this?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'letters',
                    subtype: 'letter-identify',
                    explanation: `That letter is ${correct}! ${correct} is for ${this._letterWord(correct)}!`,
                    explanationSpeak: `That letter is ${correct}! ${correct} is for ${this._letterWord(correct)}!`
                };
            }
        } else {
            // 1st grade (level >= 4): confusing letters
            const confusing = {
                'b': ['d', 'p', 'q'], 'd': ['b', 'p', 'q'], 'p': ['b', 'd', 'q'], 'q': ['b', 'd', 'p'],
                'm': ['n', 'w', 'u'], 'n': ['m', 'u', 'h'], 'u': ['n', 'v', 'w'],
                'M': ['N', 'W', 'V'], 'N': ['M', 'H', 'Z'], 'W': ['M', 'V', 'N']
            };

            const target = lower[idx];
            const correct = target;
            let wrongs;
            if (confusing[target]) {
                wrongs = confusing[target];
            } else {
                wrongs = [];
                let _sa4 = 0;
                while (wrongs.length < 3 && _sa4++ < 50) {
                    const w = lower[this._rand(0, 25)];
                    if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
                }
            }
            const answers = this._shuffle([correct, ...wrongs.slice(0, 3)]);
            return {
                question: `Find the letter "${target.toUpperCase()}"`,
                questionSpeak: `Find the letter ${target.toUpperCase()}`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'letters',
                subtype: 'confusing-letters',
                explanation: `The letter ${target.toUpperCase()} looks like "${correct}". ${correct} is for ${this._letterWord(target.toUpperCase())}!`,
                explanationSpeak: `The letter ${target.toUpperCase()} looks like ${correct}. ${correct} is for ${this._letterWord(target.toUpperCase())}!`
            };
        }
    },

    _letterWord(letter) {
        const words = {
            A:'apple',B:'ball',C:'cat',D:'dog',E:'egg',F:'fish',G:'goat',H:'hat',
            I:'ice cream',J:'jump',K:'kite',L:'lion',M:'moon',N:'nest',O:'octopus',
            P:'pig',Q:'queen',R:'rain',S:'sun',T:'tree',U:'umbrella',V:'van',
            W:'water',X:'x-ray',Y:'yellow',Z:'zebra'
        };
        return words[letter.toUpperCase()] || letter;
    },

    // ---- PHONICS ----
    _phonicsData: {
        beginning: [
            { letter: 'B', words: ['ball', 'bear', 'bus', 'book'], wrong: ['cat', 'dog', 'fish'] },
            { letter: 'C', words: ['cat', 'car', 'cup', 'cow'], wrong: ['dog', 'bat', 'sun'] },
            { letter: 'D', words: ['dog', 'duck', 'door', 'doll'], wrong: ['cat', 'fan', 'pig'] },
            { letter: 'F', words: ['fish', 'fan', 'frog', 'foot'], wrong: ['hat', 'sun', 'car'] },
            { letter: 'G', words: ['goat', 'girl', 'game', 'gift'], wrong: ['bat', 'cup', 'dog'] },
            { letter: 'H', words: ['hat', 'house', 'horse', 'hand'], wrong: ['cat', 'tree', 'bus'] },
            { letter: 'J', words: ['jump', 'jam', 'jet', 'jar'], wrong: ['bat', 'cup', 'sun'] },
            { letter: 'K', words: ['kite', 'king', 'key', 'kid'], wrong: ['dog', 'hat', 'cup'] },
            { letter: 'L', words: ['lion', 'lamp', 'leaf', 'log'], wrong: ['cat', 'bus', 'fan'] },
            { letter: 'M', words: ['moon', 'map', 'mouse', 'milk'], wrong: ['sun', 'hat', 'dog'] },
            { letter: 'N', words: ['nest', 'nose', 'net', 'nut'], wrong: ['cat', 'bus', 'pig'] },
            { letter: 'P', words: ['pig', 'pen', 'pan', 'pie'], wrong: ['dog', 'sun', 'hat'] },
            { letter: 'R', words: ['rain', 'red', 'run', 'ring'], wrong: ['bat', 'cup', 'fan'] },
            { letter: 'S', words: ['sun', 'star', 'sock', 'sit'], wrong: ['hat', 'dog', 'cup'] },
            { letter: 'T', words: ['tree', 'top', 'ten', 'toy'], wrong: ['bus', 'pig', 'fan'] },
            { letter: 'V', words: ['van', 'vest', 'vine', 'vet'], wrong: ['bat', 'cat', 'sun'] },
            { letter: 'W', words: ['water', 'wolf', 'web', 'win'], wrong: ['cat', 'sun', 'hat'] },
            { letter: 'Y', words: ['yellow', 'yak', 'yam', 'yarn'], wrong: ['cat', 'dog', 'bat'] },
            { letter: 'Z', words: ['zebra', 'zoo', 'zip', 'zero'], wrong: ['cat', 'dog', 'hat'] }
        ],
        blends: [
            { blend: 'SH', words: ['ship', 'shoe', 'shell', 'sheep'], wrong: ['chip', 'this', 'tree'] },
            { blend: 'CH', words: ['chip', 'chair', 'cheese', 'chin'], wrong: ['ship', 'that', 'fish'] },
            { blend: 'TH', words: ['this', 'that', 'them', 'thin'], wrong: ['ship', 'chip', 'fish'] },
            { blend: 'BL', words: ['blue', 'black', 'block', 'blend'], wrong: ['ship', 'red', 'cat'] },
            { blend: 'CR', words: ['crab', 'cry', 'crown', 'cross'], wrong: ['ship', 'dog', 'hat'] },
            { blend: 'ST', words: ['star', 'stop', 'step', 'stick'], wrong: ['chip', 'ship', 'pig'] },
            { blend: 'BR', words: ['brown', 'bread', 'brush', 'bring'], wrong: ['clap', 'flag', 'tree'] },
            { blend: 'CL', words: ['clap', 'clock', 'cloud', 'clean'], wrong: ['flag', 'drum', 'ship'] },
            { blend: 'DR', words: ['drum', 'drop', 'dream', 'draw'], wrong: ['clap', 'flag', 'star'] },
            { blend: 'FL', words: ['flag', 'fly', 'flower', 'float'], wrong: ['clap', 'drum', 'ship'] },
            { blend: 'FR', words: ['frog', 'friend', 'fruit', 'fry'], wrong: ['clap', 'drum', 'ship'] },
            { blend: 'GL', words: ['glass', 'globe', 'glue', 'glad'], wrong: ['clap', 'flag', 'drum'] },
            { blend: 'GR', words: ['green', 'grow', 'grass', 'grape'], wrong: ['blue', 'flag', 'drum'] },
            { blend: 'PL', words: ['play', 'plant', 'plate', 'plane'], wrong: ['clap', 'drum', 'ship'] },
            { blend: 'PR', words: ['print', 'prize', 'proud', 'press'], wrong: ['clap', 'flag', 'drum'] },
            { blend: 'SL', words: ['slide', 'sleep', 'slow', 'slip'], wrong: ['swim', 'snap', 'star'] },
            { blend: 'SM', words: ['small', 'smile', 'smell', 'smart'], wrong: ['slide', 'snap', 'swim'] },
            { blend: 'SN', words: ['snow', 'snail', 'snap', 'snake'], wrong: ['slide', 'swim', 'star'] },
            { blend: 'SP', words: ['spin', 'spot', 'space', 'spell'], wrong: ['swim', 'slide', 'snap'] },
            { blend: 'SW', words: ['swim', 'sweet', 'swing', 'swan'], wrong: ['spin', 'slide', 'snap'] },
            { blend: 'TR', words: ['truck', 'tree', 'train', 'trip'], wrong: ['drum', 'flag', 'clap'] },
            { blend: 'SK', words: ['skip', 'sky', 'skate', 'skin'], wrong: ['spin', 'slide', 'snap'] }
        ],
        // CVC words for decoding practice
        cvc: [
            { word: 'cat', meaning: 'a furry pet that says meow', wrongs: ['a big dog', 'a red car', 'a tall tree'] },
            { word: 'dog', meaning: 'a pet that barks', wrongs: ['a pet that meows', 'a fish in water', 'a bird that flies'] },
            { word: 'hat', meaning: 'something you wear on your head', wrongs: ['something you eat', 'something you ride', 'something you read'] },
            { word: 'bed', meaning: 'where you sleep at night', wrongs: ['where you cook food', 'where you play ball', 'where you swim'] },
            { word: 'sun', meaning: 'the bright light in the sky', wrongs: ['a dark cloud', 'a cold wind', 'a tall tree'] },
            { word: 'cup', meaning: 'something you drink from', wrongs: ['something you sit on', 'something you wear', 'something you read'] },
            { word: 'pig', meaning: 'a pink farm animal', wrongs: ['a brown horse', 'a white rabbit', 'a black bird'] },
            { word: 'bus', meaning: 'a big car that carries many people', wrongs: ['a small bike', 'a toy boat', 'a paper plane'] },
            { word: 'map', meaning: 'shows you where to go', wrongs: ['helps you sleep', 'makes you food', 'cleans your room'] },
            { word: 'rug', meaning: 'a soft thing on the floor', wrongs: ['a hard thing on a wall', 'a wet thing in a pool', 'a cold thing in a fridge'] },
            { word: 'pen', meaning: 'something you write with', wrongs: ['something you eat with', 'something you play with', 'something you sleep in'] },
            { word: 'box', meaning: 'you put things inside it', wrongs: ['you sit on top of it', 'you eat it for lunch', 'you wear it on your feet'] },
            { word: 'top', meaning: 'the highest part', wrongs: ['the lowest part', 'the middle part', 'the side part'] },
            { word: 'hen', meaning: 'a farm bird that lays eggs', wrongs: ['a fish that swims', 'a bug that flies', 'a frog that hops'] },
            { word: 'fox', meaning: 'a wild animal with a bushy tail', wrongs: ['a pet with long ears', 'a bird with big wings', 'a fish with bright scales'] },
            { word: 'jam', meaning: 'a sweet spread for bread', wrongs: ['a cold drink', 'a hard candy', 'a salty chip'] },
            // V37: 20 more CVC words for variety
            { word: 'van', meaning: 'a big car for carrying things', wrongs: ['a small bike', 'a fast boat', 'a tall tower'] },
            { word: 'net', meaning: 'catches fish or balls', wrongs: ['holds water', 'makes noise', 'gives light'] },
            { word: 'mop', meaning: 'cleans the floor', wrongs: ['cleans the sky', 'cleans the car', 'cleans your teeth'] },
            { word: 'jug', meaning: 'holds water or juice', wrongs: ['holds books', 'holds toys', 'holds shoes'] },
            { word: 'web', meaning: 'a spider makes this', wrongs: ['a bird makes this', 'a dog makes this', 'a fish makes this'] },
            { word: 'bib', meaning: 'a baby wears this when eating', wrongs: ['a baby wears on feet', 'a baby wears on head', 'a baby sleeps on this'] },
            { word: 'fin', meaning: 'helps a fish swim', wrongs: ['helps a bird fly', 'helps a dog run', 'helps a cat jump'] },
            { word: 'tub', meaning: 'where you take a bath', wrongs: ['where you eat food', 'where you play ball', 'where you read books'] },
            { word: 'log', meaning: 'a piece of a tree', wrongs: ['a piece of a rock', 'a piece of a cloud', 'a piece of water'] },
            { word: 'hut', meaning: 'a small house', wrongs: ['a big castle', 'a tall tower', 'a deep cave'] },
            { word: 'cob', meaning: 'corn grows on this', wrongs: ['apples grow on this', 'grapes grow on this', 'rice grows on this'] },
            { word: 'kit', meaning: 'a set of tools or supplies', wrongs: ['a type of food', 'a kind of animal', 'a color of paint'] },
            { word: 'yam', meaning: 'a vegetable like a sweet potato', wrongs: ['a fruit like an apple', 'a drink like milk', 'a meat like chicken'] },
            { word: 'rod', meaning: 'a thin stick or pole', wrongs: ['a round ball', 'a flat plate', 'a soft pillow'] },
            { word: 'cub', meaning: 'a baby bear', wrongs: ['a baby fish', 'a baby bird', 'a baby bug'] },
            { word: 'fig', meaning: 'a small sweet fruit', wrongs: ['a tall tree', 'a long vine', 'a sharp thorn'] },
            { word: 'dip', meaning: 'put something in and take it out', wrongs: ['throw it far away', 'break it into pieces', 'stack them up high'] },
            { word: 'dim', meaning: 'not very bright', wrongs: ['very loud', 'very fast', 'very tall'] },
            { word: 'nap', meaning: 'a short sleep', wrongs: ['a long walk', 'a fast run', 'a big meal'] },
            { word: 'pod', meaning: 'where peas grow', wrongs: ['where birds live', 'where fish swim', 'where dogs sleep'] }
        ],
        // V5.7: Phoneme segmenting data — break words into sounds
        segmenting: [
            { word: 'cat', sounds: ['c', 'a', 't'], count: 3 },
            { word: 'dog', sounds: ['d', 'o', 'g'], count: 3 },
            { word: 'sun', sounds: ['s', 'u', 'n'], count: 3 },
            { word: 'hat', sounds: ['h', 'a', 't'], count: 3 },
            { word: 'pig', sounds: ['p', 'i', 'g'], count: 3 },
            { word: 'bed', sounds: ['b', 'e', 'd'], count: 3 },
            { word: 'cup', sounds: ['c', 'u', 'p'], count: 3 },
            { word: 'net', sounds: ['n', 'e', 't'], count: 3 },
            { word: 'fox', sounds: ['f', 'o', 'x'], count: 3 },
            { word: 'map', sounds: ['m', 'a', 'p'], count: 3 },
            { word: 'ship', sounds: ['sh', 'i', 'p'], count: 3 },
            { word: 'chin', sounds: ['ch', 'i', 'n'], count: 3 },
            { word: 'fish', sounds: ['f', 'i', 'sh'], count: 3 },
            { word: 'thin', sounds: ['th', 'i', 'n'], count: 3 },
            { word: 'flag', sounds: ['f', 'l', 'a', 'g'], count: 4 },
            { word: 'stop', sounds: ['s', 't', 'o', 'p'], count: 4 },
            { word: 'drum', sounds: ['d', 'r', 'u', 'm'], count: 4 },
            { word: 'swim', sounds: ['s', 'w', 'i', 'm'], count: 4 }
        ],
        // V5.7: Phoneme blending data — combine sounds into words
        blending: [
            { sounds: '/k/ /a/ /t/', word: 'cat', wrongs: ['bat', 'cut', 'kit'] },
            { sounds: '/d/ /o/ /g/', word: 'dog', wrongs: ['dig', 'dug', 'log'] },
            { sounds: '/s/ /u/ /n/', word: 'sun', wrongs: ['sin', 'son', 'sat'] },
            { sounds: '/h/ /a/ /t/', word: 'hat', wrongs: ['hot', 'hit', 'hut'] },
            { sounds: '/p/ /i/ /g/', word: 'pig', wrongs: ['peg', 'pug', 'big'] },
            { sounds: '/b/ /e/ /d/', word: 'bed', wrongs: ['bad', 'bid', 'bud'] },
            { sounds: '/r/ /u/ /n/', word: 'run', wrongs: ['ran', 'fun', 'bun'] },
            { sounds: '/m/ /a/ /p/', word: 'map', wrongs: ['mop', 'cap', 'mat'] },
            { sounds: '/f/ /i/ /sh/', word: 'fish', wrongs: ['dish', 'fist', 'fin'] },
            { sounds: '/sh/ /i/ /p/', word: 'ship', wrongs: ['shop', 'chip', 'shin'] },
            { sounds: '/ch/ /i/ /n/', word: 'chin', wrongs: ['chain', 'shin', 'pin'] },
            { sounds: '/b/ /u/ /g/', word: 'bug', wrongs: ['bag', 'big', 'dug'] },
            { sounds: '/n/ /e/ /t/', word: 'net', wrongs: ['nut', 'not', 'pet'] },
            { sounds: '/t/ /o/ /p/', word: 'top', wrongs: ['tap', 'tip', 'pop'] },
            { sounds: '/j/ /a/ /m/', word: 'jam', wrongs: ['ham', 'gym', 'jet'] },
            { sounds: '/w/ /i/ /n/', word: 'win', wrongs: ['bin', 'wig', 'wet'] }
        ],
        // V5.8: Expanded nonsense/pseudo-word decoding (50+ CVC/VC words — FastBridge format)
        nonsense: [
            { word: 'bim', rhymesWith: 'dim', wrongs: ['bam', 'bum', 'bem'] },
            { word: 'tup', rhymesWith: 'cup', wrongs: ['tap', 'tip', 'top'] },
            { word: 'rav', rhymesWith: 'have', wrongs: ['riv', 'ruv', 'rev'] },
            { word: 'nef', rhymesWith: 'chef', wrongs: ['naf', 'nof', 'nuf'] },
            { word: 'pid', rhymesWith: 'kid', wrongs: ['pad', 'pod', 'pud'] },
            { word: 'gop', rhymesWith: 'hop', wrongs: ['gap', 'gip', 'gup'] },
            { word: 'zat', rhymesWith: 'cat', wrongs: ['zit', 'zot', 'zut'] },
            { word: 'hig', rhymesWith: 'big', wrongs: ['hag', 'hog', 'hug'] },
            { word: 'wem', rhymesWith: 'hem', wrongs: ['wam', 'wim', 'wum'] },
            { word: 'fob', rhymesWith: 'job', wrongs: ['fab', 'fib', 'fub'] },
            { word: 'dun', rhymesWith: 'fun', wrongs: ['dan', 'din', 'den'] },
            { word: 'kep', rhymesWith: 'step', wrongs: ['kap', 'kip', 'kop'] },
            { word: 'vat', rhymesWith: 'bat', wrongs: ['vit', 'vot', 'vut'] },
            { word: 'jum', rhymesWith: 'gum', wrongs: ['jam', 'jim', 'jem'] },
            { word: 'sib', rhymesWith: 'rib', wrongs: ['sab', 'sob', 'sub'] },
            { word: 'mog', rhymesWith: 'dog', wrongs: ['mag', 'mig', 'mug'] },
            { word: 'fen', rhymesWith: 'hen', wrongs: ['fan', 'fin', 'fun'] },
            { word: 'lup', rhymesWith: 'pup', wrongs: ['lap', 'lip', 'lop'] },
            { word: 'dit', rhymesWith: 'sit', wrongs: ['dat', 'dot', 'dut'] },
            { word: 'pag', rhymesWith: 'bag', wrongs: ['pig', 'pog', 'pug'] },
            { word: 'nob', rhymesWith: 'rob', wrongs: ['nab', 'nib', 'nub'] },
            { word: 'wot', rhymesWith: 'hot', wrongs: ['wat', 'wit', 'wut'] },
            { word: 'gim', rhymesWith: 'him', wrongs: ['gam', 'gom', 'gum'] },
            { word: 'hep', rhymesWith: 'pep', wrongs: ['hap', 'hip', 'hop'] },
            { word: 'zug', rhymesWith: 'bug', wrongs: ['zag', 'zig', 'zog'] },
            { word: 'ket', rhymesWith: 'pet', wrongs: ['kat', 'kit', 'kot'] },
            { word: 'bof', rhymesWith: 'off', wrongs: ['baf', 'bif', 'buf'] },
            { word: 'rud', rhymesWith: 'mud', wrongs: ['rad', 'rid', 'rod'] },
            { word: 'tas', rhymesWith: 'has', wrongs: ['tis', 'tos', 'tus'] },
            { word: 'mip', rhymesWith: 'tip', wrongs: ['map', 'mop', 'mup'] },
            { word: 'dop', rhymesWith: 'pop', wrongs: ['dap', 'dip', 'dup'] },
            { word: 'fid', rhymesWith: 'lid', wrongs: ['fad', 'fod', 'fud'] },
            { word: 'nup', rhymesWith: 'cup', wrongs: ['nap', 'nip', 'nop'] },
            { word: 'gub', rhymesWith: 'tub', wrongs: ['gab', 'gib', 'gob'] },
            { word: 'hin', rhymesWith: 'pin', wrongs: ['han', 'hon', 'hun'] },
            { word: 'vog', rhymesWith: 'fog', wrongs: ['vag', 'vig', 'vug'] },
            { word: 'jep', rhymesWith: 'rep', wrongs: ['jap', 'jip', 'jop'] },
            { word: 'wab', rhymesWith: 'cab', wrongs: ['wib', 'wob', 'wub'] },
            { word: 'zin', rhymesWith: 'fin', wrongs: ['zan', 'zon', 'zun'] },
            { word: 'kut', rhymesWith: 'but', wrongs: ['kat', 'kit', 'kot'] },
            { word: 'sog', rhymesWith: 'log', wrongs: ['sag', 'sig', 'sug'] },
            { word: 'lam', rhymesWith: 'jam', wrongs: ['lim', 'lom', 'lum'] },
            { word: 'pem', rhymesWith: 'gem', wrongs: ['pam', 'pim', 'pom'] },
            { word: 'tib', rhymesWith: 'bib', wrongs: ['tab', 'tob', 'tub'] },
            { word: 'rof', rhymesWith: 'off', wrongs: ['raf', 'rif', 'ruf'] },
            { word: 'bun', rhymesWith: 'sun', wrongs: ['ban', 'bin', 'bon'] },
            { word: 'dak', rhymesWith: 'back', wrongs: ['dik', 'dok', 'duk'] },
            { word: 'feb', rhymesWith: 'web', wrongs: ['fab', 'fib', 'fub'] },
            { word: 'gat', rhymesWith: 'mat', wrongs: ['git', 'got', 'gut'] },
            { word: 'hod', rhymesWith: 'rod', wrongs: ['had', 'hid', 'hud'] },
            // VC words (vowel-consonant)
            { word: 'om', rhymesWith: 'mom', wrongs: ['am', 'im', 'um'] },
            { word: 'ab', rhymesWith: 'cab', wrongs: ['ib', 'ob', 'ub'] },
            { word: 'ig', rhymesWith: 'big', wrongs: ['ag', 'og', 'ug'] },
            { word: 'ut', rhymesWith: 'but', wrongs: ['at', 'it', 'ot'] },
            { word: 'en', rhymesWith: 'pen', wrongs: ['an', 'in', 'on'] }
        ],
        // V5.7: Letter sounds (distinct from letter names)
        letterSounds: [
            { letter: 'A', sound: '/a/', example: 'apple', wrong: ['/e/', '/i/', '/o/'] },
            { letter: 'B', sound: '/b/', example: 'ball', wrong: ['/d/', '/p/', '/g/'] },
            { letter: 'C', sound: '/k/', example: 'cat', wrong: ['/s/', '/t/', '/g/'] },
            { letter: 'D', sound: '/d/', example: 'dog', wrong: ['/b/', '/t/', '/g/'] },
            { letter: 'E', sound: '/e/', example: 'egg', wrong: ['/a/', '/i/', '/u/'] },
            { letter: 'F', sound: '/f/', example: 'fish', wrong: ['/v/', '/th/', '/s/'] },
            { letter: 'G', sound: '/g/', example: 'goat', wrong: ['/k/', '/j/', '/d/'] },
            { letter: 'H', sound: '/h/', example: 'hat', wrong: ['/f/', '/w/', '/k/'] },
            { letter: 'I', sound: '/i/', example: 'igloo', wrong: ['/e/', '/a/', '/u/'] },
            { letter: 'J', sound: '/j/', example: 'jump', wrong: ['/g/', '/ch/', '/y/'] },
            { letter: 'K', sound: '/k/', example: 'kite', wrong: ['/g/', '/t/', '/p/'] },
            { letter: 'L', sound: '/l/', example: 'lion', wrong: ['/r/', '/w/', '/n/'] },
            { letter: 'M', sound: '/m/', example: 'moon', wrong: ['/n/', '/b/', '/w/'] },
            { letter: 'N', sound: '/n/', example: 'nest', wrong: ['/m/', '/l/', '/d/'] },
            { letter: 'O', sound: '/o/', example: 'octopus', wrong: ['/u/', '/a/', '/e/'] },
            { letter: 'P', sound: '/p/', example: 'pig', wrong: ['/b/', '/t/', '/d/'] },
            { letter: 'R', sound: '/r/', example: 'rain', wrong: ['/l/', '/w/', '/n/'] },
            { letter: 'S', sound: '/s/', example: 'sun', wrong: ['/z/', '/sh/', '/f/'] },
            { letter: 'T', sound: '/t/', example: 'tree', wrong: ['/d/', '/k/', '/p/'] },
            { letter: 'U', sound: '/u/', example: 'umbrella', wrong: ['/o/', '/a/', '/i/'] },
            { letter: 'V', sound: '/v/', example: 'van', wrong: ['/f/', '/b/', '/w/'] },
            { letter: 'W', sound: '/w/', example: 'water', wrong: ['/v/', '/r/', '/y/'] },
            { letter: 'Y', sound: '/y/', example: 'yellow', wrong: ['/j/', '/w/', '/l/'] },
            { letter: 'Z', sound: '/z/', example: 'zebra', wrong: ['/s/', '/j/', '/v/'] },
            // V5.8: Digraphs (FastBridge tested)
            { letter: 'CH', sound: '/ch/', example: 'chair', wrong: ['/sh/', '/th/', '/k/'] },
            { letter: 'SH', sound: '/sh/', example: 'ship', wrong: ['/ch/', '/s/', '/th/'] },
            { letter: 'TH', sound: '/th/', example: 'think', wrong: ['/t/', '/f/', '/sh/'] },
            { letter: 'WH', sound: '/wh/', example: 'whale', wrong: ['/w/', '/h/', '/ch/'] }
        ],
        // V5.5: Word families — ending sound patterns
        wordFamilies: [
            { ending: '-at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat'] },
            { ending: '-an', words: ['can', 'fan', 'man', 'pan', 'ran', 'van', 'tan', 'ban'] },
            { ending: '-ig', words: ['big', 'dig', 'fig', 'pig', 'wig', 'jig'] },
            { ending: '-in', words: ['bin', 'fin', 'pin', 'tin', 'win', 'din'] },
            { ending: '-op', words: ['hop', 'mop', 'pop', 'top', 'cop', 'stop'] },
            { ending: '-ot', words: ['dot', 'got', 'hot', 'lot', 'not', 'pot'] },
            { ending: '-ug', words: ['bug', 'dug', 'hug', 'jug', 'mug', 'rug', 'tug'] },
            { ending: '-un', words: ['bun', 'fun', 'gun', 'run', 'sun'] },
            { ending: '-ed', words: ['bed', 'fed', 'led', 'red', 'wed'] },
            { ending: '-et', words: ['bet', 'get', 'jet', 'met', 'net', 'pet', 'set', 'wet'] }
        ]
    },

    _phonics(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._phonics2nd(level);

        if (level < 2) {
            // Pre-K: Beginning sounds only with simple words
            const preKWords = [
                { word: 'Cat', letter: 'C', wrongs: ['D', 'B', 'M'] },
                { word: 'Dog', letter: 'D', wrongs: ['C', 'B', 'F'] },
                { word: 'Ball', letter: 'B', wrongs: ['D', 'M', 'S'] },
                { word: 'Fish', letter: 'F', wrongs: ['S', 'H', 'M'] },
                { word: 'Sun', letter: 'S', wrongs: ['M', 'F', 'H'] },
                { word: 'Milk', letter: 'M', wrongs: ['S', 'B', 'D'] },
                { word: 'Hat', letter: 'H', wrongs: ['M', 'B', 'F'] },
                { word: 'Pig', letter: 'P', wrongs: ['B', 'D', 'M'] },
                { word: 'Top', letter: 'T', wrongs: ['P', 'D', 'B'] },
                { word: 'Red', letter: 'R', wrongs: ['B', 'D', 'M'] },
                { word: 'Nest', letter: 'N', wrongs: ['M', 'B', 'D'] },
                { word: 'Goat', letter: 'G', wrongs: ['D', 'B', 'P'] },
                { word: 'Kite', letter: 'K', wrongs: ['T', 'P', 'B'] },
                { word: 'Lion', letter: 'L', wrongs: ['M', 'N', 'R'] },
                { word: 'Van', letter: 'V', wrongs: ['B', 'F', 'M'] },
                { word: 'Web', letter: 'W', wrongs: ['V', 'M', 'B'] },
                { word: 'Jam', letter: 'J', wrongs: ['G', 'D', 'B'] },
                { word: 'Yak', letter: 'Y', wrongs: ['W', 'V', 'J'] },
                { word: 'Zip', letter: 'Z', wrongs: ['S', 'V', 'J'] }
            ];
            const item = preKWords[this._rand(0, preKWords.length - 1)];
            const answers = this._shuffle([item.letter, ...item.wrongs]);

            return {
                question: `What sound does "${item.word}" start with?`,
                questionSpeak: `What sound does ${item.word} start with?`,
                answers,
                correctIndex: answers.indexOf(item.letter),
                topic: 'phonics',
                subtype: 'beginning-sound-prek',
                explanation: `"${item.word}" starts with ${item.letter}! ${item.letter}, ${item.letter}, ${item.word}!`,
                explanationSpeak: `${item.word} starts with ${item.letter}! ${item.letter}, ${item.letter}, ${item.word}!`
            };
        } else if (level <= 3) {
            // K level: distributed across sub-types
            const roll = Math.random();
            if (roll < 0.15) {
                return this._cvcDecoding();
            } else if (roll < 0.30) {
                return this._wordFamilyQuestion();
            } else if (roll < 0.45) {
                return this._phonemeSegmenting();
            } else if (roll < 0.60) {
                return this._phonemeBlending();
            } else if (roll < 0.70) {
                return this._nonsenseWordDecoding();
            } else if (roll < 0.80) {
                return this._letterSoundQuestion();
            }
            // 20% beginning sounds
            const item = this._phonicsData.beginning[this._rand(0, this._phonicsData.beginning.length - 1)];
            const correctWord = item.words[this._rand(0, item.words.length - 1)];
            const wrongs = this._shuffle(item.wrong).slice(0, 3);
            const answers = this._shuffle([correctWord, ...wrongs]);

            return {
                question: `Which word starts with the "${item.letter}" sound?`,
                questionSpeak: `Which word starts with the ${item.letter} sound?`,
                answers,
                correctIndex: answers.indexOf(correctWord),
                topic: 'phonics',
                subtype: 'beginning-sound',
                explanation: `"${correctWord}" starts with the ${item.letter} sound! ${item.letter}, ${item.letter}, ${correctWord}!`,
                explanationSpeak: `${correctWord} starts with the ${item.letter} sound! ${item.letter}, ${item.letter}, ${correctWord}!`
            };
        } else {
            // 1st grade (level >= 4): blends + advanced phonics
            const roll = Math.random();
            if (roll < 0.15) {
                return this._phonemeSegmenting();
            } else if (roll < 0.30) {
                return this._phonemeBlending();
            } else if (roll < 0.45) {
                return this._nonsenseWordDecoding();
            }
            // 55% blends
            const item = this._phonicsData.blends[this._rand(0, this._phonicsData.blends.length - 1)];
            const correctWord = item.words[this._rand(0, item.words.length - 1)];
            const wrongs = this._shuffle(item.wrong).slice(0, 3);
            const answers = this._shuffle([correctWord, ...wrongs]);

            return {
                question: `Which word starts with "${item.blend}"?`,
                questionSpeak: `Which word starts with ${item.blend}?`,
                answers,
                correctIndex: answers.indexOf(correctWord),
                topic: 'phonics',
                subtype: 'blend-match',
                explanation: `"${correctWord}" starts with the ${item.blend} sound! Listen: ${item.blend}... ${correctWord}!`,
                explanationSpeak: `${correctWord} starts with the ${item.blend} sound! Listen: ${item.blend}, ${correctWord}!`
            };
        }
    },

    // V5.5: Word family question — "Which word rhymes with / ends with -at?"
    _wordFamilyQuestion() {
        const families = this._phonicsData.wordFamilies;
        const family = families[this._rand(0, families.length - 1)];
        const correctWord = family.words[this._rand(0, family.words.length - 1)];

        // Get wrong answers from OTHER families
        const otherFamilies = families.filter(f => f.ending !== family.ending);
        const wrongs = [];
        let _sa5 = 0;
        while (wrongs.length < 3 && _sa5++ < 50) {
            const otherFam = otherFamilies[this._rand(0, otherFamilies.length - 1)];
            const w = otherFam.words[this._rand(0, otherFam.words.length - 1)];
            if (!wrongs.includes(w) && w !== correctWord) wrongs.push(w);
        }
        const answers = this._shuffle([correctWord, ...wrongs]);

        return {
            question: `Which word ends with "${family.ending}"?`,
            questionSpeak: `Which word ends with ${family.ending.replace('-', '')}?`,
            answers,
            correctIndex: answers.indexOf(correctWord),
            topic: 'phonics',
            subtype: 'word-family',
            explanation: `"${correctWord}" ends with ${family.ending}! ${family.words.slice(0, 4).join(', ')} — they all rhyme!`,
            explanationSpeak: `${correctWord} ends with ${family.ending.replace('-', '')}! ${family.words.slice(0, 4).join(', ')} — they all rhyme!`
        };
    },

    // CVC word decoding — "Sound it out!"
    _cvcDecoding() {
        const cvc = this._phonicsData.cvc;
        const item = cvc[this._rand(0, cvc.length - 1)];
        const answers = this._shuffle([item.meaning, ...item.wrongs]);
        const letters = item.word.split('').join(' - ');

        return {
            question: `Sound it out!\n${item.word.toUpperCase()}\nWhat does this word mean?`,
            questionSpeak: `Sound it out! ${letters}. ${item.word}. What does this word mean?`,
            answers,
            correctIndex: answers.indexOf(item.meaning),
            topic: 'phonics',
            subtype: 'cvc-decoding',
            explanation: `"${item.word}" means ${item.meaning}! Sound it out: ${letters}, ${item.word}!`,
            explanationSpeak: `${item.word} means ${item.meaning}! Sound it out: ${letters}, ${item.word}!`
        };
    },

    // ---- SIGHT WORDS ----
    // V5.8: Complete Dolch sight word lists
    _sightWordLists: {
        preprimer: ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
            'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
            'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
            'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'],
        // V37: Expanded primer from 52 to 65 words
        primer: ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
            'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
            'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
            'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
            'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
            'with', 'yes', 'also', 'very', 'only', 'much', 'each', 'then', 'best', 'back',
            'done', 'fast', 'full', 'last', 'give'],
        // V37: Expanded first from 41 to 60 words
        first: ['after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
            'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
            'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
            'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
            'when', 'would', 'right', 'about', 'never', 'made', 'before', 'read', 'always',
            'does', 'upon', 'been', 'both', 'which', 'many', 'long', 'first', 'write', 'their']
    },

    _sightWords(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._sightWords2nd(level);

        // Pre-K: Expanded 20-word pool, 2 template types
        if (level < 2) {
            // V37: Expanded from 20 to 40 Pre-K sight words
            const preKPool = ['I', 'a', 'the', 'is', 'my', 'go', 'no', 'yes', 'me', 'it',
                'to', 'up', 'we', 'he', 'in', 'on', 'am', 'at', 'an', 'do',
                'so', 'or', 'if', 'by', 'be', 'of', 'as', 'us', 'hi', 'oh',
                'see', 'run', 'big', 'can', 'you', 'and', 'not', 'but', 'all', 'red'];
            const target = preKPool[this._rand(0, preKPool.length - 1)];
            const wrongs = [];
            let _sa6 = 0;
            while (wrongs.length < 3 && _sa6++ < 50) {
                const w = preKPool[this._rand(0, preKPool.length - 1)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);

            if (Math.random() < 0.5) {
                return {
                    question: `Which word says "${target}"?`,
                    questionSpeak: `Which word says ${target}?`,
                    answers,
                    correctIndex: answers.indexOf(target),
                    topic: 'sight-words',
                    subtype: 'read-word-prek',
                    explanation: `That word says "${target}"! Let's say it: ${target}!`,
                    explanationSpeak: `That word says ${target}! Let's say it: ${target}!`
                };
            } else {
                return {
                    question: `Point to the word:\n"${target}"`,
                    questionSpeak: `Point to the word ${target}!`,
                    answers,
                    correctIndex: answers.indexOf(target),
                    topic: 'sight-words',
                    subtype: 'point-to-word-prek',
                    explanation: `You found "${target}"! Great reading!`,
                    explanationSpeak: `You found ${target}! Great reading!`
                };
            }
        }

        const pool = level <= 3
            ? this._sightWordLists.preprimer
            : [...this._sightWordLists.primer, ...this._sightWordLists.first];

        const target = pool[this._rand(0, pool.length - 1)];

        // V3: Fill-the-sentence format
        if (level >= 4 && Math.random() < 0.3) {
            return this._sightWordSentence(target, pool);
        }

        if (Math.random() < 0.5) {
            const wrongs = [];
            let _sa7 = 0;
            while (wrongs.length < 3 && _sa7++ < 50) {
                const w = pool[this._rand(0, pool.length - 1)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);
            return {
                question: `Find the word:\n"${target}"`,
                questionSpeak: `Find the word: ${target}`,
                answers,
                correctIndex: answers.indexOf(target),
                topic: 'sight-words',
                subtype: 'find-word',
                explanation: `The word is "${target}"! Let's spell it: ${target.split('').join(', ')}. ${target}!`,
                explanationSpeak: `The word is ${target}! Let's spell it: ${target.split('').join(', ')}. ${target}!`
            };
        } else {
            const wrongs = [];
            let _sa8 = 0;
            while (wrongs.length < 3 && _sa8++ < 50) {
                const w = pool[this._rand(0, pool.length - 1)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);
            return {
                // V5.7: Show the word visually as fallback when TTS is unavailable
                question: `Find the word:\n"${target}"`,
                questionSpeak: `Tap the word: ${target}`,
                answers,
                correctIndex: answers.indexOf(target),
                topic: 'sight-words',
                subtype: 'read-word',
                explanation: `The word was "${target}"! Remember what it looks like: ${target}!`,
                explanationSpeak: `The word was ${target}! Remember what it looks like: ${target}!`
            };
        }
    },

    // V5.8: Expanded fill-in-the-sentence sight words (100+ templates)
    _sightWordSentence(target, pool) {
        const templates = {
            // Pre-Primer
            'a': 'I see ___ cat.', 'and': 'Mom ___ Dad.', 'away': 'Run ___!',
            'big': 'The dog is ___.', 'blue': 'The sky is ___.', 'can': 'I ___ run!',
            'come': '___ here please!', 'down': 'Sit ___ now.', 'find': 'Can you ___ it?',
            'for': 'This is ___ you.', 'funny': 'That is ___!', 'go': 'Time to ___.',
            'help': 'Please ___ me.', 'here': 'Come ___ now.', 'I': '___ like cats.',
            'in': 'Fish ___ water.', 'is': 'He ___ fast.', 'it': 'I see ___.',
            'jump': 'I can ___!', 'little': 'A ___ bird.', 'look': '___ at me!',
            'make': 'I ___ a cake.', 'me': 'Help ___!', 'my': '___ dog is big.',
            'not': 'I am ___ sad.', 'one': 'I have ___ hat.', 'play': 'Let us ___!',
            'red': 'The ball is ___.', 'run': 'I can ___!', 'said': '"Hi!" she ___.',
            'see': 'I ___ a bird.', 'the': '___ cat is big.', 'three': 'I have ___ toys.',
            'to': 'Go ___ bed.', 'two': 'I see ___ cats.', 'up': 'Look ___!',
            'we': '___ like to play.', 'where': '___ is my hat?', 'yellow': 'The sun is ___.',
            'you': 'Are ___ happy?',
            // Primer
            'all': 'We ___ play.', 'am': 'I ___ happy.', 'are': 'They ___ fun.',
            'at': 'Look ___ this!', 'ate': 'I ___ lunch.', 'be': 'I want to ___ good.',
            'black': 'The cat is ___.', 'brown': 'The dog is ___.', 'but': 'I like cats ___ not dogs.',
            'came': 'She ___ to school.', 'did': '___ you see it?', 'do': 'What ___ you want?',
            'eat': 'I ___ apples.', 'four': 'I have ___ pets.', 'get': 'I ___ a treat!',
            'good': 'That is ___!', 'have': 'I ___ a dog.', 'he': '___ is my friend.',
            'into': 'Jump ___ the pool!', 'like': 'I ___ cats.', 'must': 'You ___ be kind.',
            'new': 'I got a ___ toy.', 'no': 'She said ___.', 'now': 'Do it ___!',
            'on': 'Sit ___ the chair.', 'our': '___ dog is fun.', 'out': 'Go ___ and play.',
            'please': 'Can I go ___?', 'pretty': 'The flower is ___.', 'ran': 'He ___ fast.',
            'ride': 'I ___ my bike.', 'saw': 'I ___ a bird.', 'say': 'What did you ___?',
            'she': '___ is my sister.', 'so': 'I am ___ happy!', 'soon': 'We go home ___.',
            'that': 'I want ___ one.', 'there': 'Look over ___.', 'they': '___ play outside.',
            'this': 'I like ___ book.', 'too': 'Me ___!', 'under': 'The cat is ___ the bed.',
            'want': 'I ___ a snack.', 'was': 'He ___ happy.', 'well': 'She reads ___.',
            'went': 'We ___ to the park.', 'what': '___ is that?', 'white': 'The snow is ___.',
            'who': '___ is it?', 'will': 'I ___ help you.', 'with': 'Play ___ me.',
            'yes': 'She said ___!',
            // First Grade
            'after': '___ school we play.', 'again': 'Do it ___!', 'an': 'I ate ___ apple.',
            'any': 'Do you have ___?', 'as': 'Fast ___ a cheetah!', 'ask': 'I will ___ Mom.',
            'by': 'He ran ___ me.', 'could': 'I ___ do it!', 'every': 'I go ___ day.',
            'fly': 'Birds can ___.', 'from': 'A gift ___ Mom.', 'give': 'I ___ you a hug.',
            'going': 'I am ___ home.', 'had': 'She ___ fun.', 'has': 'He ___ a toy.',
            'her': 'I like ___ hat.', 'him': 'I see ___.', 'his': 'That is ___ dog.',
            'how': '___ are you?', 'just': 'I ___ got here!', 'know': 'I ___ the answer.',
            'let': '___ me try!', 'live': 'I ___ here.', 'may': '___ I go now?',
            'of': 'A cup ___ water.', 'old': 'My cat is ___.', 'once': '___ upon a time...',
            'open': '___ the door.', 'over': 'Jump ___ it!', 'put': '___ it away.',
            'round': 'The ball is ___.', 'some': 'I want ___ cake.', 'stop': '___ the car!',
            'take': '___ one please.', 'thank': '___ you so much!', 'them': 'I see ___.',
            'then': 'Eat, ___ play.', 'think': 'I ___ so too!', 'walk': 'I ___ to school.',
            'were': 'We ___ happy.', 'when': '___ is lunch?'
        };

        // V31: Alternate sentence variants for variety
        const alts = {
            'a': 'I have ___ pet.', 'big': 'What ___ teeth you have!', 'can': '___ you see me?',
            'go': 'We ___ to school.', 'I': '___ am happy.', 'is': 'She ___ nice.',
            'see': 'Can you ___ it?', 'the': 'I pet ___ dog.', 'run': '___ to the door!',
            'like': 'Do you ___ it?', 'have': 'Do you ___ a pet?', 'come': 'Can you ___?',
            'look': '___ over there!', 'play': 'We ___ games.', 'said': '"Wow!" he ___.',
            'was': 'She ___ running.', 'they': '___ are friends.', 'with': 'Come ___ us.',
            'went': 'She ___ to sleep.', 'what': '___ time is it?', 'are': 'You ___ so kind.',
            'eat': 'We ___ lunch now.', 'good': 'You are ___!', 'he': '___ runs fast.',
            'she': '___ likes books.', 'do': '___ your best!', 'my': 'This is ___ book.',
        };

        let sentence = templates[target];
        if (sentence && alts[target] && Math.random() < 0.4) {
            sentence = alts[target];
        }
        if (!sentence) {
            // Fallback
            const wrongs = [];
            let _sa9 = 0;
            while (wrongs.length < 3 && _sa9++ < 50) {
                const w = pool[this._rand(0, pool.length - 1)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);
            return {
                question: `Find the word:\n"${target}"`,
                questionSpeak: `Find the word: ${target}`,
                answers,
                correctIndex: answers.indexOf(target),
                topic: 'sight-words',
                subtype: 'find-word-fallback',
                explanation: `The word is "${target}"!`,
                explanationSpeak: `The word is ${target}!`
            };
        }

        const wrongs = [];
        let _sa10 = 0;
        while (wrongs.length < 3 && _sa10++ < 50) {
            const w = pool[this._rand(0, pool.length - 1)];
            if (w !== target && !wrongs.includes(w)) wrongs.push(w);
        }
        const answers = this._shuffle([target, ...wrongs]);
        const full = sentence.replace('___', target);

        return {
            question: `Fill in the blank:\n"${sentence}"`,
            questionSpeak: `Fill in the blank: ${sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(target),
            topic: 'sight-words',
            subtype: 'sentence-fill',
            explanation: `"${full}" — "${target}" fits in the blank!`,
            explanationSpeak: `${full}. The word ${target} fits in the blank!`
        };
    },

    // ---- RHYMING ----
    _rhymeSets: [
        ['cat', 'hat', 'bat', 'mat', 'sat', 'rat'],
        ['dog', 'log', 'fog', 'hog', 'jog'],
        ['sun', 'run', 'fun', 'bun', 'gun'],
        ['bed', 'red', 'fed', 'led', 'wed'],
        ['car', 'star', 'far', 'jar', 'bar'],
        ['top', 'hop', 'pop', 'mop', 'stop'],
        ['cake', 'make', 'lake', 'bake', 'take'],
        ['day', 'play', 'say', 'way', 'may'],
        ['ball', 'tall', 'wall', 'call', 'fall'],
        ['ring', 'sing', 'king', 'wing', 'thing'],
        ['book', 'look', 'cook', 'hook', 'took'],
        ['tree', 'free', 'see', 'bee', 'three'],
        ['night', 'light', 'right', 'fight', 'might'],
        ['rain', 'train', 'brain', 'main', 'pain'],
        ['boat', 'coat', 'goat', 'float', 'moat'],
        // V31: 10 new rhyme sets
        ['bug', 'hug', 'mug', 'rug', 'tug', 'jug'],
        ['lip', 'dip', 'hip', 'rip', 'sip', 'tip'],
        ['hop', 'cop', 'drop', 'shop', 'chop'],
        ['cap', 'map', 'nap', 'tap', 'clap', 'snap'],
        ['pig', 'big', 'dig', 'fig', 'wig', 'jig'],
        ['nest', 'best', 'rest', 'test', 'west', 'vest'],
        ['rock', 'sock', 'clock', 'block', 'knock'],
        ['sand', 'hand', 'band', 'land', 'stand'],
        ['jump', 'bump', 'dump', 'pump', 'lump'],
        ['luck', 'duck', 'truck', 'stuck', 'buck']
    ],

    _rhyming(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._rhyming2nd(level);

        // Pre-K: 6 word families + "do these rhyme?" template
        if (level < 2) {
            const preKFamilies = [
                { family: '-at', words: ['cat', 'hat', 'bat', 'mat', 'sat', 'rat'] },
                { family: '-an', words: ['can', 'fan', 'man', 'pan', 'ran', 'van'] },
                { family: '-ig', words: ['big', 'dig', 'fig', 'pig', 'wig', 'jig'] },
                { family: '-ot', words: ['hot', 'pot', 'dot', 'got', 'lot', 'not'] },
                { family: '-un', words: ['fun', 'run', 'sun', 'bun', 'pun', 'gun'] },
                { family: '-ed', words: ['bed', 'red', 'fed', 'led', 'wed', 'ted'] },
                // V31: 4 new Pre-K families
                { family: '-op', words: ['hop', 'top', 'pop', 'mop', 'cop', 'stop'] },
                { family: '-ug', words: ['bug', 'hug', 'mug', 'rug', 'tug', 'jug'] },
                { family: '-ip', words: ['lip', 'dip', 'hip', 'rip', 'sip', 'tip'] },
                { family: '-ap', words: ['cap', 'map', 'nap', 'tap', 'lap', 'clap'] }
            ];

            if (Math.random() < 0.3) {
                // "Do these words rhyme?" yes/no format
                const fam1 = preKFamilies[this._rand(0, preKFamilies.length - 1)];
                const word1 = fam1.words[this._rand(0, fam1.words.length - 1)];
                let word2, doRhyme;
                if (Math.random() < 0.5) {
                    // Pick a rhyming word
                    do { word2 = fam1.words[this._rand(0, fam1.words.length - 1)]; } while (word2 === word1);
                    doRhyme = true;
                } else {
                    // Pick a non-rhyming word
                    const otherFam = preKFamilies.filter(f => f.family !== fam1.family);
                    const picked = otherFam[this._rand(0, otherFam.length - 1)];
                    word2 = picked.words[this._rand(0, picked.words.length - 1)];
                    doRhyme = false;
                }
                const correct = doRhyme ? 'Yes!' : 'No!';
                const answers = this._shuffle(['Yes!', 'No!', 'Maybe', 'I don\'t know']);
                return {
                    question: `Do "${word1}" and "${word2}" rhyme?`,
                    questionSpeak: `Do ${word1} and ${word2} rhyme?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'rhyming',
                    subtype: 'identify-rhyme',
                    explanation: doRhyme
                        ? `Yes! "${word1}" and "${word2}" rhyme! They both end the same way!`
                        : `No! "${word1}" and "${word2}" don't rhyme. They sound different at the end!`,
                    explanationSpeak: doRhyme
                        ? `Yes! ${word1} and ${word2} rhyme!`
                        : `No, ${word1} and ${word2} don't rhyme!`
                };
            }

            const fam = preKFamilies[this._rand(0, preKFamilies.length - 1)];
            const target = fam.words[this._rand(0, fam.words.length - 1)];
            let correct;
            do {
                correct = fam.words[this._rand(0, fam.words.length - 1)];
            } while (correct === target);

            const otherFams = preKFamilies.filter(f => f.family !== fam.family);
            const wrongs = [];
            let _sa11 = 0;
            while (wrongs.length < 3 && _sa11++ < 50) {
                const otherFam = otherFams[this._rand(0, otherFams.length - 1)];
                const w = otherFam.words[this._rand(0, otherFam.words.length - 1)];
                if (!wrongs.includes(w)) wrongs.push(w);
            }

            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What rhymes with "${target}"?`,
                questionSpeak: `What rhymes with ${target}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'rhyming',
                subtype: 'match-rhyme-prek',
                explanation: `"${correct}" rhymes with "${target}"! ${target}, ${correct} — they sound the same at the end!`,
                explanationSpeak: `${correct} rhymes with ${target}! ${target}, ${correct}, they sound the same at the end!`
            };
        }

        // V37: "Complete the rhyme" format (25% at K+)
        if (level >= 2 && Math.random() < 0.25) {
            const rhymingSentences = [
                { line: 'The cat sat on a ___', answer: 'mat', family: '-at', wrongs: ['dog', 'cup', 'bed'] },
                { line: 'I saw a man with a ___', answer: 'pan', family: '-an', wrongs: ['hat', 'dog', 'cup'] },
                { line: 'The big pig wore a ___', answer: 'wig', family: '-ig', wrongs: ['hat', 'coat', 'sock'] },
                { line: 'A bug gave me a ___', answer: 'hug', family: '-ug', wrongs: ['kiss', 'wave', 'bite'] },
                { line: 'The sun is so much ___', answer: 'fun', family: '-un', wrongs: ['big', 'hot', 'nice'] },
                { line: 'I found a fox in a ___', answer: 'box', family: '-ox', wrongs: ['cave', 'tree', 'den'] },
                { line: 'A funny bunny eats ___', answer: 'honey', family: '-unny', wrongs: ['bread', 'grass', 'cake'] },
                { line: 'A little fish made a ___', answer: 'wish', family: '-ish', wrongs: ['swim', 'jump', 'splash'] },
                { line: 'The night was full of ___', answer: 'light', family: '-ight', wrongs: ['dark', 'rain', 'cold'] },
                { line: 'I saw a snake by the ___', answer: 'lake', family: '-ake', wrongs: ['tree', 'road', 'hill'] },
                { line: 'A king began to ___', answer: 'sing', family: '-ing', wrongs: ['dance', 'run', 'eat'] },
                { line: 'A goat put on a ___', answer: 'coat', family: '-oat', wrongs: ['hat', 'shoe', 'belt'] },
                { line: 'I found a snail on the ___', answer: 'trail', family: '-ail', wrongs: ['rock', 'tree', 'grass'] },
                { line: 'The train came in the ___', answer: 'rain', family: '-ain', wrongs: ['snow', 'wind', 'dark'] }
            ];
            const rItem = rhymingSentences[this._rand(0, rhymingSentences.length - 1)];
            const answers = this._shuffle([rItem.answer, ...rItem.wrongs]);
            return {
                question: `🎵 Complete the rhyme:\n"${rItem.line}"`,
                questionSpeak: `Complete the rhyme: ${rItem.line.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(rItem.answer),
                topic: 'rhyming',
                subtype: 'complete-rhyme',
                explanation: `"${rItem.answer}" completes the rhyme! It rhymes because they share the ${rItem.family} sound!`,
                explanationSpeak: `${rItem.answer} completes the rhyme! They have the same ending sound!`
            };
        }

        // V3: Odd-one-out format
        if (level >= 4 && Math.random() < 0.3) {
            return this._rhymingOddOneOut();
        }

        const setIdx = this._rand(0, this._rhymeSets.length - 1);
        const set = this._rhymeSets[setIdx];
        const target = set[this._rand(0, set.length - 1)];

        let correct;
        do {
            correct = set[this._rand(0, set.length - 1)];
        } while (correct === target);

        const wrongs = [];
        let _sa12 = 0;
        while (wrongs.length < 3 && _sa12++ < 50) {
            const otherSet = this._rhymeSets[this._rand(0, this._rhymeSets.length - 1)];
            if (otherSet === set) continue;
            const w = otherSet[this._rand(0, otherSet.length - 1)];
            if (!wrongs.includes(w)) wrongs.push(w);
        }

        const answers = this._shuffle([correct, ...wrongs]);
        const ending = target.length >= 2 ? target.slice(-2) : target.slice(-1);

        return {
            question: `Which word rhymes with "${target}"?`,
            questionSpeak: `Which word rhymes with ${target}?`,
            answers,
            correctIndex: answers.indexOf(correct),
            topic: 'rhyming',
            subtype: 'match-rhyme',
            explanation: `"${correct}" rhymes with "${target}"! They both have the "${ending}" sound: ${target}, ${correct}!`,
            explanationSpeak: `${correct} rhymes with ${target}! They both end with the same sound: ${target}, ${correct}!`
        };
    },

    // V3: Odd-one-out rhyming
    _rhymingOddOneOut() {
        const setIdx = this._rand(0, this._rhymeSets.length - 1);
        const set = this._rhymeSets[setIdx];
        const rhymers = this._shuffle([...set]).slice(0, 3);
        let oddSet;
        do {
            oddSet = this._rhymeSets[this._rand(0, this._rhymeSets.length - 1)];
        } while (oddSet === set);
        const oddWord = oddSet[this._rand(0, oddSet.length - 1)];
        const answers = this._shuffle([...rhymers, oddWord]);

        return {
            question: `Which word does NOT rhyme?\n${answers.join(', ')}`,
            questionSpeak: `Which word does not rhyme? ${answers.join(', ')}`,
            answers,
            correctIndex: answers.indexOf(oddWord),
            topic: 'rhyming',
            subtype: 'odd-one-out',
            explanation: `"${oddWord}" does not rhyme! ${rhymers.join(', ')} all rhyme with each other!`,
            explanationSpeak: `${oddWord} does not rhyme! ${rhymers.join(', ')} all rhyme with each other!`
        };
    },

    // ---- SENTENCES ----
    _sentenceData: {
        k: [
            { sentence: 'The cat is ___', answer: 'big', wrongs: ['run', 'go', 'up'] },
            { sentence: 'I can ___', answer: 'run', wrongs: ['big', 'red', 'the'] },
            { sentence: 'We go ___', answer: 'up', wrongs: ['big', 'cat', 'red'] },
            { sentence: 'I see a ___', answer: 'dog', wrongs: ['run', 'is', 'go'] },
            { sentence: 'The sun is ___', answer: 'hot', wrongs: ['run', 'go', 'see'] },
            { sentence: 'She is my ___', answer: 'mom', wrongs: ['run', 'big', 'go'] },
            { sentence: 'I like to ___', answer: 'play', wrongs: ['big', 'red', 'the'] },
            { sentence: 'Look at the ___', answer: 'bird', wrongs: ['run', 'go', 'is'] },
            { sentence: 'The frog can ___', answer: 'hop', wrongs: ['red', 'big', 'the'] },
            { sentence: 'My pet is a ___', answer: 'fish', wrongs: ['run', 'up', 'go'] },
            { sentence: 'We eat ___', answer: 'food', wrongs: ['run', 'big', 'see'] },
            { sentence: 'The ball is ___', answer: 'red', wrongs: ['run', 'go', 'sit'] },
            { sentence: 'I love my ___', answer: 'dad', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The ___ is tall', answer: 'tree', wrongs: ['run', 'sit', 'go'] },
            { sentence: 'I sit on a ___', answer: 'chair', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The baby can ___', answer: 'cry', wrongs: ['big', 'red', 'the'] },
            { sentence: 'The cow says ___', answer: 'moo', wrongs: ['run', 'big', 'go'] },
            { sentence: 'I ride my ___', answer: 'bike', wrongs: ['big', 'red', 'run'] },
            { sentence: 'The sky is ___', answer: 'blue', wrongs: ['run', 'dog', 'go'] },
            { sentence: 'We sleep in a ___', answer: 'bed', wrongs: ['run', 'go', 'big'] },
            { sentence: 'The snow is ___', answer: 'cold', wrongs: ['run', 'big', 'go'] },
            { sentence: 'I wash my ___', answer: 'hands', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The duck can ___', answer: 'swim', wrongs: ['red', 'big', 'the'] },
            { sentence: 'I brush my ___', answer: 'teeth', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The pig is ___', answer: 'pink', wrongs: ['run', 'go', 'see'] },
            { sentence: 'We read a ___', answer: 'book', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The hat is on my ___', answer: 'head', wrongs: ['run', 'big', 'go'] },
            { sentence: 'I drink my ___', answer: 'milk', wrongs: ['run', 'big', 'go'] },
            { sentence: 'The bee can ___', answer: 'buzz', wrongs: ['red', 'big', 'the'] },
            { sentence: 'I hug my ___', answer: 'mom', wrongs: ['run', 'big', 'go'] }
        ],
        first: [
            { sentence: 'The dog ran to the ___', answer: 'park', wrongs: ['blue', 'fast', 'under'] },
            { sentence: 'She likes to read ___', answer: 'books', wrongs: ['green', 'fast', 'under'] },
            { sentence: 'We can play in the ___', answer: 'yard', wrongs: ['read', 'jump', 'blue'] },
            { sentence: 'He went to ___ today', answer: 'school', wrongs: ['green', 'fast', 'jump'] },
            { sentence: 'The fish swims in the ___', answer: 'water', wrongs: ['green', 'fast', 'blue'] },
            { sentence: 'I want to eat a ___', answer: 'snack', wrongs: ['jump', 'read', 'blue'] },
            { sentence: 'They will come ___ school', answer: 'after', wrongs: ['green', 'fast', 'happy'] },
            { sentence: 'My friend is very ___', answer: 'kind', wrongs: ['jump', 'book', 'fast'] },
            { sentence: 'The bird can ___ high', answer: 'fly', wrongs: ['eat', 'sit', 'read'] },
            { sentence: 'We ___ to the store', answer: 'went', wrongs: ['blue', 'tall', 'happy'] },
            { sentence: 'She ___ her homework', answer: 'did', wrongs: ['green', 'tall', 'happy'] },
            { sentence: 'The cat sleeps on the ___', answer: 'bed', wrongs: ['fast', 'jump', 'read'] },
            { sentence: 'He ___ a new toy', answer: 'got', wrongs: ['big', 'tall', 'fast'] },
            { sentence: 'We play ___ the rain', answer: 'in', wrongs: ['tall', 'fast', 'blue'] },
            { sentence: 'The flower is very ___', answer: 'pretty', wrongs: ['jump', 'read', 'fast'] },
            { sentence: 'Mom said to ___ quiet', answer: 'be', wrongs: ['tall', 'fast', 'green'] }
        ]
    },

    _sentences(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._sentences2nd(level);

        // Pre-K: Redirect to sight words (sentences too advanced for Pre-K)
        if (level < 2) {
            return this._sightWords(level);
        }

        // V37: "Which is a REAL sentence?" (20% at K+)
        if (Math.random() < 0.2) {
            const realSentences = [
                'The dog is big.', 'I like to play.', 'She can run fast.',
                'We eat lunch.', 'The cat sat down.', 'He reads a book.',
                'My mom is nice.', 'They went home.', 'The bird can fly.',
                'I see a fish.', 'We play at the park.', 'She likes to sing.'
            ];
            const fragments = [
                'The big red.', 'Running fast to.', 'Very cold and.',
                'Under the big.', 'Because she was.', 'The tall green.',
                'After the game on.', 'My favorite really.', 'Going to the very.',
                'And then the big.', 'With all the.', 'So happy and very.'
            ];
            const correct = realSentences[this._rand(0, realSentences.length - 1)];
            const wrongs = this._shuffle(fragments).slice(0, 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `📝 Which is a REAL sentence?`,
                questionSpeak: `Which of these is a real complete sentence?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'sentences',
                subtype: 'real-sentence',
                explanation: `"${correct}" is a real sentence! It has a subject and verb and makes sense!`,
                explanationSpeak: `${correct} is a real sentence! It has a subject and a verb!`
            };
        }

        // V37: "What's the missing punctuation?" (15% at K+)
        if (Math.random() < 0.18) {
            const punctItems = [
                { sentence: 'I like dogs', correct: '.', type: 'statement' },
                { sentence: 'Where is my hat', correct: '?', type: 'question' },
                { sentence: 'Wow that is amazing', correct: '!', type: 'exclamation' },
                { sentence: 'Can you help me', correct: '?', type: 'question' },
                { sentence: 'The sun is out', correct: '.', type: 'statement' },
                { sentence: 'Watch out', correct: '!', type: 'exclamation' },
                { sentence: 'What time is it', correct: '?', type: 'question' },
                { sentence: 'I am six years old', correct: '.', type: 'statement' },
                { sentence: 'That is so cool', correct: '!', type: 'exclamation' },
                { sentence: 'How old are you', correct: '?', type: 'question' },
                { sentence: 'She runs very fast', correct: '.', type: 'statement' },
                { sentence: 'Look at that', correct: '!', type: 'exclamation' }
            ];
            const pItem = punctItems[this._rand(0, punctItems.length - 1)];
            const answers = this._shuffle(['.', '?', '!', ',']);
            return {
                question: `📝 What goes at the end?\n"${pItem.sentence}___"`,
                questionSpeak: `What punctuation goes at the end? ${pItem.sentence}`,
                answers,
                correctIndex: answers.indexOf(pItem.correct),
                topic: 'sentences',
                subtype: 'punctuation',
                explanation: `It ends with "${pItem.correct}" because it's a ${pItem.type}!`,
                explanationSpeak: `It ends with a ${pItem.type === 'question' ? 'question mark' : pItem.type === 'exclamation' ? 'exclamation point' : 'period'} because it is a ${pItem.type}!`
            };
        }

        // V5.8: 30% sentence reading fluency (comprehension) at 1st grade
        if (level >= 4 && Math.random() < 0.3) {
            return this._sentenceFluency(level);
        }

        const pool = level <= 3 ? this._sentenceData.k : this._sentenceData.first;
        const item = pool[this._rand(0, pool.length - 1)];
        const answers = this._shuffle([item.answer, ...item.wrongs]);
        const full = item.sentence.replace('___', item.answer);

        return {
            question: `Fill in the blank:\n"${item.sentence}"`,
            questionSpeak: `Fill in the blank: ${item.sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(item.answer),
            topic: 'sentences',
            subtype: 'sentence-fill',
            explanation: `"${full}" — The word "${item.answer}" makes the sentence make sense!`,
            explanationSpeak: `${full}. The word ${item.answer} makes the sentence make sense!`
        };
    },

    // V5.8: Sentence reading fluency — read a sentence, answer a comprehension question
    _fluencyData: [
        { sentence: 'The cat sat on the mat.', q: 'Where did the cat sit?', correct: 'on the mat', wrongs: ['in the tree', 'by the door', 'under the bed'] },
        { sentence: 'Sam has a big red ball.', q: 'What color is the ball?', correct: 'red', wrongs: ['blue', 'green', 'yellow'] },
        { sentence: 'The dog ran to the park.', q: 'Where did the dog go?', correct: 'the park', wrongs: ['the store', 'the school', 'the lake'] },
        { sentence: 'Mom made a cake for Dad.', q: 'Who is the cake for?', correct: 'Dad', wrongs: ['Mom', 'the dog', 'the baby'] },
        { sentence: 'The bird flew up to the tree.', q: 'Where did the bird fly?', correct: 'the tree', wrongs: ['the house', 'the car', 'the pond'] },
        { sentence: 'Ben ate three apples.', q: 'How many apples did Ben eat?', correct: 'three', wrongs: ['two', 'four', 'one'] },
        { sentence: 'The fish swam in the pond.', q: 'Where did the fish swim?', correct: 'the pond', wrongs: ['the sky', 'the park', 'the road'] },
        { sentence: 'Lily got a new puppy.', q: 'What did Lily get?', correct: 'a puppy', wrongs: ['a kitten', 'a fish', 'a bird'] },
        { sentence: 'It is cold and snowy today.', q: 'What is the weather?', correct: 'cold and snowy', wrongs: ['hot and sunny', 'warm and rainy', 'windy and dry'] },
        { sentence: 'The boy rode his bike to school.', q: 'How did the boy get to school?', correct: 'rode his bike', wrongs: ['took a bus', 'walked', 'drove a car'] },
        { sentence: 'She put on her hat and coat.', q: 'What did she put on?', correct: 'hat and coat', wrongs: ['shoes and socks', 'dress and belt', 'scarf and gloves'] },
        { sentence: 'The frog jumped into the water.', q: 'What did the frog do?', correct: 'jumped', wrongs: ['ran', 'flew', 'slept'] },
        { sentence: 'Dad read a book to the kids.', q: 'What did Dad read?', correct: 'a book', wrongs: ['a letter', 'a sign', 'a map'] },
        { sentence: 'The sun went down at night.', q: 'When did the sun go down?', correct: 'at night', wrongs: ['in the morning', 'at noon', 'after lunch'] },
        { sentence: 'We planted flowers in the garden.', q: 'What did we plant?', correct: 'flowers', wrongs: ['trees', 'grass', 'rocks'] },
        { sentence: 'The baby clapped her hands.', q: 'What did the baby do?', correct: 'clapped', wrongs: ['cried', 'slept', 'ran'] },
        { sentence: 'Tom and Mia played in the rain.', q: 'Where did they play?', correct: 'in the rain', wrongs: ['in the house', 'at school', 'in the car'] },
        { sentence: 'The bus stops at the corner.', q: 'Where does the bus stop?', correct: 'at the corner', wrongs: ['at the park', 'at the store', 'at the house'] },
        { sentence: 'She drew a picture of her family.', q: 'What did she draw?', correct: 'her family', wrongs: ['a house', 'a dog', 'a flower'] },
        { sentence: 'The wind blew the leaves away.', q: 'What did the wind blow?', correct: 'the leaves', wrongs: ['the rocks', 'the water', 'the dirt'] }
    ],

    _sentenceFluency(level) {
        const item = this._fluencyData[this._rand(0, this._fluencyData.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);

        return {
            question: `Read the sentence:\n"${item.sentence}"\n\n${item.q}`,
            questionSpeak: `${item.sentence} ${item.q}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'sentences',
            subtype: 'reading-fluency',
            explanation: `"${item.sentence}" — ${item.correct}!`,
            explanationSpeak: `${item.sentence}. The answer is ${item.correct}!`
        };
    },

    // ---- VOCABULARY (V3) ----
    _vocabData: {
        kEasy: [
            { question: 'Which word means a place where you sleep?', correct: 'bed', wrongs: ['run', 'cup', 'hat'] },
            { question: 'Which word means something you drink from?', correct: 'cup', wrongs: ['bed', 'hat', 'run'] },
            { question: 'Which word means something you wear on your head?', correct: 'hat', wrongs: ['cup', 'bed', 'cat'] },
            { question: 'Which word means a baby dog?', correct: 'puppy', wrongs: ['kitten', 'bird', 'fish'] },
            { question: 'Which word means something that shines in the sky at night?', correct: 'star', wrongs: ['car', 'hat', 'bed'] },
            { question: 'Which word means the color of grass?', correct: 'green', wrongs: ['red', 'blue', 'white'] },
            { question: 'Which word means something you eat for breakfast?', correct: 'cereal', wrongs: ['chair', 'book', 'shoe'] },
            { question: 'Which word means a baby cat?', correct: 'kitten', wrongs: ['puppy', 'chick', 'cub'] },
            { question: 'Which word means something with four legs you sit on?', correct: 'chair', wrongs: ['hat', 'book', 'cup'] },
            { question: 'Which word means a place with lots of books?', correct: 'library', wrongs: ['kitchen', 'garage', 'garden'] },
            { question: 'Which word means the color of the sky?', correct: 'blue', wrongs: ['red', 'green', 'brown'] },
            { question: 'Which word means a round toy you bounce?', correct: 'ball', wrongs: ['doll', 'kite', 'block'] },
            { question: 'Which word means something you read?', correct: 'book', wrongs: ['sock', 'spoon', 'rock'] },
            { question: 'Which word means someone who teaches you?', correct: 'teacher', wrongs: ['doctor', 'farmer', 'driver'] },
            { question: 'Which word means a meal you eat at noon?', correct: 'lunch', wrongs: ['nap', 'bath', 'walk'] },
            { question: 'Which word means you move through water?', correct: 'swim', wrongs: ['fly', 'dig', 'climb'] }
        ],
        kHard: [
            { question: 'What does "huge" mean?', correct: 'very big', wrongs: ['very small', 'very fast', 'very old'], explain: 'so big it fills up the room' },
            { question: 'What does "tiny" mean?', correct: 'very small', wrongs: ['very big', 'very loud', 'very happy'], explain: 'so small you can barely see it' },
            { question: 'What does "fast" mean?', correct: 'very quick', wrongs: ['very slow', 'very tall', 'very quiet'], explain: 'moving in a hurry, like a race car' },
            { question: 'What does "happy" mean?', correct: 'feeling good', wrongs: ['feeling sad', 'feeling sick', 'feeling sleepy'], explain: 'when you smile and feel great inside' },
            { question: 'What does "loud" mean?', correct: 'not quiet', wrongs: ['not big', 'not fast', 'not cold'], explain: 'making a big sound, like a drum' },
            { question: 'What does "wet" mean?', correct: 'has water', wrongs: ['has fire', 'has air', 'has dirt'], explain: 'covered in water, like after rain' },
            { question: 'What does "scared" mean?', correct: 'afraid', wrongs: ['happy', 'angry', 'sleepy'], explain: 'feeling worried something bad might happen' },
            { question: 'What does "strong" mean?', correct: 'has power', wrongs: ['is tired', 'is small', 'is quiet'], explain: 'able to lift and carry heavy things' },
            { question: 'What does "quiet" mean?', correct: 'not loud', wrongs: ['not big', 'not fast', 'not hot'], explain: 'very soft sound, like a whisper' },
            { question: 'What does "brave" mean?', correct: 'not afraid', wrongs: ['not happy', 'not fast', 'not big'], explain: 'doing something even when it feels scary' },
            { question: 'What does "empty" mean?', correct: 'has nothing', wrongs: ['has a lot', 'is broken', 'is heavy'], explain: 'nothing inside, like a box with no toys' },
            { question: 'What does "full" mean?', correct: 'no room left', wrongs: ['all gone', 'very small', 'very light'], explain: 'packed all the way, no space for more' },
            { question: 'What does "gentle" mean?', correct: 'soft and kind', wrongs: ['hard and mean', 'loud and fast', 'big and tall'], explain: 'touching softly, like petting a kitten' },
            { question: 'What does "shiny" mean?', correct: 'bright light', wrongs: ['very dark', 'very old', 'very soft'], explain: 'glowing and sparkling, like a star' },
            { question: 'What does "yummy" mean?', correct: 'tastes good', wrongs: ['smells bad', 'looks old', 'feels hard'], explain: 'food that makes you want more' },
            { question: 'What does "cold" mean?', correct: 'not warm', wrongs: ['not big', 'not soft', 'not fast'], explain: 'feels chilly, like ice or snow' }
        ],
        firstEasy: [
            { question: 'Which word means the opposite of "hot"?', correct: 'cold', wrongs: ['fast', 'big', 'red'] },
            { question: 'Which word means the opposite of "up"?', correct: 'down', wrongs: ['in', 'out', 'over'] },
            { question: 'Which word means the opposite of "happy"?', correct: 'sad', wrongs: ['fast', 'big', 'tall'] },
            { question: 'Which word means the opposite of "big"?', correct: 'small', wrongs: ['tall', 'fast', 'loud'] },
            { question: 'Which word means the opposite of "day"?', correct: 'night', wrongs: ['sun', 'moon', 'light'] },
            { question: 'Which word means the opposite of "fast"?', correct: 'slow', wrongs: ['big', 'loud', 'far'] },
            { question: 'Which word means the opposite of "old"?', correct: 'new', wrongs: ['big', 'far', 'cold'] },
            { question: 'Which word means the opposite of "open"?', correct: 'close', wrongs: ['break', 'push', 'pull'] },
            { question: 'Which word means the opposite of "light"?', correct: 'heavy', wrongs: ['fast', 'long', 'cold'] },
            { question: 'Which word means the opposite of "soft"?', correct: 'hard', wrongs: ['wet', 'tall', 'loud'] },
            { question: 'Which word means the opposite of "clean"?', correct: 'dirty', wrongs: ['wet', 'cold', 'short'] },
            { question: 'Which word means the opposite of "full"?', correct: 'empty', wrongs: ['big', 'tall', 'wide'] },
            { question: 'Which word means the opposite of "loud"?', correct: 'quiet', wrongs: ['small', 'slow', 'short'] },
            { question: 'Which word means the opposite of "wet"?', correct: 'dry', wrongs: ['cold', 'soft', 'slow'] },
            { question: 'Which word means the opposite of "tall"?', correct: 'short', wrongs: ['thin', 'slow', 'cold'] },
            { question: 'Which word means the opposite of "dark"?', correct: 'light', wrongs: ['big', 'fast', 'cold'] }
        ],
        firstHard: [
            { question: '"The puppy was tiny."\nWhat does "tiny" mean?', correct: 'very small', wrongs: ['very loud', 'very happy', 'very hungry'], explain: 'so little you could hold it in one hand' },
            { question: '"She was furious!"\nWhat does "furious" mean?', correct: 'very angry', wrongs: ['very happy', 'very tired', 'very cold'], explain: 'so mad you might yell or stomp' },
            { question: '"The snack was delicious."\nWhat does "delicious" mean?', correct: 'tastes great', wrongs: ['very big', 'very old', 'very cold'], explain: 'food so good you want seconds' },
            { question: '"He was exhausted."\nWhat does "exhausted" mean?', correct: 'very tired', wrongs: ['very happy', 'very hungry', 'very scared'], explain: 'so sleepy you can barely keep your eyes open' },
            { question: '"The room was enormous."\nWhat does "enormous" mean?', correct: 'very big', wrongs: ['very dark', 'very cold', 'very quiet'], explain: 'so huge it takes forever to walk across' },
            { question: '"She was courageous."\nWhat does "courageous" mean?', correct: 'very brave', wrongs: ['very smart', 'very fast', 'very quiet'], explain: 'doing the right thing even when afraid' },
            { question: '"The joke was hilarious."\nWhat does "hilarious" mean?', correct: 'very funny', wrongs: ['very sad', 'very scary', 'very loud'], explain: 'so funny it makes everyone laugh' },
            { question: '"The water was frigid."\nWhat does "frigid" mean?', correct: 'very cold', wrongs: ['very deep', 'very dirty', 'very calm'], explain: 'icy cold, so cold you shiver' },
            { question: '"The puppy was adorable."\nWhat does "adorable" mean?', correct: 'very cute', wrongs: ['very big', 'very fast', 'very old'], explain: 'so sweet and lovable you want to hug it' },
            { question: '"The test was difficult."\nWhat does "difficult" mean?', correct: 'very hard', wrongs: ['very easy', 'very long', 'very fun'], explain: 'not easy, takes a lot of thinking' },
            { question: '"She felt miserable."\nWhat does "miserable" mean?', correct: 'very sad', wrongs: ['very angry', 'very cold', 'very tired'], explain: 'feeling awful, like nothing is going right' },
            { question: '"The cheetah was swift."\nWhat does "swift" mean?', correct: 'very fast', wrongs: ['very strong', 'very big', 'very loud'], explain: 'moving super quick, like lightning' },
            { question: '"The tower was ancient."\nWhat does "ancient" mean?', correct: 'very old', wrongs: ['very tall', 'very dark', 'very big'], explain: 'been around for hundreds of years' },
            { question: '"He was famished."\nWhat does "famished" mean?', correct: 'very hungry', wrongs: ['very sleepy', 'very cold', 'very lost'], explain: 'so hungry your tummy growls' },
            { question: '"The garden was magnificent."\nWhat does "magnificent" mean?', correct: 'wonderful', wrongs: ['terrible', 'ordinary', 'boring'], explain: 'so beautiful it takes your breath away' },
            { question: '"The night was tranquil."\nWhat does "tranquil" mean?', correct: 'very calm', wrongs: ['very dark', 'very cold', 'very long'], explain: 'peaceful and still, with no noise' }
        ]
    },

    _vocabulary(level) {
        // V41: 3rd grade dispatch
        if (level >= 8) return this._vocabulary3rd(level);
        // V20: 2nd grade dispatch
        if (level >= 6) return this._vocabulary2nd(level);

        // Pre-K: Expanded pool (25 items) + "which does NOT belong?" template
        if (level < 2) {
            const preKVocab = [
                { question: 'Which is a fruit?', correct: '🍎 Apple', wrongs: ['🚗 Car', '🐶 Dog', '📚 Book'] },
                { question: 'Which is an animal?', correct: '🐶 Dog', wrongs: ['🍎 Apple', '🚗 Car', '📚 Book'] },
                { question: 'Which is a color?', correct: '🔵 Blue', wrongs: ['🐱 Cat', '🍌 Banana', '🏠 House'] },
                { question: 'Which is food?', correct: '🍔 Hamburger', wrongs: ['🚗 Car', '🐶 Dog', '🏠 House'] },
                { question: 'Which is a toy?', correct: '🧸 Teddy Bear', wrongs: ['🍎 Apple', '🚗 Car', '🌳 Tree'] },
                { question: 'Which can fly?', correct: '🐦 Bird', wrongs: ['🐟 Fish', '🐶 Dog', '🐱 Cat'] },
                { question: 'Which do you wear?', correct: '🎩 Hat', wrongs: ['🍎 Apple', '🐶 Dog', '🌳 Tree'] },
                { question: 'Which lives in water?', correct: '🐟 Fish', wrongs: ['🐶 Dog', '🐱 Cat', '🐦 Bird'] },
                { question: 'Which is a vehicle?', correct: '🚗 Car', wrongs: ['🍎 Apple', '🐶 Dog', '🌳 Tree'] },
                { question: 'Which is a flower?', correct: '🌻 Sunflower', wrongs: ['🐶 Dog', '🚗 Car', '🍎 Apple'] },
                { question: 'Which is a drink?', correct: '🧃 Juice', wrongs: ['🎩 Hat', '🐶 Dog', '🌳 Tree'] },
                { question: 'Which is round?', correct: '⚽ Ball', wrongs: ['📚 Book', '🎩 Hat', '🌳 Tree'] },
                { question: 'Which is hot?', correct: '☀️ Sun', wrongs: ['🧊 Ice', '❄️ Snow', '🌙 Moon'] },
                { question: 'Which is cold?', correct: '❄️ Snow', wrongs: ['☀️ Sun', '🔥 Fire', '🍔 Hamburger'] },
                { question: 'Which is big?', correct: '🐘 Elephant', wrongs: ['🐜 Ant', '🐛 Bug', '🐝 Bee'] },
                { question: 'Which is tiny?', correct: '🐜 Ant', wrongs: ['🐘 Elephant', '🦁 Lion', '🐻 Bear'] },
                { question: 'Which has legs?', correct: '🐶 Dog', wrongs: ['🐟 Fish', '🐍 Snake', '🪱 Worm'] },
                { question: 'Which is sweet?', correct: '🍰 Cake', wrongs: ['🧅 Onion', '🥬 Lettuce', '🧂 Salt'] },
                { question: 'Which makes music?', correct: '🎸 Guitar', wrongs: ['📚 Book', '🚗 Car', '🌳 Tree'] },
                { question: 'Which is in the sky?', correct: '☁️ Cloud', wrongs: ['🐟 Fish', '🪨 Rock', '🌳 Tree'] },
                { question: 'Which grows in dirt?', correct: '🌳 Tree', wrongs: ['🐦 Bird', '☁️ Cloud', '⭐ Star'] },
                { question: 'Which do you read?', correct: '📚 Book', wrongs: ['🍎 Apple', '⚽ Ball', '🎩 Hat'] },
                { question: 'Which do you sleep on?', correct: '🛏️ Bed', wrongs: ['🍎 Apple', '🚗 Car', '🌳 Tree'] },
                { question: 'Which has wheels?', correct: '🚲 Bicycle', wrongs: ['🐶 Dog', '🍎 Apple', '📚 Book'] },
                { question: 'Which is a shape?', correct: '⭐ Star', wrongs: ['🍎 Apple', '🐶 Dog', '📚 Book'] }
            ];

            if (Math.random() < 0.25) {
                // "Which does NOT belong?" template
                const categories = [
                    { name: 'animals', items: ['🐶 Dog', '🐱 Cat', '🐦 Bird', '🐟 Fish'], odd: '🍎 Apple' },
                    { name: 'food', items: ['🍎 Apple', '🍌 Banana', '🍔 Hamburger', '🍰 Cake'], odd: '🚗 Car' },
                    { name: 'vehicles', items: ['🚗 Car', '🚌 Bus', '🚲 Bicycle', '✈️ Airplane'], odd: '🐶 Dog' },
                    { name: 'things in sky', items: ['☀️ Sun', '☁️ Cloud', '⭐ Star', '🌙 Moon'], odd: '🐟 Fish' },
                    { name: 'fruits', items: ['🍎 Apple', '🍌 Banana', '🍊 Orange', '🍓 Strawberry'], odd: '🐶 Dog' }
                ];
                const cat = categories[this._rand(0, categories.length - 1)];
                const keepItems = this._shuffle(cat.items).slice(0, 3);
                const answers = this._shuffle([...keepItems, cat.odd]);
                return {
                    question: `Which does NOT belong?`,
                    questionSpeak: `Which one does not belong with the others?`,
                    answers,
                    correctIndex: answers.indexOf(cat.odd),
                    topic: 'vocabulary',
                    subtype: 'category-odd-out',
                    explanation: `${cat.odd.split(' ').slice(1).join(' ')} doesn't belong! The others are all ${cat.name}!`,
                    explanationSpeak: `${cat.odd.split(' ').slice(1).join(' ')} doesn't belong! The others are all ${cat.name}!`
                };
            }

            const item = preKVocab[this._rand(0, preKVocab.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: item.question,
                questionSpeak: item.question,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'vocabulary',
                subtype: 'category-match',
                explanation: `${item.correct} is the right answer! Great job!`,
                explanationSpeak: `${item.correct.split(' ').slice(1).join(' ')} is the right answer! Great job!`
            };
        }

        let pool;
        if (level <= 2) pool = this._vocabData.kEasy;
        else if (level === 3) pool = this._vocabData.kHard;
        else if (level === 4) pool = this._vocabData.firstEasy;
        else pool = this._vocabData.firstHard;

        const item = pool[this._rand(0, pool.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);

        // V5.8: Build meaningful explanation from the question context
        const meaning = item.explain || item.correct;
        const questionClean = item.question.replace(/\n/g, ' ').replace(/"/g, '');

        return {
            question: item.question,
            questionSpeak: questionClean,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'vocabulary',
            subtype: 'word-meaning',
            explanation: item.explain
                ? `"${item.correct}" — ${item.explain}!`
                : `The answer is "${item.correct}"! ${questionClean}`,
            explanationSpeak: item.explain
                ? `${item.correct} means ${item.explain}!`
                : `The answer is ${item.correct}!`
        };
    },

    // ---- V5.7: PHONEME SEGMENTING (FastBridge composite) ----
    _phonemeSegmenting() {
        const data = this._phonicsData.segmenting;
        const item = data[this._rand(0, data.length - 1)];
        const correct = item.count;
        const wrongs = this._shuffle([2, 3, 4, 5].filter(n => n !== correct)).slice(0, 3);
        const answers = this._shuffle([correct, ...wrongs]);
        const soundDisplay = item.sounds.join(' - ');

        return {
            question: `How many sounds in "${item.word}"?\n${soundDisplay}`,
            questionSpeak: `How many sounds do you hear in the word ${item.word}?`,
            answers: answers.map(String),
            correctIndex: answers.indexOf(correct),
            topic: 'phonics',
            subtype: 'phoneme-segmenting',
            explanation: `"${item.word}" has ${correct} sounds: ${soundDisplay}!`,
            explanationSpeak: `${item.word} has ${correct} sounds: ${item.sounds.join(', ')}!`
        };
    },

    // ---- V5.7: PHONEME BLENDING (FastBridge composite) ----
    _phonemeBlending() {
        const data = this._phonicsData.blending;
        const item = data[this._rand(0, data.length - 1)];
        const answers = this._shuffle([item.word, ...item.wrongs]);

        return {
            question: `Put the sounds together:\n${item.sounds}`,
            questionSpeak: `Put the sounds together: ${item.sounds}. What word do they make?`,
            answers,
            correctIndex: answers.indexOf(item.word),
            topic: 'phonics',
            subtype: 'phoneme-blending',
            explanation: `${item.sounds} makes "${item.word}"! Sound it out: ${item.word}!`,
            explanationSpeak: `The sounds make ${item.word}! ${item.word}!`
        };
    },

    // ---- V5.7: NONSENSE WORD DECODING (FastBridge composite) ----
    _nonsenseWordDecoding() {
        const data = this._phonicsData.nonsense;
        const item = data[this._rand(0, data.length - 1)];
        const correct = item.word;
        const answers = this._shuffle([correct, ...item.wrongs]);

        return {
            question: `Read this made-up word:\n${item.word.toUpperCase()}\nWhich sounds right?`,
            questionSpeak: `Read this made-up word. Which answer sounds right?`,
            answers,
            correctIndex: answers.indexOf(correct),
            topic: 'phonics',
            subtype: 'nonsense-word',
            explanation: `"${item.word}" — it rhymes with "${item.rhymesWith}"! Good decoding!`,
            explanationSpeak: `${item.word} rhymes with ${item.rhymesWith}! Good job sounding it out!`
        };
    },

    // ---- V5.7: LETTER SOUNDS (distinct from letter names) ----
    _letterSoundQuestion() {
        const data = this._phonicsData.letterSounds;
        const item = data[this._rand(0, data.length - 1)];

        if (Math.random() < 0.5) {
            // "What sound does B make?"
            const answers = this._shuffle([item.sound, ...item.wrong]);
            return {
                question: `What sound does "${item.letter}" make?`,
                questionSpeak: `What sound does the letter ${item.letter} make?`,
                answers,
                correctIndex: answers.indexOf(item.sound),
                topic: 'phonics',
                subtype: 'letter-sound',
                explanation: `${item.letter} makes the ${item.sound} sound! Like in "${item.example}"!`,
                explanationSpeak: `${item.letter} makes the ${item.sound} sound, like in ${item.example}!`
            };
        } else {
            // "Which letter makes the /b/ sound?"
            const otherLetters = data.filter(d => d.letter !== item.letter).map(d => d.letter);
            const wrongs = this._shuffle(otherLetters).slice(0, 3);
            const answers = this._shuffle([item.letter, ...wrongs]);
            return {
                question: `Which letter makes the\n${item.sound} sound?`,
                questionSpeak: `Which letter makes the ${item.sound} sound?`,
                answers,
                correctIndex: answers.indexOf(item.letter),
                topic: 'phonics',
                subtype: 'sound-to-letter',
                explanation: `${item.letter} makes the ${item.sound} sound! Like in "${item.example}"!`,
                explanationSpeak: `${item.letter} makes the ${item.sound} sound, like in ${item.example}!`
            };
        }
    },

    // ---- SYLLABLES ----
    _syllables(level) {
        // V20: 2nd grade dispatch
        if (level >= 6) return this._syllables2nd(level);

        // Words organized by syllable count
        const words1 = [
            { word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐶' },
            { word: 'fish', emoji: '🐟' }, { word: 'ball', emoji: '⚽' },
            { word: 'sun', emoji: '☀️' }, { word: 'moon', emoji: '🌙' },
            { word: 'star', emoji: '⭐' }, { word: 'tree', emoji: '🌳' },
            { word: 'car', emoji: '🚗' }, { word: 'hat', emoji: '🎩' },
            { word: 'cup', emoji: '☕' }, { word: 'bed', emoji: '🛏️' },
            { word: 'book', emoji: '📖' }, { word: 'frog', emoji: '🐸' },
            { word: 'cake', emoji: '🎂' }, { word: 'bird', emoji: '🐦' }
        ];

        const words2 = [
            { word: 'apple', emoji: '🍎', split: 'ap-ple' },
            { word: 'tiger', emoji: '🐯', split: 'ti-ger' },
            { word: 'puppy', emoji: '🐶', split: 'pup-py' },
            { word: 'kitten', emoji: '🐱', split: 'kit-ten' },
            { word: 'flower', emoji: '🌸', split: 'flow-er' },
            { word: 'monkey', emoji: '🐒', split: 'mon-key' },
            { word: 'pizza', emoji: '🍕', split: 'piz-za' },
            { word: 'cookie', emoji: '🍪', split: 'cook-ie' },
            { word: 'table', emoji: '🪑', split: 'ta-ble' },
            { word: 'bunny', emoji: '🐰', split: 'bun-ny' },
            { word: 'happy', emoji: '😊', split: 'hap-py' },
            { word: 'water', emoji: '💧', split: 'wa-ter' },
            { word: 'pencil', emoji: '✏️', split: 'pen-cil' },
            { word: 'sister', emoji: '👧', split: 'sis-ter' },
            { word: 'butter', emoji: '🧈', split: 'but-ter' }
        ];

        const words3 = [
            { word: 'butterfly', emoji: '🦋', split: 'but-ter-fly' },
            { word: 'elephant', emoji: '🐘', split: 'el-e-phant' },
            { word: 'dinosaur', emoji: '🦕', split: 'di-no-saur' },
            { word: 'banana', emoji: '🍌', split: 'ba-na-na' },
            { word: 'umbrella', emoji: '☂️', split: 'um-brel-la' },
            { word: 'tomato', emoji: '🍅', split: 'to-ma-to' },
            { word: 'computer', emoji: '💻', split: 'com-pu-ter' },
            { word: 'kangaroo', emoji: '🦘', split: 'kan-ga-roo' },
            { word: 'chocolate', emoji: '🍫', split: 'choc-o-late' },
            { word: 'broccoli', emoji: '🥦', split: 'broc-co-li' },
            { word: 'pineapple', emoji: '🍍', split: 'pine-ap-ple' },
            { word: 'strawberry', emoji: '🍓', split: 'straw-ber-ry' }
        ];

        const words4 = [
            { word: 'watermelon', emoji: '🍉', split: 'wa-ter-mel-on' },
            { word: 'caterpillar', emoji: '🐛', split: 'cat-er-pil-lar' },
            { word: 'helicopter', emoji: '🚁', split: 'hel-i-cop-ter' },
            { word: 'alligator', emoji: '🐊', split: 'al-li-ga-tor' },
            { word: 'macaroni', emoji: '🍝', split: 'mac-a-ro-ni' }
        ];

        if (level < 2) {
            // Pre-K: 1 vs 2 syllable words, "How many claps?"
            const templateType = this._rand(0, 2);

            if (templateType === 0) {
                // "How many claps in [word]?"
                const use1 = Math.random() < 0.5;
                const word = use1 ?
                    words1[this._rand(0, words1.length - 1)] :
                    words2[this._rand(0, words2.length - 1)];
                const count = use1 ? 1 : 2;
                const answers = this._shuffle(['1', '2', '3']);
                return {
                    question: `How many claps in\n${word.emoji} "${word.word}"?\n👏`,
                    questionSpeak: `How many claps in the word ${word.word}?`,
                    answers,
                    correctIndex: answers.indexOf(String(count)),
                    topic: 'syllables',
                    subtype: 'clap-count-prek',
                    explanation: `${word.word} has ${count} ${count === 1 ? 'clap' : 'claps'}! ${use1 ? word.word : word.split}! 👏`,
                    explanationSpeak: `${word.word} has ${count} ${count === 1 ? 'clap' : 'claps'}!`
                };
            } else if (templateType === 1) {
                // "Which word has 1 clap?"
                const target = words1[this._rand(0, words1.length - 1)];
                const wrong1 = words2[this._rand(0, words2.length - 1)];
                const wrong2 = words2[this._rand(0, words2.length - 1)];
                const answers = this._shuffle([
                    `${target.emoji} ${target.word}`,
                    `${wrong1.emoji} ${wrong1.word}`,
                    `${wrong2.emoji} ${wrong2.word}`
                ]);
                const correct = `${target.emoji} ${target.word}`;
                return {
                    question: `Which word has only 1 clap? 👏`,
                    questionSpeak: `Which word has only one clap?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'syllables',
                    subtype: 'find-one-clap',
                    explanation: `${target.word} has just 1 clap! ${target.word}! 👏`,
                    explanationSpeak: `${target.word} has just one clap!`
                };
            } else {
                // "Which word is longer (more claps)?"
                const short = words1[this._rand(0, words1.length - 1)];
                const long = words2[this._rand(0, words2.length - 1)];
                const answers = this._shuffle([
                    `${long.emoji} ${long.word}`,
                    `${short.emoji} ${short.word}`
                ]);
                const correct = `${long.emoji} ${long.word}`;
                return {
                    question: `Which word has MORE claps? 👏👏`,
                    questionSpeak: `Which word has more claps?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'syllables',
                    subtype: 'compare-claps',
                    explanation: `${long.word} (${long.split}) has 2 claps! ${short.word} has only 1! 👏👏`,
                    explanationSpeak: `${long.word} has two claps! ${short.word} has only one!`
                };
            }
        }

        if (level < 4) {
            // K levels: 1-3 syllable words, splitting into parts
            const templateType = this._rand(0, 3);

            if (templateType === 0) {
                // "How many syllables?" with 1-3 syllable words
                const pool = [
                    ...words1.map(w => ({ ...w, count: 1, split: w.word })),
                    ...words2.map(w => ({ ...w, count: 2 })),
                    ...words3.map(w => ({ ...w, count: 3 }))
                ];
                const word = pool[this._rand(0, pool.length - 1)];
                const answers = this._shuffle(['1', '2', '3', '4']);
                return {
                    question: `How many syllables in\n${word.emoji} "${word.word}"?`,
                    questionSpeak: `How many syllables in ${word.word}?`,
                    answers,
                    correctIndex: answers.indexOf(String(word.count)),
                    topic: 'syllables',
                    subtype: 'syllable-count-k',
                    explanation: `${word.word} → ${word.split} = ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`,
                    explanationSpeak: `${word.word} has ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`
                };
            } else if (templateType === 1) {
                // "Which word has 2 syllables?"
                const target = words2[this._rand(0, words2.length - 1)];
                const wrong1 = words1[this._rand(0, words1.length - 1)];
                const wrong3 = words3[this._rand(0, words3.length - 1)];
                const answers = this._shuffle([
                    `${target.emoji} ${target.word}`,
                    `${wrong1.emoji} ${wrong1.word}`,
                    `${wrong3.emoji} ${wrong3.word}`
                ]);
                const correct = `${target.emoji} ${target.word}`;
                return {
                    question: `Which word has exactly\n2 syllables?`,
                    questionSpeak: `Which word has exactly two syllables?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'syllables',
                    subtype: 'find-syllable-count',
                    explanation: `${target.word} → ${target.split} = 2 syllables!`,
                    explanationSpeak: `${target.word} has two syllables! ${target.split}!`
                };
            } else if (templateType === 2) {
                // "How do we break up this word?"
                const word = words2[this._rand(0, words2.length - 1)];
                const parts = word.split.split('-');
                const wrongSplit1 = parts[0][0] + '-' + word.word.slice(1);
                const wrongSplit2 = word.word.slice(0, -1) + '-' + word.word.slice(-1);
                const answers = this._shuffle([word.split, wrongSplit1, wrongSplit2]);
                return {
                    question: `How do we break up\n${word.emoji} "${word.word}"?`,
                    questionSpeak: `How do we break up the word ${word.word}?`,
                    answers,
                    correctIndex: answers.indexOf(word.split),
                    topic: 'syllables',
                    subtype: 'syllable-split-k',
                    explanation: `${word.word} breaks into ${word.split}!`,
                    explanationSpeak: `${word.word} breaks into ${word.split}!`
                };
            } else {
                // "Which word has the MOST syllables?"
                const w1 = words1[this._rand(0, words1.length - 1)];
                const w2 = words2[this._rand(0, words2.length - 1)];
                const w3 = words3[this._rand(0, words3.length - 1)];
                const answers = this._shuffle([
                    `${w1.emoji} ${w1.word}`,
                    `${w2.emoji} ${w2.word}`,
                    `${w3.emoji} ${w3.word}`
                ]);
                const correct = `${w3.emoji} ${w3.word}`;
                return {
                    question: `Which word has the\nMOST syllables?`,
                    questionSpeak: `Which word has the most syllables?`,
                    answers,
                    correctIndex: answers.indexOf(correct),
                    topic: 'syllables',
                    subtype: 'most-syllables',
                    explanation: `${w3.word} → ${w3.split} = 3 syllables! That's the most!`,
                    explanationSpeak: `${w3.word} has three syllables! That's the most!`
                };
            }
        }

        // 1st grade: 1-4 syllable words, breaking apart, compound words
        const templateType = this._rand(0, 3);

        if (templateType === 0) {
            // "How many syllables?" — full range 1-4
            const pool = [
                ...words1.map(w => ({ ...w, count: 1, split: w.word })),
                ...words2.map(w => ({ ...w, count: 2 })),
                ...words3.map(w => ({ ...w, count: 3 })),
                ...words4.map(w => ({ ...w, count: 4 }))
            ];
            const word = pool[this._rand(0, pool.length - 1)];
            const answers = this._shuffle(['1', '2', '3', '4']);
            return {
                question: `How many syllables?\n${word.emoji} "${word.word}"`,
                questionSpeak: `How many syllables in ${word.word}?`,
                answers,
                correctIndex: answers.indexOf(String(word.count)),
                topic: 'syllables',
                subtype: 'syllable-count',
                explanation: `${word.word} → ${word.split} = ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`,
                explanationSpeak: `${word.word} has ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`
            };
        } else if (templateType === 1) {
            // "Sort: 1, 2, or 3 syllables?"
            const word = [...words1.map(w => ({ ...w, count: 1 })),
                ...words2.map(w => ({ ...w, count: 2 })),
                ...words3.map(w => ({ ...w, count: 3 }))
            ][this._rand(0, words1.length + words2.length + words3.length - 1)];
            const answers = this._shuffle(['1 syllable', '2 syllables', '3 syllables', '4 syllables']);
            const correct = `${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}`;
            return {
                question: `${word.emoji} "${word.word}" has how many syllables?`,
                questionSpeak: `How many syllables does ${word.word} have?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'syllables',
                subtype: 'syllable-sort',
                explanation: `${word.word} = ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`,
                explanationSpeak: `${word.word} has ${word.count} ${word.count === 1 ? 'syllable' : 'syllables'}!`
            };
        } else if (templateType === 2) {
            // "Break this word into syllables"
            const pool = [...words3, ...words4];
            const word = pool[this._rand(0, pool.length - 1)];
            const parts = word.split.split('-');
            // Generate wrong splits
            const wrongSplit1 = parts[0] + '-' + parts.slice(1).join('');
            const wrongSplit2 = parts.slice(0, -1).join('') + '-' + parts[parts.length - 1];
            const answers = this._shuffle([word.split, wrongSplit1, wrongSplit2]);
            return {
                question: `Break it apart:\n${word.emoji} "${word.word}"`,
                questionSpeak: `Break the word ${word.word} into syllables`,
                answers,
                correctIndex: answers.indexOf(word.split),
                topic: 'syllables',
                subtype: 'syllable-split',
                explanation: `${word.word} → ${word.split}!`,
                explanationSpeak: `${word.word} breaks into ${word.split}!`
            };
        } else {
            // Compound word syllables: "How many syllables in 'sunflower'?"
            const compounds = [
                { word: 'sunflower', emoji: '🌻', split: 'sun-flow-er', count: 3 },
                { word: 'rainbow', emoji: '🌈', split: 'rain-bow', count: 2 },
                { word: 'cupcake', emoji: '🧁', split: 'cup-cake', count: 2 },
                { word: 'starfish', emoji: '⭐', split: 'star-fish', count: 2 },
                { word: 'snowman', emoji: '⛄', split: 'snow-man', count: 2 },
                { word: 'playground', emoji: '🛝', split: 'play-ground', count: 2 },
                { word: 'waterfall', emoji: '💦', split: 'wa-ter-fall', count: 3 },
                { word: 'butterfly', emoji: '🦋', split: 'but-ter-fly', count: 3 }
            ];
            const word = compounds[this._rand(0, compounds.length - 1)];
            const answers = this._shuffle(['1', '2', '3', '4']);
            return {
                question: `How many syllables?\n${word.emoji} "${word.word}"`,
                questionSpeak: `How many syllables in ${word.word}?`,
                answers,
                correctIndex: answers.indexOf(String(word.count)),
                topic: 'syllables',
                subtype: 'compound-syllable-count',
                explanation: `${word.word} → ${word.split} = ${word.count} syllables!`,
                explanationSpeak: `${word.word} has ${word.count} syllables! ${word.split}!`
            };
        }
    },

    // ============================================================
    // V20: 2nd GRADE EXTENSIONS FOR EXISTING TOPICS
    // ============================================================

    // ---- LETTERS 2nd Grade: alphabetical order, missing letter in sequence ----
    _letters2nd(level) {
        if (level <= 6 || Math.random() < 0.5) {
            // Alphabetical order: which word comes first?
            const wordSets = [
                ['apple', 'banana', 'cherry', 'dog'],
                ['cat', 'door', 'egg', 'fish'],
                ['game', 'hat', 'ice', 'jump'],
                ['king', 'lamp', 'moon', 'nest'],
                ['open', 'park', 'queen', 'rain'],
                ['star', 'tree', 'under', 'van'],
                ['water', 'box', 'yarn', 'zebra'],
                ['ant', 'bear', 'cow', 'duck'],
                ['frog', 'goat', 'horse', 'igloo'],
                ['jacket', 'kite', 'lion', 'mouse'],
                ['bell', 'card', 'desk', 'elbow'],
                ['grape', 'honey', 'island', 'juice']
            ];
            const set = wordSets[this._rand(0, wordSets.length - 1)];
            const sorted = [...set].sort();
            const correct = sorted[0];
            const shuffled = this._shuffle(set);
            return {
                question: `Which word comes FIRST\nin ABC order?`,
                questionSpeak: `Which word comes first in alphabetical order?`,
                answers: shuffled,
                correctIndex: shuffled.indexOf(correct),
                topic: 'letters',
                subtype: 'abc-order',
                explanation: `"${correct}" comes first! ${sorted.join(', ')} — that's ABC order!`,
                explanationSpeak: `${correct} comes first in ABC order!`
            };
        } else {
            // Missing letter in sequence
            const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const start = this._rand(0, 22);
            const seq = [upper[start], upper[start + 1], upper[start + 2], upper[start + 3]];
            const hideIdx = this._rand(1, 2);
            const correct = seq[hideIdx];
            seq[hideIdx] = '?';
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const w = upper[this._rand(0, 25)];
                if (w !== correct && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `What letter is missing?\n${seq.join('  ')}`,
                questionSpeak: `What letter is missing in the sequence?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'letters',
                subtype: 'missing-letter',
                explanation: `The missing letter is ${correct}! The sequence is ${upper[start]}, ${upper[start+1]}, ${upper[start+2]}, ${upper[start+3]}!`,
                explanationSpeak: `The missing letter is ${correct}!`
            };
        }
    },

    // ---- PHONICS 2nd Grade: vowel teams, r-controlled vowels ----
    _phonics2nd(level) {
        if (level <= 6 || Math.random() < 0.5) {
            // Vowel teams: ea, oa, ai, ee, oo, ou, ow
            const vowelTeams = [
                { team: 'ea', words: ['read', 'bead', 'leaf', 'team', 'bean', 'meat', 'seat', 'heat'], wrong: ['road', 'rain', 'boot'] },
                { team: 'oa', words: ['boat', 'coat', 'road', 'toad', 'soap', 'goat', 'load', 'foam'], wrong: ['beat', 'rain', 'moon'] },
                { team: 'ai', words: ['rain', 'mail', 'tail', 'pain', 'sail', 'wait', 'bait', 'jail'], wrong: ['boat', 'leaf', 'moon'] },
                { team: 'ee', words: ['tree', 'feet', 'seed', 'need', 'deer', 'week', 'heel', 'beef'], wrong: ['boat', 'rain', 'moon'] },
                { team: 'oo', words: ['moon', 'food', 'pool', 'boot', 'roof', 'cool', 'room', 'tool'], wrong: ['boat', 'rain', 'leaf'] },
                { team: 'ou', words: ['loud', 'cloud', 'house', 'mouse', 'round', 'found', 'sound', 'ground'], wrong: ['boat', 'rain', 'moon'] },
                { team: 'ow', words: ['cow', 'town', 'brown', 'down', 'crown', 'frown', 'gown', 'how'], wrong: ['boat', 'rain', 'leaf'] }
            ];
            const vt = vowelTeams[this._rand(0, vowelTeams.length - 1)];
            const correct = vt.words[this._rand(0, vt.words.length - 1)];
            const answers = this._shuffle([correct, ...vt.wrong]);
            return {
                question: `Which word has the\n"${vt.team}" vowel team?`,
                questionSpeak: `Which word has the ${vt.team} vowel team?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'phonics',
                subtype: 'vowel-team',
                explanation: `"${correct}" has the "${vt.team}" vowel team! The letters ${vt.team} work together!`,
                explanationSpeak: `${correct} has the ${vt.team} vowel team!`
            };
        } else {
            // R-controlled vowels: ar, er, ir, or, ur
            const rControlled = [
                { pattern: 'ar', words: ['car', 'star', 'farm', 'park', 'barn', 'card', 'dark', 'yard'], wrong: ['bird', 'fern', 'corn'] },
                { pattern: 'er', words: ['fern', 'her', 'tiger', 'water', 'flower', 'letter', 'sister', 'winter'], wrong: ['car', 'bird', 'corn'] },
                { pattern: 'ir', words: ['bird', 'girl', 'first', 'shirt', 'dirt', 'stir', 'third', 'circle'], wrong: ['car', 'fern', 'corn'] },
                { pattern: 'or', words: ['corn', 'fork', 'horse', 'storm', 'short', 'sport', 'north', 'morning'], wrong: ['car', 'bird', 'fern'] },
                { pattern: 'ur', words: ['burn', 'turn', 'nurse', 'purple', 'turtle', 'church', 'hurt', 'fur'], wrong: ['car', 'bird', 'corn'] }
            ];
            const rc = rControlled[this._rand(0, rControlled.length - 1)];
            const correct = rc.words[this._rand(0, rc.words.length - 1)];
            const answers = this._shuffle([correct, ...rc.wrong]);
            return {
                question: `Which word has the\n"${rc.pattern}" sound?`,
                questionSpeak: `Which word has the ${rc.pattern} sound?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'phonics',
                subtype: 'r-controlled-vowel',
                explanation: `"${correct}" has the "${rc.pattern}" sound! The R changes the vowel sound!`,
                explanationSpeak: `${correct} has the ${rc.pattern} sound!`
            };
        }
    },

    // ---- SIGHT WORDS 2nd Grade: Dolch 2nd grade list ----
    _sightWords2nd(level) {
        const secondGradeWords = [
            'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy',
            'call', 'cold', 'does', 'done', 'draw', 'drink', 'eight', 'fall',
            'far', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green',
            'its', 'keep', 'kind', 'laugh', 'light', 'long', 'many', 'much',
            'myself', 'never', 'next', 'only', 'own', 'pick', 'pull', 'read',
            'right', 'room', 'run', 'say', 'seven', 'shall', 'show', 'sing',
            'sit', 'sleep', 'small', 'start', 'such', 'tell', 'ten', 'thank',
            'their', 'these', 'those', 'today', 'together', 'try', 'upon', 'very',
            'warm', 'wash', 'which', 'why', 'wish', 'work', 'world', 'write'
        ];

        const target = secondGradeWords[this._rand(0, secondGradeWords.length - 1)];

        // Sentence templates for 2nd grade sight words
        const templates = {
            'always': 'I ___ brush my teeth.', 'around': 'We walked ___ the block.',
            'because': 'I smiled ___ I was happy.', 'been': 'I have ___ to the park.',
            'before': 'Wash hands ___ dinner.', 'best': 'She is my ___ friend.',
            'both': 'We ___ like pizza.', 'buy': 'Dad will ___ some milk.',
            'call': 'Please ___ me later.', 'cold': 'The ice is very ___.',
            'does': 'What ___ this word mean?', 'done': 'Are you ___ yet?',
            'draw': 'I like to ___ pictures.', 'drink': 'Please ___ your water.',
            'fast': 'The car went very ___.', 'first': 'I was ___ in line.',
            'five': 'I have ___ fingers.', 'found': 'I ___ a penny!',
            'gave': 'She ___ me a gift.', 'goes': 'He ___ to school.',
            'green': 'The grass is ___.', 'keep': 'You can ___ this toy.',
            'kind': 'She is very ___.', 'laugh': 'That joke made me ___.',
            'long': 'The snake is very ___.', 'many': 'How ___ do you have?',
            'much': 'Thank you so ___!', 'never': 'I ___ eat bugs!',
            'only': 'I have ___ one left.', 'read': 'I love to ___ books.',
            'right': 'That answer is ___!', 'show': 'Please ___ me how.',
            'sing': 'I like to ___ songs.', 'sleep': 'Time to go to ___.',
            'small': 'The ant is very ___.', 'start': 'Let us ___ the game!',
            'tell': 'Can you ___ me a story?', 'together': 'We play ___.',
            'try': 'Please ___ again!', 'very': 'I am ___ happy today.',
            'warm': 'The soup is nice and ___.', 'wash': 'Please ___ your hands.',
            'which': '___ one do you want?', 'why': '___ is the sky blue?',
            'wish': 'I ___ for a puppy.', 'work': 'Let us ___ together.',
            'write': 'I can ___ my name.'
        };

        if (templates[target] && (level >= 7 || Math.random() < 0.4)) {
            const sentence = templates[target];
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const w = secondGradeWords[this._rand(0, secondGradeWords.length - 1)];
                if (w !== target && !wrongs.includes(w)) wrongs.push(w);
            }
            const answers = this._shuffle([target, ...wrongs]);
            const full = sentence.replace('___', target);
            return {
                question: `Fill in the blank:\n"${sentence}"`,
                questionSpeak: `Fill in the blank: ${sentence.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(target),
                topic: 'sight-words',
                subtype: 'sentence-fill-2nd',
                explanation: `"${full}" — "${target}" completes the sentence!`,
                explanationSpeak: `${full}. The word ${target} completes the sentence!`
            };
        }

        const wrongs = [];
        let att = 0;
        while (wrongs.length < 3 && att++ < 50) {
            const w = secondGradeWords[this._rand(0, secondGradeWords.length - 1)];
            if (w !== target && !wrongs.includes(w)) wrongs.push(w);
        }
        const answers = this._shuffle([target, ...wrongs]);
        return {
            question: `Find the word:\n"${target}"`,
            questionSpeak: `Find the word: ${target}`,
            answers,
            correctIndex: answers.indexOf(target),
            topic: 'sight-words',
            subtype: 'find-word-2nd',
            explanation: `The word is "${target}"! Let's spell it: ${target.split('').join(', ')}. ${target}!`,
            explanationSpeak: `The word is ${target}! Let's spell it: ${target.split('').join(', ')}. ${target}!`
        };
    },

    // ---- RHYMING 2nd Grade: multi-syllable rhymes, word families ----
    _rhyming2nd(level) {
        const advancedSets = [
            ['night', 'light', 'right', 'fight', 'might', 'sight', 'tight', 'bright'],
            ['station', 'nation', 'vacation', 'location'],
            ['funny', 'bunny', 'sunny', 'honey', 'money'],
            ['sleeping', 'keeping', 'creeping', 'sweeping'],
            ['walking', 'talking', 'stalking', 'chalking'],
            ['story', 'glory', 'morning', 'boring'],
            ['table', 'cable', 'fable', 'stable', 'label'],
            ['flower', 'power', 'tower', 'shower', 'hour'],
            ['flying', 'crying', 'trying', 'drying'],
            ['thinking', 'drinking', 'sinking', 'blinking'],
            ['thunder', 'under', 'wonder', 'blunder'],
            ['middle', 'riddle', 'fiddle', 'little']
        ];

        if (level <= 6 || Math.random() < 0.5) {
            // Find a rhyme from multi-syllable sets
            const set = advancedSets[this._rand(0, advancedSets.length - 1)];
            const target = set[this._rand(0, set.length - 1)];
            let correct;
            do { correct = set[this._rand(0, set.length - 1)]; } while (correct === target);

            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const otherSet = advancedSets[this._rand(0, advancedSets.length - 1)];
                if (otherSet === set) continue;
                const w = otherSet[this._rand(0, otherSet.length - 1)];
                if (!wrongs.includes(w) && w !== correct) wrongs.push(w);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `Which word rhymes with\n"${target}"?`,
                questionSpeak: `Which word rhymes with ${target}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'rhyming',
                subtype: 'match-rhyme-2nd',
                explanation: `"${correct}" rhymes with "${target}"! They end the same way!`,
                explanationSpeak: `${correct} rhymes with ${target}!`
            };
        } else {
            // Odd one out with harder words
            const set = advancedSets[this._rand(0, advancedSets.length - 1)];
            const rhymers = this._shuffle([...set]).slice(0, 3);
            let oddSet;
            do { oddSet = advancedSets[this._rand(0, advancedSets.length - 1)]; } while (oddSet === set);
            const oddWord = oddSet[this._rand(0, oddSet.length - 1)];
            const answers = this._shuffle([...rhymers, oddWord]);
            return {
                question: `Which word does NOT rhyme?`,
                questionSpeak: `Which word does not rhyme with the others?`,
                answers,
                correctIndex: answers.indexOf(oddWord),
                topic: 'rhyming',
                subtype: 'odd-one-out-2nd',
                explanation: `"${oddWord}" does not rhyme! ${rhymers.join(', ')} all rhyme!`,
                explanationSpeak: `${oddWord} does not rhyme! ${rhymers.join(', ')} all rhyme!`
            };
        }
    },

    // ---- SENTENCES 2nd Grade: fix errors, sentence vs fragment ----
    _sentences2nd(level) {
        if (level <= 6 || Math.random() < 0.5) {
            // Fix the sentence — find the correctly written version
            const fixItems = [
                { wrong: 'the dog runned fast', correct: 'The dog ran fast.', rule: 'past tense' },
                { wrong: 'him went to school', correct: 'He went to school.', rule: 'pronoun' },
                { wrong: 'i like ice cream', correct: 'I like ice cream.', rule: 'capitalize I' },
                { wrong: 'she dont like rain', correct: 'She doesn\'t like rain.', rule: 'doesn\'t' },
                { wrong: 'we was playing outside', correct: 'We were playing outside.', rule: 'were vs was' },
                { wrong: 'the childs played', correct: 'The children played.', rule: 'plural' },
                { wrong: 'them are my friends', correct: 'They are my friends.', rule: 'pronoun' },
                { wrong: 'her goed home', correct: 'She went home.', rule: 'past tense' },
                { wrong: 'me and him played', correct: 'He and I played.', rule: 'pronoun order' },
                { wrong: 'the mouses ran away', correct: 'The mice ran away.', rule: 'irregular plural' },
                { wrong: 'we bringed our lunch', correct: 'We brought our lunch.', rule: 'past tense' },
                { wrong: 'the babys cried', correct: 'The babies cried.', rule: 'plural' },
                { wrong: 'she readed a book', correct: 'She read a book.', rule: 'past tense' },
                { wrong: 'him and me went', correct: 'He and I went.', rule: 'pronoun' },
                { wrong: 'the mans worked', correct: 'The men worked.', rule: 'irregular plural' },
                { wrong: 'they was happy', correct: 'They were happy.', rule: 'were vs was' }
            ];
            const item = fixItems[this._rand(0, fixItems.length - 1)];
            const wrongOptions = [
                item.wrong.charAt(0).toUpperCase() + item.wrong.slice(1),
                item.wrong,
                item.wrong + '.'
            ];
            const wrongs = this._shuffle(wrongOptions).slice(0, 3);
            const answers = this._shuffle([item.correct, ...wrongs]);
            return {
                question: `Which sentence is correct?`,
                questionSpeak: `Which sentence is written correctly?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'sentences',
                subtype: 'fix-sentence',
                explanation: `"${item.correct}" is correct! We fixed the ${item.rule}!`,
                explanationSpeak: `${item.correct} is the correct way to write it!`
            };
        } else {
            // Sentence vs fragment
            const items = [
                { text: 'The cat sat on the mat.', type: 'sentence' },
                { text: 'Running very fast.', type: 'fragment' },
                { text: 'She likes to read books.', type: 'sentence' },
                { text: 'Under the big tree.', type: 'fragment' },
                { text: 'We went to the park.', type: 'sentence' },
                { text: 'Because it was raining.', type: 'fragment' },
                { text: 'The happy little puppy.', type: 'fragment' },
                { text: 'He ate all his lunch.', type: 'sentence' },
                { text: 'Playing in the yard.', type: 'fragment' },
                { text: 'My mom baked a cake.', type: 'sentence' },
                { text: 'The very tall building.', type: 'fragment' },
                { text: 'Birds fly south in winter.', type: 'sentence' },
                { text: 'After school today.', type: 'fragment' },
                { text: 'The dog chased its tail.', type: 'sentence' },
                { text: 'Jumping over puddles.', type: 'fragment' },
                { text: 'She drew a pretty picture.', type: 'sentence' }
            ];
            const item = items[this._rand(0, items.length - 1)];
            const correct = item.type === 'sentence' ? 'Sentence' : 'Fragment';
            const answers = this._shuffle(['Sentence', 'Fragment', 'Question', 'Not sure']);
            return {
                question: `Sentence or fragment?\n"${item.text}"`,
                questionSpeak: `Is this a sentence or a fragment? ${item.text}`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'sentences',
                subtype: 'sentence-or-fragment',
                explanation: item.type === 'sentence'
                    ? `"${item.text}" is a complete sentence! It has a subject and a verb!`
                    : `"${item.text}" is a fragment! It's missing a subject or verb!`,
                explanationSpeak: item.type === 'sentence'
                    ? `That's a complete sentence! It has a subject and a verb!`
                    : `That's a fragment! It's missing something to be a complete sentence!`
            };
        }
    },

    // ---- VOCABULARY 2nd Grade: context clues, multiple meanings, synonyms/antonyms ----
    _vocabulary2nd(level) {
        const roll = Math.random();
        if (roll < 0.35) {
            // Context clues — figure out word meaning from sentence
            const contextItems = [
                { sentence: 'The enormous elephant was bigger than the bus.', word: 'enormous', correct: 'very big', wrongs: ['very small', 'very fast', 'very quiet'] },
                { sentence: 'She was so famished that she ate two sandwiches.', word: 'famished', correct: 'very hungry', wrongs: ['very tired', 'very happy', 'very cold'] },
                { sentence: 'The timid kitten hid under the bed.', word: 'timid', correct: 'shy or scared', wrongs: ['brave', 'angry', 'hungry'] },
                { sentence: 'He was elated when he won the prize.', word: 'elated', correct: 'very happy', wrongs: ['very sad', 'very tired', 'very sick'] },
                { sentence: 'The sweltering day made everyone want to swim.', word: 'sweltering', correct: 'very hot', wrongs: ['very cold', 'very windy', 'very dark'] },
                { sentence: 'She sprinted to the finish line as fast as she could.', word: 'sprinted', correct: 'ran fast', wrongs: ['walked slow', 'sat down', 'fell over'] },
                { sentence: 'The peculiar noise made the dog tilt its head.', word: 'peculiar', correct: 'strange', wrongs: ['loud', 'quiet', 'pretty'] },
                { sentence: 'The weary traveler needed to rest.', word: 'weary', correct: 'very tired', wrongs: ['very happy', 'very young', 'very fast'] },
                { sentence: 'She was furious when someone broke her toy.', word: 'furious', correct: 'very angry', wrongs: ['very happy', 'very quiet', 'very sad'] },
                { sentence: 'The fragile vase broke when it fell.', word: 'fragile', correct: 'easy to break', wrongs: ['very heavy', 'very old', 'very pretty'] },
                { sentence: 'The barren desert had no plants or water.', word: 'barren', correct: 'empty, bare', wrongs: ['full of life', 'very cold', 'very wet'] },
                { sentence: 'The graceful dancer moved like a swan.', word: 'graceful', correct: 'smooth, elegant', wrongs: ['clumsy', 'fast', 'loud'] }
            ];
            const item = contextItems[this._rand(0, contextItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `"${item.sentence}"\n\nWhat does "${item.word}" mean?`,
                questionSpeak: `${item.sentence} What does ${item.word} mean?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'vocabulary',
                subtype: 'context-clues',
                explanation: `"${item.word}" means ${item.correct}! The sentence gives us clues!`,
                explanationSpeak: `${item.word} means ${item.correct}! The sentence helped us figure it out!`
            };
        } else if (roll < 0.65) {
            // Synonyms and antonyms
            const isSynonym = Math.random() < 0.5;
            const pairs = isSynonym ? [
                { word: 'happy', match: 'glad', wrongs: ['sad', 'angry', 'tired'] },
                { word: 'big', match: 'large', wrongs: ['tiny', 'short', 'thin'] },
                { word: 'fast', match: 'quick', wrongs: ['slow', 'quiet', 'heavy'] },
                { word: 'cold', match: 'chilly', wrongs: ['warm', 'soft', 'loud'] },
                { word: 'scared', match: 'afraid', wrongs: ['brave', 'calm', 'happy'] },
                { word: 'smart', match: 'clever', wrongs: ['silly', 'slow', 'weak'] },
                { word: 'begin', match: 'start', wrongs: ['finish', 'stop', 'wait'] },
                { word: 'tiny', match: 'small', wrongs: ['huge', 'tall', 'wide'] },
                { word: 'shut', match: 'close', wrongs: ['open', 'push', 'lift'] },
                { word: 'error', match: 'mistake', wrongs: ['answer', 'success', 'truth'] }
            ] : [
                { word: 'happy', match: 'sad', wrongs: ['glad', 'jolly', 'cheerful'] },
                { word: 'big', match: 'small', wrongs: ['huge', 'large', 'giant'] },
                { word: 'fast', match: 'slow', wrongs: ['quick', 'rapid', 'speedy'] },
                { word: 'hot', match: 'cold', wrongs: ['warm', 'burning', 'boiling'] },
                { word: 'brave', match: 'scared', wrongs: ['bold', 'strong', 'tough'] },
                { word: 'loud', match: 'quiet', wrongs: ['noisy', 'booming', 'roaring'] },
                { word: 'open', match: 'closed', wrongs: ['wide', 'clear', 'free'] },
                { word: 'full', match: 'empty', wrongs: ['packed', 'loaded', 'stuffed'] },
                { word: 'dark', match: 'light', wrongs: ['dim', 'shady', 'gloomy'] },
                { word: 'wet', match: 'dry', wrongs: ['damp', 'soaked', 'moist'] }
            ];
            const item = pairs[this._rand(0, pairs.length - 1)];
            const answers = this._shuffle([item.match, ...item.wrongs]);
            const label = isSynonym ? 'synonym' : 'antonym';
            const meaning = isSynonym ? 'means the SAME as' : 'means the OPPOSITE of';
            return {
                question: `Which word ${meaning}\n"${item.word}"?`,
                questionSpeak: `Which word ${meaning} ${item.word}?`,
                answers,
                correctIndex: answers.indexOf(item.match),
                topic: 'vocabulary',
                subtype: isSynonym ? 'synonym' : 'antonym',
                explanation: `"${item.match}" ${meaning} "${item.word}"! They are ${label}s!`,
                explanationSpeak: `${item.match} ${meaning} ${item.word}! They are ${label}s!`
            };
        } else {
            // Multiple-meaning words
            const multiMeaning = [
                { word: 'bat', meanings: ['a flying animal', 'something you hit a ball with'], q: 'Which is a meaning of "bat"?', wrongs: ['a type of hat', 'a loud sound', 'a kind of boat'] },
                { word: 'ring', meanings: ['jewelry for your finger', 'the sound a bell makes'], q: 'Which is a meaning of "ring"?', wrongs: ['a type of shoe', 'a big rock', 'a kind of food'] },
                { word: 'bark', meanings: ['the sound a dog makes', 'the outside of a tree'], q: 'Which is a meaning of "bark"?', wrongs: ['a type of bird', 'a piece of candy', 'a kind of cloud'] },
                { word: 'light', meanings: ['not heavy', 'what helps you see'], q: 'Which is a meaning of "light"?', wrongs: ['very tall', 'a loud noise', 'a kind of food'] },
                { word: 'fly', meanings: ['to move through the air', 'a small buzzing insect'], q: 'Which is a meaning of "fly"?', wrongs: ['a big fish', 'a type of shoe', 'a kind of hat'] },
                { word: 'run', meanings: ['to move fast on foot', 'a tear in your stocking'], q: 'Which is a meaning of "run"?', wrongs: ['a type of tree', 'a loud crash', 'a kind of bird'] },
                { word: 'spring', meanings: ['a season of the year', 'to jump up quickly'], q: 'Which is a meaning of "spring"?', wrongs: ['a type of car', 'a loud bell', 'a kind of hat'] },
                { word: 'fall', meanings: ['to drop down', 'a season of the year'], q: 'Which is a meaning of "fall"?', wrongs: ['to build up', 'a kind of fish', 'a type of shoe'] },
                { word: 'watch', meanings: ['to look at something', 'a clock on your wrist'], q: 'Which is a meaning of "watch"?', wrongs: ['a type of bird', 'a loud sound', 'a kind of plant'] },
                { word: 'nail', meanings: ['on the end of your finger', 'a metal piece you hammer'], q: 'Which is a meaning of "nail"?', wrongs: ['a type of hat', 'a loud noise', 'a kind of fish'] }
            ];
            const item = multiMeaning[this._rand(0, multiMeaning.length - 1)];
            const correct = item.meanings[this._rand(0, item.meanings.length - 1)];
            const wrongs = this._shuffle(item.wrongs).slice(0, 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${item.q}`,
                questionSpeak: item.q,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'vocabulary',
                subtype: 'multiple-meaning',
                explanation: `"${item.word}" can mean "${item.meanings[0]}" or "${item.meanings[1]}"! Some words have more than one meaning!`,
                explanationSpeak: `${item.word} can mean ${item.meanings[0]} or ${item.meanings[1]}! Some words have more than one meaning!`
            };
        }
    },

    // ---- SYLLABLES 2nd Grade: 3-syllable words, syllable division ----
    _syllables2nd(level) {
        const words3 = [
            { word: 'elephant', emoji: '🐘', split: 'el-e-phant', count: 3 },
            { word: 'beautiful', emoji: '🌸', split: 'beau-ti-ful', count: 3 },
            { word: 'dinosaur', emoji: '🦕', split: 'di-no-saur', count: 3 },
            { word: 'banana', emoji: '🍌', split: 'ba-na-na', count: 3 },
            { word: 'umbrella', emoji: '☂️', split: 'um-brel-la', count: 3 },
            { word: 'computer', emoji: '💻', split: 'com-pu-ter', count: 3 },
            { word: 'tomorrow', emoji: '📅', split: 'to-mor-row', count: 3 },
            { word: 'chocolate', emoji: '🍫', split: 'choc-o-late', count: 3 },
            { word: 'important', emoji: '⭐', split: 'im-por-tant', count: 3 },
            { word: 'alphabet', emoji: '🔤', split: 'al-pha-bet', count: 3 },
            { word: 'family', emoji: '👨‍👩‍👧', split: 'fam-i-ly', count: 3 },
            { word: 'adventure', emoji: '🗺️', split: 'ad-ven-ture', count: 3 }
        ];
        const words4 = [
            { word: 'caterpillar', emoji: '🐛', split: 'cat-er-pil-lar', count: 4 },
            { word: 'watermelon', emoji: '🍉', split: 'wa-ter-mel-on', count: 4 },
            { word: 'alligator', emoji: '🐊', split: 'al-li-ga-tor', count: 4 },
            { word: 'helicopter', emoji: '🚁', split: 'hel-i-cop-ter', count: 4 },
            { word: 'dictionary', emoji: '📖', split: 'dic-tion-ar-y', count: 4 },
            { word: 'television', emoji: '📺', split: 'tel-e-vi-sion', count: 4 }
        ];

        const allWords = [...words3, ...words4];
        const word = allWords[this._rand(0, allWords.length - 1)];

        if (level <= 6 || Math.random() < 0.5) {
            // How many syllables?
            const answers = this._shuffle(['2', '3', '4', '5']);
            return {
                question: `How many syllables?\n${word.emoji} "${word.word}"`,
                questionSpeak: `How many syllables in ${word.word}?`,
                answers,
                correctIndex: answers.indexOf(String(word.count)),
                topic: 'syllables',
                subtype: 'syllable-count-2nd',
                explanation: `${word.word} → ${word.split} = ${word.count} syllables!`,
                explanationSpeak: `${word.word} has ${word.count} syllables! ${word.split}!`
            };
        } else {
            // Divide the word into syllables
            const parts = word.split.split('-');
            // Generate plausible wrong splits
            const wrongSplits = [];
            if (parts.length === 3) {
                wrongSplits.push(parts[0] + parts[1] + '-' + parts[2]);
                wrongSplits.push(parts[0] + '-' + parts[1] + parts[2]);
                wrongSplits.push(parts[0].slice(0, -1) + '-' + parts[0].slice(-1) + parts[1] + '-' + parts[2]);
            } else {
                wrongSplits.push(parts[0] + parts[1] + '-' + parts[2] + '-' + parts[3]);
                wrongSplits.push(parts[0] + '-' + parts[1] + parts[2] + '-' + parts[3]);
                wrongSplits.push(parts[0] + '-' + parts[1] + '-' + parts[2] + parts[3]);
            }
            const answers = this._shuffle([word.split, ...wrongSplits.slice(0, 3)]);
            return {
                question: `Break it apart:\n${word.emoji} "${word.word}"`,
                questionSpeak: `Break the word ${word.word} into syllables`,
                answers,
                correctIndex: answers.indexOf(word.split),
                topic: 'syllables',
                subtype: 'syllable-split-2nd',
                explanation: `${word.word} → ${word.split}! Clap it out: ${word.split}!`,
                explanationSpeak: `${word.word} breaks into ${word.split}!`
            };
        }
    },

    // ============================================================
    // V20: 5 NEW 2nd GRADE TOPICS
    // ============================================================

    // ---- COMPOUND WORDS ----
    _compoundWords(level) {
        const compounds = [
            { word: 'sunflower', parts: ['sun', 'flower'], emoji: '🌻' },
            { word: 'rainbow', parts: ['rain', 'bow'], emoji: '🌈' },
            { word: 'cupcake', parts: ['cup', 'cake'], emoji: '🧁' },
            { word: 'starfish', parts: ['star', 'fish'], emoji: '⭐' },
            { word: 'snowman', parts: ['snow', 'man'], emoji: '⛄' },
            { word: 'football', parts: ['foot', 'ball'], emoji: '🏈' },
            { word: 'bedroom', parts: ['bed', 'room'], emoji: '🛏️' },
            { word: 'toothbrush', parts: ['tooth', 'brush'], emoji: '🪥' },
            { word: 'playground', parts: ['play', 'ground'], emoji: '🛝' },
            { word: 'butterfly', parts: ['butter', 'fly'], emoji: '🦋' },
            { word: 'popcorn', parts: ['pop', 'corn'], emoji: '🍿' },
            { word: 'pancake', parts: ['pan', 'cake'], emoji: '🥞' },
            { word: 'goldfish', parts: ['gold', 'fish'], emoji: '🐠' },
            { word: 'airplane', parts: ['air', 'plane'], emoji: '✈️' },
            { word: 'mailbox', parts: ['mail', 'box'], emoji: '📬' },
            { word: 'doorbell', parts: ['door', 'bell'], emoji: '🔔' },
            { word: 'backpack', parts: ['back', 'pack'], emoji: '🎒' },
            { word: 'eyelash', parts: ['eye', 'lash'], emoji: '👁️' },
            { word: 'seashell', parts: ['sea', 'shell'], emoji: '🐚' },
            { word: 'notebook', parts: ['note', 'book'], emoji: '📓' },
            { word: 'firework', parts: ['fire', 'work'], emoji: '🎆' },
            { word: 'bookworm', parts: ['book', 'worm'], emoji: '📚' },
            { word: 'ladybug', parts: ['lady', 'bug'], emoji: '🐞' },
            { word: 'bathtub', parts: ['bath', 'tub'], emoji: '🛁' }
        ];

        const item = compounds[this._rand(0, compounds.length - 1)];
        const roll = Math.random();

        // V37: "Which IS a compound word?" (25%)
        if (roll < 0.25) {
            const notCompound = ['running', 'playing', 'happy', 'garden', 'kitten', 'purple', 'window', 'basket',
                'summer', 'winter', 'Monday', 'kitchen', 'banana', 'dragon', 'turtle', 'ocean'];
            const wrongs = this._shuffle(notCompound).slice(0, 3);
            const answers = this._shuffle([item.word, ...wrongs]);
            return {
                question: `🔗 Which is a COMPOUND word?\n(two words put together)`,
                questionSpeak: `Which of these is a compound word? A compound word is two words put together.`,
                answers,
                correctIndex: answers.indexOf(item.word),
                topic: 'compound-words',
                subtype: 'identify-compound',
                explanation: `"${item.word}" = ${item.parts[0]} + ${item.parts[1]}! ${item.emoji}`,
                explanationSpeak: `${item.word} is a compound word! It is made of ${item.parts[0]} and ${item.parts[1]}!`
            };
        }

        // V37: "What does this compound word probably mean?" (20%)
        if (roll < 0.45) {
            const meanings = {
                'sunflower': { correct: 'a flower that faces the sun', wrongs: ['a sun made of flowers', 'a hot flower', 'a yellow sun'] },
                'rainbow': { correct: 'a colorful arc after rain', wrongs: ['a bow made of rain', 'a rainy day', 'a wet bow'] },
                'cupcake': { correct: 'a small cake in a cup shape', wrongs: ['a cup full of cake', 'a cake-shaped cup', 'a big cake'] },
                'starfish': { correct: 'a sea animal shaped like a star', wrongs: ['a fish that glows', 'a star in the sea', 'a flying fish'] },
                'snowman': { correct: 'a figure made of snow', wrongs: ['a man who likes snow', 'a cold person', 'a winter worker'] },
                'football': { correct: 'a ball kicked or thrown in a game', wrongs: ['a foot-shaped ball', 'a ball for your feet', 'shoes for sports'] },
                'bedroom': { correct: 'a room with a bed for sleeping', wrongs: ['a bed-shaped room', 'a bed in a box', 'a room with no bed'] },
                'butterfly': { correct: 'an insect with colorful wings', wrongs: ['butter that flies', 'a flying butter pat', 'a yellow bug'] },
                'popcorn': { correct: 'corn kernels that pop open', wrongs: ['corn that pops up', 'a popping plant', 'music corn'] },
                'backpack': { correct: 'a pack you carry on your back', wrongs: ['a pack behind you', 'going back to pack', 'a backwards bag'] },
                'airplane': { correct: 'a machine that flies through the air', wrongs: ['air that is flat', 'a flat surface', 'a windy plane'] },
                'ladybug': { correct: 'a small red bug with spots', wrongs: ['a bug that is a lady', 'a lady-shaped bug', 'a fancy insect'] }
            };
            if (meanings[item.word]) {
                const m = meanings[item.word];
                const answers = this._shuffle([m.correct, ...m.wrongs.slice(0, 3)]);
                return {
                    question: `🔗 ${item.emoji} What does "${item.word}" probably mean?`,
                    questionSpeak: `What does the word ${item.word} probably mean?`,
                    answers,
                    correctIndex: answers.indexOf(m.correct),
                    topic: 'compound-words',
                    subtype: 'compound-meaning',
                    explanation: `"${item.word}" = ${item.parts[0]} + ${item.parts[1]} = ${m.correct}!`,
                    explanationSpeak: `${item.word} means ${m.correct}!`
                };
            }
        }

        if (level <= 6 || Math.random() < 0.5) {
            // Which two words make this compound word?
            const correct = item.parts[0] + ' + ' + item.parts[1];
            const wrongPairs = [];
            let att = 0;
            while (wrongPairs.length < 3 && att++ < 50) {
                const other = compounds[this._rand(0, compounds.length - 1)];
                if (other.word === item.word) continue;
                // Mix parts to create wrong answers
                const wrong = this._rand(0, 1) === 0
                    ? item.parts[0] + ' + ' + other.parts[1]
                    : other.parts[0] + ' + ' + item.parts[1];
                if (wrong !== correct && !wrongPairs.includes(wrong)) wrongPairs.push(wrong);
            }
            // Fill remaining if needed
            while (wrongPairs.length < 3) {
                const other = compounds[this._rand(0, compounds.length - 1)];
                const wrong = other.parts[0] + ' + ' + other.parts[1];
                if (wrong !== correct && !wrongPairs.includes(wrong)) wrongPairs.push(wrong);
            }
            const answers = this._shuffle([correct, ...wrongPairs]);
            return {
                question: `${item.emoji} "${item.word}"\nWhich two words make it?`,
                questionSpeak: `Which two words make the word ${item.word}?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'compound-words',
                subtype: 'split-compound',
                explanation: `${item.parts[0]} + ${item.parts[1]} = ${item.word}! ${item.emoji}`,
                explanationSpeak: `${item.parts[0]} plus ${item.parts[1]} makes ${item.word}!`
            };
        } else {
            // What compound word do these make?
            const correct = item.word;
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const other = compounds[this._rand(0, compounds.length - 1)];
                if (other.word !== correct && !wrongs.includes(other.word)) wrongs.push(other.word);
            }
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `${item.parts[0]} + ${item.parts[1]} = ?`,
                questionSpeak: `What word do ${item.parts[0]} and ${item.parts[1]} make together?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'compound-words',
                subtype: 'combine-compound',
                explanation: `${item.parts[0]} + ${item.parts[1]} = ${item.word}! ${item.emoji}`,
                explanationSpeak: `${item.parts[0]} plus ${item.parts[1]} makes ${item.word}!`
            };
        }
    },

    // ---- PREFIX & SUFFIX ----
    _prefixSuffix(level) {
        // V41: 3rd grade dispatch
        if (level >= 8) return this._prefixSuffix3rd(level);

        // V37: "Which word has a prefix?" (25%)
        if (Math.random() < 0.25) {
            const prefixWords = ['unhappy', 'unkind', 'redo', 'replay', 'rewrite', 'unfair', 'unlock', 'untie', 'rebuild', 'restart', 'refill', 'unsafe', 'preheat', 'preview', 'prepay', 'unsure'];
            const noPrefixWords = ['under', 'uncle', 'really', 'receive', 'pretty', 'price', 'umbrella', 'until', 'ready', 'return'];
            const correct = prefixWords[this._rand(0, prefixWords.length - 1)];
            const wrongs = this._shuffle(noPrefixWords).slice(0, 3);
            const answers = this._shuffle([correct, ...wrongs]);
            return {
                question: `🏗️ Which word has a PREFIX?\n(un-, re-, or pre-)`,
                questionSpeak: `Which word has a prefix like un, re, or pre?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'prefix-suffix',
                subtype: 'find-prefix',
                explanation: `"${correct}" has a prefix! Can you see it at the beginning?`,
                explanationSpeak: `${correct} has a prefix at the beginning!`
            };
        }

        if (level <= 6 || Math.random() < 0.5) {
            // Prefixes: un-, re-, pre-
            const prefixes = [
                { prefix: 'un-', meaning: 'not', words: [
                    { base: 'happy', result: 'unhappy', meaning: 'not happy' },
                    { base: 'kind', result: 'unkind', meaning: 'not kind' },
                    { base: 'fair', result: 'unfair', meaning: 'not fair' },
                    { base: 'safe', result: 'unsafe', meaning: 'not safe' },
                    { base: 'lock', result: 'unlock', meaning: 'not locked' },
                    { base: 'do', result: 'undo', meaning: 'reverse doing' },
                    { base: 'tie', result: 'untie', meaning: 'not tied' },
                    { base: 'sure', result: 'unsure', meaning: 'not sure' }
                ]},
                { prefix: 're-', meaning: 'again', words: [
                    { base: 'read', result: 'reread', meaning: 'read again' },
                    { base: 'do', result: 'redo', meaning: 'do again' },
                    { base: 'play', result: 'replay', meaning: 'play again' },
                    { base: 'build', result: 'rebuild', meaning: 'build again' },
                    { base: 'write', result: 'rewrite', meaning: 'write again' },
                    { base: 'start', result: 'restart', meaning: 'start again' },
                    { base: 'fill', result: 'refill', meaning: 'fill again' },
                    { base: 'tell', result: 'retell', meaning: 'tell again' }
                ]},
                { prefix: 'pre-', meaning: 'before', words: [
                    { base: 'heat', result: 'preheat', meaning: 'heat before' },
                    { base: 'view', result: 'preview', meaning: 'view before' },
                    { base: 'pay', result: 'prepay', meaning: 'pay before' },
                    { base: 'school', result: 'preschool', meaning: 'before school' },
                    { base: 'game', result: 'pregame', meaning: 'before the game' },
                    { base: 'test', result: 'pretest', meaning: 'test before' }
                ]}
            ];
            const group = prefixes[this._rand(0, prefixes.length - 1)];
            const item = group.words[this._rand(0, group.words.length - 1)];
            const answers = this._shuffle([item.meaning, `${item.base} a lot`, `after ${item.base}`, `very ${item.base}`]);
            return {
                question: `What does "${item.result}" mean?\n(${group.prefix} means "${group.meaning}")`,
                questionSpeak: `What does ${item.result} mean? The prefix ${group.prefix.replace('-','')} means ${group.meaning}.`,
                answers,
                correctIndex: answers.indexOf(item.meaning),
                topic: 'prefix-suffix',
                subtype: 'prefix-meaning',
                explanation: `"${item.result}" = ${group.prefix} + ${item.base} = ${item.meaning}!`,
                explanationSpeak: `${item.result} means ${item.meaning}! The prefix ${group.prefix.replace('-','')} means ${group.meaning}!`
            };
        } else {
            // Suffixes: -ful, -less, -ly, -er, -est
            const suffixes = [
                { suffix: '-ful', meaning: 'full of', words: [
                    { base: 'hope', result: 'hopeful', meaning: 'full of hope' },
                    { base: 'care', result: 'careful', meaning: 'full of care' },
                    { base: 'joy', result: 'joyful', meaning: 'full of joy' },
                    { base: 'play', result: 'playful', meaning: 'full of play' },
                    { base: 'help', result: 'helpful', meaning: 'full of help' },
                    { base: 'thank', result: 'thankful', meaning: 'full of thanks' },
                    { base: 'color', result: 'colorful', meaning: 'full of color' },
                    { base: 'cheer', result: 'cheerful', meaning: 'full of cheer' }
                ]},
                { suffix: '-less', meaning: 'without', words: [
                    { base: 'hope', result: 'hopeless', meaning: 'without hope' },
                    { base: 'care', result: 'careless', meaning: 'without care' },
                    { base: 'help', result: 'helpless', meaning: 'without help' },
                    { base: 'sleep', result: 'sleepless', meaning: 'without sleep' },
                    { base: 'fear', result: 'fearless', meaning: 'without fear' },
                    { base: 'end', result: 'endless', meaning: 'without end' }
                ]},
                { suffix: '-ly', meaning: 'in a way that is', words: [
                    { base: 'quick', result: 'quickly', meaning: 'in a quick way' },
                    { base: 'slow', result: 'slowly', meaning: 'in a slow way' },
                    { base: 'kind', result: 'kindly', meaning: 'in a kind way' },
                    { base: 'brave', result: 'bravely', meaning: 'in a brave way' },
                    { base: 'loud', result: 'loudly', meaning: 'in a loud way' },
                    { base: 'soft', result: 'softly', meaning: 'in a soft way' },
                    { base: 'safe', result: 'safely', meaning: 'in a safe way' },
                    { base: 'quiet', result: 'quietly', meaning: 'in a quiet way' }
                ]},
                { suffix: '-er', meaning: 'more / one who', words: [
                    { base: 'tall', result: 'taller', meaning: 'more tall' },
                    { base: 'fast', result: 'faster', meaning: 'more fast' },
                    { base: 'teach', result: 'teacher', meaning: 'one who teaches' },
                    { base: 'read', result: 'reader', meaning: 'one who reads' },
                    { base: 'sing', result: 'singer', meaning: 'one who sings' },
                    { base: 'play', result: 'player', meaning: 'one who plays' }
                ]},
                { suffix: '-est', meaning: 'the most', words: [
                    { base: 'tall', result: 'tallest', meaning: 'the most tall' },
                    { base: 'fast', result: 'fastest', meaning: 'the most fast' },
                    { base: 'big', result: 'biggest', meaning: 'the most big' },
                    { base: 'small', result: 'smallest', meaning: 'the most small' },
                    { base: 'long', result: 'longest', meaning: 'the most long' },
                    { base: 'short', result: 'shortest', meaning: 'the most short' }
                ]}
            ];
            const group = suffixes[this._rand(0, suffixes.length - 1)];
            const item = group.words[this._rand(0, group.words.length - 1)];
            const answers = this._shuffle([item.meaning, `${item.base} a lot`, `before ${item.base}`, `not ${item.base}`]);
            return {
                question: `What does "${item.result}" mean?\n(${group.suffix} means "${group.meaning}")`,
                questionSpeak: `What does ${item.result} mean? The suffix ${group.suffix.replace('-','')} means ${group.meaning}.`,
                answers,
                correctIndex: answers.indexOf(item.meaning),
                topic: 'prefix-suffix',
                subtype: 'suffix-meaning',
                explanation: `"${item.result}" = ${item.base} + ${group.suffix} = ${item.meaning}!`,
                explanationSpeak: `${item.result} means ${item.meaning}! The suffix ${group.suffix.replace('-','')} means ${group.meaning}!`
            };
        }
    },

    // ---- GRAMMAR: nouns, verbs, adjectives ----
    _grammar(level) {
        // V41: 3rd grade dispatch
        if (level >= 8) return this._grammar3rd(level);

        const roll = Math.random();

        // V37: Past or present tense? (20%)
        if (roll < 0.2) {
            const tenseItems = [
                { sentence: 'The dog runs fast.', correct: 'Present', verb: 'runs' },
                { sentence: 'She walked to school.', correct: 'Past', verb: 'walked' },
                { sentence: 'He eats his lunch.', correct: 'Present', verb: 'eats' },
                { sentence: 'They played outside.', correct: 'Past', verb: 'played' },
                { sentence: 'The bird sings a song.', correct: 'Present', verb: 'sings' },
                { sentence: 'Mom cooked dinner.', correct: 'Past', verb: 'cooked' },
                { sentence: 'I read my book.', correct: 'Present', verb: 'read' },
                { sentence: 'The cat jumped high.', correct: 'Past', verb: 'jumped' },
                { sentence: 'We swim in the pool.', correct: 'Present', verb: 'swim' },
                { sentence: 'She painted a picture.', correct: 'Past', verb: 'painted' },
                { sentence: 'He rides his bike.', correct: 'Present', verb: 'rides' },
                { sentence: 'They danced at the party.', correct: 'Past', verb: 'danced' },
                { sentence: 'The baby cries a lot.', correct: 'Present', verb: 'cries' },
                { sentence: 'We climbed the hill.', correct: 'Past', verb: 'climbed' }
            ];
            const tItem = tenseItems[this._rand(0, tenseItems.length - 1)];
            const answers = this._shuffle(['Past', 'Present', 'Future', 'Not sure']);
            return {
                question: `📝 Is this PAST or PRESENT?\n"${tItem.sentence}"`,
                questionSpeak: `Is this sentence past or present tense? ${tItem.sentence}`,
                answers,
                correctIndex: answers.indexOf(tItem.correct),
                topic: 'grammar',
                subtype: 'verb-tense',
                explanation: `"${tItem.verb}" is ${tItem.correct.toLowerCase()} tense! ${tItem.correct === 'Past' ? 'It already happened!' : 'It is happening now!'}`,
                explanationSpeak: `${tItem.verb} is ${tItem.correct.toLowerCase()} tense. ${tItem.correct === 'Past' ? 'It already happened!' : 'It is happening now!'}`
            };
        }

        // V37: "Sentence or fragment?" (15%)
        if (roll < 0.35) {
            const items = [
                { text: 'The cat sat on the mat.', isSentence: true },
                { text: 'Running very fast.', isSentence: false },
                { text: 'She ate her lunch.', isSentence: true },
                { text: 'The big red.', isSentence: false },
                { text: 'We went to the park.', isSentence: true },
                { text: 'Under the table.', isSentence: false },
                { text: 'He rides his bike.', isSentence: true },
                { text: 'Very cold and windy.', isSentence: false },
                { text: 'The fish swam in the pond.', isSentence: true },
                { text: 'Because she was tired.', isSentence: false },
                { text: 'My dog is funny.', isSentence: true },
                { text: 'The tall green tree.', isSentence: false },
                { text: 'Birds fly south in winter.', isSentence: true },
                { text: 'After the game.', isSentence: false }
            ];
            const sItem = items[this._rand(0, items.length - 1)];
            const correct = sItem.isSentence ? 'Sentence ✓' : 'Fragment ✗';
            const answers = this._shuffle(['Sentence ✓', 'Fragment ✗', 'Question ?', 'Not sure']);
            return {
                question: `📝 Sentence or fragment?\n"${sItem.text}"`,
                questionSpeak: `Is this a complete sentence or a fragment? ${sItem.text}`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'grammar',
                subtype: 'sentence-or-fragment',
                explanation: sItem.isSentence
                    ? `It's a sentence! It has a subject and a verb and makes sense on its own!`
                    : `It's a fragment! It's missing a subject or verb and doesn't make complete sense!`,
                explanationSpeak: sItem.isSentence
                    ? `It is a complete sentence! It has a subject and a verb!`
                    : `It is a fragment! It is missing something and does not make complete sense!`
            };
        }

        if (roll < 0.55) {
            // Identify nouns
            const nouns = [
                { word: 'dog', sentence: 'The dog ran fast.' },
                { word: 'school', sentence: 'I love school.' },
                { word: 'cake', sentence: 'She baked a cake.' },
                { word: 'park', sentence: 'We played at the park.' },
                { word: 'teacher', sentence: 'The teacher was kind.' },
                { word: 'book', sentence: 'He read a book.' },
                { word: 'ocean', sentence: 'The ocean is big.' },
                { word: 'friend', sentence: 'My friend is funny.' },
                { word: 'kitchen', sentence: 'Mom cooked in the kitchen.' },
                { word: 'garden', sentence: 'Flowers grow in the garden.' }
            ];
            const item = nouns[this._rand(0, nouns.length - 1)];
            const notNouns = ['ran', 'happy', 'quickly', 'big', 'jumped', 'pretty', 'slowly', 'fast'];
            const wrongs = this._shuffle(notNouns).slice(0, 3);
            const answers = this._shuffle([item.word, ...wrongs]);
            return {
                question: `Find the NOUN:\n"${item.sentence}"`,
                questionSpeak: `Find the noun in this sentence. ${item.sentence}`,
                answers,
                correctIndex: answers.indexOf(item.word),
                topic: 'grammar',
                subtype: 'find-noun',
                explanation: `"${item.word}" is a noun! A noun is a person, place, or thing!`,
                explanationSpeak: `${item.word} is a noun! A noun is a person, place, or thing!`
            };
        } else if (roll < 0.7) {
            // Identify verbs
            const verbs = [
                { word: 'ran', sentence: 'The boy ran home.' },
                { word: 'jumped', sentence: 'The frog jumped high.' },
                { word: 'reads', sentence: 'She reads every day.' },
                { word: 'sings', sentence: 'He sings a song.' },
                { word: 'cooked', sentence: 'Mom cooked dinner.' },
                { word: 'swam', sentence: 'The fish swam fast.' },
                { word: 'painted', sentence: 'She painted a picture.' },
                { word: 'climbed', sentence: 'The cat climbed the tree.' },
                { word: 'danced', sentence: 'They danced at the party.' },
                { word: 'writes', sentence: 'He writes a letter.' }
            ];
            const item = verbs[this._rand(0, verbs.length - 1)];
            const notVerbs = ['dog', 'happy', 'school', 'big', 'pretty', 'park', 'green', 'tall'];
            const wrongs = this._shuffle(notVerbs).slice(0, 3);
            const answers = this._shuffle([item.word, ...wrongs]);
            return {
                question: `Find the VERB:\n"${item.sentence}"`,
                questionSpeak: `Find the verb in this sentence. ${item.sentence}`,
                answers,
                correctIndex: answers.indexOf(item.word),
                topic: 'grammar',
                subtype: 'find-verb',
                explanation: `"${item.word}" is a verb! A verb is an action word — something you DO!`,
                explanationSpeak: `${item.word} is a verb! A verb is an action word!`
            };
        } else {
            // Identify adjectives
            const adjectives = [
                { word: 'big', sentence: 'The big dog barked.' },
                { word: 'red', sentence: 'She wore a red hat.' },
                { word: 'funny', sentence: 'The funny clown laughed.' },
                { word: 'cold', sentence: 'The cold wind blew.' },
                { word: 'happy', sentence: 'The happy girl smiled.' },
                { word: 'tall', sentence: 'The tall tree swayed.' },
                { word: 'soft', sentence: 'The soft blanket felt nice.' },
                { word: 'brave', sentence: 'The brave knight fought.' },
                { word: 'shiny', sentence: 'The shiny star twinkled.' },
                { word: 'tiny', sentence: 'The tiny ant crawled.' }
            ];
            const item = adjectives[this._rand(0, adjectives.length - 1)];
            const notAdj = ['dog', 'ran', 'school', 'jumped', 'swam', 'book', 'teacher', 'cooked'];
            const wrongs = this._shuffle(notAdj).slice(0, 3);
            const answers = this._shuffle([item.word, ...wrongs]);
            return {
                question: `Find the ADJECTIVE:\n"${item.sentence}"`,
                questionSpeak: `Find the adjective in this sentence. ${item.sentence}`,
                answers,
                correctIndex: answers.indexOf(item.word),
                topic: 'grammar',
                subtype: 'find-adjective',
                explanation: `"${item.word}" is an adjective! It describes the noun!`,
                explanationSpeak: `${item.word} is an adjective! It's a describing word!`
            };
        }
    },

    // ---- CONTRACTIONS ----
    _contractions(level) {
        const contractionList = [
            { contraction: "can't", full: 'can not', words: ['can', 'not'] },
            { contraction: "don't", full: 'do not', words: ['do', 'not'] },
            { contraction: "it's", full: 'it is', words: ['it', 'is'] },
            { contraction: "I'm", full: 'I am', words: ['I', 'am'] },
            { contraction: "he's", full: 'he is', words: ['he', 'is'] },
            { contraction: "she's", full: 'she is', words: ['she', 'is'] },
            { contraction: "we're", full: 'we are', words: ['we', 'are'] },
            { contraction: "they're", full: 'they are', words: ['they', 'are'] },
            { contraction: "isn't", full: 'is not', words: ['is', 'not'] },
            { contraction: "wasn't", full: 'was not', words: ['was', 'not'] },
            { contraction: "didn't", full: 'did not', words: ['did', 'not'] },
            { contraction: "won't", full: 'will not', words: ['will', 'not'] },
            { contraction: "I'll", full: 'I will', words: ['I', 'will'] },
            { contraction: "you're", full: 'you are', words: ['you', 'are'] },
            { contraction: "that's", full: 'that is', words: ['that', 'is'] },
            { contraction: "let's", full: 'let us', words: ['let', 'us'] },
            { contraction: "haven't", full: 'have not', words: ['have', 'not'] },
            { contraction: "couldn't", full: 'could not', words: ['could', 'not'] },
            { contraction: "wouldn't", full: 'would not', words: ['would', 'not'] },
            { contraction: "shouldn't", full: 'should not', words: ['should', 'not'] }
        ];

        const item = contractionList[this._rand(0, contractionList.length - 1)];

        // V37: "Fill in the blank with the contraction" (30%)
        if (Math.random() < 0.3) {
            const sentenceTemplates = [
                { full: 'can not', contraction: "can't", sentence: 'I ___ go outside.' },
                { full: 'do not', contraction: "don't", sentence: 'I ___ like spinach.' },
                { full: 'it is', contraction: "it's", sentence: '___ raining today.' },
                { full: 'I am', contraction: "I'm", sentence: '___ going to the park.' },
                { full: 'he is', contraction: "he's", sentence: '___ my best friend.' },
                { full: 'she is', contraction: "she's", sentence: '___ a great singer.' },
                { full: 'we are', contraction: "we're", sentence: '___ going to win!' },
                { full: 'they are', contraction: "they're", sentence: '___ playing outside.' },
                { full: 'is not', contraction: "isn't", sentence: 'It ___ fair!' },
                { full: 'did not', contraction: "didn't", sentence: 'I ___ see it.' },
                { full: 'I will', contraction: "I'll", sentence: '___ help you.' },
                { full: 'you are', contraction: "you're", sentence: '___ doing great!' },
                { full: 'let us', contraction: "let's", sentence: '___ play a game!' },
                { full: 'will not', contraction: "won't", sentence: 'It ___ take long.' }
            ];
            const tItem = sentenceTemplates[this._rand(0, sentenceTemplates.length - 1)];
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const other = contractionList[this._rand(0, contractionList.length - 1)];
                if (other.contraction !== tItem.contraction && !wrongs.includes(other.contraction)) wrongs.push(other.contraction);
            }
            const answers = this._shuffle([tItem.contraction, ...wrongs]);
            return {
                question: `✂️ Fill in the blank:\n"${tItem.sentence}"`,
                questionSpeak: `Fill in the blank: ${tItem.sentence.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(tItem.contraction),
                topic: 'contractions',
                subtype: 'contraction-fill-blank',
                explanation: `"${tItem.contraction}" fits! It's short for "${tItem.full}"!`,
                explanationSpeak: `${tItem.contraction} is correct! It is short for ${tItem.full}!`
            };
        }

        if (level <= 6 || Math.random() < 0.5) {
            // Match contraction to full form
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const other = contractionList[this._rand(0, contractionList.length - 1)];
                if (other.full !== item.full && !wrongs.includes(other.full)) wrongs.push(other.full);
            }
            const answers = this._shuffle([item.full, ...wrongs]);
            return {
                question: `What does "${item.contraction}"\nstand for?`,
                questionSpeak: `What does ${item.contraction} stand for?`,
                answers,
                correctIndex: answers.indexOf(item.full),
                topic: 'contractions',
                subtype: 'expand-contraction',
                explanation: `"${item.contraction}" = "${item.full}"! The apostrophe replaces missing letters!`,
                explanationSpeak: `${item.contraction} stands for ${item.full}!`
            };
        } else {
            // Full form to contraction
            const wrongs = [];
            let att = 0;
            while (wrongs.length < 3 && att++ < 50) {
                const other = contractionList[this._rand(0, contractionList.length - 1)];
                if (other.contraction !== item.contraction && !wrongs.includes(other.contraction)) wrongs.push(other.contraction);
            }
            const answers = this._shuffle([item.contraction, ...wrongs]);
            return {
                question: `Which contraction means\n"${item.full}"?`,
                questionSpeak: `Which contraction means ${item.full}?`,
                answers,
                correctIndex: answers.indexOf(item.contraction),
                topic: 'contractions',
                subtype: 'match-contraction',
                explanation: `"${item.full}" → "${item.contraction}"! We squish the words together!`,
                explanationSpeak: `${item.full} becomes ${item.contraction}!`
            };
        }
    },

    // ---- READING COMPREHENSION ----
    _comprehension(level) {
        // V41: 3rd grade dispatch
        if (level >= 8) return this._comprehension3rd(level);

        const passages = [
            {
                text: 'Sam had a red ball. He threw it to his dog. The dog caught it and ran away!',
                q: 'What did the dog do?',
                correct: 'caught the ball and ran',
                wrongs: ['threw the ball', 'sat and watched', 'went to sleep']
            },
            {
                text: 'Mia went to the store with Mom. They bought milk, bread, and eggs. Then they drove home.',
                q: 'Where did Mia go?',
                correct: 'the store',
                wrongs: ['the park', 'school', 'the library']
            },
            {
                text: 'The frog sat on a lily pad. It was waiting for a fly. When a fly buzzed by, the frog caught it with its tongue!',
                q: 'What was the frog waiting for?',
                correct: 'a fly',
                wrongs: ['a fish', 'another frog', 'rain']
            },
            {
                text: 'Today was the first day of school. Emma felt nervous but excited. She met her new teacher, Mrs. Chen.',
                q: 'How did Emma feel?',
                correct: 'nervous but excited',
                wrongs: ['angry and sad', 'tired and bored', 'silly and goofy']
            },
            {
                text: 'Ben made a snowman in the yard. He used a carrot for the nose and rocks for the eyes. His sister helped him.',
                q: 'What did Ben use for the nose?',
                correct: 'a carrot',
                wrongs: ['a rock', 'a stick', 'a button']
            },
            {
                text: 'The cat climbed up the tall tree. It could not get down! Dad got a ladder and helped the cat down safely.',
                q: 'Who helped the cat?',
                correct: 'Dad',
                wrongs: ['Mom', 'a firefighter', 'the dog']
            },
            {
                text: 'It rained all morning. After lunch the sun came out. The kids ran outside to play in the puddles.',
                q: 'When did the sun come out?',
                correct: 'after lunch',
                wrongs: ['before breakfast', 'at night', 'during school']
            },
            {
                text: 'Lily planted a seed in a pot. She watered it every day. After two weeks, a tiny green sprout appeared!',
                q: 'How long until the sprout appeared?',
                correct: 'two weeks',
                wrongs: ['one day', 'three months', 'one hour']
            },
            {
                text: 'Max lost his favorite toy at the park. He looked everywhere. Finally he found it under the slide!',
                q: 'Where did Max find his toy?',
                correct: 'under the slide',
                wrongs: ['on the swings', 'in the sandbox', 'at home']
            },
            {
                text: 'The bird built a nest in the tree. It used sticks and grass. Soon there were three small blue eggs in it.',
                q: 'What did the bird use to build the nest?',
                correct: 'sticks and grass',
                wrongs: ['rocks and mud', 'paper and tape', 'leaves and flowers']
            },
            {
                text: 'Anna and Jake baked cookies together. They used chocolate chips. The cookies smelled so good that Dad ate five!',
                q: 'How many cookies did Dad eat?',
                correct: 'five',
                wrongs: ['two', 'three', 'ten']
            },
            {
                text: 'The turtle was slow but steady. The rabbit was fast but took a nap. The turtle won the race!',
                q: 'Who won the race?',
                correct: 'the turtle',
                wrongs: ['the rabbit', 'they tied', 'nobody']
            },
            {
                text: 'Pedro brought his pet fish to show and tell. The fish was orange with white stripes. Everyone wanted to see it.',
                q: 'What color was the fish?',
                correct: 'orange with white stripes',
                wrongs: ['blue with red dots', 'all black', 'green and yellow']
            },
            {
                text: 'It was bedtime but Zoe was not sleepy. Mom read her two stories. By the end of the second story, Zoe was asleep.',
                q: 'How many stories did Mom read?',
                correct: 'two',
                wrongs: ['one', 'three', 'four']
            },
            {
                text: 'The farmer had ten chickens. Every morning they laid eggs. The farmer sold the eggs at the market on Saturdays.',
                q: 'When did the farmer sell eggs?',
                correct: 'on Saturdays',
                wrongs: ['every day', 'on Mondays', 'at night']
            },
            {
                text: 'Sofia loves to draw animals. Her favorite animal to draw is a horse. She practices drawing horses every day after school.',
                q: 'What is Sofia\'s favorite animal to draw?',
                correct: 'a horse',
                wrongs: ['a cat', 'a dog', 'a bird']
            }
        ];

        const roll = Math.random();

        // V37: "What is the story mainly about?" — main idea (25%)
        if (roll < 0.25) {
            const mainIdeaPassages = [
                { text: 'Dogs make great pets. They play fetch and love to cuddle. Dogs can learn tricks too!',
                  correct: 'Dogs are great pets', wrongs: ['Cats are better', 'Tricks are hard', 'Fetch is fun'] },
                { text: 'Fall is a beautiful time. The leaves turn red and orange. The air is cool and crisp.',
                  correct: 'Fall is beautiful', wrongs: ['Leaves are green', 'Winter is cold', 'Summer is hot'] },
                { text: 'Bees are very busy. They fly from flower to flower. They help plants grow and make honey.',
                  correct: 'Bees are busy and helpful', wrongs: ['Honey tastes good', 'Flowers are pretty', 'Bees are scary'] },
                { text: 'Brushing your teeth is important. It keeps your teeth clean and healthy. You should brush twice a day.',
                  correct: 'Brushing teeth is important', wrongs: ['Teeth are white', 'Dentists are nice', 'Toothpaste is yummy'] },
                { text: 'The library is a quiet place. You can read books and use computers. The librarian helps you find what you need.',
                  correct: 'What you can do at the library', wrongs: ['Computers are fun', 'Books are heavy', 'Libraries are old'] },
                { text: 'Baby birds need their mom. She builds a nest and feeds them worms. Soon the baby birds learn to fly.',
                  correct: 'Baby birds need their mom to grow up', wrongs: ['Worms are yucky', 'Nests are made of sticks', 'Flying is hard'] },
                { text: 'Water is important for our body. We should drink water every day. It helps us stay healthy and strong.',
                  correct: 'Water is important for health', wrongs: ['Juice is better', 'Milk is white', 'Soda is fizzy'] },
                { text: 'Recycling helps the Earth. We can recycle paper, plastic, and cans. When we recycle, we make less trash.',
                  correct: 'Recycling helps the Earth', wrongs: ['Trash is smelly', 'Cans are metal', 'Paper comes from trees'] }
            ];
            const mItem = mainIdeaPassages[this._rand(0, mainIdeaPassages.length - 1)];
            const answers = this._shuffle([mItem.correct, ...mItem.wrongs]);
            return {
                question: `Read this:\n"${mItem.text}"\n\nWhat is it MAINLY about?`,
                questionSpeak: `${mItem.text} What is this mainly about?`,
                answers,
                correctIndex: answers.indexOf(mItem.correct),
                topic: 'comprehension',
                subtype: 'main-idea',
                explanation: `The main idea is "${mItem.correct}"! That's what the whole passage is about!`,
                explanationSpeak: `The main idea is ${mItem.correct}! That is what the whole story is about!`
            };
        }

        // V37: "What will probably happen next?" — prediction (20%)
        if (roll < 0.45) {
            const predictionPassages = [
                { text: 'Mia put on her swimsuit. She grabbed a towel and sunscreen. Mom said the pool was ready.',
                  correct: 'go swimming', wrongs: ['go to bed', 'eat dinner', 'read a book'] },
                { text: 'Dark clouds filled the sky. The wind started to blow. Mom said to come inside.',
                  correct: 'it will rain', wrongs: ['it will snow', 'the sun will come out', 'they will go for a walk'] },
                { text: 'The cake was in the oven. Timer went off! Dad put on oven mitts.',
                  correct: 'take the cake out', wrongs: ['go to the store', 'make more batter', 'turn off the lights'] },
                { text: 'Ben yawned and rubbed his eyes. He put on pajamas and brushed his teeth.',
                  correct: 'go to bed', wrongs: ['go outside to play', 'eat breakfast', 'go to school'] },
                { text: 'The dog grabbed its leash. It wagged its tail and ran to the door.',
                  correct: 'go for a walk', wrongs: ['take a nap', 'eat dinner', 'take a bath'] },
                { text: 'Emma opened her backpack. She took out a pencil and a notebook. The teacher said good morning.',
                  correct: 'start doing schoolwork', wrongs: ['go home', 'eat lunch', 'play at recess'] },
                { text: 'The baby bird stood on the edge of the nest. It spread its wings. Mama bird watched closely.',
                  correct: 'try to fly', wrongs: ['go back to sleep', 'eat a worm', 'sing a song'] },
                { text: 'Jake put candles on the cake. His friends were coming over. The balloons were all set up.',
                  correct: 'have a birthday party', wrongs: ['go to the store', 'clean his room', 'go to school'] }
            ];
            const pItem = predictionPassages[this._rand(0, predictionPassages.length - 1)];
            const answers = this._shuffle([pItem.correct, ...pItem.wrongs]);
            return {
                question: `Read this:\n"${pItem.text}"\n\nWhat will PROBABLY happen next?`,
                questionSpeak: `${pItem.text} What will probably happen next?`,
                answers,
                correctIndex: answers.indexOf(pItem.correct),
                topic: 'comprehension',
                subtype: 'prediction',
                explanation: `"${pItem.correct}" makes the most sense based on the clues in the story!`,
                explanationSpeak: `${pItem.correct} is most likely! The clues in the story tell us what will happen!`
            };
        }

        // Original: detail questions from passage
        const passage = passages[this._rand(0, passages.length - 1)];
        const answers = this._shuffle([passage.correct, ...passage.wrongs]);
        return {
            question: `Read this:\n"${passage.text}"\n\n${passage.q}`,
            questionSpeak: `${passage.text} ${passage.q}`,
            answers,
            correctIndex: answers.indexOf(passage.correct),
            topic: 'comprehension',
            subtype: 'passage-question',
            explanation: `The answer is "${passage.correct}"! Good reading!`,
            explanationSpeak: `The answer is ${passage.correct}! Great job reading and understanding the story!`
        };
    },

    // ===== V34 NEW TOPICS =====

    // ---- SPELLING ----
    _spelling(level) {
        const easyWords = [
            { word: 'cat', wrongs: ['kat', 'cta', 'kat'] },
            { word: 'dog', wrongs: ['dag', 'dgo', 'bog'] },
            { word: 'hat', wrongs: ['het', 'hta', 'hut'] },
            { word: 'bed', wrongs: ['bad', 'bde', 'ded'] },
            { word: 'sun', wrongs: ['san', 'snu', 'son'] },
            { word: 'cup', wrongs: ['kup', 'cep', 'cub'] },
            { word: 'run', wrongs: ['ran', 'rnu', 'ren'] },
            { word: 'pig', wrongs: ['peg', 'pgi', 'big'] },
            { word: 'map', wrongs: ['mep', 'mpa', 'nap'] },
            { word: 'ten', wrongs: ['tin', 'tne', 'tan'] },
            { word: 'box', wrongs: ['bax', 'bex', 'bok'] },
            { word: 'hop', wrongs: ['hap', 'hpo', 'hip'] },
            { word: 'net', wrongs: ['nat', 'nte', 'nit'] },
            { word: 'red', wrongs: ['rad', 'rde', 'rid'] },
            { word: 'sit', wrongs: ['sat', 'set', 'sut'] }
        ];
        const hardWords = [
            { word: 'house', wrongs: ['hous', 'howse', 'hoose'] },
            { word: 'school', wrongs: ['skool', 'scool', 'shcool'] },
            { word: 'friend', wrongs: ['frend', 'freind', 'frind'] },
            { word: 'water', wrongs: ['woter', 'watter', 'watar'] },
            { word: 'plant', wrongs: ['plent', 'plantt', 'plont'] },
            { word: 'happy', wrongs: ['hapy', 'happie', 'heppy'] },
            { word: 'night', wrongs: ['nite', 'nigt', 'niht'] },
            { word: 'write', wrongs: ['rite', 'writ', 'wriet'] },
            { word: 'about', wrongs: ['abowt', 'abut', 'aboat'] },
            { word: 'light', wrongs: ['lite', 'liht', 'lihgt'] },
            { word: 'would', wrongs: ['woud', 'wood', 'wuld'] },
            { word: 'people', wrongs: ['peple', 'peeple', 'peopel'] },
            { word: 'could', wrongs: ['coud', 'culd', 'cood'] },
            { word: 'little', wrongs: ['litle', 'littel', 'litl'] },
            { word: 'because', wrongs: ['becuz', 'becaus', 'becose'] }
        ];

        const pool = level < 4 ? easyWords : hardWords;
        const item = pool[this._rand(0, pool.length - 1)];
        const roll = Math.random();

        // V37: "Which is misspelled?" format (30%)
        if (roll < 0.3) {
            const misspelled = item.wrongs[this._rand(0, item.wrongs.length - 1)];
            const others = [];
            const usedWords = new Set([item.word]);
            let att = 0;
            while (others.length < 3 && att++ < 50) {
                const other = pool[this._rand(0, pool.length - 1)];
                if (!usedWords.has(other.word)) { others.push(other.word); usedWords.add(other.word); }
            }
            const answers = this._shuffle([misspelled, ...others]);
            return {
                question: `✏️ Which word is spelled WRONG?`,
                questionSpeak: `Which word is spelled wrong?`,
                answers,
                correctIndex: answers.indexOf(misspelled),
                topic: 'spelling',
                subtype: 'find-misspelled',
                explanation: `"${misspelled}" is wrong! It should be "${item.word}"!`,
                explanationSpeak: `${misspelled} is wrong! It should be spelled ${item.word}!`
            };
        }

        // V37: "What letter is missing?" format (25%)
        if (roll < 0.55) {
            const word = item.word;
            const pos = this._rand(1, word.length - 2); // don't remove first or last
            const missing = word[pos];
            const blanked = word.slice(0, pos) + '_' + word.slice(pos + 1);
            const wrongLetters = [];
            const vowels = 'aeiou';
            const consonants = 'bcdfghjklmnpqrstvwxyz';
            const isVowel = vowels.includes(missing);
            const letterPool = isVowel ? vowels : consonants;
            let att = 0;
            while (wrongLetters.length < 3 && att++ < 50) {
                const l = letterPool[this._rand(0, letterPool.length - 1)];
                if (l !== missing && !wrongLetters.includes(l)) wrongLetters.push(l);
            }
            const answers = this._shuffle([missing, ...wrongLetters]);
            return {
                question: `✏️ What letter is missing?\n"${blanked}"`,
                questionSpeak: `What letter is missing in the word ${blanked.replace('_', 'blank')}?`,
                answers,
                correctIndex: answers.indexOf(missing),
                topic: 'spelling',
                subtype: 'missing-letter',
                explanation: `The missing letter is "${missing}"! The word is "${word}"!`,
                explanationSpeak: `The missing letter is ${missing}! The word is ${word}!`
            };
        }

        // Original: "Which is spelled correctly?"
        const wrongs = this._shuffle(item.wrongs).slice(0, 3);
        const answers = this._shuffle([item.word, ...wrongs]);

        return {
            question: `✏️ Which is spelled correctly?`,
            questionSpeak: `Which word is spelled correctly?`,
            answers,
            correctIndex: answers.indexOf(item.word),
            topic: 'spelling',
            subtype: level < 4 ? 'easy-spelling' : 'hard-spelling',
            explanation: `"${item.word}" is the correct spelling!`,
            explanationSpeak: `${item.word} is the correct spelling! Good job!`
        };
    },

    // ---- ANTONYMS ----
    _antonyms(level) {
        const easyPairs = [
            { word: 'big', opposite: 'small', wrongs: ['tall', 'round', 'blue'] },
            { word: 'hot', opposite: 'cold', wrongs: ['warm', 'nice', 'red'] },
            { word: 'up', opposite: 'down', wrongs: ['over', 'out', 'in'] },
            { word: 'fast', opposite: 'slow', wrongs: ['quick', 'loud', 'long'] },
            { word: 'happy', opposite: 'sad', wrongs: ['glad', 'mad', 'shy'] },
            { word: 'day', opposite: 'night', wrongs: ['sun', 'time', 'dark'] },
            { word: 'old', opposite: 'new', wrongs: ['young', 'nice', 'big'] },
            { word: 'stop', opposite: 'go', wrongs: ['wait', 'run', 'sit'] },
            { word: 'wet', opposite: 'dry', wrongs: ['cold', 'warm', 'soft'] },
            { word: 'on', opposite: 'off', wrongs: ['up', 'out', 'in'] },
            { word: 'open', opposite: 'close', wrongs: ['shut', 'push', 'pull'] },
            { word: 'hard', opposite: 'soft', wrongs: ['easy', 'rough', 'flat'] },
            { word: 'tall', opposite: 'short', wrongs: ['big', 'wide', 'thin'] },
            { word: 'full', opposite: 'empty', wrongs: ['big', 'round', 'flat'] },
            { word: 'clean', opposite: 'dirty', wrongs: ['neat', 'nice', 'tidy'] }
        ];
        const hardPairs = [
            { word: 'brave', opposite: 'scared', wrongs: ['strong', 'fast', 'kind'] },
            { word: 'quiet', opposite: 'loud', wrongs: ['soft', 'calm', 'still'] },
            { word: 'early', opposite: 'late', wrongs: ['quick', 'soon', 'first'] },
            { word: 'push', opposite: 'pull', wrongs: ['shove', 'press', 'grab'] },
            { word: 'light', opposite: 'heavy', wrongs: ['bright', 'white', 'thin'] },
            { word: 'smooth', opposite: 'rough', wrongs: ['flat', 'soft', 'hard'] },
            { word: 'sweet', opposite: 'sour', wrongs: ['yummy', 'nice', 'good'] },
            { word: 'begin', opposite: 'end', wrongs: ['start', 'first', 'try'] },
            { word: 'always', opposite: 'never', wrongs: ['often', 'maybe', 'once'] },
            { word: 'laugh', opposite: 'cry', wrongs: ['smile', 'grin', 'joke'] },
            { word: 'above', opposite: 'below', wrongs: ['over', 'under', 'near'] },
            { word: 'strong', opposite: 'weak', wrongs: ['tough', 'hard', 'big'] },
            { word: 'asleep', opposite: 'awake', wrongs: ['tired', 'sleepy', 'calm'] },
            { word: 'remember', opposite: 'forget', wrongs: ['think', 'know', 'learn'] },
            { word: 'truth', opposite: 'lie', wrongs: ['fact', 'real', 'true'] }
        ];

        const pool = level < 4 ? easyPairs : hardPairs;
        const item = pool[this._rand(0, pool.length - 1)];
        const roll = Math.random();

        // V37: "Fill in the blank with the opposite" (30%)
        if (roll < 0.3) {
            const sentencePairs = [
                { context: 'The ice cream is cold. The soup is ___', word: 'hot', opp: 'cold' },
                { context: 'The elephant is big. The ant is ___', word: 'small', opp: 'big' },
                { context: 'She was happy. Then she felt ___', word: 'sad', opp: 'happy' },
                { context: 'The cheetah is fast. The turtle is ___', word: 'slow', opp: 'fast' },
                { context: 'The lamp is on. Now it is ___', word: 'off', opp: 'on' },
                { context: 'The room was loud. Now it is ___', word: 'quiet', opp: 'loud' },
                { context: 'The box was full. Now it is ___', word: 'empty', opp: 'full' },
                { context: 'The road goes up. Then it goes ___', word: 'down', opp: 'up' },
                { context: 'The pillow is soft. The rock is ___', word: 'hard', opp: 'soft' },
                { context: 'The window is open. Please ___ it', word: 'close', opp: 'open' },
                { context: 'The giraffe is tall. The mouse is ___', word: 'short', opp: 'tall' },
                { context: 'It was day. Now it is ___', word: 'night', opp: 'day' },
                { context: 'The clothes are wet. Put them out to get ___', word: 'dry', opp: 'wet' },
                { context: 'My shoes are old. I want ___ ones', word: 'new', opp: 'old' },
                { context: 'The shirt is clean. The pants are ___', word: 'dirty', opp: 'clean' }
            ];
            const sItem = sentencePairs[this._rand(0, sentencePairs.length - 1)];
            const sWrongs = pool.filter(p => p.opposite !== sItem.word).map(p => p.opposite);
            const picks = this._shuffle(sWrongs).slice(0, 3);
            const answers = this._shuffle([sItem.word, ...picks]);
            return {
                question: `↔️ ${sItem.context}`,
                questionSpeak: `${sItem.context.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(sItem.word),
                topic: 'antonyms',
                subtype: 'antonym-fill-blank',
                explanation: `"${sItem.word}" is the opposite of "${sItem.opp}"!`,
                explanationSpeak: `${sItem.word} is the opposite of ${sItem.opp}!`
            };
        }

        // V37: "Which pair are opposites?" (25%)
        if (roll < 0.55) {
            const correctPair = `${item.word} / ${item.opposite}`;
            const wrongPairs = [];
            let att = 0;
            while (wrongPairs.length < 3 && att++ < 50) {
                const p1 = pool[this._rand(0, pool.length - 1)];
                const p2 = pool[this._rand(0, pool.length - 1)];
                if (p1.word !== p2.word) {
                    const fake = `${p1.word} / ${p2.opposite}`;
                    if (fake !== correctPair && !wrongPairs.includes(fake)) wrongPairs.push(fake);
                }
            }
            const answers = this._shuffle([correctPair, ...wrongPairs]);
            return {
                question: `↔️ Which pair are OPPOSITES?`,
                questionSpeak: `Which pair of words are opposites?`,
                answers,
                correctIndex: answers.indexOf(correctPair),
                topic: 'antonyms',
                subtype: 'antonym-pair',
                explanation: `"${item.word}" and "${item.opposite}" are opposites!`,
                explanationSpeak: `${item.word} and ${item.opposite} are opposites!`
            };
        }

        // Original: "What is the opposite?"
        const answers = this._shuffle([item.opposite, ...item.wrongs.slice(0, 3)]);
        return {
            question: `↔️ What is the OPPOSITE of "${item.word}"?`,
            questionSpeak: `What is the opposite of ${item.word}?`,
            answers,
            correctIndex: answers.indexOf(item.opposite),
            topic: 'antonyms',
            subtype: level < 4 ? 'easy-antonym' : 'hard-antonym',
            explanation: `The opposite of "${item.word}" is "${item.opposite}"!`,
            explanationSpeak: `The opposite of ${item.word} is ${item.opposite}!`
        };
    },

    // ---- SYNONYMS ----
    _synonyms(level) {
        const easyPairs = [
            { word: 'happy', synonym: 'glad', wrongs: ['sad', 'mad', 'slow'] },
            { word: 'big', synonym: 'large', wrongs: ['tiny', 'fast', 'old'] },
            { word: 'fast', synonym: 'quick', wrongs: ['slow', 'tall', 'soft'] },
            { word: 'small', synonym: 'tiny', wrongs: ['big', 'tall', 'wide'] },
            { word: 'mad', synonym: 'angry', wrongs: ['happy', 'sad', 'shy'] },
            { word: 'sad', synonym: 'unhappy', wrongs: ['glad', 'funny', 'nice'] },
            { word: 'cold', synonym: 'chilly', wrongs: ['hot', 'warm', 'soft'] },
            { word: 'pretty', synonym: 'beautiful', wrongs: ['ugly', 'plain', 'dark'] },
            { word: 'smart', synonym: 'clever', wrongs: ['silly', 'slow', 'loud'] },
            { word: 'loud', synonym: 'noisy', wrongs: ['quiet', 'soft', 'calm'] },
            { word: 'nice', synonym: 'kind', wrongs: ['mean', 'rude', 'cold'] },
            { word: 'scared', synonym: 'afraid', wrongs: ['brave', 'bold', 'calm'] },
            { word: 'funny', synonym: 'silly', wrongs: ['sad', 'boring', 'mean'] },
            { word: 'start', synonym: 'begin', wrongs: ['stop', 'end', 'wait'] },
            { word: 'shut', synonym: 'close', wrongs: ['open', 'push', 'lock'] }
        ];
        const hardPairs = [
            { word: 'difficult', synonym: 'hard', wrongs: ['easy', 'soft', 'fun'] },
            { word: 'repair', synonym: 'fix', wrongs: ['break', 'build', 'cut'] },
            { word: 'enormous', synonym: 'huge', wrongs: ['tiny', 'thin', 'flat'] },
            { word: 'silent', synonym: 'quiet', wrongs: ['loud', 'noisy', 'wild'] },
            { word: 'leap', synonym: 'jump', wrongs: ['sit', 'walk', 'crawl'] },
            { word: 'wealthy', synonym: 'rich', wrongs: ['poor', 'cheap', 'free'] },
            { word: 'discover', synonym: 'find', wrongs: ['lose', 'hide', 'drop'] },
            { word: 'chuckle', synonym: 'laugh', wrongs: ['cry', 'yell', 'sigh'] },
            { word: 'gloomy', synonym: 'dark', wrongs: ['bright', 'sunny', 'warm'] },
            { word: 'reply', synonym: 'answer', wrongs: ['ask', 'listen', 'wait'] },
            { word: 'terrified', synonym: 'scared', wrongs: ['brave', 'calm', 'bold'] },
            { word: 'simple', synonym: 'easy', wrongs: ['hard', 'tricky', 'long'] },
            { word: 'rush', synonym: 'hurry', wrongs: ['wait', 'rest', 'stop'] },
            { word: 'speak', synonym: 'talk', wrongs: ['listen', 'read', 'write'] },
            { word: 'destroy', synonym: 'wreck', wrongs: ['build', 'make', 'save'] }
        ];

        const pool = level < 5 ? easyPairs : hardPairs;
        const item = pool[this._rand(0, pool.length - 1)];
        const roll = Math.random();

        // V37: "Replace the word" in sentence context (30%)
        if (roll < 0.3) {
            const sentences = [
                { s: 'She was very happy today.', word: 'happy', syn: 'glad' },
                { s: 'The dog is really big.', word: 'big', syn: 'large' },
                { s: 'He ran very fast.', word: 'fast', syn: 'quick' },
                { s: 'Look at that small bug.', word: 'small', syn: 'tiny' },
                { s: 'Mom was mad about the mess.', word: 'mad', syn: 'angry' },
                { s: 'The kitten was so scared.', word: 'scared', syn: 'afraid' },
                { s: 'That movie was really funny.', word: 'funny', syn: 'silly' },
                { s: 'She is a nice person.', word: 'nice', syn: 'kind' },
                { s: 'It is cold outside.', word: 'cold', syn: 'chilly' },
                { s: 'The music was too loud.', word: 'loud', syn: 'noisy' },
                { s: 'He was very smart.', word: 'smart', syn: 'clever' },
                { s: 'The flowers are so pretty.', word: 'pretty', syn: 'beautiful' },
                { s: 'She felt very sad.', word: 'sad', syn: 'unhappy' },
                { s: 'Let\'s start the game!', word: 'start', syn: 'begin' },
                { s: 'Please shut the door.', word: 'shut', syn: 'close' }
            ];
            const sItem = sentences[this._rand(0, sentences.length - 1)];
            const sWrongs = pool.filter(p => p.synonym !== sItem.syn).map(p => p.synonym);
            const picks = this._shuffle(sWrongs).slice(0, 3);
            const answers = this._shuffle([sItem.syn, ...picks]);
            return {
                question: `🔄 "${sItem.s}"\nReplace "${sItem.word}" with:`,
                questionSpeak: `${sItem.s} Replace the word ${sItem.word} with another word that means the same.`,
                answers,
                correctIndex: answers.indexOf(sItem.syn),
                topic: 'synonyms',
                subtype: 'synonym-replace',
                explanation: `"${sItem.syn}" means the same as "${sItem.word}"!`,
                explanationSpeak: `${sItem.syn} means the same as ${sItem.word}!`
            };
        }

        // V37: "Which pair means the same?" (25%)
        if (roll < 0.55) {
            const correctPair = `${item.word} / ${item.synonym}`;
            const wrongPairs = [];
            let att = 0;
            while (wrongPairs.length < 3 && att++ < 50) {
                const p1 = pool[this._rand(0, pool.length - 1)];
                const p2 = pool[this._rand(0, pool.length - 1)];
                if (p1.word !== p2.word) {
                    const fake = `${p1.word} / ${p2.synonym}`;
                    if (fake !== correctPair && !wrongPairs.includes(fake)) wrongPairs.push(fake);
                }
            }
            const answers = this._shuffle([correctPair, ...wrongPairs]);
            return {
                question: `🔄 Which pair means the SAME?`,
                questionSpeak: `Which pair of words mean the same thing?`,
                answers,
                correctIndex: answers.indexOf(correctPair),
                topic: 'synonyms',
                subtype: 'synonym-pair',
                explanation: `"${item.word}" and "${item.synonym}" mean the same thing!`,
                explanationSpeak: `${item.word} and ${item.synonym} mean the same!`
            };
        }

        // Original: "Which word means the same?"
        const answers = this._shuffle([item.synonym, ...item.wrongs.slice(0, 3)]);
        return {
            question: `🔄 Which word means the SAME as "${item.word}"?`,
            questionSpeak: `Which word means the same as ${item.word}?`,
            answers,
            correctIndex: answers.indexOf(item.synonym),
            topic: 'synonyms',
            subtype: level < 5 ? 'easy-synonym' : 'hard-synonym',
            explanation: `"${item.synonym}" means the same as "${item.word}"!`,
            explanationSpeak: `${item.synonym} means the same as ${item.word}!`
        };
    },

    // ---- ALPHABETICAL ORDER ----
    _alphabetical(level) {
        const easyWords = ['ant', 'ball', 'cat', 'dog', 'egg', 'fish', 'goat', 'hat', 'ice', 'jam', 'kite', 'lion', 'milk', 'nest', 'owl', 'pig', 'queen', 'rain', 'star', 'tree', 'umbrella', 'van', 'water', 'xray', 'yarn', 'zoo'];
        const hardWords = ['apple', 'animal', 'about', 'after', 'baby', 'black', 'brown', 'blue', 'boat', 'cake', 'candy', 'chair', 'cheese', 'color', 'dance', 'door', 'dream', 'drink'];

        if (level < 4) {
            // Easy: pick 4 words starting with different letters far apart
            const picks = [];
            const used = new Set();
            let att = 0;
            while (picks.length < 4 && att++ < 50) {
                const w = easyWords[this._rand(0, easyWords.length - 1)];
                if (!used.has(w[0])) { picks.push(w); used.add(w[0]); }
            }
            if (picks.length < 4) picks.push(...easyWords.slice(0, 4 - picks.length));
            const sorted = [...picks].sort();
            const correct = sorted[0];
            const answers = this._shuffle(picks);

            return {
                question: `🔤 Which word comes FIRST in ABC order?`,
                questionSpeak: `Which word comes first in A B C order?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'alphabetical',
                subtype: 'abc-first-easy',
                explanation: `"${correct}" comes first because it starts with "${correct[0].toUpperCase()}"!`,
                explanationSpeak: `${correct} comes first because it starts with ${correct[0].toUpperCase()}!`
            };
        } else {
            // Hard: words starting with same letter (compare second letter)
            const letter = 'abcdrs'[this._rand(0, 5)];
            const pool = hardWords.filter(w => w[0] === letter);
            if (pool.length < 4) {
                // Fallback to easy mode
                return this._alphabetical(2);
            }
            const picks = this._shuffle(pool).slice(0, 4);
            const sorted = [...picks].sort();
            const askLast = Math.random() < 0.5;
            const correct = askLast ? sorted[sorted.length - 1] : sorted[0];
            const qWord = askLast ? 'LAST' : 'FIRST';
            const answers = this._shuffle(picks);

            return {
                question: `🔤 Which word comes ${qWord} in ABC order?`,
                questionSpeak: `Which word comes ${qWord.toLowerCase()} in A B C order?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'alphabetical',
                subtype: 'abc-same-letter',
                explanation: `"${correct}" comes ${qWord.toLowerCase()} — look at the second letter!`,
                explanationSpeak: `${correct} comes ${qWord.toLowerCase()}! Look at the second letter to figure it out!`
            };
        }
    },

    // ---- WORD FAMILIES ----
    _wordFamilies(level) {
        const families = [
            { family: '-at', words: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat'], outsiders: ['cup', 'dog', 'run', 'bed'] },
            { family: '-an', words: ['can', 'fan', 'man', 'pan', 'ran', 'van', 'tan', 'ban'], outsiders: ['cup', 'pig', 'hot', 'bed'] },
            { family: '-ig', words: ['big', 'dig', 'fig', 'pig', 'wig', 'jig'], outsiders: ['cat', 'sun', 'red', 'cup'] },
            { family: '-op', words: ['hop', 'mop', 'pop', 'top', 'cop', 'stop'], outsiders: ['hat', 'sun', 'bed', 'run'] },
            { family: '-ug', words: ['bug', 'hug', 'mug', 'rug', 'tug', 'dug', 'jug'], outsiders: ['cat', 'pig', 'hot', 'fan'] },
            { family: '-in', words: ['bin', 'fin', 'pin', 'win', 'tin', 'grin', 'spin'], outsiders: ['cat', 'dog', 'bus', 'top'] },
            { family: '-et', words: ['bet', 'get', 'jet', 'met', 'net', 'pet', 'set', 'wet'], outsiders: ['cat', 'dog', 'cup', 'run'] },
            { family: '-ot', words: ['cot', 'dot', 'got', 'hot', 'lot', 'not', 'pot'], outsiders: ['cat', 'big', 'sun', 'run'] },
            { family: '-it', words: ['bit', 'fit', 'hit', 'kit', 'lit', 'pit', 'sit'], outsiders: ['cat', 'dog', 'cup', 'sun'] },
            { family: '-un', words: ['bun', 'fun', 'gun', 'run', 'sun', 'pun'], outsiders: ['cat', 'dog', 'pig', 'hat'] },
            { family: '-ake', words: ['bake', 'cake', 'lake', 'make', 'rake', 'wake'], outsiders: ['bike', 'dog', 'rain', 'tree'] },
            { family: '-ine', words: ['fine', 'line', 'mine', 'nine', 'pine', 'vine'], outsiders: ['bone', 'rain', 'tree', 'cake'] }
        ];

        const fam = families[this._rand(0, families.length - 1)];

        // V37: "Which family does this word belong to?" (30%)
        if (Math.random() < 0.3) {
            const word = fam.words[this._rand(0, fam.words.length - 1)];
            const otherFams = families.filter(f => f.family !== fam.family);
            const wrongFamilies = this._shuffle(otherFams).slice(0, 3).map(f => f.family);
            const answers = this._shuffle([fam.family, ...wrongFamilies]);
            return {
                question: `👨‍👩‍👧 Which word family does "${word}" belong to?`,
                questionSpeak: `Which word family does ${word} belong to?`,
                answers,
                correctIndex: answers.indexOf(fam.family),
                topic: 'word-families',
                subtype: 'identify-family',
                explanation: `"${word}" is in the ${fam.family} family! Other ${fam.family} words: ${fam.words.filter(w => w !== word).slice(0, 3).join(', ')}!`,
                explanationSpeak: `${word} is in the ${fam.family.replace('-', '')} family!`
            };
        }

        if (level < 4 || Math.random() < 0.5) {
            // Which word belongs in this family?
            const correct = fam.words[this._rand(0, fam.words.length - 1)];
            const wrongs = this._shuffle(fam.outsiders).slice(0, 3);
            const answers = this._shuffle([correct, ...wrongs]);

            return {
                question: `👨‍👩‍👧 Which word belongs in the "${fam.family}" family?`,
                questionSpeak: `Which word belongs in the ${fam.family.replace('-', '')} family?`,
                answers,
                correctIndex: answers.indexOf(correct),
                topic: 'word-families',
                subtype: 'belongs-in-family',
                explanation: `"${correct}" is in the ${fam.family} family! They all end with ${fam.family}!`,
                explanationSpeak: `${correct} is in the ${fam.family.replace('-', '')} family! They all end the same way!`
            };
        } else {
            // Which word does NOT belong?
            const outsider = fam.outsiders[this._rand(0, fam.outsiders.length - 1)];
            const members = this._shuffle(fam.words).slice(0, 3);
            const answers = this._shuffle([outsider, ...members]);

            return {
                question: `👨‍👩‍👧 Which word does NOT belong in the "${fam.family}" family?`,
                questionSpeak: `Which word does not belong in the ${fam.family.replace('-', '')} family?`,
                answers,
                correctIndex: answers.indexOf(outsider),
                topic: 'word-families',
                subtype: 'not-in-family',
                explanation: `"${outsider}" doesn't end with ${fam.family}! The others do!`,
                explanationSpeak: `${outsider} does not end with ${fam.family.replace('-', '')}! The others all rhyme!`
            };
        }
    },

    // ---- STORY SEQUENCING ----
    _sequencing(level) {
        // V37: "What comes BETWEEN?" format (25%)
        if (Math.random() < 0.25) {
            const betweenStories = [
                { first: 'Wake up', middle: 'Eat breakfast', last: 'Go to school', wrongs: ['Go to bed', 'Watch TV', 'Take a bath'] },
                { first: 'Get eggs', middle: 'Crack them', last: 'Cook them', wrongs: ['Buy milk', 'Wash dishes', 'Set the table'] },
                { first: 'Get the ball', middle: 'Throw it', last: 'Dog catches it', wrongs: ['Pet the dog', 'Go inside', 'Eat a snack'] },
                { first: 'Turn on water', middle: 'Wash hands', last: 'Dry with towel', wrongs: ['Eat lunch', 'Get dressed', 'Brush teeth'] },
                { first: 'Open book', middle: 'Read the story', last: 'Close the book', wrongs: ['Draw a picture', 'Write a letter', 'Sing a song'] },
                { first: 'Get in line', middle: 'Order food', last: 'Eat lunch', wrongs: ['Go home', 'Play outside', 'Read a book'] },
                { first: 'Put on shoes', middle: 'Tie the laces', last: 'Walk outside', wrongs: ['Take off socks', 'Eat breakfast', 'Brush hair'] },
                { first: 'Pick up crayon', middle: 'Draw a picture', last: 'Show to mom', wrongs: ['Clean up', 'Go to bed', 'Watch TV'] }
            ];
            const story = betweenStories[this._rand(0, betweenStories.length - 1)];
            const answers = this._shuffle([story.middle, ...story.wrongs]);
            return {
                question: `📋 What comes BETWEEN?\n"${story.first}" → ??? → "${story.last}"`,
                questionSpeak: `What comes between ${story.first} and ${story.last}?`,
                answers,
                correctIndex: answers.indexOf(story.middle),
                topic: 'sequencing',
                subtype: 'story-order-between',
                explanation: `"${story.middle}" goes in the middle! ${story.first} → ${story.middle} → ${story.last}`,
                explanationSpeak: `${story.middle} goes in the middle!`
            };
        }

        const easyStories = [
            { steps: ['Wake up', 'Eat breakfast', 'Go to school'], q: 'What happens FIRST?', correct: 'Wake up', qType: 'first' },
            { steps: ['Put on shoes', 'Walk to the bus', 'Ride the bus'], q: 'What happens LAST?', correct: 'Ride the bus', qType: 'last' },
            { steps: ['Get a book', 'Open the book', 'Read the story'], q: 'What happens FIRST?', correct: 'Get a book', qType: 'first' },
            { steps: ['Plant a seed', 'Water it', 'Watch it grow'], q: 'What do you do FIRST?', correct: 'Plant a seed', qType: 'first' },
            { steps: ['Wash hands', 'Eat lunch', 'Clean up'], q: 'What do you do LAST?', correct: 'Clean up', qType: 'last' },
            { steps: ['Get in bed', 'Close eyes', 'Fall asleep'], q: 'What happens FIRST?', correct: 'Get in bed', qType: 'first' },
            { steps: ['Open the door', 'Walk inside', 'Close the door'], q: 'What happens NEXT after opening the door?', correct: 'Walk inside', qType: 'next' },
            { steps: ['Build a snowman', 'Put on a hat', 'Add a carrot nose'], q: 'What happens FIRST?', correct: 'Build a snowman', qType: 'first' },
            { steps: ['Find a crayon', 'Draw a picture', 'Show Mom'], q: 'What happens LAST?', correct: 'Show Mom', qType: 'last' },
            { steps: ['Mix the batter', 'Pour into pan', 'Bake the cake'], q: 'What do you do FIRST?', correct: 'Mix the batter', qType: 'first' },
            { steps: ['Get dressed', 'Brush teeth', 'Eat breakfast'], q: 'What happens after getting dressed?', correct: 'Brush teeth', qType: 'next' },
            { steps: ['Throw the ball', 'Dog runs', 'Dog brings it back'], q: 'What happens LAST?', correct: 'Dog brings it back', qType: 'last' }
        ];
        const hardStories = [
            { steps: ['Pack your bag', 'Drive to the airport', 'Board the plane', 'Fly away'], q: 'What do you do SECOND?', correct: 'Drive to the airport', qType: 'second' },
            { steps: ['Write a letter', 'Put it in an envelope', 'Add a stamp', 'Mail it'], q: 'What do you do LAST?', correct: 'Mail it', qType: 'last' },
            { steps: ['Pick apples', 'Wash them', 'Peel them', 'Make a pie'], q: 'What do you do FIRST?', correct: 'Pick apples', qType: 'first' },
            { steps: ['Find a recipe', 'Buy ingredients', 'Cook the food', 'Eat dinner'], q: 'What happens THIRD?', correct: 'Cook the food', qType: 'third' },
            { steps: ['Get wood', 'Stack the logs', 'Light the fire', 'Roast marshmallows'], q: 'What do you do SECOND?', correct: 'Stack the logs', qType: 'second' },
            { steps: ['Dig a hole', 'Plant a tree', 'Fill with dirt', 'Water the tree'], q: 'What happens LAST?', correct: 'Water the tree', qType: 'last' }
        ];

        const pool = level < 5 ? easyStories : hardStories;
        const story = pool[this._rand(0, pool.length - 1)];
        const decoy = level < 5 ? ['Fly a kite', 'Pet a dog', 'Sing a song', 'Jump rope'][this._rand(0, 3)] : ['Go swimming', 'Read a book', 'Watch TV', 'Call a friend'][this._rand(0, 3)];
        const wrongs = story.steps.filter(s => s !== story.correct).slice(0, 2);
        wrongs.push(decoy);
        const answers = this._shuffle([story.correct, ...wrongs.slice(0, 3)]);

        return {
            question: `📋 ${story.steps.join(' → ')}\n\n${story.q}`,
            questionSpeak: `${story.steps.join(', then ')}. ${story.q}`,
            answers,
            correctIndex: answers.indexOf(story.correct),
            topic: 'sequencing',
            subtype: 'story-order-' + story.qType,
            explanation: `"${story.correct}" is correct! ${story.steps.join(' → ')}`,
            explanationSpeak: `${story.correct} is right! First ${story.steps[0]}, then the rest follow in order!`
        };
    },

    // ---- HOMOPHONES ----
    _homophones(level) {
        const pairs = [
            { pair: ['their', 'there'], sentence: 'Put your toys over ___', correct: 'there', wrongPick: 'their', wrongs: ['they', 'here'] },
            { pair: ['to', 'two', 'too'], sentence: 'I have ___ cats', correct: 'two', wrongPick: 'to', wrongs: ['too', 'tow'] },
            { pair: ['see', 'sea'], sentence: 'I can ___ the bird', correct: 'see', wrongPick: 'sea', wrongs: ['she', 'say'] },
            { pair: ['no', 'know'], sentence: 'I ___ the answer', correct: 'know', wrongPick: 'no', wrongs: ['now', 'new'] },
            { pair: ['right', 'write'], sentence: 'I can ___ my name', correct: 'write', wrongPick: 'right', wrongs: ['ride', 'rite'] },
            { pair: ['hear', 'here'], sentence: 'Come ___ please', correct: 'here', wrongPick: 'hear', wrongs: ['her', 'hare'] },
            { pair: ['sun', 'son'], sentence: 'The ___ is bright today', correct: 'sun', wrongPick: 'son', wrongs: ['sin', 'some'] },
            { pair: ['one', 'won'], sentence: 'She ___ the race', correct: 'won', wrongPick: 'one', wrongs: ['win', 'run'] },
            { pair: ['ate', 'eight'], sentence: 'I ___ my lunch', correct: 'ate', wrongPick: 'eight', wrongs: ['eat', 'at'] },
            { pair: ['blue', 'blew'], sentence: 'The wind ___ hard', correct: 'blew', wrongPick: 'blue', wrongs: ['blow', 'flew'] },
            { pair: ['flower', 'flour'], sentence: 'Use ___ to bake a cake', correct: 'flour', wrongPick: 'flower', wrongs: ['floor', 'flat'] },
            { pair: ['night', 'knight'], sentence: 'The brave ___ rode a horse', correct: 'knight', wrongPick: 'night', wrongs: ['king', 'kite'] },
            { pair: ['dear', 'deer'], sentence: 'A ___ ran through the forest', correct: 'deer', wrongPick: 'dear', wrongs: ['dog', 'bear'] },
            { pair: ['tale', 'tail'], sentence: 'The dog wagged its ___', correct: 'tail', wrongPick: 'tale', wrongs: ['tall', 'tell'] },
            { pair: ['wear', 'where'], sentence: '___ is my backpack?', correct: 'Where', wrongPick: 'Wear', wrongs: ['Were', 'We'] }
        ];

        const item = pairs[this._rand(0, pairs.length - 1)];
        const roll = Math.random();

        // V37: "Which pair are homophones?" (30%)
        if (roll < 0.3) {
            const correctPairStr = item.pair.join(' & ');
            const fakePairs = [];
            const nonHomophones = [
                'cat & bat', 'run & fun', 'big & dig', 'hot & pot', 'red & bed',
                'hat & mat', 'sit & hit', 'top & mop', 'sun & bun', 'let & set'
            ];
            const picks = this._shuffle(nonHomophones).slice(0, 3);
            const answers = this._shuffle([correctPairStr, ...picks]);
            return {
                question: `👂 Which pair are HOMOPHONES?\n(sound the same, different meaning)`,
                questionSpeak: `Which pair of words are homophones? Homophones sound the same but have different meanings.`,
                answers,
                correctIndex: answers.indexOf(correctPairStr),
                topic: 'homophones',
                subtype: 'identify-homophones',
                explanation: `"${item.pair.join('" and "')}" are homophones! Same sound, different meaning!`,
                explanationSpeak: `${item.pair.join(' and ')} are homophones! They sound the same but mean different things!`
            };
        }

        // V37: "Which word means ___?" (meaning-based, 25%)
        if (roll < 0.55) {
            const meaningPairs = [
                { word: 'there', meaning: 'a place (over ___)', wrongs: ['their', 'they'] },
                { word: 'their', meaning: 'belongs to them', wrongs: ['there', 'they'] },
                { word: 'two', meaning: 'the number 2', wrongs: ['to', 'too'] },
                { word: 'too', meaning: 'also / more than enough', wrongs: ['to', 'two'] },
                { word: 'write', meaning: 'put words on paper', wrongs: ['right', 'rite'] },
                { word: 'right', meaning: 'correct / not left', wrongs: ['write', 'rite'] },
                { word: 'see', meaning: 'look with your eyes', wrongs: ['sea', 'she'] },
                { word: 'sea', meaning: 'a big body of water', wrongs: ['see', 'she'] },
                { word: 'know', meaning: 'understand something', wrongs: ['no', 'now'] },
                { word: 'no', meaning: 'not yes', wrongs: ['know', 'now'] },
                { word: 'hear', meaning: 'listen with your ears', wrongs: ['here', 'her'] },
                { word: 'here', meaning: 'in this place', wrongs: ['hear', 'her'] },
                { word: 'flour', meaning: 'used to bake', wrongs: ['flower', 'floor'] },
                { word: 'flower', meaning: 'a plant that blooms', wrongs: ['flour', 'floor'] },
                { word: 'tail', meaning: 'what a dog wags', wrongs: ['tale', 'tall'] },
                { word: 'tale', meaning: 'a story', wrongs: ['tail', 'tall'] }
            ];
            const mItem = meaningPairs[this._rand(0, meaningPairs.length - 1)];
            const answers = this._shuffle([mItem.word, ...mItem.wrongs.slice(0, 3)]);
            return {
                question: `👂 Which word means:\n"${mItem.meaning}"?`,
                questionSpeak: `Which word means ${mItem.meaning}?`,
                answers,
                correctIndex: answers.indexOf(mItem.word),
                topic: 'homophones',
                subtype: 'homophone-meaning',
                explanation: `"${mItem.word}" means "${mItem.meaning}"!`,
                explanationSpeak: `${mItem.word} means ${mItem.meaning}!`
            };
        }

        // Original: fill in the blank
        const answers = this._shuffle([item.correct, item.wrongPick, ...item.wrongs.slice(0, 2)]);
        return {
            question: `👂 Fill in the blank:\n"${item.sentence}"`,
            questionSpeak: `Fill in the blank: ${item.sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'homophones',
            subtype: 'fill-blank-homophone',
            explanation: `"${item.correct}" is correct! "${item.pair.join('" and "')}" sound the same but mean different things!`,
            explanationSpeak: `${item.correct} is correct! ${item.pair.join(' and ')} sound the same but have different meanings!`
        };
    },

    // ---- CAPITALIZATION ----
    _capitalization(level) {
        const easyItems = [
            { sentence: 'my name is ___.', answer: 'Sam', wrongs: ['the', 'and', 'run'] },
            { sentence: '___ is my friend.', answer: 'Lily', wrongs: ['run', 'jump', 'fast'] },
            { sentence: 'i live in ___.', answer: 'Texas', wrongs: ['house', 'street', 'town'] },
            { sentence: 'we went to see ___.', answer: 'Grandma', wrongs: ['house', 'store', 'park'] },
            { sentence: 'my dog ___ is fluffy.', answer: 'Buddy', wrongs: ['small', 'brown', 'cute'] },
            { sentence: '___ is the best day!', answer: 'Monday', wrongs: ['happy', 'fun', 'great'] },
            { sentence: 'we celebrate in ___.', answer: 'December', wrongs: ['winter', 'cold', 'snow'] },
            { sentence: 'i love ___ park.', answer: 'Central', wrongs: ['green', 'big', 'nice'] },
            { sentence: '___ went to school.', answer: 'Jake', wrongs: ['happy', 'fast', 'big'] },
            { sentence: 'we visited ___.', answer: 'Disney World', wrongs: ['fun place', 'big park', 'theme park'] },
            { sentence: 'my teacher is ___.', answer: 'Mrs. Smith', wrongs: ['the best', 'so nice', 'very fun'] },
            { sentence: 'we read ___ in class.', answer: 'Charlotte\'s Web', wrongs: ['a story', 'the book', 'a tale'] }
        ];
        const hardItems = [
            { sentence: 'the ___ river is very long.', answer: 'Mississippi', wrongs: ['biggest', 'longest', 'deepest'] },
            { sentence: 'we drove across the ___ bridge.', answer: 'Golden Gate', wrongs: ['very big', 'longest', 'red'] },
            { sentence: '___ brought presents last year.', answer: 'Santa Claus', wrongs: ['Someone', 'Everyone', 'Nobody'] },
            { sentence: 'they live on ___ street.', answer: 'Oak', wrongs: ['that', 'this', 'one'] },
            { sentence: 'we speak ___ at school.', answer: 'English', wrongs: ['words', 'lots', 'well'] },
            { sentence: 'the president lives in ___.', answer: 'Washington', wrongs: ['a house', 'the city', 'a place'] }
        ];

        const pool = level < 5 ? easyItems : hardItems;
        const item = pool[this._rand(0, pool.length - 1)];
        const roll = Math.random();

        // V37: "Which sentence uses capitals correctly?" (30%)
        if (roll < 0.3) {
            const correctSentences = [
                { correct: 'My name is Sam.', wrongs: ['my name is Sam.', 'My name is sam.', 'my Name is sam.'] },
                { correct: 'I love Monday.', wrongs: ['I love monday.', 'i love Monday.', 'i love monday.'] },
                { correct: 'We live in Texas.', wrongs: ['We live in texas.', 'we live in Texas.', 'we live in texas.'] },
                { correct: 'She went to Disney World.', wrongs: ['She went to disney world.', 'she went to Disney World.', 'She went to disney World.'] },
                { correct: 'My dog Buddy is cute.', wrongs: ['My dog buddy is cute.', 'my dog Buddy is cute.', 'my dog buddy is cute.'] },
                { correct: 'It is December now.', wrongs: ['It is december now.', 'it is December now.', 'it is december Now.'] },
                { correct: 'Jake and I played.', wrongs: ['jake and I played.', 'Jake and i played.', 'jake and i played.'] },
                { correct: 'Mrs. Smith is nice.', wrongs: ['mrs. Smith is nice.', 'Mrs. smith is nice.', 'mrs. smith is nice.'] }
            ];
            const sItem = correctSentences[this._rand(0, correctSentences.length - 1)];
            const answers = this._shuffle([sItem.correct, ...sItem.wrongs.slice(0, 3)]);
            return {
                question: `🅰️ Which sentence uses CAPITALS correctly?`,
                questionSpeak: `Which sentence uses capital letters correctly?`,
                answers,
                correctIndex: answers.indexOf(sItem.correct),
                topic: 'capitalization',
                subtype: 'correct-capitals',
                explanation: `"${sItem.correct}" is right! Names, places, and "I" always get capital letters!`,
                explanationSpeak: `That's right! Names, places, and the word I always start with a capital letter!`
            };
        }

        // V37: "What TYPE of word needs a capital?" (25%)
        if (roll < 0.55) {
            const rules = [
                { rule: 'first word in a sentence', example: '"The cat sat."', correct: 'The', wrongs: ['cat', 'sat', 'a'] },
                { rule: 'a person\'s name', example: '"I saw Emma today."', correct: 'Emma', wrongs: ['saw', 'today', 'the'] },
                { rule: 'a day of the week', example: '"We play on Friday."', correct: 'Friday', wrongs: ['play', 'on', 'we'] },
                { rule: 'a month', example: '"My birthday is in June."', correct: 'June', wrongs: ['birthday', 'is', 'in'] },
                { rule: 'the word I', example: '"He and I went."', correct: 'I', wrongs: ['and', 'went', 'he'] },
                { rule: 'a place name', example: '"We drove to Florida."', correct: 'Florida', wrongs: ['drove', 'to', 'we'] }
            ];
            const rItem = rules[this._rand(0, rules.length - 1)];
            const answers = this._shuffle([rItem.correct, ...rItem.wrongs]);
            return {
                question: `🅰️ ${rItem.example}\nWhich word needs a capital because it's ${rItem.rule}?`,
                questionSpeak: `Which word needs a capital letter because it is ${rItem.rule}?`,
                answers,
                correctIndex: answers.indexOf(rItem.correct),
                topic: 'capitalization',
                subtype: 'capital-rule',
                explanation: `"${rItem.correct}" needs a capital because it's ${rItem.rule}!`,
                explanationSpeak: `${rItem.correct} needs a capital letter because it is ${rItem.rule}!`
            };
        }

        // Original: "Which word needs a capital?"
        const answers = this._shuffle([item.answer, ...item.wrongs.slice(0, 3)]);
        return {
            question: `🅰️ Which word needs a CAPITAL letter?\n"${item.sentence}"`,
            questionSpeak: `Which word needs a capital letter in the sentence: ${item.sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(item.answer),
            topic: 'capitalization',
            subtype: level < 5 ? 'easy-capital' : 'hard-capital',
            explanation: `"${item.answer}" needs a capital letter because it's a proper name!`,
            explanationSpeak: `${item.answer} needs a capital letter because it is a name or special place!`
        };
    },

    // ===== V41: 3RD GRADE GENERATORS =====

    // ---- ADVANCED PREFIX/SUFFIX (3rd grade) ----
    _prefixSuffix3rd(level) {
        const roll = Math.random();

        if (roll < 0.25) {
            // dis- prefix
            const disWords = [
                { base: 'agree', result: 'disagree', meaning: 'to not agree' },
                { base: 'appear', result: 'disappear', meaning: 'to stop being seen' },
                { base: 'like', result: 'dislike', meaning: 'to not like' },
                { base: 'connect', result: 'disconnect', meaning: 'to break a connection' },
                { base: 'obey', result: 'disobey', meaning: 'to not obey' },
                { base: 'honest', result: 'dishonest', meaning: 'not honest' },
                { base: 'comfort', result: 'discomfort', meaning: 'lack of comfort' },
                { base: 'trust', result: 'distrust', meaning: 'lack of trust' }
            ];
            const item = disWords[this._rand(0, disWords.length - 1)];
            const answers = this._shuffle([item.meaning, `very ${item.base}`, `${item.base} again`, `full of ${item.base}`]);
            return {
                question: `What does "${item.result}" mean?\n(dis- means "not" or "opposite of")`,
                questionSpeak: `What does ${item.result} mean? The prefix dis means not or opposite of.`,
                answers,
                correctIndex: answers.indexOf(item.meaning),
                topic: 'prefix-suffix',
                subtype: 'prefix-dis',
                explanation: `"${item.result}" = dis- + ${item.base} = ${item.meaning}!`,
                explanationSpeak: `${item.result} means ${item.meaning}! The prefix dis means not or opposite of!`
            };
        }

        if (roll < 0.5) {
            // -tion / -sion suffix
            const tionWords = [
                { base: 'act', result: 'action', meaning: 'the act of doing' },
                { base: 'educate', result: 'education', meaning: 'the process of learning' },
                { base: 'celebrate', result: 'celebration', meaning: 'a party or event' },
                { base: 'invent', result: 'invention', meaning: 'something new that was made' },
                { base: 'collect', result: 'collection', meaning: 'a group of things gathered' },
                { base: 'protect', result: 'protection', meaning: 'keeping something safe' },
                { base: 'direct', result: 'direction', meaning: 'the way to go' },
                { base: 'decide', result: 'decision', meaning: 'a choice that was made' },
                { base: 'discuss', result: 'discussion', meaning: 'a talk between people' },
                { base: 'explode', result: 'explosion', meaning: 'a sudden burst' }
            ];
            const item = tionWords[this._rand(0, tionWords.length - 1)];
            const suffix = item.result.endsWith('sion') ? '-sion' : '-tion';
            const answers = this._shuffle([item.meaning, `to ${item.base} again`, `without ${item.base}`, `very ${item.base}`]);
            return {
                question: `What does "${item.result}" mean?\n(${suffix} turns a verb into a noun)`,
                questionSpeak: `What does ${item.result} mean? The suffix ${suffix.replace('-','')} turns a verb into a noun.`,
                answers,
                correctIndex: answers.indexOf(item.meaning),
                topic: 'prefix-suffix',
                subtype: 'suffix-tion',
                explanation: `"${item.result}" = ${item.base} + ${suffix} = ${item.meaning}!`,
                explanationSpeak: `${item.result} means ${item.meaning}! The suffix ${suffix.replace('-','')} changes a verb into a noun!`
            };
        }

        if (roll < 0.75) {
            // -ment suffix
            const mentWords = [
                { base: 'enjoy', result: 'enjoyment', meaning: 'the feeling of joy' },
                { base: 'move', result: 'movement', meaning: 'the act of moving' },
                { base: 'excite', result: 'excitement', meaning: 'the feeling of being excited' },
                { base: 'agree', result: 'agreement', meaning: 'when people agree' },
                { base: 'achieve', result: 'achievement', meaning: 'something you accomplished' },
                { base: 'amaze', result: 'amazement', meaning: 'the feeling of being amazed' },
                { base: 'replace', result: 'replacement', meaning: 'something that takes the place of another' },
                { base: 'improve', result: 'improvement', meaning: 'making something better' }
            ];
            const item = mentWords[this._rand(0, mentWords.length - 1)];
            const answers = this._shuffle([item.meaning, `to ${item.base} again`, `not able to ${item.base}`, `one who ${item.base}s`]);
            return {
                question: `What does "${item.result}" mean?\n(-ment means "the act or result of")`,
                questionSpeak: `What does ${item.result} mean? The suffix ment means the act or result of.`,
                answers,
                correctIndex: answers.indexOf(item.meaning),
                topic: 'prefix-suffix',
                subtype: 'suffix-ment',
                explanation: `"${item.result}" = ${item.base} + -ment = ${item.meaning}!`,
                explanationSpeak: `${item.result} means ${item.meaning}! The suffix ment shows the act or result of something!`
            };
        }

        // "Break this word apart" — identify prefix + root + suffix
        const breakApart = [
            { word: 'unhappiness', parts: 'un + happy + ness', prefix: 'un-', root: 'happy', suffix: '-ness', wrongs: ['un + hap + piness', 'unha + ppi + ness', 'u + nhappy + ness'] },
            { word: 'disagree', parts: 'dis + agree', prefix: 'dis-', root: 'agree', suffix: 'none', wrongs: ['di + sagree', 'disa + gree', 'dis + ag + ree'] },
            { word: 'replacement', parts: 're + place + ment', prefix: 're-', root: 'place', suffix: '-ment', wrongs: ['rep + lace + ment', 're + plac + ement', 'repla + ce + ment'] },
            { word: 'uncomfortable', parts: 'un + comfort + able', prefix: 'un-', root: 'comfort', suffix: '-able', wrongs: ['unc + om + fortable', 'un + com + fortable', 'uncom + fort + able'] },
            { word: 'unkindness', parts: 'un + kind + ness', prefix: 'un-', root: 'kind', suffix: '-ness', wrongs: ['unk + ind + ness', 'un + ki + ndness', 'unki + nd + ness'] },
            { word: 'prepayment', parts: 'pre + pay + ment', prefix: 'pre-', root: 'pay', suffix: '-ment', wrongs: ['prep + ay + ment', 'pre + paym + ent', 'prep + aym + ent'] },
            { word: 'carelessness', parts: 'care + less + ness', prefix: 'none', root: 'care', suffix: '-less + -ness', wrongs: ['car + eless + ness', 'care + le + ssness', 'carel + ess + ness'] },
            { word: 'rebuilding', parts: 're + build + ing', prefix: 're-', root: 'build', suffix: '-ing', wrongs: ['reb + uild + ing', 're + buil + ding', 'rebu + ild + ing'] }
        ];
        const item = breakApart[this._rand(0, breakApart.length - 1)];
        const answers = this._shuffle([item.parts, ...item.wrongs]);
        return {
            question: `🏗️ Break this word into parts:\n"${item.word}"`,
            questionSpeak: `Break the word ${item.word} into its parts.`,
            answers,
            correctIndex: answers.indexOf(item.parts),
            topic: 'prefix-suffix',
            subtype: 'break-apart',
            explanation: `"${item.word}" breaks into ${item.parts}!${item.prefix !== 'none' ? ` The prefix is ${item.prefix}.` : ''}${item.suffix !== 'none' ? ` The suffix is ${item.suffix}.` : ''}`,
            explanationSpeak: `${item.word} breaks into ${item.parts}!`
        };
    },

    // ---- VOCABULARY 3RD GRADE ----
    _vocabulary3rd(level) {
        const roll = Math.random();

        if (roll < 0.35) {
            // Advanced context clues with longer sentences
            const contextItems = [
                { sentence: 'The abandoned house had broken windows and overgrown weeds. No one had lived there for years.', word: 'abandoned', correct: 'left empty, deserted', wrongs: ['newly built', 'painted bright colors', 'very expensive'] },
                { sentence: 'The medicine helped alleviate her headache, and she felt much better.', word: 'alleviate', correct: 'reduce or lessen', wrongs: ['make worse', 'start quickly', 'completely stop'] },
                { sentence: 'The camouflaged lizard blended perfectly with the brown leaves on the ground.', word: 'camouflaged', correct: 'hidden by blending in', wrongs: ['brightly colored', 'very large', 'moving quickly'] },
                { sentence: 'After working outside all day, the farmers were famished and ate a huge dinner.', word: 'famished', correct: 'extremely hungry', wrongs: ['well rested', 'very cold', 'quite happy'] },
                { sentence: 'The persistent rain lasted for five straight days without stopping.', word: 'persistent', correct: 'continuing without stopping', wrongs: ['light and gentle', 'coming and going', 'very cold'] },
                { sentence: 'The dog was so lethargic in the heat that it just lay on the porch all day.', word: 'lethargic', correct: 'very tired and slow', wrongs: ['playful and active', 'loud and barking', 'hungry and thin'] },
                { sentence: 'The magician performed an astonishing trick that amazed the whole audience.', word: 'astonishing', correct: 'very surprising', wrongs: ['boring and dull', 'short and quick', 'quiet and soft'] },
                { sentence: 'The teacher asked the class to collaborate on the project by working together.', word: 'collaborate', correct: 'work together', wrongs: ['work alone', 'stop working', 'argue about'] },
                { sentence: 'The frigid wind made everyone shiver and pull their coats tighter.', word: 'frigid', correct: 'extremely cold', wrongs: ['warm and gentle', 'very loud', 'slightly damp'] },
                { sentence: 'She was reluctant to jump in the cold pool, hesitating at the edge.', word: 'reluctant', correct: 'not wanting to do something', wrongs: ['eager and excited', 'running quickly', 'happy and cheerful'] },
                { sentence: 'The ancient ruins were thousands of years old and crumbling apart.', word: 'ancient', correct: 'very, very old', wrongs: ['brand new', 'very tall', 'brightly painted'] },
                { sentence: 'His explanation was so vague that nobody understood what he meant.', word: 'vague', correct: 'unclear, not specific', wrongs: ['very detailed', 'loud and clear', 'short and sweet'] }
            ];
            const item = contextItems[this._rand(0, contextItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🔍 "${item.sentence}"\n\nWhat does "${item.word}" mean?`,
                questionSpeak: `${item.sentence} What does ${item.word} mean?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'vocabulary',
                subtype: 'context-clues-3rd',
                explanation: `"${item.word}" means ${item.correct}! The clues in the sentence help us figure it out!`,
                explanationSpeak: `${item.word} means ${item.correct}! Good readers use context clues to figure out new words!`
            };
        }

        if (roll < 0.65) {
            // Multiple-meaning words in sentence context
            const multiContext = [
                { sentence: 'The baseball player stepped up to the ___.', word: 'bat', correct: 'a stick for hitting balls', wrongs: ['a flying animal', 'to blink your eyes', 'a type of cave'] },
                { sentence: 'The tree ___ fell off and floated down the river.', word: 'bark', correct: 'the outer covering of a tree', wrongs: ['the sound a dog makes', 'a small boat', 'a loud yell'] },
                { sentence: 'Please ___ the door before you leave.', word: 'close', correct: 'to shut', wrongs: ['near or nearby', 'a type of clothing', 'the end of a show'] },
                { sentence: 'The fish took the ___ and the line went tight!', word: 'bait', correct: 'food used to catch fish', wrongs: ['to wait for someone', 'a heavy weight', 'a fishing rod'] },
                { sentence: 'We watched the rocket ___ off into space.', word: 'launch', correct: 'to send up or start', wrongs: ['a type of meal', 'a flat boat', 'to lean back'] },
                { sentence: 'The ___ on the paper showed where each country was.', word: 'key', correct: 'a guide that explains symbols', wrongs: ['something that opens a lock', 'a musical note', 'an island'] },
                { sentence: 'She will ___ the whole team at the competition.', word: 'lead', correct: 'to be in charge of', wrongs: ['a heavy gray metal', 'a dog leash', 'the first page'] },
                { sentence: 'The desert ___ stretched for miles in every direction.', word: 'plain', correct: 'a flat area of land', wrongs: ['simple or basic', 'an airplane', 'clear to see'] },
                { sentence: 'The teacher asked us to ___ our pencils.', word: 'point', correct: 'to sharpen the tip', wrongs: ['a dot or spot', 'a score in a game', 'to aim your finger'] },
                { sentence: 'We need to ___ the problem before we can fix it.', word: 'address', correct: 'to deal with or talk about', wrongs: ['where someone lives', 'a label on a letter', 'a type of speech'] }
            ];
            const item = multiContext[this._rand(0, multiContext.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📗 "${item.sentence.replace('___', item.word)}"\n\nIn this sentence, "${item.word}" means:`,
                questionSpeak: `${item.sentence.replace('___', item.word)} In this sentence, what does ${item.word} mean?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'vocabulary',
                subtype: 'multi-meaning-context',
                explanation: `In this sentence, "${item.word}" means ${item.correct}! Words can mean different things depending on how they are used!`,
                explanationSpeak: `In this sentence, ${item.word} means ${item.correct}! The same word can mean different things in different sentences!`
            };
        }

        // Shades of meaning (word nuance)
        const shadeItems = [
            { question: 'Which word means the MOST angry?', ordered: ['annoyed', 'mad', 'furious', 'enraged'], correct: 'furious', wrongs: ['annoyed', 'mad', 'upset'] },
            { question: 'Which word means the LEAST happy?', ordered: ['content', 'pleased', 'happy', 'ecstatic'], correct: 'content', wrongs: ['pleased', 'happy', 'ecstatic'] },
            { question: 'Which word means the BIGGEST?', ordered: ['large', 'big', 'huge', 'enormous'], correct: 'enormous', wrongs: ['large', 'big', 'huge'] },
            { question: 'Which word means the MOST scared?', ordered: ['nervous', 'scared', 'frightened', 'terrified'], correct: 'terrified', wrongs: ['nervous', 'scared', 'frightened'] },
            { question: 'Which word means the COLDEST?', ordered: ['cool', 'chilly', 'cold', 'freezing'], correct: 'freezing', wrongs: ['cool', 'chilly', 'cold'] },
            { question: 'Which word means the FASTEST?', ordered: ['quick', 'fast', 'rapid', 'lightning-fast'], correct: 'lightning-fast', wrongs: ['quick', 'fast', 'rapid'] },
            { question: 'Which word means the LEAST sad?', ordered: ['disappointed', 'sad', 'miserable', 'heartbroken'], correct: 'disappointed', wrongs: ['sad', 'miserable', 'heartbroken'] },
            { question: 'Which word means the HOTTEST?', ordered: ['warm', 'hot', 'scorching', 'boiling'], correct: 'boiling', wrongs: ['warm', 'hot', 'scorching'] },
            { question: 'Which word means to walk the SLOWEST?', ordered: ['stroll', 'walk', 'march', 'dash'], correct: 'stroll', wrongs: ['walk', 'march', 'dash'] },
            { question: 'Which word means the MOST tired?', ordered: ['drowsy', 'tired', 'weary', 'exhausted'], correct: 'exhausted', wrongs: ['drowsy', 'tired', 'weary'] }
        ];
        const item = shadeItems[this._rand(0, shadeItems.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `📗 ${item.question}`,
            questionSpeak: item.question,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'vocabulary',
            subtype: 'shades-of-meaning',
            explanation: `"${item.correct}" is the right answer! Words have different strengths: ${item.ordered.join(' < ')}`,
            explanationSpeak: `${item.correct} is correct! Words can have similar meanings but different strengths!`
        };
    },

    // ---- GRAMMAR 3RD GRADE ----
    _grammar3rd(level) {
        const roll = Math.random();

        if (roll < 0.25) {
            // Subject-verb agreement
            const svaItems = [
                { sentence: 'The dogs ___ in the yard.', correct: 'play', wrongs: ['plays', 'playing', 'played'] },
                { sentence: 'She ___ to the store every day.', correct: 'goes', wrongs: ['go', 'going', 'gone'] },
                { sentence: 'The birds ___ south for winter.', correct: 'fly', wrongs: ['flies', 'flying', 'flown'] },
                { sentence: 'He ___ his homework after school.', correct: 'does', wrongs: ['do', 'doing', 'done'] },
                { sentence: 'My cat ___ on the windowsill.', correct: 'sits', wrongs: ['sit', 'sitting', 'sat'] },
                { sentence: 'The children ___ soccer at recess.', correct: 'play', wrongs: ['plays', 'playing', 'played'] },
                { sentence: 'The teacher ___ the lesson clearly.', correct: 'explains', wrongs: ['explain', 'explaining', 'explained'] },
                { sentence: 'The flowers ___ in the spring.', correct: 'bloom', wrongs: ['blooms', 'blooming', 'bloomed'] },
                { sentence: 'My brother ___ the piano well.', correct: 'plays', wrongs: ['play', 'playing', 'played'] },
                { sentence: 'The students ___ for the test.', correct: 'study', wrongs: ['studies', 'studying', 'studied'] }
            ];
            const item = svaItems[this._rand(0, svaItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📝 Which word fits best?\n"${item.sentence}"`,
                questionSpeak: `Which word fits best? ${item.sentence.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'grammar',
                subtype: 'subject-verb-agreement',
                explanation: `"${item.correct}" is correct! The subject and verb must agree in number!`,
                explanationSpeak: `${item.correct} is correct! The subject and verb have to match!`
            };
        }

        if (roll < 0.5) {
            // Possessive nouns
            const possItems = [
                { sentence: 'The ___ toy is under the bed.', correct: "dog's", wrongs: ['dogs', 'dog', "dogs'"] },
                { sentence: 'My ___ car is in the driveway.', correct: "mom's", wrongs: ['moms', 'mom', "moms'"] },
                { sentence: 'The ___ wings are colorful.', correct: "butterfly's", wrongs: ['butterflys', 'butterfly', "butterflys'"] },
                { sentence: 'All the ___ backpacks are in the closet.', correct: "students'", wrongs: ["student's", 'students', 'student'] },
                { sentence: 'Both ___ toys were scattered on the floor.', correct: "children's", wrongs: ["childrens'", 'childrens', "childs'"] },
                { sentence: 'The ___ nest is in the tree.', correct: "bird's", wrongs: ['birds', 'bird', "birds'"] },
                { sentence: 'The two ___ leashes are tangled.', correct: "dogs'", wrongs: ["dog's", 'dogs', 'dog'] },
                { sentence: 'My ___ office is downtown.', correct: "dad's", wrongs: ['dads', 'dad', "dads'"] }
            ];
            const item = possItems[this._rand(0, possItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📝 Which word shows ownership?\n"${item.sentence}"`,
                questionSpeak: `Which word shows ownership? ${item.sentence.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'grammar',
                subtype: 'possessive-nouns',
                explanation: `"${item.correct}" shows ownership! An apostrophe and s shows that something belongs to someone!`,
                explanationSpeak: `${item.correct} is correct! We use an apostrophe to show that something belongs to someone!`
            };
        }

        if (roll < 0.75) {
            // Conjunctions (and, but, or, so, because)
            const conjItems = [
                { sentence: 'I wanted to play outside, ___ it was raining.', correct: 'but', wrongs: ['and', 'or', 'so'] },
                { sentence: 'She studied hard, ___ she got an A on the test.', correct: 'so', wrongs: ['but', 'or', 'and'] },
                { sentence: 'Do you want pizza ___ tacos for dinner?', correct: 'or', wrongs: ['and', 'but', 'so'] },
                { sentence: 'We packed lunch ___ brought water bottles.', correct: 'and', wrongs: ['but', 'or', 'so'] },
                { sentence: 'He wore a coat ___ it was very cold outside.', correct: 'because', wrongs: ['but', 'or', 'and'] },
                { sentence: 'The movie was long, ___ it was really exciting.', correct: 'but', wrongs: ['so', 'or', 'because'] },
                { sentence: 'She was tired, ___ she went to bed early.', correct: 'so', wrongs: ['but', 'and', 'or'] },
                { sentence: 'We can go to the park ___ the library.', correct: 'or', wrongs: ['but', 'so', 'because'] },
                { sentence: 'I like cats ___ dogs equally.', correct: 'and', wrongs: ['but', 'or', 'because'] },
                { sentence: 'They stayed inside ___ the storm was loud.', correct: 'because', wrongs: ['and', 'or', 'but'] }
            ];
            const item = conjItems[this._rand(0, conjItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📝 Pick the best connecting word:\n"${item.sentence}"`,
                questionSpeak: `Pick the best connecting word. ${item.sentence.replace('___', 'blank')}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'grammar',
                subtype: 'conjunctions',
                explanation: `"${item.correct}" connects the ideas! "${item.correct}" is a conjunction that joins parts of a sentence!`,
                explanationSpeak: `${item.correct} is the best connecting word! Conjunctions like and, but, or, so, and because join ideas together!`
            };
        }

        // Adverbs vs adjectives
        const advAdjItems = [
            { sentence: 'The rabbit ran ___.', correct: 'quickly', type: 'adverb', wrongs: ['quick', 'quicker', 'quickest'] },
            { sentence: 'She spoke ___ during the library visit.', correct: 'quietly', type: 'adverb', wrongs: ['quiet', 'quieter', 'quietest'] },
            { sentence: 'The ___ cat sat on the fence.', correct: 'fluffy', type: 'adjective', wrongs: ['fluffily', 'fluff', 'fluffier'] },
            { sentence: 'He ___ finished his test.', correct: 'easily', type: 'adverb', wrongs: ['easy', 'easier', 'easiest'] },
            { sentence: 'The ___ wind blew the leaves.', correct: 'strong', type: 'adjective', wrongs: ['strongly', 'stronger', 'strength'] },
            { sentence: 'She sang ___ at the concert.', correct: 'beautifully', type: 'adverb', wrongs: ['beautiful', 'beauty', 'beautify'] },
            { sentence: 'The ___ dog chased the ball.', correct: 'playful', type: 'adjective', wrongs: ['playfully', 'playing', 'played'] },
            { sentence: 'He waited ___ for his turn.', correct: 'patiently', type: 'adverb', wrongs: ['patient', 'patience', 'patients'] }
        ];
        const item = advAdjItems[this._rand(0, advAdjItems.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `📝 Which word fits best?\n"${item.sentence}"`,
            questionSpeak: `Which word fits best? ${item.sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'grammar',
            subtype: 'adverb-adjective',
            explanation: `"${item.correct}" is an ${item.type}! ${item.type === 'adverb' ? 'Adverbs describe how something is done.' : 'Adjectives describe a noun.'}`,
            explanationSpeak: `${item.correct} is correct! ${item.type === 'adverb' ? 'Adverbs tell us how something is done and often end in ly.' : 'Adjectives describe what something is like.'}`
        };
    },

    // ---- COMPREHENSION 3RD GRADE ----
    _comprehension3rd(level) {
        const roll = Math.random();

        if (roll < 0.35) {
            // Longer passages with inference questions
            const inferPassages = [
                { text: 'Maria put on her jersey, laced up her cleats, and grabbed her shin guards. Her dad honked the horn in the driveway.',
                  q: 'Where is Maria probably going?', correct: 'a soccer game', wrongs: ['a swimming pool', 'a birthday party', 'the grocery store'] },
                { text: 'The classroom was decorated with balloons and streamers. A cake sat on the teacher\'s desk. Everyone wore party hats.',
                  q: 'What is probably happening?', correct: 'a class party', wrongs: ['a fire drill', 'a math test', 'picture day'] },
                { text: 'Tyler looked at the dark clouds and grabbed his umbrella. He zipped up his raincoat before heading out the door.',
                  q: 'What is the weather probably like?', correct: 'rainy', wrongs: ['sunny and hot', 'snowy and cold', 'clear and dry'] },
                { text: 'Grandma pulled the cookies out of the oven. The whole house smelled like chocolate. She set them on a rack to cool.',
                  q: 'What kind of cookies did Grandma make?', correct: 'chocolate chip', wrongs: ['peanut butter', 'oatmeal raisin', 'sugar cookies'] },
                { text: 'The audience clapped and cheered. The actors bowed on stage. Parents took pictures from their seats.',
                  q: 'What just ended?', correct: 'a play or show', wrongs: ['a football game', 'a fire drill', 'a regular school day'] },
                { text: 'Sam groaned when his alarm went off. He slowly put on his backpack and walked to the bus stop. It was Monday morning.',
                  q: 'How does Sam probably feel about going to school?', correct: 'tired and not excited', wrongs: ['thrilled and eager', 'angry and mean', 'scared and shaking'] },
                { text: 'The vet carefully wrapped the puppy\'s leg in a bandage. The puppy whimpered softly. Its owner looked worried.',
                  q: 'What probably happened to the puppy?', correct: 'it hurt its leg', wrongs: ['it learned a trick', 'it got a bath', 'it ate too much'] },
                { text: 'Eva stacked boxes in the moving truck. She took one last look at her empty bedroom. Her mom said they would love the new house.',
                  q: 'What is happening?', correct: 'Eva is moving to a new home', wrongs: ['Eva is cleaning her room', 'Eva is going on vacation', 'Eva is having a yard sale'] }
            ];
            const item = inferPassages[this._rand(0, inferPassages.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📖 Read this:\n"${item.text}"\n\n${item.q}`,
                questionSpeak: `${item.text} ${item.q}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'comprehension',
                subtype: 'inference-3rd',
                explanation: `"${item.correct}" makes the most sense! Good readers use clues in the text to figure things out!`,
                explanationSpeak: `${item.correct} is right! The clues in the story helped us figure out the answer!`
            };
        }

        if (roll < 0.65) {
            // Author's purpose
            const purposeItems = [
                { text: 'Dolphins are amazing swimmers. They can hold their breath for up to 15 minutes and swim over 20 miles per hour.', correct: 'to inform or teach', wrongs: ['to make you laugh', 'to convince you to buy something', 'to scare you'] },
                { text: 'You should always wear a helmet when riding a bike. Helmets protect your head and could save your life!', correct: 'to persuade or convince', wrongs: ['to make you laugh', 'to tell a story', 'to teach about helmets'] },
                { text: 'The silly monkey put the banana on its head like a hat. All the other monkeys laughed and laughed!', correct: 'to entertain', wrongs: ['to teach about monkeys', 'to convince you to eat bananas', 'to scare you'] },
                { text: 'The water cycle starts when the sun heats up water. The water turns into vapor, rises, forms clouds, and falls back as rain.', correct: 'to inform or teach', wrongs: ['to make you laugh', 'to tell a scary story', 'to convince you to like rain'] },
                { text: 'Our school needs a new playground! The old one is broken and unsafe. Please sign this petition to help us get a new one.', correct: 'to persuade or convince', wrongs: ['to entertain you', 'to teach about playgrounds', 'to tell a story'] },
                { text: 'Once upon a time, a tiny dragon sneezed and accidentally set his lunch on fire. "Not again!" he sighed.', correct: 'to entertain', wrongs: ['to teach about fire safety', 'to convince you to be careful', 'to inform about dragons'] },
                { text: 'A recipe: Mix 2 cups flour, 1 cup sugar, and 3 eggs. Bake at 350 degrees for 30 minutes.', correct: 'to inform or teach', wrongs: ['to entertain', 'to persuade you to bake', 'to tell a story'] },
                { text: 'Everyone should read for at least 20 minutes a day. Reading makes you smarter and helps you do better in school!', correct: 'to persuade or convince', wrongs: ['to entertain', 'to inform about books', 'to tell a story about reading'] }
            ];
            const item = purposeItems[this._rand(0, purposeItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📖 Why did the author write this?\n"${item.text}"`,
                questionSpeak: `Why did the author write this? ${item.text}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'comprehension',
                subtype: 'authors-purpose',
                explanation: `The author's purpose is ${item.correct}! Authors write to inform, persuade, or entertain!`,
                explanationSpeak: `The author wrote this ${item.correct}! Authors write for different reasons, like to teach, to convince, or to entertain!`
            };
        }

        // Story elements (setting, characters, problem, solution)
        const storyElements = [
            { text: 'Lily was lost in the forest. The trees were tall and the path had disappeared. She followed the sound of a stream and found her way back to camp.',
              q: 'What was the PROBLEM in the story?', correct: 'Lily was lost', wrongs: ['The trees were tall', 'The stream was loud', 'The camp was far away'] },
            { text: 'On a snowy winter morning, Jake\'s sled broke on the first hill. He used tape and rope to fix it, and by lunchtime he was sledding again!',
              q: 'What was the SOLUTION?', correct: 'He fixed the sled with tape and rope', wrongs: ['He bought a new sled', 'He went home', 'He built a snowman instead'] },
            { text: 'In the busy city of New York, a small mouse named Chester lived inside a subway station. Every night he searched for crumbs left by travelers.',
              q: 'What is the SETTING of this story?', correct: 'a subway station in New York', wrongs: ['a farm in the country', 'a school classroom', 'a forest in the mountains'] },
            { text: 'Rosa wanted to join the talent show but was too nervous to sing alone. Her best friend Maya said they could sing together, and Rosa agreed happily.',
              q: 'Who helped solve the problem?', correct: 'Maya', wrongs: ['Rosa', 'the teacher', 'Rosa\'s mom'] },
            { text: 'Captain Finn sailed his ship through a terrible storm. The waves crashed over the deck and the wind tore the sails. He steered toward a small island to wait it out.',
              q: 'What was the SETTING?', correct: 'the ocean during a storm', wrongs: ['a quiet lake', 'a sandy beach', 'a calm river'] },
            { text: 'When Mia\'s science project broke the night before the fair, she stayed up late rebuilding it with better materials. She won second place!',
              q: 'What was the PROBLEM?', correct: 'Her science project broke', wrongs: ['She won second place', 'She stayed up late', 'The fair was canceled'] }
        ];
        const item = storyElements[this._rand(0, storyElements.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `📖 Read this:\n"${item.text}"\n\n${item.q}`,
            questionSpeak: `${item.text} ${item.q}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'comprehension',
            subtype: 'story-elements',
            explanation: `"${item.correct}" is right! Stories have characters, a setting, a problem, and a solution!`,
            explanationSpeak: `${item.correct} is correct! Every story has characters, a setting, a problem, and a solution!`
        };
    },

    // ---- MULTI-SYLLABLE DECODING ----
    _multiSyllable(level) {
        const roll = Math.random();

        if (roll < 0.3) {
            // Count syllables in longer words
            const syllableWords = [
                { word: 'elephant', syllables: 3, breakdown: 'el-e-phant' },
                { word: 'butterfly', syllables: 3, breakdown: 'but-ter-fly' },
                { word: 'basketball', syllables: 3, breakdown: 'bas-ket-ball' },
                { word: 'understand', syllables: 3, breakdown: 'un-der-stand' },
                { word: 'important', syllables: 3, breakdown: 'im-por-tant' },
                { word: 'impossible', syllables: 4, breakdown: 'im-pos-si-ble' },
                { word: 'celebration', syllables: 5, breakdown: 'cel-e-bra-tion' },
                { word: 'caterpillar', syllables: 4, breakdown: 'cat-er-pil-lar' },
                { word: 'watermelon', syllables: 4, breakdown: 'wa-ter-mel-on' },
                { word: 'bicycle', syllables: 3, breakdown: 'bi-cy-cle' },
                { word: 'dinosaur', syllables: 3, breakdown: 'di-no-saur' },
                { word: 'refrigerator', syllables: 5, breakdown: 're-frig-er-a-tor' },
                { word: 'interesting', syllables: 4, breakdown: 'in-ter-est-ing' },
                { word: 'information', syllables: 4, breakdown: 'in-for-ma-tion' },
                { word: 'imagination', syllables: 5, breakdown: 'i-mag-i-na-tion' },
                { word: 'temperature', syllables: 4, breakdown: 'tem-per-a-ture' },
                { word: 'September', syllables: 3, breakdown: 'Sep-tem-ber' },
                { word: 'yesterday', syllables: 3, breakdown: 'yes-ter-day' }
            ];
            const item = syllableWords[this._rand(0, syllableWords.length - 1)];
            const wrongs = [];
            this._fillWrongs(wrongs, [2, 3, 4, 5, 6].filter(n => n !== item.syllables), item.syllables, 3);
            const answers = this._shuffle([item.syllables, ...wrongs]);
            return {
                question: `🧩 How many syllables are in\n"${item.word}"?`,
                questionSpeak: `How many syllables are in the word ${item.word}?`,
                answers: answers.map(String),
                correctIndex: answers.indexOf(item.syllables),
                topic: 'multi-syllable',
                subtype: 'count-syllables',
                explanation: `"${item.word}" has ${item.syllables} syllables: ${item.breakdown}! Clap it out!`,
                explanationSpeak: `${item.word} has ${item.syllables} syllables: ${item.breakdown}!`
            };
        }

        if (roll < 0.6) {
            // Break word into syllables
            const breakWords = [
                { word: 'pumpkin', correct: 'pump-kin', wrongs: ['pu-mpkin', 'pum-pkin', 'pump-ki-n'] },
                { word: 'napkin', correct: 'nap-kin', wrongs: ['na-pkin', 'napk-in', 'n-apkin'] },
                { word: 'rabbit', correct: 'rab-bit', wrongs: ['ra-bbit', 'rabb-it', 'r-abbit'] },
                { word: 'sunset', correct: 'sun-set', wrongs: ['su-nset', 'suns-et', 'sun-s-et'] },
                { word: 'fantastic', correct: 'fan-tas-tic', wrongs: ['fant-as-tic', 'fa-ntas-tic', 'fan-ta-stic'] },
                { word: 'adventure', correct: 'ad-ven-ture', wrongs: ['adv-en-ture', 'a-dven-ture', 'ad-vent-ure'] },
                { word: 'November', correct: 'No-vem-ber', wrongs: ['Nov-em-ber', 'No-ve-mber', 'Novem-ber'] },
                { word: 'remember', correct: 're-mem-ber', wrongs: ['rem-em-ber', 'r-emem-ber', 're-memb-er'] },
                { word: 'hamburger', correct: 'ham-bur-ger', wrongs: ['hamb-ur-ger', 'ha-mbur-ger', 'ham-burg-er'] },
                { word: 'umbrella', correct: 'um-brel-la', wrongs: ['umb-rel-la', 'um-bre-lla', 'umbr-el-la'] },
                { word: 'lemonade', correct: 'lem-on-ade', wrongs: ['le-mon-ade', 'lemon-ade', 'lem-o-nade'] },
                { word: 'September', correct: 'Sep-tem-ber', wrongs: ['Sept-em-ber', 'Se-ptem-ber', 'Sep-temb-er'] }
            ];
            const item = breakWords[this._rand(0, breakWords.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🧩 How do you break this word into syllables?\n"${item.word}"`,
                questionSpeak: `How do you break the word ${item.word} into syllables?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'multi-syllable',
                subtype: 'break-syllables',
                explanation: `"${item.word}" breaks into ${item.correct}! Each syllable has a vowel sound!`,
                explanationSpeak: `${item.word} breaks into ${item.correct}! Remember, each syllable has one vowel sound!`
            };
        }

        if (roll < 0.85) {
            // Read the word (decode multi-syllable)
            const decodeWords = [
                { word: 'thunderstorm', correct: 'thun-der-storm', hint: 'a storm with loud booms', wrongs: ['a type of dance', 'a musical instrument', 'a kind of sandwich'] },
                { word: 'playground', correct: 'play-ground', hint: 'where kids go at recess', wrongs: ['a theater stage', 'a type of soil', 'a classroom'] },
                { word: 'dishwasher', correct: 'dish-wash-er', hint: 'a machine that cleans plates', wrongs: ['a type of soap', 'a kitchen table', 'a kind of towel'] },
                { word: 'earthquake', correct: 'earth-quake', hint: 'when the ground shakes', wrongs: ['a kind of cake', 'a math problem', 'a loud song'] },
                { word: 'supermarket', correct: 'su-per-mar-ket', hint: 'a big store with food', wrongs: ['a type of hero', 'a running race', 'a computer game'] },
                { word: 'uncomfortable', correct: 'un-com-for-ta-ble', hint: 'not feeling good or cozy', wrongs: ['very happy', 'easily broken', 'nice and warm'] },
                { word: 'nighttime', correct: 'night-time', hint: 'when it is dark outside', wrongs: ['early morning', 'afternoon', 'lunchtime'] },
                { word: 'understand', correct: 'un-der-stand', hint: 'to know what something means', wrongs: ['to stand on top', 'to sit down', 'to walk around'] }
            ];
            const item = decodeWords[this._rand(0, decodeWords.length - 1)];
            const answers = this._shuffle([item.hint, ...item.wrongs]);
            return {
                question: `🧩 What does this word mean?\n"${item.word}"\n(Break it apart: ${item.correct})`,
                questionSpeak: `What does the word ${item.word} mean? Break it apart: ${item.correct}.`,
                answers,
                correctIndex: answers.indexOf(item.hint),
                topic: 'multi-syllable',
                subtype: 'decode-meaning',
                explanation: `"${item.word}" (${item.correct}) means ${item.hint}! Breaking big words into parts helps you read them!`,
                explanationSpeak: `${item.word} means ${item.hint}! Breaking big words into smaller parts makes them easier to read!`
            };
        }

        // Which word has the most syllables?
        const groups = [
            { words: ['cat', 'elephant', 'dog', 'fish'], correct: 'elephant', count: 3 },
            { words: ['run', 'celebration', 'jump', 'walk'], correct: 'celebration', count: 5 },
            { words: ['big', 'interesting', 'red', 'hot'], correct: 'interesting', count: 4 },
            { words: ['tree', 'sun', 'caterpillar', 'moon'], correct: 'caterpillar', count: 4 },
            { words: ['play', 'refrigerator', 'ball', 'game'], correct: 'refrigerator', count: 5 },
            { words: ['book', 'imagination', 'pen', 'desk'], correct: 'imagination', count: 5 },
            { words: ['hat', 'watermelon', 'bat', 'map'], correct: 'watermelon', count: 4 },
            { words: ['car', 'bus', 'helicopter', 'van'], correct: 'helicopter', count: 4 }
        ];
        const item = groups[this._rand(0, groups.length - 1)];
        const answers = this._shuffle(item.words);
        return {
            question: `🧩 Which word has the MOST syllables?`,
            questionSpeak: `Which word has the most syllables?`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'multi-syllable',
            subtype: 'most-syllables',
            explanation: `"${item.correct}" has the most syllables (${item.count})! The other words have fewer!`,
            explanationSpeak: `${item.correct} has the most syllables with ${item.count}! Longer words usually have more syllables!`
        };
    },

    // ---- CONTEXT CLUES (standalone 3rd grade topic) ----
    _contextClues(level) {
        const roll = Math.random();

        if (roll < 0.4) {
            // Definition clues (the sentence defines the word)
            const defClues = [
                { sentence: 'A habitat, the natural home of an animal, can be a forest, ocean, or desert.', word: 'habitat', correct: 'where an animal naturally lives', wrongs: ['a type of food', 'a way animals move', 'a baby animal'] },
                { sentence: 'The metamorphosis of a caterpillar means it changes completely into a butterfly.', word: 'metamorphosis', correct: 'a complete change in form', wrongs: ['a type of insect', 'the color of wings', 'a kind of flower'] },
                { sentence: 'Erosion, the wearing away of land by water or wind, shaped the Grand Canyon over millions of years.', word: 'erosion', correct: 'land being worn away by water or wind', wrongs: ['building something new', 'planting trees', 'an earthquake'] },
                { sentence: 'A peninsula is a piece of land that is surrounded by water on three sides.', word: 'peninsula', correct: 'land surrounded by water on three sides', wrongs: ['an island', 'a mountain', 'a river'] },
                { sentence: 'Hibernation, a deep sleep that lasts all winter, helps bears survive the cold months.', word: 'hibernation', correct: 'a deep sleep that lasts all winter', wrongs: ['eating a big meal', 'running south', 'building a den'] },
                { sentence: 'An herbivore, or plant-eating animal, gets all its food from leaves, grass, and fruits.', word: 'herbivore', correct: 'an animal that eats only plants', wrongs: ['an animal that eats meat', 'a type of plant', 'a kind of fruit'] }
            ];
            const item = defClues[this._rand(0, defClues.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🔍 "${item.sentence}"\n\nWhat does "${item.word}" mean?`,
                questionSpeak: `${item.sentence} What does ${item.word} mean?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'context-clues',
                subtype: 'definition-clue',
                explanation: `"${item.word}" means ${item.correct}! The sentence actually tells us the definition!`,
                explanationSpeak: `${item.word} means ${item.correct}! Sometimes the sentence gives you the definition right there!`
            };
        }

        if (roll < 0.7) {
            // Example clues (examples help define the word)
            const exClues = [
                { sentence: 'Many types of precipitation, such as rain, snow, sleet, and hail, fall from clouds.', word: 'precipitation', correct: 'water falling from the sky', wrongs: ['types of clouds', 'wind patterns', 'temperature changes'] },
                { sentence: 'Reptiles, including snakes, lizards, and turtles, are cold-blooded animals.', word: 'reptiles', correct: 'cold-blooded animals like snakes and lizards', wrongs: ['animals with fur', 'animals that fly', 'animals that live in water'] },
                { sentence: 'She felt many emotions, like happiness, sadness, and excitement, on her last day of school.', word: 'emotions', correct: 'feelings', wrongs: ['thoughts', 'actions', 'dreams'] },
                { sentence: 'Citrus fruits, such as oranges, lemons, and grapefruits, are high in vitamin C.', word: 'citrus', correct: 'a group of sour, juicy fruits', wrongs: ['a type of vegetable', 'a kind of vitamin', 'a way of cooking'] },
                { sentence: 'Nocturnal animals, like owls, bats, and raccoons, are active at night.', word: 'nocturnal', correct: 'active at night', wrongs: ['very fast', 'living in trees', 'eating insects'] },
                { sentence: 'Natural disasters, such as hurricanes, earthquakes, and floods, can cause a lot of damage.', word: 'natural disasters', correct: 'dangerous events caused by nature', wrongs: ['man-made accidents', 'types of weather', 'things that happen slowly'] }
            ];
            const item = exClues[this._rand(0, exClues.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🔍 "${item.sentence}"\n\nWhat does "${item.word}" mean?`,
                questionSpeak: `${item.sentence} What does ${item.word} mean?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'context-clues',
                subtype: 'example-clue',
                explanation: `"${item.word}" means ${item.correct}! The examples in the sentence helped us figure it out!`,
                explanationSpeak: `${item.word} means ${item.correct}! The examples like and such as helped us understand the word!`
            };
        }

        // Contrast clues (opposite info helps define the word)
        const contrastClues = [
            { sentence: 'Unlike her timid sister, Maya was bold and always spoke up in class.', word: 'bold', correct: 'brave and confident', wrongs: ['quiet and shy', 'mean and rude', 'funny and silly'] },
            { sentence: 'The first path was smooth, but the alternate route was rugged and bumpy.', word: 'rugged', correct: 'rough and uneven', wrongs: ['flat and easy', 'short and quick', 'wet and slippery'] },
            { sentence: 'While the desert is arid, the rainforest gets tons of rain every year.', word: 'arid', correct: 'very dry', wrongs: ['very wet', 'very cold', 'very flat'] },
            { sentence: 'Instead of being generous like his brother, Tom was greedy and never shared.', word: 'greedy', correct: 'wanting to keep everything', wrongs: ['kind and giving', 'funny and silly', 'quiet and calm'] },
            { sentence: 'The new student was timid at first, unlike the other kids who were outgoing and friendly.', word: 'timid', correct: 'shy and nervous', wrongs: ['loud and bold', 'happy and silly', 'angry and mean'] },
            { sentence: 'Although the movie was supposed to be hilarious, I thought it was quite dull.', word: 'dull', correct: 'boring and not interesting', wrongs: ['very funny', 'extremely scary', 'really long'] }
        ];
        const item = contrastClues[this._rand(0, contrastClues.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `🔍 "${item.sentence}"\n\nWhat does "${item.word}" mean?`,
            questionSpeak: `${item.sentence} What does ${item.word} mean?`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'context-clues',
            subtype: 'contrast-clue',
            explanation: `"${item.word}" means ${item.correct}! Words like "unlike" and "but" tell us the opposite, which helps us figure out the word!`,
            explanationSpeak: `${item.word} means ${item.correct}! Contrast words like unlike and but help us understand new words by showing the opposite!`
        };
    },

    // ---- MAIN IDEA & SUPPORTING DETAILS ----
    _mainIdeaDetail(level) {
        const roll = Math.random();

        if (roll < 0.4) {
            // Identify the main idea
            const mainIdeaItems = [
                { text: 'Sharks have been on Earth for over 400 million years. They were here before dinosaurs! There are over 500 kinds of sharks. Most sharks are not dangerous to people. Only about 12 types have ever bitten a human.',
                  q: 'What is the MAIN IDEA?', correct: 'Sharks are ancient and mostly harmless', wrongs: ['Sharks are very dangerous', 'Dinosaurs ate sharks', 'There are 12 kinds of sharks'] },
                { text: 'Honeybees do an important job. They fly from flower to flower, spreading pollen. This helps flowers and fruits grow. Without bees, we would lose many of the foods we eat every day.',
                  q: 'What is the MAIN IDEA?', correct: 'Bees help our food grow by spreading pollen', wrongs: ['Bees make a lot of honey', 'Flowers are very pretty', 'Bees can sting people'] },
                { text: 'Getting enough sleep is important for kids. Sleep helps your brain learn and remember things. It also helps your body grow and stay healthy. Most kids need 9 to 12 hours of sleep each night.',
                  q: 'What is the MAIN IDEA?', correct: 'Sleep is important for kids\' brains and bodies', wrongs: ['Kids should sleep 12 hours', 'Brains need exercise', 'Healthy food helps you sleep'] },
                { text: 'Recycling helps protect our planet. When we recycle paper, fewer trees need to be cut down. Recycling plastic keeps it out of the ocean. Recycling aluminum cans saves energy.',
                  q: 'What is the MAIN IDEA?', correct: 'Recycling protects the environment in many ways', wrongs: ['Paper comes from trees', 'Plastic is in the ocean', 'Aluminum cans are shiny'] },
                { text: 'Desert animals have special ways to survive the heat. Camels store fat in their humps for energy. Jackrabbits have large ears that release heat. Many desert animals only come out at night when it is cooler.',
                  q: 'What is the MAIN IDEA?', correct: 'Desert animals have adaptations for surviving heat', wrongs: ['Camels have humps', 'Jackrabbits have big ears', 'Deserts are very hot'] },
                { text: 'The Amazon River is the largest river in the world by volume. It flows through South America and empties into the Atlantic Ocean. The river is home to thousands of fish species, including piranhas and electric eels.',
                  q: 'What is the MAIN IDEA?', correct: 'The Amazon River is huge and full of life', wrongs: ['Piranhas are scary', 'South America is big', 'The Atlantic is an ocean'] }
            ];
            const item = mainIdeaItems[this._rand(0, mainIdeaItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🎯 Read this:\n"${item.text}"\n\n${item.q}`,
                questionSpeak: `${item.text} ${item.q}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'main-idea-detail',
                subtype: 'find-main-idea',
                explanation: `The main idea is "${item.correct}"! The main idea is the big, overall point the author is making!`,
                explanationSpeak: `The main idea is ${item.correct}! The main idea is the biggest, most important point of the passage!`
            };
        }

        if (roll < 0.7) {
            // Which is a SUPPORTING DETAIL?
            const detailItems = [
                { text: 'Frogs are amazing animals. They can jump 20 times their body length. Some frogs are tiny enough to sit on a coin. Frogs live on every continent except Antarctica.',
                  mainIdea: 'Frogs are amazing', q: 'Which is a SUPPORTING DETAIL?', correct: 'They can jump 20 times their body length', wrongs: ['Frogs are amazing animals', 'Frogs are alive', 'Animals live in nature'] },
                { text: 'Exercise is great for your health. It makes your heart stronger. It helps you sleep better at night. Exercise also makes your bones stronger.',
                  mainIdea: 'Exercise is great for health', q: 'Which is a SUPPORTING DETAIL?', correct: 'It makes your heart stronger', wrongs: ['Exercise is great for health', 'People can move', 'Everyone has a body'] },
                { text: 'Benjamin Franklin was an important American. He helped write the Declaration of Independence. He invented the lightning rod. He also started the first public library.',
                  mainIdea: 'Franklin was important', q: 'Which is a SUPPORTING DETAIL?', correct: 'He invented the lightning rod', wrongs: ['Franklin was an important American', 'America is a country', 'People are important'] },
                { text: 'Spiders are helpful creatures. They eat mosquitoes and flies that bother people. Some spiders eat harmful insects that damage crops. Without spiders, there would be too many bugs.',
                  mainIdea: 'Spiders are helpful', q: 'Which is a SUPPORTING DETAIL?', correct: 'They eat mosquitoes and flies', wrongs: ['Spiders are helpful creatures', 'Spiders exist', 'Bugs are insects'] },
                { text: 'The Great Wall of China is an incredible structure. It stretches over 13,000 miles. It was built over many centuries by thousands of workers. Parts of the wall are over 2,000 years old.',
                  mainIdea: 'The Great Wall is incredible', q: 'Which is a SUPPORTING DETAIL?', correct: 'It stretches over 13,000 miles', wrongs: ['The Great Wall is incredible', 'China is a country', 'Walls are structures'] },
                { text: 'Owls are amazing hunters. Their eyes can see in almost total darkness. Their feathers are specially shaped so they fly silently. They can turn their heads nearly all the way around.',
                  mainIdea: 'Owls are great hunters', q: 'Which is a SUPPORTING DETAIL?', correct: 'Their feathers let them fly silently', wrongs: ['Owls are amazing hunters', 'Owls are birds', 'Birds can fly'] }
            ];
            const item = detailItems[this._rand(0, detailItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `🎯 Read this:\n"${item.text}"\n\n${item.q}`,
                questionSpeak: `${item.text} ${item.q}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'main-idea-detail',
                subtype: 'find-detail',
                explanation: `"${item.correct}" is a supporting detail! It gives specific information to back up the main idea: "${item.mainIdea}"!`,
                explanationSpeak: `${item.correct} is a supporting detail! Details give specific facts and examples to support the main idea!`
            };
        }

        // Main idea vs detail: "Is this a main idea or a detail?"
        const classifyItems = [
            { statement: 'Dogs make great pets.', correct: 'Main Idea', context: 'A paragraph about why dogs are wonderful pets' },
            { statement: 'Dogs can learn over 100 words.', correct: 'Supporting Detail', context: 'A paragraph about why dogs are wonderful pets' },
            { statement: 'The ocean is home to many animals.', correct: 'Main Idea', context: 'A paragraph about ocean life' },
            { statement: 'Blue whales are the largest animals on Earth.', correct: 'Supporting Detail', context: 'A paragraph about ocean life' },
            { statement: 'George Washington was an important leader.', correct: 'Main Idea', context: 'A paragraph about George Washington' },
            { statement: 'He was the first President of the United States.', correct: 'Supporting Detail', context: 'A paragraph about George Washington' },
            { statement: 'Plants need several things to grow.', correct: 'Main Idea', context: 'A paragraph about what plants need' },
            { statement: 'Plants need sunlight to make food.', correct: 'Supporting Detail', context: 'A paragraph about what plants need' },
            { statement: 'There are many ways to stay healthy.', correct: 'Main Idea', context: 'A paragraph about being healthy' },
            { statement: 'Eating fruits and vegetables gives your body vitamins.', correct: 'Supporting Detail', context: 'A paragraph about being healthy' }
        ];
        const item = classifyItems[this._rand(0, classifyItems.length - 1)];
        const answers = this._shuffle(['Main Idea', 'Supporting Detail', 'Not Important', 'The Title']);
        return {
            question: `🎯 In a paragraph about: "${item.context}"\n\nIs this the MAIN IDEA or a DETAIL?\n"${item.statement}"`,
            questionSpeak: `In a paragraph about ${item.context}, is this the main idea or a supporting detail? ${item.statement}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'main-idea-detail',
            subtype: 'classify-idea-detail',
            explanation: `"${item.statement}" is a ${item.correct}! ${item.correct === 'Main Idea' ? 'It tells the big point of the whole paragraph!' : 'It gives specific information that supports the main idea!'}`,
            explanationSpeak: `That is a ${item.correct}! ${item.correct === 'Main Idea' ? 'The main idea tells the big point of the whole paragraph!' : 'A supporting detail gives specific facts to back up the main idea!'}`
        };
    },

    // ---- CAUSE AND EFFECT ----
    _causeEffect(level) {
        const roll = Math.random();

        if (roll < 0.4) {
            // What caused this?
            const causeItems = [
                { effect: 'The sidewalk was covered in puddles.', correct: 'It rained earlier.', wrongs: ['The sun was shining.', 'It was very windy.', 'Someone painted it.'] },
                { effect: 'All the lights in the house went out.', correct: 'The power went out.', wrongs: ['Someone turned on the TV.', 'The sun came up.', 'The door opened.'] },
                { effect: 'The ice cream melted all over her hand.', correct: 'It was a very hot day.', wrongs: ['She put it in the freezer.', 'It was snowing outside.', 'She wore gloves.'] },
                { effect: 'The plant grew very tall and healthy.', correct: 'It got plenty of water and sunlight.', wrongs: ['It was kept in a dark closet.', 'Nobody watered it.', 'It was too cold outside.'] },
                { effect: 'The boy\'s stomach was growling loudly.', correct: 'He hadn\'t eaten since breakfast.', wrongs: ['He just ate a big lunch.', 'He was doing jumping jacks.', 'He was reading a book.'] },
                { effect: 'The girl got a gold star on her paper.', correct: 'She got all the answers right.', wrongs: ['She forgot her homework.', 'She was late to class.', 'She lost her pencil.'] },
                { effect: 'The snowman started to melt.', correct: 'The temperature got warmer.', wrongs: ['More snow fell.', 'The wind blew harder.', 'Someone added more snow.'] },
                { effect: 'The dog was wagging its tail and jumping around.', correct: 'Its owner came home.', wrongs: ['It was sleeping.', 'It was raining outside.', 'The lights turned off.'] }
            ];
            const item = causeItems[this._rand(0, causeItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `⚡ What CAUSED this to happen?\n"${item.effect}"`,
                questionSpeak: `What caused this to happen? ${item.effect}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'cause-effect',
                subtype: 'find-cause',
                explanation: `"${item.correct}" is the cause! It is what made "${item.effect.replace(/\.$/, '')}" happen!`,
                explanationSpeak: `${item.correct} That is the cause, the reason it happened!`
            };
        }

        if (roll < 0.7) {
            // What is the effect?
            const effectItems = [
                { cause: 'The boy forgot to set his alarm.', correct: 'He overslept and was late for school.', wrongs: ['He woke up early.', 'He had extra time for breakfast.', 'He got to school on time.'] },
                { cause: 'The girl practiced piano every day for a month.', correct: 'She played her song perfectly at the recital.', wrongs: ['She forgot how to play.', 'She broke the piano.', 'She stopped liking music.'] },
                { cause: 'It snowed 12 inches overnight.', correct: 'School was cancelled the next day.', wrongs: ['Everyone went swimming.', 'The flowers bloomed.', 'It was very hot outside.'] },
                { cause: 'The cat knocked the vase off the table.', correct: 'The vase fell and broke into pieces.', wrongs: ['The vase floated in the air.', 'The table moved by itself.', 'The cat turned invisible.'] },
                { cause: 'Mom added too much salt to the soup.', correct: 'The soup tasted too salty to eat.', wrongs: ['The soup was delicious.', 'The soup turned purple.', 'The soup was too sweet.'] },
                { cause: 'The wind blew very hard during the storm.', correct: 'A big tree branch fell in the yard.', wrongs: ['The leaves grew back.', 'The tree got taller.', 'New flowers bloomed.'] },
                { cause: 'She left her bike out in the rain for weeks.', correct: 'The bike started to rust.', wrongs: ['The bike got faster.', 'The bike grew bigger.', 'The bike turned blue.'] },
                { cause: 'The class was very loud and rowdy.', correct: 'The teacher asked everyone to quiet down.', wrongs: ['The teacher gave out candy.', 'Recess was extended.', 'A party started.'] }
            ];
            const item = effectItems[this._rand(0, effectItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `⚡ What is the EFFECT?\n"${item.cause}"`,
                questionSpeak: `What is the effect? ${item.cause}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'cause-effect',
                subtype: 'find-effect',
                explanation: `"${item.correct}" is the effect! It is what happened because of the cause!`,
                explanationSpeak: `${item.correct} That is the effect, what happened as a result!`
            };
        }

        // Cause and effect from a passage
        const passageItems = [
            { text: 'Mia forgot her umbrella at home. On the way to school, it started to pour. By the time she got to class, she was completely soaked.',
              q: 'Why was Mia soaked?', correct: 'She forgot her umbrella and it rained', wrongs: ['She went swimming', 'She spilled her water', 'She took a shower'] },
            { text: 'The farmer did not water his crops all summer. The sun beat down day after day. By September, the corn was brown and dried up.',
              q: 'Why did the corn dry up?', correct: 'No water and too much sun', wrongs: ['Too much rain', 'The corn was old', 'Animals ate it'] },
            { text: 'Jake studied for his spelling test every night. He practiced writing each word five times. On Friday, he got a perfect score!',
              q: 'Why did Jake get a perfect score?', correct: 'He studied and practiced every night', wrongs: ['The test was easy', 'His friend helped him cheat', 'He got lucky'] },
            { text: 'The road was covered in ice after the freezing rain. A car drove too fast around the curve. It slid off the road into a ditch.',
              q: 'What caused the car to slide?', correct: 'Ice on the road and driving too fast', wrongs: ['A flat tire', 'The road was bumpy', 'The car ran out of gas'] },
            { text: 'When the volcano erupted, hot lava flowed down the mountain. The nearby village was covered in ash. Everyone had to leave their homes.',
              q: 'Why did everyone leave?', correct: 'The volcano erupted and covered the area in ash', wrongs: ['There was a flood', 'An earthquake hit', 'A storm was coming'] },
            { text: 'The puppy chewed through the pillow while the family was away. Feathers were everywhere when they got home. Mom said the puppy needed more chew toys.',
              q: 'What caused the feathers to be everywhere?', correct: 'The puppy chewed through the pillow', wrongs: ['A bird got inside', 'The pillow was old', 'The wind blew them'] }
        ];
        const item = passageItems[this._rand(0, passageItems.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `⚡ Read this:\n"${item.text}"\n\n${item.q}`,
            questionSpeak: `${item.text} ${item.q}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'cause-effect',
            subtype: 'passage-cause-effect',
            explanation: `"${item.correct}" is the right answer! In this passage, one event led to another!`,
            explanationSpeak: `${item.correct} is correct! Good readers notice how one event causes another event to happen!`
        };
    },

    // ---- COMPARE AND CONTRAST ----
    _compareContrast(level) {
        const roll = Math.random();

        if (roll < 0.35) {
            // How are these ALIKE?
            const alikeItems = [
                { text: 'Both cats and dogs are popular pets. They both have fur and four legs. Both animals can be trained and enjoy playing with their owners.',
                  q: 'How are cats and dogs ALIKE?', correct: 'They both have fur and can be trained', wrongs: ['They both bark', 'They both purr', 'They both live in water'] },
                { text: 'Apples and oranges are both fruits. They are both round and grow on trees. Both are healthy snacks that give you vitamins.',
                  q: 'How are apples and oranges ALIKE?', correct: 'They are both round fruits that grow on trees', wrongs: ['They are the same color', 'They taste the same', 'They both have pits'] },
                { text: 'Soccer and basketball are both team sports. Players in both sports run a lot and try to score points. Both sports have referees to enforce the rules.',
                  q: 'How are soccer and basketball ALIKE?', correct: 'Both are team sports where you run and score', wrongs: ['Both use the same ball', 'Both have touchdowns', 'Both are played on ice'] },
                { text: 'The sun and a campfire both give off heat and light. They both can be dangerous if you get too close. However, the sun is much, much bigger.',
                  q: 'How are the sun and a campfire ALIKE?', correct: 'Both give off heat and light', wrongs: ['Both are the same size', 'Both are found in space', 'Both need matches'] },
                { text: 'Frogs and toads both start life as tadpoles. They are both amphibians that can live on land and in water. Both eat insects.',
                  q: 'How are frogs and toads ALIKE?', correct: 'Both are amphibians that start as tadpoles', wrongs: ['Both have dry skin', 'Both live only in water', 'Both can fly'] },
                { text: 'Books and movies can both tell stories. They both have characters and a plot. Both can make you feel happy, sad, or excited.',
                  q: 'How are books and movies ALIKE?', correct: 'Both tell stories with characters', wrongs: ['Both have pictures on every page', 'Both must be read aloud', 'Both are on screens'] }
            ];
            const item = alikeItems[this._rand(0, alikeItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `⚖️ Read this:\n"${item.text}"\n\n${item.q}`,
                questionSpeak: `${item.text} ${item.q}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'compare-contrast',
                subtype: 'find-alike',
                explanation: `"${item.correct}" is what they have in common! When we compare, we look for what is the same!`,
                explanationSpeak: `${item.correct} is correct! Comparing means finding what things have in common!`
            };
        }

        if (roll < 0.7) {
            // How are these DIFFERENT?
            const diffItems = [
                { text: 'Fish live in water and breathe through gills. Birds live on land and in the sky, and breathe with lungs. Fish have scales, but birds have feathers.',
                  q: 'How are fish and birds DIFFERENT?', correct: 'Fish breathe with gills, birds use lungs', wrongs: ['Both live in water', 'Both have feathers', 'Both can fly'] },
                { text: 'Summer is hot and the days are long. You can swim and play outside. Winter is cold and the days are short. You can sled and build snowmen.',
                  q: 'How are summer and winter DIFFERENT?', correct: 'Summer is hot with long days, winter is cold with short days', wrongs: ['Both are cold', 'Both have long days', 'Both have snow'] },
                { text: 'Deserts are very dry and hot. They get very little rain. Rainforests are wet and warm. They get rain almost every day.',
                  q: 'How are deserts and rainforests DIFFERENT?', correct: 'Deserts are dry but rainforests get lots of rain', wrongs: ['Both are very dry', 'Both are very cold', 'Both get lots of snow'] },
                { text: 'Hardcover books have a stiff, thick cover that protects the pages. Paperback books have a thin, flexible cover. Hardcovers cost more but last longer.',
                  q: 'How are hardcover and paperback books DIFFERENT?', correct: 'Hardcovers have stiff covers, paperbacks are flexible', wrongs: ['Only hardcovers have words', 'Only paperbacks have pages', 'They are exactly the same'] },
                { text: 'Herbivores eat only plants. Carnivores eat only meat. Herbivores usually have flat teeth for grinding, while carnivores have sharp teeth for tearing.',
                  q: 'How are herbivores and carnivores DIFFERENT?', correct: 'Herbivores eat plants, carnivores eat meat', wrongs: ['Both eat only plants', 'Both eat only meat', 'Both have sharp teeth'] },
                { text: 'The Earth rotates once every 24 hours, giving us day and night. Mars rotates at almost the same speed. However, Mars takes about 687 days to orbit the sun, while Earth takes only 365.',
                  q: 'How are Earth and Mars DIFFERENT?', correct: 'Earth orbits the sun faster than Mars', wrongs: ['They rotate at very different speeds', 'Earth is farther from the sun', 'Mars has longer days'] }
            ];
            const item = diffItems[this._rand(0, diffItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `⚖️ Read this:\n"${item.text}"\n\n${item.q}`,
                questionSpeak: `${item.text} ${item.q}`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'compare-contrast',
                subtype: 'find-different',
                explanation: `"${item.correct}" is the difference! When we contrast, we look for what is NOT the same!`,
                explanationSpeak: `${item.correct} is correct! Contrasting means finding how things are different from each other!`
            };
        }

        // Signal words: "Which word signals a comparison/contrast?"
        const signalItems = [
            { sentence: 'Dogs are friendly, ___ cats can be more independent.', correct: 'but', type: 'contrast', wrongs: ['and', 'also', 'because'] },
            { sentence: '___ dogs and cats make good pets.', correct: 'Both', type: 'compare', wrongs: ['Neither', 'Only', 'But'] },
            { sentence: 'Apples are sweet. ___, oranges are also sweet.', correct: 'Similarly', type: 'compare', wrongs: ['However', 'But', 'Instead'] },
            { sentence: 'Sharks live in the ocean. ___, bears live on land.', correct: 'However', type: 'contrast', wrongs: ['Also', 'Similarly', 'And'] },
            { sentence: 'Frogs and toads are alike ___ many ways.', correct: 'in', type: 'compare', wrongs: ['not', 'but', 'or'] },
            { sentence: 'Summer is warm, ___ winter is cold.', correct: 'while', type: 'contrast', wrongs: ['and also', 'similarly', 'like'] },
            { sentence: '___ the rain, the snow also comes from clouds.', correct: 'Like', type: 'compare', wrongs: ['Unlike', 'But', 'However'] },
            { sentence: '___ some animals hibernate, others migrate south.', correct: 'While', type: 'contrast', wrongs: ['Because', 'Since', 'Also'] }
        ];
        const item = signalItems[this._rand(0, signalItems.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `⚖️ Which word fits best?\n"${item.sentence}"`,
            questionSpeak: `Which word fits best? ${item.sentence.replace('___', 'blank')}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'compare-contrast',
            subtype: 'signal-words',
            explanation: `"${item.correct}" is right! "${item.correct}" is a ${item.type} signal word. ${item.type === 'compare' ? 'Compare words show how things are alike.' : 'Contrast words show how things are different.'}`,
            explanationSpeak: `${item.correct} is correct! It is a ${item.type} signal word that ${item.type === 'compare' ? 'shows how things are alike' : 'shows how things are different'}!`
        };
    },

    // ---- TEXT FEATURES ----
    _textFeatures(level) {
        const roll = Math.random();

        if (roll < 0.3) {
            // "What is this text feature used for?"
            const featureItems = [
                { feature: 'a heading', correct: 'tells what a section is about', wrongs: ['lists the author\'s name', 'shows a picture', 'gives page numbers'] },
                { feature: 'a caption', correct: 'explains what a photo or picture shows', wrongs: ['lists words in ABC order', 'tells you what chapter to read', 'gives the book title'] },
                { feature: 'a glossary', correct: 'defines important words in the book', wrongs: ['lists the chapters', 'shows maps and pictures', 'tells the page numbers'] },
                { feature: 'an index', correct: 'lists topics and their page numbers', wrongs: ['defines hard words', 'shows pictures', 'tells the story'] },
                { feature: 'a table of contents', correct: 'lists the chapters and their page numbers', wrongs: ['defines vocabulary words', 'shows photos', 'gives the book\'s price'] },
                { feature: 'bold print', correct: 'shows that a word is important', wrongs: ['means the word is wrong', 'means the book is fiction', 'means skip that word'] },
                { feature: 'a diagram', correct: 'shows the parts of something with labels', wrongs: ['tells a funny story', 'lists page numbers', 'gives the author\'s name'] },
                { feature: 'a map', correct: 'shows where places are located', wrongs: ['defines vocabulary words', 'lists chapters', 'shows how to spell words'] },
                { feature: 'a timeline', correct: 'shows events in the order they happened', wrongs: ['defines hard words', 'lists page numbers', 'tells about the author'] },
                { feature: 'a graph or chart', correct: 'shows data or numbers visually', wrongs: ['tells a story', 'defines words', 'lists the chapters'] }
            ];
            const item = featureItems[this._rand(0, featureItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📑 What is ${item.feature} used for?`,
                questionSpeak: `What is ${item.feature} used for?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'text-features',
                subtype: 'feature-purpose',
                explanation: `${item.feature[0].toUpperCase() + item.feature.slice(1)} ${item.correct}! Text features help us find and understand information!`,
                explanationSpeak: `${item.feature} ${item.correct}! Text features help us find and understand information in a book!`
            };
        }

        if (roll < 0.6) {
            // "Where would you look to find...?"
            const lookupItems = [
                { need: 'the meaning of a word you don\'t know', correct: 'the glossary', wrongs: ['the index', 'the table of contents', 'the caption'] },
                { need: 'what page a topic is on', correct: 'the index', wrongs: ['the glossary', 'the heading', 'the caption'] },
                { need: 'what chapters are in the book', correct: 'the table of contents', wrongs: ['the index', 'the glossary', 'a diagram'] },
                { need: 'what a photograph shows', correct: 'the caption', wrongs: ['the glossary', 'the index', 'the heading'] },
                { need: 'what a section of the text is about', correct: 'the heading', wrongs: ['the glossary', 'the index', 'the caption'] },
                { need: 'the parts of a frog\'s body', correct: 'a diagram', wrongs: ['the glossary', 'the index', 'a timeline'] },
                { need: 'which events happened first', correct: 'a timeline', wrongs: ['a diagram', 'the glossary', 'the table of contents'] },
                { need: 'where a country is in the world', correct: 'a map', wrongs: ['the glossary', 'a graph', 'the index'] },
                { need: 'how many students chose each color as their favorite', correct: 'a graph or chart', wrongs: ['the glossary', 'a map', 'the index'] },
                { need: 'which words in a passage are most important', correct: 'bold print', wrongs: ['the index', 'the caption', 'the map'] }
            ];
            const item = lookupItems[this._rand(0, lookupItems.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📑 Where would you look to find\n${item.need}?`,
                questionSpeak: `Where would you look to find ${item.need}?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'text-features',
                subtype: 'where-to-look',
                explanation: `You would use ${item.correct} to find ${item.need}! Knowing your text features helps you find information fast!`,
                explanationSpeak: `You would use ${item.correct}! Good readers know which text features help them find information quickly!`
            };
        }

        if (roll < 0.85) {
            // Fiction vs nonfiction text features
            const fictionOrNot = [
                { feature: 'a glossary at the back', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] },
                { feature: 'chapter titles like "The Dragon\'s Cave"', correct: 'Fiction', wrongs: ['Nonfiction', 'Both equally', 'Neither'] },
                { feature: 'photographs with captions', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] },
                { feature: 'an index listing topics and pages', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] },
                { feature: 'illustrations of made-up characters', correct: 'Fiction', wrongs: ['Nonfiction', 'Both equally', 'Neither'] },
                { feature: 'a diagram showing the water cycle', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] },
                { feature: 'dialogue between talking animals', correct: 'Fiction', wrongs: ['Nonfiction', 'Both equally', 'Neither'] },
                { feature: 'a timeline of historical events', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] },
                { feature: 'a map showing a make-believe land', correct: 'Fiction', wrongs: ['Nonfiction', 'Both equally', 'Neither'] },
                { feature: 'a bar graph showing real data', correct: 'Nonfiction', wrongs: ['Fiction', 'Both equally', 'Neither'] }
            ];
            const item = fictionOrNot[this._rand(0, fictionOrNot.length - 1)];
            const answers = this._shuffle([item.correct, ...item.wrongs]);
            return {
                question: `📑 Would you most likely find this in fiction or nonfiction?\n"${item.feature}"`,
                questionSpeak: `Would you most likely find ${item.feature} in fiction or nonfiction?`,
                answers,
                correctIndex: answers.indexOf(item.correct),
                topic: 'text-features',
                subtype: 'fiction-nonfiction',
                explanation: `"${item.feature}" is most likely found in ${item.correct.toLowerCase()}! ${item.correct === 'Nonfiction' ? 'Nonfiction uses features to organize real facts.' : 'Fiction tells made-up stories with characters and settings.'}`,
                explanationSpeak: `${item.feature} is usually found in ${item.correct.toLowerCase()}! ${item.correct === 'Nonfiction' ? 'Nonfiction books use features to organize facts and information.' : 'Fiction books tell made-up stories.'}`
            };
        }

        // "What text feature is being described?"
        const describeItems = [
            { description: 'It is at the front of the book and lists all the chapters with page numbers.', correct: 'Table of Contents', wrongs: ['Glossary', 'Index', 'Caption'] },
            { description: 'It is at the back of the book and lists important words with their definitions.', correct: 'Glossary', wrongs: ['Table of Contents', 'Index', 'Heading'] },
            { description: 'It is at the back of the book and lists topics in ABC order with page numbers.', correct: 'Index', wrongs: ['Glossary', 'Table of Contents', 'Caption'] },
            { description: 'It is a small sentence under a photo that tells what the photo shows.', correct: 'Caption', wrongs: ['Heading', 'Title', 'Bold print'] },
            { description: 'It is a title at the top of a section that tells what that part is about.', correct: 'Heading', wrongs: ['Caption', 'Glossary', 'Index'] },
            { description: 'It shows information using bars, lines, or circles to compare numbers.', correct: 'Graph or Chart', wrongs: ['Diagram', 'Map', 'Timeline'] },
            { description: 'It shows the parts of something, like a plant, with lines and labels pointing to each part.', correct: 'Diagram', wrongs: ['Graph', 'Map', 'Caption'] },
            { description: 'It shows events arranged in order from earliest to latest.', correct: 'Timeline', wrongs: ['Index', 'Table of Contents', 'Graph'] }
        ];
        const item = describeItems[this._rand(0, describeItems.length - 1)];
        const answers = this._shuffle([item.correct, ...item.wrongs]);
        return {
            question: `📑 What text feature is this?\n"${item.description}"`,
            questionSpeak: `What text feature is being described? ${item.description}`,
            answers,
            correctIndex: answers.indexOf(item.correct),
            topic: 'text-features',
            subtype: 'identify-feature',
            explanation: `That is a ${item.correct}! ${item.correct}s help readers find and understand information in a book!`,
            explanationSpeak: `That is a ${item.correct}! Knowing your text features makes you a stronger reader!`
        };
    }
};
