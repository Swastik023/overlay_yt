# Focus Timer Pattern Audit

## How Focus Timer Actually Works

Based on the source code analysis (`FocusTimer/src/core/session.vala` lines 229-256), here's the **actual pattern**:

### Code Logic

```vala
for (var cycle = 1U; cycle <= template.cycles; cycle++)
{
    var needs_long_break = cycle >= template.cycles;  // TRUE only on last cycle
    
    // Add pomodoro
    var pomodoro_time_block = new Ft.TimeBlock(...);
    
    // Add break (short or long)
    var break_time_block = new Ft.TimeBlock(
        needs_long_break ? Ft.State.LONG_BREAK : Ft.State.SHORT_BREAK
    );
}
```

### Default Settings (from gschema.xml)

```xml
<key name="pomodoro-duration" type="u">
  <default>1500</default>  <!-- 25 minutes -->
</key>
<key name="short-break-duration" type="u">
  <default>300</default>   <!-- 5 minutes -->
</key>
<key name="long-break-duration" type="u">
  <default>900</default>   <!-- 15 minutes -->
</key>
<key name="cycles" type="u">
  <default>4</default>     <!-- 4 pomodoros before long break -->
</key>
```

---

## The Actual Pattern

### ✅ YES - Focus Timer DOES Work Like This:

```
Set 1:
├─ Cycle 1: Pomodoro (25m) → Short Break (5m)
├─ Cycle 2: Pomodoro (25m) → Short Break (5m)
├─ Cycle 3: Pomodoro (25m) → Short Break (5m)
└─ Cycle 4: Pomodoro (25m) → Long Break (15m) ← Then session ends!
```

**Key Logic:**
- `needs_long_break = cycle >= template.cycles`
- This means **ONLY the 4th cycle gets a long break**
- Cycles 1, 2, 3 get short breaks
- Cycle 4 gets a long break

---

## Why You Saw Short Breaks After 4 Pomodoros

Looking at your screenshot, you were on a **short break** after completing 4 pomodoros. This could happen if:

### Possibility 1: You Skipped the Long Break
- You completed the 4th pomodoro
- Focus Timer offered a long break (15 min)
- You skipped it and started a new session
- The new session started with cycle 1 → short break

### Possibility 2: Custom Settings
- Your Focus Timer might have custom settings
- Check if `cycles` is set to something other than 4
- Or if `long-break-duration` is set to 5 minutes (same as short break)

### Possibility 3: Session Reset
- After completing a full session (4 pomodoros + long break)
- A new session automatically starts
- You're now on cycle 1 of the new session → short break

---

## How to Verify Your Settings

Run this command to check your actual Focus Timer settings:

```bash
gsettings get io.github.focustimerhq.FocusTimer cycles
gsettings get io.github.focustimerhq.FocusTimer pomodoro-duration
gsettings get io.github.focustimerhq.FocusTimer short-break-duration
gsettings get io.github.focustimerhq.FocusTimer long-break-duration
```

**Expected output:**
```
uint32 4
uint32 1500
uint32 300
uint32 900
```

---

## What Your Overlay Should Show

Based on the Focus Timer pattern, here's what the overlay should display:

### During First Session

| Pomodoro # | After Completing | Display | Break Type |
|------------|------------------|---------|------------|
| 1st | Cycle 1/4 • 1 completed | ●○○○ | Short (5m) |
| 2nd | Cycle 2/4 • 2 completed | ●●○○ | Short (5m) |
| 3rd | Cycle 3/4 • 3 completed | ●●●○ | Short (5m) |
| 4th | Cycle 4/4 • 4 completed | ●●●● | **Long (15m)** |

### After Long Break (New Session Starts)

| Pomodoro # | After Completing | Display | Break Type |
|------------|------------------|---------|------------|
| 5th | Cycle 1/4 • 5 completed | ●○○○ | Short (5m) |
| 6th | Cycle 2/4 • 6 completed | ●●○○ | Short (5m) |
| 7th | Cycle 3/4 • 7 completed | ●●●○ | Short (5m) |
| 8th | Cycle 4/4 • 8 completed | ●●●● | **Long (15m)** |

---

## Your Current Situation Explained

**"Cycle 1/4 • 4 completed"** means:

✅ You completed 4 pomodoros (a full session)  
✅ You took (or skipped) the long break  
✅ A new session started automatically  
✅ You're now on the **1st pomodoro of the 2nd session**  
✅ After this pomodoro, you'll get a **short break** (5m)  

This is **correct behavior** according to Focus Timer's design!

---

## Session Lifecycle

```
Session 1:
  Pomodoro 1 → Short Break
  Pomodoro 2 → Short Break
  Pomodoro 3 → Short Break
  Pomodoro 4 → Long Break (15m)
  ↓
[Session Ends - New Session Starts]
  ↓
Session 2:
  Pomodoro 5 → Short Break  ← You are here!
  Pomodoro 6 → Short Break
  Pomodoro 7 → Short Break
  Pomodoro 8 → Long Break (15m)
  ↓
[Session Ends - New Session Starts]
  ↓
Session 3:
  Pomodoro 9 → Short Break
  ...
```

---

## Conclusion

✅ **YES** - Focus Timer works exactly as described  
✅ Long break comes after the 4th pomodoro  
✅ After the long break, a new session starts  
✅ The cycle counter resets to 1/4 for the new session  
✅ Your overlay is displaying this correctly  

The pattern you saw (short break after 4 completed) means you're in a **new session**, which is the expected behavior!

---

## Recommendation

To make this clearer in the overlay, we could add a visual indicator for:
- "Long Break Next!" when on Cycle 4/4
- "New Session" when cycle resets to 1/4 after completing 4

But the current behavior is **technically correct** according to Focus Timer's design.
