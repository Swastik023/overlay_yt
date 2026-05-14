# UI Height Audit - 1080px Fit Analysis

## Target: 1080px total height

### Current Layout Breakdown:

**Header**: ~60px
- Time + LIVE + Date
- Single row

**Sidebar Content** (needs to fit in 1020px):
1. **Sidebar Header**: ~35px
   - Icon + Title
   - Tagline
   - Border

2. **Timer Section**: ~180px
   - Label: 15px
   - Toggle buttons: 30px
   - Circular timer: 120px
   - Control buttons: 35px
   - Gaps: ~10px

3. **Tasks Section**: ~100px
   - Label: 15px
   - 2 tasks × 30px: 60px
   - Progress: 25px
   - Gaps: ~10px

4. **Music Section**: ~60px
   - Label: 15px
   - Card: 45px

5. **Stats Section**: ~80px
   - Label: 15px
   - Icons + numbers: 65px

6. **Webcam Section**: ~150px
   - LIVE indicator: 25px
   - Webcam (16:9): 125px

**Total Sidebar**: 35 + 180 + 100 + 60 + 80 + 150 = **605px**
**With gaps (2px × 5)**: 605 + 10 = **615px**

**Available**: 1020px
**Used**: 615px
**Remaining**: 405px ✅ SHOULD FIT!

## Problem Analysis:

The math shows it SHOULD fit, but it's not fitting. Possible issues:

1. **Padding/margins not accounted for**
2. **Flex gaps adding up**
3. **Border widths**
4. **Line-height causing extra space**
5. **Hidden padding in components**

## Solution:

Need to:
1. Remove ALL unnecessary padding
2. Set explicit heights
3. Use `overflow: hidden` on sections
4. Make webcam smaller if needed
