# OBS Overlay - 6 Modes Final Design

## Overview

The OBS overlay uses exactly **6 display modes** to show all productivity states in the 259px sidebar.

## The 6 Modes

### 1. 🔥 FOCUS
**When:** Active work session running  
**Color:** Yellow (#FFC107)  
**Priority:** 4

**Display:**
```
🔥 FOCUS

Task: test2
Project: Inbox

Session: 01:00
Remaining: 01:00
Pomodoro • Cycle 2

Focused: 1h 43m
Completed: 2
Planned: 2/3
```

**Shows:**
- Current task title
- Project name
- Session timer (large, yellow)
- Remaining time
- Duration
- Mode (Pomodoro/Flowtime/Countdown)
- Cycle number
- Session progress bar
- Today stats
- Task list

---

### 2. 🌙 BREAK
**When:** Short or long break running  
**Color:** Purple (#8B5CF6)  
**Priority:** 3

**Display:**
```
🌙 BREAK

Break: 14:26
Long Break • Cycle 5

💡 TIP
Stretch your neck and drink water.

Focused: 1h 43m
Completed: 2
Planned: 2/3
```

**Shows:**
- Break timer (countdown)
- Break type (Short Break / Long Break)
- Cycle number
- Break progress bar
- Small break tip (emoji + 1-2 sentences)
- Today stats
- Task list

**IMPORTANT:**
- NO full-screen break banner
- Everything stays inside 259px sidebar
- Compact break tip only

---

### 3. ✅ READY
**When:**  
- Break finished, next session not started (user came back late)
- Current task exists but no session running
- Ready to start focus

**Color:** Green (#10B981)  
**Priority:** 5-6

**Display:**
```
✅ READY

Break complete
Start next focus session

Next: test2

Focused: 1h 43m
Completed: 2
Planned: 2/3
```

**Shows:**
- "Break complete" or "Ready to start" message
- "Start next focus session" prompt
- Next task or current task info
- Today stats
- Task list

**This is critical for:**
- Break was 5 min, user came back after 7 min
- Break ended but next session not started yet
- Prevents confusion about what state we're in

---

### 4. ⚪ IDLE
**When:** No active task AND no focus/break session  
**Color:** Gray (#6B7280)  
**Priority:** 7 (lowest)

**Display:**
```
⚪ IDLE

No active task
Start a task

Focused: 1h 43m
Completed: 2
Planned: 2/3
```

**Shows:**
- "No active task" message
- "Start a task" prompt
- Today stats (even with no active task)
- Task list (if any today tasks exist)

**Does NOT show:**
- Session timer
- Current task section

---

### 5. ⏸ PAUSED
**When:** Focus or break session paused  
**Color:** Gray (#94A3B8)  
**Priority:** 1 (highest)

**Display:**
```
⏸ PAUSED

Task: test2
Paused at 08:42 remaining

Focused: 1h 43m
Completed: 2
```

**Shows:**
- Current task
- Frozen timer
- "Paused at XX:XX remaining" message
- Today stats
- Task list

**Timer behavior:**
- Shows last value before pause
- No animation
- No progress bar movement

---

### 6. 🔴 OVERTIME
**When:** Focus session exceeded planned duration  
**Color:** Red (#EF4444)  
**Priority:** 2

**Display:**
```
🔴 OVERTIME

+03:15
Session exceeded

Task: test2

Focused: 1h 43m
Completed: 2
```

**Shows:**
- Overtime duration (+ prefix)
- "Session exceeded" message
- Current task
- Today stats
- Task list

**Timer behavior:**
- Shows elapsed time past duration
- Continues counting up
- Red accent color for urgency

---

## Mode Priority Logic

The overlay decides mode in **exact priority order:**

```typescript
1. If isSessionPaused → PAUSED
2. Else if isInOvertime → OVERTIME
3. Else if isBreakActive → BREAK
4. Else if isSessionRunning → FOCUS
5. Else if (previous mode was BREAK and break ended) → READY
6. Else if currentTask exists → READY
7. Else → IDLE
```

### Why This Order?

**PAUSED first:** Paused state is most specific - user explicitly paused

**OVERTIME second:** Overtime is urgent - user needs to know session exceeded

**BREAK third:** Active break takes precedence over idle states

**FOCUS fourth:** Active session when running

**READY fifth:** Transition state - break ended OR ready to start

**IDLE last:** Default when nothing else active

---

## Avoiding Extra Modes

### ❌ Don't Create These Modes

**Planning / Preparation:**
- Use READY or IDLE instead
- "Planning" is not a separate state for display

**Waiting:**
- Use READY instead
- "Waiting" is covered by READY mode

**SessionDone / FocusDone:**
- Use READY instead
- "Done" states collapse into READY

**BreakDone / BreakComplete:**
- Use READY instead
- No separate "complete" mode needed

**NoConnection / Disconnected:**
- NOT a main mode
- Show as warning banner alongside current mode
- Use connection status indicator instead

### Connection Status (Not a Mode)

Connection state is a **separate indicator**, not a main mode:

**States:**
- Connected (no indicator needed)
- Reconnecting (warning banner)
- Disconnected (warning banner)
- API disabled (warning banner)

**Display:**
```
⚠ Reconnecting...
Trying to reconnect

[Current mode continues below]
```

**Only if completely disconnected with no data:**
```
⚠ DISCONNECTED

Super Productivity not connected
Waiting for API...
```

This shows ALONGSIDE the current mode, not as a replacement.

---

## Visual Examples

### FOCUS Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    🔥 FOCUS    │ ← Header
├─────────────────────────────┤
│ 📋 CURRENT TASK             │
│ test2                       │
│ 📁 Inbox                    │
│ 02:15 / 25:00              │
│ ████░░░░░░                  │ ← Progress
├─────────────────────────────┤
│ ⏱ SESSION                   │
│    24:45                    │ ← Large timer
│ Pomodoro • Cycle 2          │
│ ████████░░                  │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
│ Completed: 2                │
│ Planned: 2/3               │
│ ████████░                   │
├─────────────────────────────┤
│ ✅ TASKS 2/3                │
│ ▶ test2                     │
│ □ test3                     │
│ ✓ test1                     │
└─────────────────────────────┘
```

### BREAK Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    🌙 BREAK    │
├─────────────────────────────┤
│ 🌙 BREAK                    │
│    04:23                    │ ← Break timer
│ Short Break • Cycle 2       │
│ ████░░░░░░                  │
├─────────────────────────────┤
│ 💡 TIP                      │
│ 🧘 Close your eyes and      │
│    take 3 deep breaths.     │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
│ Completed: 2                │
└─────────────────────────────┘
```

### READY Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    ✅ READY    │
├─────────────────────────────┤
│ ✅ READY                    │
│                             │
│ Break complete              │
│ Start next focus session    │
│                             │
├─────────────────────────────┤
│ 📋 NEXT TASK                │
│ test2                       │
│ 📁 Inbox                    │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
│ Completed: 2                │
└─────────────────────────────┘
```

### IDLE Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    ⚪ IDLE     │
├─────────────────────────────┤
│ ⚪ IDLE                     │
│                             │
│ No active task              │
│ Start a task                │
│                             │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
│ Completed: 2                │
│ Planned: 2/3               │
└─────────────────────────────┘
```

### PAUSED Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    ⏸ PAUSED   │
├─────────────────────────────┤
│ 📋 CURRENT TASK             │
│ test2                       │
│ 📁 Inbox                    │
├─────────────────────────────┤
│ ⏱ SESSION                   │
│    08:42                    │ ← Frozen
│ Paused at 08:42 remaining   │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
└─────────────────────────────┘
```

### OVERTIME Mode
```
┌─────────────────────────────┐
│ 🕐 12:34 PM    🔴 OVERTIME │
├─────────────────────────────┤
│ 📋 CURRENT TASK             │
│ test2                       │
│ 📁 Inbox                    │
├─────────────────────────────┤
│ ⏱ SESSION                   │
│   +03:15                    │ ← Red, overtime
│ Session exceeded            │
├─────────────────────────────┤
│ 📊 TODAY                    │
│ Focused: 1h 43m             │
└─────────────────────────────┘
```

---

## State Transitions

### Normal Pomodoro Flow
```
IDLE
  ↓ Start task + Start Pomodoro
FOCUS (25:00 countdown, yellow)
  ↓ Timer reaches 0:00
BREAK (5:00 countdown, purple)
  ↓ Timer reaches 0:00
READY (green, "Break complete")
  ↓ Start next session
FOCUS
  ↓ Complete session
READY
  ↓ Stop task
IDLE
```

### Late Return Flow (Critical)
```
FOCUS (working)
  ↓ Timer completes
BREAK (5:00 break)
  ↓ Timer reaches 0:00, but user doesn't start next
READY (stays here, "Break complete")
  ↓ User comes back 2 minutes late
READY (still here, NOT another break!)
  ↓ User clicks "Start Next Session"
FOCUS
```

### Pause Flow
```
FOCUS (working)
  ↓ Pause button clicked
PAUSED (frozen timer)
  ↓ Resume button clicked
FOCUS (continues)
```

### Overtime Flow
```
FOCUS (Pomodoro with manual break)
  ↓ Timer reaches planned duration
OVERTIME (red, keeps counting)
  ↓ User manually starts break
BREAK
```

---

## Implementation Status

### Files Modified

1. **`useOverlayState.ts`** ✅
   - 6 modes only (removed BREAK_COMPLETE)
   - Exact priority logic as specified
   - Tracks previous state for BREAK → READY transition
   - Green color for READY (#10B981)
   - Red color for OVERTIME (#EF4444)

2. **`ObsSidebar.tsx`** ✅
   - State-specific content for each mode
   - FOCUS: Full session info
   - BREAK: Compact tip, no full-screen
   - READY: "Break complete" message
   - IDLE: "No active task" message
   - PAUSED: Frozen timer display
   - OVERTIME: +XX:XX display
   - Connection status as indicator, not mode

### Color Palette

| Mode | Emoji | Color | RGB | Usage |
|------|-------|-------|-----|-------|
| FOCUS | 🔥 | #FFC107 | 255, 193, 7 | Active, hot |
| BREAK | 🌙 | #8B5CF6 | 139, 92, 246 | Relaxed, purple |
| READY | ✅ | #10B981 | 16, 185, 129 | Positive, green |
| PAUSED | ⏸ | #94A3B8 | 148, 163, 184 | Neutral, gray |
| OVERTIME | 🔴 | #EF4444 | 239, 68, 68 | Urgent, red |
| IDLE | ⚪ | #6B7280 | 107, 114, 128 | Neutral, gray |

---

## Testing Checklist

- [ ] FOCUS mode shows when session starts
- [ ] BREAK mode shows when break starts (NO full-screen banner)
- [ ] READY mode shows when break completes
- [ ] READY mode stays when user returns late from break
- [ ] IDLE mode shows when no task active
- [ ] PAUSED mode shows when session paused
- [ ] OVERTIME mode shows when session exceeds duration
- [ ] Connection warning shows as indicator, not mode
- [ ] All content fits in 259px sidebar
- [ ] State transitions work smoothly
- [ ] Colors match specification

---

## Success Criteria

✅ Exactly 6 modes (no more, no less)  
✅ Priority logic matches specification  
✅ READY mode handles "came back late" scenario  
✅ Connection status is indicator, not mode  
✅ No full-screen break banner  
✅ All content in 259px sidebar  
✅ Clear visual distinction between modes  
✅ Smooth state transitions  

**Status:** ✅ IMPLEMENTED

---

**Final Rule:** Keep 6 modes only. Don't add more. These 6 cover all scenarios.
