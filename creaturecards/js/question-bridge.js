/* ============================================
   CREATURE CARDS — Question Bridge
   Maps creature types to educational content
   Bridges MathData/ReadingData to battle context
   ============================================ */
const QuestionBridge = (() => {
    let adaptiveLevel = 0;
    let recentResults = []; // rolling window for DDA

    function _adjustDifficulty(correct) {
        recentResults.push(correct ? 1 : 0);
        if (recentResults.length > 10) recentResults.shift();

        if (recentResults.length >= 5) {
            const accuracy = recentResults.reduce((a, b) => a + b, 0) / recentResults.length;
            if (accuracy < 0.5) adaptiveLevel = Math.max(0, adaptiveLevel - 1);
            else if (accuracy > 0.9) adaptiveLevel = Math.min(5, adaptiveLevel + 1);
        }
    }

    /**
     * Generate a question for a creature's type.
     * Returns { question, answers, correctIndex, topic, domain, questionSpeak }
     */
    function generate(creatureType, isAbility) {
        const typeData = CreatureData.TYPES[creatureType];
        if (!typeData) return _fallback();

        const level = isAbility ? Math.min(adaptiveLevel + 1, 5) : adaptiveLevel;
        const topics = typeData.topics;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const domain = typeData.domain === 'mixed'
            ? (Math.random() < 0.5 ? 'math' : 'reading')
            : typeData.domain;

        let question;
        try {
            question = domain === 'math'
                ? MathData.generate(topic, level)
                : ReadingData.generate(topic, level);
        } catch (e) {
            return _fallback();
        }

        if (!question || !question.answers || question.answers.length < 2) {
            return _fallback();
        }

        return {
            question: question.question,
            questionSpeak: question.questionSpeak || question.question,
            answers: question.answers,
            correctIndex: question.correctIndex,
            topic,
            domain,
            explanation: question.explanation || ''
        };
    }

    function _fallback() {
        const q = MathData.generate('counting', 0);
        return {
            question: q.question,
            questionSpeak: q.questionSpeak || q.question,
            answers: q.answers,
            correctIndex: q.correctIndex,
            topic: 'counting',
            domain: 'math',
            explanation: q.explanation || ''
        };
    }

    function recordAnswer(correct) {
        _adjustDifficulty(correct);
    }

    function getLevel() { return adaptiveLevel; }
    function reset() { adaptiveLevel = 0; recentResults = []; }

    return { generate, recordAnswer, getLevel, reset };
})();
