# Overlay Setup Guide

## Quick Start (3 Terminals)

### Terminal 1: Super Productivity Frontend
```bash
cd /Users/swastik/Documents/yt/super-productivity-master
npm run startFrontend
```
Wait for "✔ Compiled successfully" (Angular dev server on http://localhost:4200)

### Terminal 2: Super Productivity Electron App
```bash
cd /Users/swastik/Documents/yt/super-productivity-master
npm start
```
Wait for the app window to open, then:
1. Go to **Settings** (⚙️)
2. Navigate to **Misc** section
3. Enable **"Local REST API"** toggle
4. The API will start on `http://127.0.0.1:3876`

### Terminal 3: Overlay Dev Server
```bash
cd /Users/swastik/Documents/yt/super-productivity-master/overlay_yt-main/straming

# Option 1: Use the helper script (checks prerequisites automatically)
./start-overlay.sh

# Option 2: Start directly
npm run dev
```
Opens on http://localhost:5173

**Tip**: The `start-overlay.sh` script checks if Angular and the REST API are running before starting, and gives you helpful error messages if something is missing!

## Verify Setup

Open http://localhost:5173 in your browser and check:
- Top-right corner should show a green "Connected" status
- Left sidebar should display your current task and today's stats
- If you see "SP Offline" or "Reconnecting", check:
  1. Is Super Productivity running?
  2. Is Local REST API enabled in Settings → Misc?
  3. Check browser console for errors

### Diagnostics Page

Visit http://localhost:5173?diagnostics=true to see detailed connection status including:
- SSE connection status
- API endpoint health checks
- Current data (tasks, stats, focus mode)
- Task list with time tracking
- Setup instructions

This is the easiest way to troubleshoot connection issues!

## OBS Browser Source

1. Add a **Browser Source** in OBS
2. URL: `http://localhost:5173?obs=true`
3. Width: 1920, Height: 1080
4. Custom CSS (optional): none needed
5. Check "Shutdown source when not visible" for performance

The `?obs=true` parameter hides the Spotify settings button.

## Troubleshooting

### "404 on /sp/events"
- Super Productivity's Local REST API is not enabled
- Go to Settings → Misc → Enable "Local REST API"

### "CORS error" or "403 Forbidden"
- Don't connect directly to 127.0.0.1:3876
- Use the Vite dev server proxy: http://localhost:5173
- The proxy strips Origin headers to bypass SP's CORS protection

### "ERR_CONNECTION_REFUSED" in Electron
- The Angular frontend must be running first on port 4200
- Run `npm run startFrontend` before `npm start`

### Tasks not showing
- Make sure you have tasks tagged with "TODAY" in Super Productivity
- The overlay only shows tasks with the TODAY tag
- Start tracking a task to see it highlighted

### Spotify not working in OBS
- OBS Browser Sources have isolated storage
- Spotify auth won't persist in OBS
- Either:
  - Capture the full browser window in OBS (works with auth)
  - Use the legacy bridge server (not recommended)

## Development Notes

- Overlay auto-reconnects if Super Productivity closes
- SSE events push updates instantly (no polling delay)
- Stats refresh every 20s, projects every 60s, tasks every 15s
- The overlay theme changes based on your focus state:
  - Yellow: Focus mode
  - Green: Break
  - Orange: Overtime
  - Grey: Paused/Idle
