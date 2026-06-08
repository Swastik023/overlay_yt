# Adding Break Features to Your OBS Overlay

## What's Available Now

Super Productivity's Local REST API now exposes break state through the `/focus-mode` endpoint. Your overlay can use this to show break information to your stream viewers.

## API Response

**GET** `http://127.0.0.1:3876/focus-mode`

```json
{
  "ok": true,
  "data": {
    "isRunning": true,           // Timer is active
    "isSessionRunning": true,    // Work session active
    "isBreakActive": true,       // BREAK TIME!
    "isSessionPaused": false,    // Session paused
    "isLongBreak": false,        // Short vs long break
    "isInOvertime": false,       // Overtime mode
    "mode": "Pomodoro",          // Pomodoro / Flowtime / Countdown
    "elapsed": 30000,            // 30 seconds into break
    "remaining": 270000,         // 4:30 remaining
    "duration": 300000,          // 5 minute break
    "progress": 10,              // 10% complete
    "currentCycle": 1            // First pomodoro cycle
  }
}
```

## Overlay Ideas

### 1. Break Banner

Show a full-screen or sidebar banner when `isBreakActive === true`:

```typescript
// In your overlay React component

const { focusMode } = useSuperProductivity();

if (focusMode?.isBreakActive) {
  return (
    <div className="break-banner">
      <h1>🧘 BREAK TIME</h1>
      <p>
        {focusMode.isLongBreak ? 'Long Break' : 'Mini Break'}
      </p>
      <div className="break-timer">
        {msToMinutes(focusMode.remaining)}
      </div>
    </div>
  );
}
```

### 2. Break Progress Bar

Show a countdown timer during breaks:

```tsx
{focusMode?.isBreakActive && (
  <div className="break-progress">
    <span>Break: {msToMinutes(focusMode.remaining)}</span>
    <div className="progress-bar">
      <div 
        className="progress-fill"
        style={{ width: `${focusMode.progress}%` }}
      />
    </div>
  </div>
)}
```

### 3. Exercise Tips Sidebar

Show random exercise tips from Super Productivity:

```typescript
// Fetch the break ideas
import { BREAK_IDEAS } from './break-ideas';

const getRandomTip = () => {
  const enabled = BREAK_IDEAS.filter(idea => idea.enabled);
  return enabled[Math.floor(Math.random() * enabled.length)];
};

// In component
const [currentTip, setCurrentTip] = useState(getRandomTip());

useEffect(() => {
  if (focusMode?.isBreakActive) {
    setCurrentTip(getRandomTip());
  }
}, [focusMode?.isBreakActive]);

// Render
{focusMode?.isBreakActive && currentTip && (
  <div className="break-tip-card">
    <h3>💡 {currentTip.title}</h3>
    <p>{currentTip.text}</p>
  </div>
)}
```

### 4. Pomodoro Cycle Indicator

Show which cycle you're on:

```tsx
{focusMode?.mode === 'Pomodoro' && (
  <div className="pomodoro-cycles">
    <span>🍅 Cycle {focusMode.currentCycle}</span>
    {focusMode.isBreakActive && (
      <span className="break-badge">
        {focusMode.isLongBreak ? 'Long Break' : 'Short Break'}
      </span>
    )}
  </div>
)}
```

### 5. Stream-Friendly Sound

Play a notification sound for your stream viewers (different from the user's local sound):

```typescript
useEffect(() => {
  if (focusMode?.isBreakActive && previousState?.isBreakActive === false) {
    // Break just started
    const audio = new Audio('/sounds/stream-break-start.mp3');
    audio.volume = 0.3;
    audio.play();
  }
  
  if (!focusMode?.isBreakActive && previousState?.isBreakActive === true) {
    // Break just ended
    const audio = new Audio('/sounds/stream-break-end.mp3');
    audio.volume = 0.3;
    audio.play();
  }
}, [focusMode?.isBreakActive]);
```

## Break Ideas Reference

Copy these from Super Productivity into your overlay:

**Location**: `src/app/features/focus-mode/break-ideas.const.ts`

**36 Tips Including**:
- Stretching exercises (wrist, back, neck)
- Eye care (blinking, focus changes)
- Movement (stairs, walking, desk exercises)
- Mental health (meditation, breathing, grounding)
- Wellness (ergonomics, hydration, decluttering)

You can import the file or copy the array into your overlay project.

## Styling Examples

### Break Banner (Full Screen)

```css
.break-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Inter', sans-serif;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.break-banner h1 {
  font-size: 4rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.break-timer {
  font-size: 6rem;
  font-weight: 300;
  margin-top: 2rem;
  font-variant-numeric: tabular-nums;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Break Tip Card (Sidebar)

```css
.break-tip-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

.break-tip-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.break-tip-card p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Break Progress Bar

```css
.break-progress {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 1s linear;
}
```

## Integration Steps

### 1. Update Your useSuperProductivity Hook

Add focus mode state:

```typescript
// src/hooks/useSuperProductivity.ts

export const useSuperProductivity = () => {
  const [focusMode, setFocusMode] = useState<SpFocusMode | null>(null);
  
  useEffect(() => {
    const source = new EventSource('http://localhost:5173/sp/events');
    
    source.addEventListener('focus-mode', (e: MessageEvent) => {
      const data = JSON.parse(e.data) as SpFocusMode;
      setFocusMode(data);
    });
    
    return () => source.close();
  }, []);
  
  return { focusMode, /* ... other state */ };
};
```

### 2. Add Break Components

Create components:
- `BreakBanner.tsx` - Full-screen break notification
- `BreakTipCard.tsx` - Exercise tip display
- `BreakProgress.tsx` - Timer countdown

### 3. Update Main Layout

```tsx
// App.tsx

const { focusMode } = useSuperProductivity();

return (
  <>
    {focusMode?.isBreakActive && <BreakBanner focusMode={focusMode} />}
    
    <div className="overlay-layout">
      <LeftSidebarNew />
      <MainContent />
      {focusMode?.isBreakActive && <BreakTipCard />}
    </div>
  </>
);
```

## Testing

1. Start Super Productivity
2. Start your overlay dev server
3. Start a Pomodoro session
4. Wait for break (or manually trigger)
5. Check overlay shows:
   - Break banner appears
   - Timer counts down
   - Exercise tip displays
   - Progress bar animates

## OBS Setup

1. Add Browser Source: `http://localhost:5173?obs=true`
2. Set size: 1920x1080 (or your stream resolution)
3. Check "Shutdown source when not visible" for performance
4. During breaks, your viewers will see the break content!

## Notes

- **Local vs Stream**: Super Productivity plays sounds locally (for you). Your overlay plays sounds for stream viewers. They're separate!
- **Exercise Tips**: You can sync the tips or use different ones for stream
- **Styling**: Match your stream's brand colors/fonts
- **Performance**: Use CSS transforms/opacity for animations (GPU-accelerated)

## Examples from Real Streams

### Minimal Style (Clean)

```
┌────────────────────────────┐
│  🧘 Break Time             │
│  4:32 remaining            │
│  ████████░░░░░░░░ 45%      │
│                            │
│  💡 Tip: Blink rapidly     │
│  for a few seconds         │
└────────────────────────────┘
```

### Immersive Style (Full Screen)

```
╔══════════════════════════════════╗
║                                  ║
║         🧘‍♂️ BREAK TIME           ║
║                                  ║
║            4:32                  ║
║                                  ║
║  💡 Wrist and forearm stretch    ║
║  Extend your arms with palms...  ║
║                                  ║
╚══════════════════════════════════╝
```

### Sidebar Style (Non-Intrusive)

```
Main Stream Content
├─ Game/Code/etc
│
└─ [Sidebar]
   ├─ Current Task: "Fix bug #123"
   ├─ Time: 15:32
   ├─ Break: 3:45 🧘
   └─ Tip: "Take stairs instead of elevator"
```

Choose the style that matches your stream vibe!

## Next Steps

1. Decide which break features to show on stream
2. Design the UI to match your stream aesthetic
3. Test with actual breaks during a session
4. Get feedback from chat on the design
5. Refine and polish!

---

Your stream viewers will appreciate seeing you take healthy breaks! 💪

