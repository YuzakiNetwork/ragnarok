# 🌌 RAGNAROK NEXUS - WhatsApp RPG Bot

**WhatsApp RPG Bot dengan sistem Gacha + Roguelike + Geopolitik + Social Engineering**

---

## 📋 Fitur MVP

### ✅ Sudah Diimplementasi:
- **Character Creation System** - 7 pertanyaan psikologis untuk menentukan:
  - 🧬 Bloodline (12 pilihan)
  - ⚡ Awakening (16 elemen)
  - 🎭 Archetype (8 tipe)
  - 🌟 Fate Mark (passive unik)

- **Stat System** - 7 stat dasar:
  - VIT, STR, AGI, INT, WIS, CHA, LCK

- **In-Memory Database** - Data tersimpan selama bot aktif:
  - User profiles & characters
  - Inventory items
  - Guilds & members
  - Kingdoms dengan resources
  
  > 📝 **Note:** Untuk production, ganti dengan SQLite/PostgreSQL

- **Commands**:
  - `!start` / `!register` - Mulai petualangan
  - `!profile` - Lihat karakter
  - `!explore` - Jelajahi dunia (random encounters)
  - `!inventory` - Lihat tas item
  - `!guild create [nama]` - Buat guild
  - `!kingdom create [nama]` - Dirikan kingdom
  - `!help` - Daftar perintah lengkap

- **WhatsApp Integration**:
  - QR Code login
  - Button messages untuk navigasi
  - Auto-reconnect
  - Message handler system

---

## 🚀 Cara Install & Menjalankan

### Prerequisites:
- Node.js v16+
- WhatsApp account (untuk bot)
- Internet connection

### Langkah Install:

```bash
# 1. Clone/navigate ke folder project
cd ragnarok-nexus

# 2. Install dependencies
npm install

# 3. Jalankan bot
npm start
```

### First Run:
1. Bot akan menampilkan **QR Code** di terminal
2. Scan QR dengan WhatsApp (Linked Devices)
3. Bot siap digunakan!

---

## 📁 Struktur Folder

```
ragnarok-nexus/
├── src/
│   ├── index.js              # Entry point
│   ├── Bot.js                # Main bot class
│   ├── database/
│   │   └── Database.js       # In-memory DB (MVP)
│   ├── systems/
│   │   └── CharacterCreator.js  # Character creation logic
│   └── handlers/
│       └── CommandHandler.js    # Command processing
├── data/                     # Untuk SQLite nanti
├── auth_info/                # WhatsApp session (auto-created)
├── package.json
└── README.md
```

**Note:** MVP menggunakan in-memory database untuk kompatibilitas maksimal. Data akan reset saat bot restart. Untuk production, implementasi SQLite sudah tersedia di blueprint.

---

## 🎮 Gameplay Loop (MVP)

1. **Register** → Jawab 7 pertanyaan → Karakter dibuat
2. **Explore** → Random encounters (monster/treasure/NPC)
3. **Collect** → Item masuk inventory
4. **Social** → Buat guild atau kingdom
5. **Progress** → Level up, dapat item langka, bangun kingdom

---

## 🗺️ Roadmap Development

### Phase 1: Foundation ✅ (DONE)
- [x] Project structure
- [x] Database schema
- [x] Character creation
- [x] Basic commands
- [x] WhatsApp integration

### Phase 2: Combat System (Next)
- [ ] Turn-based battle engine
- [ ] Skill system
- [ ] Enemy AI
- [ ] Loot drops
- [ ] EXP & leveling

### Phase 3: Social Features
- [ ] Guild management full features
- [ ] Kingdom politics
- [ ] Player trading
- [ ] Chat system
- [ ] Friend list

### Phase 4: Advanced Systems
- [ ] Daily rituals (time-based events)
- [ ] Quest system (dynamic)
- [ ] Crafting system
- [ ] Economy & marketplace
- [ ] Leaderboards

### Phase 5: Endgame & Events
- [ ] World bosses
- [ ] Server-wide events
- [ ] PvP arena
- [ ] War system
- [ ] Seasonal content

---

## 🔧 Deployment

### Local Development:
```bash
npm run dev    # Auto-reload on changes
npm start      # Normal start
```

### Production (VPS/Pterodactyl):

1. Upload semua file ke server
2. Install dependencies: `npm install --production`
3. Jalankan dengan PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name ragnarok-bot
   pm2 save
   pm2 startup
   ```

### Pterodactyl Panel:
- Egg: Node.js
- Startup: `node src/index.js`
- Port: Tidak perlu (bot WA tidak expose port)
- Storage: Pastikan persisten untuk `data/` dan `auth_info/`

---

## 📊 Database Schema

### Tables:
- **users** - Character data & stats
- **inventory** - Player items
- **guilds** - Guild information
- **guild_members** - Guild membership
- **kingdoms** - Kingdom resources & stats
- **battles** - Battle history
- **quests** - Quest progress

---

## 🎯 Next Steps (Untuk User)

1. **Test bot** - Jalankan dan scan QR
2. **Customize** - Edit pertanyaan, bloodline, dll di `CharacterCreator.js`
3. **Extend** - Tambah command baru di `CommandHandler.js`
4. **Deploy** - Upload ke VPS atau Pterodactyl panel

---

## 💡 Tips Development

- Semua file JavaScript menggunakan **CommonJS** (`require/module.exports`)
- Database auto-create tables saat pertama kali jalan
- Session WhatsApp tersimpan di `auth_info/` (jangan dihapus kalau mau tetap login)
- Button message mungkin terbatas di beberapa WhatsApp client (fallback ke text)

---

## 📞 Support & Contributing

Project ini adalah **MVP** dari blueprint Ragnarok Nexus yang lebih besar. 

Fitur yang masih direncanakan:
- AI integration untuk NPC dialog
- Real-time events dengan cron scheduler
- Advanced combat dengan momentum system
- Full kingdom politics & war system
- Player economy dengan inflation
- Dan masih banyak lagi!

---

> **"Setiap pesan adalah nyawa. Setiap pilihan adalah takdir."**

Developed with ❤️ for the Ragnarok Nexus community.
