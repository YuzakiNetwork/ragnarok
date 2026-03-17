# 🌌 RAGNAROK NEXUS - Setup Guide

## 📋 Prerequisites
- Node.js v16 atau lebih baru
- WhatsApp account (untuk bot)
- Koneksi internet stabil

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ragnarok-nexus
npm install
```

### 2. Configure Bot
Edit file `.env` sesuai kebutuhanmu:

```bash
# Edit dengan nomor HP kamu (format: kode negara + nomor, tanpa + atau spasi)
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

---

## 🔑 Pairing Code Method (Recommended)

Bot akan otomatis menggunakan **Pairing Code** jika `PAIRING_PHONE` diset di `.env`.

### Langkah-langkah Pairing:

1. **Jalankan bot**:
   ```bash
   npm start
   ```

2. **Tunggu pairing code muncul** di terminal:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━
   🔑 PAIRING CODE GENERATED!
   ━━━━━━━━━━━━━━━━━━━━━━━
   📲 Code: ABCD-1234
   ━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. **Di WhatsApp HP kamu**:
   - Buka WhatsApp
   - Menu → **Linked Devices**
   - Tap **Link a Device**
   - Pilih **"Link with phone number"** (bukan scan QR)
   - Masukkan nomor HP bot: `+628123456789` (sesuai yang di `.env`)
   - Masukkan **pairing code** yang muncul di terminal

4. **Selesai!** Bot akan connect dan menampilkan:
   ```
   ✅ Bot terhubung ke WhatsApp!
   ━━━━━━━━━━━━━━━━━━━━━━━
   🎮 RAGNAROK NEXUS aktif!
   ```

---

## 🔄 Troubleshooting

### Problem: "Koneksi terputus. Reason code: 405"
**Solusi:**
1. Pastikan `PAIRING_PHONE` di `.env` sudah benar (format: `628xxxxxxxxx`)
2. Hapus folder `auth_info`:
   ```bash
   rm -rf auth_info
   ```
3. Restart bot:
   ```bash
   npm start
   ```

### Problem: "Bad session"
**Solusi:**
```bash
rm -rf auth_info
npm start
```

### Problem: Bot tidak merespon command
**Solusi:**
- Pastikan format command benar: `!start`, `!help`, dll (pakai tanda seru `!`)
- Cek apakah user sudah register dengan `!start`

### Problem: Pairing code tidak muncul
**Solusi:**
1. Pastikan `USE_PAIRING_CODE=true` di `.env`
2. Pastikan `PAIRING_PHONE` tidak kosong
3. Hapus folder `auth_info` dan restart

---

## 📱 Testing Commands

Setelah bot connect, test dengan command berikut:

### Character Creation
```
!start
```
Bot akan memberikan 7 pertanyaan psikologis. Jawab dengan angka (1-4).

### Setelah Register
```
!profile      - Lihat karakter kamu
!explore      - Mulai petualangan
!inventory    - Lihat item
!help         - Daftar semua command
```

### Guild & Kingdom
```
!guild create [nama]     - Buat guild
!kingdom create [nama]   - Dirikan kingdom
```

---

## ⚙️ Configuration Options

File: `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_NAME` | RAGNAROK NEXUS | Nama bot |
| `OWNER_NUMBER` | '' | Nomor HP owner (format: 628xxx) |
| `PAIRING_PHONE` | '' | Nomor untuk pairing code |
| `USE_PAIRING_CODE` | true | Enable pairing code mode |
| `SESSION_ID` | auth_info | Nama folder session |
| `DB_TYPE` | memory | Database type: memory, sqlite |
| `LOG_LEVEL` | info | Log level: silent, error, warn, info, debug |

---

## 🛠️ Development Mode

Untuk debugging, set log level ke debug:
```env
LOG_LEVEL=debug
```

Lalu jalankan:
```bash
npm start
```

---

## 📦 Deployment

### VPS Biasa (dengan PM2)
```bash
npm install -g pm2
pm2 start src/index.js --name ragnarok-bot
pm2 save
pm2 startup
```

### Pterodactyl Panel
1. Egg: **Node.js**
2. Startup: `node src/index.js`
3. Pastikan folder `auth_info/` persistent
4. Set environment variables di panel

---

## 🆘 Support

Jika masih ada masalah:
1. Cek file `logs/bot.log` (jika `LOG_TO_FILE=true`)
2. Pastikan Node.js version >= 16
3. Coba reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 🎮 Fitur MVP

✅ Character Creation (7 pertanyaan psikologis)
✅ Combat System (turn-based battle)
✅ Exploration (random encounters)
✅ Guild System
✅ Kingdom System
✅ Inventory Management
✅ Leveling System
✅ Pairing Code Login

🔜 **Coming Soon:**
- Daily Rituals
- Crafting System
- Player Trading
- Kingdom Wars
- AI NPC Dialog

---

> **"Setiap pesan adalah nyawa. Setiap pilihan adalah takdir."** 🌌
