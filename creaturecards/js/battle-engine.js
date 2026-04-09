/* ============================================
   CREATURE CARDS — Battle Engine
   Turn-based combat logic, damage calculation, AI
   ============================================ */
const BattleEngine = (() => {
    let state = null;

    function startBattle(playerTeam, opponentTeam, tier) {
        state = {
            player: playerTeam.map(c => _makeActive(c)),
            opponent: opponentTeam.map(c => _makeActive(c)),
            playerActive: 0,
            opponentActive: 0,
            turn: 0,
            tier: tier || 1,
            log: [],
            finished: false,
            winner: null
        };
        return getState();
    }

    function _makeActive(creature) {
        const hp = CreatureData.getHP(creature);
        return {
            ...creature,
            maxHP: hp,
            hp: hp,
            buffs: {},   // stat: { amount, turnsLeft }
            debuffs: {},
            shielded: false,
            dodging: false,
            stunned: 0,
            blinded: false
        };
    }

    function getState() {
        if (!state) return null;
        return {
            player: state.player,
            opponent: state.opponent,
            playerActive: state.playerActive,
            opponentActive: state.opponentActive,
            turn: state.turn,
            finished: state.finished,
            winner: state.winner,
            log: state.log.slice(-5)
        };
    }

    /**
     * Execute player's turn.
     * @param {string} action - 'attack', 'ability', or 'swap'
     * @param {boolean} questionCorrect - true if player answered correctly
     * @param {boolean} questionFast - true if answered in <5 seconds
     * @param {number} swapIndex - index to swap to (for 'swap' action)
     */
    function playerTurn(action, questionCorrect, questionFast, swapIndex) {
        if (state.finished) return getState();

        const attacker = state.player[state.playerActive];
        const defender = state.opponent[state.opponentActive];

        if (action === 'swap' && swapIndex !== undefined) {
            // Swap creature (no attack, no question needed)
            if (state.player[swapIndex] && state.player[swapIndex].hp > 0) {
                state.playerActive = swapIndex;
                state.log.push(`Swapped to ${state.player[swapIndex].name}!`);
            }
        } else if (action === 'ability' && !attacker.stunned) {
            // Attempt special ability
            if (questionCorrect) {
                _applyAbility(attacker, defender, questionFast);
            } else {
                // Failed ability = basic attack at half power
                const dmg = _calcDamage(attacker, defender, 0.5);
                defender.hp = Math.max(0, defender.hp - dmg);
                state.log.push(`${attacker.name} missed the ability! Basic attack: ${dmg} dmg`);
            }
        } else if (!attacker.stunned) {
            // Basic attack
            const multiplier = questionCorrect ? (questionFast ? 1.2 : 1.0) : 0.5;
            const dmg = _calcDamage(attacker, defender, multiplier);

            if (defender.dodging) {
                defender.dodging = false;
                state.log.push(`${defender.name} dodged the attack!`);
            } else if (defender.shielded) {
                defender.shielded = false;
                state.log.push(`${defender.name}'s shield blocked the attack!`);
            } else {
                defender.hp = Math.max(0, defender.hp - dmg);
                state.log.push(`${attacker.name} attacks for ${dmg} damage!`);
            }
        } else {
            attacker.stunned--;
            state.log.push(`${attacker.name} is resting...`);
        }

        // Check if opponent's active creature fainted
        if (defender.hp <= 0) {
            state.log.push(`${defender.name} fainted!`);
            // Find next alive opponent creature
            const nextAlive = state.opponent.findIndex((c, i) => i !== state.opponentActive && c.hp > 0);
            if (nextAlive === -1) {
                state.finished = true;
                state.winner = 'player';
                state.log.push('Victory!');
                return getState();
            }
            state.opponentActive = nextAlive;
        }

        // Opponent's turn
        if (!state.finished) {
            _opponentTurn();
        }

        // Tick buffs/debuffs
        _tickEffects(state.player[state.playerActive]);
        _tickEffects(state.opponent[state.opponentActive]);

        state.turn++;
        return getState();
    }

    function _calcDamage(attacker, defender, questionMultiplier) {
        const pwr = _getEffectiveStat(attacker, 'pwr');
        const grd = _getEffectiveStat(defender, 'grd');
        const typeMod = CreatureData.getTypeAdvantage(attacker.type, defender.type);
        const baseDmg = Math.floor(pwr * questionMultiplier * typeMod);
        const finalDmg = Math.max(1, baseDmg - Math.floor(grd / 3));
        return finalDmg;
    }

    function _getEffectiveStat(creature, stat) {
        let val = creature.stats[stat] || 0;
        if (creature.buffs[stat]) val += creature.buffs[stat].amount;
        if (creature.debuffs[stat]) val += creature.debuffs[stat].amount;
        return Math.max(1, val);
    }

    function _applyAbility(attacker, defender, fast) {
        const ability = attacker.ability;
        if (!ability) return;

        // Direct damage abilities
        if (ability.dmg) {
            let dmg = ability.dmg;
            if (ability.ignoreGuard) {
                // Ignore defender guard
            } else {
                dmg = Math.max(1, dmg - Math.floor(_getEffectiveStat(defender, 'grd') / 3));
            }
            if (fast) dmg = Math.ceil(dmg * 1.2);

            if (defender.shielded && !ability.ignoreGuard) {
                defender.shielded = false;
                state.log.push(`${attacker.name} used ${ability.name}! Shield blocked!`);
            } else if (defender.dodging) {
                defender.dodging = false;
                state.log.push(`${defender.name} dodged ${ability.name}!`);
            } else {
                defender.hp = Math.max(0, defender.hp - dmg);
                state.log.push(`${attacker.name} used ${ability.name}! ${dmg} dmg!`);
            }
        }

        // Damage from stat value
        if (ability.dmgFromStat) {
            let dmg = _getEffectiveStat(attacker, ability.dmgFromStat);
            if (ability.dmgStatMultiplier) dmg = Math.floor(dmg * ability.dmgStatMultiplier);
            defender.hp = Math.max(0, defender.hp - dmg);
            state.log.push(`${attacker.name} used ${ability.name}! ${dmg} dmg!`);
        }

        // Damage multiplier
        if (ability.dmgMultiplier) {
            const dmg = Math.floor(_getEffectiveStat(attacker, 'pwr') * ability.dmgMultiplier);
            defender.hp = Math.max(0, defender.hp - dmg);
            state.log.push(`${attacker.name} used ${ability.name}! ${dmg} dmg!`);
            if (ability.selfDebuff) {
                attacker.debuffs[ability.selfDebuff] = { amount: ability.selfDebuffAmt, turnsLeft: 2 };
            }
        }

        // Healing
        if (ability.heal) {
            attacker.hp = Math.min(attacker.maxHP, attacker.hp + ability.heal);
            state.log.push(`${attacker.name} healed ${ability.heal} HP!`);
        }

        // Buffs
        if (ability.buff) {
            attacker.buffs[ability.buff] = { amount: ability.amount, turnsLeft: ability.turns || 2 };
            state.log.push(`${attacker.name} used ${ability.name}! +${ability.amount} ${ability.buff.toUpperCase()}!`);
        }

        // Debuffs on opponent
        if (ability.debuff) {
            const debuffVal = ability.debuffAmt || ability.amount || 0;
            defender.debuffs[ability.debuff] = { amount: debuffVal, turnsLeft: ability.turns || 2 };
            state.log.push(`${attacker.name} used ${ability.name}! Enemy ${ability.debuff.toUpperCase()} ${debuffVal}!`);
        }

        // Shield
        if (ability.shield) {
            attacker.shielded = true;
            if (ability.reflect) {
                state.log.push(`${attacker.name} raised a reflecting shield!`);
            } else {
                state.log.push(`${attacker.name} raised a shield!`);
            }
        }

        // Dodge
        if (ability.dodge) {
            attacker.dodging = true;
            state.log.push(`${attacker.name} is preparing to dodge!`);
        }

        // Self-damage
        if (ability.selfDmg) {
            attacker.hp = Math.max(1, attacker.hp - ability.selfDmg);
        }

        // Self-stun
        if (ability.selfStun) {
            attacker.stunned = ability.selfStun;
        }
    }

    function _opponentTurn() {
        const attacker = state.opponent[state.opponentActive];
        const defender = state.player[state.playerActive];

        if (attacker.stunned > 0) {
            attacker.stunned--;
            state.log.push(`${attacker.name} is resting...`);
            return;
        }

        if (defender.blinded) {
            defender.blinded = false;
            state.log.push(`${attacker.name} missed! (blinded)`);
            return;
        }

        // AI: Tier determines strategy
        const useAbility = state.tier >= 2 && Math.random() < (0.2 + state.tier * 0.1);

        if (useAbility && attacker.ability) {
            // AI uses ability (assume AI always "answers correctly" at 1.0x)
            _applyAbility(attacker, defender, false);
        } else {
            // Basic attack (AI always gets 1.0x multiplier, no speed bonus)
            const dmg = _calcDamage(attacker, defender, 1.0);

            if (defender.dodging) {
                defender.dodging = false;
                state.log.push(`${defender.name} dodged ${attacker.name}'s attack!`);
            } else if (defender.shielded) {
                defender.shielded = false;
                state.log.push(`${defender.name}'s shield blocked ${attacker.name}!`);
            } else {
                defender.hp = Math.max(0, defender.hp - dmg);
                state.log.push(`${attacker.name} attacks for ${dmg} damage!`);
            }
        }

        // Check if player's active creature fainted
        if (defender.hp <= 0) {
            state.log.push(`${defender.name} fainted!`);
            const nextAlive = state.player.findIndex((c, i) => i !== state.playerActive && c.hp > 0);
            if (nextAlive === -1) {
                state.finished = true;
                state.winner = 'opponent';
                state.log.push('Defeat...');
            } else {
                // Auto-swap to next alive creature
                state.playerActive = nextAlive;
                state.log.push(`Go, ${state.player[nextAlive].name}!`);
            }
        }
    }

    function _tickEffects(creature) {
        for (const stat in creature.buffs) {
            if (creature.buffs[stat].turnsLeft > 0) {
                creature.buffs[stat].turnsLeft--;
                if (creature.buffs[stat].turnsLeft <= 0) delete creature.buffs[stat];
            }
        }
        for (const stat in creature.debuffs) {
            if (creature.debuffs[stat].turnsLeft > 0) {
                creature.debuffs[stat].turnsLeft--;
                if (creature.debuffs[stat].turnsLeft <= 0) delete creature.debuffs[stat];
            }
        }
    }

    function isFinished() { return state ? state.finished : false; }
    function getWinner() { return state ? state.winner : null; }

    return { startBattle, playerTurn, getState, isFinished, getWinner };
})();
