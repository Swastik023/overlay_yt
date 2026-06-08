# Quick Test Guide - OBS Overlay States

## Setup

1. **Start Super Productivity** with Local REST API enabled
2. **Start overlay dev server:**
   ```bash
   cd overlay_yt-main/straming
   npm run dev
   ```
3. **Open OBS mode URL:**
   ```
   http://localhost:5173/?obs=true
   ```

## Critical Tests (5 minutes)

### ✅ Test 1: Verify OBS Mode Active
**Expected:**
- Only left sidebar visible (259px)
- No top header
- Main area transparent
- Background transparent

**Quick check:** Open browser dev tools → Elements → Check:
- Body has class `obs-mode`
- Sidebar width is 259px
- No `.top-header` or `.break-banner` elements visible

---

### ✅ Test 2: FOCUS State
**Steps:**
1. In Super Productivity: Start any Pomodoro task

**Expected in sidebar:**
- Status pill: "FOCUS 🔥" (yellow)
- Current task name
- Session timer counting down
- "Pomodoro Session" label
- Progress bar animating
- Today stats
- Task list with active task highlighted

**NOT expected:**
- ❌ Full-screen break banner
- ❌ Top header

---

### ✅ Test 3: BREAK State
**Steps:**
1. Let Pomodoro timer reach 0 (or manually complete in SP)
2. Break starts automatically

**Expected in sidebar:**
- Status pill: "BREAK ☕" (purple)
- Break timer counting down
- "Short Break" or "Long Break" label
- Break progress bar
- Compact break tip (emoji + 1-2 sentences)
- Current task still shown
- Today stats updated

**CRITICAL CHECK:**
- ❌ NO full-screen break banner covering the screen
- ❌ NO top header
- ✅ Everything inside 259px sidebar

---

### ✅ Test 4: BREAK_COMPLETE State
**Steps:**
1. Let break timer reach 00:00
2. Wait for break to complete

**Expected in sidebar:**
- Status pill: "READY ✅" (orange)
- Timer shows "00:00"
- Check mark icon
- "Break Complete - Ready to Continue" message
- Completion message: "Break finished! Start your next focus session."
- Current task
- Today stats

**NOT expected:**
- ❌ Full-screen break banner
- ❌ Running timer
- ❌ Break tip

---

### ✅ Test 5: Return to Planning (CRITICAL)
**Steps:**
1. In Super Productivity: Click "Complete Focus Session" button on break screen
2. Observe overlay state

**Expected:**
- Sidebar shows IDLE or READY state
- Status pill: "READY 🌙" (gray)
- No session timer
- Task info or "Start a task" message
- Today stats remain visible

**CRITICAL CHECK:**
- ✅ Does NOT start another break
- ✅ Cleanly returns to planning state
- ✅ No errors in browser console

---

### ✅ Test 6: PAUSED State
**Steps:**
1. Start Pomodoro
2. Click pause button in Super Productivity

**Expected in sidebar:**
- Status pill: "PAUSED ⏸" (gray)
- Timer frozen at last value
- "Session Paused" message
- Current task
- Today stats

---

### ✅ Test 7: IDLE State
**Steps:**
1. Stop all tasks in Super Productivity
2. No active session

**Expected in sidebar:**
- Status pill: "READY 🌙" (gray)
- "No active task" or "Start a task in Super Productivity"
- Today stats (even with no active task)
- Task list if any tasks exist for today

---

## Visual Checklist

Open the overlay and verify:

- [ ] Sidebar is exactly on the left edge
- [ ] Sidebar is exactly 259px wide (use browser dev tools ruler)
- [ ] Main area is transparent (see-through)
- [ ] No header bar at top
- [ ] Clock updates every second
- [ ] Status pill changes color per state
- [ ] All text is readable
- [ ] No text overflow/cut-off
- [ ] Long task names show ellipsis (...)
- [ ] Progress bars animate smoothly
- [ ] No horizontal scrollbar
- [ ] Vertical scrolling works if needed

---

## State Transition Flow Test

**Complete flow (10 minutes):**

1. **Start:** IDLE state (gray)
2. **Start task:** → FOCUS state (yellow)
3. **Timer completes:** → BREAK state (purple)
4. **Break completes:** → BREAK_COMPLETE state (orange)
5. **Click "Start Next Session" in SP:** → FOCUS state (yellow)
6. **Complete again:** → BREAK state (purple)
7. **Click "Complete Focus Session" in SP:** → IDLE/READY state (gray)

**Verify:** Each transition happens smoothly, no errors, no full-screen overlays

---

## Browser Console Commands

```javascript
// 1. Verify OBS mode
console.log('OBS Mode:', new URLSearchParams(window.location.search).get('obs') === 'true')

// 2. Verify sidebar width
const sidebar = document.querySelector('[style*="259px"]')
console.log('Sidebar found:', !!sidebar)

// 3. Check hidden elements
console.log('Header hidden:', !document.querySelector('.top-header'))
console.log('Break banner hidden:', !document.querySelector('.break-banner'))

// 4. Check body class
console.log('obs-mode class:', document.body.classList.contains('obs-mode'))
```

All should return `true` ✅

---

## Troubleshooting

### Issue: Full-screen break banner shows during break
**Fix:** Ensure URL has `?obs=true` parameter

### Issue: Header still visible
**Fix:** 
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Check URL has `?obs=true`
3. Check browser console for errors

### Issue: Sidebar not 259px
**Fix:** Check CSS is loaded correctly, hard refresh

### Issue: State not updating
**Fix:**
1. Check Super Productivity Local REST API is enabled
2. Check browser console for connection errors
3. Verify Super Productivity is running on port 11111

### Issue: Background not transparent
**Fix:**
1. Ensure `?obs=true` in URL
2. Check body has `obs-mode` class
3. In OBS: Use "Browser" source with CSS: `body { background-color: rgba(0,0,0,0); }`

---

## Expected Results Summary

| State | Status Pill | Timer | Break Banner | Header | Main Area |
|-------|-------------|-------|--------------|--------|-----------|
| FOCUS | FOCUS 🔥 (yellow) | Counting down | ❌ Hidden | ❌ Hidden | ✅ Transparent |
| BREAK | BREAK ☕ (purple) | Counting down | ❌ Hidden | ❌ Hidden | ✅ Transparent |
| BREAK_COMPLETE | READY ✅ (orange) | 00:00 | ❌ Hidden | ❌ Hidden | ✅ Transparent |
| PAUSED | PAUSED ⏸ (gray) | Frozen | ❌ Hidden | ❌ Hidden | ✅ Transparent |
| OVERTIME | OVERTIME 🔥 (orange) | Counting up | ❌ Hidden | ❌ Hidden | ✅ Transparent |
| IDLE | READY 🌙 (gray) | None | ❌ Hidden | ❌ Hidden | ✅ Transparent |

**All states:** Only 259px sidebar visible, everything else transparent ✅

---

## Success Criteria

✅ All 6 states display correctly in sidebar  
✅ No full-screen break banner in any state  
✅ No header visible in any state  
✅ Sidebar exactly 259px wide  
✅ Main area transparent for OBS content  
✅ State transitions work smoothly  
✅ "Complete Focus Session" returns to planning (no break loop)  
✅ Real-time updates work (timer, task, stats)

If all criteria pass → **OBS Overlay VERIFIED** ✅

---

**Test Duration:** ~10-15 minutes for complete verification  
**Status:** Ready for testing
