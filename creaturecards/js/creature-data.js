/* ============================================
   CREATURE CARDS — Creature Data
   30 starter creatures across 5 elemental types
   ============================================ */
const CreatureData = (() => {
    // Type definitions
    const TYPES = {
        ember:  { name: 'Ember',  color: '#e8592a', icon: '🔥', domain: 'math',    topics: ['addition', 'subtraction', 'counting', 'numbers'] },
        tidal:  { name: 'Tidal',  color: '#2196F3', icon: '💧', domain: 'reading', topics: ['vocabulary', 'comprehension', 'sight-words'] },
        terra:  { name: 'Terra',  color: '#4CAF50', icon: '🌿', domain: 'reading', topics: ['phonics', 'letters', 'rhyming', 'sight-words'] },
        spark:  { name: 'Spark',  color: '#FFD600', icon: '⚡', domain: 'math',    topics: ['patterns', 'comparing', 'shapes', 'place-value'] },
        shadow: { name: 'Shadow', color: '#7E57C2', icon: '🌙', domain: 'mixed',   topics: ['addition', 'sight-words', 'counting', 'phonics'] }
    };

    // Type advantage chart: key beats value (1.5x damage)
    const ADVANTAGES = {
        ember: 'terra',   // fire burns plants
        terra: 'spark',   // ground absorbs electricity
        spark: 'tidal',   // electricity shocks water
        tidal: 'ember'    // water douses fire
        // shadow: neutral to all
    };

    function getTypeAdvantage(attackerType, defenderType) {
        if (ADVANTAGES[attackerType] === defenderType) return 1.5;
        // Check if defender has advantage over attacker (disadvantage)
        if (ADVANTAGES[defenderType] === attackerType) return 0.75;
        return 1.0;
    }

    // Rarity config
    const RARITIES = {
        common:    { name: 'Common',    color: '#9E9E9E', hpBonus: 0,  statBudget: [14, 18] },
        uncommon:  { name: 'Uncommon',  color: '#4CAF50', hpBonus: 2,  statBudget: [18, 22] },
        rare:      { name: 'Rare',      color: '#2196F3', hpBonus: 4,  statBudget: [22, 26] },
        epic:      { name: 'Epic',      color: '#9C27B0', hpBonus: 6,  statBudget: [26, 30] },
        legendary: { name: 'Legendary', color: '#FFD700', hpBonus: 10, statBudget: [30, 36] }
    };

    function getHP(creature) {
        return 10 + (creature.stats.grd * 2) + (RARITIES[creature.rarity]?.hpBonus || 0);
    }

    // Evolution thresholds by rarity (wins needed)
    const EVOLUTION_THRESHOLDS = {
        common: 5, uncommon: 8, rare: 12, epic: 15, legendary: null // legendary can't evolve
    };

    // Stat bonus by rarity on evolution
    const EVOLUTION_STAT_BONUS = {
        common: 3, uncommon: 4, rare: 5, epic: 6
    };

    // All 30 creatures
    const CREATURES = [
        // === EMBER TYPE (6) ===
        { id: 'blazepup',     name: 'Blazepup',     type: 'ember', rarity: 'common',   stats: { pwr: 4, grd: 2, spd: 5, mag: 3 }, evolvedName: 'Blazehound',    emoji: '🐕‍🦺', evolvedEmoji: '🔥🐕', spriteSheet: 'ember-type.png', spritePos: 0, evolvesAt: 5,
          ability: { name: 'Fireball', desc: '5 dmg, ignores guard', dmg: 5, ignoreGuard: true },
          evolvedStats: { pwr: 7, grd: 5, spd: 8, mag: 6 },
          evolvedAbility: { name: 'Inferno Blast', desc: '8 dmg, ignores guard', dmg: 8, ignoreGuard: true } },
        { id: 'turbo-rex',    name: 'Turbo Rex',    type: 'ember', rarity: 'common',   stats: { pwr: 5, grd: 3, spd: 4, mag: 2 }, evolvedName: 'Nitro Rex',     emoji: '🦖', evolvedEmoji: '🔥🦖', spriteSheet: 'ember-type.png', spritePos: 1, evolvesAt: 5,
          ability: { name: 'Nitro Boost', desc: '+3 SPD for 2 turns', buff: 'spd', amount: 3, turns: 2 },
          evolvedStats: { pwr: 8, grd: 6, spd: 7, mag: 5 },
          evolvedAbility: { name: 'Turbo Overdrive', desc: '+5 SPD for 2 turns', buff: 'spd', amount: 5, turns: 2 } },
        { id: 'lava-slug',    name: 'Lava Slug',    type: 'ember', rarity: 'common',   stats: { pwr: 3, grd: 5, spd: 2, mag: 4 }, evolvedName: 'Magma Shell',   emoji: '🐌', evolvedEmoji: '🌋🐌', spriteSheet: 'ember-type.png', spritePos: 2, evolvesAt: 5,
          ability: { name: 'Molten Armor', desc: '+4 GRD for 2 turns', buff: 'grd', amount: 4, turns: 2 },
          evolvedStats: { pwr: 6, grd: 8, spd: 5, mag: 7 },
          evolvedAbility: { name: 'Volcanic Shell', desc: '+6 GRD for 2 turns', buff: 'grd', amount: 6, turns: 2 } },
        { id: 'rev-monkey',   name: 'Rev Monkey',   type: 'ember', rarity: 'uncommon', stats: { pwr: 5, grd: 3, spd: 6, mag: 4 }, evolvedName: 'Drift Chimp',   emoji: '🐒', evolvedEmoji: '🔥🐒', spriteSheet: 'ember-type.png', spritePos: 3, evolvesAt: 8,
          ability: { name: 'Burnout', desc: 'Damage = SPD value', dmgFromStat: 'spd' },
          evolvedStats: { pwr: 9, grd: 7, spd: 10, mag: 8 },
          evolvedAbility: { name: 'Nitro Burnout', desc: 'Damage = SPD x1.5', dmgFromStat: 'spd', dmgStatMultiplier: 1.5 } },
        { id: 'forge-beetle', name: 'Forge Beetle', type: 'ember', rarity: 'rare',     stats: { pwr: 6, grd: 5, spd: 4, mag: 7 }, evolvedName: 'Foundry Stag',  emoji: '🪲', evolvedEmoji: '🔥🪲', spriteSheet: 'ember-type.png', spritePos: 4, evolvesAt: 12,
          ability: { name: 'Smelt', desc: 'Deal 5 dmg + heal 3 HP', dmg: 5, heal: 3 },
          evolvedStats: { pwr: 11, grd: 10, spd: 9, mag: 12 },
          evolvedAbility: { name: 'Forge Strike', desc: 'Deal 8 dmg + heal 5 HP', dmg: 8, heal: 5 } },
        { id: 'dragster',     name: 'Dragster',     type: 'ember', rarity: 'epic',     stats: { pwr: 8, grd: 4, spd: 8, mag: 6 }, evolvedName: 'Hyper Dragster', emoji: '🐉', evolvedEmoji: '🔥🐉', spriteSheet: 'ember-type.png', spritePos: 5, evolvesAt: 15,
          ability: { name: 'Quarter Mile', desc: '12 dmg, then rest 1 turn', dmg: 12, selfStun: 1 },
          evolvedStats: { pwr: 14, grd: 10, spd: 14, mag: 12 },
          evolvedAbility: { name: 'Top Fuel', desc: '18 dmg, then rest 1 turn', dmg: 18, selfStun: 1 } },

        // === TIDAL TYPE (6) ===
        { id: 'splashkit',    name: 'Splashkit',    type: 'tidal', rarity: 'common',   stats: { pwr: 3, grd: 3, spd: 4, mag: 4 }, evolvedName: 'Tidalynx',      emoji: '🐱', evolvedEmoji: '💧🐱', spriteSheet: 'tidal-type.png', spritePos: 0, evolvesAt: 5,
          ability: { name: 'Wave Wall', desc: 'Block next attack fully', shield: true },
          evolvedStats: { pwr: 6, grd: 6, spd: 7, mag: 7 },
          evolvedAbility: { name: 'Tsunami Wall', desc: 'Block next attack + reflect 2 dmg', shield: true, reflect: 2 } },
        { id: 'icehopper',    name: 'Icehopper',    type: 'tidal', rarity: 'common',   stats: { pwr: 4, grd: 4, spd: 3, mag: 3 }, evolvedName: 'Frostleaper',   emoji: '🐸', evolvedEmoji: '❄️🐸', spriteSheet: 'tidal-type.png', spritePos: 1, evolvesAt: 5,
          ability: { name: 'Brain Freeze', desc: 'Enemy -2 SPD for 2 turns', debuff: 'spd', amount: -2, turns: 2 },
          evolvedStats: { pwr: 7, grd: 7, spd: 6, mag: 6 },
          evolvedAbility: { name: 'Deep Freeze', desc: 'Enemy -4 SPD for 2 turns', debuff: 'spd', amount: -4, turns: 2 } },
        { id: 'puddle-pup',   name: 'Puddle Pup',   type: 'tidal', rarity: 'common',   stats: { pwr: 3, grd: 2, spd: 5, mag: 4 }, evolvedName: 'Storm Hound',   emoji: '🐶', evolvedEmoji: '🌊🐶', spriteSheet: 'tidal-type.png', spritePos: 2, evolvesAt: 5,
          ability: { name: 'Rain Dance', desc: '+2 MAG for self', buff: 'mag', amount: 2, turns: 2 },
          evolvedStats: { pwr: 6, grd: 5, spd: 8, mag: 7 },
          evolvedAbility: { name: 'Monsoon Dance', desc: '+4 MAG for self', buff: 'mag', amount: 4, turns: 2 } },
        { id: 'coral-knight', name: 'Coral Knight', type: 'tidal', rarity: 'uncommon', stats: { pwr: 5, grd: 6, spd: 3, mag: 4 }, evolvedName: 'Reef Champion', emoji: '🦀', evolvedEmoji: '🌊🦀', spriteSheet: 'tidal-type.png', spritePos: 3, evolvesAt: 8,
          ability: { name: 'Shell Shield', desc: '+5 GRD for 1 turn', buff: 'grd', amount: 5, turns: 1 },
          evolvedStats: { pwr: 9, grd: 10, spd: 7, mag: 8 },
          evolvedAbility: { name: 'Coral Fortress', desc: '+7 GRD for 2 turns', buff: 'grd', amount: 7, turns: 2 } },
        { id: 'glacier-bear', name: 'Glacier Bear', type: 'tidal', rarity: 'rare',     stats: { pwr: 7, grd: 6, spd: 3, mag: 6 }, evolvedName: 'Avalanche Bear', emoji: '🐻‍❄️', evolvedEmoji: '🏔️🐻', spriteSheet: 'tidal-type.png', spritePos: 4, evolvesAt: 12,
          ability: { name: 'Blizzard', desc: '4 dmg to all enemies', dmg: 4, aoe: true },
          evolvedStats: { pwr: 12, grd: 11, spd: 8, mag: 11 },
          evolvedAbility: { name: 'Avalanche', desc: '7 dmg to all enemies', dmg: 7, aoe: true } },
        { id: 'leviathan-jr', name: 'Leviathan Jr', type: 'tidal', rarity: 'epic',     stats: { pwr: 7, grd: 5, spd: 6, mag: 8 }, evolvedName: 'Sea Sovereign',  emoji: '🐋', evolvedEmoji: '🌊🐋', spriteSheet: 'tidal-type.png', spritePos: 5, evolvesAt: 15,
          ability: { name: 'Tidal Surge', desc: '8 dmg + heal 4 HP', dmg: 8, heal: 4 },
          evolvedStats: { pwr: 13, grd: 11, spd: 12, mag: 14 },
          evolvedAbility: { name: 'Maelstrom', desc: '12 dmg + heal 6 HP', dmg: 12, heal: 6 } },

        // === TERRA TYPE (6) ===
        { id: 'seedling',     name: 'Seedling',     type: 'terra', rarity: 'common',   stats: { pwr: 3, grd: 4, spd: 3, mag: 4 }, evolvedName: 'Thornbloom',    emoji: '🌱', evolvedEmoji: '🌳🌱', spriteSheet: 'terra-type.png', spritePos: 0, evolvesAt: 5,
          ability: { name: 'Vine Whip', desc: '4 dmg, ignores guard', dmg: 4, ignoreGuard: true },
          evolvedStats: { pwr: 6, grd: 7, spd: 6, mag: 7 },
          evolvedAbility: { name: 'Thorn Storm', desc: '7 dmg, ignores guard', dmg: 7, ignoreGuard: true } },
        { id: 'dirt-bunny',   name: 'Dirt Bunny',   type: 'terra', rarity: 'common',   stats: { pwr: 4, grd: 3, spd: 5, mag: 2 }, evolvedName: 'Boulder Hare',  emoji: '🐰', evolvedEmoji: '🪨🐰', spriteSheet: 'terra-type.png', spritePos: 1, evolvesAt: 5,
          ability: { name: 'Burrow', desc: 'Dodge next attack', dodge: true },
          evolvedStats: { pwr: 7, grd: 6, spd: 8, mag: 5 },
          evolvedAbility: { name: 'Earthen Dive', desc: 'Dodge next attack + heal 3 HP', dodge: true, heal: 3 } },
        { id: 'moss-turtle',  name: 'Moss Turtle',  type: 'terra', rarity: 'common',   stats: { pwr: 2, grd: 6, spd: 2, mag: 4 }, evolvedName: 'Ironshell',     emoji: '🐢', evolvedEmoji: '🛡️🐢', spriteSheet: 'terra-type.png', spritePos: 2, evolvesAt: 5,
          ability: { name: 'Regenerate', desc: 'Heal 5 HP', heal: 5 },
          evolvedStats: { pwr: 5, grd: 9, spd: 5, mag: 7 },
          evolvedAbility: { name: 'Iron Regen', desc: 'Heal 8 HP', heal: 8 } },
        { id: 'slugger-vine', name: 'Slugger Vine', type: 'terra', rarity: 'uncommon', stats: { pwr: 6, grd: 4, spd: 4, mag: 4 }, evolvedName: 'Grand Slam Oak', emoji: '⚾', evolvedEmoji: '🌳⚾', spriteSheet: 'terra-type.png', spritePos: 3, evolvesAt: 8,
          ability: { name: 'Home Run', desc: 'PWR x1.5 dmg, then -2 PWR', dmgMultiplier: 1.5, selfDebuff: 'pwr', selfDebuffAmt: -2 },
          evolvedStats: { pwr: 10, grd: 8, spd: 8, mag: 8 },
          evolvedAbility: { name: 'Grand Slam', desc: 'PWR x2.0 dmg, then -2 PWR', dmgMultiplier: 2.0, selfDebuff: 'pwr', selfDebuffAmt: -2 } },
        { id: 'antler-elk',   name: 'Antler Elk',   type: 'terra', rarity: 'rare',     stats: { pwr: 6, grd: 6, spd: 5, mag: 5 }, evolvedName: 'Crown Stag',    emoji: '🦌', evolvedEmoji: '👑🦌', spriteSheet: 'terra-type.png', spritePos: 4, evolvesAt: 12,
          ability: { name: 'Forest Rally', desc: '+2 PWR for self', buff: 'pwr', amount: 2, turns: 2 },
          evolvedStats: { pwr: 11, grd: 11, spd: 10, mag: 10 },
          evolvedAbility: { name: 'Kings Rally', desc: '+4 PWR for self', buff: 'pwr', amount: 4, turns: 2 } },
        { id: 'diamond-golem',name: 'Diamond Golem',type: 'terra', rarity: 'epic',     stats: { pwr: 8, grd: 8, spd: 3, mag: 7 }, evolvedName: 'Crystal Titan',  emoji: '💎', evolvedEmoji: '💠💎', spriteSheet: 'terra-type.png', spritePos: 5, evolvesAt: 15,
          ability: { name: 'Earthshake', desc: '6 dmg + enemy -3 SPD', dmg: 6, debuff: 'spd', debuffAmt: -3 },
          evolvedStats: { pwr: 14, grd: 14, spd: 9, mag: 13 },
          evolvedAbility: { name: 'Continental Crush', desc: '10 dmg + enemy -5 SPD', dmg: 10, debuff: 'spd', debuffAmt: -5 } },

        // === SPARK TYPE (6) ===
        { id: 'zapbit',       name: 'Zapbit',       type: 'spark', rarity: 'common',   stats: { pwr: 4, grd: 2, spd: 5, mag: 3 }, evolvedName: 'Voltbyte',      emoji: '🐇', evolvedEmoji: '⚡🐇', spriteSheet: 'spark-type.png', spritePos: 0, evolvesAt: 5,
          ability: { name: 'Static Shock', desc: '3 dmg + enemy -3 SPD', dmg: 3, debuff: 'spd', debuffAmt: -3 },
          evolvedStats: { pwr: 7, grd: 5, spd: 8, mag: 6 },
          evolvedAbility: { name: 'Thunder Shock', desc: '6 dmg + enemy -4 SPD', dmg: 6, debuff: 'spd', debuffAmt: -4 } },
        { id: 'gearcat',      name: 'Gearcat',      type: 'spark', rarity: 'common',   stats: { pwr: 3, grd: 4, spd: 4, mag: 3 }, evolvedName: 'Mech Panther',  emoji: '🐱', evolvedEmoji: '⚡🐱', spriteSheet: 'spark-type.png', spritePos: 1, evolvesAt: 5,
          ability: { name: 'Overclock', desc: '+3 SPD for 2 turns', buff: 'spd', amount: 3, turns: 2 },
          evolvedStats: { pwr: 6, grd: 7, spd: 7, mag: 6 },
          evolvedAbility: { name: 'Hyper Overclock', desc: '+5 SPD for 2 turns', buff: 'spd', amount: 5, turns: 2 } },
        { id: 'bulb-bug',     name: 'Bulb Bug',     type: 'spark', rarity: 'common',   stats: { pwr: 3, grd: 3, spd: 3, mag: 5 }, evolvedName: 'Beacon Moth',   emoji: '🪲', evolvedEmoji: '💡🪲', spriteSheet: 'spark-type.png', spritePos: 2, evolvesAt: 5,
          ability: { name: 'Bright Flash', desc: 'Enemy misses next attack', blind: true },
          evolvedStats: { pwr: 6, grd: 6, spd: 6, mag: 8 },
          evolvedAbility: { name: 'Supernova Flash', desc: 'Enemy misses next attack + 3 dmg', blind: true, dmg: 3 } },
        { id: 'circuit-pup',  name: 'Circuit Pup',  type: 'spark', rarity: 'uncommon', stats: { pwr: 5, grd: 3, spd: 6, mag: 4 }, evolvedName: 'Techno Wolf',   emoji: '🤖', evolvedEmoji: '⚡🤖', spriteSheet: 'spark-type.png', spritePos: 3, evolvesAt: 8,
          ability: { name: 'Power Surge', desc: '6 dmg, take 2 self-dmg', dmg: 6, selfDmg: 2 },
          evolvedStats: { pwr: 9, grd: 7, spd: 10, mag: 8 },
          evolvedAbility: { name: 'Plasma Surge', desc: '10 dmg, take 2 self-dmg', dmg: 10, selfDmg: 2 } },
        { id: 'ratchet-hawk', name: 'Ratchet Hawk', type: 'spark', rarity: 'rare',     stats: { pwr: 6, grd: 4, spd: 7, mag: 5 }, evolvedName: 'Thunderbird',   emoji: '🦅', evolvedEmoji: '⚡🦅', spriteSheet: 'spark-type.png', spritePos: 4, evolvesAt: 12,
          ability: { name: 'Divebomb', desc: 'Dmg = SPD, ignores GRD', dmgFromStat: 'spd', ignoreGuard: true },
          evolvedStats: { pwr: 11, grd: 9, spd: 12, mag: 10 },
          evolvedAbility: { name: 'Thunder Divebomb', desc: 'Dmg = SPD x1.5, ignores GRD', dmgFromStat: 'spd', dmgStatMultiplier: 1.5, ignoreGuard: true } },
        { id: 'volt-engine',  name: 'Volt Engine',  type: 'spark', rarity: 'epic',     stats: { pwr: 7, grd: 5, spd: 7, mag: 7 }, evolvedName: 'Plasma Dynamo', emoji: '⚙️', evolvedEmoji: '⚡⚙️', spriteSheet: 'spark-type.png', spritePos: 5, evolvesAt: 15,
          ability: { name: 'Chain Lightning', desc: '5 dmg to all enemies', dmg: 5, aoe: true },
          evolvedStats: { pwr: 13, grd: 11, spd: 13, mag: 13 },
          evolvedAbility: { name: 'Storm Overload', desc: '8 dmg to all enemies', dmg: 8, aoe: true } },

        // === SHADOW TYPE (6) ===
        { id: 'duskkit',      name: 'Duskkit',      type: 'shadow', rarity: 'common',   stats: { pwr: 4, grd: 3, spd: 3, mag: 4 }, evolvedName: 'Nightprowl',   emoji: '🐈‍⬛', evolvedEmoji: '🌙🐈', spriteSheet: 'shadow-type.png', spritePos: 0, evolvesAt: 5,
          ability: { name: 'Vanish', desc: 'Dodge next attack', dodge: true },
          evolvedStats: { pwr: 7, grd: 6, spd: 6, mag: 7 },
          evolvedAbility: { name: 'Shadow Phase', desc: 'Dodge next attack + heal 3 HP', dodge: true, heal: 3 } },
        { id: 'gloom-bat',    name: 'Gloom Bat',    type: 'shadow', rarity: 'common',   stats: { pwr: 3, grd: 3, spd: 5, mag: 3 }, evolvedName: 'Eclipse Wing',  emoji: '🦇', evolvedEmoji: '🌙🦇', spriteSheet: 'shadow-type.png', spritePos: 1, evolvesAt: 5,
          ability: { name: 'Echo Screech', desc: 'See enemy next move', reveal: true },
          evolvedStats: { pwr: 6, grd: 6, spd: 8, mag: 6 },
          evolvedAbility: { name: 'Sonic Eclipse', desc: 'See enemy next move + 3 dmg', reveal: true, dmg: 3 } },
        { id: 'mist-owl',     name: 'Mist Owl',     type: 'shadow', rarity: 'uncommon', stats: { pwr: 4, grd: 4, spd: 4, mag: 6 }, evolvedName: 'Phantom Owl',   emoji: '🦉', evolvedEmoji: '🌙🦉', spriteSheet: 'shadow-type.png', spritePos: 2, evolvesAt: 8,
          ability: { name: 'Wisdom Drain', desc: 'Steal 2 MAG for 2 turns', steal: 'mag', amount: 2, turns: 2 },
          evolvedStats: { pwr: 8, grd: 8, spd: 8, mag: 10 },
          evolvedAbility: { name: 'Spirit Siphon', desc: 'Steal 3 MAG for 3 turns', steal: 'mag', amount: 3, turns: 3 } },
        { id: 'shade-fox',    name: 'Shade Fox',    type: 'shadow', rarity: 'rare',     stats: { pwr: 6, grd: 4, spd: 6, mag: 6 }, evolvedName: 'Phantom Fox',   emoji: '🦊', evolvedEmoji: '🌙🦊', spriteSheet: 'shadow-type.png', spritePos: 3, evolvesAt: 12,
          ability: { name: 'Shadow Copy', desc: 'Copy enemy last ability', copyAbility: true },
          evolvedStats: { pwr: 11, grd: 9, spd: 11, mag: 11 },
          evolvedAbility: { name: 'Phantom Mirror', desc: 'Copy enemy ability at 1.5x power', copyAbility: true, copyMultiplier: 1.5 } },
        { id: 'hex-tortoise', name: 'Hex Tortoise', type: 'shadow', rarity: 'rare',     stats: { pwr: 5, grd: 7, spd: 3, mag: 7 }, evolvedName: 'Rune Guardian', emoji: '🐢', evolvedEmoji: '🌙🐢', spriteSheet: 'shadow-type.png', spritePos: 4, evolvesAt: 12,
          ability: { name: 'Mystic Ward', desc: 'Block + reflect 3 dmg', shield: true, reflect: 3 },
          evolvedStats: { pwr: 10, grd: 12, spd: 8, mag: 12 },
          evolvedAbility: { name: 'Arcane Ward', desc: 'Block + reflect 6 dmg', shield: true, reflect: 6 } },
        { id: 'void-dragon',  name: 'Void Dragon',  type: 'shadow', rarity: 'legendary',stats: { pwr: 8, grd: 7, spd: 7, mag: 8 }, evolvedName: 'Abyssal Wyrm',  emoji: '🐲', evolvedEmoji: '🐲', spriteSheet: 'shadow-type.png', spritePos: 5,
          ability: { name: 'Dark Nova', desc: '10 dmg to all + heal 5', dmg: 10, aoe: true, heal: 5 } }
    ];

    function getCreature(id) {
        return CREATURES.find(c => c.id === id);
    }

    function getCreaturesByType(type) {
        return CREATURES.filter(c => c.type === type);
    }

    function getAllCreatures() {
        return CREATURES;
    }

    // Get a creature with evolved data applied if evolved
    function getCreatureResolved(id, isEvolved) {
        const base = CREATURES.find(c => c.id === id);
        if (!base) return null;
        if (!isEvolved || !base.evolvedStats) return { ...base };
        return {
            ...base,
            name: base.evolvedName || base.name,
            emoji: base.evolvedEmoji || base.emoji,
            stats: base.evolvedStats,
            ability: base.evolvedAbility || base.ability,
            _evolved: true
        };
    }

    function getEvolutionThreshold(rarity) {
        return EVOLUTION_THRESHOLDS[rarity] || null;
    }

    return {
        TYPES, ADVANTAGES, RARITIES, CREATURES,
        EVOLUTION_THRESHOLDS, EVOLUTION_STAT_BONUS,
        getCreature, getCreaturesByType, getAllCreatures,
        getCreatureResolved, getEvolutionThreshold,
        getTypeAdvantage, getHP
    };
})();
