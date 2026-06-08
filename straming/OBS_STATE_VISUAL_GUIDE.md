# OBS Sidebar - Visual State Guide

Quick reference for how each of the 6 modes appears in the sidebar.

---

## 🟡 FOCUS State

**Accent Color**: Yellow/Green (#FFC107 or #10B981)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │ ← Brand (white + accent)
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 04:14 PM    🔥 FOCUS    │ ← Clock (20px) + Status pill (12px)
├─────────────────────────┤
│ CURRENT TASK            │ ← Section label (11px)
│ Implement user auth     │ ← Task title (18px, white, bold)
│ 📁 Backend • 1h 23m     │ ← Project + time (11-12px)
│ 1:23:45 / 2:00:00       │ ← Progress (17px bold / 13px)
│ ██████████░░░░ 69%      │ ← Progress bar (5px, glow)
├─────────────────────────┤
│ SESSION                 │
│                         │
│      25:34              │ ← HERO TIMER (42px!!)
│                         │   w/ dramatic glow
│ Pomodoro 2/4            │ ← Mode (11px)
│ Round 1                 │ ← Round info
│ ██████████░░░░          │ ← Session progress
│ Remaining 25:34         │ ← Remaining time (16px)
├─────────────────────────┤
│ TODAY                   │
│ Focused      3h 45m     │ ← Stats (12px + 14px)
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ▶ Implement user auth   │ ← Active (highlighted)
│ ✓ Setup database        │ ← Done (strikethrough)
│ ▢ Write tests           │ ← Todo
├─────────────────────────┤
│ Focus • Build • Ship    │ ← Tagline
├─────────────────────────┤
│                         │
│         CAM             │ ← Webcam space (198px)
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Yellow/green glow on timer
- Warm productive energy
- Active task highlighted
- Progress bars animated

---

## 🟣 BREAK State

**Accent Color**: Purple/Blue (#8B5CF6)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 04:39 PM    ☕ BREAK    │ ← Purple theme
├─────────────────────────┤
│ BREAK                   │
│                         │
│      04:32              │ ← HERO TIMER (42px)
│                         │   Purple glow
│ Short Break             │ ← Break type
│ After Pomodoro 2/4      │ ← Context
│ ████████░░              │ ← Progress
│                         │
│ 💧 Drink water          │ ← Tiny break tip
│                         │
├─────────────────────────┤
│ TODAY                   │
│ Focused      3h 45m     │
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ▶ Implement user auth   │
│ ✓ Setup database        │
│ ▢ Write tests           │
├─────────────────────────┤
│ Focus • Build • Ship    │
├─────────────────────────┤
│                         │
│         CAM             │
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Purple/blue glow on timer
- Calm, relaxing atmosphere
- Current task still visible
- Break tip with emoji

**Long Break (Cycle 4):**
```
│ Long Break              │
│ Round complete          │ ← Special message
```

---

## 🟢 READY State

**Accent Color**: Green (#10B981)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 04:44 PM    ✓ READY     │ ← Green theme
├─────────────────────────┤
│ CURRENT TASK            │
│ Implement user auth     │ ← Next task to work on
│ 📁 Backend • 1h 23m     │
├─────────────────────────┤
│ READY                   │
│                         │
│ Break complete          │ ← Message (17px)
│                         │   Green glow
│ Start next focus session│ ← Call to action
│                         │
├─────────────────────────┤
│ TODAY                   │
│ Focused      3h 45m     │
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ▶ Implement user auth   │
│ ✓ Setup database        │
│ ▢ Write tests           │
├─────────────────────────┤
│ Focus • Build • Ship    │
├─────────────────────────┤
│                         │
│         CAM             │
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Green success glow
- Encouraging message
- Ready to start signal
- No timer (break is done)

**After Round Complete (Cycle 4):**
```
│ Ready • Start next round│ ← Special message
```

---

## ⚪ IDLE State

**Accent Color**: Gray (#9CA3AF)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 05:15 PM    💤 IDLE     │ ← Gray theme
├─────────────────────────┤
│ IDLE                    │
│                         │
│ No active task          │ ← Message (17px)
│                         │   Neutral gray
│ Start a task            │ ← Call to action
│                         │
├─────────────────────────┤
│ TODAY                   │
│ Focused      3h 45m     │
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ✓ Setup database        │
│ ✓ Implement user auth   │
│ ▢ Write tests           │
├─────────────────────────┤
│ Focus • Build • Ship    │
├─────────────────────────┤
│                         │
│         CAM             │
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Neutral gray theme
- No timer or task shown
- Encourages starting work
- Today stats still visible

---

## ⏸️ PAUSED State

**Accent Color**: Gray/Yellow (#9CA3AF or #FFC107)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 04:20 PM    ⏸ PAUSED    │ ← Gray/yellow theme
├─────────────────────────┤
│ CURRENT TASK            │
│ Implement user auth     │
│ 📁 Backend • 1h 23m     │
├─────────────────────────┤
│ SESSION                 │
│                         │
│      18:23              │ ← FROZEN TIMER (42px)
│                         │   Last remaining time
│ Pomodoro 2/4            │
│                         │
│ Paused at 18:23 remaining│ ← Pause message
│                         │
├─────────────────────────┤
│ TODAY                   │
│ Focused      3h 45m     │
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ▶ Implement user auth   │
│ ✓ Setup database        │
│ ▢ Write tests           │
├─────────────────────────┤
│ Focus • Build • Ship    │
├─────────────────────────┤
│                         │
│         CAM             │
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Gray or yellow theme
- Timer frozen at pause point
- Waiting state indication
- Progress bar static

---

## 🔴 OVERTIME State

**Accent Color**: Red (#EF4444)

```
┌─────────────────────────┐
│ LEARN AI WITH ME        │
│ Focus • Build • Ship    │
├─────────────────────────┤
│ 05:02 PM    ⚠ OVERTIME  │ ← Red theme
├─────────────────────────┤
│ CURRENT TASK            │
│ Implement user auth     │
│ 📁 Backend • 2h 13m     │
│ 2:13:45 / 2:00:00       │ ← Over estimate
│ ████████████ 111%       │
├─────────────────────────┤
│ SESSION                 │
│                         │
│      +13:45             │ ← OVERTIME TIMER (42px)
│                         │   Red glow, + prefix
│                         │
│ SESSION EXCEEDED        │ ← Alert message
│                         │
├─────────────────────────┤
│ TODAY                   │
│ Focused      5h 13m     │
│ Done         4          │
│ Planned      3 / 5      │
│ ███████░░░   60%        │
├─────────────────────────┤
│ TASKS 3/5               │
│ ▶ Implement user auth   │
│ ✓ Setup database        │
│ ▢ Write tests           │
├─────────────────────────┤
│ Focus • Build • Ship    │
├─────────────────────────┤
│                         │
│         CAM             │
│                         │
└─────────────────────────┘
```

**Visual Effects:**
- Red alert glow
- Timer shows +MM:SS (overtime)
- Urgent attention needed
- Task progress over 100%

---

## 🎨 Color Transitions

All state changes have smooth 0.6s transitions:
- Border colors fade smoothly
- Text colors transition gradually
- Glow effects blend between states
- Progress bars animate width changes

---

## 📱 Mobile View Guarantee

All text remains readable on mobile devices:

| Element | Desktop | Mobile | Verdict |
|---------|---------|--------|---------|
| Timer | 42px | 42px | ✅ Visible from across room |
| Task title | 18px | 18px | ✅ Clear at a glance |
| Clock | 20px | 20px | ✅ Easy to check |
| Stats | 14-18px | 14-18px | ✅ No squinting needed |
| Status | 12px | 12px | ✅ Clear indicator |
| Tasks | 14px | 14px | ✅ Readable list |

---

## 🎬 Animation Summary

1. **Clock dot**: Pulses every 2 seconds
2. **Progress bars**: Smooth width transition (1s)
3. **Color transitions**: All state changes (0.6s)
4. **Task highlighting**: Active task border animation
5. **Glow effects**: Constant subtle glow on key elements

---

## 🚀 Quick Test Checklist

- [ ] FOCUS: Yellow glow, timer counts down, task visible
- [ ] BREAK: Purple glow, timer counts down, break tip shows
- [ ] READY: Green glow, "Break complete" message
- [ ] PAUSED: Gray/yellow, timer frozen
- [ ] OVERTIME: Red glow, +MM:SS format
- [ ] IDLE: Gray, "No active task" message
- [ ] Webcam space: 198px empty at bottom
- [ ] Fonts: All readable on phone screen
- [ ] Animations: Clock pulses, bars animate
- [ ] Brand: "LEARN AI WITH ME" visible at top
- [ ] Tagline: "Focus • Build • Ship" above webcam

---

All 6 states are production-ready for live streaming! 🎉
