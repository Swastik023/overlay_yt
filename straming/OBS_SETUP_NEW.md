# OBS Browser Source Setup Guide

## 🎯 New Layout Overview

This overlay matches your reference design with:

**Layout Structure:**
- **Top Header** (70px) - "LEARN WITH ME" title with LIVE indicator
- **Left Sidebar** (150px) - Pomodoro timer, tasks, music widget
- **Right Sidebar** (150px) - Webcam frame, motivation, streak reminder
- **Bottom Bar** (80px) - Stats, goals, progress bars
- **Center Area** - Clean transparent area for screen capture

**Dimensions:**
- Canvas: 1920×1080 (fullscreen)
- Left sidebar: 150px wide
- Right sidebar: 150px wide
- Center content area: 1620px wide (1920 - 150 - 150)

---

## 🚀 Quick Start

### 1. Start Development Server

```bash
cd "/home/swastik/Documents/grind/porfolio + projects/obs/straming"
npm run dev
```

The server will start at `http://localhost:5173`

### 2. Add Browser Source in OBS

1. Open OBS Studio
2. Click **+** in Sources panel
3. Select **Browser**
4. Name it: `Study Overlay`
5. Configure settings:

```
URL: http://localhost:5173
Width: 1920
Height: 1080
FPS: 30
Custom CSS: (leave empty)
```

6. Check these options:
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active
   - ❌ Control audio via OBS (uncheck)

7. Click **OK**

### 3. Position the Overlay

The overlay should automatically fill the entire canvas at 1920×1080.

**Layer Order (bottom to top):**
1. Screen Capture / Window Capture (your coding screen)
2. Browser Source (this overlay)
3. Webcam (positioned in the right sidebar frame)

---

## 📹 Webcam Positioning

To position your webcam in the designated frame:

1. Add your **Video Capture Device** (webcam)
2. Right-click webcam source → **Transform** → **Edit Transform**
3. Set these values:

```
Position X: 1750
Position Y: 90
Size X: 120
Size Y: 120
```

4. Adjust to fit perfectly in the golden frame on the right sidebar

---

## 🎨 Layout Sections

### Top Header (70px height)
- Centered title: "LEARN WITH ME"
- Subtitle: "FOCUS • LEARN • BUILD"
- LIVE indicator (top-right corner)

### Left Sidebar (150px width)
1. **Pomodoro Timer**
   - Session indicator
   - Focus/Break toggle buttons
   - Circular progress timer (160px)
   - Start/Pause/Reset controls
   - Star rating dots

2. **Today's Plan**
   - Task list (up to 5 tasks)
   - Checkboxes
   - Progress counter (X/Y)

3. **Now Playing**
   - Album art
   - Track name
   - Artist name
   - Animated equalizer

### Right Sidebar (150px width)
1. **Webcam Frame**
   - 120×120px square frame
   - Golden border with corner accents
   - Placeholder for camera feed

2. **Motivation Card**
   - Inspirational quote
   - Yellow accent border

3. **Streak Reminder**
   - Break reminder
   - Cyan accent border

### Bottom Bar (80px height)
- Subscriber count
- Milestones (pomodoros completed)
- Stream goal progress bar
- Daily goal counter
- Focus goal progress bar

---

## 🎯 OBS Transparency Mode

To make the center area fully transparent for screen capture:

Add `?obs=true` to the URL:

```
http://localhost:5173?obs=true
```

This will:
- Make background transparent
- Hide "SCREEN CAPTURE AREA" placeholder text
- Keep all HUD elements visible

---

## ⚙️ Customization

### Change Colors

Edit `/src/components/` files and modify inline styles:

**Yellow accent:** `#FFC107`
**Cyan accent:** `#22d3ee`
**Red (LIVE):** `#ef4444`
**Background:** `#0a0a0f`

### Adjust Sidebar Width

In `App.tsx`, change:
```typescript
width: '150px'  // Left/Right sidebar width
```

### Modify Timer Duration

In your store (`/src/store/useStore.ts`):
```typescript
focusDuration: 25 * 60  // 25 minutes
breakDuration: 5 * 60   // 5 minutes
```

---

## 🔧 Troubleshooting

### Overlay doesn't fill screen
- Check OBS Browser Source dimensions: **1920×1080**
- Verify URL is correct: `http://localhost:5173`
- Refresh the browser source (right-click → Refresh)

### Layout looks broken
- Clear browser cache in OBS
- Restart development server
- Check console for errors (right-click source → Interact → F12)

### Webcam not aligned
- Use OBS Transform tool to position webcam
- Target position: top-right sidebar frame
- Size: 120×120px square

### Performance issues
- Lower FPS to 30 in Browser Source settings
- Disable unused sources
- Check CPU usage in OBS Stats

---

## 📊 Performance Tips

1. **Optimize FPS**
   - Set Browser Source FPS to 30
   - Disable animations if needed

2. **Reduce CPU Usage**
   - Enable "Shutdown source when not visible"
   - Use hardware acceleration in OBS

3. **Stable Streaming**
   - Keep overlay simple
   - Avoid heavy blur effects
   - Test before going live

---

## 🎬 Production Build

For production streaming:

```bash
npm run build
```

Then serve the `dist` folder:

```bash
npm run preview
```

Use the preview URL in OBS: `http://localhost:4173`

---

## 📝 Keyboard Shortcuts

The overlay supports keyboard shortcuts:

- **Space** - Start/Pause timer
- **R** - Reset timer
- **F** - Switch to Focus mode
- **B** - Switch to Break mode
- **T** - Add new task

---

## ✅ Checklist

Before going live:

- [ ] Development server running
- [ ] OBS Browser Source added (1920×1080)
- [ ] Overlay fills entire canvas
- [ ] Webcam positioned correctly
- [ ] Timer working
- [ ] Tasks can be added/checked
- [ ] All text readable
- [ ] No layout breaking
- [ ] Performance stable (30 FPS)
- [ ] Test stream for 5 minutes

---

## 🎯 Final Result

Your overlay should look like:

```
┌─────────────────────────────────────────────────────────────┐
│                    LEARN WITH ME                    [LIVE]  │
│                  FOCUS • LEARN • BUILD                      │
├──────────┬─────────────────────────────────────┬───────────┤
│          │                                     │           │
│ POMODORO │                                     │  WEBCAM   │
│          │                                     │ ┌───────┐ │
│ [Focus]  │                                     │ │       │ │
│          │      SCREEN CAPTURE AREA            │ └───────┘ │
│  25:00   │      (Your coding screen)           │           │
│          │                                     │ MOTIVATION│
│ [Start]  │                                     │           │
│          │                                     │  STREAK   │
│ TASKS    │                                     │           │
│ □ Task 1 │                                     │           │
│ □ Task 2 │                                     │           │
│          │                                     │           │
│ MUSIC    │                                     │           │
│ 🎵 Lofi  │                                     │           │
├──────────┴─────────────────────────────────────┴───────────┤
│  📺 0/3  │  🎯 0  │  🏆 Stream Goal [████░░] 60%  │  Daily │
└─────────────────────────────────────────────────────────────┘
```

---

## 🆘 Support

If you encounter issues:

1. Check browser console (F12 in OBS Interact mode)
2. Verify all dependencies installed: `npm install`
3. Restart development server
4. Clear OBS browser cache
5. Test in regular browser first

---

**Status:** ✅ Ready for streaming!
**Last Updated:** May 11, 2026
**Version:** 2.0 (OBS-Safe Layout)
