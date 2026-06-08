# OBS Mode Implementation - Complete Guide

## Overview

This document describes the implementation of the state-based OBS overlay system for Super Productivity. The overlay is designed to be captured by OBS Browser Source and displays a clean 259px sidebar with all productivity information.

---

## State Machine

The overlay uses a clear 6-state machine defined in `src/hooks/useOverlayState.ts`:

### States & Conditions

| State | Conditions | UI Display |
|-------|-----------|------------|
| **FOCUS** | `focusMode.isSessionRunning === true` AND NOT break/paused | Active focus session display |
| **BREAK** | `focusMode.isBreakActive === true` AND `focusMode.isRunning === true` | Break timer + compact tip |
| **BREAK_COMPLETE** | `focusMode.isBreakCompleted === true` | "Break Complete - Ready" message |
| **PAUSED** | `focusMode.isSessionPaused === true` | Paused session display |
| **OVERTIME** | `focusMode.isInOvertime === true` | Overtime mode display |
| **IDLE** | No active session, no task | "Ready to Focus" display |

### State Priority (first match wins)

1. BREAK_COMPLETE (break finished, waiting for next session)
2. BREAK (break active)
3. PAUSED (session paused)
4. OVERTIME (session in overtime)
5. FOCUS (session running OR task tracking)
6. IDLE (nothing active)

### Theme Colors by State

```typescript
FOCUS:           #FFC107 (yellow)    - 🔥
BREAK:           #8B5CF6 (purple)    - ☕
BREAK_COMPLETE:  #F59E0B (orange)    - ✅
PAUSED:          #94A3B8 (gray)      - ⏸
OVERTIME:        #F97316 (red-orange) - 🔥
IDLE:            #6B7280 (gray)      - 🌙
```

---

## Files Changed

### New Files Created

1. **`src/hooks/useOverlayState.ts`**
   - Defines the 6-state overlay state machine
   - Exports `deriveOverlayState()` function
   - Exports `useOverlayState()` hook with theme details
   - Single source of truth for overlay state logic

2. **`src/components/ObsSidebar.tsx`**
   - New OBS-optimized sidebar component
   - Fixed width: 259px
   - Full height (100vh)
   - Contains all sections in compact layout
   - State-aware display logic

3. **`OBS_MODE_IMPLEMENTATION.md`** (this file)
   - Complete documentation
   - State machine reference
   - Testing guide

### Modified Files

1. **`src/App.tsx`**
   - Added import for `ObsSidebar`
   - Added conditional rendering based on `isObsMode`
   - OBS mode: only shows `ObsSidebar`
   - Standard mode: shows header + left sidebar + center area + break banner

2. **`src/index.css`**
   - Added `.obs-mode` class styles
   - Hides header, break banner, center area in OBS mode
   - Ensures transparent background in OBS mode

---

## Layout Structure

### OBS Mode Layout (`?obs=true`)

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌──────────┐                          │
│  │          │                          │
│  │   OBS    │     Transparent Area     │
│  │ Sidebar  │   (your screen content)  │
│  │  259px   │                          │
│  │          │                          │
│  │          │                          │
│  └──────────┘                          │
│                                         │
└─────────────────────────────────────────┘
```

### Standard Mode Layout (default)

```
┌─────────────────────────────────────────┐
│         TopHeader (141px height)        │
├──────────┬──────────────────────────────┤
│  Left    │                              │
│ Sidebar  │      Center Area             │
│ (251px)  │   (screen capture note)      │
│          │                              │
└──────────┴──────────────────────────────┘
```

---

## ObsSidebar Section Layout (259px width)

The sidebar displays sections in this order:

### 1. Mini Header Row (fixed top)
- Clock (HH:MM AM/PM)
- Status pill (emoji + state label)

### 2. Connection Error (if offline)
- Shows when Super Productivity is not connected
- Red alert with "Enable Local REST API" message

### 3. Current Task Section
- Label: "📋 CURRENT TASK"
- Task title (max 2 lines, ellipsis)
- Project name (if available)
- Time spent today vs estimate
- Progress bar (if estimate exists)
- Shows "No active task" when idle

### 4. Session Section (state-dependent)
**Shown during**: FOCUS, BREAK, PAUSED, OVERTIME, BREAK_COMPLETE

- Label: "⏱ SESSION" or "☕ BREAK"
- Main timer (large, center)
- Mode/cycle info (e.g., "Pomodoro • Cycle 2")
- Progress bar
- Stats (Elapsed, Remaining, Duration)
- Special message for BREAK_COMPLETE state

### 5. Break Tip Section (BREAK state only)
- Label: "💡 BREAK TIP"
- Emoji + tip text (max 2 lines)
- Random tip per break session
- Compact design to fit sidebar

### 6. Today Section (always shown)
- Label: "📊 TODAY"
- Focused time today
- Completed today count
- Planned tasks (done/total)
- Planned progress bar
- Estimated remaining time

### 7. Today's Tasks (if available)
- Label: "✅ TASKS (done/total)"
- List of today's tasks (max 5)
- Open tasks first, then done tasks
- Active task highlighted with accent color
- Checkbox + title (max 2 lines each)
- Done tasks have strikethrough

---

## State-Specific Display Logic

### FOCUS State
```
✓ Show current task section
✓ Show session section with focus timer
✓ Show session stats (elapsed, remaining, duration)
✓ Show today section
✓ Show today's tasks
✗ Hide break tip
```

### BREAK State
```
✓ Show current task section (previous task)
✓ Show session section with break timer
✓ Show break tip (compact)
✓ Show today section
✓ Show today's tasks
```

### BREAK_COMPLETE State
```
✓ Show current task section
✓ Show session section with "00:00" + completion message
✓ Show today section
✓ Show today's tasks
✗ Hide break tip
```

### PAUSED State
```
✓ Show current task section
✓ Show session section with paused timer
✓ Show today section
✓ Show today's tasks
✗ Hide break tip
```

### OVERTIME State
```
✓ Show current task section
✓ Show session section with overtime timer
✓ Show today section
✓ Show today's tasks
✗ Hide break tip
```

### IDLE State
```
✓ Show current task section ("No active task" message)
✗ Hide session section
✓ Show today section
✓ Show today's tasks (if any planned for today)
```

---

## CSS Implementation

### OBS Mode Classes

```css
/* Applied to overlay-root when ?obs=true */
.obs-mode {
  background: transparent !important;
}

/* Hides components not needed in OBS mode */
.obs-mode .top-header,
.obs-mode .break-banner,
.obs-mode .center-area,
.obs-mode .spotify-settings {
  display: none !important;
}
```

### Sidebar Styles

```typescript
// ObsSidebar root div
{
  position: 'fixed',
  top: 0,
  left: 0,
  width: '259px',  // EXACTLY 259px as required
  height: '100vh',
  background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.95), rgba(10, 10, 15, 0.95))',
  borderRight: `2px solid rgba(${accentRgb}, 0.15)`,
  padding: '14px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  overflowY: 'auto',
  overflowX: 'hidden',
}
```

---

## Data Sources

### Super Productivity API

The overlay uses these data sources (all via SSE `/events`):

1. **Focus Mode State** (`focusMode` from SSE `focus-mode` event)
   - `isRunning`: overall focus mode active
   - `isSessionRunning`: focus session active
   - `isBreakActive`: break active
   - `isSessionPaused`: session paused
   - `isBreakCompleted`: break finished, waiting for next session
   - `isLongBreak`: long break vs short break
   - `isInOvertime`: session in overtime
   - `mode`: 'Pomodoro' | 'Flowtime' | 'Countdown'
   - `elapsed`: elapsed time (ms)
   - `remaining`: remaining time (ms)
   - `duration`: session duration (ms)
   - `progress`: 0-100%
   - `currentCycle`: current Pomodoro cycle

2. **Current Task** (`currentTask` from SSE `current-task` event)
   - `id`, `title`, `projectId`
   - `timeSpent`, `timeSpentToday`, `timeEstimate`
   - `isDone`

3. **Live Tick** (`tick` from SSE `tick` event every 1 second)
   - Most up-to-date timing data
   - `currentTaskId`, `title`
   - `timeSpent`, `timeSpentToday`, `timeEstimate`
   - `focusMode` sub-object
   - `timestamp`

4. **Today Stats** (polled every 20s from `/stats/today`)
   - `timeSpentToday`: total focused time today
   - `completedToday`: tasks completed today
   - `planned`: { total, done, remaining, progress }
   - `estimateRemaining`: estimated time remaining

5. **Projects** (polled every 60s from `/projects`)
   - Used to resolve project names from `projectId`

6. **Today's Tasks** (polled every 15s from `/tasks?tagId=TODAY&includeDone=true`)
   - List of tasks planned for today
   - Includes both open and done tasks
   - Used to show today's task list

### Data Refresh Rates

- **Focus mode changes**: instant (SSE push)
- **Current task changes**: instant (SSE push)
- **Timer ticks**: every 1 second (SSE)
- **Today stats**: every 20 seconds (HTTP poll)
- **Projects**: every 60 seconds (HTTP poll)
- **Today's tasks**: every 15 seconds (HTTP poll)

---

## Testing Flows

### Setup

1. Start Super Productivity with Local REST API enabled:
   - Settings → Misc → Enable Local REST API
   - Default port: 3876

2. Start the overlay:
   ```bash
   cd overlay_yt-main/straming
   npm run dev
   ```

3. Open in browser:
   - **Standard mode**: `http://localhost:5173`
   - **OBS mode**: `http://localhost:5173?obs=true`

### Test Flow 1: IDLE State

1. Stop all tasks in Super Productivity
2. Stop focus mode if running
3. **Expected**: Sidebar shows:
   - Status: 🌙 READY
   - Current task: "Start a task in Super Productivity"
   - No session section
   - Today stats (if any previous activity)
   - Today's tasks list (if any)

### Test Flow 2: FOCUS State

1. Start a task in Super Productivity
2. Optionally start a Pomodoro/Countdown session
3. **Expected**: Sidebar shows:
   - Status: 🔥 FOCUS
   - Current task with title, project, time
   - Session section with timer
   - Timer counts down (or up for Flowtime)
   - Progress bar animates
   - Today stats update
   - Active task highlighted in task list

### Test Flow 3: PAUSED State

1. During a focus session, pause it
2. **Expected**: Sidebar shows:
   - Status: ⏸ PAUSED
   - Current task still shown
   - Session section with paused timer
   - Timer stops counting
   - Today stats remain

### Test Flow 4: BREAK State

1. Complete a Pomodoro focus session
2. Break starts automatically
3. **Expected**: Sidebar shows:
   - Status: ☕ BREAK (or LONG BREAK)
   - Current task (previous task)
   - Session section with break timer
   - Break tip section appears with random tip
   - Timer counts down
   - Purple/blue accent color

### Test Flow 5: BREAK_COMPLETE State

1. Let break timer reach 0:00
2. Do NOT start next session yet
3. **Expected**: Sidebar shows:
   - Status: ✅ READY
   - Current task
   - Session section with "00:00"
   - Message: "Break finished! Start your next focus session."
   - Break tip disappears
   - Orange accent color

### Test Flow 6: OVERTIME State

1. During a Countdown/Pomodoro session
2. Let timer reach 0 but don't stop
3. Continue working past session end
4. **Expected**: Sidebar shows:
   - Status: 🔥 OVERTIME
   - Current task
   - Session section with overtime time
   - Red-orange accent color

### Test Flow 7: Connection Lost

1. Stop Super Productivity or disable Local REST API
2. **Expected**: Sidebar shows:
   - Red error banner: "SP Offline"
   - Message: "Enable Local REST API in Settings"
   - Last known state preserved
   - Status shows "Reconnecting..."

### Test Flow 8: Connection Restored

1. Restart Super Productivity or re-enable API
2. **Expected**: Sidebar:
   - Error banner disappears
   - Data refreshes within 2 seconds
   - Current state syncs

### Test Flow 9: Task Switching

1. Start task A, work for 2 minutes
2. Switch to task B
3. **Expected**: Sidebar:
   - Current task updates instantly
   - Task list updates within 15 seconds
   - Time tracking reflects new task
   - Focus session continues (if active)

### Test Flow 10: OBS Capture

1. Open `http://localhost:5173?obs=true` in OBS Browser Source
2. Set size: 1920x1080
3. **Expected**:
   - Only 259px left sidebar visible
   - Rest of screen completely transparent
   - No header visible
   - No break banner visible
   - All data displays correctly in sidebar
   - Updates work in real-time

---

## OBS Browser Source Setup

### Recommended Settings

```
URL: http://localhost:5173?obs=true
Width: 1920
Height: 1080
FPS: 30
Custom CSS: (none needed)

☑ Shutdown source when not visible
☑ Refresh browser when scene becomes active
☐ Control audio via OBS
```

### Positioning

The sidebar is fixed to the left edge. You can position your webcam, game capture, or other sources in the remaining transparent area (from x=259px onwards).

### Layout Examples

**Left sidebar + right webcam:**
```
┌─────────┬─────────────────┬─────────┐
│ Sidebar │   Game/Screen   │ Webcam  │
│  259px  │                 │  bubble │
└─────────┴─────────────────┴─────────┘
```

**Left sidebar + fullscreen content:**
```
┌─────────┬─────────────────────────────┐
│ Sidebar │                             │
│  259px  │   Game/Screen/Presentation  │
│         │                             │
└─────────┴─────────────────────────────┘
```

---

## Customization

### Changing Sidebar Width

Edit `src/components/ObsSidebar.tsx`:

```typescript
// Find the root div style
style={{
  width: '259px',  // Change this value
  // ...
}}
```

**Note**: Also update documentation and OBS layout references.

### Changing Colors

Edit `src/hooks/useOverlayState.ts`:

```typescript
const STATE_THEMES: Record<OverlayState, Omit<OverlayStateDetails, 'state'>> = {
  FOCUS: {
    accentColor: '#FFC107',     // Change this
    accentRgb: '255, 193, 7',   // Match RGB values
    // ...
  },
  // ...
}
```

### Adding/Removing Sections

Edit `src/components/ObsSidebar.tsx`:

- Each section is a `<div>` block
- Wrapped in conditional rendering (e.g., `{state === 'BREAK' && <div>...</div>}`)
- Follow existing pattern for consistent spacing

### Changing Break Tips

Edit `BREAK_TIPS_COMPACT` array in `src/components/ObsSidebar.tsx`:

```typescript
const BREAK_TIPS_COMPACT = [
  { emoji: '👀', text: 'Your new tip here.' },
  // Add more...
]
```

---

## Troubleshooting

### Issue: Sidebar not showing

**Check**:
1. URL includes `?obs=true`
2. Super Productivity is running
3. Local REST API is enabled
4. Port 3876 is accessible
5. Browser console for errors

### Issue: Data not updating

**Check**:
1. Connection status in sidebar (should not say "Reconnecting")
2. Super Productivity Local REST API still enabled
3. Network tab in browser dev tools for SSE connection
4. Console for SSE errors

### Issue: Break tip not showing

**Check**:
1. State must be exactly `BREAK` (not `BREAK_COMPLETE`)
2. `focusMode.isBreakActive === true`
3. `focusMode.isRunning === true`

### Issue: Wrong state displayed

**Check**:
1. Review state priority in `src/hooks/useOverlayState.ts`
2. Log `focusMode` and `currentTask` values
3. Verify Super Productivity state matches expectations

### Issue: Sidebar too wide/narrow in OBS

**Check**:
1. OBS Browser Source width is 1920px
2. Sidebar CSS width is 259px
3. No CSS overrides affecting width
4. Browser zoom is 100%

---

## Performance Notes

### Optimizations Implemented

1. **Memoized state derivation**: `useMemo` in `useOverlayState`
2. **Refs for break tips**: Avoid re-render when tip doesn't change
3. **Conditional rendering**: Sections only render when needed
4. **SSE for real-time**: No polling for focus mode or current task
5. **Reasonable poll intervals**: 15s for tasks, 20s for stats, 60s for projects
6. **Line clamping**: `-webkit-line-clamp` for long text instead of JavaScript

### Expected Resource Usage

- **CPU**: < 1% idle, ~2-3% during active updates
- **Memory**: ~20-30 MB
- **Network**: SSE connection + periodic polls (~1-2 KB/s)

---

## Migration from Old Implementation

### Breaking Changes

1. **`deriveActivityState()` deprecated**: Use `useOverlayState()` instead
2. **Header hidden in OBS mode**: Was always visible before
3. **Break banner hidden in OBS mode**: Was conditionally hidden
4. **Sidebar width changed**: 251px → 259px in OBS mode
5. **State machine formalized**: Was implicit, now explicit 6-state machine

### Non-Breaking Changes

1. Standard mode (without `?obs=true`) unchanged
2. Super Productivity API integration unchanged
3. SSE connection logic unchanged
4. Spotify integration unchanged

---

## Future Enhancements

### Possible Additions

1. **Configurable sidebar width**: URL param `?width=300`
2. **Right-side placement**: URL param `?side=right`
3. **Minimal mode**: Even more compact for small screens
4. **Custom theme**: URL param `?theme=custom&accent=00FF00`
5. **Hide specific sections**: URL param `?hide=tasks,tips`
6. **Animations toggle**: URL param `?animate=false`

---

## Support

For issues or questions:

1. Check this documentation first
2. Review browser console for errors
3. Verify Super Productivity Local REST API is working
4. Test in standard mode first, then OBS mode
5. Check OBS browser source settings

---

## Conclusion

The OBS mode implementation provides a clean, state-based overlay that:

✓ Uses exactly 259px width  
✓ Keeps remaining screen transparent  
✓ Shows all productivity data in compact layout  
✓ Updates in real-time via SSE  
✓ Follows clear 6-state machine  
✓ Works seamlessly with OBS Browser Source  
✓ Maintains visual consistency across states  
✓ Optimized for performance  

The implementation is complete and ready for production use.
