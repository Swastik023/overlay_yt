# Pomodoro Round Logic - Update Complete

## Changes Made ✅

Updated the OBS overlay to use clear Pomodoro round logic instead of confusing cycle numbers.

## Before vs After

### Before ❌
```
⏱ SESSION
   24:58
Pomodoro Session • Cycle 5
```
**Problem:** User doesn't know what "Cycle 5" means. Is this the 5th session ever? Today? This week?

### After ✅
```
⏱ SESSION
   24:58
Pomodoro 1/4
Round 2
```
**Clear:** User is on the 1st Pomodoro of the 2nd round. Easy to understand!

## Key Concepts

### Terminology
- **1 Pomodoro** = 1 focus session (25 min work)
- **1 Cycle** = 1 focus + 1 break (backend term)
- **1 Round** = 4 Pomodoros (display term)

### Display Logic
```
Backend Cycle → Display
Cycle 1 → Pomodoro 1/4
Cycle 2 → Pomodoro 2/4
Cycle 3 → Pomodoro 3/4
Cycle 4 → Pomodoro 4/4
Cycle 5 → Pomodoro 1/4 (Round 2)
Cycle 6 → Pomodoro 2/4 (Round 2)
...
```

### Break Types
- **Short Break:** After Pomodoro 1, 2, or 3
- **Long Break:** After Pomodoro 4 (end of round)

## Display Examples

### 1. FOCUS - Pomodoro 2/4
```
🔥 FOCUS

Task: test2
Project: Inbox

⏱ SESSION
   24:58
Pomodoro 2/4
████████░░
```

### 2. FOCUS - Pomodoro 1/4 in Round 2
```
🔥 FOCUS

Task: test2
Project: Inbox

⏱ SESSION
   24:58
Pomodoro 1/4
Round 2
████████░░
```

### 3. BREAK - Short Break
```
🌙 BREAK

   04:32
Short Break
After Pomodoro 2/4
████░░░░░░

💡 TIP
Stretch your neck
```

### 4. BREAK - Long Break (Round Complete)
```
🌙 BREAK

   14:26
Round complete
███████░░░

💡 TIP
Take a walk outside
```

### 5. READY - After Short Break
```
✅ READY

Break complete
Start next focus session

Next: test2
```

### 6. READY - After Long Break
```
✅ READY

Ready • Start next round

Next: test2
```

## Complete Round Flow

### Round 1
```
1. FOCUS: Pomodoro 1/4
   ↓ (25 min)
2. BREAK: Short Break • After Pomodoro 1/4
   ↓ (5 min)
3. READY: Break complete
   ↓
4. FOCUS: Pomodoro 2/4
   ↓ (25 min)
5. BREAK: Short Break • After Pomodoro 2/4
   ↓ (5 min)
6. READY: Break complete
   ↓
7. FOCUS: Pomodoro 3/4
   ↓ (25 min)
8. BREAK: Short Break • After Pomodoro 3/4
   ↓ (5 min)
9. READY: Break complete
   ↓
10. FOCUS: Pomodoro 4/4
    ↓ (25 min)
11. BREAK: Round complete (long break)
    ↓ (15 min)
12. READY: Ready • Start next round
```

### Round 2
```
13. FOCUS: Pomodoro 1/4 • Round 2
    ↓
[Same pattern repeats]
```

## Implementation Details

### Calculation Logic
```typescript
const rawCycle = focusMode?.currentCycle ?? 0

// Position in round (1-4)
const pomodoroInRound = ((rawCycle - 1) % 4) + 1

// Which round (1, 2, 3...)
const currentRound = Math.floor((rawCycle - 1) / 4) + 1

// Is this the 4th Pomodoro?
const isLongBreakCycle = pomodoroInRound === 4

// Is round complete? (during/after long break)
const isRoundComplete = isLongBreakCycle && (state === 'BREAK' || state === 'READY')
```

### Display Rules

**FOCUS State:**
- Main: `Pomodoro ${pomodoroInRound}/4`
- Sub: `Round ${currentRound}` (if round > 1)

**BREAK State:**
- If round complete: `Round complete`
- Else if long: `Long Break`
- Else: `Short Break`
- Sub (if not round complete): `After Pomodoro ${pomodoroInRound}/4`

**READY State:**
- If round complete: `Ready • Start next round`
- Else: `Break complete` + `Start next focus session`

## Benefits

### ✅ Clear Progress
- User sees: "I'm on Pomodoro 2 out of 4"
- Not: "What is Cycle 5?"

### ✅ Motivating
- User knows: "2 more Pomodoros to complete this round!"
- Visual progress: X/4

### ✅ Context for Breaks
- Short break: "After Pomodoro 2/4" (context)
- Long break: "Round complete" (achievement)

### ✅ Fresh Starts
- After round: Display resets to 1/4
- New round feels like clean slate

### ✅ Round Awareness
- "Round 2" shows multi-round productivity
- Tracks larger work blocks

## Files Modified

1. **`ObsSidebar.tsx`** ✅
   - Added Pomodoro round calculations
   - Updated `getStateMessage()` for all states
   - Updated `getSubMessage()` for context
   - Modified FOCUS, BREAK, READY displays

## Testing Checklist

### Test 1: First Pomodoro
- [ ] Start Pomodoro
- [ ] Verify: "Pomodoro 1/4" shown
- [ ] No "Round X" shown (first round)

### Test 2: Second Pomodoro
- [ ] Complete first + break
- [ ] Start second Pomodoro
- [ ] Verify: "Pomodoro 2/4" shown

### Test 3: Short Break Context
- [ ] Complete Pomodoro 2/4
- [ ] Break starts
- [ ] Verify: "Short Break" + "After Pomodoro 2/4"

### Test 4: Fourth Pomodoro
- [ ] Complete 3 Pomodoros + breaks
- [ ] Start 4th Pomodoro
- [ ] Verify: "Pomodoro 4/4" shown

### Test 5: Long Break (Round Complete)
- [ ] Complete 4th Pomodoro
- [ ] Long break starts
- [ ] Verify: "Round complete" shown
- [ ] Verify: NO "After Pomodoro 4/4"

### Test 6: Ready After Long Break
- [ ] Long break completes
- [ ] Verify: "Ready • Start next round"

### Test 7: Second Round
- [ ] Start next session after round 1
- [ ] Verify: "Pomodoro 1/4" + "Round 2"

### Test 8: Cycle Count Mapping
```
Backend Cycle → Display
1 → Pomodoro 1/4
2 → Pomodoro 2/4
3 → Pomodoro 3/4
4 → Pomodoro 4/4
5 → Pomodoro 1/4 (Round 2)
6 → Pomodoro 2/4 (Round 2)
7 → Pomodoro 3/4 (Round 2)
8 → Pomodoro 4/4 (Round 2)
9 → Pomodoro 1/4 (Round 3)
```

## Non-Pomodoro Modes

### Flowtime
- Shows: "Flowtime" (no cycle/round display)
- Timer counts up, not down

### Countdown
- Shows: "Countdown" (no cycle/round display)
- Single session mode

**Pomodoro round logic ONLY applies when `focusMode.mode === 'Pomodoro'`** ✅

## Edge Cases Handled

### User Skips Break
- Round logic still tracks correctly
- Next session shows correct Pomodoro number

### User Resets Cycles
- Round resets to Pomodoro 1/4
- currentRound resets to 1

### Mid-Round Session
- If cycle = 6, shows "Pomodoro 2/4 • Round 2"
- Always clear where user is in the round

## Documentation

Created comprehensive documentation:
1. **POMODORO_ROUND_LOGIC.md** (5+ pages)
   - Complete terminology
   - Calculation formulas
   - Display examples
   - State-specific logic
   - Benefits explanation

2. **POMODORO_UPDATE_COMPLETE.md** (this file)
   - Quick summary
   - Before/after comparison
   - Testing checklist

---

## Summary

✅ **Clear Progress:** "Pomodoro 2/4" instead of "Cycle 5"  
✅ **Round Awareness:** "Round 2" for multi-round tracking  
✅ **Break Context:** "After Pomodoro 2/4" or "Round complete"  
✅ **Motivating:** X/4 progress is visible and encouraging  
✅ **No Confusion:** No infinite cycle numbers  

**Status:** COMPLETE - Ready for testing  
**Test:** Start Pomodoro in Super Productivity and watch overlay display cycle through a full round
