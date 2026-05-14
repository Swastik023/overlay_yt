# Requirements: Overlay Spatial Optimization & Density System

**Feature:** Minimal Coding-First Stream Overlay  
**Type:** UX Redesign & Feature Enhancement  
**Priority:** Critical  
**Status:** Draft

---

## 1. Problem Statement

### Current Issues

The Stream Dashboard overlay currently suffers from **"fake dashboard syndrome"** and **spatial competition**:

#### 🔴 Critical Spatial Problems
1. **Center viewport too constrained** - Coding area reduced to ~60% of screen
2. **Right chat panel** - Consumes 260px width + full height with low value
3. **Bottom bar too tall** - Takes ~120px vertical space
4. **Left sidebar overstacked** - 4+ widgets permanently visible (260px width)
5. **Webcam section oversized** - Excessive padding and container height
6. **No density modes** - Same UI for focus, break, and streaming states

#### 🟡 UX Problems
1. **Static dashboard feel** - Boxed panels instead of floating HUD
2. **Visual heaviness** - Too much persistent UI competing for attention
3. **Missing progressive disclosure** - All widgets always visible
4. **No auto-collapse** - Overlay doesn't adapt to user activity
5. **Overlay dominates content** - Should frame, not compete

### Core Principle Violation

**For coding streams: Code > Overlay. Always.**

The overlay should:
- ✅ Frame the content
- ✅ Enhance the experience  
- ✅ Support the workflow
- ❌ NOT dominate the screen
- ❌ NOT compete with code visibility

---

## 2. User Stories

### US-1: As a streamer, I need maximum coding space
**Priority:** Critical  
**Value:** High

**Acceptance Criteria:**
- [ ] Center coding area occupies ≥75% of screen width
- [ ] Vertical space for code ≥80% of screen height
- [ ] Overlay elements use edge anchoring, not full panels
- [ ] No widget blocks code visibility during focus sessions

**Why:** Code visibility is the primary content. Overlay is secondary.

---

### US-2: As a streamer, I need different overlay densities for different stream phases
**Priority:** Critical  
**Value:** High

**Acceptance Criteria:**
- [ ] **Stream Mode (Default)** - Minimal UI, maximum coding space
- [ ] **Focus Mode** - Ultra minimal, only timer + tiny progress
- [ ] **Break Mode** - Expanded UI with goals, motivation, stats
- [ ] Smooth transitions between modes (300-500ms)
- [ ] Mode persists in localStorage
- [ ] Keyboard shortcut to cycle modes (e.g., Ctrl+Shift+M)

**Why:** Different stream phases need different information density.

---

### US-3: As a streamer, I want floating modules instead of boxed panels
**Priority:** High  
**Value:** High

**Acceptance Criteria:**
- [ ] Widgets feel like floating HUD elements, not dashboard panels
- [ ] Semi-transparent backgrounds with subtle glow
- [ ] Detached from edges with breathing room
- [ ] Lighter visual presence (less border, less shadow)
- [ ] Modules can be repositioned (future enhancement)

**Why:** Floating modules feel premium and less intrusive.

---

### US-4: As a streamer, I want the overlay to auto-collapse during active coding
**Priority:** Medium  
**Value:** Very High (Premium Feature)

**Acceptance Criteria:**
- [ ] Detect typing activity in OBS (via focus/blur events)
- [ ] When typing: overlay fades to 70% opacity, secondary widgets collapse
- [ ] When idle (5s): widgets softly return
- [ ] Smooth fade transitions (400ms)
- [ ] Can be disabled in settings

**Why:** This creates an "intelligent" overlay that respects focus time.

---

### US-5: As a streamer, I don't need embedded chat in the overlay
**Priority:** Critical  
**Value:** High (Space Savings)

**Acceptance Criteria:**
- [ ] Remove ChatWidget component entirely
- [ ] Reclaim 260px width from right sidebar
- [ ] Right sidebar becomes compact identity module (webcam + status only)
- [ ] No chat duplication (viewers use platform chat)

**Why:** Chat is redundant and consumes massive space with low value.

---

### US-6: As a streamer, I need a slim, HUD-like bottom bar
**Priority:** High  
**Value:** High

**Acceptance Criteria:**
- [ ] Bottom bar height reduced from ~120px to ~60px
- [ ] Single-row layout with compact stats
- [ ] Remove redundant information
- [ ] Keep: session stats, daily goal ring, streak
- [ ] Remove: stream goal prose, bottom ticker
- [ ] Vertical space reclaimed for coding

**Why:** Bottom bar is visually beautiful but too tall for coding streams.

---

### US-7: As a streamer, I want progressive disclosure in the left sidebar
**Priority:** High  
**Value:** Medium

**Acceptance Criteria:**
- [ ] **Always visible:** Timer, current task, music
- [ ] **Hidden by default:** Full task list, break reminder, settings
- [ ] **Reveal on hover:** Expand full task list
- [ ] **Hotkey toggle:** Show/hide full sidebar (e.g., Ctrl+Shift+S)
- [ ] Smooth expand/collapse animations

**Why:** Not all widgets need to be visible all the time.

---

### US-8: As a streamer, I want a compact webcam identity module
**Priority:** Medium  
**Value:** Medium

**Acceptance Criteria:**
- [ ] Webcam section reduced to compact floating module
- [ ] Smaller container with less padding
- [ ] Username + live status integrated
- [ ] Positioned in top-right corner (floating)
- [ ] Aspect ratio optimized (1:1 or 4:3, not 16:10)

**Why:** Current webcam section has too much dead space.

---

### US-9: As a viewer, I want the overlay to feel ambient, not distracting
**Priority:** High  
**Value:** High

**Acceptance Criteria:**
- [ ] Overlay "disappears psychologically" during focus
- [ ] Subtle animations, no jarring movements
- [ ] Information hierarchy: code first, overlay second
- [ ] Breathing room between elements
- [ ] Intentional emptiness (negative space)

**Why:** Premium overlays enhance without dominating.

---

### US-10: As a streamer, I want customizable overlay density settings
**Priority:** Low  
**Value:** Medium (Future)

**Acceptance Criteria:**
- [ ] Settings panel to configure density modes
- [ ] Toggle individual widgets on/off
- [ ] Adjust opacity levels
- [ ] Customize auto-collapse behavior
- [ ] Export/import layout presets

**Why:** Personalization increases creator satisfaction.

---

## 3. Functional Requirements

### FR-1: Overlay Density Modes
**Priority:** Critical

The system MUST support three density modes:

#### Mode 1: Stream Mode (Default)
- **Purpose:** Balanced visibility for live streaming
- **Layout:**
  - Left: Timer (compact) + Current task + Music widget
  - Right: Webcam (compact) + Live status
  - Bottom: Slim stats bar (60px height)
  - Center: Maximum coding space (≥75% width)
- **Visibility:** ~25% screen coverage

#### Mode 2: Focus Mode
- **Purpose:** Ultra-minimal for deep work
- **Layout:**
  - Left: Timer only (floating, top-left)
  - Right: Nothing (or tiny webcam dot)
  - Bottom: Tiny progress strip (30px height)
  - Center: Maximum coding space (≥85% width)
- **Visibility:** ~10% screen coverage
- **Behavior:** All secondary widgets fade out

#### Mode 3: Break Mode
- **Purpose:** Expanded UI during breaks
- **Layout:**
  - Left: Full task list + Break reminder + Music
  - Right: Webcam + Motivation card + Session summary
  - Bottom: Full stats bar with goals
  - Center: Can show break timer or message
- **Visibility:** ~40% screen coverage

---

### FR-2: Spatial Constraints
**Priority:** Critical

#### Sidebar Widths
- **Left sidebar (Stream Mode):** 200px (reduced from 260px)
- **Left sidebar (Focus Mode):** 120px (timer only)
- **Right sidebar (Stream Mode):** 180px (reduced from 260px)
- **Right sidebar (Focus Mode):** 0px (hidden)

#### Heights
- **Bottom bar (Stream Mode):** 60px (reduced from 120px)
- **Bottom bar (Focus Mode):** 30px (progress strip only)
- **Header:** 60px (unchanged)

#### Center Viewport
- **Stream Mode:** ≥75% width, ≥80% height
- **Focus Mode:** ≥85% width, ≥85% height
- **Break Mode:** ≥60% width, ≥70% height

---

### FR-3: Component Removal
**Priority:** Critical

The following components MUST be removed:

1. **ChatWidget** - Entire component deleted
2. **BreakReminder** - Moved to Break Mode only
3. **Bottom ticker** - Removed from StatsBar
4. **Stream goal prose** - Simplified to progress bar only

---

### FR-4: Floating Module System
**Priority:** High

Widgets MUST transition from boxed panels to floating modules:

#### Visual Changes
- **Background:** Semi-transparent (rgba(20, 20, 34, 0.85))
- **Border:** Subtle glow instead of solid border
- **Shadow:** Soft drop shadow (0 4px 20px rgba(0,0,0,0.3))
- **Padding:** Reduced by 30%
- **Border radius:** Increased to 16px
- **Positioning:** Detached from edges (8-12px margin)

#### Animation
- **Hover:** Subtle lift (translateY(-2px))
- **Transition:** All properties 200ms ease
- **Glow intensity:** Increases on hover

---

### FR-5: Auto-Collapse Behavior
**Priority:** Medium

The overlay MUST adapt to user activity:

#### Detection
- Monitor window focus/blur events
- Track keyboard activity (typing detection)
- Idle timeout: 5 seconds

#### Behavior
- **On typing start:**
  - Fade overlay to 70% opacity (400ms)
  - Collapse secondary widgets (scale 0.95)
  - Reduce glow intensity
- **On idle:**
  - Restore opacity to 100% (400ms)
  - Expand widgets (scale 1.0)
  - Restore glow intensity

#### Settings
- Toggle auto-collapse on/off
- Adjust fade opacity (50-90%)
- Adjust idle timeout (3-10s)

---

### FR-6: Progressive Disclosure
**Priority:** High

Left sidebar MUST support expand/collapse:

#### Default State (Collapsed)
- Timer (always visible)
- Current task only (first incomplete task)
- Music widget (compact)

#### Expanded State
- Timer
- Full task list (scrollable)
- Music widget
- Break reminder (if applicable)

#### Triggers
- **Hover:** Expand after 300ms delay
- **Hotkey:** Ctrl+Shift+S to toggle
- **Click:** Click expand icon to pin open

---

### FR-7: Keyboard Shortcuts
**Priority:** Medium

The system MUST support keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+M` | Cycle density modes (Stream → Focus → Break) |
| `Ctrl+Shift+S` | Toggle left sidebar expand/collapse |
| `Ctrl+Shift+H` | Hide/show entire overlay |
| `Ctrl+Shift+T` | Focus timer (start/pause) |
| `Ctrl+Shift+N` | Add new task (quick input) |

---

## 4. Non-Functional Requirements

### NFR-1: Performance
**Priority:** Critical

- Overlay MUST maintain 60fps during all transitions
- CPU usage MUST remain <5% during idle
- Memory footprint MUST be <100MB
- All animations MUST use GPU-accelerated CSS transforms
- No layout thrashing during mode switches

---

### NFR-2: Responsiveness
**Priority:** High

- Mode transitions MUST complete within 500ms
- Auto-collapse MUST trigger within 100ms of typing
- Hover expand MUST feel instant (<50ms perceived delay)
- No janky animations or stuttering

---

### NFR-3: Accessibility
**Priority:** Medium

- All interactive elements MUST be keyboard accessible
- Focus indicators MUST be visible
- Reduced motion mode MUST be supported
- Screen reader announcements for mode changes
- Minimum contrast ratio: 4.5:1 (WCAG AA)

---

### NFR-4: Persistence
**Priority:** High

The following MUST persist in localStorage:

- Selected density mode
- Sidebar expand/collapse state
- Auto-collapse enabled/disabled
- Custom opacity settings
- Widget visibility preferences

---

### NFR-5: OBS Compatibility
**Priority:** Critical

- Overlay MUST work in OBS Browser Source
- Transparent background MUST be supported
- No performance degradation in OBS
- Safe area margins MUST be respected
- 1920x1080 layout MUST be optimized

---

## 5. Design Constraints

### DC-1: Visual Language
**Priority:** High

The redesign MUST maintain:
- Matte black background aesthetic
- Warm yellow accent color
- Subtle purple/cyan secondary accents
- Premium typography (Inter + JetBrains Mono)
- Soft shadows and glows

---

### DC-2: Animation Philosophy
**Priority:** High

All animations MUST be:
- Subtle and cinematic
- GPU-friendly (transform/opacity only)
- Easing: ease-out for entrances, ease-in for exits
- Duration: 200-500ms (never longer)
- Purposeful, not decorative

---

### DC-3: Information Hierarchy
**Priority:** Critical

Visual priority order:
1. **Coding content** (center viewport)
2. **Timer** (primary focus tool)
3. **Current task** (immediate context)
4. **Music** (ambient awareness)
5. **Stats** (secondary information)
6. **Webcam** (identity, not content)

---

## 6. Success Metrics

### Spatial Efficiency
- **Target:** Center viewport ≥75% width in Stream Mode
- **Target:** Center viewport ≥85% width in Focus Mode
- **Target:** Bottom bar ≤60px height
- **Target:** Sidebar width ≤200px

### User Experience
- **Target:** Mode switch feels instant (<500ms)
- **Target:** Auto-collapse triggers within 100ms
- **Target:** No perceived lag during transitions
- **Target:** Overlay feels "invisible" during focus

### Performance
- **Target:** 60fps maintained during all animations
- **Target:** CPU usage <5% during idle
- **Target:** Memory <100MB
- **Target:** No layout thrashing

---

## 7. Out of Scope

The following are explicitly OUT OF SCOPE for this feature:

- ❌ Widget repositioning/drag-and-drop (future)
- ❌ Custom theme editor (future)
- ❌ Multi-monitor support (future)
- ❌ Mobile/tablet layouts (not applicable)
- ❌ Backend integration (frontend only)
- ❌ Advanced analytics (future)
- ❌ Social media integration beyond current Spotify

---

## 8. Dependencies

### Technical Dependencies
- React 19.x
- Zustand 5.x (state management)
- Tailwind CSS 4.x
- Lucide React (icons)
- localStorage API

### External Dependencies
- OBS Studio Browser Source
- Spotify API (existing integration)
- WebSocket server (existing)

---

## 9. Risks & Mitigations

### Risk 1: Breaking existing layouts
**Severity:** High  
**Mitigation:** 
- Implement feature flag for new layout
- Provide "Classic" mode toggle
- Gradual rollout with user feedback

### Risk 2: Performance degradation
**Severity:** Medium  
**Mitigation:**
- Use CSS transforms exclusively
- Implement will-change hints
- Profile with React DevTools
- Test in OBS environment

### Risk 3: User resistance to change
**Severity:** Medium  
**Mitigation:**
- Clear migration guide
- Video tutorial showing benefits
- Easy toggle back to "full" mode
- Gather feedback early

---

## 10. Future Enhancements

### Phase 2 (Post-Launch)
- Widget repositioning (drag-and-drop)
- Custom layout presets
- Export/import configurations
- Advanced theme customization
- Per-widget opacity controls

### Phase 3 (Long-term)
- AI-powered auto-layout
- Scene detection (coding vs break)
- Integration with IDE (VS Code extension)
- Multi-language support
- Cloud sync for settings

---

## 11. Acceptance Criteria Summary

This feature is considered **COMPLETE** when:

✅ **Spatial Goals Met**
- [ ] Center viewport ≥75% width (Stream Mode)
- [ ] Center viewport ≥85% width (Focus Mode)
- [ ] Bottom bar ≤60px height
- [ ] ChatWidget removed
- [ ] Right sidebar ≤180px width

✅ **Density Modes Implemented**
- [ ] Stream Mode functional
- [ ] Focus Mode functional
- [ ] Break Mode functional
- [ ] Smooth transitions between modes
- [ ] Keyboard shortcut to cycle modes

✅ **Floating Module System**
- [ ] All widgets converted to floating style
- [ ] Hover effects implemented
- [ ] Subtle glows and shadows
- [ ] Detached positioning

✅ **Progressive Disclosure**
- [ ] Left sidebar collapsible
- [ ] Hover to expand
- [ ] Hotkey toggle
- [ ] Smooth animations

✅ **Auto-Collapse**
- [ ] Typing detection working
- [ ] Fade to 70% opacity
- [ ] Idle restore after 5s
- [ ] Settings to configure

✅ **Performance**
- [ ] 60fps maintained
- [ ] CPU <5% idle
- [ ] No layout thrashing
- [ ] OBS compatible

✅ **Persistence**
- [ ] Mode selection saved
- [ ] Sidebar state saved
- [ ] Settings saved
- [ ] Survives refresh

---

## 12. Appendix: Visual Comparison

### Before (Current)
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (60px)                                           │
├──────────┬─────────────────────────────┬────────────────┤
│          │                             │                │
│  LEFT    │                             │     RIGHT      │
│ SIDEBAR  │        CENTER               │    SIDEBAR     │
│ (260px)  │       VIEWPORT              │    (260px)     │
│          │      ~60% width             │                │
│  Timer   │                             │   Webcam       │
│  Tasks   │                             │   Motivation   │
│  Music   │                             │   Chat (!)     │
│ Reminder │                             │                │
│          │                             │                │
├──────────┴─────────────────────────────┴────────────────┤
│ BOTTOM BAR (120px) - Too tall                           │
│ Session Stats | Daily Goal | Streak | Stream Goal       │
│ Bottom Ticker Message                                   │
└─────────────────────────────────────────────────────────┘

Center Viewport: ~60% width × ~70% height = 42% total area
```

### After (Target)
```
┌─────────────────────────────────────────────────────────┐
│ HEADER (60px)                                           │
├────────┬───────────────────────────────────┬───────────┤
│        │                                   │           │
│ LEFT   │                                   │  RIGHT    │
│(200px) │         CENTER VIEWPORT           │  (180px)  │
│        │          ~75% width               │           │
│ Timer  │                                   │  Webcam   │
│ Task   │                                   │  Status   │
│ Music  │                                   │           │
│        │                                   │           │
│        │                                   │           │
├────────┴───────────────────────────────────┴───────────┤
│ SLIM BOTTOM BAR (60px)                                  │
│ Stats | Goal | Streak                                   │
└─────────────────────────────────────────────────────────┘

Center Viewport: ~75% width × ~80% height = 60% total area
```

**Space Gained:** +18% total screen area for coding content

---

**Document Status:** Draft  
**Last Updated:** 2026-05-10  
**Next Step:** Design Document
