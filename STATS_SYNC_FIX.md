# Stats Synchronization Fix

## Problem
The overlay was showing "Cycle 4/4 • 0 completed" even though Focus Timer showed "11m Pomodoros" and "2m Breaks". The pomodoro completion stats were not syncing correctly.

## Root Causes

### 1. BigInt Serialization Error
**Issue**: The bridge was crashing when trying to query session state because it attempted to log cycle data containing BigInt values using `JSON.stringify()`.

**Error**: `Do not know how to serialize a BigInt`

**Location**: `straming/bridge/src/state-query.ts` line 113

**Fix**: Removed the problematic `JSON.stringify()` logging and added safe logging that doesn't serialize BigInt values directly.

### 2. Time Unit Mismatch
**Issue**: The code was treating Session interface timestamps as microseconds when they're actually in milliseconds.

**D-Bus Interface Documentation**:
- **Timer interface**: Uses **microseconds** for all time values
- **Session interface**: Uses **milliseconds** for timestamps (StartTime, EndTime, cycle times)

**Location**: `straming/bridge/src/state-query.ts` - session state conversion

**Fix**: Changed from `DBusClient.microsecondsToSeconds()` to direct milliseconds-to-seconds conversion (`Number(value) / 1000`).

### 3. Cycle Completion Detection
**Issue**: The logic for detecting completed pomodoros needed to properly handle BigInt values from D-Bus.

**Fix**: Improved the cycle filtering logic to:
- Check if `completion_time` exists
- Handle both BigInt and number types
- Compare against `BigInt(0)` instead of `Number()`

## Changes Made

### File: `straming/bridge/src/state-query.ts`

1. **Removed problematic logging** (line ~113):
   ```typescript
   // REMOVED: console.log with JSON.stringify that caused BigInt error
   ```

2. **Fixed time unit conversion** (lines ~120-122):
   ```typescript
   // BEFORE: Using microseconds converter (wrong!)
   startTime: DBusClient.microsecondsToSeconds(startTime),
   endTime: DBusClient.microsecondsToSeconds(endTime),
   
   // AFTER: Direct milliseconds to seconds conversion (correct!)
   startTime: Number(startTime) / 1000,
   endTime: Number(endTime) / 1000,
   ```

3. **Improved cycle completion detection** (lines ~95-107):
   ```typescript
   const pomodorosCompleted = cycles.filter((cycle: any) => {
     if (!cycle.completion_time) return false;
     
     const completionTime = typeof cycle.completion_time === 'bigint' 
       ? cycle.completion_time 
       : BigInt(cycle.completion_time);
     
     return completionTime > BigInt(0);
   }).length;
   ```

4. **Added safe debug logging** (lines ~113-117):
   ```typescript
   console.log('[StateQuery] Session stats:', {
     totalCycles: cycles.length,
     pomodorosCompleted,
     currentCycle
   });
   ```

## Testing

To verify the fix:

1. **Start Focus Timer**:
   ```bash
   flatpak run io.github.focustimerhq.FocusTimer
   ```

2. **Start the bridge** (in a new terminal):
   ```bash
   cd straming/bridge
   npm run dev
   ```

3. **Start the overlay** (in a new terminal):
   ```bash
   cd straming
   npm run dev
   ```

4. **Complete some pomodoros** in Focus Timer

5. **Check the overlay** - it should now show:
   - Correct cycle number (e.g., "Cycle 2/4")
   - Correct completed count (e.g., "1 completed")
   - Stats should match what Focus Timer shows

6. **Check bridge logs** - you should see:
   ```
   [StateQuery] Session stats: { totalCycles: 2, pomodorosCompleted: 1, currentCycle: 2 }
   ```

## Expected Behavior

After the fix:
- ✅ Bridge successfully queries session state without crashing
- ✅ `pomodorosCompleted` correctly counts completed cycles
- ✅ Overlay displays accurate pomodoro completion stats
- ✅ Stats sync in real-time with Focus Timer
- ✅ No BigInt serialization errors in logs

## Related Files

- `straming/bridge/src/state-query.ts` - Session state query logic (FIXED)
- `straming/bridge/src/types.ts` - Type definitions
- `straming/src/components/LeftSidebarNew.tsx` - Displays stats in overlay
- `straming/src/components/TopHeader.tsx` - Displays stats in header
- `FocusTimer/data/io.github.focustimerhq.FocusTimer.Session.xml` - D-Bus interface documentation
- `FocusTimer/data/io.github.focustimerhq.FocusTimer.Timer.xml` - D-Bus interface documentation

## Notes

- The Timer interface uses **microseconds** for all time values
- The Session interface uses **milliseconds** for timestamps
- Cycle data from `ListCycles()` contains BigInt values that cannot be directly serialized with `JSON.stringify()`
- Always use safe logging when dealing with D-Bus data structures
