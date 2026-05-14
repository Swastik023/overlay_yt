# Requirements Document: Focus Timer OBS Integration

## Introduction

This document specifies the requirements for integrating Focus Timer (a native Linux Pomodoro timer) with an OBS streaming overlay. The system enables streamers to use Focus Timer naturally during work while viewers see synchronized timer state in the stream overlay, eliminating browser timer drift and workflow disconnection.

**Key Design Principles**:
- Single-streamer, single-machine setup (not distributed)
- One-way sync initially (Focus Timer → Overlay)
- Read-only overlay (no control buttons in Phase 1)
- Node.js bridge service for fast iteration
- Lightweight and pragmatic implementation

## Glossary

- **Focus_Timer**: Native Linux desktop Pomodoro timer application (formerly gnome-pomodoro) that serves as the authoritative timer state
- **Bridge_Service**: Node.js service that translates D-Bus signals from Focus Timer to WebSocket events for the overlay
- **Overlay**: React/TypeScript browser-based visual component displayed in OBS as a browser source
- **OBS**: Open Broadcaster Software, used for live streaming
- **D-Bus**: Linux inter-process communication system used by Focus Timer
- **WebSocket**: Bidirectional communication protocol between Bridge Service and Overlay
- **Timer_State**: Current state of the Pomodoro timer (stopped, pomodoro, short-break, long-break)
- **Session_State**: Current Pomodoro session information (cycles completed, current cycle)
- **Pomodoro**: 25-minute focused work period
- **Short_Break**: 5-minute break between pomodoros
- **Long_Break**: 15-minute break after completing 4 pomodoros
- **Streamer**: Person using Focus Timer and streaming with OBS
- **Viewer**: Person watching the stream who sees the overlay

## Requirements

### Requirement 1: Focus Timer as Single Source of Truth

**User Story:** As a streamer, I want Focus Timer to be the authoritative timer state, so that I can use it naturally for my actual productivity work while streaming.

#### Acceptance Criteria

1. THE Focus_Timer SHALL maintain the authoritative timer state for all timer operations
2. THE Overlay SHALL NOT contain any local timer logic or state management
3. WHEN Focus_Timer state changes, THE Bridge_Service SHALL propagate the change to all connected overlays
4. THE system SHALL NOT duplicate timer logic between Focus_Timer and Overlay

### Requirement 2: D-Bus Signal Subscription

**User Story:** As a system integrator, I want the bridge service to subscribe to Focus Timer's D-Bus signals, so that state changes are propagated in real-time without polling.

#### Acceptance Criteria

1. WHEN Bridge_Service starts, THE Bridge_Service SHALL subscribe to Focus_Timer D-Bus signals on the session bus
2. WHEN Focus_Timer emits a Timer.Tick signal, THE Bridge_Service SHALL receive the signal within 100 milliseconds
3. WHEN Focus_Timer emits a Timer.Changed signal, THE Bridge_Service SHALL receive the signal within 50 milliseconds
4. WHEN Focus_Timer emits a Timer.Finished signal, THE Bridge_Service SHALL receive the signal within 50 milliseconds
5. THE Bridge_Service SHALL convert microsecond timestamps from D-Bus to seconds for overlay consumption

### Requirement 3: WebSocket State Broadcasting

**User Story:** As a streamer, I want the overlay to receive real-time timer updates, so that viewers see accurate timer state without delay.

#### Acceptance Criteria

1. WHEN Bridge_Service receives a D-Bus signal from Focus_Timer, THE Bridge_Service SHALL broadcast the state change to all connected overlays via WebSocket
2. WHEN Overlay connects to Bridge_Service, THE Bridge_Service SHALL send the current timer state immediately
3. THE Bridge_Service SHALL broadcast timer tick updates at least once per second
4. THE WebSocket message payload SHALL include timer state (state, duration, elapsed, remaining, progress, isRunning, isPaused, isFinished)
5. THE WebSocket communication SHALL use localhost (127.0.0.1) only for security

### Requirement 4: OBS Browser Source Reconnection Handling

**User Story:** As a streamer, I want the overlay to handle frequent OBS browser source reconnections gracefully, so that my stream remains stable when OBS refreshes the browser source.

#### Acceptance Criteria

1. WHEN Overlay WebSocket connection is lost, THE Overlay SHALL attempt to reconnect automatically
2. WHEN Overlay reconnects to Bridge_Service, THE Bridge_Service SHALL send the current timer state within 100 milliseconds
3. THE Overlay SHALL use exponential backoff for reconnection attempts (starting at 1 second, max 10 seconds)
4. WHEN Overlay is reconnecting, THE Overlay SHALL display the last known timer state without visual glitches
5. THE reconnection process SHALL NOT cause visible flashing or layout shifts in the stream

### Requirement 5: Graceful Offline State Display

**User Story:** As a streamer, I want the overlay to display a clean offline state when Focus Timer is not running, so that viewers don't see a broken UI during stream setup or when I'm not using the timer.

#### Acceptance Criteria

1. WHEN Focus_Timer is not running, THE Overlay SHALL display a "Focus Timer Offline" message or subtle idle state
2. WHEN Bridge_Service cannot connect to Focus_Timer, THE Overlay SHALL NOT display error messages or broken UI elements
3. THE offline state display SHALL maintain the overlay's visual aesthetic and not distract viewers
4. WHEN Focus_Timer starts after being offline, THE Overlay SHALL transition smoothly to displaying active timer state
5. THE Overlay SHALL distinguish between "Bridge disconnected" and "Focus Timer offline" states

### Requirement 6: Timer State Synchronization

**User Story:** As a streamer, I want the overlay to display the exact same timer state as Focus Timer, so that viewers see accurate information without drift or desynchronization.

#### Acceptance Criteria

1. WHEN Focus_Timer displays a specific remaining time, THE Overlay SHALL display the same remaining time within 1 second
2. WHEN Focus_Timer transitions between states (pomodoro, short-break, long-break), THE Overlay SHALL reflect the transition within 1 second
3. THE Overlay SHALL calculate display time from authoritative timestamps, not local intervals
4. FOR ALL timer sessions longer than 4 hours, THE Overlay SHALL NOT drift more than 2 seconds from Focus_Timer
5. WHEN Focus_Timer is paused, THE Overlay SHALL display the paused state and frozen time

### Requirement 7: Bridge Service Lifecycle Management

**User Story:** As a streamer, I want the bridge service to start automatically and recover from errors, so that I don't have to manually manage it during streaming sessions.

#### Acceptance Criteria

1. WHEN Bridge_Service starts and Focus_Timer is not running, THE Bridge_Service SHALL wait and retry D-Bus connection every 5 seconds
2. WHEN Focus_Timer starts after Bridge_Service, THE Bridge_Service SHALL connect automatically within 5 seconds
3. WHEN D-Bus connection is lost during operation, THE Bridge_Service SHALL attempt reconnection every 2 seconds
4. THE Bridge_Service SHALL log connection attempts and errors for debugging
5. WHEN Bridge_Service reconnects to Focus_Timer, THE Bridge_Service SHALL re-subscribe to all D-Bus signals

### Requirement 8: Overlay Connection Management

**User Story:** As a streamer, I want the overlay to manage WebSocket connections reliably, so that temporary network issues don't break the timer display.

#### Acceptance Criteria

1. WHEN Overlay loads in OBS browser source, THE Overlay SHALL attempt to connect to Bridge_Service immediately
2. WHEN WebSocket connection fails, THE Overlay SHALL retry with exponential backoff (1s, 2s, 4s, 8s, 10s max)
3. WHEN Overlay detects connection loss, THE Overlay SHALL display connection status indicator
4. THE Overlay SHALL maintain the last known timer state during reconnection attempts
5. WHEN Overlay successfully reconnects, THE Overlay SHALL request and display fresh timer state

### Requirement 9: Node.js Bridge Service Implementation

**User Story:** As a developer, I want the bridge service implemented in Node.js, so that I can iterate quickly within the existing JavaScript/Vite ecosystem.

#### Acceptance Criteria

1. THE Bridge_Service SHALL be implemented using Node.js runtime
2. THE Bridge_Service SHALL use the dbus-next library for D-Bus communication
3. THE Bridge_Service SHALL use the ws library for WebSocket server functionality
4. THE Bridge_Service SHALL listen on localhost port 8080 by default
5. THE Bridge_Service SHALL be a single file with fewer than 300 lines of code for MVP

### Requirement 10: Read-Only Overlay (Phase 1)

**User Story:** As a streamer, I want the overlay to be read-only initially, so that I avoid race conditions and state conflicts while controlling Focus Timer directly.

#### Acceptance Criteria

1. THE Overlay SHALL NOT send timer control commands (start, pause, resume, stop, skip) to Bridge_Service in Phase 1
2. THE Overlay SHALL NOT display interactive control buttons in Phase 1
3. THE Overlay SHALL only receive and display timer state from Bridge_Service
4. THE Streamer SHALL control Focus_Timer directly through the desktop application or CLI
5. THE system SHALL prevent overlay actions from conflicting with Focus_Timer state

### Requirement 11: Timer State Data Model

**User Story:** As a developer, I want a well-defined timer state data model, so that the bridge and overlay communicate consistently.

#### Acceptance Criteria

1. THE Timer_State SHALL include state field with values: 'stopped', 'pomodoro', 'short-break', 'long-break', 'break'
2. THE Timer_State SHALL include duration, elapsed, and remaining fields in seconds (non-negative integers)
3. THE Timer_State SHALL include progress field as a decimal between 0.0 and 1.0
4. THE Timer_State SHALL include boolean flags: isRunning, isPaused, isFinished
5. THE Timer_State SHALL include timestamps: startedTime, pausedTime, finishedTime, lastChangedTime (unix seconds or -1)
6. THE Bridge_Service SHALL validate all Timer_State fields before broadcasting to overlays

### Requirement 12: Session State Data Model

**User Story:** As a streamer, I want session information displayed in the overlay, so that viewers can see how many pomodoros I've completed.

#### Acceptance Criteria

1. THE Session_State SHALL include currentState field indicating the current time block state
2. THE Session_State SHALL include pomodorosCompleted field (non-negative integer)
3. THE Session_State SHALL include currentCycle field (positive integer)
4. THE Session_State SHALL include startTime and endTime fields (unix seconds)
5. WHEN Focus_Timer completes a pomodoro, THE Session_State pomodorosCompleted SHALL increment by 1

### Requirement 13: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can troubleshoot issues during streaming sessions.

#### Acceptance Criteria

1. WHEN Bridge_Service encounters a D-Bus error, THE Bridge_Service SHALL log the error with timestamp and context
2. WHEN Bridge_Service cannot connect to Focus_Timer, THE Bridge_Service SHALL log connection attempts
3. WHEN Overlay WebSocket connection fails, THE Overlay SHALL log the error to browser console
4. THE Bridge_Service SHALL log all state transitions and broadcasts for debugging
5. THE error messages SHALL be descriptive and include actionable troubleshooting information

### Requirement 14: Performance and Resource Usage

**User Story:** As a streamer, I want the bridge service to use minimal system resources, so that it doesn't impact streaming performance.

#### Acceptance Criteria

1. THE Bridge_Service SHALL use less than 50MB of resident memory during normal operation
2. THE Bridge_Service SHALL use less than 1% CPU on average during timer operation
3. THE Bridge_Service SHALL use less than 5% CPU during state change broadcasts
4. THE WebSocket communication SHALL use less than 1KB per second per connected overlay
5. THE Overlay SHALL remove all local timer intervals to reduce CPU usage

### Requirement 15: Single-Streamer Architecture

**User Story:** As a single streamer, I want a simple local setup, so that I don't have to deal with distributed system complexity.

#### Acceptance Criteria

1. THE system SHALL run entirely on a single Linux machine
2. THE Bridge_Service SHALL connect to Focus_Timer via local D-Bus session bus (not system bus)
3. THE Overlay SHALL connect to Bridge_Service via localhost WebSocket (127.0.0.1)
4. THE system SHALL NOT require network configuration or firewall rules
5. THE system SHALL NOT include distributed system features (load balancing, clustering, replication)

### Requirement 16: Development and Debugging Support

**User Story:** As a developer, I want good debugging tools, so that I can troubleshoot integration issues quickly.

#### Acceptance Criteria

1. THE Bridge_Service SHALL provide a --debug flag that enables verbose logging
2. WHEN debug mode is enabled, THE Bridge_Service SHALL log all D-Bus signals received
3. WHEN debug mode is enabled, THE Bridge_Service SHALL log all WebSocket messages sent
4. THE Overlay SHALL log connection status changes to browser console
5. THE Bridge_Service SHALL provide a health check endpoint (HTTP GET /health) that returns connection status

### Requirement 17: Overlay Visual Consistency

**User Story:** As a streamer, I want the overlay to maintain visual consistency with Focus Timer, so that the timer display looks professional and matches my desktop application.

#### Acceptance Criteria

1. WHEN Focus_Timer displays a pomodoro state, THE Overlay SHALL use consistent visual styling (colors, fonts, layout)
2. WHEN Focus_Timer displays a break state, THE Overlay SHALL visually distinguish it from work state
3. THE Overlay SHALL display time in MM:SS format matching Focus_Timer
4. THE Overlay SHALL update the display smoothly without flickering or layout shifts
5. THE Overlay SHALL maintain the calm, minimal aesthetic of Focus_Timer

### Requirement 18: Multiple Overlay Support

**User Story:** As a streamer, I want to use multiple OBS browser sources with the same timer, so that I can display the timer in different scenes or layouts.

#### Acceptance Criteria

1. THE Bridge_Service SHALL support multiple simultaneous WebSocket connections
2. WHEN multiple overlays are connected, THE Bridge_Service SHALL broadcast state changes to all connected clients
3. FOR ALL connected overlays, THE displayed timer state SHALL be identical within 100 milliseconds
4. WHEN one overlay disconnects, THE Bridge_Service SHALL continue serving other connected overlays
5. THE Bridge_Service SHALL handle at least 10 concurrent overlay connections without performance degradation

### Requirement 19: Overlay State Cleanup

**User Story:** As a developer, I want to remove all local timer logic from the overlay, so that Focus Timer is truly the single source of truth.

#### Acceptance Criteria

1. THE Overlay SHALL NOT contain a useTimer hook or equivalent local timer logic
2. THE Overlay SHALL NOT store timer state (timeLeft, isRunning, deadline) in Zustand store
3. THE Overlay SHALL NOT use setInterval or setTimeout for timer countdown
4. THE Overlay SHALL NOT persist timer state to localStorage
5. THE Overlay SHALL only maintain connection state and last received timer state from Bridge_Service

### Requirement 20: Bridge Service Startup and Shutdown

**User Story:** As a streamer, I want the bridge service to start and stop cleanly, so that it integrates well with my streaming workflow.

#### Acceptance Criteria

1. WHEN Bridge_Service starts, THE Bridge_Service SHALL log startup message with version and configuration
2. WHEN Bridge_Service receives SIGTERM or SIGINT, THE Bridge_Service SHALL close all WebSocket connections gracefully
3. WHEN Bridge_Service shuts down, THE Bridge_Service SHALL unsubscribe from D-Bus signals
4. THE Bridge_Service SHALL complete shutdown within 2 seconds of receiving termination signal
5. WHEN Bridge_Service restarts, THE Bridge_Service SHALL reconnect to Focus_Timer and resume operation automatically
