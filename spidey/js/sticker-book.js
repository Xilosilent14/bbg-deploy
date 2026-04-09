/**
 * Sticker Book V2 — SVG sticker illustrations with tap-to-preview
 */
const StickerBook = (() => {
    const STICKERS = [
        // Page 1: Spider Power
        { id: 'spider-1', name: 'Tiny Spider', page: 0, svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#5a5a7a"/><circle cx="26" cy="28" r="5" fill="white"/><circle cx="38" cy="28" r="5" fill="white"/><circle cx="27" cy="29" r="2.5" fill="#222"/><circle cx="37" cy="29" r="2.5" fill="#222"/><line x1="12" y1="24" x2="22" y2="30" stroke="#6b6b8d" stroke-width="2"/><line x1="12" y1="38" x2="22" y2="34" stroke="#6b6b8d" stroke-width="2"/><line x1="52" y1="24" x2="42" y2="30" stroke="#6b6b8d" stroke-width="2"/><line x1="52" y1="38" x2="42" y2="34" stroke="#6b6b8d" stroke-width="2"/></svg>` },
        { id: 'spider-2', name: 'Web Spinner', page: 0, svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="white" stroke-width="1.5" opacity="0.6"/><circle cx="32" cy="32" r="16" fill="none" stroke="white" stroke-width="1" opacity="0.4"/><circle cx="32" cy="32" r="8" fill="none" stroke="white" stroke-width="1" opacity="0.3"/><line x1="32" y1="8" x2="32" y2="56" stroke="white" stroke-width="0.8" opacity="0.3"/><line x1="8" y1="32" x2="56" y2="32" stroke="white" stroke-width="0.8" opacity="0.3"/><circle cx="32" cy="32" r="4" fill="#e23636"/></svg>` },
        { id: 'spider-3', name: 'Super Hero', page: 0, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="35" rx="16" ry="18" fill="#e23636"/><rect x="24" y="44" width="16" height="10" rx="4" fill="#1565C0"/><ellipse cx="32" cy="24" rx="14" ry="12" fill="#e23636"/><ellipse cx="27" cy="23" rx="5" ry="6" fill="white" stroke="#222" stroke-width="1"/><ellipse cx="37" cy="23" rx="5" ry="6" fill="white" stroke="#222" stroke-width="1"/><circle cx="28" cy="23" r="2" fill="#222"/><circle cx="36" cy="23" r="2" fill="#222"/></svg>` },
        { id: 'spider-4', name: 'Spidey Mask', page: 0, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="22" ry="18" fill="#e23636"/><ellipse cx="24" cy="30" rx="8" ry="10" fill="white" stroke="#222" stroke-width="1.5"/><ellipse cx="40" cy="30" rx="8" ry="10" fill="white" stroke="#222" stroke-width="1.5"/><line x1="32" y1="14" x2="32" y2="50" stroke="#c62828" stroke-width="0.8" opacity="0.4"/><path d="M32 14 Q20 24 10 32" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.3"/><path d="M32 14 Q44 24 54 32" stroke="#c62828" stroke-width="0.6" fill="none" opacity="0.3"/></svg>` },
        { id: 'spider-5', name: 'Power Punch', page: 0, svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="#FFD600"/><polygon points="32,10 36,26 52,26 39,34 43,48 32,40 21,48 25,34 12,26 28,26" fill="#FF9800"/><text x="32" y="38" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="sans-serif">!</text></svg>` },
        { id: 'spider-6', name: 'Web Shot', page: 0, svg: `<svg viewBox="0 0 64 64"><path d="M16 32 L32 16 L48 32 L32 48Z" fill="none" stroke="#2196F3" stroke-width="2"/><path d="M8 32 L32 8 L56 32 L32 56Z" fill="none" stroke="#2196F3" stroke-width="1.5" opacity="0.5"/><circle cx="32" cy="32" r="6" fill="#2196F3"/><line x1="32" y1="26" x2="32" y2="12" stroke="#64B5F6" stroke-width="1.5"/><line x1="38" y1="32" x2="52" y2="32" stroke="#64B5F6" stroke-width="1.5"/><line x1="32" y1="38" x2="32" y2="52" stroke="#64B5F6" stroke-width="1.5"/><line x1="26" y1="32" x2="12" y2="32" stroke="#64B5F6" stroke-width="1.5"/></svg>` },
        // Page 2: Bug Friends
        { id: 'bug-1', name: 'Caterpillar', page: 1, svg: `<svg viewBox="0 0 64 64"><circle cx="20" cy="38" r="8" fill="#4CAF50"/><circle cx="30" cy="34" r="8" fill="#66BB6A"/><circle cx="40" cy="34" r="8" fill="#4CAF50"/><circle cx="50" cy="38" r="8" fill="#66BB6A"/><circle cx="14" cy="34" r="9" fill="#43A047"/><circle cx="11" cy="30" r="3" fill="white"/><circle cx="17" cy="30" r="3" fill="white"/><circle cx="11" cy="31" r="1.5" fill="#222"/><circle cx="17" cy="31" r="1.5" fill="#222"/><line x1="10" y1="24" x2="8" y2="16" stroke="#43A047" stroke-width="1.5"/><line x1="18" y1="24" x2="20" y2="16" stroke="#43A047" stroke-width="1.5"/><circle cx="8" cy="15" r="2" fill="#FFD600"/><circle cx="20" cy="15" r="2" fill="#FFD600"/></svg>` },
        { id: 'bug-2', name: 'Butterfly', page: 1, svg: `<svg viewBox="0 0 64 64"><ellipse cx="22" cy="26" rx="14" ry="12" fill="#E056A0" opacity="0.8"/><ellipse cx="42" cy="26" rx="14" ry="12" fill="#E056A0" opacity="0.8"/><ellipse cx="22" cy="40" rx="10" ry="8" fill="#AB47BC" opacity="0.7"/><ellipse cx="42" cy="40" rx="10" ry="8" fill="#AB47BC" opacity="0.7"/><rect x="30" y="18" width="4" height="30" rx="2" fill="#5D4037"/><circle cx="22" cy="26" r="4" fill="#FCE4EC"/><circle cx="42" cy="26" r="4" fill="#FCE4EC"/><line x1="30" y1="18" x2="24" y2="10" stroke="#5D4037" stroke-width="1.5"/><line x1="34" y1="18" x2="40" y2="10" stroke="#5D4037" stroke-width="1.5"/><circle cx="24" cy="9" r="2" fill="#FFD600"/><circle cx="40" cy="9" r="2" fill="#FFD600"/></svg>` },
        { id: 'bug-3', name: 'Ladybug', page: 1, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="18" ry="16" fill="#e23636"/><line x1="32" y1="20" x2="32" y2="52" stroke="#222" stroke-width="1.5"/><circle cx="24" cy="30" r="3" fill="#222"/><circle cx="40" cy="30" r="3" fill="#222"/><circle cx="28" cy="40" r="2.5" fill="#222"/><circle cx="36" cy="40" r="2.5" fill="#222"/><circle cx="32" cy="22" r="8" fill="#222"/><circle cx="29" cy="20" r="3" fill="white"/><circle cx="35" cy="20" r="3" fill="white"/><circle cx="29" cy="21" r="1.5" fill="#222"/><circle cx="35" cy="21" r="1.5" fill="#222"/></svg>` },
        { id: 'bug-4', name: 'Bumblebee', page: 1, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="16" ry="14" fill="#FFD600"/><rect x="22" y="30" width="20" height="4" fill="#222"/><rect x="22" y="38" width="20" height="4" fill="#222"/><circle cx="32" cy="24" r="9" fill="#FFD600"/><circle cx="28" cy="22" r="3.5" fill="white"/><circle cx="36" cy="22" r="3.5" fill="white"/><circle cx="29" cy="23" r="1.5" fill="#222"/><circle cx="35" cy="23" r="1.5" fill="#222"/><ellipse cx="22" cy="24" rx="8" ry="5" fill="white" opacity="0.5" transform="rotate(-20 22 24)"/><ellipse cx="42" cy="24" rx="8" ry="5" fill="white" opacity="0.5" transform="rotate(20 42 24)"/><path d="M28 28 Q32 32 36 28" stroke="#222" stroke-width="1" fill="none"/></svg>` },
        { id: 'bug-5', name: 'Dragonfly', page: 1, svg: `<svg viewBox="0 0 64 64"><rect x="29" y="24" width="6" height="28" rx="3" fill="#00BCD4"/><circle cx="32" cy="22" r="8" fill="#00ACC1"/><circle cx="28" cy="20" r="3" fill="white"/><circle cx="36" cy="20" r="3" fill="white"/><circle cx="29" cy="21" r="1.5" fill="#222"/><circle cx="35" cy="21" r="1.5" fill="#222"/><ellipse cx="20" cy="28" rx="12" ry="5" fill="#80DEEA" opacity="0.6" transform="rotate(-10 20 28)"/><ellipse cx="44" cy="28" rx="12" ry="5" fill="#80DEEA" opacity="0.6" transform="rotate(10 44 28)"/><ellipse cx="18" cy="34" rx="10" ry="4" fill="#80DEEA" opacity="0.4" transform="rotate(-5 18 34)"/><ellipse cx="46" cy="34" rx="10" ry="4" fill="#80DEEA" opacity="0.4" transform="rotate(5 46 34)"/></svg>` },
        { id: 'bug-6', name: 'Firefly', page: 1, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="12" ry="14" fill="#5D4037"/><circle cx="32" cy="46" r="8" fill="#FFD600" opacity="0.6"><animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="32" cy="24" r="8" fill="#6D4C41"/><circle cx="28" cy="22" r="3" fill="white"/><circle cx="36" cy="22" r="3" fill="white"/><circle cx="29" cy="23" r="1.5" fill="#222"/><circle cx="35" cy="23" r="1.5" fill="#222"/><ellipse cx="22" cy="28" rx="8" ry="4" fill="#BCAAA4" opacity="0.4"/><ellipse cx="42" cy="28" rx="8" ry="4" fill="#BCAAA4" opacity="0.4"/></svg>` },
        // Page 3: Star Collection
        { id: 'star-1', name: 'Gold Star', page: 2, svg: `<svg viewBox="0 0 64 64"><polygon points="32,8 38,24 56,24 42,34 47,50 32,40 17,50 22,34 8,24 26,24" fill="#FFD600" stroke="#FFA000" stroke-width="1.5"/></svg>` },
        { id: 'star-2', name: 'Sparkle Star', page: 2, svg: `<svg viewBox="0 0 64 64"><polygon points="32,8 38,24 56,24 42,34 47,50 32,40 17,50 22,34 8,24 26,24" fill="#FFD600"/><polygon points="32,16 35,26 44,26 37,32 39,42 32,37 25,42 27,32 20,26 29,26" fill="white" opacity="0.5"/><circle cx="26" cy="18" r="2" fill="white" opacity="0.6"/><circle cx="44" cy="16" r="1.5" fill="white" opacity="0.5"/><circle cx="20" cy="36" r="1.5" fill="white" opacity="0.4"/></svg>` },
        { id: 'star-3', name: 'Rainbow Star', page: 2, svg: `<svg viewBox="0 0 64 64"><polygon points="32,8 38,24 56,24 42,34 47,50 32,40 17,50 22,34 8,24 26,24" fill="url(#rainbowGrad)"/><defs><linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e23636"/><stop offset="33%" stop-color="#FFD600"/><stop offset="66%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#2196F3"/></linearGradient></defs></svg>` },
        { id: 'star-4', name: 'Moon', page: 2, svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#FFE4B5"/><circle cx="24" cy="28" r="4" fill="#FFCC80" opacity="0.5"/><circle cx="38" cy="36" r="3" fill="#FFCC80" opacity="0.4"/><circle cx="30" cy="40" r="2" fill="#FFCC80" opacity="0.3"/></svg>` },
        { id: 'star-5', name: 'Shooting Star', page: 2, svg: `<svg viewBox="0 0 64 64"><polygon points="48,16 50,22 56,22 51,26 53,32 48,28 43,32 45,26 40,22 46,22" fill="#FFD600"/><line x1="44" y1="20" x2="12" y2="48" stroke="#FFD600" stroke-width="2" opacity="0.5"/><line x1="42" y1="24" x2="16" y2="50" stroke="#FFA000" stroke-width="1" opacity="0.3"/></svg>` },
        { id: 'star-6', name: 'Rainbow', page: 2, svg: `<svg viewBox="0 0 64 64"><path d="M8 48 Q32 0 56 48" fill="none" stroke="#e23636" stroke-width="3"/><path d="M12 48 Q32 6 52 48" fill="none" stroke="#FF9800" stroke-width="2.5"/><path d="M16 48 Q32 12 48 48" fill="none" stroke="#FFD600" stroke-width="2.5"/><path d="M20 48 Q32 18 44 48" fill="none" stroke="#4CAF50" stroke-width="2.5"/><path d="M24 48 Q32 24 40 48" fill="none" stroke="#2196F3" stroke-width="2.5"/><path d="M28 48 Q32 30 36 48" fill="none" stroke="#9C27B0" stroke-width="2"/></svg>` },
        // Page 4: Nature
        { id: 'nature-1', name: 'Sunflower', page: 3, svg: `<svg viewBox="0 0 64 64"><g transform="translate(32,30)"><ellipse rx="6" ry="12" fill="#FFD600" transform="rotate(0)"/><ellipse rx="6" ry="12" fill="#FFD600" transform="rotate(45)"/><ellipse rx="6" ry="12" fill="#FFD600" transform="rotate(90)"/><ellipse rx="6" ry="12" fill="#FFD600" transform="rotate(135)"/></g><circle cx="32" cy="30" r="8" fill="#5D4037"/><rect x="30" y="42" width="4" height="16" rx="2" fill="#4CAF50"/></svg>` },
        { id: 'nature-2', name: 'Mushroom', page: 3, svg: `<svg viewBox="0 0 64 64"><rect x="26" y="36" width="12" height="18" rx="4" fill="#FFECB3"/><ellipse cx="32" cy="36" rx="22" ry="14" fill="#e23636"/><circle cx="24" cy="30" r="4" fill="white" opacity="0.7"/><circle cx="38" cy="28" r="3" fill="white" opacity="0.6"/><circle cx="32" cy="34" r="2.5" fill="white" opacity="0.5"/></svg>` },
        { id: 'nature-3', name: 'Cloud', page: 3, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="18" ry="12" fill="white" opacity="0.8"/><ellipse cx="22" cy="36" rx="12" ry="10" fill="white" opacity="0.7"/><ellipse cx="42" cy="36" rx="12" ry="10" fill="white" opacity="0.7"/><ellipse cx="28" cy="30" rx="10" ry="8" fill="white" opacity="0.9"/></svg>` },
        { id: 'nature-4', name: 'Raindrop', page: 3, svg: `<svg viewBox="0 0 64 64"><path d="M32 12 Q18 36 32 52 Q46 36 32 12Z" fill="#42A5F5"/><ellipse cx="28" cy="36" rx="4" ry="6" fill="white" opacity="0.3"/></svg>` },
        { id: 'nature-5', name: 'Sun', page: 3, svg: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="14" fill="#FFD600"/><g stroke="#FFD600" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/><line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/><line x1="13" y1="13" x2="19" y2="19"/><line x1="45" y1="45" x2="51" y2="51"/><line x1="51" y1="13" x2="45" y2="19"/><line x1="19" y1="45" x2="13" y2="51"/></g></svg>` },
        { id: 'nature-6', name: 'Tree', page: 3, svg: `<svg viewBox="0 0 64 64"><rect x="28" y="40" width="8" height="16" rx="2" fill="#795548"/><ellipse cx="32" cy="30" rx="18" ry="16" fill="#4CAF50"/><ellipse cx="26" cy="28" rx="6" ry="5" fill="#66BB6A" opacity="0.6"/><ellipse cx="38" cy="32" rx="5" ry="4" fill="#388E3C" opacity="0.4"/></svg>` },
        // Page 5: Fun Time
        { id: 'fun-1', name: 'Balloon', page: 4, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="26" rx="14" ry="18" fill="#e23636"/><ellipse cx="28" cy="20" rx="4" ry="6" fill="white" opacity="0.25"/><polygon points="28,44 32,44 30,48" fill="#e23636"/><path d="M30 48 Q28 52 32 54 Q36 56 34 58" stroke="#888" stroke-width="1" fill="none"/></svg>` },
        { id: 'fun-2', name: 'Party Hat', page: 4, svg: `<svg viewBox="0 0 64 64"><polygon points="32,8 14,50 50,50" fill="#9C27B0"/><circle cx="32" cy="8" r="4" fill="#FFD600"/><circle cx="24" cy="30" r="2.5" fill="#FFD600"/><circle cx="36" cy="22" r="2" fill="#4CAF50"/><circle cx="28" cy="40" r="2.5" fill="#e23636"/><circle cx="40" cy="36" r="2" fill="#2196F3"/><rect x="10" y="48" width="44" height="6" rx="3" fill="#E056A0"/></svg>` },
        { id: 'fun-3', name: 'Trophy', page: 4, svg: `<svg viewBox="0 0 64 64"><rect x="24" y="12" width="16" height="24" rx="4" fill="#FFD600"/><path d="M24 18 Q12 20 14 30 Q16 36 24 34" fill="#FFA000"/><path d="M40 18 Q52 20 50 30 Q48 36 40 34" fill="#FFA000"/><rect x="28" y="36" width="8" height="8" fill="#FFD600"/><rect x="22" y="44" width="20" height="6" rx="2" fill="#FFA000"/><polygon points="32,6 34,12 30,12" fill="#FFD600"/></svg>` },
        { id: 'fun-4', name: 'Rocket', page: 4, svg: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="28" rx="10" ry="20" fill="#e23636"/><circle cx="32" cy="20" r="5" fill="#42A5F5"/><circle cx="32" cy="20" r="3" fill="white" opacity="0.5"/><polygon points="22,36 18,48 26,40" fill="#1565C0"/><polygon points="42,36 46,48 38,40" fill="#1565C0"/><path d="M26 46 Q28 56 32 58 Q36 56 38 46" fill="#FF9800"/><path d="M28 46 Q30 52 32 54 Q34 52 36 46" fill="#FFD600"/></svg>` },
        { id: 'fun-5', name: 'Crown', page: 4, svg: `<svg viewBox="0 0 64 64"><polygon points="10,44 10,22 20,32 32,14 44,32 54,22 54,44" fill="#FFD600"/><rect x="10" y="42" width="44" height="8" rx="2" fill="#FFA000"/><circle cx="20" cy="32" r="3" fill="#e23636"/><circle cx="32" cy="20" r="3" fill="#2196F3"/><circle cx="44" cy="32" r="3" fill="#4CAF50"/></svg>` },
        { id: 'fun-6', name: 'Diamond', page: 4, svg: `<svg viewBox="0 0 64 64"><polygon points="32,8 52,24 32,56 12,24" fill="#42A5F5"/><polygon points="32,8 42,24 32,56" fill="#1E88E5"/><polygon points="32,8 22,24 32,24" fill="#90CAF9" opacity="0.5"/><line x1="12" y1="24" x2="52" y2="24" stroke="#1565C0" stroke-width="1"/></svg>` }
    ];

    const PAGE_NAMES = ['Spider Power', 'Bug Friends', 'Star Collection', 'Nature Magic', 'Fun Time'];
    let currentPage = 0;
    let previewOverlay = null;

    function getNextUnearned() {
        const earned = Progress.getStickers();
        return STICKERS.find(s => !earned.includes(s.id)) || null;
    }

    function render(container) {
        const earned = Progress.getStickers();
        const pageStickers = STICKERS.filter(s => s.page === currentPage);
        const pageEarned = earned.filter(id => pageStickers.some(s => s.id === id)).length;

        container.innerHTML = `
            <div class="sticker-book-inner">
                <div class="sticker-page-title">${PAGE_NAMES[currentPage]}</div>
                <div class="sticker-page-count">${pageEarned} / ${pageStickers.length}</div>
                <div class="sticker-grid">
                    ${pageStickers.map(s => {
                        const isEarned = earned.includes(s.id);
                        return `
                            <div class="sticker-slot ${isEarned ? 'earned' : 'locked'}" data-sticker-id="${s.id}">
                                <div class="sticker-svg-wrap">${isEarned ? s.svg : _lockedSVG()}</div>
                                ${isEarned ? `<div class="sticker-name">${s.name}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="sticker-nav">
                    <button class="sticker-nav-btn" id="sticker-prev" ${currentPage === 0 ? 'disabled' : ''}>◀</button>
                    <span class="sticker-page-dots">
                        ${PAGE_NAMES.map((_, i) => `<span class="dot ${i === currentPage ? 'active' : ''}"></span>`).join('')}
                    </span>
                    <button class="sticker-nav-btn" id="sticker-next" ${currentPage === PAGE_NAMES.length - 1 ? 'disabled' : ''}>▶</button>
                </div>
            </div>
        `;

        // Navigation
        container.querySelector('#sticker-prev')?.addEventListener('click', () => {
            if (currentPage > 0) { currentPage--; Audio.playTap(); render(container); }
        });
        container.querySelector('#sticker-next')?.addEventListener('click', () => {
            if (currentPage < PAGE_NAMES.length - 1) { currentPage++; Audio.playTap(); render(container); }
        });

        // Tap to preview earned stickers
        container.querySelectorAll('.sticker-slot.earned').forEach(slot => {
            slot.addEventListener('click', () => {
                const id = slot.dataset.stickerId;
                const sticker = STICKERS.find(s => s.id === id);
                if (sticker) _showPreview(sticker);
            });
        });
    }

    function _lockedSVG() {
        return `<svg viewBox="0 0 64 64"><circle cx="32" cy="28" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/><rect x="22" y="28" width="20" height="16" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/><circle cx="32" cy="36" r="3" fill="rgba(255,255,255,0.15)"/><rect x="31" y="36" width="2" height="5" rx="1" fill="rgba(255,255,255,0.12)"/></svg>`;
    }

    function _showPreview(sticker) {
        Audio.playTap();
        if (previewOverlay) previewOverlay.remove();
        previewOverlay = document.createElement('div');
        previewOverlay.className = 'sticker-preview-overlay';
        previewOverlay.innerHTML = `
            <div class="sticker-preview-card">
                <div class="sticker-preview-svg">${sticker.svg}</div>
                <div class="sticker-preview-name">${sticker.name}</div>
            </div>
        `;
        previewOverlay.addEventListener('click', () => {
            previewOverlay.remove();
            previewOverlay = null;
        });
        document.body.appendChild(previewOverlay);
    }

    function getTotalEarned() { return Progress.getStickers().length; }
    function getTotalAvailable() { return STICKERS.length; }

    return { render, getNextUnearned, getTotalEarned, getTotalAvailable, STICKERS };
})();
