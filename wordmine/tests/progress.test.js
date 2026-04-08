const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, resetStorage } = require('./setup');

loadScript('js/progress.js');
const P = global.Progress;

describe('Progress', () => {
    beforeEach(() => {
        resetStorage();
        P.resetAll();
    });

    it('is defined globally', () => {
        assert.ok(P);
    });

    describe('Ranks', () => {
        it('has 17 ranks', () => {
            assert.equal(P.RANKS.length, 17);
        });

        it('first rank is Rookie, last is GOAT', () => {
            assert.equal(P.RANKS[0], 'Rookie');
            assert.equal(P.RANKS[16], 'GOAT');
        });
    });

    describe('Init and Save', () => {
        it('creates default progress on load', () => {
            P.load();
            const data = P.get();
            assert.equal(data.xp, 0);
            assert.equal(data.level, 1);
            assert.equal(data.gems, 0);
        });

        it('setName persists', () => {
            P.load();
            P.setName('Oliver');
            assert.equal(P.get().name, 'Oliver');
        });

        it('setGrade persists', () => {
            P.load();
            P.setGrade('1');
            assert.equal(P.get().grade, '1');
        });

        it('save and reload preserves data', () => {
            P.load();
            P.setName('Oliver');
            P.addXP(100);
            P.save();
            // Reload
            P.load();
            assert.equal(P.get().name, 'Oliver');
            assert.equal(P.get().xp, 100);
        });
    });

    describe('XP and Leveling', () => {
        it('addXP increases XP', () => {
            P.load();
            P.addXP(50);
            assert.equal(P.get().xp, 50);
        });

        it('level increases with enough XP', () => {
            P.load();
            P.addXP(200); // Should be level 4+
            assert.ok(P.get().level >= 4, `Level ${P.get().level} should be >= 4`);
        });

        it('getRank returns a string', () => {
            P.load();
            const rank = P.getRank();
            assert.equal(typeof rank, 'string');
            assert.ok(P.RANKS.includes(rank));
        });

        it('getXPForNext returns an object with current/needed/pct', () => {
            P.load();
            const info = P.getXPForNext();
            assert.equal(typeof info, 'object');
            assert.equal(typeof info.current, 'number');
            assert.equal(typeof info.needed, 'number');
            assert.equal(typeof info.pct, 'number');
        });
    });

    describe('Economy', () => {
        it('addGems increases gems', () => {
            P.load();
            P.addGems(10);
            assert.equal(P.get().gems, 10);
        });

        it('spendGems decreases gems when sufficient', () => {
            P.load();
            P.addGems(20);
            const ok = P.spendGems(15);
            assert.equal(ok, true);
            assert.equal(P.get().gems, 5);
        });

        it('spendGems rejects when insufficient', () => {
            P.load();
            P.addGems(5);
            const ok = P.spendGems(10);
            assert.equal(ok, false);
            assert.equal(P.get().gems, 5);
        });

        it('addInventoryItem tracks items', () => {
            P.load();
            P.addInventoryItem('diamond', 3);
            assert.equal(P.get().inventory.diamond, 3);
        });
    });

    describe('Word Tracking', () => {
        it('recordSightWord and getSightWordAccuracy work', () => {
            P.load();
            P.recordSightWord('the', true);
            P.recordSightWord('the', true);
            P.recordSightWord('the', false);
            const acc = P.getSightWordAccuracy('the');
            // Could be a number or object depending on implementation
            assert.ok(acc !== undefined && acc !== null, 'Should return accuracy data');
        });

        it('recordNonsenseWord tracks stats', () => {
            P.load();
            P.recordNonsenseWord(true);
            P.recordNonsenseWord(false);
            const stats = P.get().nonsenseStats;
            assert.equal(stats.correct, 1);
            assert.equal(stats.total, 2);
        });

        it('recordTopic tracks per-topic', () => {
            P.load();
            P.recordTopic('addition', true);
            P.recordTopic('addition', true);
            P.recordTopic('addition', false);
            const level = P.getTopicLevel('addition');
            assert.ok(typeof level === 'number');
        });
    });

    describe('Unlocks', () => {
        it('starts with default skin, tool, world', () => {
            P.load();
            const d = P.get();
            assert.ok(d.unlockedSkins.includes('steve'));
            assert.ok(d.unlockedTools.includes('wood'));
            assert.ok(d.unlockedWorlds.includes('plains'));
        });

        it('unlockSkin adds new skin', () => {
            P.load();
            P.unlockSkin('alex');
            assert.ok(P.get().unlockedSkins.includes('alex'));
        });

        it('unlockTool adds new tool', () => {
            P.load();
            P.unlockTool('stone');
            assert.ok(P.get().unlockedTools.includes('stone'));
        });

        it('unlockWorld adds new world', () => {
            P.load();
            P.unlockWorld('forest');
            assert.ok(P.get().unlockedWorlds.includes('forest'));
        });

        it('unlockPet adds pet', () => {
            P.load();
            P.unlockPet('wolf');
            assert.ok(P.get().unlockedPets.includes('wolf'));
        });
    });

    describe('Daily Streak', () => {
        it('checkDailyStreak returns an object with streak', () => {
            P.load();
            const result = P.checkDailyStreak();
            assert.equal(typeof result, 'object');
            assert.equal(typeof result.streak, 'number');
        });
    });

    describe('Break Detection', () => {
        it('needsBreak returns a boolean', () => {
            P.load();
            assert.equal(typeof P.needsBreak(), 'boolean');
        });
    });

    describe('Achievements', () => {
        it('unlockAchievement and hasAchievement work', () => {
            P.load();
            assert.equal(P.hasAchievement('first_word'), false);
            P.unlockAchievement('first_word');
            assert.equal(P.hasAchievement('first_word'), true);
        });
    });

    describe('WPM Tracking', () => {
        it('recordWPM stores reading speed', () => {
            P.load();
            P.recordWPM(15);
            const latest = P.getLatestWPM();
            assert.equal(latest, 15);
        });

        it('getRecentWPMs returns array', () => {
            P.load();
            P.recordWPM(10);
            P.recordWPM(12);
            P.recordWPM(15);
            const recent = P.getRecentWPMs(3);
            assert.ok(Array.isArray(recent));
            assert.ok(recent.length <= 3);
        });
    });

    describe('Reset', () => {
        it('resetAll clears all progress', () => {
            P.load();
            P.addXP(500);
            P.addGems(100);
            P.resetAll();
            P.load();
            assert.equal(P.get().xp, 0);
            assert.equal(P.get().gems, 0);
        });
    });
});
