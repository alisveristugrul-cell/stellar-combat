# 🚀 Stellar Combat RPG

**Vibe Jam 2026** — Uzay Savaş Oyunu

Birinci şahıs kokpit görüşlü, çok oyunculu uzay savaş oyunu. NPC botlar kendi aralarında ve sana karşı savaşır. Seviye atla, gemini güçlendir!

---

## 🎮 Nasıl Açılır?

### Gereksinimler
- **Node.js** (v18 veya üstü) — [nodejs.org](https://nodejs.org) adresinden indir

### Kurulum (ilk seferde)

1. Terminal (macOS) veya Komut İstemi (Windows) aç
2. Bu klasöre git:
   ```bash
   cd stellar-combat-rpg
   ```
3. Bağımlılıkları kur:
   ```bash
   npm install
   ```

### Oyunu Başlat

```bash
npm run dev
```

Bu komut hem oyun sunucusunu hem de web arayüzünü başlatır.

4. Tarayıcıda şu adrese git:
   ```
   http://localhost:5173
   ```

5. **ENTER COCKPIT** butonuna tıkla ve oyna!

---

## 🕹️ Kontroller

| Tuş | Aksiyon |
|-----|---------|
| **W** | İleri git (gaz ver) |
| **S** | Yavaşla / Geri |
| **A** | Sola kay |
| **D** | Sağa kay |
| **Mouse** | Bakış yönü (yaw/pitch) |
| **Sol Tık (basılı tut)** | Otomatik ateş |
| **Sağ Tık (basılı tut)** | Zoom / Nişan al |
| **1, 2, 3 veya Scroll** | Silah değiştir |
| **ESC** | Mouse'u serbest bırak |

---

## ⚔️ Silahlar

| # | Silah | Hasar | Hız | Cooldown |
|---|-------|-------|-----|----------|
| 1 | **LASER** | 10 | Çok Hızlı | 0.15s |
| 2 | **PLASMA** | 35 | Orta | 0.6s |
| 3 | **RAILGUN** | 80 | Çok Hızlı | 2.0s |

---

## 🤖 Bot Sistemi

- **20 NPC savaşçı** — 3 takım (Kırmızı, Mavi, Yeşil)
- Kendi aralarında savaşırlar
- **AI Durumları:** Devriye, Hücum, Strafe, Kaçış, Dalış bombalaması
- Start'a basana kadar sana saldırmazlar
- 3 saniye spawn koruması

---

## 📈 RPG Sistemi

- Düşman öldürerek **XP** kazan
- Her level'da **yükseltme** seç:
  - **+DMG** — Silah hasarı artır
  - **+HULL** — Maksimum can artır
  - **+FIRE RATE** — Ateş hızı artır
- Maksimum **Level 50**

---

## 🌌 Özellikler

- Galaktik uzay ortamı (nebulalar, gezegenler, galaksi diski)
- 3D kokpit görünümü
- Prosedürel ses efektleri (lazer, patlama, hasar, level up)
- Gerçek zamanlı çok oyunculu (aynı ağdaki arkadaşlarınla oyna)
- RPG seviye ve yükseltme sistemi

---

## 🌐 Arkadaşınla Oynamak

Aynı Wi-Fi ağındaysanız:

1. Sunucuyu başlatan kişi terminalden IP adresini öğrensin:
   ```bash
   # macOS
   ipconfig getifaddr en0
   
   # Windows
   ipconfig
   ```
2. Diğer kişi tarayıcıda şu adrese gitsin:
   ```
   http://[IP_ADRESİ]:5173
   ```

---

**Vibe Jam 2026 🎮**
