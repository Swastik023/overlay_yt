# Implementation Plan: Overlay Spatial Optimization & Density System

## Overview

This implementation transforms the Stream Dashboard overlay from a dashboard-style interface into a minimal, space-efficient coding overlay. The approach follows a phased implementation strategy: foundation (state management), layout restructuring (new component architecture), floating module system (visual refactoring), progressive disclosure (collapsible UI), auto-collapse (activity detection), and polish (performance optimization).

**Key Technical Approach:**
- Zustand for density mode state management
- CSS custom properties for dynamic layout dimensions
- GPU-accelerated transforms for 60fps animations
- Progressive enhancement with graceful degradation
- TypeScript for type safety across all components

**Success Criteria:**
- Center viewport ≥75% width (Stream Mode), ≥85% (Focus Mode)
- Bottom bar ≤60px height (Stream Mode)
- 60fps maintained during all transitions
- ChatWidget completely removed
- All 3 density modes functional with smooth transitions

---

## Tasks

### 1. Foundation: State Management & Core Infrastructure

- [ ] 1.1 Create density mode store with Zustand
  - Create `src/store/useDensityStore.ts` with DensityModeStore interface
  - Implement state: mode, isAutoCollapsed, overlayOpacity, sidebarExpanded
  - Implement actions: setMode, cycleMode, setAutoCollapsed, toggleSidebar
  - Add settings: autoCollapseEnabled, autoCollapseFadeOpacity, autoCollapseIdleTimeout
  - Configure Zustand persist middleware for localStorage
  - Add validation for mode values (stream/focus/break)
  - _Requirements: US-2, FR-1, NFR-4_

- [ ]* 1.2 Write unit tests for density mode store
  - Test mode cycling logic (stream → focus → break → stream)
  - Test auto-collapse state transitions
  - Test sidebar expand/collapse state
  - Test localStorage persistence and hydration
  - Test invalid mode value handling
  - _Requirements: US-2, FR-1_

- [ ] 1.3 Add CSS custom properties for layout dimensions
  - Update `src/index.css` with layout CSS variables
  - Add `--sidebar-left-width`, `--sidebar-right-width`, `--bottom-bar-height`
  - Add `--module-gap`, `--module-padding`, `--module-radius`
  - Add `--overlay-opacity`, `--module-scale` for auto-collapse
  - Add `--transition-mode`, `--transition-collapse`, `--transition-hover`
  - Create `[data-density-mode]` attribute selectors for each mode
  - Create `[data-auto-collapsed]` attribute selector
  - _Requirements: FR-1, FR-2, DC-1_

- [ ] 1.4 Implement keyboard shortcut handler
  - Create `src/utils/keyboardShortcuts.ts` utility
  - Implement Ctrl+Shift+M for mode cycling
  - Implement Ctrl+Shift+S for sidebar toggle
  - Implement Ctrl+Shift+H for overlay hide/show
  - Add event listener cleanup on unmount
  - Prevent conflicts with browser defaults
  - _Requirements: FR-7, NFR-3_

- [ ]* 1.5 Write unit tests for keyboard shortcuts
  - Test mode cycling shortcut
  - Test sidebar toggle shortcut
  - Test overlay hide/show shortcut
  - Test event listener cleanup
  - _Requirements: FR-7_

---

### 2. Layout Restructuring: New Component Architecture

- [ ] 2.1 Create LeftSidebar component
  - Create `src/components/LeftSidebar.tsx`
  - Implement props: mode, expanded, onToggle
  - Add fixed positioning with safe area margins
  - Implement width transitions based on density mode
  - Add flex column layout with gap for modules
  - Apply opacity and scale transforms for auto-collapse
  - _Requirements: US-7, FR-2, FR-6_

- [ ] 2.2 Create RightSidebar component
  - Create `src/components/RightSidebar.tsx`
  - Implement props: mode
  - Add fixed positioning on right side
  - Implement width transitions (180px → 0px for Focus Mode)
  - Add flex column layout for webcam and status
  - Hide completely in Focus Mode
  - _Requirements: US-5, US-8, FR-2_

- [ ] 2.3 Create BottomBar component
  - Create `src/components/BottomBar.tsx`
  - Implement props: mode
  - Add fixed positioning at bottom with safe area margins
  - Implement height transitions (60px Stream, 30px Focus, 80px Break)
  - Add single-row flex layout for stats
  - Remove bottom ticker and stream goal prose
  - _Requirements: US-6, FR-2_

- [ ] 2.4 Remove ChatWidget component
  - Delete `src/components/ChatWidget.tsx` file
  - Remove ChatWidget import from App.tsx
  - Remove ChatWidget from right sidebar in App.tsx
  - Verify no remaining references to ChatWidget
  - _Requirements: US-5, FR-3_

- [ ] 2.5 Update App.tsx with new layout structure
  - Wrap application in density mode context provider
  - Apply `data-density-mode` attribute to root div
  - Apply `data-auto-collapsed` attribute based on state
  - Replace left sidebar content with LeftSidebar component
  - Replace right sidebar content with RightSidebar component
  - Replace StatsBar with BottomBar component
  - Update layout to use CSS custom properties
  - Add keyboard shortcut handler
  - _Requirements: US-2, FR-1, FR-2_

- [ ]* 2.6 Write integration tests for layout structure
  - Test center viewport dimensions in each mode
  - Test sidebar widths match specifications
  - Test bottom bar height changes
  - Test data attributes applied correctly
  - _Requirements: FR-2_

- [ ] 2.7 Checkpoint - Verify layout structure
  - Ensure all tests pass, ask the user if questions arise.

---

### 3. Floating Module System: Visual Refactoring

- [ ] 3.1 Create floating module base styles
  - Add `.floating-module` class to `src/index.css`
  - Implement semi-transparent background (rgba(20, 20, 34, 0.85))
  - Add subtle border with glow effect
  - Add soft drop shadow (0 4px 20px rgba(0,0,0,0.3))
  - Add backdrop-filter blur(12px)
  - Implement hover lift effect (translateY(-2px))
  - Add gradient border glow on hover
  - Apply will-change hints for transform and opacity
  - _Requirements: US-3, FR-4, DC-1_

- [ ] 3.2 Refactor TimerCard to TimerModule
  - Rename `src/components/TimerCard.tsx` to `src/components/TimerModule.tsx`
  - Apply floating module styling
  - Reduce padding by 30%
  - Implement compact mode for Focus Mode (smaller ring, hide controls)
  - Update ring diameter: 100px (compact) vs 150px (normal)
  - Maintain existing timer logic and state integration
  - _Requirements: US-3, FR-4_

- [ ] 3.3 Refactor TaskPanel to TaskModule
  - Rename `src/components/TaskPanel.tsx` to `src/components/TaskModule.tsx`
  - Apply floating module styling
  - Reduce padding by 30%
  - Maintain existing task management logic
  - Prepare structure for collapsed state (next phase)
  - _Requirements: US-3, FR-4_

- [ ] 3.4 Refactor MusicWidget to MusicModule
  - Rename `src/components/MusicWidget.tsx` to `src/components/MusicModule.tsx`
  - Apply floating module styling
  - Reduce height and padding
  - Maintain Spotify integration and WebSocket connection
  - _Requirements: US-3, FR-4_

- [ ] 3.5 Refactor WebcamFrame to WebcamModule
  - Rename `src/components/WebcamFrame.tsx` to `src/components/WebcamModule.tsx`
  - Apply floating module styling
  - Change to 1:1 aspect ratio (square)
  - Reduce container size to 150px × 150px (Stream Mode)
  - Remove excessive padding
  - Add subtle pulse animation for live indicator
  - _Requirements: US-3, US-8, FR-4_

- [ ] 3.6 Refactor StatsBar to StatsModule
  - Update `src/components/StatsBar.tsx` to use floating module styling
  - Remove bottom ticker component
  - Remove stream goal prose text
  - Implement compact single-row layout
  - Reduce icon sizes
  - Apply floating module styling to individual stat cards
  - _Requirements: US-6, FR-4, FR-3_

- [ ]* 3.7 Write visual regression tests for floating modules
  - Capture snapshots of each module in each density mode
  - Verify floating module styling applied
  - Verify hover effects work
  - Verify opacity and scale transforms
  - _Requirements: US-3, FR-4_

- [ ] 3.8 Update component imports in LeftSidebar and RightSidebar
  - Update LeftSidebar to import TimerModule, TaskModule, MusicModule
  - Update RightSidebar to import WebcamModule
  - Update BottomBar to import StatsModule
  - Verify all modules render correctly
  - _Requirements: US-3_

- [ ] 3.9 Checkpoint - Verify floating module system
  - Ensure all tests pass, ask the user if questions arise.

---

### 4. Progressive Disclosure: Collapsible UI

- [ ] 4.1 Implement TaskModule collapsed state
  - Add `collapsed` prop to TaskModule
  - Implement collapsed view: show only section label + first incomplete task + progress bar
  - Implement expanded view: show full task list with scrolling (max 300px height)
  - Add expand/collapse icon button
  - Add smooth height transition animation
  - _Requirements: US-7, FR-6_

- [ ] 4.2 Add hover-to-expand logic to LeftSidebar
  - Implement onMouseEnter handler with 300ms delay
  - Implement onMouseLeave handler to collapse
  - Connect to sidebarExpanded state in density store
  - Apply smooth expand/collapse animations
  - _Requirements: US-7, FR-6_

- [ ] 4.3 Implement module visibility by density mode
  - Create `src/utils/moduleVisibility.ts` with MODULE_VISIBILITY config
  - Implement conditional rendering in LeftSidebar based on mode
  - Implement conditional rendering in RightSidebar based on mode
  - Implement conditional rendering in BottomBar based on mode
  - Hide BreakReminder except in Break Mode
  - Hide MotivationCard except in Break Mode
  - Hide RightSidebar completely in Focus Mode
  - _Requirements: US-2, FR-1, FR-6_

- [ ] 4.4 Add expand/collapse icon and animations
  - Add ChevronDown/ChevronUp icon to TaskModule
  - Implement icon rotation animation on expand/collapse
  - Add smooth height and opacity transitions
  - Use cubic-bezier easing for natural feel
  - _Requirements: US-7, FR-6_

- [ ]* 4.5 Write integration tests for progressive disclosure
  - Test TaskModule collapsed state shows only current task
  - Test TaskModule expanded state shows full list
  - Test hover-to-expand with 300ms delay
  - Test sidebar toggle hotkey
  - Test module visibility by density mode
  - _Requirements: US-7, FR-6_

- [ ] 4.6 Checkpoint - Verify progressive disclosure
  - Ensure all tests pass, ask the user if questions arise.

---

### 5. Auto-Collapse: Activity Detection

- [ ] 5.1 Create ActivityDetector component
  - Create `src/components/ActivityDetector.tsx`
  - Implement props: enabled, idleTimeout, fadeOpacity
  - Add state: isTyping, lastActivityTime, isIdle
  - Implement as invisible component (no render output)
  - _Requirements: US-4, FR-5_

- [ ] 5.2 Implement keyboard activity detection
  - Add window keydown event listener
  - Update lastActivityTime on keydown
  - Set isTyping to true on keydown
  - Call densityStore.setAutoCollapsed(true) on typing start
  - Implement proper event listener cleanup on unmount
  - _Requirements: US-4, FR-5_

- [ ] 5.3 Implement idle timeout logic
  - Create interval to check idle state every 250ms
  - Compare current time with lastActivityTime
  - If idle timeout exceeded, set isTyping to false
  - Call densityStore.setAutoCollapsed(false) on idle
  - Clear interval on component unmount
  - _Requirements: US-4, FR-5_

- [ ] 5.4 Implement window focus/blur detection
  - Add window focus event listener
  - Add window blur event listener
  - Pause activity detection when window loses focus
  - Resume activity detection when window gains focus
  - _Requirements: US-4, FR-5_

- [ ] 5.5 Connect ActivityDetector to App.tsx
  - Import ActivityDetector component
  - Add ActivityDetector to component tree
  - Pass autoCollapseEnabled, idleTimeout, fadeOpacity from density store
  - Verify auto-collapse state updates correctly
  - _Requirements: US-4, FR-5_

- [ ] 5.6 Apply auto-collapse transforms to overlay
  - Update CSS to use `--overlay-opacity` and `--module-scale` variables
  - Apply opacity transition to all floating modules
  - Apply scale transition to all floating modules
  - Use 400ms ease transition timing
  - Add will-change hints for performance
  - _Requirements: US-4, FR-5, NFR-1_

- [ ]* 5.7 Write unit tests for ActivityDetector
  - Test keydown triggers auto-collapse
  - Test idle timeout restores opacity
  - Test window blur pauses detection
  - Test window focus resumes detection
  - Test event listener cleanup
  - _Requirements: US-4, FR-5_

- [ ]* 5.8 Write integration tests for auto-collapse behavior
  - Test typing triggers fade to 70% opacity
  - Test idle timeout restores 100% opacity
  - Test scale transform applies correctly
  - Test transitions are smooth
  - _Requirements: US-4, FR-5_

- [ ] 5.9 Checkpoint - Verify auto-collapse functionality
  - Ensure all tests pass, ask the user if questions arise.

---

### 6. Polish & Optimization: Performance & Accessibility

- [ ] 6.1 Optimize animations for 60fps
  - Verify all animations use transform and opacity only
  - Add will-change hints to animating elements
  - Add transform: translateZ(0) for layer promotion
  - Remove any width/height/margin/padding animations
  - Profile with React DevTools to verify 60fps
  - _Requirements: NFR-1, NFR-2_

- [ ] 6.2 Implement reduced motion support
  - Detect prefers-reduced-motion media query
  - Add .reduce-motion class to document root when detected
  - Disable transitions and animations in reduced motion mode
  - Verify functionality still works without animations
  - _Requirements: NFR-3_

- [ ] 6.3 Add error boundaries for graceful degradation
  - Create ErrorBoundary component for density mode provider
  - Add fallback UI for component errors
  - Log errors to console with context
  - Ensure app remains functional if features fail
  - _Requirements: Error Handling_

- [ ] 6.4 Implement localStorage error handling
  - Wrap persist middleware in try-catch
  - Gracefully degrade if localStorage unavailable
  - Log warning but continue without persistence
  - Test with localStorage disabled
  - _Requirements: Error Handling, NFR-4_

- [ ] 6.5 Add loading states and transitions
  - Add loading state for initial density mode hydration
  - Prevent flash of unstyled content (FOUC)
  - Add smooth fade-in on initial render
  - Ensure smooth transitions between modes
  - _Requirements: NFR-2_

- [ ] 6.6 Implement accessibility improvements
  - Add ARIA labels to all interactive controls
  - Ensure focus indicators are visible
  - Add keyboard navigation support
  - Add screen reader announcements for mode changes
  - Test with keyboard-only navigation
  - Verify minimum contrast ratio 4.5:1
  - _Requirements: NFR-3_

- [ ]* 6.7 Write performance tests
  - Measure FPS during mode transitions (target: 60fps)
  - Measure FPS during auto-collapse (target: 60fps)
  - Measure CPU usage during idle (target: <5%)
  - Measure memory usage over time (target: <100MB)
  - Profile with React DevTools and browser performance tools
  - _Requirements: NFR-1_

- [ ]* 6.8 Write accessibility tests
  - Test keyboard navigation (Tab, Enter, Space)
  - Test focus indicators visibility
  - Test screen reader announcements
  - Test reduced motion support
  - Test contrast ratios
  - _Requirements: NFR-3_

- [ ] 6.9 OBS integration testing
  - Test transparent background in OBS Browser Source
  - Verify layout at 1920×1080 resolution
  - Test performance in OBS (no frame drops)
  - Verify safe area margins respected
  - Test all density modes in OBS
  - _Requirements: NFR-5_

- [ ] 6.10 Final checkpoint - Comprehensive testing
  - Run all unit tests and verify passing
  - Run all integration tests and verify passing
  - Test all keyboard shortcuts
  - Test all density modes
  - Test auto-collapse behavior
  - Test progressive disclosure
  - Verify center viewport dimensions meet requirements
  - Verify 60fps performance
  - Ensure all tests pass, ask the user if questions arise.

---

## Implementation Notes

### Task Execution Order
Tasks are ordered to build incrementally:
1. **Foundation first** - State management and CSS infrastructure
2. **Layout restructuring** - New component architecture
3. **Visual refactoring** - Floating module system
4. **Interactive features** - Progressive disclosure and auto-collapse
5. **Polish** - Performance optimization and accessibility

### Testing Strategy
- Unit tests marked with `*` are optional but recommended
- Integration tests verify cross-component behavior
- Performance tests ensure 60fps target
- Accessibility tests ensure WCAG AA compliance
- All tests should be run before final checkpoint

### Requirements Traceability
Each task references specific requirements:
- **US-X**: User Stories from requirements.md
- **FR-X**: Functional Requirements from requirements.md
- **NFR-X**: Non-Functional Requirements from requirements.md
- **DC-X**: Design Constraints from requirements.md

### Checkpoints
Checkpoints are placed after major phases:
- After foundation (state + CSS)
- After layout restructuring
- After floating module system
- After progressive disclosure
- After auto-collapse
- Final comprehensive checkpoint

### Performance Considerations
- All animations use GPU-accelerated properties (transform, opacity)
- will-change hints added for animating elements
- Reduced motion support for accessibility
- Event listener cleanup to prevent memory leaks
- Debounced resize handlers for performance

### Accessibility Considerations
- Keyboard navigation for all interactive elements
- ARIA labels and announcements
- Focus indicators
- Reduced motion support
- Minimum contrast ratios

---

## Success Criteria Checklist

This implementation is complete when:

✅ **Spatial Goals**
- [ ] Center viewport ≥75% width (Stream Mode)
- [ ] Center viewport ≥85% width (Focus Mode)
- [ ] Bottom bar ≤60px height (Stream Mode)
- [ ] ChatWidget completely removed
- [ ] Right sidebar ≤180px width (Stream Mode)

✅ **Density Modes**
- [ ] Stream Mode functional with correct layout
- [ ] Focus Mode functional with minimal UI
- [ ] Break Mode functional with expanded UI
- [ ] Smooth transitions between modes (≤500ms)
- [ ] Keyboard shortcut cycles modes (Ctrl+Shift+M)

✅ **Floating Module System**
- [ ] All widgets use floating module styling
- [ ] Semi-transparent backgrounds with blur
- [ ] Hover effects with subtle lift
- [ ] Gradient border glow on hover

✅ **Progressive Disclosure**
- [ ] Left sidebar collapsible
- [ ] TaskModule collapsed by default
- [ ] Hover-to-expand with 300ms delay
- [ ] Hotkey toggles sidebar (Ctrl+Shift+S)

✅ **Auto-Collapse**
- [ ] Typing detection working
- [ ] Fade to 70% opacity during typing
- [ ] Idle timeout restores opacity (5s)
- [ ] Smooth transitions (400ms)

✅ **Performance**
- [ ] 60fps maintained during all transitions
- [ ] CPU usage <5% during idle
- [ ] No layout thrashing
- [ ] Memory usage <100MB

✅ **Persistence**
- [ ] Density mode saved to localStorage
- [ ] Sidebar state saved to localStorage
- [ ] Settings saved to localStorage
- [ ] State survives page refresh

✅ **Accessibility**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announcements
- [ ] Reduced motion support
- [ ] Contrast ratios ≥4.5:1

✅ **OBS Compatibility**
- [ ] Transparent background works
- [ ] Layout correct at 1920×1080
- [ ] No performance degradation
- [ ] Safe area margins respected

---

**Document Status:** Ready for Implementation  
**Total Tasks:** 46 (31 implementation + 15 optional testing)  
**Estimated Complexity:** High (major UX redesign with state management, animations, and performance optimization)  
**Next Step:** Begin implementation with Task 1.1
