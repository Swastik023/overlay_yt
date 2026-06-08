# Pomodoro Round Logic - OBS Overlay

## Terminology

### Pomodoro
- **One Pomodoro** = One focus session (25 minutes work)
- NOT the same as "cycle" in the backend

### Cycle (Backend)
- **One Cycle** = One focus session + its break
- Backend uses `currentCycle` which counts up infinitely (1, 2, 3, 4, 5, 6...)

### Round (Display)
- **One Round** = 4 Pomodoros (cycles 1-4)
- After 4 Pomodoros and the long break, the round is complete
- Next round starts fresh at Pomodoro 1/4

## Visual Display Logic

### Pomodoro Progress

Instead of showing "Cycle 5" (confusing), show:
- **Pomodoro 1/4** (first Pomodoro in round)
- **Pomodoro 2/4** (second Pomodoro in round)
- **Pomodoro 3/4** (third Pomodoro in round)
- **Pomodoro 4/4** (fourth Pomodoro in round)

### Round Number

When showing multiple rounds:
- **Round 1** - First 4 Pomodoros
- **Round 2** - Next 4 Pomodoros (cycles 5-8)
- **Round 3** - Next 4 Pomodoros (cycles 9-12)

### Calculation

```typescript
// Backend gives us currentCycle: 1, 2, 3, 4, 5, 6, 7, 8, 9...
const rawCycle = focusMode?.currentCycle ?? 0

// Calculate position within current round (1-4)
const pomodoroInRound = ((rawCycle - 1) % 4) + 1

// Calculate which round we're in (1, 2, 3...)
const currentRound = Math.floor((rawCycle - 1) / 4) + 1

// Examples:
// rawCycle = 1 → pomodoroInRound = 1, currentRound = 1
// rawCycle = 2 → pomodoroInRound = 2, currentRound = 1
// rawCycle = 4 → pomodoroInRound = 4, currentRound = 1
// rawCycle = 5 → pomodoroInRound = 1, currentRound = 2
// rawCycle = 8 → pomodoroInRound = 4, currentRound = 2
```

## Break Logic

### Short Break
- After Pomodoro 1, 2, or 3
- 5 minutes (configurable in Super Productivity)
- Display: "Short Break" + "After Pomodoro X/4"

### Long Break
- After Pomodoro 4
- 15-30 minutes (configurable in Super Productivity)
- Display: "Round complete"
- After long break: "Ready • Start next round"

### Determining Break Type

```typescript
const isLongBreakCycle = pomodoroInRound === 4
const isRoundComplete = isLongBreakCycle && (state === 'BREAK' || state === 'READY')
```

## Display Examples

### Focus Session

#### Pomodoro 1/4
```
⏱ SESSION
   24:58
Pomodoro 1/4
████████░░
```

#### Pomodoro 2/4 in Round 2
```
⏱ SESSION
   24:58
Pomodoro 2/4
Round 2
████████░░
```

#### Pomodoro 4/4
```
⏱ SESSION
   24:58
Pomodoro 4/4
████████░░
```

### Break

#### Short Break (after Pomodoro 2/4)
```
🌙 BREAK
   04:32
Short Break
After Pomodoro 2/4
████░░░░░░
```

#### Long Break (after Pomodoro 4/4)
```
🌙 BREAK
   14:26
Round complete
███████░░░
```

### Ready State

#### After Short Break
```
✅ READY

Break complete
Start next focus session
```

#### After Long Break (Round Complete)
```
✅ READY

Ready • Start next round
```

## Complete Round Flow

### Round 1

```
1. FOCUS: "Pomodoro 1/4"
   ↓ (25 min)
2. BREAK: "Short Break" + "After Pomodoro 1/4"
   ↓ (5 min)
3. READY: "Break complete"
   ↓ Start next
4. FOCUS: "Pomodoro 2/4"
   ↓ (25 min)
5. BREAK: "Short Break" + "After Pomodoro 2/4"
   ↓ (5 min)
6. READY: "Break complete"
   ↓ Start next
7. FOCUS: "Pomodoro 3/4"
   ↓ (25 min)
8. BREAK: "Short Break" + "After Pomodoro 3/4"
   ↓ (5 min)
9. READY: "Break complete"
   ↓ Start next
10. FOCUS: "Pomodoro 4/4"
    ↓ (25 min)
11. BREAK: "Round complete" (long break)
    ↓ (15 min)
12. READY: "Ready • Start next round"
```

### Round 2

```
13. FOCUS: "Pomodoro 1/4" + "Round 2"
    ↓ (25 min)
14. BREAK: "Short Break" + "After Pomodoro 1/4"
    ↓ (5 min)
...
[continues same pattern]
```

## State-Specific Display Logic

### FOCUS State
```typescript
if (isPomodoro && pomodoroInRound > 0) {
  // Show "Pomodoro X/4"
  mainLabel = `Pomodoro ${pomodoroInRound}/4`
  
  if (currentRound > 1) {
    // Show round number below
    subLabel = `Round ${currentRound}`
  }
}
```

### BREAK State
```typescript
if (isPomodoro && isRoundComplete) {
  // Long break after 4th Pomodoro
  mainLabel = 'Round complete'
} else if (focusMode?.isLongBreak) {
  mainLabel = 'Long Break'
} else {
  mainLabel = 'Short Break'
}

if (isPomodoro && pomodoroInRound > 0 && !isRoundComplete) {
  // Show which Pomodoro this break follows
  subLabel = `After Pomodoro ${pomodoroInRound}/4`
}
```

### READY State
```typescript
if (isPomodoro && isRoundComplete) {
  // After long break - ready for new round
  mainLabel = 'Ready • Start next round'
} else {
  // After short break - ready for next Pomodoro
  mainLabel = 'Break complete'
  subLabel = 'Start next focus session'
}
```

## Benefits

### ✅ Clear Progress
- User knows: "I'm on Pomodoro 2 out of 4"
- Not confusing: "What does Cycle 5 mean?"

### ✅ Round Awareness
- User knows: "I've completed 1 round, working on round 2"
- Motivating: "Only 2 more Pomodoros to complete this round"

### ✅ Break Context
- Short break: "This was after Pomodoro 2/4"
- Long break: "Round complete! Time for longer rest"

### ✅ Natural Flow
- After round completes, display resets to Pomodoro 1/4
- User feels fresh start for new round

## Testing

### Test Scenario 1: First Round
```
Cycle 1 → Display: "Pomodoro 1/4"
Cycle 2 → Display: "Pomodoro 2/4"
Cycle 3 → Display: "Pomodoro 3/4"
Cycle 4 → Display: "Pomodoro 4/4"
Break after Cycle 4 → Display: "Round complete"
Ready after Cycle 4 → Display: "Ready • Start next round"
```

### Test Scenario 2: Second Round
```
Cycle 5 → Display: "Pomodoro 1/4" + "Round 2"
Cycle 6 → Display: "Pomodoro 2/4" + "Round 2"
Cycle 7 → Display: "Pomodoro 3/4" + "Round 2"
Cycle 8 → Display: "Pomodoro 4/4" + "Round 2"
Break after Cycle 8 → Display: "Round complete"
```

### Test Scenario 3: Third Round
```
Cycle 9 → Display: "Pomodoro 1/4" + "Round 3"
...
```

## Implementation Status

### Files Modified
- ✅ `ObsSidebar.tsx` - Pomodoro round logic added
  - Calculate `pomodoroInRound` (1-4)
  - Calculate `currentRound` (1, 2, 3...)
  - Detect `isRoundComplete`
  - Update display messages per state

### Display Logic
- ✅ FOCUS: "Pomodoro X/4" + optional "Round N"
- ✅ BREAK: "Short Break" + "After Pomodoro X/4" OR "Round complete"
- ✅ READY: "Break complete" OR "Ready • Start next round"

### Visual Examples Match Spec
- ✅ No confusing "Cycle 5" displays
- ✅ Clear X/4 progress
- ✅ Round complete messaging
- ✅ Next round messaging

---

## Summary

**Before:**
- "Cycle 5" ❌ (confusing)
- No round awareness
- No progress visibility

**After:**
- "Pomodoro 2/4" ✅ (clear progress)
- "Round 2" ✅ (round awareness)
- "Round complete" ✅ (long break context)
- "Ready • Start next round" ✅ (fresh start)

**Result:** Clear, motivating, easy to understand Pomodoro progress display.
