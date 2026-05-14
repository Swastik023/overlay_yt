# 🎵 Spotify Integration - Quick Start

**⏱️ Setup Time: 3 minutes**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Access Token (1 min)

1. Open: https://developer.spotify.com/console/get-users-currently-playing-track/
2. Click **"Get Token"**
3. Click **"Request Token"**
4. Copy the token (starts with `BQD...`)

### Step 2: Add Token to Overlay (1 min)

1. Open your overlay: `http://localhost:5174`
2. Click the **Spotify button** (bottom-right, green/yellow circle)
3. Paste your token
4. Click **"Connect Spotify"**

### Step 3: Test (1 min)

1. Play a song in Spotify
2. Wait 5 seconds
3. See your song appear in the overlay! 🎉

---

## ✅ What You'll See

```
┌─────────────────────────┐
│ 🎵 NOW PLAYING          │
├─────────────────────────┤
│ [Album] Song Name       │
│         Artist Name     │
│ ▂▄▅▇▅▄▂ (green bars)    │
└─────────────────────────┘
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not Connected" | Add your access token |
| "Token Expired" | Get a new token (Step 1) |
| "Nothing Playing" | Play music in Spotify |
| No album art | Some tracks don't have art |

---

## 📚 Need More Help?

- **Full Setup Guide:** `SPOTIFY_SETUP.md`
- **Technical Details:** `SPOTIFY_INTEGRATION_SUMMARY.md`

---

## ⚡ Pro Tips

- ✅ Token lasts **1 hour** - refresh before long streams
- ✅ Updates every **5 seconds** - not instant
- ✅ Works with **Spotify Premium** (best experience)
- ✅ Shows **any device** - phone, desktop, etc.

---

**That's it! You're ready to stream with live music info! 🎵**
