# OBS Webcam Positioning Guide 📹

## 🎯 WEBCAM FRAME LOCATION

Your overlay has a **square golden webcam frame** at the bottom of the left sidebar.

### **Frame Specifications**:
- **Location**: Bottom-left of screen
- **Shape**: Square (1:1 aspect ratio)
- **Size**: ~268px × 268px (at 1920×1080)
- **Border**: 2px golden border
- **Position**: Inside 300px sidebar

---

## 📐 EXACT POSITIONING

### **Webcam Frame Coordinates** (at 1920×1080):

```
┌─────────────────────────────────────────────────────────┐
│ Header (60px)                                           │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│ Sidebar      │   Center Frame                          │
│ 300px        │   1620px                                │
│              │                                          │
│ [Timer]      │                                          │
│ [Tasks]      │                                          │
│ [Music]      │                                          │
│ [Stats]      │                                          │
│              │                                          │
│ ┌──────────┐ │                                          │
│ │ WEBCAM   │ │  ← Webcam frame here                    │
│ │ 268×268  │ │                                          │
│ └──────────┘ │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### **Calculated Position**:
- **X Position**: 16px (left padding)
- **Y Position**: ~792px (from top)
- **Width**: 268px
- **Height**: 268px
- **Aspect Ratio**: 1:1 (square)

---

## 🎥 OBS WEBCAM SETUP

### **Step 1: Add Webcam Source**

1. In OBS, right-click **Sources** panel
2. Click **Add** → **Video Capture Device**
3. Name it: "Webcam"
4. Select your webcam device
5. Click **OK**

---

### **Step 2: Position Webcam**

#### **Method A: Manual Positioning** (Recommended)

1. **Resize webcam** to square:
   - Right-click webcam source → **Transform** → **Edit Transform**
   - Set **Size**: 268 × 268
   - Check **Bounding Box Type**: Scale to inner bounds
   - Click **Close**

2. **Position webcam**:
   - Drag webcam to bottom-left
   - Align with golden frame in overlay
   - Fine-tune position:
     - **X**: 16
     - **Y**: 792

3. **Crop to square** (if needed):
   - Right-click webcam → **Filters**
   - Click **+** → **Crop/Pad**
   - Adjust **Left/Right/Top/Bottom** to make square
   - Click **Close**

---

#### **Method B: Exact Transform Values**

Right-click webcam → **Transform** → **Edit Transform**

```
Position:
  X: 16
  Y: 792

Size:
  Width: 268
  Height: 268

Bounding Box Type: Scale to inner bounds
Alignment: Center
```

Click **Close**

---

### **Step 3: Layer Order**

Ensure correct layer order (bottom to top):

```
1. Display Capture (your screen)
2. Browser Source (overlay at http://localhost:5173)
3. Webcam (positioned in golden frame)
4. Alerts/Notifications (optional)
```

**Important**: Webcam must be **above** the overlay layer!

---

## 🎨 WEBCAM STYLING OPTIONS

### **Option 1: Square Webcam** (Current)
- Matches the golden frame
- Clean, modern look
- Easy to position

### **Option 2: Circular Webcam**
Add a **Mask/Blend** filter:
1. Right-click webcam → **Filters**
2. Click **+** → **Image Mask/Blend**
3. Type: **Alpha Mask (Color Channel)**
4. Path: Create a circular mask image
5. Click **Close**

### **Option 3: Rounded Corners**
Add a **Corner Radius** filter (if available in your OBS version):
1. Right-click webcam → **Filters**
2. Click **+** → **Corner Radius**
3. Set radius: 12-16px
4. Click **Close**

---

## 📊 WEBCAM SIZE VARIATIONS

Depending on your preference:

| Size | Width × Height | Position Y | Notes |
|------|---------------|------------|-------|
| **Small** | 220×220 | ~820 | More space for sidebar |
| **Medium** | 268×268 | ~792 | **Current (recommended)** |
| **Large** | 300×300 | ~760 | Fills sidebar width |

---

## 🔧 TROUBLESHOOTING

### **Problem: Webcam doesn't fit frame**
**Solution**: 
- Check webcam size is 268×268
- Verify position X: 16, Y: 792
- Use crop filter to make square

### **Problem: Webcam is behind overlay**
**Solution**:
- Move webcam layer **above** Browser Source
- Check layer order in Sources panel

### **Problem: Webcam aspect ratio wrong**
**Solution**:
- Right-click → Transform → Edit Transform
- Set Bounding Box Type: "Scale to inner bounds"
- Manually set size to 268×268

### **Problem: Webcam quality is poor**
**Solution**:
- In webcam properties, set resolution to 1080p
- Increase bitrate in OBS settings
- Ensure good lighting

---

## 🎯 ALTERNATIVE LAYOUTS

### **Option A: No Webcam in Overlay**
If you prefer webcam elsewhere:
- Position webcam in **bottom-right** of screen
- Size: 300×300 or 400×400
- Add circular mask for modern look

### **Option B: Webcam in Center**
For face-cam focused streams:
- Position webcam in **center-bottom**
- Size: 400×400 or larger
- Overlay frames it with golden border

### **Option C: Picture-in-Picture**
For tutorial-style streams:
- Position webcam in **top-right** of center frame
- Size: 300×300
- Add drop shadow for depth

---

## 📐 PRECISE MEASUREMENTS

### **At 1920×1080 Resolution**:

```
Sidebar: 300px wide
Padding: 16px (left/right)
Available width: 268px

Webcam frame:
  Inner width: 268px
  Inner height: 268px
  Border: 2px golden
  Total frame: 272×272px

Webcam source:
  Size: 268×268px
  Position: (16, 792)
  Fits perfectly inside frame
```

---

## 🎬 COMPLETE OBS SCENE SETUP

### **Scene: "Coding Stream"**

**Sources (bottom to top)**:
1. **Display Capture**
   - Name: "Screen"
   - Capture: Full screen or specific display
   - Position: (0, 0)
   - Size: 1920×1080

2. **Browser Source**
   - Name: "Overlay"
   - URL: http://localhost:5173
   - Width: 1920
   - Height: 1080
   - FPS: 30
   - Position: (0, 0)

3. **Video Capture Device**
   - Name: "Webcam"
   - Device: Your webcam
   - Size: 268×268
   - Position: (16, 792)
   - Crop: To square if needed

4. **Audio Input Capture** (optional)
   - Name: "Microphone"
   - Device: Your mic

---

## 🎨 WEBCAM ENHANCEMENTS

### **Add Glow Effect**:
1. Right-click webcam → **Filters**
2. Click **+** → **Color Correction**
3. Increase **Contrast**: +0.1
4. Increase **Saturation**: +0.1
5. Click **Close**

### **Add Border Glow**:
The overlay already has a golden border, but you can enhance it:
1. Right-click webcam → **Filters**
2. Click **+** → **Shader** (if available)
3. Add glow shader
4. Match golden color: #facc15

### **Add Background Blur**:
If you want to blur your background:
1. Right-click webcam → **Filters**
2. Click **+** → **Background Removal** (requires plugin)
3. Or use virtual background in webcam software

---

## 📊 WEBCAM QUALITY SETTINGS

### **Recommended Settings**:

**In Webcam Properties**:
- Resolution: **1920×1080** or **1280×720**
- FPS: **30** (matches stream)
- Auto-focus: **On**
- Auto-exposure: **On** (or manual if you have good lighting)

**In OBS Video Settings**:
- Base Resolution: **1920×1080**
- Output Resolution: **1920×1080**
- FPS: **30**

**Lighting Tips**:
- Use ring light or key light
- Position light in front of you
- Avoid backlighting (window behind you)
- Use 3-point lighting for best results

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] Webcam added to OBS
- [ ] Webcam size: 268×268
- [ ] Webcam position: (16, 792)
- [ ] Webcam cropped to square
- [ ] Webcam layer above overlay
- [ ] Webcam fits golden frame
- [ ] Webcam quality: 1080p/720p
- [ ] Good lighting setup
- [ ] Test stream preview
- [ ] Check all layers visible

---

## 🎯 QUICK REFERENCE

**Webcam Specs**:
- Size: **268×268 pixels**
- Position: **X: 16, Y: 792**
- Aspect: **1:1 (square)**
- Layer: **Above overlay**
- Quality: **1080p/720p**

**Golden Frame**:
- Location: **Bottom-left sidebar**
- Border: **2px golden (#facc15)**
- Inner size: **268×268px**
- Padding: **16px from edges**

---

## 🚀 READY TO STREAM!

Your webcam is now perfectly positioned in the golden frame at the bottom-left of your overlay. The square format matches modern streaming aesthetics and keeps the focus on your code while maintaining a personal connection with viewers.

**Pro Tip**: Test your webcam position by starting a recording in OBS and checking if it aligns perfectly with the golden frame!
