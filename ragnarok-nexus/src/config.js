// Configuration File for Ragnarok Nexus Bot
// Edit this file to customize your bot settings

require('dotenv').config();

module.exports = {
    // ==================== BOT IDENTITY ====================
    botName: process.env.BOT_NAME || 'RAGNAROK NEXUS',
    botSubtitle: process.env.BOT_SUBTITLE || 'WhatsApp RPG Bot',
    
    // ==================== OWNER SETTINGS ====================
    ownerNumber: process.env.OWNER_NUMBER || '', // Format: 628123456789 (no + or spaces)
    ownerName: process.env.OWNER_NAME || 'Admin',
    
    // ==================== PAIRING CODE SETTINGS ====================
    pairingPhone: process.env.PAIRING_PHONE || '', // Set this to enable pairing code
    usePairingCode: process.env.USE_PAIRING_CODE === 'true' || !!process.env.PAIRING_PHONE,
    
    // ==================== CONNECTION SETTINGS ====================
    sessionId: process.env.SESSION_ID || 'auth_info', // Session folder name
    printQRInTerminal: process.env.PRINT_QR === 'true' ? true : false,
    reconnectOnDisconnect: true,
    reconnectInterval: 5000, // ms
    
    // ==================== DATABASE SETTINGS ====================
    databaseType: process.env.DB_TYPE || 'memory', // 'memory', 'sqlite', 'postgres'
    databasePath: process.env.DB_PATH || './data/ragnarok.db',
    
    // ==================== GAME SETTINGS ====================
    maxPendingSessions: 100, // Max concurrent character creation sessions
    battleTimeLimit: 45, // seconds per turn
    maxGuildMembers: 50,
    maxKingdomMembers: 200,
    
    // ==================== COMBAT SETTINGS ====================
    enableMomentumSystem: true,
    enableCriticalHits: true,
    enableEnvironmentActions: true,
    fleeSuccessRate: 0.7, // 70% base flee chance
    
    // ==================== ECONOMY SETTINGS ====================
    startingGold: 100,
    startingEXP: 0,
    expLossOnDeath: 0.1, // 10% EXP loss on defeat
    goldLossOnDeath: 0.05, // 5% gold loss on defeat
    
    // ==================== ADMIN COMMANDS ====================
    adminOnlyCommands: ['broadcast', 'restart', 'shutdown', 'debug'],
    allowedAdmins: [], // Add phone numbers here for additional admins
    
    // ==================== LOGGING SETTINGS ====================
    logLevel: process.env.LOG_LEVEL || 'info', // 'silent', 'error', 'warn', 'info', 'debug'
    logToFile: process.env.LOG_TO_FILE === 'true' ? true : false,
    logFilePath: process.env.LOG_FILE_PATH || './logs/bot.log',
    
    // ==================== API KEYS (Optional) ====================
    claudeApiKey: process.env.CLAUDE_API_KEY || '', // For AI NPC dialog
    enableAI: process.env.ENABLE_AI === 'true' ? true : false,
    
    // ==================== MISC SETTINGS ====================
    version: '1.0.0',
    timezone: process.env.TIMEZONE || 'Asia/Jakarta',
    
    // Helper function to check if user is owner/admin
    isOwner: function(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        return cleanNumber === this.ownerNumber || this.allowedAdmins.includes(cleanNumber);
    },
    
    // Helper function to get connection info
    getConnectionInfo: function() {
        return {
            hasPairingCode: !!this.pairingPhone,
            hasSession: require('fs').existsSync(this.sessionId),
            usePairing: this.usePairingCode && !require('fs').existsSync(this.sessionId)
        };
    }
};
