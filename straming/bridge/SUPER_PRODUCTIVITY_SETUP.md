# Super Productivity Bridge Setup

This guide explains how to switch your OBS overlay from Focus Timer to Super Productivity.

## Prerequisites

1. **Super Productivity** desktop app installed
2. **Node.js 18+** installed

## Step 1: Enable Local REST API in Super Productivity

1. Open Super Productivity app
2. Go to **Settings → Misc**
3. Enable **"Enable Local REST API"**
4. The API runs on `http://127.0.0.1:3876`

For development, you can also:
```bash
SP_FORCE_LOCAL_REST_API=1 npm start
```

## Step 2: Install Bridge Dependencies

```bash
cd overlay_yt-main/straming/bridge
npm install
```

This installs:
- `eventsource` - For connecting to Super Productivity's SSE endpoint
- `ws` - WebSocket server for overlay connections

## Step 3: Build and Run the Bridge

### Option A: Development Mode (with auto-reload)

```bash
npm run sp:dev
```

### Option B: Production Build

```bash
npm run sp:build
npm run sp:start
```

The bridge will:
1. Connect to Super Productivity's `/events` SSE endpoint
2. Listen for `current-task`, `focus-mode`, and `tick` events
3. Transform them to the format your overlay expects
4. Broadcast via WebSocket on `localhost:8080`

## Step 4: Verify Connection

When running, you should see:
```
[SP-Bridge] Initializing Super Productivity Bridge Service...
[SP-Bridge] WebSocket server listening on localhost:8080
[SP-Bridge] Super Productivity Bridge Service started
[SP-Bridge] Connect overlay to: ws://localhost:8080
[SP-Client] Connecting to http://127.0.0.1:3876/events...
[SP-Client] Connected to Super Productivity SSE ✓
```

## Architecture

```
Super Productivity App → HTTP SSE (/events) → SP-Bridge → WebSocket → OBS Overlay
                              ↑
                    current-task (instant)
                    focus-mode (~1s)
                    tick (every second)
```

## Available Events

The bridge transforms Super Productivity events to this format:

```typescript
{ 
  type: 'timerState', 
  data: { 
    timer: {
      state: 'stopped' | 'pomodoro' | 'short-break' | 'long-break',
      duration: number,      // ms
      elapsed: number,       // ms  
      remaining: number,     // ms
      progress: number,      // 0-100
      isRunning: boolean,
      isPaused: boolean,
      isFinished: boolean,
      startedTime: number,   // unix timestamp
      pausedTime: number,
      finishedTime: number,
      lastChangedTime: number
    },
    session: {
      currentState: string,
      startTime: number,
      endTime: number,
      hasUniformBreaks: boolean,
      canReset: boolean
    }
  } 
}
```

## Troubleshooting

### "Super Productivity not running"
- Make sure Super Productivity app is open
- Check Settings → Misc → "Enable Local REST API" is ON

### "Cannot connect to localhost:3876"
- The API port might be different - check the app settings
- Ensure no firewall blocking localhost connections

### Overlay shows "Disconnected"
- Check bridge is running: `ps aux | grep sp-bridge`
- Verify WebSocket port 8080 is listening: `lsof -i :8080`
- Make sure overlay connects to `ws://localhost:8080` (not 127.0.0.1)

## Custom Port

To use a different WebSocket port:

```bash
npm run sp:dev -- --port 9000
```

Or modify the port in the overlay code.

## Compared to Focus Timer

| Feature | Focus Timer (old) | Super Productivity (new) |
|---------|-------------------|--------------------------|
| Connection | D-Bus | HTTP SSE |
| Timer state | Via D-Bus properties | Via `/focus-mode` |
| Task state | Not available | Via `/task-control/current` |
| Today's stats | Not available | Via `/stats/today` |
| Live events | D-Bus signals | SSE `tick`, `current-task` |
| Reconnection | Manual | Automatic with backoff |

## API Reference

Super Productivity exposes these endpoints:

- `GET /health` - Server health check
- `GET /status` - Current task + focus mode state
- `GET /focus-mode` - Pomodoro/focus/break status
- `GET /stats/today` - Today's time tracked, completed count, progress
- `GET /task-control/current` - Current active task
- `GET /events` - Server-Sent Events stream (live updates)
- `GET /tasks` - List all tasks
- `GET /projects` - List projects

Full API docs: https://github.com/super-productivity/super-productivity/wiki/3.01-API