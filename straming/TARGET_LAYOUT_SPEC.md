# Target Layout Specification 🎯

## 📐 CANVAS SIZE
**1920 × 1080 (16:9)**

---

## 🎨 LAYOUT STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                   TOP STRIP → 1600 × 90                                 │
│                                                                          │
│  ◉ LIVE                                                                  │
│  LEARN WITH ME — Deep Focus Session                                      │
│                                                                          │
│  ⏰ 01:14 PM  •  🎵 Not Playing  •  🍅 00  ☕ 00  🔥 12 Days             │
│                                                                          │
├────────────────┬─────────────────────────────────────────────────────────┤
│                │                                                         │
│  LEFT HUD      │                                                         │
│  320 × 900     │                                                         │
│                │                                                         │
│  FOCUS MODE    │                                                         │
│  STAY PRODUCTIVE                                                         │
│                │                                                         │
│  ┌──────────┐  │                                                         │
│  │  FOCUS   │  │                                                         │
│  │  BREAK   │  │                                                         │
│  │ 25:00    │  │                                                         │
│  │ Start ▶  │  │                                                         │
│  └──────────┘  │                                                         │
│                │                                                         │
│  TASKS         │              MAIN SCREEN SHARE                          │
│                │                                                         │
│  • LeetCode    │                 1600 × 900                              │
│  • System Des. │                    TRUE 16:9                            │
│  • DevOps Rev. │                                                         │
│  • AI Research │                                                         │
│  • Project     │                                                         │
│                │                                                         │
│  Progress 1/5  │                                                         │
│                │                                                         │
│  WEBCAM        │                                                         │
│  OBS Webcam    │                                                         │
│  ┌──────────┐  │                                                         │
│  │          │  │                                                         │
│  │ Webcam   │  │                                                         │
│  │          │  │                                                         │
│  └──────────┘  │                                                         │
│                │                                                         │
└────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 📊 DIMENSIONS

### **Canvas**:
- Width: **1920px**
- Height: **1080px**
- Aspect: **16:9**

### **Top Strip**:
- Width: **1600px** (centered, 160px margin left/right)
- Height: **90px**
- Position: Top of screen
- Aspect: **16:0.9**

### **Left Sidebar**:
- Width: **320px**
- Height: **900px** (1080 - 90 - 90 bottom margin)
- Position: Left edge, below top strip
- Aspect: **1:2.8**

### **Main Content Area**:
- Width: **1600px**
- Height: **900px**
- Position: Right of sidebar, below top strip
- Aspect: **TRUE 16:9** ✅

---

## 📐 POSITIONING

### **Top Strip**:
```
X: 160px (centered)
Y: 0px
Width: 1600px
Height: 90px
```

### **Left Sidebar**:
```
X: 0px
Y: 90px
Width: 320px
Height: 990px (to bottom)
```

### **Main Content**:
```
X: 320px
Y: 90px
Width: 1600px
Height: 990px
```

---

## 🎯 SCREEN COVERAGE

### **Main Content**:
- Area: 1600 × 990 = 1,584,000 px²
- Percentage: **76.4%** of screen

### **Overlay (Top + Sidebar)**:
- Top Strip: 1600 × 90 = 144,000 px²
- Sidebar: 320 × 990 = 316,800 px²
- Total Overlay: 460,800 px²
- Percentage: **23.6%** of screen

### **Ratio**:
- Main: **77%**
- Overlay: **23%**

---

## 🎨 TOP STRIP CONTENT

### **Line 1** (40px height):
```
◉ LIVE  │  LEARN WITH ME — Deep Focus Session
```

### **Line 2** (40px height):
```
⏰ 01:14 PM  •  🎵 Not Playing  •  🍅 00  ☕ 00  🔥 12 Days
```

### **Spacing**:
- Padding: 16px top/bottom
- Gap between lines: 10px
- Total height: 16 + 40 + 10 + 40 + 16 = **122px** (need to reduce to 90px)

### **Optimized for 90px**:
- Padding: 12px top/bottom
- Line 1: 30px
- Gap: 6px
- Line 2: 30px
- Total: 12 + 30 + 6 + 30 + 12 = **90px** ✅

---

## 🎨 LEFT SIDEBAR CONTENT

### **Sections** (990px total height):

1. **Sidebar Header** (~50px)
   - "FOCUS MODE"
   - "STAY PRODUCTIVE"

2. **Timer Section** (~250px)
   - Focus/Break toggle
   - Circular timer (150px)
   - Start/Pause buttons

3. **Tasks Section** (~400px)
   - Task list (scrollable)
   - Progress bar

4. **Webcam Section** (~290px)
   - WEBCAM label
   - Square webcam frame

**Total**: 50 + 250 + 400 + 290 = **990px** ✅

---

## 📏 EXACT MEASUREMENTS

### **Top Strip**:
```css
position: fixed;
top: 0;
left: 160px;
width: 1600px;
height: 90px;
```

### **Left Sidebar**:
```css
position: fixed;
top: 90px;
left: 0;
width: 320px;
height: calc(100vh - 90px); /* 990px */
```

### **Main Content**:
```css
position: fixed;
top: 90px;
left: 320px;
width: 1600px;
height: calc(100vh - 90px); /* 990px */
```

---

## 🎯 KEY REQUIREMENTS

1. **Top Strip**: 1600px wide, 90px tall, centered
2. **Left Sidebar**: 320px wide, full height below top
3. **Main Content**: 1600 × 990px (TRUE 16:9)
4. **Screen Coverage**: 77% content, 23% overlay
5. **No bottom bar**: Clean bottom edge

---

## 🎨 VISUAL HIERARCHY

### **Top Strip** (Most Important):
- LIVE indicator (red)
- Session title (large, bold)
- Time, music, stats (smaller)

### **Left Sidebar** (Secondary):
- Timer (focal point)
- Tasks (functional)
- Webcam (presence)

### **Main Content** (Primary):
- Screen share area
- Code editor
- Terminal
- Browser

---

## 📊 COMPARISON: CURRENT vs TARGET

| Element | Current | Target | Change |
|---------|---------|--------|--------|
| **Top Height** | 80px | 90px | +10px |
| **Sidebar Width** | 280px | 320px | +40px |
| **Sidebar Height** | 1000px | 990px | -10px |
| **Main Width** | 1640px | 1600px | -40px |
| **Main Height** | 1000px | 990px | -10px |
| **Main Aspect** | ~16.4:10 | 16:9 | TRUE 16:9! |

---

## 🚀 IMPLEMENTATION PLAN

### **Step 1: Update Header**
- Change height to 90px
- Center with 160px left margin
- Optimize content for 90px height

### **Step 2: Update Sidebar**
- Change width to 320px
- Adjust top position to 90px
- Recalculate section heights

### **Step 3: Update Main Content**
- Position at (320, 90)
- Set size to 1600 × 990px
- Verify 16:9 aspect ratio

### **Step 4: Verify**
- Check all dimensions
- Test at 100% zoom
- Verify screen coverage percentages

---

## ✅ SUCCESS CRITERIA

- [x] Top strip: 1600 × 90px
- [x] Sidebar: 320 × 990px
- [x] Main content: 1600 × 990px (TRUE 16:9)
- [x] Screen coverage: 77% / 23%
- [x] Everything fits at 100% zoom
- [x] No scrolling needed
- [x] Professional appearance

---

**Status**: Ready to implement! 🚀
