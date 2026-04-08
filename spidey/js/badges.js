/**
 * Badges — Achievement system for Spidey Academy
 * 8 badges that unlock based on learning milestones.
 */
const Badges = (() => {
    const BADGE_DEFS = [
        {
            id: 'first-steps',
            name: 'First Steps',
            desc: 'Complete your first activity!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#4CAF50"/><path d="M20 34l8 8 16-16" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            check: () => {
                const d = Progress.data;
                return Object.values(d.activityStats).some(s => s.played > 0);
            }
        },
        {
            id: 'color-expert',
            name: 'Color Expert',
            desc: 'Learn all 6 colors!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#e23636"/><circle cx="22" cy="24" r="8" fill="#FFD600"/><circle cx="42" cy="24" r="8" fill="#2196F3"/><circle cx="32" cy="40" r="8" fill="#4CAF50"/></svg>`,
            check: () => Progress.getStats('color-catch').colorsLearned?.length >= 6
        },
        {
            id: 'shape-master',
            name: 'Shape Master',
            desc: 'Learn all 6 shapes!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2196F3"/><polygon points="32,14 44,38 20,38" fill="white"/><rect x="22" y="40" width="20" height="14" rx="2" fill="white" opacity="0.7"/></svg>`,
            check: () => Progress.getStats('shape-builder').shapesLearned?.length >= 6
        },
        {
            id: 'number-whiz',
            name: 'Number Whiz',
            desc: 'Count up to 10!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#FF9800"/><text x="32" y="42" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="sans-serif">10</text></svg>`,
            check: () => Progress.getStats('number-bugs').maxNumber >= 10
        },
        {
            id: 'letter-learner',
            name: 'Letter Learner',
            desc: 'Learn 10 letters!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#9C27B0"/><text x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="sans-serif">ABC</text></svg>`,
            check: () => Progress.getStats('letter-web').lettersLearned?.length >= 10
        },
        {
            id: 'sticker-star',
            name: 'Sticker Star',
            desc: 'Earn 10 stickers!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#FFD600"/><polygon points="32,12 37,26 52,26 40,34 44,48 32,40 20,48 24,34 12,26 27,26" fill="white"/></svg>`,
            check: () => Progress.getStickerCount() >= 10
        },
        {
            id: 'super-collector',
            name: 'Super Collector',
            desc: 'Earn 20 stickers!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#E056A0"/><polygon points="32,10 36,24 50,24 39,32 43,46 32,38 21,46 25,32 14,24 28,24" fill="white"/><circle cx="32" cy="32" r="8" fill="#E056A0"/><polygon points="32,26 34,30 38,30 35,33 36,37 32,35 28,37 29,33 26,30 30,30" fill="white"/></svg>`,
            check: () => Progress.getStickerCount() >= 20
        },
        {
            id: 'spidey-champion',
            name: 'Spidey Champion',
            desc: 'Earn all 30 stickers!',
            icon: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="url(#champGrad)"/><defs><linearGradient id="champGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e23636"/><stop offset="100%" stop-color="#FFD600"/></linearGradient></defs><path d="M32 12l4 12h12l-10 7 4 12-10-7-10 7 4-12-10-7h12z" fill="white"/><circle cx="32" cy="48" r="6" fill="white" opacity="0.6"/></svg>`,
            check: () => Progress.getStickerCount() >= 30
        }
    ];

    function checkAll() {
        const newBadges = [];
        for (const badge of BADGE_DEFS) {
            if (!Progress.hasBadge(badge.id) && badge.check()) {
                Progress.awardBadge(badge.id);
                newBadges.push(badge);
            }
        }
        return newBadges;
    }

    function getAll() {
        return BADGE_DEFS.map(b => ({
            ...b,
            earned: Progress.hasBadge(b.id)
        }));
    }

    function getEarnedCount() {
        return BADGE_DEFS.filter(b => Progress.hasBadge(b.id)).length;
    }

    return { checkAll, getAll, getEarnedCount, BADGE_DEFS };
})();
