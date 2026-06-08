# Round Progress Bar Feature

**Status**: ✅ Complete

---

## What is a Round?

In Pomodoro technique:
- **1 Pomodoro** = 1 focus session
- **1 Cycle** = 1 focus session + its break
- **1 Round** = 4 Pomodoros (cycles 1-4)

After 4 Pomodoros, you get a long break, then the next round starts.

---

## The Problem

Users couldn't easily see:
- How many Pomodoros completed in current round
- Progress toward the long break
- Visual representation of round completion

---

## The Solution

Added a **4-segment progress bar** that fills as you complete Pomodoros:

```
Round Progress              3/4
■ ■ ■ □
```

- Each segment = 1 Pomodoro
- Filled segments = completed Pomodoros
- Empty segments = remaining Pomodoros
- After 4 segments filled = round complete → long break

---

## Visual Examples

### Pomodoro 1/4 (First Pomodoro)
```
SESSION
REMAINING
25:00
Pomodoro 1/4 • Round 1

Round Progress              1/4
■ □ □ □                     ← 1 segment filled

████░░░░░░                  ← Session progress
Task total: 23m
```

### Pomodoro 2/4 (Second Pomodoro)
```
SESSION
REMAINING
24:35
Pomodoro 2/4 • Round 1

Round Progress              2/4
■ ■ □ □                     ← 2 segments filled

███████░░░                  ← Session progress
Task total: 48m
```

### Pomodoro 3/4 (Third Pomodoro)
```
SESSION
REMAINING
23:12
Pomodoro 3/4 • Round 1

Round Progress              3/4
■ ■ ■ □                     ← 3 segments filled

██████░░░░                  ← Session progress
Task total: 1h 13m
```

### Pomodoro 4/4 (Last Pomodoro - before long break)
```
SESSION
REMAINING
22:45
Pomodoro 4/4 • Round 1

Round Progress              4/4
■ ■ ■ ■                     ← All 4 segments filled!

█████░░░░░                  ← Session progress
Task total: 1h 38m
```

### Long Break (After round complete)
```
BREAK
REMAINING
14:32
Round complete

Round Progress              4/4
■ ■ ■ ■                     ← All 4 segments filled

████████░░                  ← Break progress
💧 Tip: Drink water
```

### Pomodoro 1/4 (New Round - Round 2)
```
SESSION
REMAINING
25:00
Pomodoro 1/4 • Round 2      ← Round counter increased!

Round Progress              1/4
■ □ □ □                     ← Bar reset, starting new round

████░░░░░░                  ← Session progress
Task total: 2h 3m
```

---

## How It Works

### Progress Calculation

The round progress bar is based on `pomodoroInRound` value:

```typescript
// One round = 4 Pomodoros
const pomodoroInRound = rawCycle > 0 ? ((rawCycle - 1) % 4) + 1 : 0 // 1-4
const currentRound = rawCycle > 0 ? Math.floor((rawCycle - 1) / 4) + 1 : 0 // 1, 2, 3...
```

**Example cycles:**
- Cycle 1 → Pomodoro 1/4, Round 1
- Cycle 2 → Pomodoro 2/4, Round 1
- Cycle 3 → Pomodoro 3/4, Round 1
- Cycle 4 → Pomodoro 4/4, Round 1 (→ long break)
- Cycle 5 → Pomodoro 1/4, Round 2 (new round!)
- Cycle 6 → Pomodoro 2/4, Round 2
- ...and so on

### 4-Segment Bar

```jsx
{[1, 2, 3, 4].map((segment) => (
  <div
    key={segment}
    style={{
      flex: 1,
      borderRadius: '3px',
      background:
        segment <= pomodoroInRound
          ? `rgba(${accentRgb}, 0.9)`      // Filled (completed)
          : 'rgba(255,255,255,0.1)',        // Empty (not yet)
      boxShadow:
        segment <= pomodoroInRound
          ? `0 0 8px rgba(${accentRgb}, 0.4)` // Glow effect
          : 'none',
      transition: 'all 0.6s ease',
    }}
  />
))}
```

**Logic:**
- If `pomodoroInRound = 1` → 1st segment filled
- If `pomodoroInRound = 2` → 1st and 2nd segments filled
- If `pomodoroInRound = 3` → 1st, 2nd, 3rd segments filled
- If `pomodoroInRound = 4` → All 4 segments filled (round complete!)

---

## Visual Design

### Bar Styling
- **Height**: 6px (visible but not too large)
- **Gap between segments**: 4px
- **Border radius**: 3px (rounded corners)
- **Filled color**: Accent color with 90% opacity + glow
- **Empty color**: White with 10% opacity (subtle)
- **Transition**: 0.6s ease (smooth filling animation)

### Label
- **"Round Progress"**: 10px uppercase label
- **"X/4"**: 11px counter showing current/total
- **Position**: Above the bar

### Placement
Located in Session/Break card:
1. Timer label ("REMAINING")
2. Big timer (42px)
3. Mode text ("Pomodoro 2/4 • Round 1")
4. **Round Progress Bar** ← NEW
5. Session progress bar
6. Task total

---

## When It Shows

### ✅ Shows During:
- **FOCUS state** with Pomodoro mode
- **BREAK state** with Pomodoro mode
- **PAUSED state** with Pomodoro mode (if applicable)

### ❌ Hidden During:
- **Flowtime mode** (no rounds)
- **Countdown mode** (no rounds)
- **IDLE state** (no session)
- **READY state** (between sessions)

---

## Complete Session Example

```
┌─────────────────────────────┐
│ SESSION                     │
│ REMAINING                   │
│ 23:45                       │ ← Current session time
│ Pomodoro 2/4 • Round 1      │ ← Mode + position
│                             │
│ Round Progress          2/4 │ ← Round label
│ ■ ■ □ □                     │ ← 4-segment bar (2 filled)
│                             │
│ ████████░░░░                │ ← Session progress
│                             │
│ Task total: 1h 12m          │ ← Total task time
└─────────────────────────────┘
```

---

## Benefits

✅ **Visual clarity** - See round progress at a glance
✅ **Motivation** - Watching bar fill up is satisfying
✅ **Planning** - Know how close to long break
✅ **Context** - Understand position in Pomodoro cycle
✅ **Mobile friendly** - 4 large segments, easy to see
✅ **Animated** - Smooth transitions between states
✅ **Color coded** - Uses state-specific accent colors

---

## Round Completion Flow

### Step 1: Starting Round 1
```
Pomodoro 1/4 • Round 1
■ □ □ □
```

### Step 2: Progress through Round 1
```
Pomodoro 2/4 • Round 1
■ ■ □ □
```

### Step 3: Continue
```
Pomodoro 3/4 • Round 1
■ ■ ■ □
```

### Step 4: Last Pomodoro of Round 1
```
Pomodoro 4/4 • Round 1
■ ■ ■ ■
```

### Step 5: Long Break
```
Round complete
■ ■ ■ ■            ← Bar stays full during long break
```

### Step 6: New Round Starts
```
Pomodoro 1/4 • Round 2    ← Round counter increased!
■ □ □ □                   ← Bar reset for new round
```

---

## Technical Details

### Where Added

**File**: `overlay_yt-main/straming/src/components/ObsSidebar.tsx`

**Locations**:
1. **FOCUS/PAUSED/OVERTIME session card** (~line 545)
2. **BREAK card** (~line 670)

### Condition
```typescript
{isPomodoro && pomodoroInRound > 0 && (
  // Round progress bar here
)}
```

Only renders when:
- Mode is Pomodoro
- pomodoroInRound > 0 (valid Pomodoro number)

### State-Specific Colors

Bar uses `accentRgb` which changes based on state:
- **FOCUS**: Yellow/Green glow
- **BREAK**: Purple/Blue glow
- **PAUSED**: Gray/Yellow
- **OVERTIME**: Red (but bar unlikely to show in overtime)

---

## Testing

### Test Pomodoro Flow
1. Start Pomodoro (25 min focus)
2. Verify bar shows: `■ □ □ □` (1/4)
3. Complete Pomodoro, take short break
4. Start 2nd Pomodoro
5. Verify bar shows: `■ ■ □ □` (2/4)
6. Complete 2nd Pomodoro, take short break
7. Start 3rd Pomodoro
8. Verify bar shows: `■ ■ ■ □` (3/4)
9. Complete 3rd Pomodoro, take short break
10. Start 4th Pomodoro
11. Verify bar shows: `■ ■ ■ ■` (4/4)
12. Complete 4th Pomodoro
13. Verify long break starts
14. Verify bar still shows: `■ ■ ■ ■`
15. Complete long break
16. Start next Pomodoro
17. Verify Round counter increased: "Round 2"
18. Verify bar reset: `■ □ □ □` (1/4)

### Test Different Modes
- [ ] Flowtime: No round bar (correct)
- [ ] Countdown: No round bar (correct)
- [ ] Pomodoro: Round bar shows (correct)

### Test Visual
- [ ] Segments have 4px gap
- [ ] Filled segments glow
- [ ] Empty segments are subtle
- [ ] Bar height is 6px
- [ ] Transition is smooth (0.6s)
- [ ] Colors match state accent

---

## Files Changed

1. **`overlay_yt-main/straming/src/components/ObsSidebar.tsx`**
   - Added Round Progress bar to FOCUS session card
   - Added Round Progress bar to BREAK card
   - 4-segment bar with dynamic filling
   - Label showing "X/4" count
   - Only renders for Pomodoro mode

---

## Summary

✅ **Round Progress Bar Added** - 4-segment visual indicator
✅ **Shows Pomodoro position** - 1/4, 2/4, 3/4, 4/4
✅ **Fills progressively** - One segment per Pomodoro
✅ **Resets after round** - Starts fresh for next round
✅ **Visual feedback** - Glow effect on filled segments
✅ **State-specific colors** - Matches current state theme
✅ **Mobile friendly** - Large segments, easy to see

**Now viewers can easily track round completion! 🎯✨**
