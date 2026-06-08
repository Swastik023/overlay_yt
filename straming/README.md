# Super Productivity YouTube Overlay

A live OBS browser overlay that displays your Super Productivity tasks, focus timer, and daily stats in real-time for YouTube live streaming.

## Features

- 🎯 **Current Task** — Live title, project, time spent, estimate, and progress bar
- ⏱️ **Focus/Pomodoro Timer** — Flowtime/Pomodoro/Countdown modes with elapsed/remaining time
- ✅ **Today's Task List** — All tasks tagged "TODAY" with checkboxes, actively-tracked task highlighted
- 📊 **Daily Stats** — Focused time, completed count, planned progress percentage
- 🎨 **Dynamic Theming** — Color changes based on your focus state (yellow=focus, green=break, orange=overtime, grey=idle/paused)
- 🔄 **Live Updates** — Server-Sent Events (SSE) push changes instantly, no polling delays
- 🎵 **Spotify Integration** — Optional now-playing display (works in browser, not OBS Browser Source)

## Quick Start

See **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** for detailed step-by-step instructions.

### TL;DR (3 terminals)

```bash
# Terminal 1: Super Productivity Frontend
cd /Users/swastik/Documents/yt/super-productivity-master
npm run startFrontend

# Terminal 2: Super Productivity Electron App
npm start
# Then enable Settings → Misc → Local REST API

# Terminal 3: Overlay Dev Server
cd overlay_yt-main/straming
npm run dev
```

Open http://localhost:5173 for the overlay or http://localhost:5173?diagnostics=true to troubleshoot.

## Diagnostics

If the overlay shows "SP Offline" or tasks aren't loading:

1. **Check the diagnostics page**: http://localhost:5173?diagnostics=true
   - Shows SSE connection status
   - Tests all API endpoints
   - Displays current data from Super Productivity
   - Lists today's tasks

2. **Common issues**:
   - ❌ **404 on /sp/events**: Super Productivity's Local REST API is disabled → Enable it in Settings → Misc
   - ❌ **CORS 403**: Don't connect directly to 127.0.0.1:3876, use the Vite proxy at localhost:5173
   - ❌ **ERR_CONNECTION_REFUSED**: Angular frontend not running → Run `npm run startFrontend` first

## OBS Setup

1. Add a **Browser Source** in OBS
2. URL: `http://localhost:5173?obs=true`
3. Width: **1920**, Height: **1080**
4. Check "Shutdown source when not visible" (saves CPU)
5. The `?obs=true` parameter hides Spotify settings

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + custom inline styles for OBS compatibility
- **Data Source**: Super Productivity Local REST API (http://127.0.0.1:3876)
- **Live Updates**: Server-Sent Events (SSE) at `/events` endpoint
- **Proxy**: Vite dev server proxies `/sp` → `127.0.0.1:3876` to strip Origin headers (bypasses SP's CORS protection)

### Data Flow

```
Super Productivity App (port 3876)
  ↓ REST API + SSE
Vite Dev Server (port 5173) — strips Origin header
  ↓ Same-origin requests
Browser / OBS
```

## Files Overview

- **src/hooks/useSuperProductivity.ts** — Main SSE client + polling logic (~470 lines)
- **src/components/LeftSidebarNew.tsx** — Task list, timer, stats display
- **src/components/TopHeader.tsx** — Header with 5-state ring (focus/break/paused/overtime/idle)
- **src/pages/Diagnostics.tsx** — Connection troubleshooting page
- **vite.config.ts** — Proxy configuration for Super Productivity API
- **SETUP-GUIDE.md** — Detailed setup instructions

## Development Notes

- The overlay auto-reconnects if Super Productivity closes (exponential backoff)
- SSE events (`current-task`, `focus-mode`, `tick`) push updates instantly
- Stats poll every 20s, projects every 60s, tasks every 15s (refresh on task changes too)
- Theme colors defined in `THEME_COLORS` constant (easy to customize)
- All components use inline styles for maximum OBS compatibility
- No external CSS dependencies (besides Tailwind reset)

## Known Limitations

- **Spotify in OBS**: Browser Sources have isolated storage, so Spotify auth won't persist in OBS. Capture the main browser window instead, or use the legacy bridge server.
- **Today Tag Required**: Only tasks tagged "TODAY" are shown. Use Super Productivity's "Schedule for Today" feature or manually add the tag.
- **Completed Count**: `/stats/today` aggregates *all* completions (including old tasks moved to today), not just TODAY-tagged tasks. This matches Super Productivity's native behavior.

## Troubleshooting

### Tasks not showing
- Tag tasks with "TODAY" in Super Productivity (use "Schedule for Today" or manual tag)
- Check diagnostics page to verify `/sp/tasks?tagId=TODAY` returns data
- Start tracking a task to see it highlighted in the overlay

### Connection keeps dropping
- Check Super Productivity didn't crash or freeze
- Verify Local REST API is still enabled (Settings → Misc)
- Check browser console for network errors
- Try restarting the Vite dev server

### Overlay looks different in OBS
- OBS Browser Sources use Chromium Embedded Framework (CEF)
- Test in Chrome/Edge first to rule out code issues
- Check OBS Browser Source logs: Help → Log Files → View Current Log

## Credits

Built for YouTube live streaming with [Super Productivity](https://github.com/johannesjo/super-productivity) as the productivity backend.

Original overlay structure adapted from various OBS overlay templates.
