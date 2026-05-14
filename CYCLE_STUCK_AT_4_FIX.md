# Cycle Stuck at 4/4 Fix

## Problem

The overlay was stuck showing "Cycle 4/4 • 4 completed" even after completing more pomodoros. It wasn't resetting to "Cycle 1/4" when starting the 5th pomodoro.

## Root Cause Analysis

### What We Discovered from Logs

```
[StateQuery] Session stats: {
  totalCycles: 18,
  pomodorosCompleted: 4,
  currentCyclePosition: 4
}
```

- **Total cycles**: 18 (includes both pomodoros AND breaks)
- **Completed pomodoros**: Only 4 (cycles with `completion_time > 0`)
- **Incomplete cycles**: 14 (cycles with `completion_time = -1`)

### The Real Issue

The calculation was correct for counting completed pomodoros (4), but the cycle position logic didn't account for the **current timer state** (pomodoro vs break).

**The cycle number should represent:**
- **During a pomodoro**: Which pomodoro you're working on
- **During a break**: Which pomodoro you just completed

## The Fix

### New Logic (state-query.ts)

```typescript
if (currentState === 'pomodoro' || currentState === 'stopped') {
  // During a pomodoro, show which one we're working on
  // 0 completed = cycle 1, 1 completed = cycle 2, etc.
  currentCycle = (pomodorosCompleted % 4) + 1;
} else {
  // During a break, show which pomodoro we just completed
  // 1 completed = cycle 1, 2 completed = cycle 2, etc.
  const justCompleted = pomodorosCompleted % 4;
  currentCycle = justCompleted === 0 ? 4 : justCompleted;
}
```

### How It Works

**Scenario 1: During Pomodoro**
- 0 completed, on pomodoro → Cycle 1 (working on 1st)
- 1 completed, on pomodoro → Cycle 2 (working on 2nd)
- 4 completed, on pomodoro → Cycle 1 (working on 5th, new set!)

**Scenario 2: During Break**
- 1 completed, on break → Cycle 1 (just finished 1st)
- 4 completed, on break → Cycle 4 (just finished 4th)
- 4 completed, on long break → Cycle 4 (just finished 4th)

### Cycle Dots Logic

```typescript
const completedInCurrentSet = pomodorosCompleted % 4 === 0 && pomodorosCompleted > 0
  ? 4  // Just completed a full set
  : pomodorosCompleted % 4; // Partial set

const isFilled = i <= completedInCurrentSet;
```

**Visual Examples:**
- 1 completed: ●○○○ (1 dot)
- 4 completed: ●●●● (4 dots)
- 4 completed, start 5th: ●○○○ (resets to 1 dot)

## Expected Behavior After Fix

### Your Current Situation
- **State**: Short break after 4th pomodoro
- **Display**: "Cycle 4/4 • 4 completed" ✅ CORRECT
- **Dots**: ●●●● (all 4 filled) ✅ CORRECT

### When You Start 5th Pomodoro
- **State**: Pomodoro (5th)
- **Display**: "Cycle 1/4 • 4 completed" ✅ (cycle resets, count stays)
- **Dots**: ●○○○ (1 filled, new set begins)

### After Completing 5th Pomodoro
- **State**: Break
- **Display**: "Cycle 1/4 • 5 completed" ✅
- **Dots**: ●○○○ (1 filled)

### After Completing 8th Pomodoro
- **State**: Break
- **Display**: "Cycle 4/4 • 8 completed" ✅
- **Dots**: ●●●● (all 4 filled again)

## Why This Matters

1. **Cycle number shows progress within current set** (1-4)
2. **Completed count shows lifetime total** (keeps growing)
3. **Dots visually show progress in current set** (resets every 4)
4. **Cycle 4/4 signals long break is coming** (important for pacing)

## Testing

After rebuilding the bridge:

```bash
cd straming/bridge
npm run build
npm run dev
```

**Test Sequence:**
1. ✅ Complete 4 pomodoros → Should show "Cycle 4/4 • 4 completed"
2. ✅ Start 5th pomodoro → Should show "Cycle 1/4 • 4 completed"
3. ✅ Complete 5th pomodoro → Should show "Cycle 1/4 • 5 completed"
4. ✅ Dots should reset from ●●●● to ●○○○ when starting 5th

## Debug Logs

You should see logs like:
```
[StateQuery] Session stats: {
  totalCycles: 18,
  pomodorosCompleted: 4,
  currentState: 'short-break',
  currentCyclePosition: 4,
  logic: 'just completed'
}
```

When you start the 5th pomodoro:
```
[StateQuery] Session stats: {
  totalCycles: 19,
  pomodorosCompleted: 4,
  currentState: 'pomodoro',
  currentCyclePosition: 1,
  logic: 'working on next'
}
```

## Files Changed

1. **straming/bridge/src/state-query.ts**
   - Added state-aware cycle calculation
   - Added debug logging with current state
   - Fixed completion_time extraction from D-Bus Variants

2. **straming/src/components/LeftSidebarNew.tsx**
   - Updated cycle dots logic to match new calculation
   - Simplified dot filling logic

## Key Insight

The cycle position depends on **both** the number of completed pomodoros **and** the current timer state (pomodoro vs break). This ensures the display accurately reflects what the user is doing right now.
