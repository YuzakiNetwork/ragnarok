// RAGNAROK NEXUS - WhatsApp RPG Bot
// Main Entry Point

require('dotenv').config();
const RagnarokBot = require('./Bot');
const config = require('./config');

console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║      🌌  RAGNAROK NEXUS  🌌           ║
║     WhatsApp RPG Bot - v${config.version}          ║
║                                       ║
╚═══════════════════════════════════════╝

🎮 Memulai bot...
`);

// Show configuration info
console.log('━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚙️  Configuration:');
console.log(`   Bot Name: ${config.botName}`);
console.log(`   Owner: ${config.ownerName}`);
console.log(`   Pairing Code: ${config.usePairingCode && config.pairingPhone ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`   Database: ${config.databaseType}`);
console.log(`   Log Level: ${config.logLevel}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━\n');

const bot = new RagnarokBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️  Menerima sinyal shutdown...');
    bot.disconnect();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️  Menerima sinyal termination...');
    bot.disconnect();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    bot.disconnect();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    bot.disconnect();
    process.exit(1);
});

// Start the bot
bot.connect().catch((error) => {
    console.error('❌ Gagal memulai bot:', error);
    process.exit(1);
});
