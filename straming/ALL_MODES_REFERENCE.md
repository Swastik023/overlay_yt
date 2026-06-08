# All Modes Reference - Complete Guide

---

## Super Productivity Focus Modes (3 Types)

These are the **focus mode types** you can choose in Super Productivity:

| Mode | Description | Timer Behavior | Breaks |
|------|-------------|----------------|--------|
| **Pomodoro** | Classic 25/5 technique | Fixed duration (default 25 min) | Auto-scheduled after each session |
| **Flowtime** | Flow state tracking | Counts up (no fixed duration) | Manual break when you end session |
| **Countdown** | Custom timer | Fixed duration (you set) | No automatic breaks |

### Mode Details

#### 1. Pomodoro 🍅
- **Work sessions**: 25 minutes (configurable)
- **Short breaks**: 5 minutes (after cycles 1, 2, 3)
- **Long breaks**: 15 minutes (after cycle 4)
- **Cycles**: Tracks 1-4, then resets for new round
- **Break behavior**:
  - On natural timer expiry → break auto-starts
  - On **manual** "Complete focus session" → break is *offered* (you start it manually)
- **Best for**: Structured work with regular breaks

#### 2. Flowtime ⏱️
- **Work sessions**: No fixed duration (counts up)
- **Breaks**: You decide when to take them
- **Break duration**: Suggested based on work time
- **Cycles**: Not tracked
- **Auto-break**: No (shows break offer)
- **Best for**: Deep work, creative tasks, flow states

#### 3. Countdown ⏳
- **Work sessions**: You set the duration
- **Breaks**: No automatic breaks
- **Cycles**: Not tracked
- **Auto-break**: No
- **Best for**: Timed tasks, meetings, specific durations

---

## Overlay States (9 internal states / 8 display groups)

These are the **overlay display states** that viewers see in the OBS overlay. They are derived purely from real backend flags — no fragile history tracking.

### State Priority Logic

The overlay determines which state to show based on this **exact priority** (first match wins):

```typescript
1. If !connected            → DISCONNECTED
2. Else if isBreakOffer      → READY_TO_BREAK   // focus done, break offered (see note)
3. Else if isSessionPaused   → PAUSED
4. Else if isInOvertime      → OVERTIME
5. Else if isBreakActive     → BREAK            // only a *running* break reaches here
6. Else if isSessionRunning  → FOCUS
7. Else if isBreakCompleted  → READY_TO_FOCUS   // break done, awaiting next focus
8. Else if currentTask       → TASK_SELECTED    // selected, but nothing running
9. Else                      → IDLE
```

> **Important note on ordering:** An *offered* break (after manually completing a
> focus session, or ending a Flowtime session) has a timer of
> `{ purpose: 'break', isRunning: false }`. The backend reports this as BOTH
> `isBreakActive=true` AND `isSessionPaused=true`. The `isBreakOffer` flag
> (exposed from the BreakOffer UI state) is checked **first** to disambiguate it
> from a genuinely paused break — otherwise an offered break would wrongly show
> as PAUSED.

### Why TASK_SELECTED instead of READY?

Having a current task does **not** mean "ready to start the next step". It just
means a task is selected while nothing is running. That is distinct from:
- **READY_TO_FOCUS** — a break just completed; start the next focus session.
- **READY_TO_BREAK** — a focus session just completed; start the break.

So a selected-but-idle task shows `TASK_SELECTED` ("Start focus session"),
never `READY`.

### Display groups

The fine-grained states map to coarse display groups for shared styling:

| Internal state | Display group | Label |
|----------------|---------------|-------|
| FOCUS | FOCUS | FOCUS |
| BREAK | BREAK | BREAK |
| READY_TO_BREAK | READY | READY |
| READY_TO_FOCUS | READY | READY |
| TASK_SELECTED | TASK_SELECTED | SELECTED |
| PAUSED | PAUSED | PAUSED |
| OVERTIME | OVERTIME | OVERTIME |
| IDLE | IDLE | IDLE |
| DISCONNECTED | DISCONNECTED | OFFLINE |

### Complete State Reference

---

### 1. 🔥 FOCUS

**Condition**: Active work session running

**Triggers**:
- `focusMode.isSessionRunning = true`
- Not paused, not in overtime, not on break

**Visual Theme**:
- Color: Yellow (#FFC107)
- Emoji: 🔥
- Status: "FOCUS"

**Shows In Overlay**:
- Current session timer (remaining or elapsed)
- Task being worked on
- Pomodoro cycle (if Pomodoro mode)
- Round progress bar (if Pomodoro)
- Total task time
- "Working on" card

**Example**:
```
SESSION
REMAINING
25:34
Pomodoro 2/4 • Round 1
■ ■ □ □
████████░░░░
Total task time: 1h 48m

▶ WORKING ON
Implement user auth
```

---

### 2. 🌙 BREAK

**Condition**: Break session active

**Triggers**:
- `focusMode.isBreakActive = true`

**Visual Theme**:
- Color: Purple (#8B5CF6)
- Emoji: 🌙
- Status: "BREAK"

**Shows In Overlay**:
- Break timer (remaining time)
- Break type (Short/Long)
- Cycle info
- Round progress bar
- Break tip
- Today stats

**Example**:
```
BREAK
REMAINING
04:32
Short Break • After Pomodoro 2/4
■ ■ □ □
████████░░
💧 Tip: Drink water

TODAY
Work time     2h 15m
Break time    45m
```

---

### 3. ✅ READY

**Condition**: Ready to start next session

**Triggers**:
- Previous state was BREAK and break ended
- OR current task exists but no session running
- Not paused, not in overtime

**Visual Theme**:
- Color: Green (#10B981)
- Emoji: ✅
- Status: "READY"

**Shows In Overlay**:
- Ready message
- Start prompts
- Today stats
- Task list

**Example**:
```
READY
Break complete
Start next focus session

TODAY
Work time     2h 43m
Break time    52m
Done          3
```

---

### 4. ⏸ PAUSED

**Condition**: Session paused (manually)

**Triggers**:
- `focusMode.isSessionPaused = true`
- **Highest priority** (can pause during FOCUS or BREAK)

**Visual Theme**:
- Color: Gray (#94A3B8)
- Emoji: ⏸
- Status: "PAUSED"

**Shows In Overlay**:
- Paused timer (frozen)
- Session info
- "Session paused" message

**Example**:
```
SESSION
REMAINING
18:23
Pomodoro 2/4 • Round 1

Session paused
```

---

### 5. 🔴 OVERTIME

**Condition**: Session exceeded planned duration

**Triggers**:
- `focusMode.isInOvertime = true`
- Session duration reached but still working

**Visual Theme**:
- Color: Red (#EF4444)
- Emoji: 🔴
- Status: "OVERTIME"

**Shows In Overlay**:
- Overtime duration (+MM:SS)
- Task info
- "Session exceeded" warning

**Example**:
```
SESSION
OVERTIME
+15:23
Session exceeded

▶ WORKING ON
Complex debugging

TODAY
Work time     3h 45m
```

---

### 6. ⚪ IDLE

**Condition**: No active task or session

**Triggers**:
- No current task
- No session running
- Default state when nothing is happening

**Visual Theme**:
- Color: Gray (#6B7280)
- Emoji: ⚪
- Status: "IDLE"

**Shows In Overlay**:
- "No active task" message
- "Start a task" prompt
- Today stats
- Task list (completed tasks)

**Example**:
```
IDLE
No active task
Start a task

TODAY
Work time     5h 12m
Break time    1h 4m
Done          8
```

---

## State Transition Diagram

```
┌──────┐
│ IDLE │ ←─────────────────────────┐
└──┬───┘                            │
   │ Start task                     │
   ↓                                │
┌──────┐                            │
│READY │ ←─────────────────┐       │
└──┬───┘                    │       │
   │ Start session          │       │
   ↓                        │       │
┌───────┐  Pause   ┌───────┐       │
│ FOCUS │ ←──────→ │PAUSED │       │
└──┬────┘          └───────┘       │
   │                                │
   │ Continue past duration         │
   ↓                                │
┌──────────┐                        │
│ OVERTIME │                        │
└──┬───────┘                        │
   │                                │
   │ Complete session               │
   ↓                                │
┌───────┐  Pause   ┌───────┐       │
│ BREAK │ ←──────→ │PAUSED │       │
└──┬────┘          └───────┘       │
   │                                │
   │ Complete break                 │
   ↓                                │
┌──────┐  Start next session        │
│READY │ ───────────────────────────┘
└──────┘  OR exit to planning
```

---

## State Priority Examples

### Example 1: Paused Break
```
Conditions:
- focusMode.isBreakActive = true
- focusMode.isSessionPaused = true

Result: PAUSED (priority 1 beats priority 3)
```

### Example 2: Overtime in Paused State
```
Conditions:
- focusMode.isInOvertime = true
- focusMode.isSessionPaused = true

Result: PAUSED (priority 1 beats priority 2)
```

### Example 3: Break Just Ended
```
Conditions:
- focusMode.isBreakActive = false
- Previous state = BREAK
- No session running

Result: READY (priority 5 - break ended)
```

### Example 4: Task Exists, No Session
```
Conditions:
- currentTask exists
- No session running
- Not paused, not in break

Result: READY (priority 6)
```

---

## Combining Focus Modes + Overlay States

### Pomodoro Mode

| Scenario | Overlay State | Display |
|----------|---------------|---------|
| Working (timer running) | FOCUS | Timer counts down, shows cycle |
| Work timer paused | PAUSED | Timer frozen |
| Work timer exceeded | OVERTIME | +MM:SS overtime |
| Short break active | BREAK | Break timer, tip |
| Long break active | BREAK | Break timer, "Round complete" |
| Break paused | PAUSED | Break timer frozen |
| Break complete | READY | "Start next focus" |
| No task selected | IDLE | "Start a task" |

### Flowtime Mode

| Scenario | Overlay State | Display |
|----------|---------------|---------|
| Working (tracking time) | FOCUS | Timer counts up |
| Paused | PAUSED | Timer frozen |
| End session offer | READY | "Take a break?" |
| Break active | BREAK | Break timer |
| Break complete | READY | "Start next session" |
| No task | IDLE | "Start a task" |

### Countdown Mode

| Scenario | Overlay State | Display |
|----------|---------------|---------|
| Timer running | FOCUS | Timer counts down |
| Paused | PAUSED | Timer frozen |
| Timer reached 0 | OVERTIME | +MM:SS overtime |
| Session ended | READY | "Session complete" |
| No task | IDLE | "Start a task" |

---

## Configuration States

Beyond the main 6 overlay states, there are also **internal UI states**:

### Focus Main UI States
```typescript
enum FocusMainUIState {
  Preparation = 'Preparation',
  Countdown = 'Countdown',
  InProgress = 'InProgress',
  BreakOffer = 'BreakOffer',
}
```

These are internal to Super Productivity and map to our overlay states:
- **Preparation** → Not shown in overlay (pre-session)
- **Countdown** → Maps to FOCUS (3-2-1 countdown)
- **InProgress** → Maps to FOCUS/BREAK/PAUSED/OVERTIME
- **BreakOffer** → Maps to READY (break offer screen)

---

## Summary

### Focus Mode Types (3)
1. **Pomodoro** - Structured 25/5 with cycles
2. **Flowtime** - Flexible, track time freely
3. **Countdown** - Simple timer

### Overlay States (9)
1. **DISCONNECTED** � - API not connected
2. **READY_TO_BREAK** ☕ - Focus done, start your break
3. **PAUSED** ⏸ - Session paused
4. **OVERTIME** 🔴 - Exceeded time
5. **BREAK** 🌙 - Break running
6. **FOCUS** 🔥 - Active work
7. **READY_TO_FOCUS** ✅ - Break done, start next focus
8. **TASK_SELECTED** 📋 - Task selected, nothing running
9. **IDLE** ⚪ - No task selected

### Priority Order
```
DISCONNECTED > READY_TO_BREAK > PAUSED > OVERTIME > BREAK
            > FOCUS > READY_TO_FOCUS > TASK_SELECTED > IDLE
     ↑ highest priority                    lowest priority ↑
```

> READY_TO_BREAK is checked before PAUSED on purpose: an offered break looks
> "paused" to the backend (`purpose:'break'`, `isRunning:false`), so the
> `isBreakOffer` flag must win first.

**Result**: Clear, distinct states derived from real backend flags. 🎯
