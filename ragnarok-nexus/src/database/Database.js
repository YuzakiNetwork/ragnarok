// Simple in-memory database for MVP (compatible with all systems)
// Can be replaced with SQLite/better-sqlite3 when deployed

class Database {
    constructor() {
        this.users = new Map();
        this.inventory = new Map();
        this.guilds = new Map();
        this.kingdoms = new Map();
        this.battles = [];
        this.quests = new Map();
        
        console.log('✅ In-memory database initialized');
        console.log('📝 Note: Data will reset on restart (MVP mode)');
    }

    // User operations
    async createUser(userId, username, phone, characterData) {
        const user = {
            user_id: userId,
            username: username || '',
            phone: phone || '',
            registered_at: new Date().toISOString(),
            character_name: characterData.characterName,
            bloodline: characterData.bloodline,
            awakening: characterData.awakening,
            archetype: characterData.archetype,
            fate_mark: characterData.fateMark,
            level: 1,
            exp: 0,
            hp: 100,
            max_hp: 100,
            mp: 50,
            max_mp: 50,
            vit: characterData.stats.vit || 5,
            str: characterData.stats.str || 5,
            agi: characterData.stats.agi || 5,
            int: characterData.stats.int || 5,
            wis: characterData.stats.wis || 5,
            cha: characterData.stats.cha || 5,
            lck: characterData.stats.lck || 5,
            current_shard: 'Yggdrasil',
            current_location: 'Starter Village',
            is_alive: 1,
            last_active: new Date().toISOString()
        };
        
        this.users.set(userId, user);
        return { success: true, userId };
    }

    async getUser(userId) {
        return this.users.get(userId) || null;
    }

    async updateUserStats(userId, stats) {
        const user = this.users.get(userId);
        if (!user) return { success: false, error: 'User not found' };
        
        Object.assign(user, stats, { last_active: new Date().toISOString() });
        this.users.set(userId, user);
        return { success: true };
    }

    // Guild operations
    async createGuild(guildName, leaderId) {
        if (this.guilds.has(guildName)) {
            throw new Error('Guild already exists');
        }
        
        const guild = {
            id: this.guilds.size + 1,
            guild_name: guildName,
            leader_id: leaderId,
            created_at: new Date().toISOString(),
            kingdom_id: null,
            level: 1,
            exp: 0
        };
        
        this.guilds.set(guildName, guild);
        return { success: true, guildId: guild.id };
    }

    async getGuild(guildName) {
        return this.guilds.get(guildName) || null;
    }

    // Kingdom operations
    async createKingdom(kingdomName, rulerId, shard) {
        if (this.kingdoms.has(kingdomName)) {
            throw new Error('Kingdom already exists');
        }
        
        const kingdom = {
            id: this.kingdoms.size + 1,
            kingdom_name: kingdomName,
            ruler_id: rulerId,
            shard: shard || 'Yggdrasil',
            food: 1000,
            gold: 5000,
            morale: 50,
            stability: 50,
            research: 0,
            created_at: new Date().toISOString()
        };
        
        this.kingdoms.set(kingdomName, kingdom);
        return { success: true, kingdomId: kingdom.id };
    }

    async getKingdom(kingdomName) {
        return this.kingdoms.get(kingdomName) || null;
    }

    // Inventory operations
    async addItem(userId, itemName, itemType = 'consumable', quantity = 1, rarity = 'common') {
        const key = `${userId}_${itemName}`;
        const existing = this.inventory.get(key);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.inventory.set(key, {
                id: this.inventory.size + 1,
                user_id: userId,
                item_name: itemName,
                item_type: itemType,
                quantity,
                rarity
            });
        }
    }

    async getInventory(userId) {
        const items = [];
        for (const [key, item] of this.inventory.entries()) {
            if (item.user_id === userId) {
                items.push(item);
            }
        }
        return items;
    }

    // Close connection (no-op for in-memory)
    close() {
        console.log('📝 Database closed (in-memory data lost)');
    }
}

module.exports = Database;
