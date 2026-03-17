// Main Bot Class - WhatsApp connection and message handling

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const Database = require('./database/Database');
const CharacterCreator = require('./systems/CharacterCreator');
const CommandHandler = require('./handlers/CommandHandler');
const config = require('./config');

// Browser fingerprint for better compatibility
const BROWSER_CONFIG = ['Ragnarok Nexus', 'Chrome', '120.0.0.0'];

class RagnarokBot {
    constructor() {
        this.socket = null;
        this.db = new Database();
        this.characterCreator = CharacterCreator;
        this.commandHandler = new CommandHandler(this);
        this.pendingAnswers = new Map(); // For character creation answers
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async connect() {
        if (this.isConnecting) {
            console.log('⏳ Already connecting...');
            return;
        }
        
        this.isConnecting = true;
        
        // Check if session exists
        const sessionExists = fs.existsSync(config.sessionId);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📱 ${config.botName} - ${config.botSubtitle}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (!sessionExists && config.usePairingCode && config.pairingPhone) {
            console.log('\n🔑 PAIRING CODE MODE ACTIVATED');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📞 Phone:', config.pairingPhone);
            console.log('⏳ Generating pairing code...\n');
        } else if (sessionExists) {
            console.log('\n✅ Session found. Connecting with saved credentials...');
        } else {
            console.log('\n⚠️  No session found. Will show QR Code.');
        }
        
        const { state, saveCreds } = await useMultiFileAuthState(config.sessionId);
        
        this.socket = makeWASocket({
            logger: pino({ level: config.logLevel === 'debug' ? 'debug' : 'silent' }),
            auth: state,
            printQRInTerminal: !config.usePairingCode || !config.pairingPhone,
            browser: BROWSER_CONFIG,
            markOnlineOnConnect: true,
            syncFullHistory: false
        });

        this.socket.ev.on('creds.update', saveCreds);

        this.socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, pairingCode } = update;

            // Show QR Code if available and pairing code not enabled
            if (qr && (!config.usePairingCode || !config.pairingPhone)) {
                console.log('\n📱 Scan QR Code ini dengan WhatsApp:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n');
            }

            // Show Pairing Code if available
            if (pairingCode && config.usePairingCode && config.pairingPhone && !sessionExists) {
                console.log('\n━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🔑 PAIRING CODE GENERATED!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`📲 Code: ${pairingCode}`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━\n');
                console.log('📝 Cara menggunakan:');
                console.log('1. Buka WhatsApp di HP kamu');
                console.log('2. Menu → Linked Devices');
                console.log('3. Link a Device');
                console.log('4. Pilih "Link with phone number"');
                console.log(`5. Masukkan nomor: +${config.pairingPhone}`);
                console.log('6. Masukkan pairing code di atas');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━\n');
                console.log('⏳ Menunggu pairing selesai...');
            }

            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                console.log('❌ Koneksi terputus.');
                
                if (statusCode) {
                    console.log(`   Reason code: ${statusCode}`);
                }
                
                this.isConnecting = false;
                
                // Handle different disconnect reasons
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('🚫 Session logged out. Delete auth_info folder and restart to create new session.');
                    return;
                }
                
                if (statusCode === DisconnectReason.badSession) {
                    console.log('🚫 Bad session. Deleting session and restarting...');
                    try {
                        fs.rmSync(config.sessionId, { recursive: true, force: true });
                    } catch (e) {
                        // Ignore
                    }
                    setTimeout(() => {
                        this.reconnectAttempts = 0;
                        this.connect();
                    }, 2000);
                    return;
                }
                
                if (shouldReconnect && config.reconnectOnDisconnect) {
                    this.reconnectAttempts++;
                    
                    if (this.reconnectAttempts > this.maxReconnectAttempts) {
                        console.log(`🚫 Max reconnect attempts (${this.maxReconnectAttempts}) reached. Please restart manually.`);
                        return;
                    }
                    
                    const delay = config.reconnectInterval * this.reconnectAttempts; // Exponential backoff
                    console.log(`⏳ Reconnecting in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => this.connect(), delay);
                }
            } else if (connection === 'open') {
                console.log('\n✅ Bot terhubung ke WhatsApp!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(`🎮 ${config.botName} aktif!`);
                console.log(`👤 Owner: ${config.ownerName} (${config.ownerNumber || 'Not set'})`);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━\n');
                this.isConnecting = false;
                this.reconnectAttempts = 0; // Reset on successful connection
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
        
        // Handle connection errors
        this.socket.ev.on('connection.error', (error) => {
            console.error('❌ Connection error:', error.message);
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
