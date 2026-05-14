# Overlay Changes Plan: Focus Timer Integration

## Overview

This document outlines the changes needed to transform the current browser-based Pomodoro timer overlay into a **stateless visual mirror** that displays timer state from Focus Timer via a bridge service.

**Goal**: Remove all local timer logic and make the overlay a pure display component that receives state from the bridge service via WebSocket.

---

## Current State Analysis

### Files with Timer Logic (TO BE MODIFIED/REMOVED)

1. **`src/hooks/useTimer.ts`** - ❌ DELETE
   - Contains `setInterval` logic (250ms tick)
   - Manages timer lifecycle
   - Handles notifications
   - **Action**: Delete entire file

2. **`src/store/useStore.ts`** - ⚠️ MODIFY
   - Timer state: `timerMode`, `timeLeft`, `isRunning`, `deadline`, `session`, `pomodorosCompleted`, `totalFocusSeconds`, `breaks`, `currentBreakDuration`
   - Timer actions: `startTimer()`, `pauseTimer()`, `resetTimer()`, `switchMode()`, `tick()`
   - **Action**: Remove timer state and actions, keep tasks and Spotify

3. **`src/components/LeftSidebarNew.tsx`** - ⚠️ MODIFY
   - Imports `useTimer` hook
   - Reads timer state from store
   - Calls timer actions (start, pause, reset, switchMode)
   - **Action**: Replace with bridge connection, remove control buttons (Phase 1)

4. **`src/App.tsx`** - ✅ NO CHANGES
   - No timer logic
   - Only handles Spotify OAuth and layout

### Files to Keep Unchanged

- ✅ `src/components/TopHeader.tsx` - No timer logic
- ✅ `src/components/SpotifySettings.tsx` - Spotify only
- ✅ `src/hooks/useSpotify.ts` - Spotify only
- ✅ `src/utils/spotifyAuth.ts` - Spotify only
- ✅ `src/store/useBridgeStore.ts` - Already exists for WebSocket

---

## Phase 1: MVP Changes (Read-Only Overlay)

### Step 1: Create Bridge Connection Hook

**New File**: `src/hooks/useFocusTimerBridge.ts`

```typescript
import { useEffect, useState, useCallback } from 'react'

// Timer state from Focus Timer (via bridge)
export interface TimerState {
  state: 'stopped' | 'pomodoro' | 'short-break' | 'long-break' | 'break'
  duration: number        // seconds
  elapsed: number         // seconds
  remaining: number       // seconds
  progress: number        // 0.0 to 1.0
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  startedTime: number     // unix seconds or -1
  pausedTime: number      // unix seconds or -1
  finishedTime: number    // unix seconds or -1
  lastChangedTime: number // unix seconds
}

// Session state from Focus Timer (via bridge)
export interface SessionState {
  currentState: string
  startTime: number
  endTime: number
  pomodorosCompleted: number
  currentCycle: number
  hasUniformBreaks: boolean
}

// Connection status
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'offline'

// Bridge connection hook
export function useFocusTimerBridge(bridgeUrl: string = 'ws://127.0.0.1:8080') {
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  // Connect to bridge service
  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(bridgeUrl)

      socket.onopen = () => {
        console.log('[FocusTimer Bridge] Connected')
        setConnectionStatus('connected')
        setReconnectAttempt(0)
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'timerState') {
            setTimerState(message.data)
          } else if (message.type === 'sessionState') {
            setSessionState(message.data)
          } else if (message.type === 'offline') {
            setConnectionStatus('offline')
          }
        } catch (err) {
          console.error('[FocusTimer Bridge] Failed to parse message:', err)
        }
      }

      socket.onerror = (error) => {
        console.error('[FocusTimer Bridge] WebSocket error:', error)
      }

      socket.onclose = () => {
        console.log('[FocusTimer Bridge] Disconnected')
        setConnectionStatus('disconnected')
        setWs(null)
        
        // Exponential backoff reconnection (1s, 2s, 4s, 8s, 10s max)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 10000)
        console.log(`[FocusTimer Bridge] Reconnecting in ${delay}ms...`)
        setConnectionStatus('reconnecting')
        
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1)
          connect()
        }, delay)
      }

      setWs(socket)
    } catch (err) {
      console.error('[FocusTimer Bridge] Connection failed:', err)
      setConnectionStatus('disconnected')
    }
  }, [bridgeUrl, reconnectAttempt])

  // Initial connection
  useEffect(() => {
    connect()
    
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, []) // Only connect once on mount

  return {
    timerState,
    sessionState,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  }
}
```

**Purpose**: Manages WebSocket connection to bridge service and provides timer/session state.

---

### Step 2: Update Zustand Store

**File**: `src/store/useStore.ts`

**Changes**:

```typescript
// REMOVE these timer-related types and state:
// - timerMode
// - timeLeft
// - isRunning
// - deadline
// - session
// - pomodorosCompleted
// - totalFocusSeconds
// - breaks
// - currentBreakDuration

// REMOVE these timer actions:
// - startTimer()
// - pauseTimer()
// - resetTimer()
// - switchMode()
// - tick()

// KEEP these (unchanged):
// - tasks (Task[])
// - dailyGoal
// - nowPlaying (NowPlaying)
// - spotifyAccessToken
// - spotifyRefreshToken
// - Task actions (addTask, toggleTask, removeTask, updateTask, setDailyGoal)
// - Spotify actions (setNowPlaying, setSpotifyAccessToken, setSpotifyRefreshToken)
```

**New Store Structure**:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  text: string
  completed: boolean
}

export interface NowPlaying {
  name: string
  artist: string
  album: string
  albumArt: string
  isPlaying: boolean
  progress: number
  duration: number
}

interface StreamStore {
  // Tasks (unchanged)
  tasks: Task[]
  dailyGoal: number

  // Spotify (unchanged)
  nowPlaying: NowPlaying
  spotifyAccessToken: string | null
  spotifyRefreshToken: string | null

  // Actions — Tasks
  addTask: (text: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  updateTask: (id: string, text: string) => void
  setDailyGoal: (n: number) => void

  // Actions — Spotify
  setNowPlaying: (track: NowPlaying) => void
  setSpotifyAccessToken: (token: string | null) => void
  setSpotifyRefreshToken: (token: string | null) => void
}

export const useStore = create<StreamStore>()(
  persist(
    (set) => ({
      // Tasks
      tasks: [
        { id: '1', text: 'LeetCode Practice', completed: true },
        { id: '2', text: 'System Design', completed: false },
        { id: '3', text: 'DevOps Revision', completed: false },
        { id: '4', text: 'AI Research', completed: false },
        { id: '5', text: 'Project Work', completed: false },
      ],
      dailyGoal: 5,

      // Spotify
      nowPlaying: {
        name: 'Deep Focus',
        artist: 'Lofi Beats',
        album: 'Study Music',
        albumArt: '',
        isPlaying: false,
        progress: 0,
        duration: 0,
      },
      spotifyAccessToken: null,
      spotifyRefreshToken: null,

      // Task Actions
      addTask: (text) =>
        set((s) => ({
          tasks: [...s.tasks, { id: Date.now().toString(), text, completed: false }],
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      updateTask: (id, text) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
        })),

      setDailyGoal: (n) => set({ dailyGoal: n }),

      // Spotify Actions
      setNowPlaying: (track) => set({ nowPlaying: track }),
      setSpotifyAccessToken: (token) => set({ spotifyAccessToken: token }),
      setSpotifyRefreshToken: (token) => set({ spotifyRefreshToken: token }),
    }),
    {
      name: 'stream-dashboard',
      partialize: (state) => ({
        tasks: state.tasks,
        dailyGoal: state.dailyGoal,
        spotifyAccessToken: state.spotifyAccessToken,
        spotifyRefreshToken: state.spotifyRefreshToken,
      }),
    }
  )
)
```

---

### Step 3: Update LeftSidebarNew Component

**File**: `src/components/LeftSidebarNew.tsx`

**Changes**:

```typescript
import { useStore } from '../store/useStore'
import { Music2, Wifi, WifiOff } from 'lucide-react'
import { useFocusTimerBridge } from '../hooks/useFocusTimerBridge'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function LeftSidebarNew() {
  // Connect to Focus Timer bridge
  const { timerState, sessionState, connectionStatus, isConnected } = useFocusTimerBridge()

  // Tasks and Spotify (unchanged)
  const tasks = useStore((s) => s.tasks)
  const toggleTask = useStore((s) => s.toggleTask)
  const addTask = useStore((s) => s.addTask)
  const nowPlaying = useStore((s) => s.nowPlaying)

  // Extract timer state from bridge (with fallbacks)
  const timeLeft = timerState?.remaining ?? 1500 // Default 25:00
  const timerMode = timerState?.state === 'pomodoro' ? 'focus' : 'break'
  const isRunning = timerState?.isRunning ?? false
  const pomodorosCompleted = sessionState?.pomodorosCompleted ?? 0
  const currentCycle = sessionState?.currentCycle ?? 1

  // Calculate progress for circular timer
  const totalDuration = timerState?.duration ?? 1500
  const progress = timerState?.progress ? timerState.progress * 100 : 0
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Detect long break
  const isLongBreak = timerState?.state === 'long-break'

  const completedTasks = tasks.filter(t => t.completed).length

  return (
    <div style={{ /* ... same styles ... */ }}>
      {/* Connection Status Indicator */}
      {connectionStatus !== 'connected' && (
        <div
          style={{
            padding: '8px 12px',
            background: connectionStatus === 'offline' 
              ? 'rgba(255, 193, 7, 0.1)' 
              : 'rgba(255, 59, 48, 0.1)',
            border: `1px solid ${connectionStatus === 'offline' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <WifiOff size={14} color={connectionStatus === 'offline' ? '#FFC107' : '#FF3B30'} />
          <span style={{ fontSize: '11px', color: connectionStatus === 'offline' ? '#FFC107' : '#FF3B30' }}>
            {connectionStatus === 'offline' && 'Focus Timer Offline'}
            {connectionStatus === 'reconnecting' && 'Reconnecting...'}
            {connectionStatus === 'disconnected' && 'Bridge Disconnected'}
          </span>
        </div>
      )}

      {/* Session Header */}
      <div>
        <div style={{ /* ... same ... */ }}>
          POMODORO
        </div>
        <div style={{ /* ... same ... */ }}>
          Cycle {currentCycle}/4 • {pomodorosCompleted} completed
        </div>
        {isLongBreak && (
          <div style={{ /* ... same ... */ }}>
            🎉 Long Break (15 min)
          </div>
        )}
      </div>

      {/* REMOVE Focus/Break Toggle buttons (Phase 1 - Read-only) */}

      {/* Circular Timer (same display, no control buttons) */}
      <div style={{ /* ... same ... */ }}>
        <div style={{ /* ... same SVG ... */ }}>
          {/* ... timer display ... */}
          <div style={{ /* ... same ... */ }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ /* ... same ... */ }}>
            {timerMode}
          </div>
        </div>

        {/* REMOVE Control Buttons (Phase 1 - Read-only) */}
        {/* Will add back in Phase 3 with bridge commands */}

        {/* Cycle Dots (same) */}
        <div style={{ /* ... same ... */ }}>
          {/* ... dots ... */}
        </div>
      </div>

      {/* Tasks Section (unchanged) */}
      {/* ... same ... */}

      {/* Spotify Section (unchanged) */}
      {/* ... same ... */}
    </div>
  )
}
```

**Key Changes**:
- ❌ Remove `useTimer()` hook call
- ✅ Add `useFocusTimerBridge()` hook
- ❌ Remove timer control buttons (start, pause, reset, mode switch)
- ✅ Add connection status indicator
- ✅ Display timer state from bridge with fallbacks
- ✅ Keep tasks and Spotify unchanged

---

### Step 4: Delete useTimer Hook

**File**: `src/hooks/useTimer.ts`

**Action**: ❌ **DELETE ENTIRE FILE**

This file contains all the local timer logic that will be replaced by Focus Timer.

---

### Step 5: Update Package Dependencies

**File**: `package.json`

**No new dependencies needed!** The native browser `WebSocket` API is sufficient.

Optional (for better reconnection):
```json
{
  "dependencies": {
    "reconnecting-websocket": "^4.4.0"
  }
}
```

---

## Phase 2: Production Readiness

### Additional Changes

1. **Error Boundary** - Wrap bridge connection in error boundary
2. **Reconnection UI** - Better visual feedback during reconnection
3. **Health Check** - Ping bridge service periodically
4. **Logging** - Structured logging for debugging
5. **State Persistence** - Remember last known state during reconnection

---

## Phase 3: Advanced Features (Optional)

### Add Control Buttons Back

Once bridge service supports commands, add back:
- Start/Pause button → sends command to bridge
- Reset button → sends command to bridge
- Mode switch buttons → sends command to bridge

**Implementation**:
```typescript
// In useFocusTimerBridge hook
const sendCommand = useCallback((command: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'command', command }))
  }
}, [ws])

// In LeftSidebarNew component
<button onClick={() => sendCommand('start')}>Start</button>
<button onClick={() => sendCommand('pause')}>Pause</button>
<button onClick={() => sendCommand('reset')}>Reset</button>
```

---

## Testing Checklist

### Before Bridge Service Exists

- [ ] Code compiles without errors
- [ ] Overlay displays with fallback state (25:00, stopped)
- [ ] Connection status shows "Bridge Disconnected"
- [ ] Tasks and Spotify still work
- [ ] No console errors

### After Bridge Service Exists

- [ ] Overlay connects to bridge on load
- [ ] Timer state updates in real-time
- [ ] Connection status shows "Connected"
- [ ] Overlay survives refresh without losing state
- [ ] Multiple overlays show identical state
- [ ] Offline state displays when Focus Timer not running
- [ ] Reconnection works after bridge restart

---

## Migration Strategy

### Step-by-Step Migration

1. **Create new hook** (`useFocusTimerBridge.ts`) ✅
2. **Update store** (remove timer state/actions) ✅
3. **Update component** (use bridge hook, remove controls) ✅
4. **Delete old hook** (`useTimer.ts`) ✅
5. **Test with fallback state** (no bridge yet) ✅
6. **Build bridge service** (separate task) 🔄
7. **Test with real bridge** (integration testing) 🔄

### Rollback Plan

If integration fails, we can:
1. Revert `LeftSidebarNew.tsx` to use `useTimer` again
2. Restore timer state in `useStore.ts`
3. Keep bridge hook for future use

---

## Summary

### Files to Delete
- ❌ `src/hooks/useTimer.ts`

### Files to Modify
- ⚠️ `src/store/useStore.ts` - Remove timer state/actions
- ⚠️ `src/components/LeftSidebarNew.tsx` - Use bridge hook, remove controls

### Files to Create
- ✅ `src/hooks/useFocusTimerBridge.ts` - WebSocket connection to bridge

### Files Unchanged
- ✅ `src/App.tsx`
- ✅ `src/components/TopHeader.tsx`
- ✅ `src/components/SpotifySettings.tsx`
- ✅ `src/hooks/useSpotify.ts`
- ✅ `src/utils/spotifyAuth.ts`

### Benefits After Migration
- ✅ No browser timer drift
- ✅ Overlay survives refresh
- ✅ Single source of truth (Focus Timer)
- ✅ Natural streamer workflow
- ✅ Reliable long sessions
- ✅ Desktop notifications from Focus Timer

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Implement Phase 1** - Create hook, update store, update component
3. **Test with fallbacks** - Verify overlay works without bridge
4. **Build bridge service** - Separate implementation
5. **Integration testing** - Connect overlay to bridge
6. **Production deployment** - Systemd service, monitoring

---

**Ready to proceed with implementation?**
