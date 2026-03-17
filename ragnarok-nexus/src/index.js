// RAGNAROK NEXUS - WhatsApp RPG Bot
// Main Entry Point

const RagnarokBot = require('./Bot');

console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║      🌌  RAGNAROK NEXUS  🌌           ║
║     WhatsApp RPG Bot - MVP            ║
║                                       ║
╚═══════════════════════════════════════╝

🎮 Memulai bot...
`);

const bot = new RagnarokBot();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⚠️ Menerima sinyal shutdown...');
    bot.disconnect();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n⚠️ Menerima sinyal termination...');
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
