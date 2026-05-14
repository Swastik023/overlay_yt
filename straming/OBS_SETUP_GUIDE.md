# 🎬 OBS Studio Setup Guide

## Quick Setup

### 1. Add Browser Source to OBS

1. Open **OBS Studio**
2. In the **Sources** panel, click **"+"**
3. Select **"Browser"**
4. Name it: `Stream Dashboard`
5. Click **OK**

### 2. Configure Browser Source Properties

| Setting | Value |
|---------|-------|
| **URL** | `http://localhost:5173/?mode=overlay` |
| **Width** | `1920` |
| **Height** | `1080` |
| **FPS** | `30` (or `60` for smoother) |

### 3. Optional Settings

**Custom CSS** (for extra transparency):
```css
body { 
  background-color: rgba(0, 0, 0, 0); 
  margin: 0px auto; 
  overflow: hidden; 
}
```

**Checkboxes:**
- ✅ Shutdown source when not visible
- ✅ Refresh browser when scene becomes active

---

## 🎯 URL Modes

### Overlay Mode (for OBS)
```
http://localhost:5173/?mode=overlay
```
- Transparent background
- Hides placeholder content in center frame
- Optimized for streaming

### Demo Mode (for testing)
```
http://localhost:5173/?mode=demo
```
- Shows all UI elements
- Displays placeholder content
- Good for development/preview

---

## 🖼️ Layout Options

### Full Dashboard (Recommended)
- **Resolution:** 1920x1080
- **Position:** 0, 0 (full screen)
- Shows timer, tasks, music, webcam frame, stats

### Sidebar Only
- **Resolution:** 260x1080
- **Position:** Left (0, 0) or Right (1660, 0)
- Shows only timer, tasks, and music widget

### Bottom Bar Only
- **Resolution:** 1920x100
- **Position:** Bottom (0, 980)
- Shows only stats bar

---

## 🎨 Positioning in OBS

### Option 1: Full Overlay
1. Add browser source with 1920x1080
2. Position it as the top layer
3. Your screen capture goes in the center frame area

### Option 2: Sidebars + Screen Capture
1. Add browser source with 1920x1080
2. Add **Display Capture** or **Window Capture**
3. Position screen capture in the center
4. Resize to fit the center frame area (approximately 1400x900)

### Option 3: Webcam Integration
1. Add browser source
2. Add **Video Capture Device** (your webcam)
3. Position webcam over the webcam frame circle (right sidebar)
4. Resize to fit the circle (approximately 160x160)
5. Add **Chroma Key** filter if needed

---

## 🔧 Troubleshooting

### Dashboard not showing?
- Check if frontend is running: `http://localhost:5173`
- Check if server is running: `http://localhost:4000`
- Refresh the browser source in OBS

### Music widget not updating?
- Make sure you authenticated with Spotify
- Play music on Spotify
- Check server logs for errors

### Background not transparent?
- Make sure you're using `?mode=overlay` in the URL
- Check "Shutdown source when not visible" is enabled
- Try adding the custom CSS

### Performance issues?
- Lower FPS to 30
- Enable "Shutdown source when not visible"
- Close other browser sources when not in use

---

## 🎥 Recommended OBS Scene Setup

### Scene: "Coding Stream"

**Sources (in order, top to bottom):**
1. **Stream Dashboard** (Browser) - 1920x1080
2. **Webcam** (Video Capture Device) - 160x160, positioned over webcam frame
3. **VS Code** (Window Capture) - Positioned in center frame
4. **Background** (optional) - Image or color

---

## ⚙️ Advanced: Multiple Scenes

### Scene 1: Full Dashboard
- Shows everything
- Good for breaks, intro, outro

### Scene 2: Minimal Overlay
- Only sidebars visible
- Maximum screen space for coding

### Scene 3: Focus Mode
- Only timer and music widget
- Minimal distractions

---

## 🎬 Before Going Live Checklist

- [ ] Frontend running (`npm run dev`)
- [ ] Server running (`cd server && node index.js`)
- [ ] Authenticated with Spotify
- [ ] Music playing (to test widget)
- [ ] Browser source added to OBS
- [ ] URL includes `?mode=overlay`
- [ ] Resolution set to 1920x1080
- [ ] Webcam positioned correctly
- [ ] Screen capture positioned in center
- [ ] Test stream to check layout

---

## 🔗 Useful URLs

- **Dashboard (Demo):** http://localhost:5173
- **Dashboard (OBS):** http://localhost:5173/?mode=overlay
- **Spotify Auth:** http://localhost:4000/login
- **Server Status:** Check terminal running `node index.js`

---

## 💡 Pro Tips

1. **Use Scenes:** Create multiple scenes for different stream segments
2. **Hotkeys:** Set up OBS hotkeys for scene switching
3. **Test First:** Always test your layout before going live
4. **Save Backups:** Save your OBS scene collection
5. **Monitor Performance:** Keep an eye on CPU/GPU usage
6. **Backup Tokens:** Keep `server/tokens.json` backed up (but don't commit to git!)

---

## 🎨 Customization Ideas

1. **Change Colors:** Edit `src/index.css` CSS variables
2. **Adjust Layout:** Modify component sizes in `src/App.tsx`
3. **Add Widgets:** Create new components in `src/components/`
4. **Custom Quotes:** Edit quotes array in `src/components/MotivationCard.tsx`
5. **Timer Durations:** Modify `FOCUS_DURATION` and `BREAK_DURATION` in `src/store/useStore.ts`

---

**Happy Streaming! 🎉**
