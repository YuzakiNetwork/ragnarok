# 🌌 RAGNAROK NEXUS

**WhatsApp RPG Bot - Turn-Based Combat & Kingdom Politics**

> *"Setiap pesan adalah nyawa. Setiap pilihan adalah takdir."*

---

## 🎯 Overview

RAGNAROK NEXUS adalah WhatsApp RPG Bot dengan sistem:
- **Gacha + Roguelike + Geopolitik + Social Engineering**
- **9 Shards Mitologi** (Norse, Greek, Hindu, Chinese, Lovecraftian, Steampunk, Biblical, Japanese, Void)
- **Character Creation Psikologis** (7 pertanyaan menentukan bloodline, awakening, archetype)
- **Turn-Based Combat** dengan momentum system & environment interaction
- **Kingdom Politics** (user-driven government, war, diplomacy)
- **Real-Time Events** (daily rituals, world boss, server-wide threats)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Bot
Edit file `.env` dan ganti nomor HP:
```bash
nano .env
```

**PENTING:** Ubah baris ini:
```env
PAIRING_PHONE=628123456789  # Ganti dengan nomor HP kamu
OWNER_NUMBER=628123456789   # Ganti dengan nomor HP kamu
```

### 3. Jalankan Bot
```bash
npm start
```

### 4. Pairing Code
Bot akan menampilkan pairing code di terminal. Ikuti instruksi untuk link WhatsApp.

---

## 📱 Commands

### General
- `!start` - Mulai petualangan (character creation)
- `!profile` - Lihat karakter kamu
- `!help` - Daftar semua command

### Adventure
- `!explore` - Jelajahi dunia (random encounters)
- `!inventory` - Lihat item yang dimiliki

### Social
- `!guild create [nama]` - Buat guild
- `!kingdom create [nama]` - Dirikan kingdom

---

## ⚔️ Combat System

Battle turn-based dengan 7 action types:
1. ⚔️ **Attack** - Basic attack dengan crit chance
2. ✨ **Skills** - Gunakan skill sesuai archetype
3. 🧪 **Items** - Pakai potion/buff
4. 🛡️ **Defend** - Gain shield, reset momentum
5. 🔍 **Analyze** - Lihat stats musuh
6. 🌍 **Environment** - Interaksi dengan environment
7. 🏃 **Flee** - Kabur dari battle

**Momentum System:** 5 hit berturut tanpa kena damage = OVERDRIVE mode!

---

## 🎭 Character Creation

User menjawab **7 pertanyaan psikologis** yang menentukan:
- 🧬 **Bloodline** (12 pilihan: Human, Elf Twilight, Dwarf Runeborn, Oni Half-Blood, dll)
- ⚡ **Awakening** (16 elemen: Fire, Water, Lightning, Void, dll)
- 🎭 **Archetype** (8 tipe: Warrior, Mage, Rogue, Support, dll)
- 🌟 **Fate Mark** (passive unik per user)

Stats: VIT, STR, AGI, INT, WIS, CHA, LCK

---

## 🗺️ World Structure

```
AETHERMUNDI
├── 9 Shards (Regional Server)
│   ├── 3-5 Kingdom per Shard
│   │   ├── 8-12 Kota per Kingdom
│   │   └── Dungeon Gates (Rank F → SSS)
│   └── Hidden Realms
└── The Void (End-game zone)
```

**Server-Wide Threat:** THE UNMAKER memakan batas antar-shard. Kalau semua shard menyatu = Ragnarok Nexus (reset total).

---

## ⚙️ Configuration

File: `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_NAME` | RAGNAROK NEXUS | Nama bot |
| `OWNER_NUMBER` | '' | Nomor HP owner |
| `PAIRING_PHONE` | '' | Nomor untuk pairing code |
| `USE_PAIRING_CODE` | true | Enable pairing code |
| `DB_TYPE` | memory | Database: memory, sqlite |
| `LOG_LEVEL` | info | Log level |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **WhatsApp Lib:** Baileys (@whiskeysockets)
- **Database:** SQLite (production) / In-memory (MVP)
- **Scheduler:** node-cron
- **AI:** Claude API (optional, untuk NPC dialog)

---

## 📦 Deployment

### VPS (PM2)
```bash
npm install -g pm2
pm2 start src/index.js --name ragnarok-bot
pm2 save
```

### Pterodactyl Panel
- Egg: Node.js
- Startup: `node src/index.js`
- Persistent folder: `auth_info/`

---

## 🔄 Troubleshooting

### Pairing code tidak muncul
1. Pastikan `PAIRING_PHONE` di `.env` sudah benar
2. Hapus folder `auth_info`: `rm -rf auth_info`
3. Restart bot: `npm start`

### Koneksi terputus (Reason code: 405)
1. Cek format nomor HP (harus: `628xxxxxxxxx`)
2. Hapus `auth_info` dan restart

### Bot tidak merespon
- Pastikan command pakai `!` (contoh: `!start`)
- User harus register dulu dengan `!start`

---

## 🎮 Fitur MVP (Phase 1-2)

✅ Character Creation (7 pertanyaan psikologis)
✅ Combat System (turn-based battle)
✅ Exploration (random encounters)
✅ Guild System (basic)
✅ Kingdom System (basic)
✅ Inventory Management
✅ Leveling System
✅ Pairing Code Login
✅ Config System (.env)

🔜 **Coming Soon (Phase 3+):**
- Daily Rituals (time-based events)
- Crafting System (formula discovery)
- Player Trading (auction house)
- Kingdom Wars (full politics)
- AI NPC Dialog (Claude API)
- Nemesis System
- Legacy System

---

## 📄 License

MIT License - Free for personal & commercial use

---

## 🆘 Support

Baca **SETUP_GUIDE.md** untuk dokumentasi lengkap setup & troubleshooting.

---

> **"Ragnarok Nexus bukan bot RPG. Ini adalah dunia yang kebetulan berjalan di WhatsApp."** 🌌
