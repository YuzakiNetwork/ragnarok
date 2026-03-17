// Command Handler - Process WhatsApp messages

class CommandHandler {
    constructor(bot) {
        this.bot = bot;
        this.commands = new Map();
        this.registerDefaultCommands();
    }

    registerDefaultCommands() {
        // Start/Register command
        this.registerCommand({
            name: 'start',
            aliases: ['register', 'mulai'],
            description: 'Mulai petualanganmu di Ragnarok Nexus',
            handler: async (userId, args, message) => {
                return await this.handleStart(userId, message);
            }
        });

        // Profile command
        this.registerCommand({
            name: 'profile',
            aliases: ['status', 'char', 'karakter'],
            description: 'Lihat profil karaktermu',
            handler: async (userId, args, message) => {
                return await this.handleProfile(userId);
            }
        });

        // Help command
        this.registerCommand({
            name: 'help',
            aliases: ['bantuan', 'commands'],
            description: 'Lihat semua perintah yang tersedia',
            handler: async (userId, args, message) => {
                return this.getHelpMessage();
            }
        });

        // Explore command
        this.registerCommand({
            name: 'explore',
            aliases: ['petualang', 'adventure'],
            description: 'Jelajahi dunia dan cari monster',
            handler: async (userId, args, message) => {
                return await this.handleExplore(userId);
            }
        });

        // Inventory command
        this.registerCommand({
            name: 'inventory',
            aliases: ['inv', 'tas'],
            description: 'Lihat inventory item-mu',
            handler: async (userId, args, message) => {
                return await this.handleInventory(userId);
            }
        });

        // Guild commands
        this.registerCommand({
            name: 'guild',
            aliases: ['gilde'],
            description: 'Kelola guild - gunakan: guild create [nama] atau guild join [nama]',
            handler: async (userId, args, message) => {
                return await this.handleGuild(userId, args);
            }
        });

        // Kingdom commands
        this.registerCommand({
            name: 'kingdom',
            aliases: ['kerajaan'],
            description: 'Kelola kingdom - gunakan: kingdom create [nama]',
            handler: async (userId, args, message) => {
                return await this.handleKingdom(userId, args);
            }
        });
    }

    registerCommand(command) {
        this.commands.set(command.name.toLowerCase(), command);
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.commands.set(alias.toLowerCase(), command);
            });
        }
    }

    async processMessage(userId, message, username, phone) {
        const trimmedMsg = message.trim();
        
        // Check for answer in character creation
        if (/^[1-6]$/.test(trimmedMsg)) {
            const answerResult = await this.bot.handleCharacterAnswer(userId, parseInt(trimmedMsg));
            if (answerResult) {
                return answerResult;
            }
        }

        // Parse command
        const parts = trimmedMsg.split(/\s+/);
        const cmdName = parts[0].toLowerCase().replace(/^[.!\/]/, ''); // Remove prefixes
        const args = parts.slice(1);

        const command = this.commands.get(cmdName);
        
        if (!command) {
            // Check if user is registered
            const user = await this.bot.db.getUser(userId);
            if (!user) {
                return {
                    text: `👋 Selamat datang di *RAGNAROK NEXUS*!\n\nKetik *!start* untuk memulai petualanganmu.\n\nAtau ketik *!help* untuk melihat semua perintah.`,
                    buttons: [
                        { id: 'start', text: '🎮 Mulai Petualangan' }
                    ]
                };
            }
            
            return {
                text: `❓ Perintah tidak dikenali: ${cmdName}\n\nKetik *!help* untuk melihat daftar perintah.`
            };
        }

        try {
            return await command.handler(userId, args, { text: message, username, phone });
        } catch (error) {
            console.error(`Error executing command ${cmdName}:`, error);
            return {
                text: `⚠️ Terjadi kesalahan saat memproses perintah.\n\nError: ${error.message}`
            };
        }
    }

    async handleStart(userId, message) {
        // Check if already registered
        const existingUser = await this.bot.db.getUser(userId);
        if (existingUser) {
            return {
                text: `✅ Kamu sudah terdaftar!\n\nNama: *${existingUser.character_name}*\nLevel: *${existingUser.level}*\nBloodline: *${existingUser.bloodline}*\n\nKetik *!profile* untuk melihat detail lengkap.`
            };
        }

        // Start character creation
        const firstQuestion = this.bot.characterCreator.startCreation(userId);
        
        return {
            text: `🌟 *SELAMAT DATANG DI RAGNAROK NEXUS!* 🌟\n\nSebelum memulai petualangan, jawab 7 pertanyaan untuk menentukan takdirmu...\n\n━━━━━━━━━━━━━━━━━━━━━━━\n**Pertanyaan ${firstQuestion.step}/${firstQuestion.total}**\n\n${firstQuestion.question}\n\n${firstQuestion.options.map(opt => `${opt.id}. ${opt.text}`).join('\n')}\n━━━━━━━━━━━━━━━━━━━━━━━\n\nBalas dengan angka (1-4) untuk memilih jawabanmu.`,
            buttons: firstQuestion.options.map(opt => ({
                id: opt.id.toString(),
                text: opt.text.substring(0, 30) + (opt.text.length > 30 ? '...' : '')
            }))
        };
    }

    async handleProfile(userId) {
        const user = await this.bot.db.getUser(userId);
        
        if (!user) {
            return {
                text: `❌ Kamu belum terdaftar!\n\nKetik *!start* untuk memulai petualangan.`,
                buttons: [
                    { id: 'start', text: '🎮 Mulai Petualangan' }
                ]
            };
        }

        const profileText = `
┌──────────────────────
│ 👤 *${user.character_name || 'Unknown'}*
├──────────────────────
│ 🏷️ Bloodline: *${user.bloodline}*
│ ⚡ Awakening: *${user.awakening}*
│ 🎭 Archetype: *${user.archetype}*
│ 🌟 Fate Mark: *${user.fate_mark}*
├──────────────────────
│ 📊 Level: *${user.level}*
│ ✨ EXP: *${user.exp}*
├──────────────────────
│ ❤️ HP: ${user.hp}/${user.max_hp}
│ 💙 MP: ${user.mp}/${user.max_mp}
├──────────────────────
│ 💪 STR: ${user.str} | 🏃 AGI: ${user.agi}
│ 🧠 INT: ${user.int} | 🧘 WIS: ${user.wis}
│ 🛡️ VIT: ${user.vit} | 💬 CHA: ${user.cha}
│ 🍀 LCK: ${user.lck}
├──────────────────────
│ 🌍 Location: ${user.current_location}
│ 🗺️ Shard: ${user.current_shard}
└──────────────────────
`;

        return {
            text: profileText,
            buttons: [
                { id: 'explore', text: '⚔️ Jelajah' },
                { id: 'inventory', text: '🎒 Inventory' },
                { id: 'help', text: '❓ Bantuan' }
            ]
        };
    }

    getHelpMessage() {
        return {
            text: `
┌──────────────────────
│ 📜 *DAFTAR PERINTAH*
├──────────────────────
│ 🎮 *PERMAINAN DASAR*
│ • !start - Mulai petualangan
│ • !profile - Lihat karakter
│ • !explore - Jelajahi dunia
│ • !inventory - Lihat tas
│
│ ⚔️ *COMBAT & QUEST*
│ • !attack [musuh] - Serang musuh
│ • !skill [nama] - Gunakan skill
│ • !quest - Lihat quest aktif
│
│ 👥 *SOSIAL*
│ • !guild create [nama] - Buat guild
│ • !guild join [nama] - Join guild
│ • !guild info - Info guild
│
│ 🏰 *KINGDOM*
│ • !kingdom create [nama] - Buat kingdom
│ • !kingdom info - Info kingdom
│
│ 📦 *EKONOMI*
│ • !market - Lihat pasar
│ • !trade [@user] - Trade dengan user
│ • !shop - Buka toko
│
│ ⚙️ *LAINNYA*
│ • !help - Bantuan ini
│ • !daily - Claim daily reward
│ • !leaderboard - Papan peringkat
└──────────────────────

💡 *Tips:* Bot menggunakan button untuk navigasi lebih mudah!
            `,
            buttons: [
                { id: 'start', text: '🎮 Mulai' },
                { id: 'profile', text: '👤 Profil' },
                { id: 'explore', text: '⚔️ Jelajah' }
            ]
        };
    }

    async handleExplore(userId) {
        const user = await this.bot.db.getUser(userId);
        
        if (!user) {
            return {
                text: `❌ Kamu harus terdaftar dulu!\n\nKetik *!start* untuk memulai.`,
                buttons: [
                    { id: 'start', text: '🎮 Mulai Petualangan' }
                ]
            };
        }

        // Simple exploration mechanic for MVP
        const encounters = [
            { type: 'monster', name: 'Goblin Scout', difficulty: 'easy' },
            { type: 'monster', name: 'Wild Wolf', difficulty: 'easy' },
            { type: 'treasure', name: 'Treasure Chest', items: ['Health Potion'] },
            { type: 'npc', name: 'Mysterious Merchant' },
            { type: 'event', name: 'Strange Phenomenon' }
        ];

        const encounter = encounters[Math.floor(Math.random() * encounters.length)];

        let text = `🌲 *EXPLORATION* 🌲\n\nKamu menjelajahi ${user.current_location}...\n\n`;

        if (encounter.type === 'monster') {
            text += `⚔️ *ENCOUNTER!*\n\nSeekor *${encounter.name}* muncul!\n\nApa yang akan kamu lakukan?`;
            return {
                text,
                buttons: [
                    { id: 'attack', text: '⚔️ Serang' },
                    { id: 'flee', text: '🏃 Kabur' },
                    { id: 'explore', text: '🔍 Cari Jalan Lain' }
                ]
            };
        } else if (encounter.type === 'treasure') {
            text += `✨ *TREASURE FOUND!*\n\nKamu menemukan peti harta berisi:\n`;
            encounter.items.forEach(item => {
                text += `• ${item}\n`;
            });
            text += `\nItem ditambahkan ke inventory!`;
            
            // Add items to inventory (simplified for MVP)
            await this.bot.db.db.run(
                'INSERT INTO inventory (user_id, item_name, item_type, quantity) VALUES (?, ?, ?, ?)',
                [userId, encounter.items[0], 'consumable', 1]
            );
            
            return {
                text,
                buttons: [
                    { id: 'explore', text: '🔍 Lanjut Jelajah' },
                    { id: 'inventory', text: '🎒 Lihat Tas' }
                ]
            };
        } else {
            text += `🎭 Kamu bertemu dengan *${encounter.name}*...\n\n(Teruskan untuk development!)`;
            return {
                text,
                buttons: [
                    { id: 'explore', text: '🔍 Lanjut Jelajah' },
                    { id: 'profile', text: '👤 Profil' }
                ]
            };
        }
    }

    async handleInventory(userId) {
        const user = await this.bot.db.getUser(userId);
        
        if (!user) {
            return {
                text: `❌ Kamu belum terdaftar!\n\nKetik *!start* untuk memulai.`,
                buttons: [
                    { id: 'start', text: '🎮 Mulai Petualangan' }
                ]
            };
        }

        return new Promise((resolve) => {
            this.bot.db.db.all(
                'SELECT * FROM inventory WHERE user_id = ?',
                [userId],
                (err, rows) => {
                    if (err || rows.length === 0) {
                        resolve({
                            text: `🎒 *INVENTORY*\n\nTasmu masih kosong.\n\nJelajahi dunia untuk menemukan item!`,
                            buttons: [
                                { id: 'explore', text: '⚔️ Jelajah' },
                                { id: 'profile', text: '👤 Profil' }
                            ]
                        });
                    } else {
                        let text = `🎒 *INVENTORY*\n\n`;
                        rows.forEach((item, idx) => {
                            text += `${idx + 1}. *${item.item_name}* x${item.quantity} [${item.rarity}]\n`;
                        });
                        
                        resolve({
                            text,
                            buttons: [
                                { id: 'explore', text: '⚔️ Jelajah' },
                                { id: 'profile', text: '👤 Profil' }
                            ]
                        });
                    }
                }
            );
        });
    }

    async handleGuild(userId, args) {
        const user = await this.bot.db.getUser(userId);
        
        if (!user) {
            return {
                text: `❌ Kamu harus terdaftar dulu!\n\nKetik *!start* untuk memulai.`,
                buttons: [
                    { id: 'start', text: '🎮 Mulai Petualangan' }
                ]
            };
        }

        const action = args[0]?.toLowerCase();
        
        if (action === 'create') {
            const guildName = args.slice(1).join(' ');
            if (!guildName) {
                return {
                    text: `❌ Format salah!\n\nGunakan: *!guild create [nama guild]*\n\nContoh: !guild create Moonlight Knights`
                };
            }

            try {
                await this.bot.db.createGuild(guildName, userId);
                return {
                    text: `✅ Guild *${guildName}* berhasil dibuat!\n\nKamu sekarang adalah Leader guild ini.\n\nKetik *!guild info* untuk melihat detail guild.`,
                    buttons: [
                        { id: 'guild info', text: '📊 Info Guild' },
                        { id: 'help', text: '❓ Bantuan' }
                    ]
                };
            } catch (error) {
                return {
                    text: `❌ Gagal membuat guild. Mungkin nama sudah digunakan.\n\nError: ${error.message}`
                };
            }
        } else if (action === 'info') {
            // Simplified for MVP - would need guild lookup by user
            return {
                text: `📊 *GUILD INFO*\n\nFitur detail guild akan segera hadir!\n\nUntuk saat ini, buat guild dengan: *!guild create [nama]*`,
                buttons: [
                    { id: 'guild create', text: '➕ Buat Guild' },
                    { id: 'help', text: '❓ Bantuan' }
                ]
            };
        } else {
            return {
                text: `🏛️ *GUILD SYSTEM*\n\nPerintah tersedia:\n• !guild create [nama] - Buat guild baru\n• !guild info - Lihat info guild\n• !guild join [nama] - Join guild (segera hadir)`,
                buttons: [
                    { id: 'guild create', text: '➕ Buat Guild' },
                    { id: 'help', text: '❓ Bantuan' }
                ]
            };
        }
    }

    async handleKingdom(userId, args) {
        const user = await this.bot.db.getUser(userId);
        
        if (!user) {
            return {
                text: `❌ Kamu harus terdaftar dulu!\n\nKetik *!start* untuk memulai.`,
                buttons: [
                    { id: 'start', text: '🎮 Mulai Petualangan' }
                ]
            };
        }

        const action = args[0]?.toLowerCase();
        
        if (action === 'create') {
            const kingdomName = args.slice(1).join(' ');
            if (!kingdomName) {
                return {
                    text: `❌ Format salah!\n\nGunakan: *!kingdom create [nama kingdom]*\n\nContoh: !kingdom create Ironhold Empire`
                };
            }

            try {
                await this.bot.db.createKingdom(kingdomName, userId, user.current_shard);
                return {
                    text: `👑 Kingdom *${kingdomName}* berhasil didirikan!\n\nKamu sekarang adalah Ruler kingdom ini di shard ${user.current_shard}.\n\nKerajaanmu dimulai dengan:\n• 🍞 Food: 1000\n• 💰 Gold: 5000\n• 😊 Morale: 50\n• 📊 Stability: 50`,
                    buttons: [
                        { id: 'kingdom info', text: '📊 Info Kingdom' },
                        { id: 'help', text: '❓ Bantuan' }
                    ]
                };
            } catch (error) {
                return {
                    text: `❌ Gagal membuat kingdom. Mungkin nama sudah digunakan.\n\nError: ${error.message}`
                };
            }
        } else {
            return {
                text: `🏰 *KINGDOM SYSTEM*\n\nPerintah tersedia:\n• !kingdom create [nama] - Dirikan kingdom baru\n• !kingdom info - Lihat info kingdom (segera hadir)\n\nKelola kingdommu dengan bijak!`,
                buttons: [
                    { id: 'kingdom create', text: '👑 Buat Kingdom' },
                    { id: 'help', text: '❓ Bantuan' }
                ]
            };
        }
    }
}

module.exports = CommandHandler;
