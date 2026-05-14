# Cycle Calculation Fix

## Problem

The overlay was showing **"Cycle 13/4 • 4 completed"** which is incorrect. The cycle number should always be between 1-4, not 13.

## Root Cause

### Bridge Calculation (state-query.ts)
```typescript
// WRONG ❌
const currentCycle = Math.max(1, cycles.length);
```

This was returning the **total number of cycles** (13) instead of the **position within the 4-cycle pattern** (1-4).

### Display Logic
The overlay was directly displaying this wrong value: `Cycle {currentCycle}/4`

### Cycle Dots Logic
The dots were using a different calculation (`pomodorosCompleted % 4`) which didn't match the cycle display, causing visual inconsistency.

## Understanding Pomodoro Cycles

**The 4-Cycle Pattern:**
1. **Cycle 1**: Pomodoro (25min) → Short Break (5min)
2. **Cycle 2**: Pomodoro (25min) → Short Break (5min)
3. **Cycle 3**: Pomodoro (25min) → Short Break (5min)
4. **Cycle 4**: Pomodoro (25min) → **Long Break (15min)** ← Reset to Cycle 1

**After completing pomodoros:**
- 0 completed → Cycle 1/4 (no dots filled)
- 1 completed → Cycle 1/4 (1 dot filled)
- 2 completed → Cycle 2/4 (2 dots filled)
- 3 completed → Cycle 3/4 (3 dots filled)
- 4 completed → Cycle 4/4 (4 dots filled)
- 5 completed → Cycle 1/4 (1 dot filled) ← **Wraps around**
- 6 completed → Cycle 2/4 (2 dots filled)
- ...and so on

## The Fix

### 1. Bridge Calculation (state-query.ts)

```typescript
// CORRECT ✅
const currentCycle = pomodorosCompleted === 0 
  ? 1 
  : ((pomodorosCompleted - 1) % 4) + 1;
```

**How it works:**
- If 0 completed: return 1 (starting position)
- Otherwise: `(completed - 1) % 4 + 1`
  - Subtract 1 to make it 0-indexed
  - Modulo 4 to get position in pattern (0-3)
  - Add 1 to make it 1-indexed (1-4)

**Examples:**
- 1 completed: `(1-1) % 4 + 1 = 0 + 1 = 1` → Cycle 1
- 2 completed: `(2-1) % 4 + 1 = 1 + 1 = 2` → Cycle 2
- 4 completed: `(4-1) % 4 + 1 = 3 + 1 = 4` → Cycle 4
- 5 completed: `(5-1) % 4 + 1 = 0 + 1 = 1` → Cycle 1 (wraps)
- 13 completed: `(13-1) % 4 + 1 = 0 + 1 = 1` → Cycle 1

### 2. Cycle Dots Logic (LeftSidebarNew.tsx)

```typescript
// CORRECT ✅
const completedInCurrentSet = pomodorosCompleted === 0 
  ? 0 
  : ((pomodorosCompleted - 1) % 4) + 1;
const isFilled = i <= completedInCurrentSet;
```

**How it works:**
- Uses the same calculation as currentCycle
- Fills dots 1 through `completedInCurrentSet`
- Wraps around after 4 pomodoros

**Visual Result:**
- 1 completed: ●○○○ (1 dot filled)
- 2 completed: ●●○○ (2 dots filled)
- 3 completed: ●●●○ (3 dots filled)
- 4 completed: ●●●● (4 dots filled)
- 5 completed: ●○○○ (1 dot filled, wraps around)

## Expected Behavior After Fix

### Scenario 1: Fresh Start
- **Display**: "Cycle 1/4 • 0 completed"
- **Dots**: ○○○○ (none filled)

### Scenario 2: After 1 Pomodoro
- **Display**: "Cycle 1/4 • 1 completed"
- **Dots**: ●○○○ (1 filled)

### Scenario 3: After 4 Pomodoros
- **Display**: "Cycle 4/4 • 4 completed"
- **Dots**: ●●●● (all filled)
- **Next**: Long break (15 min)

### Scenario 4: After 5 Pomodoros (Your Case)
- **Display**: "Cycle 1/4 • 5 completed"
- **Dots**: ●○○○ (1 filled, pattern restarted)

### Scenario 5: After 13 Pomodoros (What You Saw)
- **Before Fix**: "Cycle 13/4 • 4 completed" ❌
- **After Fix**: "Cycle 1/4 • 13 completed" ✅
- **Dots**: ●○○○ (1 filled)
- **Calculation**: `(13-1) % 4 + 1 = 1`

## Files Changed

1. **straming/bridge/src/state-query.ts**
   - Fixed `currentCycle` calculation to use modulo pattern
   - Added debug logging with calculation details

2. **straming/src/components/LeftSidebarNew.tsx**
   - Fixed cycle dots logic to match currentCycle calculation
   - Added comments explaining the logic

## Testing

After rebuilding the bridge:

```bash
cd straming/bridge
npm run build
npm run dev
```

You should see in the logs:
```
[StateQuery] Session stats: {
  totalCycles: 13,
  pomodorosCompleted: 4,
  currentCyclePosition: 4,
  calculation: '(4 - 1) % 4 + 1 = 4'
}
```

And in the overlay:
- **Correct**: "Cycle 4/4 • 4 completed"
- **Dots**: ●●●● (all 4 filled)

## Why This Matters

1. **User Understanding**: "Cycle 13/4" is confusing and looks like a bug
2. **Visual Consistency**: Dots should match the cycle number
3. **Pomodoro Technique**: The 4-cycle pattern is fundamental to the technique
4. **Long Break Indicator**: Cycle 4/4 signals that a long break is coming next

## Improvements Made

✅ Cycle number now correctly shows position in 4-cycle pattern (1-4)
✅ Cycle dots visually match the cycle number
✅ Total completed count still shows lifetime pomodoros
✅ Pattern correctly wraps around after 4 cycles
✅ Debug logging shows calculation for troubleshooting
