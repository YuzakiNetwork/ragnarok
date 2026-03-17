// Main Bot Class - WhatsApp connection and message handling

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const Database = require('./database/Database');
const CharacterCreator = require('./systems/CharacterCreator');
const CommandHandler = require('./handlers/CommandHandler');

class RagnarokBot {
    constructor() {
        this.socket = null;
        this.db = new Database();
        this.characterCreator = CharacterCreator;
        this.commandHandler = new CommandHandler(this);
        this.pendingAnswers = new Map(); // For character creation answers
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        
        this.socket = makeWASocket({
            logger: pino({ level: 'silent' }),
            auth: state,
            printQRInTerminal: false
        });

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('\n📱 Scan QR Code ini dengan WhatsApp:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n');
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect);
                
                if (shouldReconnect) {
                    setTimeout(() => this.connect(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ Bot terhubung ke WhatsApp!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎮 RAGNAROK NEXUS aktif!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━');
            }
        });

        this.socket.ev.on('messages.upsert', async (event) => {
            const message = event.messages[0];
            
            if (!message || message.key.fromMe || event.type !== 'notify') return;

            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
    }

    async handleMessage(message) {
        const userId = message.key.remoteJid;
        const pushName = message.pushName || 'Traveler';
        const phone = userId.split('@')[0];

        // Extract text message
        let text = '';
        if (message.conversation) {
            text = message.conversation;
        } else if (message.extendedTextMessage) {
            text = message.extendedTextMessage.text;
        } else if (message.templateButtonReplyMessage) {
            text = message.templateButtonReplyMessage.selectedId;
        } else if (message.buttonsResponseMessage) {
            text = message.buttonsResponseMessage.selectedButtonId;
        }

        if (!text) return;

        console.log(`[${new Date().toLocaleTimeString()}] ${pushName} (${phone}): ${text}`);

        // Process the message
        const response = await this.commandHandler.processMessage(userId, text, pushName, phone);

        if (response) {
            await this.sendMessage(userId, response);
        }
    }

    async handleCharacterAnswer(userId, answerIndex) {
        // Check if user has active character creation session
        const session = this.characterCreator.sessions.get(userId);
        if (!session) {
            return null;
        }

        const result = this.characterCreator.submitAnswer(userId, answerIndex);
        
        if (result.error) {
            return {
                text: `❌ Error: ${result.error}`
            };
        }

        if (!result.nextStep) {
            // Character creation complete
            const characterData = this.characterCreator.finalizeCharacter(userId);
            
            if (characterData) {
                // Save to database
                await this.db.createUser(userId, '', '', characterData);
                
                return {
                    text: `🎉 *KARAKTER DIBUAT!* 🎉\n\n━━━━━━━━━━━━━━━━━━━━━━━\n👤 Nama: *${characterData.characterName}*\n🧬 Bloodline: *${characterData.bloodline}*\n⚡ Awakening: *${characterData.awakening}*\n🎭 Archetype: *${characterData.archetype}*\n🌟 Fate Mark: *${characterData.fateMark}*\n━━━━━━━━━━━━━━━━━━━━━━━\n\nStat awal:\n💪 STR: ${characterData.stats.str}\n🏃 AGI: ${characterData.stats.agi}\n🧠 INT: ${characterData.stats.int}\n🧘 WIS: ${characterData.stats.wis}\n🛡️ VIT: ${characterData.stats.vit}\n💬 CHA: ${characterData.stats.cha}\n🍀 LCK: ${characterData.stats.lck}\n━━━━━━━━━━━━━━━━━━━━━━━\n\nPetualanganmu dimulai!\n\nKetik *!profile* untuk melihat detail.\nKetik *!explore* untuk mulai berpetualang!\nKetik *!help* untuk bantuan.`,
                    buttons: [
                        { id: 'profile', text: '👤 Lihat Profil' },
                        { id: 'explore', text: '⚔️ Mulai Petualang' },
                        { id: 'help', text: '❓ Bantuan' }
                    ]
                };
            }
        }

        // Get next question
        const nextQuestion = this.characterCreator.getQuestion(userId);
        
        if (nextQuestion && nextQuestion.question) {
            return {
                text: `━━━━━━━━━━━━━━━━━━━━━━━\n**Pertanyaan ${nextQuestion.step}/${nextQuestion.total}**\n\n${nextQuestion.question}\n\n${nextQuestion.options.map(opt => `${opt.id}. ${opt.text}`).join('\n')}\n━━━━━━━━━━━━━━━━━━━━━━━\n\nBalas dengan angka (1-4) untuk memilih.`,
                buttons: nextQuestion.options.map(opt => ({
                    id: opt.id.toString(),
                    text: opt.text.substring(0, 30) + (opt.text.length > 30 ? '...' : '')
                }))
            };
        }

        return null;
    }

    async sendMessage(to, response) {
        const { text, buttons } = response;

        try {
            if (buttons && buttons.length > 0) {
                // Send with buttons (using template message for better compatibility)
                const buttonList = buttons.slice(0, 3).map((btn, idx) => ({
                    buttonId: btn.id,
                    buttonText: { displayText: btn.text },
                    type: 1
                }));

                await this.socket.sendMessage(to, {
                    text: text,
                    buttons: buttonList,
                    headerType: 1
                });
            } else {
                await this.socket.sendMessage(to, {
                    text: text
                });
            }

            console.log(`[BOT] → ${to}: ${text.substring(0, 50)}...`);
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Fallback to plain text if buttons fail
            try {
                await this.socket.sendMessage(to, {
                    text: text
                });
            } catch (fallbackError) {
                console.error('Fallback send also failed:', fallbackError);
            }
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.end();
            console.log('Bot disconnected');
        }
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = RagnarokBot;
