# 🚀 START HERE — Quick Setup for Super Productivity Overlay

> **TL;DR**: Your overlay code is fine. The issue is Super Productivity's REST API isn't running or enabled. Follow the 3 steps below to fix it!

---

## ⚡ Quick Start (3 Terminals)

### 1️⃣ Terminal 1: Start Angular Frontend
```bash
cd /Users/swastik/Documents/yt/super-productivity-master
npm run startFrontend
```
**Wait for**: `✔ Compiled successfully` (takes 30-60 seconds)

### 2️⃣ Terminal 2: Start Electron App
```bash
cd /Users/swastik/Documents/yt/super-productivity-master
npm start
```
**Then**: Settings → Misc → Turn ON "Enable Local REST API"

### 3️⃣ Terminal 3: Start Overlay
```bash
cd /Users/swastik/Documents/yt/super-productivity-master/overlay_yt-main/straming
./start-overlay.sh
```
**Or**: `npm run dev` (starts on http://localhost:5173)

---

## ✅ Verify It's Working

Open: **http://localhost:5173?diagnostics=true**

You should see all green checkmarks (✅):
- Hook Status: **connected**
- SSE Endpoint: **✅ SSE Connected**
- All API endpoints: **✅ OK**

If you see any ❌ red errors, the diagnostic page will tell you exactly what to fix!

---

## 🎥 Add to OBS

1. **Add Source** → Browser Source
2. **URL**: `http://localhost:5173?obs=true`
3. **Width**: 1920, **Height**: 1080
4. ✅ Check "Shutdown source when not visible"

---

## 🐛 Troubleshooting

### Problem: "404 on /sp/events" in console
**Fix**: Enable Local REST API in Super Productivity (Settings → Misc)

### Problem: "ERR_CONNECTION_REFUSED" in Electron
**Fix**: Start Angular frontend (`npm run startFrontend`) BEFORE Electron (`npm start`)

### Problem: Tasks not showing
**Fix**: Tag tasks with "TODAY" in Super Productivity (use "Schedule for Today")

### Problem: Overlay shows "SP Offline"
**Fix**: Check diagnostics page (http://localhost:5173?diagnostics=true) for details

---

## 📚 More Documentation

- **SETUP-GUIDE.md** — Detailed step-by-step instructions
- **FIXES-APPLIED.md** — What was fixed and why
- **README.md** — Complete feature list and architecture docs

---

## 🆘 Still Having Issues?

1. Open http://localhost:5173?diagnostics=true
2. Screenshot the entire page
3. Check browser console (F12) for errors
4. Read the error messages — they tell you exactly what's wrong!

The diagnostic page is your best friend for troubleshooting! 🎯
