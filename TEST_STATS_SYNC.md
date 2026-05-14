# Testing Stats Synchronization

## Quick Test Guide

### Setup (3 terminals)

**Terminal 1 - Focus Timer**:
```bash
flatpak run io.github.focustimerhq.FocusTimer
```

**Terminal 2 - Bridge Service**:
```bash
cd straming/bridge
npm run dev
```

**Terminal 3 - Overlay**:
```bash
cd straming
npm run dev
```

Then open browser to: `http://localhost:5174`

### What to Test

1. **Initial State**
   - Overlay should show: "Cycle 1/4 • 0 completed"
   - Bridge logs should show: `[StateQuery] Session stats: { totalCycles: 1, pomodorosCompleted: 0, currentCycle: 1 }`

2. **Start a Pomodoro**
   - In Focus Timer, start a pomodoro
   - Overlay timer should start counting down
   - Stats should remain: "Cycle 1/4 • 0 completed"

3. **Complete First Pomodoro**
   - Let the pomodoro finish (or skip it)
   - Overlay should update to: "Cycle 2/4 • 1 completed"
   - Bridge logs should show: `[StateQuery] Session stats: { totalCycles: 2, pomodorosCompleted: 1, currentCycle: 2 }`

4. **Complete Second Pomodoro**
   - Complete another pomodoro
   - Overlay should update to: "Cycle 3/4 • 2 completed"
   - Bridge logs should show: `[StateQuery] Session stats: { totalCycles: 3, pomodorosCompleted: 2, currentCycle: 3 }`

5. **Check TopHeader**
   - TopHeader should also show correct count: "Deep Focus Session • 2 Pomodoros Completed"

### Expected Results

✅ **Stats sync correctly**:
- Cycle number increments after each pomodoro
- Completed count increments after each pomodoro
- Stats match between Focus Timer and overlay

✅ **No errors in bridge logs**:
- No "Do not know how to serialize a BigInt" errors
- Session state queries succeed
- Stats are calculated correctly

✅ **Real-time updates**:
- Stats update immediately when pomodoro completes
- No delay or lag in synchronization

### Common Issues

❌ **"0 completed" never changes**:
- Check bridge logs for errors
- Verify Focus Timer is running and completing pomodoros
- Check that `completion_time` field exists in cycle data

❌ **Bridge crashes with BigInt error**:
- Make sure you rebuilt the bridge after the fix
- Check that you're running the latest code

❌ **Stats don't match Focus Timer**:
- Check bridge logs for session stats
- Verify cycle counting logic
- Check that time unit conversion is correct (milliseconds vs microseconds)

### Debug Commands

**Check bridge is running**:
```bash
ps aux | grep focus-timer-bridge
```

**Check D-Bus connection**:
```bash
dbus-send --session --print-reply \
  --dest=io.github.focustimerhq.FocusTimer \
  /io/github/focustimerhq/FocusTimer \
  io.github.focustimerhq.FocusTimer.Session.ListCycles
```

**Check WebSocket connection**:
```bash
# In browser console
console.log(window.location.href)
# Should show: http://localhost:5174
```

### Success Criteria

The fix is working correctly when:
1. ✅ Bridge starts without errors
2. ✅ Session state queries succeed (no BigInt errors)
3. ✅ Overlay displays correct cycle number
4. ✅ Overlay displays correct completed count
5. ✅ Stats update in real-time
6. ✅ Stats match Focus Timer exactly
7. ✅ No crashes or errors in any component

### Next Steps

If stats are syncing correctly:
- ✅ Mark Task 9 as complete
- ✅ Continue with remaining integration tasks
- ✅ Test with longer sessions (multiple pomodoros)
- ✅ Test reconnection behavior (restart bridge while overlay is running)
