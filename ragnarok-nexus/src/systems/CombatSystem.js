// Combat System - Turn-based battle engine with skills, momentum, and environment actions

class CombatSystem {
    constructor() {
        this.activeBattles = new Map(); // userId -> battle data
        this.environmentTypes = [
            { name: 'Cave', hazard: 'Stalaktit jatuh', effect: 'rockfall' },
            { name: 'Forest', hazard: 'Api menyebar', effect: 'fire' },
            { name: 'Volcano', hazard: 'Lava flow', effect: 'lava' },
            { name: 'Ruins', hazard: 'Reruntuhan', effect: 'debris' },
            { name: 'Swamp', hazard: 'Poison gas', effect: 'poison' }
        ];
        
        this.monsterTemplates = [
            { name: 'Goblin Scout', tier: 'F', hp: 100, atk: 15, exp: 20, loot: ['rusty_dagger'] },
            { name: 'Orc Warrior', tier: 'D', hp: 250, atk: 28, exp: 45, loot: ['orc_axe', 'iron_ore'] },
            { name: 'Dark Mage', tier: 'C', hp: 180, atk: 40, exp: 60, loot: ['magic_crystal', 'spell_scroll'] },
            { name: 'Stone Golem', tier: 'B', hp: 500, atk: 35, exp: 100, loot: ['stone_core', 'ancient_rune'] },
            { name: 'Dragon Whelp', tier: 'A', hp: 800, atk: 55, exp: 200, loot: ['dragon_scale', 'fire_gem'] },
            { name: 'Ancient Troll King', tier: 'S', hp: 1500, atk: 75, exp: 500, loot: ['troll_crown', 'regeneration_stone'] },
            { name: 'Void Abomination', tier: 'SS', hp: 3000, atk: 95, exp: 1000, loot: ['void_fragment', 'eldritch_eye'] }
        ];
        
        this.skillTrees = {
            Warrior: ['Power Strike', 'Shield Bash', 'Berserk', 'Whirlwind'],
            Mage: ['Fireball', 'Ice Lance', 'Lightning Bolt', 'Arcane Shield'],
            Rogue: ['Backstab', 'Poison Dart', 'Shadow Step', 'Assassinate'],
            Support: ['Heal', 'Blessing', 'Purify', 'Revive'],
            Archer: ['Precision Shot', 'Multi Arrow', 'Explosive Arrow', 'Eagle Eye'],
            Berserker: ['Rage Strike', 'Blood Pact', 'Unstoppable', 'Final Blow']
        };
    }

    startBattle(userId, characterData) {
        const monster = this.generateMonster(characterData.level);
        const environment = this.environmentTypes[Math.floor(Math.random() * this.environmentTypes.length)];
        
        const battle = {
            userId,
            turn: 1,
            player: {
                hp: characterData.stats.vit * 10,
                maxHp: characterData.stats.vit * 10,
                mp: characterData.stats.wis * 8,
                maxMp: characterData.stats.wis * 8,
                shield: 0,
                status: [],
                momentum: 0,
                overdrive: false
            },
            enemy: {
                ...monster,
                maxHp: monster.hp,
                identified: false
            },
            environment,
            turnStartTime: Date.now(),
            timeLimit: 45000, // 45 seconds per turn
            log: []
        };
        
        this.activeBattles.set(userId, battle);
        
        return this.generateBattleMessage(battle, characterData);
    }

    generateMonster(playerLevel) {
        const tierIndex = Math.min(
            Math.floor(playerLevel / 10),
            this.monsterTemplates.length - 1
        );
        
        const baseMonster = this.monsterTemplates[tierIndex];
        const scaling = 1 + (playerLevel * 0.1);
        
        return {
            ...baseMonster,
            hp: Math.floor(baseMonster.hp * scaling),
            atk: Math.floor(baseMonster.atk * scaling),
            exp: Math.floor(baseMonster.exp * scaling)
        };
    }

    playerAction(userId, actionType, actionData = {}) {
        const battle = this.activeBattles.get(userId);
        if (!battle) {
            return { error: 'Tidak ada battle aktif!' };
        }

        const now = Date.now();
        const timeElapsed = now - battle.turnStartTime;
        
        if (timeElapsed > battle.timeLimit) {
            return this.enemyTurn(userId, true); // Auto-defend
        }

        let result;
        
        switch (actionType) {
            case 'attack':
                result = this.playerAttack(userId, battle);
                break;
            case 'skill':
                result = this.playerSkill(userId, battle, actionData.skillId);
                break;
            case 'item':
                result = this.playerItem(userId, battle, actionData.itemId);
                break;
            case 'defend':
                result = this.playerDefend(userId, battle);
                break;
            case 'analyze':
                result = this.playerAnalyze(userId, battle);
                break;
            case 'environment':
                result = this.playerEnvironment(userId, battle);
                break;
            case 'flee':
                return this.playerFlee(userId, battle);
            default:
                return { error: 'Invalid action!' };
        }

        if (result && !result.error) {
            battle.log.push(result.log);
            
            // Check if enemy defeated
            if (battle.enemy.hp <= 0) {
                return this.endBattle(userId, true);
            }
            
            // Enemy turn
            setTimeout(() => this.enemyTurn(userId), 1000);
            return { ...result, waiting: true };
        }
        
        return result;
    }

    playerAttack(userId, battle) {
        const character = this.bot.db.getUser(userId);
        if (!character) return { error: 'Character not found!' };
        
        const strMod = character.data.stats.str * 1.5;
        const agiMod = character.data.stats.agi * 0.5;
        const lckMod = character.data.stats.lck * 0.3;
        
        const baseDamage = Math.floor(strMod + agiMod + lckMod);
        const critChance = character.data.stats.lck * 0.5;
        const isCrit = Math.random() * 100 < critChance;
        
        let damage = baseDamage;
        if (isCrit) {
            damage = Math.floor(damage * 2);
        }
        
        // Momentum check
        battle.player.momentum++;
        if (battle.player.momentum >= 5) {
            battle.player.overdrive = true;
            damage = Math.floor(damage * 1.5);
            battle.log.push(`⚡ OVERDRIVE ACTIVATED! Damage boosted!`);
        }
        
        battle.enemy.hp -= damage;
        
        return {
            log: `💥 Anda menyerang ${battle.enemy.name}!\n` +
                 `Damage: ${damage}${isCrit ? ' (CRITICAL!)' : ''}\n` +
                 `Momentum: ${battle.player.momentum}${battle.player.overdrive ? ' ⚡ OVERDRIVE' : ''}`,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerSkill(userId, battle, skillId) {
        const character = this.bot.db.getUser(userId);
        if (!character) return { error: 'Character not found!' };
        
        const archetype = character.data.archetype;
        const skills = this.skillTrees[archetype] || [];
        
        if (skillId < 0 || skillId >= skills.length) {
            return { error: 'Skill tidak valid!' };
        }
        
        const skillName = skills[skillId];
        const mpCost = 20 + (skillId * 15);
        
        if (battle.player.mp < mpCost) {
            return { error: `MP tidak cukup! Butuh ${mpCost} MP` };
        }
        
        battle.player.mp -= mpCost;
        
        let damage = 0;
        let effect = '';
        
        switch (skillId) {
            case 0: // Basic skill
                damage = Math.floor((character.data.stats.int + character.data.stats.str) * 2);
                effect = `${skillName} digunakan!`;
                break;
            case 1: // Medium skill
                damage = Math.floor((character.data.stats.int + character.data.stats.str) * 3);
                effect = `${skillName} menghantam musuh!`;
                break;
            case 2: // Strong skill
                damage = Math.floor((character.data.stats.int + character.data.stats.str) * 4.5);
                effect = `${skillName} memberikan damage besar!`;
                break;
            case 3: // Ultimate skill
                damage = Math.floor((character.data.stats.int + character.data.stats.str) * 6);
                effect = `🌟 ULTIMATE: ${skillName}! DAMAGE MASIF!`;
                break;
        }
        
        battle.enemy.hp -= damage;
        battle.player.momentum++;
        
        return {
            log: `✨ ${effect}\nDamage: ${damage}\nMP used: ${mpCost}\nMP remaining: ${battle.player.mp}`,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerItem(userId, battle, itemId) {
        const character = this.bot.db.getUser(userId);
        if (!character) return { error: 'Character not found!' };
        
        const inventory = this.bot.db.getInventory(userId);
        const item = inventory.find(i => i.id === itemId);
        
        if (!item) {
            return { error: 'Item tidak ditemukan!' };
        }
        
        let effect = '';
        
        if (item.type === 'potion') {
            const healAmount = item.tier * 50;
            battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + healAmount);
            effect = `🧪 Menggunakan ${item.name}! HP recovered: ${healAmount}`;
        } else if (item.type === 'buff') {
            battle.player.shield += item.tier * 30;
            effect = `🛡️ Menggunakan ${item.name}! Shield gained: ${item.tier * 30}`;
        }
        
        // Remove item from inventory
        this.bot.db.removeFromInventory(userId, itemId);
        
        return {
            log: effect,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerDefend(userId, battle) {
        const character = this.bot.db.getUser(userId);
        const vitMod = character.data.stats.vit * 2;
        
        battle.player.shield += vitMod;
        battle.player.momentum = 0; // Reset momentum on defend
        
        return {
            log: `🛡️ Anda bertahan! Shield gained: ${vitMod}\nTotal Shield: ${battle.player.shield}`,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerAnalyze(userId, battle) {
        const character = this.bot.db.getUser(userId);
        battle.enemy.identified = true;
        
        return {
            log: `🔍 Menganalisis musuh...\n\n` +
                 `**${battle.enemy.name}** (Tier ${battle.enemy.tier})\n` +
                 `HP: ${battle.enemy.hp}/${battle.enemy.maxHp}\n` +
                 `ATK: ${battle.enemy.atk}\n` +
                 `EXP Reward: ${battle.enemy.exp}\n` +
                 `Potential Loot: ${battle.enemy.loot.join(', ')}`,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerEnvironment(userId, battle) {
        const character = this.bot.db.getUser(userId);
        const intMod = character.data.stats.int;
        const wisMod = character.data.stats.wis;
        
        let damage = 0;
        let effect = '';
        
        switch (battle.environment.effect) {
            case 'rockfall':
                damage = Math.floor(intMod * 3);
                effect = '🪨 Stalaktit jatuh menimpa musuh!';
                break;
            case 'fire':
                damage = Math.floor(intMod * 3.5);
                effect = '🔥 Api membakar area!';
                break;
            case 'lava':
                damage = Math.floor(intMod * 4);
                effect = '🌋 Lava menyembur!';
                break;
            case 'debris':
                damage = Math.floor(intMod * 2.5);
                effect = '💥 Reruntuhan menimpa musuh!';
                break;
            case 'poison':
                damage = Math.floor(wisMod * 3);
                effect = '☠️ Gas beracun menyelimuti musuh!';
                break;
        }
        
        battle.enemy.hp -= damage;
        
        return {
            log: `🌍 ${effect}\nEnvironment Damage: ${damage}`,
            battle: this.generateBattleMessage(battle, character.data)
        };
    }

    playerFlee(userId, battle) {
        const character = this.bot.db.getUser(userId);
        const agiMod = character.data.stats.agi;
        const fleeChance = Math.min(90, 50 + agiMod);
        
        if (Math.random() * 100 < fleeChance) {
            this.activeBattles.delete(userId);
            return {
                text: `✅ Berhasil kabur dari pertempuran!\n` +
                      `Chance: ${fleeChance}%\n\n` +
                      `⚠️ Momentum reset dan reputasi sedikit turun...`,
                buttons: [
                    { id: 'explore', text: '🗺️ Explore Lagi' },
                    { id: 'profile', text: '👤 Lihat Profil' }
                ]
            };
        } else {
            battle.log.push('❌ Gagal kabur! Musuh menghalangi jalan!');
            setTimeout(() => this.enemyTurn(userId), 1000);
            return {
                log: '❌ Gagal kabur! Musuh menghalangi jalan!',
                waiting: true
            };
        }
    }

    enemyTurn(userId, autoDefend = false) {
        const battle = this.activeBattles.get(userId);
        if (!battle) return;
        
        const character = this.bot.db.getUser(userId);
        if (!character) return;
        
        let enemyAction = '';
        let damage = battle.enemy.atk;
        
        // Enemy AI
        const rand = Math.random();
        if (battle.enemy.hp < battle.enemy.maxHp * 0.3 && rand < 0.4) {
            // Desperate attack when low HP
            damage = Math.floor(damage * 1.8);
            enemyAction = '😡 ENRAGE MODE!';
        } else if (rand < 0.2) {
            // Heavy attack
            damage = Math.floor(damage * 1.5);
            enemyAction = '💢 Heavy Attack!';
        } else if (rand < 0.3) {
            // Normal attack
            enemyAction = '⚔️ Menyerang!';
        }
        
        // Apply shield
        if (battle.player.shield > 0) {
            const shieldAbsorb = Math.min(battle.player.shield, damage);
            damage -= shieldAbsorb;
            battle.player.shield -= shieldAbsorb;
            enemyAction += ` (Shield absorbed ${shieldAbsorb})`;
        }
        
        battle.player.hp -= damage;
        
        // Reset momentum if player hit
        if (damage > 0) {
            battle.player.momentum = 0;
            battle.player.overdrive = false;
        }
        
        battle.turn++;
        battle.turnStartTime = Date.now();
        
        let logMsg = `\n--- TURN ${battle.turn} ---\n`;
        logMsg += `${battle.enemy.name} ${enemyAction}\n`;
        logMsg += `Damage taken: ${damage}\n`;
        
        if (autoDefend) {
            logMsg = '⏰ TIME OUT! Auto-defend...\n' + logMsg;
        }
        
        battle.log.push(logMsg);
        
        // Check if player defeated
        if (battle.player.hp <= 0) {
            return this.endBattle(userId, false);
        }
        
        // Send updated battle state
        const message = this.generateBattleMessage(battle, character.data);
        this.bot.sendMessage(userId, message);
    }

    endBattle(userId, victory) {
        const battle = this.activeBattles.get(userId);
        if (!battle) return { error: 'No active battle!' };
        
        const character = this.bot.db.getUser(userId);
        
        this.activeBattles.delete(userId);
        
        if (victory) {
            // Calculate rewards
            const expGain = battle.enemy.exp;
            const goldGain = Math.floor(battle.enemy.exp * 0.5);
            
            // Drop loot
            const lootDrop = battle.enemy.loot[Math.floor(Math.random() * battle.enemy.loot.length)];
            
            // Update character
            character.data.exp = (character.data.exp || 0) + expGain;
            character.data.gold = (character.data.gold || 0) + goldGain;
            
            // Check level up
            const levelUp = this.checkLevelUp(character.data);
            
            // Add loot to inventory
            if (lootDrop) {
                this.bot.db.addToInventory(userId, {
                    id: lootDrop,
                    name: lootDrop.replace('_', ' ').toUpperCase(),
                    type: 'material',
                    tier: this.getTierFromMonster(battle.enemy.tier)
                });
            }
            
            this.bot.db.updateUser(userId, '', '', character.data);
            
            let msg = `🎉 VICTORY! 🎉\n\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `Musuh dikalahkan: **${battle.enemy.name}**\n\n`;
            msg += `📊 REWARDS:\n`;
            msg += `✨ EXP: +${expGain}\n`;
            msg += `💰 Gold: +${goldGain}\n`;
            msg += `🎁 Loot: **${lootDrop}**\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            
            if (levelUp) {
                msg += `🆙 LEVEL UP! Sekarang level ${character.data.level}!\n`;
                msg += `Stat increased!\n\n`;
            }
            
            return {
                text: msg,
                buttons: [
                    { id: 'profile', text: '👤 Lihat Profil' },
                    { id: 'inventory', text: '🎒 Inventory' },
                    { id: 'explore', text: '🗺️ Explore Lagi' }
                ]
            };
        } else {
            // Defeat
            let msg = `💀 DEFEAT 💀\n\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `Anda dikalahkan oleh **${battle.enemy.name}**...\n\n`;
            msg += `😞 EXP lost: ${Math.floor(character.data.exp * 0.1)}\n`;
            msg += `💰 Gold lost: ${Math.floor((character.data.gold || 0) * 0.2)}\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            msg += `Jangan menyerah! Istirahat dan coba lagi!\n`;
            
            // Penalty
            character.data.exp = Math.max(0, (character.data.exp || 0) - Math.floor(character.data.exp * 0.1));
            character.data.gold = Math.max(0, (character.data.gold || 0) - Math.floor((character.data.gold || 0) * 0.2));
            this.bot.db.updateUser(userId, '', '', character.data);
            
            return {
                text: msg,
                buttons: [
                    { id: 'explore', text: '🗺️ Coba Lagi' },
                    { id: 'help', text: '❓ Bantuan' }
                ]
            };
        }
    }

    checkLevelUp(characterData) {
        const expNeeded = characterData.level * 100;
        
        if (characterData.exp >= expNeeded) {
            characterData.level++;
            characterData.exp -= expNeeded;
            
            // Stat increase
            characterData.stats.str += 2;
            characterData.stats.agi += 2;
            characterData.stats.int += 2;
            characterData.stats.wis += 2;
            characterData.stats.vit += 2;
            characterData.stats.cha += 1;
            characterData.stats.lck += 1;
            
            return true;
        }
        
        return false;
    }

    getTierFromMonster(tier) {
        const tierMap = { 'F': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 5, 'S': 6, 'SS': 7 };
        return tierMap[tier] || 1;
    }

    generateBattleMessage(battle, characterData) {
        const hpPercent = Math.floor((battle.player.hp / battle.player.maxHp) * 100);
        const enemyHpPercent = Math.floor((battle.enemy.hp / battle.enemy.maxHp) * 100);
        
        let text = `━━━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `⚔️ BATTLE — TURN ${battle.turn}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        text += `[YOU] **${characterData.characterName}**\n`;
        text += `HP: ${battle.player.hp}/${battle.player.maxHp} ❤️ `;
        text += this.renderBar(hpPercent, 20) + ` ${hpPercent}%\n`;
        text += `MP: ${battle.player.mp}/${battle.player.maxMp} 💙\n`;
        text += `Shield: ${battle.player.shield} 🛡️\n`;
        
        if (battle.player.status.length > 0) {
            text += `Status: ${battle.player.status.join(', ')}\n`;
        }
        
        if (battle.player.overdrive) {
            text += `⚡ OVERDRIVE ACTIVE!\n`;
        }
        
        text += `\n[FOE] **${battle.enemy.name}** ${battle.enemy.identified ? '' : '(?)'}\n`;
        
        if (battle.enemy.identified) {
            text += `HP: ${battle.enemy.hp}/${battle.enemy.maxHp} `;
            text += this.renderBar(enemyHpPercent, 15) + ` ${enemyHpPercent}%\n`;
            text += `ATK: ${battle.enemy.atk}\n`;
        } else {
            text += `HP: ???/??? (Belum teridentifikasi)\n`;
        }
        
        text += `\n🌍 ENVIRONMENT: ${battle.environment.name} — ${battle.environment.hazard}\n`;
        text += `⏰ TIME LIMIT: ${Math.floor((battle.timeLimit - (Date.now() - battle.turnStartTime)) / 1000)}s\n\n`;
        
        text += `╔══════ PILIHAN ══════╗\n`;
        text += `1️⃣ Attack (Basic)\n`;
        text += `2️⃣ Skills\n`;
        text += `3️⃣ Items\n`;
        text += `4️⃣ Defend\n`;
        text += `5️⃣ Analyze Enemy\n`;
        text += `6️⃣ Environment Action 🌟\n`;
        text += `7️⃣ Flee\n`;
        text += `╚════════════════════╝\n`;
        
        if (battle.log.length > 0) {
            text += `\n📜 Battle Log:\n`;
            text += battle.log.slice(-3).join('\n');
        }
        
        return {
            text,
            buttons: [
                { id: 'atk', text: '⚔️ Attack' },
                { id: 'skill', text: '✨ Skills' },
                { id: 'defend', text: '🛡️ Defend' },
                { id: 'item', text: '🧪 Items' },
                { id: 'analyze', text: '🔍 Analyze' },
                { id: 'env', text: '🌍 Environment' },
                { id: 'flee', text: '🏃 Flee' }
            ]
        };
    }

    renderBar(percent, length) {
        const filled = Math.floor((percent / 100) * length);
        const empty = length - filled;
        return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
    }

    getActiveBattle(userId) {
        return this.activeBattles.get(userId);
    }
}

module.exports = new CombatSystem();
