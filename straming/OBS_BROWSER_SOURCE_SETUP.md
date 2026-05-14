# OBS Browser Source Setup Guide 🎥

## 🎯 OPTIMAL SETTINGS

### **Browser Zoom Level**: 100% (Default)
**DO NOT ZOOM** - Keep browser at default 100% zoom for OBS capture.

### **Why No Zoom?**
- OBS captures at exact pixel dimensions
- Zooming causes blurry/pixelated capture
- Layout is designed for 1920×1080 at 100% zoom
- Text sizes are optimized for stream viewers

---

## 📺 OBS BROWSER SOURCE CONFIGURATION

### **Method 1: Browser Source (Recommended)**

1. **Add Browser Source in OBS**:
   - Right-click in Sources → Add → Browser
   - Name: "Stream Dashboard"

2. **Browser Source Settings**:
   ```
   URL: http://localhost:5173/
   Width: 1920
   Height: 1080
   FPS: 30
   
   ✅ Control audio via OBS
   ✅ Shutdown source when not visible
   ✅ Refresh browser when scene becomes active
   
   Custom CSS (optional):
   body { 
     margin: 0; 
     overflow: hidden; 
   }
   ```

3. **Position & Transform**:
   - Position: 0, 0 (top-left)
   - Size: 1920×1080 (full screen)
   - No scaling needed

---

### **Method 2: Window Capture (Alternative)**

If you prefer to see the overlay while working:

1. **Open in Browser**:
   - Navigate to `http://localhost:5173/`
   - Press **F11** for fullscreen
   - Keep zoom at **100%**

2. **Add Window Capture in OBS**:
   - Right-click in Sources → Add → Window Capture
   - Select your browser window
   - Capture method: "Windows 10/11"

3. **Crop if Needed**:
   - Right-click source → Filters → Add → Crop/Pad
   - Remove browser chrome (address bar, etc.)

---

## 🔍 CURRENT FONT SIZES (Optimized for Streaming)

### **Sidebar (280px width)**:
| Element | Font Size | Readable at 1080p? |
|---------|-----------|-------------------|
| Section Labels | 12px | ✅ Yes |
| Sidebar Header | 16px | ✅ Yes |
| Tagline | 10px | ✅ Yes (small but readable) |
| Timer Display | 48px | ✅ Yes (very readable) |
| Timer Label | 12px | ✅ Yes |
| Button Text | 12px | ✅ Yes |
| Task Text | 14px | ✅ Yes |
| Music Title | 14px | ✅ Yes |
| Music Artist | 12px | ✅ Yes |
| Stats Numbers | 24px | ✅ Yes |
| Stats Labels | 10px | ✅ Yes (small but readable) |

### **Header**:
| Element | Font Size | Readable at 1080p? |
|---------|-----------|-------------------|
| Title | 16px | ✅ Yes |
| Time | 14px | ✅ Yes |
| Date | 12px | ✅ Yes |
| LIVE | 10px | ✅ Yes |

---

## 📊 VIEWER EXPERIENCE

### **At 1080p (Full HD)**:
- ✅ All text readable
- ✅ Timer clearly visible
- ✅ Stats easy to see
- ✅ Professional appearance

### **At 720p (HD)**:
- ✅ Most text readable
- ✅ Timer clearly visible
- ⚠️ 10px text may be small
- ✅ Overall good experience

### **At 480p (SD)**:
- ⚠️ Small text harder to read
- ✅ Timer still visible
- ⚠️ Stats labels may be unclear
- ⚠️ Consider larger font sizes if targeting mobile

---

## 🎨 IF TEXT APPEARS TOO SMALL

### **Option 1: Increase Font Sizes (Recommended)**

If viewers complain text is too small, increase these:

```tsx
// Section labels: 12px → 14px
<span className="text-sm font-bold">

// Timer: 48px → 56px
style={{ fontSize: '56px' }}

// Task text: 14px → 16px
<span className="text-base font-medium">

// Stats numbers: 24px → 28px
<span className="text-3xl font-bold">

// Stats labels: 10px → 12px
<span className="text-xs font-bold">
```

---

### **Option 2: CSS Transform Scale (Not Recommended)**

You can scale the entire sidebar, but this may cause blur:

```css
.left-sidebar {
  transform: scale(1.1);
  transform-origin: top left;
}
```

**Downside**: May cause pixelation in OBS

---

### **Option 3: Increase Sidebar Width**

Make sidebar wider for larger text:

```tsx
// 280px → 320px
style={{
  width: '320px',
  minWidth: '320px',
  maxWidth: '320px',
}}
```

**Downside**: Less space for coding area

---

## 🎯 RECOMMENDED SETUP FOR YOUR USE CASE

Based on your reference image, here's the optimal setup:

### **1. Browser Settings**:
- Zoom: **100%** (default)
- Resolution: 1920×1080
- No scaling

### **2. OBS Settings**:
- Browser Source: 1920×1080
- FPS: 30
- No custom scaling

### **3. Font Size Adjustments** (if needed):

If text appears too small for viewers:

```tsx
// Increase these by 2px each:
Section labels: 12px → 14px
Timer: 48px → 52px
Task text: 14px → 16px
Music text: 14px → 16px
Stats numbers: 24px → 26px
```

---

## 📐 TESTING READABILITY

### **Test at Different Resolutions**:

1. **1080p Test**:
   - View stream at 1920×1080
   - Check if all text is readable
   - Verify timer is prominent

2. **720p Test**:
   - View stream at 1280×720
   - Check if small text (10px) is readable
   - Verify overall layout

3. **Mobile Test**:
   - View on phone (portrait)
   - Check if critical info is visible
   - Consider mobile-specific adjustments

---

## 🎬 OBS SCENE SETUP

### **Recommended Layer Order** (bottom to top):

```
Layer 1: Display Capture (your screen/IDE)
Layer 2: Browser Source (this overlay)
Layer 3: Webcam (positioned in golden frame)
Layer 4: Alerts/Notifications (optional)
```

### **Webcam Positioning**:

1. **Add Webcam Source**:
   - Right-click Sources → Add → Video Capture Device
   - Select your webcam

2. **Position in Golden Frame**:
   - Move webcam to bottom-left
   - Match the square golden frame
   - Size: ~254px × 254px (to fit in 280px sidebar)
   - Position: X: 13px, Y: ~826px (adjust to fit)

3. **Crop to Square**:
   - Right-click webcam → Filters → Crop/Pad
   - Crop to 1:1 aspect ratio

---

## 🔧 TROUBLESHOOTING

### **Problem: Text Too Small**
**Solution**: Increase font sizes by 2-4px (see Option 1 above)

### **Problem: Layout Doesn't Fit**
**Solution**: 
- Check browser zoom is 100%
- Verify OBS resolution is 1920×1080
- Check sidebar width is 280px

### **Problem: Blurry Text**
**Solution**:
- Don't use CSS transform scale
- Keep browser zoom at 100%
- Use native font sizes

### **Problem: Webcam Doesn't Fit Frame**
**Solution**:
- Webcam should be ~254px square
- Position at X: 13px, Y: ~826px
- Use crop filter to make square

---

## 📊 COMPARISON: ZOOM LEVELS

| Zoom | Sidebar Width | Text Size | OBS Quality | Recommended? |
|------|---------------|-----------|-------------|--------------|
| 90% | 252px | Smaller | ✅ Sharp | ❌ No |
| 100% | 280px | Normal | ✅ Sharp | ✅ **YES** |
| 110% | 308px | Larger | ⚠️ May blur | ❌ No |
| 125% | 350px | Much larger | ❌ Blurry | ❌ No |

**Verdict**: **Always use 100% zoom** for OBS capture!

---

## 🎯 FINAL RECOMMENDATIONS

### **For Best Results**:

1. ✅ **Browser zoom: 100%** (never change)
2. ✅ **OBS Browser Source: 1920×1080**
3. ✅ **FPS: 30** (smooth enough)
4. ✅ **Current font sizes are good** for 1080p
5. ⚠️ **If text too small**: Increase font sizes by 2-4px
6. ❌ **Don't use CSS scaling** (causes blur)

### **Current Status**:
- ✅ Layout optimized for 1080p streaming
- ✅ Text sizes readable at 100% zoom
- ✅ Sidebar compact (280px)
- ✅ All content fits in viewport
- ✅ Professional appearance

### **If Viewers Say Text is Small**:
- Increase section labels: 12px → 14px
- Increase timer: 48px → 52-56px
- Increase task text: 14px → 16px
- Keep sidebar at 280px

---

## 🎨 QUICK FONT SIZE ADJUSTMENT

If you want to make everything slightly larger without changing layout:

```tsx
// Add this to index.css:
.left-sidebar {
  font-size: 1.1em; /* 10% larger */
}

// Or increase specific elements:
.text-xs { font-size: 0.8125rem; } /* 13px instead of 12px */
.text-sm { font-size: 0.9375rem; } /* 15px instead of 14px */
.text-base { font-size: 1.0625rem; } /* 17px instead of 16px */
```

---

## ✅ CHECKLIST

Before going live:

- [ ] Browser zoom at 100%
- [ ] OBS Browser Source: 1920×1080
- [ ] All text readable in OBS preview
- [ ] Webcam positioned in golden frame
- [ ] Test at 1080p and 720p
- [ ] Check mobile view (optional)
- [ ] Verify timer is prominent
- [ ] Confirm stats are readable

---

**Status**: Ready to stream at **100% zoom**! 🚀

**If text appears too small**: Let me know and I'll increase font sizes by 2-4px across the board.
