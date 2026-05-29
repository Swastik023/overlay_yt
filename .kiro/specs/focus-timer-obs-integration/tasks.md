# Implementation Plan: Focus Timer OBS Integration

## Overview

This implementation plan transforms the OBS overlay from a standalone browser timer to a real-time mirror of Focus Timer's state. The bridge service acts as a translation layer between Focus Timer's D-Bus interface and the overlay's WebSocket connection, enabling streamers to use Focus Timer naturally while viewers see synchronized timer state.

**Key Architecture**:
- Focus Timer (Vala/GTK) = Single source of truth
- Bridge Service (Node.js) = D-Bus ↔ WebSocket translator
- React Overlay = Stateless visual display

**Implementation Language**: TypeScript/JavaScript (Node.js for bridge, React/TypeScript for overlay)

## Tasks

- [x] 1. Set up bridge service project structure
  - Create `straming/bridge/` directory structure
  - Initialize TypeScript configuration for bridge service
  - Install dependencies: `dbus-next`, `ws`, `@types/ws`
  - Create `straming/bridge/tsconfig.json` with Node.js settings
  - Create `straming/bridge/src/` directory for source files
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Implement D-Bus connection and signal subscription
  - [x] 2.1 Create D-Bus client module (`straming/bridge/src/dbus-client.ts`)
    - Connect to session bus
    - Get Focus Timer proxy object at `io.github.focustimerhq.FocusTimer`
    - Get Timer interface proxy at `io.github.focustimerhq.FocusTimer.Timer`
    - Get Session interface proxy at `io.github.focustimerhq.FocusTimer.Session`
    - Implement connection error handling
    - _Requirements: 2.1, 7.1, 15.2_

  - [x] 2.2 Subscribe to Timer D-Bus signals
    - Subscribe to `Timer.Tick` signal (emitted every second)
    - Subscribe to `Timer.Changed` signal (state transitions)
    - Subscribe to `Timer.Finished` signal (completion events)
    - Convert microsecond timestamps to seconds
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.3 Write property test for timestamp conversion
    - **Property 2: Microsecond to Second Timestamp Conversion**
    - **Validates: Requirement 2.5**
    - Test that microsecond timestamps are correctly divided by 1,000,000
    - Test rounding behavior for fractional seconds

  - [x] 2.4 Implement D-Bus method calls for state queries
    - Implement `GetElapsed()`, `GetRemaining()`, `GetProgress()` calls
    - Implement `IsStarted()`, `IsRunning()`, `IsPaused()`, `IsFinished()` calls
    - Read Timer properties: State, Duration, StartedTime, PausedTime, FinishedTime
    - Read Session properties: CurrentState, StartTime, EndTime
    - _Requirements: 3.2, 6.1, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4_

  - [ ]* 2.5 Write unit tests for D-Bus client module
    - Test connection establishment and error handling
    - Test signal subscription
    - Test method call responses
    - Mock D-Bus service for testing
    - _Requirements: 2.1, 7.1_

- [x] 3. Implement timer state data model and validation
  - [x] 3.1 Create TimerState interface and validation (`straming/bridge/src/types.ts`)
    - Define TimerState interface matching design spec
    - Define SessionState interface matching design spec
    - Implement validation function for TimerState fields
    - Implement validation function for SessionState fields
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4_

  - [ ]* 3.2 Write property test for timer state validation
    - **Property 7: Timer State Validation**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**
    - Generate random timer states and validate all fields
    - Test boundary conditions (negative values, invalid enums, out-of-range progress)

  - [ ]* 3.3 Write property test for session state validation
    - **Property 8: Session State Validation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
    - Generate random session states and validate all fields
    - Test startTime ≤ endTime constraint

- [x] 4. Implement state manager for bridge service
  - [x] 4.1 Create state manager module (`straming/bridge/src/state-manager.ts`)
    - Maintain current timer state cache
    - Maintain current session state cache
    - Update state from D-Bus signals
    - Provide getCurrentState() method for new connections
    - _Requirements: 1.1, 3.2, 6.3_

  - [x] 4.2 Implement remaining time calculation from timestamps
    - Calculate remaining = max(0, duration - (currentTime - startTime))
    - Use authoritative timestamps (no local intervals)
    - Handle paused state correctly
    - _Requirements: 6.3, 6.4_

  - [ ]* 4.3 Write property test for remaining time calculation
    - **Property 5: Remaining Time Calculation from Timestamps**
    - **Validates: Requirement 6.3**
    - Generate random start times, durations, and current times
    - Verify remaining = max(0, duration - (currentTime - startTime))

  - [ ]* 4.4 Write unit tests for state manager
    - Test state updates from D-Bus signals
    - Test getCurrentState() returns cached state
    - Test remaining time calculation edge cases
    - _Requirements: 1.1, 3.2, 6.3_

- [x] 5. Checkpoint - Ensure D-Bus integration works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement WebSocket server
  - [x] 6.1 Create WebSocket server module (`straming/bridge/src/websocket-server.ts`)
    - Initialize WebSocket server on localhost:8080
    - Accept multiple client connections
    - Maintain list of connected clients
    - Handle client connection events
    - Handle client disconnection events
    - _Requirements: 9.4, 15.3, 18.1_

  - [x] 6.2 Implement state broadcasting to all connected clients
    - Broadcast timer state changes to all clients
    - Send current state to newly connected clients immediately
    - Serialize TimerState and SessionState to JSON
    - _Requirements: 1.3, 3.1, 3.2, 3.4_

  - [ ]* 6.3 Write property test for state broadcasting
    - **Property 1: State Broadcasting to All Connected Overlays**
    - **Validates: Requirements 1.3, 3.1, 18.2**
    - Simulate 1-10 connected clients
    - Verify all clients receive identical state updates in same broadcast cycle

  - [ ]* 6.4 Write property test for new connection state delivery
    - **Property 3: New Connection Receives Current State**
    - **Validates: Requirement 3.2**
    - Simulate new client connection with various timer states
    - Verify first message contains complete current state

  - [ ]* 6.5 Write property test for WebSocket message completeness
    - **Property 4: WebSocket Message Completeness**
    - **Validates: Requirement 3.4**
    - Generate random timer states
    - Verify serialized messages contain all required fields

  - [x] 6.3 Implement connection isolation
    - Ensure disconnecting one client doesn't affect others
    - Handle client errors without crashing server
    - _Requirements: 18.4_

  - [ ]* 6.4 Write property test for connection isolation
    - **Property 11: Connection Isolation**
    - **Validates: Requirement 18.4**
    - Simulate 2+ connected clients
    - Disconnect one client and verify others remain connected

  - [ ]* 6.5 Write unit tests for WebSocket server
    - Test multiple client connections
    - Test broadcast to all clients
    - Test client disconnection handling
    - _Requirements: 18.1, 18.4_

- [x] 7. Wire D-Bus signals to WebSocket broadcasts
  - [x] 7.1 Create main bridge service entry point (`straming/bridge/src/index.ts`)
    - Initialize D-Bus client
    - Initialize state manager
    - Initialize WebSocket server
    - Connect D-Bus signal handlers to state manager
    - Connect state manager updates to WebSocket broadcasts
    - _Requirements: 1.3, 3.1, 7.4_

  - [x] 7.2 Implement comprehensive event logging
    - Log D-Bus connection attempts and errors
    - Log state transitions
    - Log WebSocket client connections/disconnections
    - Add --debug flag for verbose logging (D-Bus signals, WebSocket messages)
    - _Requirements: 7.4, 13.1, 13.2, 13.4, 16.1, 16.2, 16.3_

  - [ ]* 7.3 Write property test for comprehensive event logging
    - **Property 9: Comprehensive Event Logging**
    - **Validates: Requirements 7.4, 13.1, 13.4, 16.2, 16.3, 16.4**
    - Simulate various events (D-Bus errors, state transitions, signals, messages)
    - Verify log entries are created with timestamp and context

  - [ ]* 7.4 Write integration tests for signal-to-broadcast flow
    - Mock D-Bus signal emission
    - Verify WebSocket clients receive updates
    - Test end-to-end latency (<100ms)
    - _Requirements: 1.3, 3.1_

- [x] 8. Implement D-Bus reconnection logic
  - [x] 8.1 Add D-Bus connection retry mechanism
    - Retry connection every 5 seconds when Focus Timer not running
    - Retry connection every 2 seconds when connection lost during operation
    - Re-subscribe to all signals after reconnection
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 8.2 Implement graceful offline state handling
    - Detect when Focus Timer is not running
    - Broadcast "offline" state to connected overlays
    - Distinguish between "Bridge disconnected" and "Focus Timer offline"
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ]* 8.3 Write unit tests for reconnection logic
    - Test retry intervals
    - Test signal re-subscription after reconnection
    - Test offline state detection
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 9. Implement graceful shutdown
  - [x] 9.1 Add signal handlers for SIGTERM and SIGINT
    - Close all WebSocket connections gracefully
    - Unsubscribe from D-Bus signals
    - Complete shutdown within 2 seconds
    - Log shutdown message
    - _Requirements: 20.2, 20.3, 20.4_

  - [ ]* 9.2 Write property test for graceful shutdown
    - **Property 12: Graceful Shutdown Connection Cleanup**
    - **Validates: Requirement 20.2**
    - Simulate 0-10 active connections
    - Send SIGTERM/SIGINT
    - Verify all connections closed with proper WebSocket close frames

  - [ ]* 9.3 Write unit tests for shutdown behavior
    - Test SIGTERM handling
    - Test SIGINT handling
    - Test shutdown timeout
    - _Requirements: 20.2, 20.3, 20.4_

- [ ] 10. Add health check endpoint
  - [ ] 10.1 Create HTTP server for health checks (`straming/bridge/src/http-server.ts`)
    - Add HTTP server on localhost:8081
    - Implement GET /health endpoint
    - Return connection status (D-Bus connected, WebSocket clients count)
    - _Requirements: 16.5_

  - [ ]* 10.2 Write unit tests for health check endpoint
    - Test /health returns correct status
    - Test response format
    - _Requirements: 16.5_

- [x] 11. Checkpoint - Ensure bridge service is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Remove local timer logic from overlay
  - [x] 12.1 Remove useTimer hook
    - Delete `straming/src/hooks/useTimer.ts` file
    - Remove all imports of useTimer from components
    - _Requirements: 19.1, 19.3_

  - [x] 12.2 Remove timer state from Zustand store
    - Remove timer-related fields from `useStore.ts`: timeLeft, isRunning, deadline, timerMode, session, pomodorosCompleted, totalFocusSeconds, breaks, currentBreakDuration
    - Remove timer actions: startTimer, pauseTimer, resetTimer, switchMode, tick
    - Keep task management and Spotify integration (unrelated to timer)
    - Remove timer fields from persistence (partialize function)
    - _Requirements: 19.2, 19.3, 19.4_

  - [x] 12.3 Verify no local timer intervals remain
    - Search for setInterval/setTimeout related to timer
    - Remove any remaining timer countdown logic
    - _Requirements: 19.3_

- [x] 13. Create overlay bridge connection hook
  - [x] 13.1 Create useFocusTimerBridge hook (`straming/src/hooks/useFocusTimerBridge.ts`)
    - Connect to bridge WebSocket on localhost:8080
    - Receive timer state updates via WebSocket
    - Receive session state updates via WebSocket
    - Maintain connection status (connected/disconnected/reconnecting)
    - Store last received timer state and session state
    - _Requirements: 3.1, 3.2, 8.1, 16.4_

  - [x] 13.2 Implement exponential backoff reconnection
    - Retry connection with exponential backoff (1s, 2s, 4s, 8s, max 10s)
    - Display connection status indicator
    - Maintain last known state during reconnection
    - _Requirements: 4.2, 4.3, 8.2, 8.3_

  - [ ]* 13.3 Write property test for state preservation during reconnection
    - **Property 6: State Preservation During Reconnection**
    - **Validates: Requirement 8.4**
    - Simulate connection loss with various timer states
    - Verify overlay continues displaying last known state
    - Verify no state modification during reconnection

  - [ ]* 13.4 Write unit tests for bridge connection hook
    - Test WebSocket connection establishment
    - Test reconnection logic
    - Test state update handling
    - Mock WebSocket for testing
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 14. Create overlay timer state store
  - [x] 14.1 Create Zustand store for bridge state (`straming/src/store/useFocusTimerStore.ts`)
    - Store current timer state from bridge
    - Store current session state from bridge
    - Store connection status
    - Provide actions to update state from bridge messages
    - _Requirements: 1.2, 3.1, 3.2_

  - [ ]* 14.2 Write unit tests for timer state store
    - Test state updates
    - Test connection status tracking
    - _Requirements: 1.2, 3.1_

- [x] 15. Update overlay components to use bridge state
  - [x] 15.1 Update LeftSidebarNew component
    - Replace useStore timer state with useFocusTimerStore
    - Remove useTimer hook call
    - Display timer state from bridge (timeLeft → remaining)
    - Display session state from bridge (pomodorosCompleted, currentCycle)
    - Update progress ring calculation to use bridge state
    - Handle offline state display (show "Focus Timer Offline" when disconnected)
    - _Requirements: 1.2, 5.1, 5.3, 6.1, 6.2, 17.1, 17.2, 17.3, 17.4_

  - [x] 15.2 Add connection status indicator to overlay
    - Display connection status (connected/disconnected/reconnecting)
    - Show subtle indicator without distracting viewers
    - Maintain visual aesthetic during offline state
    - _Requirements: 5.1, 5.2, 5.3, 8.3_

  - [x] 15.3 Update other timer-dependent components
    - Update any other components that reference timer state
    - Ensure all components use bridge state instead of local state
    - _Requirements: 1.2, 6.1_

  - [ ]* 15.4 Write integration tests for overlay components
    - Test component rendering with bridge state
    - Test offline state display
    - Test connection status indicator
    - _Requirements: 5.1, 5.3, 17.4_

- [x] 16. Implement overlay initialization and cleanup
  - [x] 16.1 Initialize bridge connection on overlay mount
    - Connect to bridge when overlay loads in OBS
    - Request current state immediately after connection
    - _Requirements: 8.1, 8.5_

  - [x] 16.2 Clean up connection on overlay unmount
    - Disconnect WebSocket when overlay unloads
    - Clear reconnection timers
    - _Requirements: 8.3_

  - [ ]* 16.3 Write unit tests for overlay lifecycle
    - Test connection initialization
    - Test cleanup on unmount
    - _Requirements: 8.1, 8.3_

- [x] 17. Checkpoint - Ensure overlay integration works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Create bridge service startup script
  - [x] 18.1 Create npm scripts in bridge package.json
    - Add `start` script: `node dist/index.js`
    - Add `dev` script: `tsx watch src/index.ts`
    - Add `build` script: `tsc`
    - Add `debug` script: `node dist/index.js --debug`
    - _Requirements: 9.1, 16.1_

  - [x] 18.2 Create README for bridge service
    - Document installation steps
    - Document how to start bridge service
    - Document environment variables (if any)
    - Document debugging with --debug flag
    - _Requirements: 16.1_

- [x] 19. Create integration documentation
  - [x] 19.1 Create main README for integration
    - Document architecture overview
    - Document setup steps (Focus Timer + Bridge + Overlay)
    - Document OBS browser source configuration
    - Document troubleshooting common issues
    - _Requirements: 13.5_

  - [x] 19.2 Create troubleshooting guide
    - Document error messages and solutions
    - Document how to check D-Bus connection
    - Document how to check WebSocket connection
    - Document how to enable debug logging
    - _Requirements: 13.5, 16.1_

- [ ] 20. End-to-end integration testing
  - [ ]* 20.1 Test complete integration flow
    - Start Focus Timer
    - Start bridge service
    - Load overlay in browser
    - Verify timer state synchronization
    - Test timer lifecycle (start, pause, resume, finish)
    - Test auto-switch between focus and break
    - Test long break after 4 pomodoros
    - _Requirements: 1.1, 1.3, 6.1, 6.2_

  - [ ]* 20.2 Test error recovery scenarios
    - Test Focus Timer restart during operation
    - Test bridge service restart during operation
    - Test overlay refresh in OBS
    - Test multiple overlays connected simultaneously
    - _Requirements: 4.1, 4.4, 7.1, 7.2, 18.1, 18.2_

  - [ ]* 20.3 Test long session stability
    - Run 4-hour streaming session simulation
    - Verify no timer drift
    - Verify no memory leaks
    - Verify performance metrics (CPU <1%, memory <50MB)
    - _Requirements: 6.4, 14.1, 14.2, 14.3_

  - [ ]* 20.4 Test visual consistency
    - Verify timer display matches Focus Timer
    - Verify smooth updates without flickering
    - Verify break state visual distinction
    - Verify offline state display
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 21. Final checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- **MVP FOCUS**: Get timer sync working with stable reconnection and beautiful UI
- **SKIP FOR NOW**: Property tests, health endpoints, advanced validation, multi-overlay optimization
- Each task references specific requirements for traceability
- The bridge service is implemented in TypeScript/Node.js for fast iteration
- The overlay uses React/TypeScript (existing stack)
- Focus Timer is the single source of truth - no timer logic in overlay
- All timestamps are converted from microseconds (D-Bus) to seconds (overlay)
- WebSocket communication is localhost-only for security

## MVP Priority Order

**Phase 1 (Critical)**: Tasks 1-9, 12-16 - Get timer sync working with stable reconnection
**Phase 2 (Polish)**: Tasks 18-19 - Documentation and startup scripts
**Phase 3 (Optional)**: Tasks 10, 17, 20-21 - Health checks, advanced testing

## Real Hard Problems to Solve

1. **OBS Browser Source Lifecycle Weirdness** - Sources reload randomly, must reconnect FAST
2. **Instant State Rehydration** - Overlay must never show stale state after reload
3. **Subtle Offline UI** - Never show "ERROR" or "CONNECTION LOST" - use aesthetic fallback
4. **No Timer Drift** - Overlay must NEVER own timer logic (browser throttling kills accuracy)
