/* ============================================
   CREATURE CARDS — Main Controller
   Screen management, UI wiring, battle flow
   ============================================ */
(() => {
    let currentZone = null;
    let currentTier = 1;
    let battleAction = null;
    let questionStartTime = 0;
    let _packReturnScreen = null;
    let _battleStartTime = 0;
    let _battleQuestionsTotal = 0;
    let _battleQuestionsCorrect = 0;
    let battlePaused = false;

    // === TTS for question reading (kids can't read yet) ===
    let _ttsVoice = null;
    function _initTTS() {
        if (!window.speechSynthesis) return;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            const en = voices.filter(v => /^en[-_]/i.test(v.lang));
            const preferred = ['samantha', 'google us english', 'microsoft zira', 'microsoft aria',
                'en-us-x-sfg-local', 'en-us-x-tpd-local', 'english united states'];
            for (const p of preferred) {
                const m = en.find(v => v.name.toLowerCase().includes(p));
                if (m) { _ttsVoice = m; return; }
            }
            _ttsVoice = en.find(v => v.localService) || en[0] || null;
        }
    }
    if (window.speechSynthesis) {
        _initTTS();
        if (window.speechSynthesis.onvoiceschanged !== undefined)
            window.speechSynthesis.onvoiceschanged = _initTTS;
    }
    // Pre-generated TTS cache (on-demand loading)
    const _ttsMP3Cache = {};
    const _ttsPending = new Set();
    function _tryPregenTTS(key, subdir, volume) {
        const cacheKey = subdir + '/' + key;
        const buf = _ttsMP3Cache[cacheKey];
        if (buf) {
            const settings = typeof Progress !== 'undefined' ? Progress.getSettings() : {};
            if (settings.voice === false) return true;
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const source = ctx.createBufferSource();
                source.buffer = buf;
                const gain = ctx.createGain();
                gain.gain.value = volume || 0.8;
                source.connect(gain);
                gain.connect(ctx.destination);
                source.start(0);
            } catch (_) {}
            return true;
        }
        if (!_ttsPending.has(cacheKey)) {
            _ttsPending.add(cacheKey);
            fetch(`assets/sounds/tts/${subdir}/${key}.mp3`)
                .then(r => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
                .then(b => (new (window.AudioContext || window.webkitAudioContext)()).decodeAudioData(b))
                .then(decoded => { _ttsMP3Cache[cacheKey] = decoded; })
                .catch(() => {});
        }
        return false;
    }
    function _speak(text) {
        const settings = typeof Progress !== 'undefined' ? Progress.getSettings() : {};
        if (settings.voice === false) return;
        const trimmed = (text || '').trim();
        if (!trimmed) return;

        // Use Google Cloud TTS (works on Silk tablets)
        if (typeof CloudTTS !== 'undefined') {
            CloudTTS.speakFemale(trimmed);
            return;
        }
        // Legacy fallback below
        if (!trimmed) return;

        // Try pre-generated MP3 first
        const qKey = trimmed.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-').substring(0, 60);
        if (qKey.length > 3) {
            if (_tryPregenTTS(qKey, 'questions/reading', 0.8) ||
                _tryPregenTTS(qKey, 'questions/math', 0.8) ||
                _tryPregenTTS(qKey, 'feedback', 0.8)) return;
        }
        // Single word: try words list
        if (trimmed.split(/\s+/).length === 1 && /^[a-zA-Z]+$/.test(trimmed)) {
            if (_tryPregenTTS(trimmed.toLowerCase(), 'words', 0.8)) return;
        }

        // Fallback to browser speechSynthesis
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        u.pitch = 1.05;
        u.volume = 0.9;
        if (_ttsVoice) u.voice = _ttsVoice;
        window.speechSynthesis.speak(u);
        // Retry for Silk/Android
        setTimeout(() => {
            if (window.speechSynthesis && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                try { window.speechSynthesis.speak(u); } catch (_) {}
            }
        }, 250);
    }

    // === BATTLE ANIMATION HELPERS ===
    const TYPE_COLORS = {
        ember: '#e8592a', tidal: '#2196F3', terra: '#4CAF50',
        spark: '#FFD600', shadow: '#7E57C2'
    };

    function playBattleAnimation(selector, animClass, duration) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.classList.remove(animClass);
        void el.offsetWidth; // force reflow for re-trigger
        el.classList.add(animClass);
        setTimeout(() => el.classList.remove(animClass), duration);
    }

    function spawnAttackParticles(selector, color, count) {
        const container = document.querySelector(selector);
        if (!container) return;
        container.style.position = 'relative';
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'attack-particle';
            p.style.width = p.style.height = (6 + Math.random() * 8) + 'px';
            p.style.background = color;
            p.style.left = (40 + Math.random() * 20) + '%';
            p.style.top = (30 + Math.random() * 40) + '%';
            p.style.setProperty('--px', (Math.random() * 60 - 30) + 'px');
            p.style.setProperty('--py', (Math.random() * 60 - 30) + 'px');
            container.appendChild(p);
            setTimeout(() => p.remove(), 500);
        }
    }

    function showDamageNumber(selector, text, className) {
        const container = document.querySelector(selector);
        if (!container) return;
        container.style.position = 'relative';
        const num = document.createElement('div');
        num.className = 'damage-number' + (className ? ' ' + className : '');
        num.textContent = text;
        num.style.left = '50%';
        num.style.top = '20%';
        num.style.transform = 'translateX(-50%)';
        container.appendChild(num);
        setTimeout(() => num.remove(), 800);
    }

    const ZONES = [
        { id: 'ember',  name: 'Ember Fields',  type: 'ember',  icon: '🔥', cssClass: 'zone-ember' },
        { id: 'tidal',  name: 'Tidal Shores',  type: 'tidal',  icon: '💧', cssClass: 'zone-tidal' },
        { id: 'terra',  name: 'Wild Grove',     type: 'terra',  icon: '🌿', cssClass: 'zone-terra' },
        { id: 'spark',  name: 'Bolt Canyon',    type: 'spark',  icon: '⚡', cssClass: 'zone-spark' },
        { id: 'shadow', name: 'Gloom Hollow',   type: 'shadow', icon: '🌙', cssClass: 'zone-shadow' }
    ];

    // === CREATURE SPRITE HELPER ===
    function getCreatureDisplay(creature, sizeClass) {
        const cls = sizeClass || 'creature-sprite';
        // Use individual creature PNG by ID
        if (creature.id) {
            return `<img class="${cls}" src="assets/creatures/${creature.id}.png" alt="${creature.name || creature.id}" onerror="this.outerHTML='<span style=\\'font-size:3rem\\'>${creature.emoji || '?'}</span>'">`;
        }
        const fontSize = cls === 'creature-sprite-sm' ? '1.5rem' : cls === 'creature-sprite-lg' ? '3.5rem' : '2.5rem';
        return `<span style="font-size:${fontSize}">${creature.emoji}</span>`;
    }

    // Get display data for a creature, accounting for evolution
    function getCreatureDisplayData(creatureOrId, evolved) {
        let base;
        if (typeof creatureOrId === 'string') {
            base = CreatureData.getCreature(creatureOrId);
        } else {
            base = CreatureData.getCreature(creatureOrId.id) || creatureOrId;
        }
        if (!base) return null;
        // For sprite display, always use the base sprite (sprites don't change on evolution)
        return {
            emoji: evolved ? (base.evolvedEmoji || base.emoji) : base.emoji,
            spriteSheet: base.spriteSheet,
            spritePos: base.spritePos,
            name: evolved ? (base.evolvedName || base.name) : base.name
        };
    }

    function init() {
        // Set BBG logo to hub URL
        if(typeof OTBConfig!=='undefined'){const u=OTBConfig.getHubUrl();const l=document.getElementById('bbg-logo-link');if(l)l.href=u;}

        // Initialize audio system
        AudioSystem.init();
        // Unlock audio on first user interaction (required for mobile)
        document.addEventListener('click', () => { AudioSystem.unlock(); if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; window.speechSynthesis.speak(u); } }, { once: true });
        document.addEventListener('touchstart', () => { AudioSystem.unlock(); if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(''); u.volume = 0; window.speechSynthesis.speak(u); } }, { once: true });

        // First time: give starter pack
        if (!Collection.hasStarterPack()) {
            Collection.giveStarterPack();
            Progress.autoFillDeck();
        }

        // Wire buttons (all with click SFX)
        document.getElementById('btn-play').addEventListener('click', () => { AudioSystem.playClick(); showScreen('map'); });
        document.getElementById('btn-collection').addEventListener('click', () => { AudioSystem.playClick(); showScreen('collection'); });
        document.getElementById('btn-deck').addEventListener('click', () => { AudioSystem.playClick(); showScreen('deck'); });
        document.getElementById('btn-achievements').addEventListener('click', () => { AudioSystem.playClick(); showScreen('achievements'); });
        document.getElementById('btn-achievements-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-settings').addEventListener('click', () => { AudioSystem.playClick(); showScreen('settings'); });
        document.getElementById('btn-parent').addEventListener('click', () => { AudioSystem.playClick(); showScreen('parent'); });
        document.getElementById('btn-coll-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-deck-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-map-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-settings-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-parent-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });
        document.getElementById('btn-to-map').addEventListener('click', () => { AudioSystem.playClick(); AudioSystem.stopMusic(); showScreen('map'); });
        document.getElementById('btn-to-home').addEventListener('click', () => { AudioSystem.playClick(); AudioSystem.stopMusic(); showScreen('title'); });
        document.getElementById('btn-next-battle').addEventListener('click', () => { AudioSystem.playClick(); _startBattle(currentZone, currentTier); });
        document.getElementById('btn-auto-fill').addEventListener('click', () => {
            AudioSystem.playClick();
            Progress.autoFillDeck();
            _buildDeckScreen();
        });
        document.getElementById('btn-pack-done').addEventListener('click', () => {
            AudioSystem.playClick();
            // Return to shop if we came from there, else title
            if (_packReturnScreen) {
                showScreen(_packReturnScreen);
                _packReturnScreen = null;
            } else {
                showScreen('title');
            }
        });

        // Battle exit
        document.getElementById('btn-battle-exit').addEventListener('click', () => {
            AudioSystem.playClick();
            AudioSystem.stopMusic();
            showScreen('title');
        });

        // Pause
        document.getElementById('btn-battle-pause').addEventListener('click', () => {
            AudioSystem.playClick();
            _pauseBattle();
        });
        document.getElementById('btn-battle-resume').addEventListener('click', () => {
            AudioSystem.playClick();
            _resumeBattle();
        });
        document.getElementById('btn-battle-quit').addEventListener('click', () => {
            AudioSystem.playClick();
            _resumeBattle();
            AudioSystem.stopMusic();
            showScreen('title');
        });

        // Auto-pause on tab switch
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && currentScreen === 'battle' && !battlePaused) {
                _pauseBattle();
            }
        });

        // Battle actions
        document.getElementById('btn-attack').addEventListener('click', () => { AudioSystem.playClick(); _onBattleAction('attack'); });
        document.getElementById('btn-ability').addEventListener('click', () => { AudioSystem.playClick(); _onBattleAction('ability'); });
        document.getElementById('btn-swap').addEventListener('click', () => { AudioSystem.playClick(); _showSwapPanel(); });
        document.getElementById('btn-swap-cancel').addEventListener('click', () => { AudioSystem.playClick(); _hideSwapPanel(); });

        // Shop
        document.getElementById('btn-shop').addEventListener('click', () => { AudioSystem.playClick(); showScreen('shop'); });
        document.getElementById('btn-shop-back').addEventListener('click', () => { AudioSystem.playClick(); showScreen('title'); });

        // Settings toggles
        document.querySelectorAll('.otb-settings-item').forEach(item => {
            item.addEventListener('click', () => {
                AudioSystem.playClick();
                const key = item.dataset.setting;
                const track = item.querySelector('.otb-toggle-track');
                const isOn = track.classList.contains('on');
                track.classList.toggle('on');
                item.classList.toggle('on');
                Progress.saveSetting(key, !isOn);
                // Wire settings to audio system
                if (key === 'sfx') AudioSystem.setSFX(!isOn);
                if (key === 'music') AudioSystem.setMusic(!isOn);
            });
        });

        // Daily pack check
        if (Progress.canClaimDailyPack()) {
            Progress.claimDailyPack();
            const cards = Collection.openPack('daily');
            // Show pack opening after splash
            setTimeout(() => {
                AudioSystem.playDailyPack();
                _packReturnScreen = null;
                _showPackOpening(cards, 'Daily Pack!');
            }, 2500);
        }

        // Ecosystem daily streak
        if (typeof OTBEcosystem !== 'undefined') OTBEcosystem.checkDailyStreak();

        // Splash -> Title
        setTimeout(() => {
            const splash = document.getElementById('splash');
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (!Progress.canClaimDailyPack()) showScreen('title');
                // If daily pack, pack screen will show instead
            }, 500);
        }, 2000);
    }

    function showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById('screen-' + name);
        if (screen) screen.classList.add('active');

        if (name === 'collection') _buildCollectionScreen();
        if (name === 'deck') _buildDeckScreen();
        if (name === 'map') _buildMapScreen();
        if (name === 'shop') _buildShopScreen();
        if (name === 'achievements') _buildAchievementsScreen();
        if (name === 'parent') ParentDashboard.open();

        // Title screen ambient music + collection counter + streak + achievements
        if (name === 'title') {
            AudioSystem.stopMusic();
            AudioSystem.startTitleMusic();
            const cc = document.getElementById('title-collection-counter');
            if (cc) cc.textContent = Collection.getOwnedCount() + ' / 30 Creatures';
            // Streak badge
            const streakEl = document.getElementById('title-streak-badge');
            if (streakEl && typeof OTBEcosystem !== 'undefined') {
                const profile = OTBEcosystem.getProfile();
                if (profile.dailyStreak > 0) {
                    streakEl.textContent = '\uD83D\uDD25 ' + profile.dailyStreak + ' day streak!';
                    streakEl.style.display = '';
                }
            }
            // Achievement count
            const achEl = document.getElementById('title-achievement-count');
            if (achEl && typeof Achievements !== 'undefined') {
                const count = Achievements.getEarnedCount();
                const total = Achievements.definitions.length;
                if (count > 0) {
                    achEl.textContent = '\uD83C\uDFC6 ' + count + '/' + total;
                    achEl.style.display = '';
                }
            }
        }
    }

    // === COLLECTION SCREEN ===
    function _buildCollectionScreen() {
        const tabs = document.getElementById('coll-tabs');
        const grid = document.getElementById('coll-grid');
        const count = document.getElementById('coll-count');

        const types = ['all', 'ember', 'tidal', 'terra', 'spark', 'shadow'];
        let activeType = 'all';

        count.textContent = `${Collection.getOwnedCount()} / ${CreatureData.getAllCreatures().length}`;

        tabs.innerHTML = types.map(t => {
            const typeData = CreatureData.TYPES[t];
            const label = t === 'all' ? '🌟 All' : `${typeData?.icon || ''} ${typeData?.name || t}`;
            return `<button class="type-tab ${t === activeType ? 'active' : ''}" data-type="${t}">${label}</button>`;
        }).join('');

        tabs.querySelectorAll('.type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                AudioSystem.playClick();
                activeType = tab.dataset.type;
                tabs.querySelectorAll('.type-tab').forEach(t => t.classList.toggle('active', t.dataset.type === activeType));
                _renderCreatureGrid(grid, activeType);
            });
        });

        _renderCreatureGrid(grid, activeType);
    }

    function _renderCreatureGrid(grid, typeFilter) {
        let creatures = CreatureData.getAllCreatures();
        if (typeFilter !== 'all') creatures = creatures.filter(c => c.type === typeFilter);

        grid.innerHTML = creatures.map(c => {
            const owned = Collection.isOwned(c.id);
            const evolved = Collection.isEvolved(c.id);
            const rarityColor = CreatureData.RARITIES[c.rarity]?.color || '#999';
            const dd = getCreatureDisplayData(c, evolved);
            const displayName = dd ? dd.name : c.name;
            const wins = Collection.getCreatureWins(c.id);
            const threshold = c.evolvesAt;

            let progressText = '';
            if (owned && !evolved && threshold) {
                progressText = `${wins}/${threshold} wins`;
            }

            const creatureVisual = owned && dd ? getCreatureDisplay(dd, 'creature-sprite-sm') : '<span style="font-size:2rem">❓</span>';

            return `
                <div class="creature-slot ${owned ? 'owned' : 'unowned'} ${evolved ? 'evolved-border' : ''}" style="position:relative;">
                    ${evolved ? '<div class="evolved-badge">EVOLVED</div>' : ''}
                    <div class="creature-emoji">${creatureVisual}</div>
                    <div class="creature-name">${owned ? displayName : '???'}</div>
                    <div class="creature-rarity" style="color:${rarityColor}">${owned ? c.rarity : ''}</div>
                    ${owned && progressText ? `<div class="creature-progress">${progressText}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // === DECK BUILDER ===
    function _buildDeckScreen() {
        const slotsEl = document.getElementById('deck-slots');
        const gridEl = document.getElementById('deck-grid');
        const deck = Progress.getDeck();
        const deckIds = Progress.get().deck || [];

        // Render 5 deck slots
        slotsEl.innerHTML = Array.from({ length: 5 }, (_, i) => {
            const c = deck[i];
            if (c) {
                const evolved = Collection.isEvolved(c.id);
                const dd = getCreatureDisplayData(c, evolved);
                const displayName = dd ? dd.name : c.name;
                const visual = dd ? getCreatureDisplay(dd, 'creature-sprite-sm') : `<span style="font-size:1.5rem">${c.emoji}</span>`;
                return `<div class="deck-slot filled ${evolved ? 'evolved-border' : ''}" data-slot="${i}" style="position:relative;">
                    ${evolved ? '<div class="evolved-badge">EVO</div>' : ''}
                    <div class="creature-emoji">${visual}</div>
                    <div class="slot-name">${displayName}</div>
                </div>`;
            }
            return `<div class="deck-slot" data-slot="${i}">Empty</div>`;
        }).join('');

        // Render owned creatures grid
        const owned = Collection.getOwnedList();
        gridEl.innerHTML = owned.map(c => {
            const inDeck = deckIds.includes(c.id);
            const evolved = Collection.isEvolved(c.id);
            const dd = getCreatureDisplayData(c, evolved);
            const displayName = dd ? dd.name : c.name;
            const visual = dd ? getCreatureDisplay(dd, 'creature-sprite-sm') : `<span style="font-size:2rem">${c.emoji}</span>`;
            const typeColor = CreatureData.TYPES[c.type]?.color || '#999';
            return `
                <div class="creature-slot owned ${inDeck ? 'in-deck' : ''} ${evolved ? 'evolved-border' : ''}" data-id="${c.id}"
                     style="border-color: ${inDeck ? 'var(--game-accent)' : typeColor}; position:relative;">
                    ${evolved ? '<div class="evolved-badge">EVO</div>' : ''}
                    <div class="creature-emoji">${visual}</div>
                    <div class="creature-name">${displayName}</div>
                    <div class="creature-rarity" style="color:${CreatureData.RARITIES[c.rarity]?.color || '#999'}">${c.rarity}</div>
                </div>
            `;
        }).join('');

        // Wire tap to add/remove from deck
        gridEl.querySelectorAll('.creature-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                AudioSystem.playClick();
                const id = slot.dataset.id;
                const d = Progress.get();
                if (d.deck.includes(id)) {
                    d.deck = d.deck.filter(did => did !== id);
                } else if (d.deck.length < 5) {
                    d.deck.push(id);
                }
                Progress.save(d);
                _buildDeckScreen();
            });
        });
    }

    // === MAP SCREEN ===
    function _buildMapScreen() {
        const el = document.getElementById('map-zones');
        el.innerHTML = ZONES.map(zone => {
            const prog = Progress.getZoneProgress(zone.id);
            return `
                <div class="zone-card ${zone.cssClass}" data-zone="${zone.id}">
                    <div class="zone-icon">${zone.icon}</div>
                    <div class="zone-name">${zone.name}</div>
                    <div class="zone-progress">Tier ${prog.tier} / 5 | Wins: ${prog.wins}</div>
                </div>
            `;
        }).join('');

        el.querySelectorAll('.zone-card').forEach(card => {
            card.addEventListener('click', () => {
                AudioSystem.playClick();
                const zoneId = card.dataset.zone;
                const zone = ZONES.find(z => z.id === zoneId);
                const prog = Progress.getZoneProgress(zoneId);
                _startBattle(zone, prog.tier);
            });
        });
    }

    // === BATTLE FLOW ===
    function _pauseBattle() {
        battlePaused = true;
        document.getElementById('battle-pause-overlay').classList.add('active');
        AudioSystem.pauseMusic && AudioSystem.pauseMusic();
    }

    function _resumeBattle() {
        battlePaused = false;
        document.getElementById('battle-pause-overlay').classList.remove('active');
        AudioSystem.resumeMusic && AudioSystem.resumeMusic();
    }

    function _startBattle(zone, tier) {
        battlePaused = false;
        document.getElementById('battle-pause-overlay').classList.remove('active');
        currentZone = zone;
        currentTier = tier;

        const deck = Progress.getDeck();
        if (deck.length === 0) {
            Progress.autoFillDeck();
            const retryDeck = Progress.getDeck();
            if (retryDeck.length === 0) {
                // No creatures at all, can't battle
                showScreen('title');
                return;
            }
        }

        // Generate opponent team based on zone type and tier
        const oppPool = CreatureData.getCreaturesByType(zone.type);
        const oppCount = Math.min(tier >= 4 ? 3 : 2, oppPool.length);
        const shuffled = [...oppPool].sort(() => Math.random() - 0.5);
        const oppTeam = shuffled.slice(0, oppCount).map(c => ({
            ...c,
            // Scale stats by tier
            stats: {
                pwr: c.stats.pwr + Math.floor(tier * 0.5),
                grd: c.stats.grd + Math.floor(tier * 0.3),
                spd: c.stats.spd + Math.floor(tier * 0.3),
                mag: c.stats.mag + Math.floor(tier * 0.3)
            }
        }));

        BattleEngine.startBattle(deck.slice(0, 3), oppTeam, tier);
        QuestionBridge.reset();
        _battleStartTime = Date.now();
        _battleQuestionsTotal = 0;
        _battleQuestionsCorrect = 0;
        showScreen('battle');
        _updateBattleUI();
        AudioSystem.startBattleMusic();

        // Show actions, hide swap panel
        document.getElementById('question-area').style.display = 'none';
        document.getElementById('swap-panel').style.display = 'none';
        document.getElementById('battle-actions').style.display = 'flex';
    }

    function _onBattleAction(action) {
        battleAction = action;
        // Show question
        const state = BattleEngine.getState();
        const playerCreature = state.player[state.playerActive];
        const isAbility = action === 'ability';
        const q = QuestionBridge.generate(playerCreature.type, isAbility);

        document.getElementById('q-text').textContent = q.question;
        const grid = document.getElementById('answer-grid');
        grid.innerHTML = q.answers.map((a, i) => `
            <button class="answer-btn" data-idx="${i}">${a}</button>
        `).join('');

        grid.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                AudioSystem.playClick();
                _onAnswer(parseInt(btn.dataset.idx), q);
            });
        });

        // Reset timer bar, speed bonus, explanation
        const timerFill = document.getElementById('question-timer-fill');
        timerFill.classList.remove('animating', 'expired');
        timerFill.style.transform = '';
        timerFill.style.background = '';
        // Force reflow so animation restarts cleanly
        void timerFill.offsetWidth;
        timerFill.classList.add('animating');

        document.getElementById('speed-bonus').classList.remove('visible');
        document.getElementById('explanation-box').classList.remove('visible');
        document.getElementById('explanation-box').textContent = '';

        document.getElementById('question-area').style.display = 'block';
        document.getElementById('battle-actions').style.display = 'none';
        questionStartTime = Date.now();

        // Auto-read question aloud for young kids
        setTimeout(() => _speak(q.questionSpeak || q.question), 200);
    }

    function _onAnswer(idx, question) {
        const correct = idx === question.correctIndex;
        const fast = (Date.now() - questionStartTime) < 5000;

        // Stop timer animation and freeze at current position
        const timerFill = document.getElementById('question-timer-fill');
        const elapsed = (Date.now() - questionStartTime) / 5000;
        const remaining = Math.max(0, 1 - elapsed);
        timerFill.classList.remove('animating');
        timerFill.style.transform = 'scaleX(' + remaining + ')';
        if (!fast) timerFill.style.background = 'var(--otb-danger)';

        // Speed bonus indicator
        if (correct && fast) {
            document.getElementById('speed-bonus').classList.add('visible');
        }

        // Audio + visual feedback
        if (correct) {
            AudioSystem.playCorrect();
        } else {
            AudioSystem.playWrong();
        }

        const btns = document.querySelectorAll('#answer-grid .answer-btn');
        btns.forEach((btn, i) => {
            btn.disabled = true;
            if (i === question.correctIndex) btn.classList.add('correct');
            if (i === idx && !correct) btn.classList.add('wrong');
        });

        // Show explanation on wrong answers
        if (!correct && question.explanation) {
            const explBox = document.getElementById('explanation-box');
            explBox.textContent = question.explanation;
            explBox.classList.add('visible');
        }

        // Track per-battle stats
        _battleQuestionsTotal++;
        if (correct) _battleQuestionsCorrect++;

        // Record answer in ecosystem and progress
        QuestionBridge.recordAnswer(correct);
        Progress.recordQuestion(correct);
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.recordAnswer(question.topic, question.domain, correct, QuestionBridge.getLevel(), 'creature-cards');
        }

        // Execute battle turn after brief delay (longer if showing explanation)
        const delay = (!correct && question.explanation) ? 2500 : 800;
        setTimeout(() => {
            const prevState = BattleEngine.getState();
            const prevOppHP = prevState.opponent[prevState.opponentActive].hp;
            const prevPlayerHP = prevState.player[prevState.playerActive].hp;
            const playerType = prevState.player[prevState.playerActive].type;
            const oppType = prevState.opponent[prevState.opponentActive].type;
            const typeAdv = CreatureData.getTypeAdvantage(playerType, oppType);

            const state = BattleEngine.playerTurn(battleAction, correct, fast);
            document.getElementById('question-area').style.display = 'none';

            const currOpp = state.opponent[state.opponentActive];
            const currPlayer = state.player[state.playerActive];
            const oppDmgTaken = prevOppHP - currOpp.hp;
            const playerDmgTaken = prevPlayerHP - currPlayer.hp;

            // --- PLAYER ATTACK ANIMATIONS ---
            if (correct) {
                const color = TYPE_COLORS[playerType] || '#fff';

                if (battleAction === 'ability') {
                    AudioSystem.playAbility();
                    playBattleAnimation('#player-creature', 'ability-anim', 500);
                    setTimeout(() => {
                        spawnAttackParticles('#opp-creature', color, 12);
                    }, 200);
                } else {
                    AudioSystem.playTypedAttack(playerType);
                    // Player lunge toward opponent
                    playBattleAnimation('#player-emoji', 'attack-anim', 500);
                    setTimeout(() => {
                        spawnAttackParticles('#opp-creature', color, 8);
                    }, 200);
                }

                // Type advantage flash
                if (typeAdv > 1) {
                    playBattleAnimation('.battle-area', 'type-advantage-anim', 600);
                }
            } else {
                AudioSystem.playWeakAttack();
                // Weak attack: small particles only
                spawnAttackParticles('#opp-creature', '#999', 3);
            }

            // Opponent takes damage
            if (oppDmgTaken > 0) {
                setTimeout(() => {
                    AudioSystem.playDamage();
                    playBattleAnimation('#opp-creature', 'damage-anim', 400);
                    playBattleAnimation('#opp-hp', 'hp-drain-anim', 300);
                    const numClass = typeAdv > 1 ? 'crit' : (oppDmgTaken <= 2 ? 'weak' : '');
                    showDamageNumber('#opp-creature', '-' + oppDmgTaken, numClass);
                }, 250);
            }

            // Opponent fainted
            if (prevOppHP > 0 && currOpp.hp <= 0) {
                setTimeout(() => {
                    AudioSystem.playFainted();
                    playBattleAnimation('#opp-emoji', 'faint-anim', 600);
                }, 500);
            }

            // Heal animation (if ability healed player)
            if (currPlayer.hp > prevPlayerHP) {
                setTimeout(() => {
                    playBattleAnimation('#player-creature', 'heal-anim', 600);
                    showDamageNumber('#player-creature', '+' + (currPlayer.hp - prevPlayerHP), 'heal');
                }, 300);
            }

            // --- OPPONENT COUNTERATTACK ANIMATIONS ---
            if (playerDmgTaken > 0) {
                const oppColor = TYPE_COLORS[oppType] || '#fff';
                setTimeout(() => {
                    playBattleAnimation('#opp-emoji', 'attack-anim-reverse', 500);
                }, 500);
                setTimeout(() => {
                    AudioSystem.playDamage();
                    playBattleAnimation('#player-creature', 'damage-anim', 400);
                    playBattleAnimation('#player-hp', 'hp-drain-anim', 300);
                    spawnAttackParticles('#player-creature', oppColor, 6);
                    showDamageNumber('#player-creature', '-' + playerDmgTaken, '');
                }, 700);
            }

            // Player creature fainted
            if (prevPlayerHP > 0 && currPlayer.hp <= 0) {
                setTimeout(() => {
                    AudioSystem.playFainted();
                    playBattleAnimation('#player-emoji', 'faint-anim', 600);
                }, 900);
            }

            _updateBattleUI();

            if (state.finished) {
                AudioSystem.stopMusic();
                setTimeout(() => {
                    if (state.winner === 'player') {
                        AudioSystem.playVictory();
                        playBattleAnimation('#player-creature', 'victory-anim', 2400);
                    } else {
                        AudioSystem.playDefeat();
                    }
                    _showResults(state);
                }, 1200);
            } else {
                // Delay showing actions so animations finish
                setTimeout(() => {
                    document.getElementById('battle-actions').style.display = 'flex';
                }, playerDmgTaken > 0 ? 600 : 200);
            }
        }, delay);
    }

    function _updateBattleUI() {
        const state = BattleEngine.getState();
        if (!state) return;

        const pc = state.player[state.playerActive];
        const oc = state.opponent[state.opponentActive];

        // Player creature (use evolved display if applicable)
        const pcEvolved = pc._evolved;
        const pcBase = CreatureData.getCreature(pc.id);
        const pcDD = getCreatureDisplayData(pcBase, pcEvolved);
        const pcName = pcDD ? pcDD.name : pc.name;
        document.getElementById('player-emoji').innerHTML = pcDD ? getCreatureDisplay(pcDD, 'creature-sprite-lg') : `<span style="font-size:4rem">${pc.emoji}</span>`;
        document.getElementById('player-name').textContent = pcName;
        const ptd = CreatureData.TYPES[pc.type];
        const ptBadge = document.getElementById('player-type');
        ptBadge.textContent = ptd.icon + ' ' + ptd.name;
        ptBadge.style.background = ptd.color + '33';
        ptBadge.style.color = ptd.color;

        const pHP = document.getElementById('player-hp');
        const pPct = (pc.hp / pc.maxHP) * 100;
        pHP.style.width = pPct + '%';
        pHP.className = 'battle-hp-fill' + (pPct < 30 ? ' low' : '');
        document.getElementById('player-hp-text').textContent = `${pc.hp} / ${pc.maxHP}`;

        // Opponent creature
        const ocBase = CreatureData.getCreature(oc.id);
        const ocDD = getCreatureDisplayData(ocBase, false);
        document.getElementById('opp-emoji').innerHTML = ocDD ? getCreatureDisplay(ocDD, 'creature-sprite-lg') : `<span style="font-size:4rem">${oc.emoji}</span>`;
        document.getElementById('opp-name').textContent = oc.name;
        const otd = CreatureData.TYPES[oc.type];
        const otBadge = document.getElementById('opp-type');
        otBadge.textContent = otd.icon + ' ' + otd.name;
        otBadge.style.background = otd.color + '33';
        otBadge.style.color = otd.color;

        const oHP = document.getElementById('opp-hp');
        const oPct = (oc.hp / oc.maxHP) * 100;
        oHP.style.width = oPct + '%';
        oHP.className = 'battle-hp-fill' + (oPct < 30 ? ' low' : '');
        document.getElementById('opp-hp-text').textContent = `${oc.hp} / ${oc.maxHP}`;

        // Battle log
        const log = state.log;
        document.getElementById('battle-log').textContent = log.length > 0 ? log[log.length - 1] : '';

        // Update ability button text
        if (pc.ability) {
            document.getElementById('btn-ability').textContent = '✨ ' + pc.ability.name;
        }

        // Update swap button visibility
        _updateSwapButton();
    }

    // === SWAP PANEL ===
    function _showSwapPanel() {
        const state = BattleEngine.getState();
        if (!state) return;
        const bench = state.player
            .map((c, i) => ({ ...c, idx: i }))
            .filter((c, i) => i !== state.playerActive && c.hp > 0);
        if (bench.length === 0) return;

        const benchEl = document.getElementById('swap-bench');
        benchEl.innerHTML = bench.map(c => {
            const base = CreatureData.getCreature(c.id);
            const evolved = c._evolved;
            const dd = getCreatureDisplayData(base, evolved);
            const visual = dd ? getCreatureDisplay(dd, 'creature-sprite-sm') : `<span style="font-size:1.5rem">${c.emoji}</span>`;
            const hpPct = (c.hp / c.maxHP) * 100;
            return `<div class="swap-card" data-idx="${c.idx}">
                <div class="creature-emoji">${visual}</div>
                <div class="swap-card-name">${dd ? dd.name : c.name}</div>
                <div class="swap-card-hp">${c.hp}/${c.maxHP}</div>
                <div class="swap-card-hp-bar"><div class="swap-card-hp-fill${hpPct < 30 ? ' low' : ''}" style="width:${hpPct}%"></div></div>
            </div>`;
        }).join('');

        benchEl.querySelectorAll('.swap-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.idx);
                AudioSystem.playSwap();
                _hideSwapPanel();
                // Execute swap turn (no question needed)
                const st = BattleEngine.playerTurn('swap', false, false, idx);
                _updateBattleUI();
                if (st.finished) {
                    AudioSystem.stopMusic();
                    setTimeout(() => _showResults(st), 600);
                } else {
                    document.getElementById('battle-actions').style.display = 'flex';
                }
            });
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('question-area').style.display = 'none';
        document.getElementById('swap-panel').style.display = 'block';
    }

    function _hideSwapPanel() {
        document.getElementById('swap-panel').style.display = 'none';
        document.getElementById('battle-actions').style.display = 'flex';
    }

    function _updateSwapButton() {
        const state = BattleEngine.getState();
        if (!state) return;
        const benchAlive = state.player.filter((c, i) => i !== state.playerActive && c.hp > 0);
        document.getElementById('btn-swap').style.display = benchAlive.length > 0 ? 'inline-block' : 'none';
    }

    // === STARDUST SHOP ===
    const SHOP_ITEMS = [
        { id: 'card_pack', icon: '🎴', name: 'Card Pack', desc: 'Open a bonus 3-card pack', cost: 50 },
        { id: 'xp_boost',  icon: '⭐', name: 'XP Boost',  desc: 'Double XP for 5 battles', cost: 30 },
        { id: 'coin_boost', icon: '🪙', name: 'Coin Boost', desc: 'Double coins for 5 battles', cost: 25 }
    ];

    function _buildShopScreen() {
        const balance = Collection.getStardust();
        document.getElementById('shop-balance').textContent = `✨ ${balance} Stardust`;

        const itemsEl = document.getElementById('shop-items');
        itemsEl.innerHTML = SHOP_ITEMS.map(item => {
            const canAfford = balance >= item.cost;
            let activeText = '';
            if (item.id === 'xp_boost' && Progress.getXPBoostLeft() > 0) {
                activeText = `Active: ${Progress.getXPBoostLeft()} battles left`;
            }
            if (item.id === 'coin_boost' && Progress.getCoinBoostLeft() > 0) {
                activeText = `Active: ${Progress.getCoinBoostLeft()} battles left`;
            }
            return `<div class="shop-item ${canAfford ? '' : 'disabled'}" data-item="${item.id}">
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-cost">✨ ${item.cost}</div>
                ${activeText ? `<div class="shop-item-active">${activeText}</div>` : ''}
            </div>`;
        }).join('');

        itemsEl.querySelectorAll('.shop-item').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.dataset.item;
                _purchaseShopItem(itemId);
            });
        });
    }

    function _purchaseShopItem(itemId) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        const success = Progress.spendStardust(item.cost);
        if (!success) return;

        AudioSystem.playPurchase();

        if (itemId === 'card_pack') {
            const cards = Collection.openPack('daily');
            _packReturnScreen = 'shop';
            _showPackOpening(cards, 'Bonus Pack!');
            return; // pack screen replaces shop screen
        }
        if (itemId === 'xp_boost') {
            Progress.addXPBoost(5);
        }
        if (itemId === 'coin_boost') {
            Progress.addCoinBoost(5);
        }

        // Refresh shop UI
        _buildShopScreen();
    }

    function _showResults(state) {
        const won = state.winner === 'player';

        document.getElementById('results-title').textContent = won ? 'Victory!' : 'Defeat...';
        document.getElementById('results-title').style.color = won ? 'var(--otb-coin)' : 'var(--otb-danger)';

        // XP calculation with boost multipliers
        const boosts = Progress.consumeBoosts();
        const baseXP = won ? 30 : 15;
        const xpEarned = baseXP * boosts.xpMult;
        const baseCoins = won ? Math.floor(5 * (1 + currentTier * 0.5)) : 2;
        const coinsEarned = baseCoins * boosts.coinMult;

        // Record in ecosystem
        if (typeof OTBEcosystem !== 'undefined') {
            OTBEcosystem.addXP(xpEarned, 'creature-cards');
            OTBEcosystem.addCoins(coinsEarned, 'creature-cards');
        }

        // Record time played for this battle
        const battleDuration = Math.round((Date.now() - _battleStartTime) / 1000);
        Progress.addPlayTime(battleDuration);

        Progress.recordBattleResult(currentZone.id, won, xpEarned, {
            turns: state.turn,
            questionsCorrect: _battleQuestionsCorrect,
            questionsTotal: _battleQuestionsTotal
        });

        // Card reward on victory
        const rewardEl = document.getElementById('results-reward');
        const evolveQueue = [];
        if (won) {
            const rewardCards = Collection.openPack('victory');
            const rewardCreature = CreatureData.getCreature(rewardCards[0]);
            if (rewardCreature) {
                rewardEl.style.display = 'block';
                rewardEl.innerHTML = getCreatureDisplay(rewardCreature, 'creature-sprite-lg');
                rewardEl.title = rewardCreature.name;
            }
            // Record wins for player's surviving creatures, check for evolution
            state.player.forEach(c => {
                if (c.hp > 0) {
                    Collection.recordWin(c.id);
                    if (Collection.canEvolve(c.id)) {
                        evolveQueue.push(c.id);
                    }
                }
            });
        } else {
            rewardEl.style.display = 'none';
        }

        const xpBoostLabel = boosts.xpMult > 1 ? ' (2x Boost!)' : '';
        const coinBoostLabel = boosts.coinMult > 1 ? ' (2x Boost!)' : '';
        document.getElementById('results-stats').innerHTML = `
            <div>${won ? 'Coins earned' : 'Consolation coins'}: <strong>${coinsEarned}</strong>${coinBoostLabel ? `<span style="color:var(--otb-coin);font-size:0.7rem;"> ${coinBoostLabel}</span>` : ''}</div>
            <div>Turns: <strong>${state.turn}</strong></div>
            ${won ? '<div style="color:var(--otb-success);">New card earned!</div>' : '<div style="color:var(--otb-text-muted);">Try using type advantages!</div>'}
        `;
        document.getElementById('results-xp').textContent = `+${xpEarned} XP${xpBoostLabel}`;

        // Check achievements after battle
        if (typeof Achievements !== 'undefined') {
            const newAch = Achievements.checkAfterBattle(won);
            if (newAch.length > 0) {
                newAch.forEach(ach => {
                    const toast = document.createElement('div');
                    toast.className = 'achievement-toast';
                    toast.textContent = `${ach.icon} ${ach.name}`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                });
            }
        }

        // If any creatures can evolve, show evolution sequence before results
        if (evolveQueue.length > 0) {
            _showEvolutionSequence(evolveQueue, () => showScreen('results'));
        } else {
            showScreen('results');
        }
    }

    // === EVOLUTION SEQUENCE ===
    function _showEvolutionSequence(creatureIds, onComplete) {
        let idx = 0;

        function showNext() {
            if (idx >= creatureIds.length) {
                onComplete();
                return;
            }
            const creatureId = creatureIds[idx];
            const base = CreatureData.getCreature(creatureId);
            if (!base || !base.evolvedName) { idx++; showNext(); return; }

            // Build evolution overlay
            const overlay = document.createElement('div');
            overlay.className = 'evolution-overlay';
            const baseDisplay = getCreatureDisplay(base, 'creature-sprite-lg');
            overlay.innerHTML = `
                <div class="evolution-label">EVOLUTION!</div>
                <div class="evolution-creature" id="evo-emoji">${baseDisplay}</div>
                <div class="evolution-text" id="evo-text">${base.name} is evolving...</div>
                <div class="evolution-stats" id="evo-stats"></div>
            `;
            document.body.appendChild(overlay);

            AudioSystem.playAbility();

            // Phase 1: pulse the base emoji (1.5s)
            setTimeout(() => {
                const emojiEl = document.getElementById('evo-emoji');
                const textEl = document.getElementById('evo-text');
                const statsEl = document.getElementById('evo-stats');

                // Phase 2: transform to evolved (flash white)
                emojiEl.style.filter = 'brightness(5)';
                emojiEl.style.transform = 'scale(1.8)';

                setTimeout(() => {
                    // Show evolved form
                    const evolvedDD = getCreatureDisplayData(base, true);
                    emojiEl.innerHTML = evolvedDD ? getCreatureDisplay(evolvedDD, 'creature-sprite-lg') : `<span style="font-size:5rem">${base.evolvedEmoji || base.emoji}</span>`;
                    emojiEl.style.filter = 'brightness(1)';
                    emojiEl.style.transform = 'scale(1.2)';
                    emojiEl.classList.add('evolution-complete');

                    textEl.textContent = `${base.name} evolved into ${base.evolvedName}!`;
                    AudioSystem.playVictory();

                    // Show stat changes
                    if (base.evolvedStats) {
                        const statNames = ['pwr', 'grd', 'spd', 'mag'];
                        const diffs = statNames.map(s => {
                            const diff = (base.evolvedStats[s] || 0) - (base.stats[s] || 0);
                            return diff > 0 ? `+${diff} ${s.toUpperCase()}` : '';
                        }).filter(Boolean);
                        statsEl.textContent = diffs.join('  ');
                    }

                    // Show evolved ability
                    if (base.evolvedAbility) {
                        const abilityEl = document.createElement('div');
                        abilityEl.className = 'evolution-ability';
                        abilityEl.textContent = `New Ability: ${base.evolvedAbility.name} - ${base.evolvedAbility.desc}`;
                        overlay.appendChild(abilityEl);
                    }

                    // Mark as evolved in save data
                    Collection.evolveCreature(creatureId);

                    // Check evolution achievements
                    if (typeof Achievements !== 'undefined') {
                        Achievements.checkAfterEvolve();
                    }

                    // Continue button
                    const btn = document.createElement('button');
                    btn.className = 'otb-btn otb-btn-accent';
                    btn.textContent = 'Awesome!';
                    btn.style.marginTop = '16px';
                    btn.addEventListener('click', () => {
                        AudioSystem.playClick();
                        overlay.remove();
                        idx++;
                        showNext();
                    });
                    overlay.appendChild(btn);
                }, 400);
            }, 1500);
        }

        showNext();
    }

    // === PACK OPENING ===
    function _showPackOpening(cardIds, title) {
        showScreen('pack');
        AudioSystem.playPackOpen();
        document.getElementById('pack-title').textContent = title || 'Card Pack!';
        const container = document.getElementById('pack-cards');

        container.innerHTML = cardIds.map((id, i) => {
            const c = CreatureData.getCreature(id);
            const rarityColor = CreatureData.RARITIES[c?.rarity]?.color || '#999';
            const creatureVisual = c ? getCreatureDisplay(c, 'creature-sprite') : '<span style="font-size:2.5rem">❓</span>';
            return `<div class="pack-card" data-idx="${i}" style="border-color:${rarityColor};">
                <div style="display:none;" class="pack-card-front">${creatureVisual}</div>
                <span class="pack-card-back">🎴</span>
            </div>`;
        }).join('');

        // Tap to reveal
        container.querySelectorAll('.pack-card').forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains('revealed')) return;
                card.classList.add('revealed');
                AudioSystem.playCardReveal();
                const front = card.querySelector('.pack-card-front');
                const back = card.querySelector('.pack-card-back');
                if (front) front.style.display = 'flex';
                if (back) back.style.display = 'none';
                card.style.transform = 'scale(1.1)';
                setTimeout(() => { card.style.transform = 'scale(1)'; }, 200);
            });
        });
    }

    function _buildAchievementsScreen() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        const all = Achievements.getAll();
        const earned = all.filter(a => a.earned).length;
        grid.innerHTML = `
            <div class="achievements-header">
                <span class="achievements-count">${earned} / ${all.length} Earned</span>
            </div>
            <div class="achievements-cards">
                ${all.map(a => `
                    <div class="achievement-card ${a.earned ? 'earned' : 'locked'}">
                        <div class="achievement-icon">${a.earned ? a.icon : '🔒'}</div>
                        <div class="achievement-name">${a.earned ? a.name : '???'}</div>
                        <div class="achievement-desc">${a.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    document.addEventListener('DOMContentLoaded', init);
})();


// Global error handler - catch runtime errors gracefully
window.onerror = function(msg, source, line, col, error) {
    console.error("Runtime error:", msg, "at", source, line + ":" + col);
    return false;
};
window.addEventListener("unhandledrejection", function(event) {
    console.error("Unhandled promise rejection:", event.reason);
});
