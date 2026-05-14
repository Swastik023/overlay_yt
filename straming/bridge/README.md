# Focus Timer Bridge Service

A lightweight Node.js service that bridges Focus Timer's D-Bus interface with the OBS overlay via WebSocket.

## Architecture

```
Focus Timer (D-Bus) → Bridge Service → WebSocket → React Overlay (OBS)
```

The bridge service:
- Subscribes to Focus Timer D-Bus signals on the session bus
- Converts microsecond timestamps to seconds
- Broadcasts timer state changes to all connected overlays
- Handles reconnection and error recovery

## Prerequisites

- Node.js 18+ (for native ES modules support)
- Focus Timer installed and running
- D-Bus session bus available (standard on Linux desktops)

## Installation

```bash
cd straming/bridge
npm install
```

## Development

### Build TypeScript

```bash
npm run build
```

### Run in Development Mode (with auto-reload)

```bash
npm run dev
```

### Run in Production Mode

```bash
npm run build
npm start
```

### Debug Mode (verbose logging)

```bash
npm run build
npm run debug
```

## Configuration

The bridge service uses the following defaults:
- **WebSocket Port**: 8080 (localhost only)
- **D-Bus Bus**: Session bus
- **D-Bus Service**: `io.github.focustimerhq.FocusTimer`
- **D-Bus Object Path**: `/io/github/focustimerhq/FocusTimer`

## Project Structure

```
straming/bridge/
├── src/                    # TypeScript source files
│   ├── index.ts           # Main entry point
│   ├── dbus-client.ts     # D-Bus connection and signal handling
│   ├── websocket-server.ts # WebSocket server for overlay connections
│   ├── state-manager.ts   # Timer state management and caching
│   ├── types.ts           # TypeScript interfaces and types
│   └── http-server.ts     # Health check endpoint
├── dist/                   # Compiled JavaScript (generated)
├── tsconfig.json          # TypeScript configuration
├── package.json           # Node.js dependencies and scripts
└── README.md              # This file
```

## Usage

1. **Start Focus Timer**:
   ```bash
   focus-timer
   ```

2. **Start Bridge Service**:
   ```bash
   npm run dev
   ```

3. **Connect Overlay**: The React overlay will automatically connect to `ws://localhost:8080`

## Troubleshooting

### Bridge can't connect to Focus Timer

**Symptom**: Bridge logs "Focus Timer not detected" or "D-Bus connection failed"

**Solutions**:
- Verify Focus Timer is running: `ps aux | grep focus-timer`
- Check D-Bus service is available: `dbus-send --session --print-reply --dest=io.github.focustimerhq.FocusTimer /io/github/focustimerhq/FocusTimer org.freedesktop.DBus.Introspectable.Introspect`
- Ensure you're running on the same user session

### Overlay can't connect to bridge

**Symptom**: Overlay shows "Disconnected" or "Reconnecting..."

**Solutions**:
- Verify bridge is running: `ps aux | grep node`
- Check WebSocket port is listening: `netstat -tlnp | grep 8080`
- Ensure overlay is connecting to `ws://localhost:8080` (not `ws://127.0.0.1:8080`)

### Timer state is not updating

**Symptom**: Overlay shows stale timer state

**Solutions**:
- Enable debug mode: `npm run debug`
- Check bridge logs for D-Bus signal reception
- Verify Focus Timer is actually running (not paused)
- Refresh overlay in OBS browser source

## API Reference

### WebSocket Events (Server → Client)

#### `timerStateChanged`
Emitted when timer state changes (start, pause, resume, finish, state transition)

```typescript
{
  type: 'timerStateChanged',
  data: {
    state: 'pomodoro' | 'short-break' | 'long-break' | 'stopped',
    duration: number,      // seconds
    elapsed: number,       // seconds
    remaining: number,     // seconds
    progress: number,      // 0.0 to 1.0
    isRunning: boolean,
    isPaused: boolean,
    isFinished: boolean,
    startedTime: number,   // unix timestamp (seconds)
    lastChangedTime: number
  }
}
```

#### `timerTick`
Emitted every second while timer is running

```typescript
{
  type: 'timerTick',
  data: {
    timestamp: number,     // unix timestamp (seconds)
    remaining: number      // seconds
  }
}
```

#### `sessionChanged`
Emitted when session state changes (pomodoro completed, cycle advanced)

```typescript
{
  type: 'sessionChanged',
  data: {
    currentState: string,
    pomodorosCompleted: number,
    currentCycle: number,
    startTime: number,     // unix timestamp (seconds)
    endTime: number
  }
}
```

#### `offline`
Emitted when Focus Timer is not running or D-Bus connection is lost

```typescript
{
  type: 'offline',
  data: {
    reason: 'focus-timer-not-running' | 'dbus-connection-lost'
  }
}
```

### HTTP Endpoints

#### `GET /health`
Returns bridge service health status

**Response**:
```json
{
  "status": "ok",
  "dbusConnected": true,
  "focusTimerRunning": true,
  "connectedClients": 2,
  "uptime": 3600
}
```

## Performance

- **Memory Usage**: <50MB resident
- **CPU Usage**: <1% average, <5% during state changes
- **Network**: <1KB/s per connected overlay
- **Latency**: <100ms from D-Bus signal to WebSocket broadcast

## License

MIT
