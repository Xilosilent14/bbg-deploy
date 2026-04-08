// ===== GARAGE & UNLOCKS V5 =====
const Garage = {
    cars: [
        { id: 'red', name: 'Classic Red', color: '#e94560', cost: 0 },
        { id: 'blue', name: 'Ocean Blue', color: '#3498db', cost: 5 },
        { id: 'yellow', name: 'Racing Yellow', color: '#f1c40f', cost: 5 },
        { id: 'black', name: 'Midnight Black', color: '#2c3e50', cost: 8 },
        { id: 'green', name: 'Racing Green', color: '#2ecc71', cost: 8 },
        { id: 'orange', name: 'Sunset Orange', color: '#e67e22', cost: 10 },
        { id: 'purple', name: 'Royal Purple', color: '#9b59b6', cost: 12 },
        { id: 'white', name: 'Pearl White', color: '#ecf0f1', cost: 15 },
        // V16: Premium colors
        { id: 'neonpink', name: 'Neon Pink', color: '#ff1493', cost: 20, premium: true },
        { id: 'chrome', name: 'Chrome Silver', color: '#c0c0c0', cost: 25, premium: true },
        { id: 'gold', name: 'Gold Rush', color: '#ffd700', cost: 30, premium: true },
        { id: 'galaxy', name: 'Galaxy Purple', color: '#4b0082', cost: 35, premium: true },
        { id: 'rainbow', name: 'Rainbow', color: 'rainbow', cost: 40, premium: true }
    ],

    // V5: 8 Corvette generations replace generic car types
    carTypes: Object.keys(CorvetteRenderer.generations).map(id => {
        const gen = CorvetteRenderer.generations[id];
        return { id, name: gen.name, icon: gen.icon, unlockLevel: gen.unlockLevel, desc: gen.desc };
    }),

    currentTab: 'colors',
    _tabsBound: false, // V17: One-time tab delegation flag

    render() {
        // V17: Bind tab clicks once via event delegation
        if (!this._tabsBound) {
            this._tabsBound = true;
            const tabContainer = document.querySelector('.garage-tabs');
            if (tabContainer) {
                tabContainer.addEventListener('click', (e) => {
                    const tab = e.target.closest('.garage-tab');
                    if (!tab) return;
                    Audio.playClick();
                    document.querySelectorAll('.garage-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentTab = tab.dataset.tab;
                    this._showTab(this.currentTab);
                });
            }
        }

        this._renderPreview();
        this._showTab(this.currentTab);
        document.getElementById('garage-stars').textContent = `⭐ ${Progress.data.stars}`;

        // V5: Auto-unlock car types based on level
        this._checkCarTypeUnlocks();
    },

    _showTab(tab) {
        document.getElementById('garage-options').style.display = tab === 'colors' ? '' : 'none';
        document.getElementById('garage-upgrades').style.display = tab === 'upgrades' ? '' : 'none';
        document.getElementById('garage-achievements').style.display = tab === 'achievements' ? '' : 'none';
        document.getElementById('garage-cars').style.display = tab === 'cars' ? '' : 'none';
        document.getElementById('garage-mods').style.display = tab === 'mods' ? '' : 'none';

        if (tab === 'colors') this._renderColors();
        else if (tab === 'upgrades') this._renderUpgrades();
        else if (tab === 'achievements') this._renderAchievements();
        else if (tab === 'cars') this._renderCarTypes();
        else if (tab === 'mods') this._renderMods();
    },

    _checkCarTypeUnlocks() {
        const level = Progress.data.playerLevel;
        this.carTypes.forEach(ct => {
            if (level >= ct.unlockLevel && !Progress.hasCarType(ct.id)) {
                Progress.unlockCarType(ct.id);
            }
        });
    },

    // V26: Mastery-based car unlock rewards
    // Returns array of { carId, carName, reason } for newly unlocked cars
    checkMasteryUnlocks() {
        const unlocked = [];

        // 1. Math Mastery → Beetle: 80%+ accuracy on 5+ math topics
        if (!Progress.hasCarType('beetle')) {
            let mathMastered = 0;
            Object.entries(Progress.data.mathAccuracy).forEach(([, data]) => {
                if (data.total >= 5 && (data.correct / data.total) >= 0.8) mathMastered++;
            });
            if (mathMastered >= 5) {
                Progress.unlockCarType('beetle');
                unlocked.push({ carId: 'beetle', carName: 'Beetle Classic', reason: 'Math mastery — 80%+ on 5 topics!' });
            }
        }

        // 2. Reading Mastery → DeLorean: 80%+ accuracy on 5+ reading topics
        if (!Progress.hasCarType('delorean')) {
            let readMastered = 0;
            Object.entries(Progress.data.readingAccuracy).forEach(([, data]) => {
                if (data.total >= 5 && (data.correct / data.total) >= 0.8) readMastered++;
            });
            if (readMastered >= 5) {
                Progress.unlockCarType('delorean');
                unlocked.push({ carId: 'delorean', carName: 'DeLorean', reason: 'Reading mastery — 80%+ on 5 topics!' });
            }
        }

        // 3. Boss Champion → Batmobile: Beat bosses in all 4 grade levels
        if (!Progress.hasCarType('batmobile')) {
            const bossWins = Progress.data.bossRacesWon || [];
            const grades = ['prek', 'k', '1st', '2nd'];
            // V36 fix: Check both legacy keys (math_prek) and V34 tiered keys (math_prek_t1)
            // Old endsWith(`_${g}`) failed for tiered keys like "math_prek_t1"
            const gradesBeaten = grades.filter(g =>
                bossWins.some(key => key.includes(`_${g}_t`) || key.endsWith(`_${g}`))
            );
            if (gradesBeaten.length >= 4) {
                Progress.unlockCarType('batmobile');
                unlocked.push({ carId: 'batmobile', carName: 'Batmobile', reason: 'Defeated bosses in all grades!' });
            }
        }

        // 4. Story Complete → Limo: Complete all story chapters (V40: 5 Michigan chapters)
        if (!Progress.hasCarType('limo')) {
            const sp = Progress.data.storyProgress;
            if (sp && sp.chaptersCompleted && sp.chaptersCompleted.length >= 5) {
                Progress.unlockCarType('limo');
                unlocked.push({ carId: 'limo', carName: 'Limo', reason: 'Completed the Road Trip story!' });
            }
        }

        return unlocked;
    },

    _renderPreview() {
        const preview = document.getElementById('garage-preview');
        const current = Progress.data.carColor;
        const car = this._getColorObj(current);
        const carType = Progress.data.carType || 'c1';
        const currentType = this.carTypes.find(ct => ct.id === carType) || this.carTypes[0];
        const stats = Progress.getCarStats();

        const gen = CorvetteRenderer.generations[carType];
        const canvasH = gen && gen.heightRatio > 1.2 ? 180 : 150;
        const carName = Progress.getCarDisplayName();
        preview.innerHTML = `
            <canvas id="garage-car-canvas" width="300" height="${canvasH}"></canvas>
            <div style="text-align:center; margin-top:8px;">
                <input id="car-name-input" type="text" maxlength="20"
                    placeholder="Name your car!"
                    value="${carName.replace(/"/g, '&quot;')}"
                    autocomplete="off"
                    style="text-align:center; font-size:1.1rem; font-weight:700; width:200px;
                           background:rgba(255,255,255,0.18); border:2px solid #888; border-radius:10px;
                           color:#fff; padding:8px 12px; outline:none;">
            </div>
            <div style="text-align:center; margin-top:4px; font-size:1.1rem; font-weight:600;">
                ${car.name} ${currentType.icon}
            </div>
            <div style="text-align:center; font-size:0.8rem; color:#aaa;">${currentType.name}</div>
            <div class="garage-stat-bars">
                <div class="mini-stat"><span>SPD</span><div class="mini-bar"><div class="mini-fill" style="width:${((stats.speed - 1) / 0.8) * 100}%; background:#e94560;"></div></div></div>
                <div class="mini-stat"><span>NOS</span><div class="mini-bar"><div class="mini-fill" style="width:${((stats.nitro - 1) / 1.0) * 100}%; background:#3498db;"></div></div></div>
                <div class="mini-stat"><span>HND</span><div class="mini-bar"><div class="mini-fill" style="width:${((stats.handling - 1) / 0.8) * 100}%; background:#2ecc71;"></div></div></div>
                <div class="mini-stat"><span>DUR</span><div class="mini-bar"><div class="mini-fill" style="width:${(((stats.durability || 1) - 1) / 0.8) * 100}%; background:#9b59b6;"></div></div></div>
            </div>
        `;

        const canvas = document.getElementById('garage-car-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // V6: Use CorvetteRenderer for garage preview with dynamic canvas height
        CorvetteRenderer.drawCar(ctx, carType, 150, canvas.height / 2 - 5, 200, 70, car.color, {
            lod: 'garage', isPlayer: true, wheelAngle: 0
        });

        // V31: Car name input handler
        const nameInput = document.getElementById('car-name-input');
        if (nameInput) {
            nameInput.addEventListener('change', () => {
                Progress.setCarName(nameInput.value);
            });
            nameInput.addEventListener('blur', () => {
                Progress.setCarName(nameInput.value);
            });
        }
    },

    // Helper to get color object for current color (universal or bonus)
    _getColorObj(colorId) {
        // Check universal colors first
        const universal = this.cars.find(c => c.id === colorId);
        if (universal) return universal;
        // Check bonus colors
        const bonus = CorvetteRenderer.bonusColors[colorId];
        if (bonus) return { id: colorId, name: bonus.name, color: bonus.hex, cost: 0 };
        return this.cars[0];
    },

    // V6: Render car types tab with 22 cars organized by category
    _renderCarTypes() {
        const container = document.getElementById('garage-cars');
        let html = '';

        // Render each category with header
        Object.entries(CorvetteRenderer.categories).forEach(([catId, cat]) => {
            html += `<div class="car-category-header">${cat.icon} ${cat.name}</div>`;
            html += '<div class="car-types-grid">';

            cat.cars.forEach(carId => {
                const ct = this.carTypes.find(c => c.id === carId);
                if (!ct) return;
                const unlocked = Progress.hasCarType(ct.id);
                const selected = Progress.data.carType === ct.id;

                let statusHtml = '';
                if (selected) {
                    statusHtml = '<div style="color:#2ecc71;font-size:0.8rem;font-weight:700;">EQUIPPED</div>';
                } else if (unlocked) {
                    statusHtml = '<div style="color:#aaa;font-size:0.75rem;">Tap to equip</div>';
                } else {
                    statusHtml = `<div style="color:#ffd700;font-size:0.75rem;">🔒 Level ${ct.unlockLevel}</div>`;
                }

                // Taller canvas for vehicles with higher heightRatio
                const gen = CorvetteRenderer.generations[carId];
                const canvasH = gen && gen.heightRatio > 1.2 ? 65 : 50;

                html += `
                    <div class="car-type-card ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}" data-type="${ct.id}">
                        <canvas class="car-type-preview" data-gen="${ct.id}" width="120" height="${canvasH}"></canvas>
                        <div class="car-type-name">${ct.name}</div>
                        <div class="car-type-desc">${ct.desc}</div>
                        ${statusHtml}
                    </div>
                `;
            });

            html += '</div>';
        });

        container.innerHTML = html;

        // Draw mini previews on each canvas
        const currentColor = this._getColorObj(Progress.data.carColor).color;
        container.querySelectorAll('.car-type-preview').forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const genId = canvas.dataset.gen;
            const unlocked = Progress.hasCarType(genId);
            const color = unlocked ? currentColor : '#555';
            const cw = canvas.width, ch = canvas.height;
            CorvetteRenderer.drawCar(ctx, genId, cw/2, ch/2, 100, 40, color, {
                lod: 'title', isPlayer: true, wheelAngle: 0
            });
        });

        // Bind clicks + keyboard — both unlocked and locked
        container.querySelectorAll('.car-type-card').forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            const selectCar = () => {
                const type = card.dataset.type;
                if (Progress.hasCarType(type)) {
                    Progress.selectCarType(type);
                    CorvetteRenderer.clearCaches();
                    Audio.playClick();
                    this.render();
                } else {
                    const ct = this.carTypes.find(c => c.id === type);
                    if (ct) {
                        Audio.playWrong();
                        card.classList.add('shake');
                        setTimeout(() => card.classList.remove('shake'), 400);
                        this._showToast(`Reach Level ${ct.unlockLevel} to unlock!`);
                    }
                }
            };
            card.addEventListener('click', selectCar);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCar(); }
            });
        });
    },

    _renderColors() {
        const grid = document.getElementById('garage-options');
        grid.innerHTML = '';

        // Universal colors
        this.cars.forEach(car => {
            const unlocked = Progress.data.carsUnlocked.includes(car.id);
            const selected = Progress.data.carColor === car.id;
            this._addColorItem(grid, car.id, car.name, car.color, car.cost, unlocked, selected);
        });

        // V5: Bonus era colors for current generation
        const currentGen = Progress.data.carType || 'c1';
        const bonusForGen = Object.entries(CorvetteRenderer.bonusColors)
            .filter(([, bc]) => bc.gen === currentGen);

        if (bonusForGen.length > 0) {
            bonusForGen.forEach(([colorId, bc]) => {
                const unlocked = (Progress.data.bonusColors || []).includes(colorId);
                const selected = Progress.data.carColor === colorId;
                if (unlocked) {
                    this._addColorItem(grid, colorId, bc.name, bc.hex, 0, true, selected, bc.gen.toUpperCase());
                }
            });
        }
    },

    _addColorItem(grid, id, name, color, cost, unlocked, selected, badge) {
        const item = document.createElement('div');
        item.className = `garage-item ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `${name}${selected ? ' (equipped)' : ''}${!unlocked ? ` (costs ${cost} stars)` : ''}`);

        // V16: Rainbow swatch gets animated gradient class
        const swatchStyle = color === 'rainbow'
            ? 'class="color-swatch rainbow-swatch"'
            : `class="color-swatch" style="background: ${color}"`;

        item.innerHTML = `
            <div ${swatchStyle}></div>
            <div class="item-label">${name}</div>
            ${badge ? `<div style="font-size:0.6rem;color:#ffd700;">${badge}</div>` : ''}
            ${!unlocked ? `<div class="item-cost">⭐ ${cost}</div>` : ''}
            ${selected ? '<div style="color:#2ecc71;font-size:0.8rem;">EQUIPPED</div>' : ''}
        `;

        const selectColor = () => {
            if (unlocked) {
                Progress.selectCar(id);
                CorvetteRenderer.clearCaches();
                Audio.playClick();
                this.render();
            } else if (cost > 0 && Progress.data.stars >= cost) {
                if (Progress.spendStars(cost)) {
                    Progress.unlockCar(id);
                    Progress.selectCar(id);
                    CorvetteRenderer.clearCaches();
                    Audio.playPurchase();
                    this.render();
                }
            } else if (cost > 0) {
                const need = cost - Progress.data.stars;
                Audio.playWrong();
                this._showToast(`Need ${need} more ⭐ to unlock!`);
            }
        };
        item.addEventListener('click', selectColor);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectColor(); }
        });

        grid.appendChild(item);
    },

    _renderUpgrades() {
        const container = document.getElementById('garage-upgrades');
        const upgrades = [
            { stat: 'speed', name: 'Speed', icon: '🏎️', color: '#e94560', desc: 'Faster base racing speed' },
            { stat: 'nitro', name: 'Nitro Power', icon: '🔥', color: '#3498db', desc: 'Stronger, longer nitro boost' },
            { stat: 'handling', name: 'Handling', icon: '🎯', color: '#2ecc71', desc: 'Faster lane switching, less obstacle penalty' },
            { stat: 'durability', name: 'Durability', icon: '🛡️', color: '#9b59b6', desc: 'Less penalty from obstacles' }
        ];

        let html = '';
        upgrades.forEach(u => {
            const level = Progress.getUpgradeLevel(u.stat);
            const cost = Progress.getUpgradeCost(u.stat);
            const maxed = cost === null;
            const canAfford = !maxed && Progress.data.stars >= cost;

            let levelDots = '';
            for (let i = 1; i <= 5; i++) {
                levelDots += `<div class="upgrade-dot ${i <= level ? 'filled' : ''}" style="${i <= level ? 'background:' + u.color : ''}"></div>`;
            }

            html += `
                <div class="upgrade-card">
                    <div class="upgrade-header">
                        <span class="upgrade-icon">${u.icon}</span>
                        <span class="upgrade-name">${u.name}</span>
                    </div>
                    <div class="upgrade-desc">${u.desc}</div>
                    <div class="upgrade-level">
                        <div class="upgrade-dots">${levelDots}</div>
                        <span class="upgrade-level-text">Lv ${level}/5</span>
                    </div>
                    ${maxed
                        ? '<button class="upgrade-btn maxed" disabled>MAX</button>'
                        : `<button class="upgrade-btn ${canAfford ? 'can-afford' : 'cant-afford'}" data-stat="${u.stat}" ${!canAfford ? 'disabled' : ''}>
                            ⭐ ${cost} — Upgrade
                           </button>`
                    }
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.upgrade-btn[data-stat]').forEach(btn => {
            btn.addEventListener('click', () => {
                const stat = btn.dataset.stat;
                if (Progress.upgradeStats(stat)) {
                    Audio.playCorrect();
                    const ach = Achievements.checkAfterUpgrade();
                    if (ach) {
                        Audio.speak(`Achievement unlocked: ${ach.name}!`);
                    }
                    this.render();
                }
            });
        });
    },

    _showToast(msg) {
        // Remove existing toast
        const old = document.querySelector('.garage-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'garage-toast';
        toast.textContent = msg;
        // Append to body to avoid transform-based containing block issues
        document.body.appendChild(toast);

        // Auto-remove after animation
        setTimeout(() => toast.remove(), 3000);
    },

    _renderAchievements() {
        const container = document.getElementById('garage-achievements');
        const all = Achievements.getAll();

        let html = '<div class="trophy-case">';
        all.forEach(a => {
            html += `
                <div class="trophy-item ${a.earned ? 'earned' : 'locked'}">
                    <div class="trophy-icon">${a.icon}</div>
                    <div class="trophy-name">${a.name}</div>
                    <div class="trophy-desc">${a.desc}</div>
                    ${a.earned ? '<div class="trophy-check">✓</div>' : ''}
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    // V16: Mods system — fun gameplay modifiers
    modDefs: [
        { id: 'big_car', name: 'Big Car Mode', icon: '🔍', cost: 25, category: 'size', desc: 'Car rendered at 150% size!' },
        { id: 'tiny_car', name: 'Tiny Car Mode', icon: '🔬', cost: 20, category: 'size', desc: 'Car rendered at 60% size!' },
        { id: 'fire_trail', name: 'Fire Trail', icon: '🔥', cost: 30, category: 'trail', desc: 'Fire particles behind your car' },
        { id: 'star_trail', name: 'Star Trail', icon: '⭐', cost: 25, category: 'trail', desc: 'Sparkle trail behind your car' },
        { id: 'rainbow_trail', name: 'Rainbow Trail', icon: '🌈', cost: 35, category: 'trail', desc: 'Rainbow streak behind your car' },
        { id: 'bouncy', name: 'Bouncy Mode', icon: '🏀', cost: 15, category: 'fun', desc: 'Car bounces while driving!' },
        { id: 'turbo_start', name: 'Turbo Start', icon: '🚀', cost: 20, category: 'fun', desc: 'Brief nitro burst at race start' },
        { id: 'lucky_star', name: 'Lucky Star', icon: '🍀', cost: 30, category: 'fun', desc: '15% chance of bonus star per correct answer' }
    ],

    _renderMods() {
        const container = document.getElementById('garage-mods');
        const categories = {
            size: { name: 'Size Mods', icon: '📐', exclusive: true },
            trail: { name: 'Trail Effects', icon: '✨', exclusive: true },
            fun: { name: 'Fun Mods', icon: '🎉', exclusive: false }
        };

        let html = '';

        Object.entries(categories).forEach(([catId, cat]) => {
            const catMods = this.modDefs.filter(m => m.category === catId);
            html += `<div class="mod-category-header">${cat.icon} ${cat.name}${cat.exclusive ? ' <span style="font-size:0.7rem;color:#aaa;">(pick one)</span>' : ''}</div>`;
            html += '<div class="mod-grid">';

            catMods.forEach(mod => {
                const owned = Progress.hasMod(mod.id);
                const active = Progress.isModActive(mod.id);
                const canAfford = Progress.data.stars >= mod.cost;

                let statusHtml = '';
                let btnHtml = '';

                if (active) {
                    statusHtml = '<div class="mod-status active">ACTIVE</div>';
                    btnHtml = `<button class="mod-btn mod-toggle" data-mod="${mod.id}" data-cat="${catId}">Disable</button>`;
                } else if (owned) {
                    statusHtml = '<div class="mod-status owned">Owned</div>';
                    btnHtml = `<button class="mod-btn mod-enable" data-mod="${mod.id}" data-cat="${catId}">Enable</button>`;
                } else {
                    btnHtml = `<button class="mod-btn mod-buy ${canAfford ? 'can-afford' : 'cant-afford'}" data-mod="${mod.id}" data-cost="${mod.cost}" ${!canAfford ? 'disabled' : ''}>⭐ ${mod.cost}</button>`;
                }

                html += `
                    <div class="mod-card ${active ? 'active' : ''} ${owned ? 'owned' : ''}" data-mod="${mod.id}">
                        <div class="mod-icon">${mod.icon}</div>
                        <div class="mod-name">${mod.name}</div>
                        <div class="mod-desc">${mod.desc}</div>
                        ${statusHtml}
                        ${btnHtml}
                    </div>
                `;
            });

            html += '</div>';
        });

        container.innerHTML = html;

        // Bind buy buttons
        container.querySelectorAll('.mod-buy').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.dataset.mod;
                const cost = parseInt(btn.dataset.cost);
                if (Progress.purchaseMod(modId, cost)) {
                    Audio.playPurchase();
                    this.render();
                    this._showTab('mods');
                } else {
                    Audio.playWrong();
                    const need = cost - Progress.data.stars;
                    this._showToast(`Need ${need} more ⭐ to buy!`);
                }
            });
        });

        // Bind enable buttons
        container.querySelectorAll('.mod-enable').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.dataset.mod;
                const catId = btn.dataset.cat;
                const catDef = { size: true, trail: true, fun: false }[catId];
                const allInCat = this.modDefs.filter(m => m.category === catId).map(m => m.id);
                Progress.toggleMod(modId, catId, catDef ? allInCat : []);
                Audio.playClick();
                this._renderMods();
            });
        });

        // Bind disable/toggle buttons
        container.querySelectorAll('.mod-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const modId = btn.dataset.mod;
                const catId = btn.dataset.cat;
                const allInCat = this.modDefs.filter(m => m.category === catId).map(m => m.id);
                Progress.toggleMod(modId, catId, allInCat);
                Audio.playClick();
                this._renderMods();
            });
        });
    }
};
