// ===== QUESTION SYSTEM =====
const Questions = {
    currentQuestion: null,
    currentSubject: null,
    currentTopic: null,
    onAnswer: null,

    show(subject, topic, callback) {
        this.currentSubject = subject;
        this.currentTopic = topic;
        this.onAnswer = callback;

        const params = Adaptive.getQuestionParams(subject, topic);

        let data;
        try {
            data = subject === 'math'
                ? MathData.generate(topic, params.level)
                : ReadingData.generate(topic, params.level);
        } catch (e) {
            console.error(`Question generation failed for ${subject}/${topic}/L${params.level}:`, e);
            // Fallback: generate a safe default question
            data = subject === 'math'
                ? MathData.generate('counting', params.level)
                : ReadingData.generate('letters', params.level);
        }

        // Validate question structure
        if (!data || !data.answers || data.answers.length < 2 ||
            data.correctIndex < 0 || data.correctIndex >= data.answers.length) {
            console.error('Invalid question data, using fallback');
            data = subject === 'math'
                ? MathData.generate('counting', 0)
                : ReadingData.generate('letters', 0);
        }

        // 3yo comfort: reduce to 3 choices max at Pre-K Easy (level 0)
        if (params.level === 0 && data.answers.length > 3) {
            const correctAnswer = data.answers[data.correctIndex];
            const wrongs = data.answers.filter((_, i) => i !== data.correctIndex);
            const keptWrongs = wrongs.slice(0, 2);
            const newAnswers = [...keptWrongs];
            const insertAt = Math.floor(Math.random() * 3);
            newAnswers.splice(insertAt, 0, correctAnswer);
            data.answers = newAnswers;
            data.correctIndex = insertAt;
        }

        this.currentQuestion = data;
        this._render(data);
    },

    _render(data) {
        const overlay = document.getElementById('question-overlay');
        const questionText = document.getElementById('question-text');
        const answersGrid = document.getElementById('answers-grid');
        const explanationBubble = document.getElementById('explanation-bubble');

        explanationBubble.style.display = 'none';
        explanationBubble.textContent = '';

        // V5.8: Flash-then-hide for subitizing (show dots briefly, then ask)
        if (data.flash) {
            questionText.innerHTML = data.flash.replace(/\n/g, '<br>');
            answersGrid.innerHTML = '';
            overlay.style.display = 'flex';
            Audio.speak(data.questionSpeak || data.question);

            setTimeout(() => {
                questionText.innerHTML = data.question.replace(/\n/g, '<br>');
                this._renderAnswers(data, answersGrid);
            }, data.flashDuration || 800);
            return;
        }

        questionText.innerHTML = data.question.replace(/\n/g, '<br>');
        this._renderAnswers(data, answersGrid);
        overlay.style.display = 'flex';
        Audio.speak(data.questionSpeak || data.question);
    },

    _renderAnswers(data, answersGrid) {
        answersGrid.innerHTML = '';
        const maxLen = Math.max(...data.answers.map(a => a.length));
        const smallText = maxLen > 20;

        data.answers.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            if (smallText) btn.style.fontSize = '1.1rem';
            btn.textContent = answer;
            btn.addEventListener('click', () => this._handleAnswer(i, btn));
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this._handleAnswer(i, btn);
            });
            answersGrid.appendChild(btn);
        });
    },

    _handleAnswer(index, btn) {
        if (this._answered) return;
        this._answered = true;

        // Disable all buttons visually after answer
        const allBtns = document.querySelectorAll('.answer-btn');
        allBtns.forEach(b => {
            b.classList.add('answered');
            b.style.pointerEvents = 'none';
        });

        const correct = index === this.currentQuestion.correctIndex;

        if (correct) {
            btn.classList.add('correct');
            Audio.playCorrect();
            const phrase = Audio.encourageCorrect();
            this._showFeedback(phrase, true);
            this._spawnParticleBurst(btn);

            // V5.7: 60% chance to show explanation on correct answers (reinforcement)
            if (this.currentQuestion.explanation && Math.random() < 0.6) {
                this._showExplanation(true);
            }
        } else {
            btn.classList.add('wrong');
            allBtns[this.currentQuestion.correctIndex].classList.add('correct');
            Audio.playWrong();

            // Show explanation for wrong answers
            this._showExplanation(false);
        }

        Progress.recordAnswer(this.currentSubject, this.currentTopic, correct);
        Adaptive.adjust(this.currentSubject, this.currentTopic, Game.bestStreak);

        // Delay: correct = 1s, wrong = scaled by explanation length (min 3s, max 5s)
        let delay = 1000;
        if (!correct) {
            const explLen = (this.currentQuestion.explanation || '').length;
            delay = Math.min(5000, Math.max(3000, 2000 + explLen * 25));
        }
        setTimeout(() => {
            this.hide();
            this._answered = false;
            if (this.onAnswer) this.onAnswer(correct);
        }, delay);
    },

    _showExplanation(wasCorrect) {
        const bubble = document.getElementById('explanation-bubble');
        const q = this.currentQuestion;

        if (q.explanation) {
            bubble.textContent = wasCorrect ? `✓ ${q.explanation}` : q.explanation;
            bubble.style.display = 'block';

            // Speak the explanation after a brief pause (respects voice setting)
            if (!wasCorrect && Settings.get('voice') !== false) {
                setTimeout(() => {
                    Audio.speak(q.explanationSpeak || q.explanation);
                }, 500);
            }
        } else if (!wasCorrect) {
            // Fallback: just encourage
            const phrase = Audio.encourageWrong();
            this._showFeedback(phrase, false);
        }
    },

    _showFeedback(text, isCorrect) {
        const feedback = document.getElementById('race-feedback');
        feedback.textContent = text;
        feedback.className = 'race-feedback ' + (isCorrect ? 'correct-feedback' : 'wrong-feedback');
        feedback.style.display = 'block';
        feedback.style.animation = 'none';
        feedback.offsetHeight;
        feedback.style.animation = 'feedback-pop 0.8s forwards';
        setTimeout(() => { feedback.style.display = 'none'; }, 800);
    },

    // V14: Sparkle particle burst from correct answer button
    _spawnParticleBurst(btn) {
        if (Settings.prefersReducedMotion) return; // V18: Respect reduced motion
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const colors = ['#ffd700', '#2ecc71', '#fff', '#ffaa00', '#7dffb3', '#ffe066'];
        const count = 18;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'answer-particle';
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
            const dist = 40 + Math.random() * 60;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const size = 4 + Math.random() * 6;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
                position:fixed; left:${cx}px; top:${cy}px;
                width:${size}px; height:${size}px; border-radius:50%;
                background:${color}; pointer-events:none; z-index:9999;
                box-shadow: 0 0 ${size}px ${color};
            `;

            document.body.appendChild(particle);

            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500 + Math.random() * 300,
                easing: 'cubic-bezier(0, 0.9, 0.3, 1)',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
    },

    hide() {
        document.getElementById('question-overlay').style.display = 'none';
        document.getElementById('explanation-bubble').style.display = 'none';
    },

    replayQuestion() {
        if (this.currentQuestion) {
            Audio.speak(this.currentQuestion.questionSpeak || this.currentQuestion.question);
        }
    }
};
