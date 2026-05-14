# 🚀 Quick Start - New OBS Overlay

## ✅ What Changed

Your overlay has been **completely redesigned** to match the reference image you provided!

### New Layout:
- **Top Header** - "STUDY WITH ME" with LIVE indicator
- **Left Sidebar** (150px) - Pomodoro timer, tasks, music
- **Right Sidebar** (150px) - Webcam frame, motivation, streak
- **Bottom Bar** (80px) - Stats, goals, progress bars
- **Center Area** - Clean transparent space for screen capture

---

## 🎯 Development Server

**Server is running at:** `http://localhost:5174/`

If you need to restart:

```bash
cd "/home/swastik/Documents/grind/porfolio + projects/obs/straming"
npm run dev
```

---

## 🎬 OBS Setup (5 Steps)

### 1. Open OBS Studio

### 2. Add Browser Source
- Click **+** in Sources
- Select **Browser**
- Name: `Study Overlay`

### 3. Configure Settings
```
URL: http://localhost:5174
Width: 1920
Height: 1080
FPS: 30
```

### 4. Enable Options
- ✅ Shutdown source when not visible
- ✅ Refresh browser when scene becomes active

### 5. Click OK

**Done!** The overlay should fill your entire canvas.

---

## 📹 Add Webcam

1. Add **Video Capture Device** (your webcam)
2. Position it in the **right sidebar frame**
3. Resize to approximately **120×120px**
4. Place at coordinates: **X: 1750, Y: 90**

---

## 🎨 What You'll See

```
┌──────────────────────────────────────────────────────┐
│           STUDY WITH ME                      [LIVE]  │
│         FOCUS • LEARN • BUILD                        │
├────────┬─────────────────────────────────┬──────────┤
│        │                                 │          │
│ Timer  │                                 │ Webcam   │
│ 25:00  │    SCREEN CAPTURE AREA          │ [Frame]  │
│        │    (Your coding screen)         │          │
│ Tasks  │                                 │ Quote    │
│ □ □ □  │                                 │          │
│        │                                 │ Streak   │
│ Music  │                                 │          │
│ 🎵     │                                 │          │
├────────┴─────────────────────────────────┴──────────┤
│  📺 Subs  │  🎯 Goals  │  Progress Bars  │  Stats  │
└──────────────────────────────────────────────────────┘
```

---

## 🎮 Keyboard Shortcuts

- **Space** - Start/Pause timer
- **R** - Reset timer
- **F** - Focus mode
- **B** - Break mode
- **T** - Add task

---

## 🔧 Customization

### Change Timer Duration

Edit `/src/store/useStore.ts`:

```typescript
focusDuration: 25 * 60  // 25 minutes
breakDuration: 5 * 60   // 5 minutes
```

### Change Colors

Edit component files in `/src/components/`:

- Yellow: `#FFC107`
- Cyan: `#22d3ee`
- Red: `#ef4444`

### Adjust Sidebar Width

Edit `App.tsx`:

```typescript
width: '150px'  // Change to your preference
```

---

## 🎯 OBS Transparency Mode

To make the center area fully transparent:

Use this URL in OBS:
```
http://localhost:5174?obs=true
```

This hides the "SCREEN CAPTURE AREA" placeholder.

---

## ✅ Pre-Stream Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] OBS Browser Source added (1920×1080)
- [ ] Overlay fills entire canvas
- [ ] Webcam positioned in right frame
- [ ] Timer starts/stops correctly
- [ ] Tasks can be added/checked
- [ ] All text is readable
- [ ] No layout breaking
- [ ] Test for 5 minutes

---

## 📊 Layout Dimensions

| Section | Size |
|---------|------|
| Canvas | 1920×1080 |
| Top Header | 1920×70 |
| Left Sidebar | 150×930 |
| Center Area | 1620×930 |
| Right Sidebar | 150×930 |
| Bottom Bar | 1920×80 |
| Webcam Frame | 120×120 |

---

## 🆘 Troubleshooting

### Overlay doesn't show
- Check URL: `http://localhost:5174`
- Verify dimensions: 1920×1080
- Refresh browser source

### Layout looks broken
- Clear OBS browser cache
- Restart dev server
- Check browser console (F12)

### Webcam not aligned
- Use Transform tool in OBS
- Position: X=1750, Y=90
- Size: 120×120

---

## 📚 Documentation

- **Full Setup Guide:** `OBS_SETUP_NEW.md`
- **Layout Details:** `LAYOUT_REDESIGN.md`
- **Original Design:** Check reference image

---

## 🎉 You're Ready!

Your overlay is now:
- ✅ Matching the reference design
- ✅ OBS-safe (1920×1080 fixed)
- ✅ Professional streamer aesthetic
- ✅ Clean and minimal
- ✅ Ready for streaming

**Open:** `http://localhost:5174` in your browser to preview!

---

**Server:** Running on port 5174
**Status:** ✅ Ready to stream
**Last Updated:** May 11, 2026
