/* ============================================
   RHYTHM BLAST — Note Generator
   Bridge between educational content and rhythm notes
   Converts MathData/ReadingData questions into lane-assigned notes
   ============================================ */
const NoteGenerator = (() => {
    const LANES = 3;

    function _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /**
     * Generate notes from a chart entry.
     * Returns { notes: [...], ttsText: string|null }
     * Each note: { text, lane, hitBeat, isCorrect, type }
     */
    function fromChartEntry(entry, level) {
        const [domain, topic] = entry.topic.split(':');
        let question;

        try {
            if (domain === 'math') {
                question = MathData.generate(topic, Math.min(level, 3));
            } else {
                question = ReadingData.generate(topic, Math.min(level, 3));
            }
        } catch (e) {
            // Fallback to counting
            question = MathData.generate('counting', 0);
        }

        if (!question || !question.answers || question.answers.length < 2) {
            question = MathData.generate('counting', 0);
        }

        // All patterns use identify (3 simultaneous notes, tap the correct one).
        // Sequence pattern removed — gray lead-in notes confused young players.
        return _makeIdentifyNotes(question, entry.beat, domain);
    }

    /**
     * Identify pattern: 3 notes fall simultaneously in different lanes.
     * Player must tap the correct one.
     */
    function _makeIdentifyNotes(question, hitBeat, domain) {
        // Pick 3 answers (correct + 2 wrong)
        const correctIdx = question.correctIndex;
        const correct = question.answers[correctIdx];
        const wrongs = question.answers.filter((_, i) => i !== correctIdx);
        const chosen = [correct, ...wrongs.slice(0, LANES - 1)];

        // Shuffle lane assignments
        const shuffled = _shuffle(chosen.map((text, i) => ({
            text: String(text),
            isCorrect: i === 0, // first one is always correct before shuffle
            type: 'identify'
        })));

        // Assign lanes
        const notes = shuffled.map((note, lane) => ({
            ...note,
            lane,
            hitBeat,
            domain
        }));

        // TTS for reading questions
        let ttsText = null;
        if (domain === 'reading' && question.questionSpeak) {
            ttsText = question.questionSpeak;
        } else if (question.question && question.question.length < 40) {
            ttsText = question.question;
        }

        return { notes, ttsText, question: question.question };
    }

    /**
     * Sequence pattern: notes fall one after another building an equation.
     * Last note(s) are the answer choice.
     * e.g. "3" -> "+" -> "2" -> then "5" (correct lane) and "4" (wrong lane)
     */
    function _makeSequenceNotes(question, startBeat, length, domain) {
        const notes = [];
        let ttsText = null;

        // For math: show the equation parts, then answer choices
        const correct = question.answers[question.correctIndex];
        const wrong = question.answers.find((a, i) => i !== question.correctIndex) || '?';

        // Parse the question to extract equation parts
        // Common format: "3 + 2 = ?" or just show question text
        const qText = question.question || '';
        const parts = qText.split(/\s+/).filter(p => p && p !== '=');

        if (parts.length >= 3 && domain === 'math') {
            // Show equation parts as lead-in notes (center lane, no answer needed)
            const leadBeats = Math.min(parts.length - 1, 3);
            for (let i = 0; i < leadBeats; i++) {
                notes.push({
                    text: parts[i],
                    lane: 1, // center lane
                    hitBeat: startBeat + i * 2,
                    isCorrect: true, // lead-in notes auto-pass
                    type: 'sequence-lead',
                    domain
                });
            }

            // Answer notes at the end (correct vs wrong in different lanes)
            const answerBeat = startBeat + leadBeats * 2;
            const answerLanes = _shuffle([0, 2]); // left or right lane
            notes.push({
                text: String(correct),
                lane: answerLanes[0],
                hitBeat: answerBeat,
                isCorrect: true,
                type: 'sequence-answer',
                domain
            });
            notes.push({
                text: String(wrong),
                lane: answerLanes[1],
                hitBeat: answerBeat,
                isCorrect: false,
                type: 'sequence-answer',
                domain
            });
        } else {
            // Fallback: treat as identify
            return _makeIdentifyNotes(question, startBeat, domain);
        }

        if (question.questionSpeak) {
            ttsText = question.questionSpeak;
        }

        return { notes, ttsText, question: question.question };
    }

    return { fromChartEntry, LANES };
})();
