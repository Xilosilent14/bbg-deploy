// ===== QUESTION SYSTEM =====
const Questions = {
    currentQuestion: null,
    currentSubject: null,
    currentTopic: null,
    onAnswer: null,
    _usedThisRace: new Set(), // V31: Prevent repeat questions in same race

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

        // V31: Deduplicate — retry if same question text already used this race
        let retries = 0;
        while (retries < 5 && data && this._usedThisRace.has(data.question)) {
            retries++;
            try {
                data = subject === 'math'
                    ? MathData.generate(topic, params.level)
                    : ReadingData.generate(topic, params.level);
            } catch (e) { break; }
        }
        if (data) this._usedThisRace.add(data.question);

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
            // V21: Hide arrow pad while question is showing
            const arrowPad = document.getElementById('arrow-pad');
            if (arrowPad) arrowPad.style.display = 'none';
            Audio.speak(data.questionSpeak || data.question, { context: 'question' });

            setTimeout(() => {
                questionText.innerHTML = data.question.replace(/\n/g, '<br>');
                this._renderAnswers(data, answersGrid);
            }, data.flashDuration || 800);
            return;
        }

        questionText.innerHTML = data.question.replace(/\n/g, '<br>');
        this._renderAnswers(data, answersGrid);
        overlay.style.display = 'flex';
        // V21: Hide arrow pad while question is showing
        const arrowPad = document.getElementById('arrow-pad');
        if (arrowPad) arrowPad.style.display = 'none';
        // V22: Pulse the speaker button so kid knows they can tap it
        const speakerBtn = document.getElementById('btn-replay-question');
        if (speakerBtn) {
            speakerBtn.classList.remove('speaking');
            void speakerBtn.offsetHeight; // force reflow
            speakerBtn.classList.add('speaking');
        }
        Audio.speak(data.questionSpeak || data.question, { context: 'question' });
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
            // V36 fix: Prevent double-fire from click + touchend on touch devices
            // touchend fires first, then browser synthesizes a click ~300ms later
            btn.addEventListener('click', () => {
                if (this._lastTouchTime && Date.now() - this._lastTouchTime < 500) return;
                this._handleAnswer(i, btn);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this._lastTouchTime = Date.now();
                this._handleAnswer(i, btn);
            });
            answersGrid.appendChild(btn);
        });

        // V33: Focus trap — focus first answer button + trap Tab within overlay
        this._setupFocusTrap();
    },

    // V33: Focus trap for question overlay (accessibility)
    _setupFocusTrap() {
        const overlay = document.getElementById('question-overlay');
        if (!overlay || !overlay.setAttribute) return;
        overlay.setAttribute('aria-modal', 'true');

        // Focus first answer button
        if (overlay.querySelector) {
            const firstBtn = overlay.querySelector('.answer-btn');
            if (firstBtn) setTimeout(() => firstBtn.focus(), 50);
        }

        // Remove old handler if exists
        if (this._focusTrapHandler && overlay.removeEventListener) {
            overlay.removeEventListener('keydown', this._focusTrapHandler);
        }
        this._focusTrapHandler = (e) => {
            if (e.key !== 'Tab') return;
            if (!overlay.querySelectorAll) return;
            // V36 fix: Include .answered buttons so focus trap still works during feedback delay
            const focusable = overlay.querySelectorAll('.answer-btn, #btn-replay-question');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        if (overlay.addEventListener) overlay.addEventListener('keydown', this._focusTrapHandler);
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
            Audio.playCorrect(Game.streak);
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

        Progress.recordAnswer(this.currentSubject, this.currentTopic, correct, this.currentQuestion.subtype);
        Adaptive.adjust(this.currentSubject, this.currentTopic, Game.bestStreak);

        // Cross-game ecosystem tracking
        if (typeof OTBEcosystem !== 'undefined') {
            const level = Adaptive.getLevel ? Adaptive.getLevel(this.currentSubject, this.currentTopic) : 0;
            OTBEcosystem.recordAnswer(this.currentTopic, this.currentSubject, correct, level, 'think-fast');
        }

        // Delay: correct = 1s, wrong = scaled by explanation length (min 3s, max 5s)
        let delay = 1000;
        if (!correct) {
            const explLen = (this.currentQuestion.explanation || '').length;
            delay = Math.min(5000, Math.max(3000, 2000 + explLen * 25));
        }
        // V36 fix: Track timeout so hide() can cancel stale callbacks
        if (this._answerTimeout) clearTimeout(this._answerTimeout);
        this._answerTimeout = setTimeout(() => {
            this._answerTimeout = null;
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

            // V36 fix: For wrong answers, speak encouragement first then explanation
            // Previously encouragement was immediately cut off by explanation at +500ms
            // Now: encouragement plays immediately (from _handleAnswer), then explanation
            // starts after 1500ms so the encouragement phrase finishes naturally
            if (!wasCorrect && Settings.get('voice') !== false) {
                setTimeout(() => {
                    Audio.speak(q.explanationSpeak || q.explanation, { context: 'explain' });
                }, 1500);
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
        const overlay = document.getElementById('question-overlay');
        overlay.style.display = 'none';
        // V36 fix: Cancel pending answer timeout to prevent stale onAnswer callbacks
        if (this._answerTimeout) { clearTimeout(this._answerTimeout); this._answerTimeout = null; }
        // V33: Clean up focus trap
        if (overlay.removeAttribute) overlay.removeAttribute('aria-modal');
        if (this._focusTrapHandler && overlay.removeEventListener) {
            overlay.removeEventListener('keydown', this._focusTrapHandler);
            this._focusTrapHandler = null;
        }
        document.getElementById('explanation-bubble').style.display = 'none';
        // V32: Cancel any in-progress TTS so it doesn't outlast the overlay
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        // V21: Show arrow pad again
        const arrowPad = document.getElementById('arrow-pad');
        if (arrowPad) arrowPad.style.display = 'flex';
        // V33: Return focus to race canvas
        const canvas = document.getElementById('race-canvas');
        if (canvas) canvas.focus();
    },

    replayQuestion() {
        if (this.currentQuestion) {
            Audio.speak(this.currentQuestion.questionSpeak || this.currentQuestion.question);
        }
    },

    // V31: Reset dedup set at start of each race
    resetRace() {
        this._usedThisRace = new Set();
    }
};
