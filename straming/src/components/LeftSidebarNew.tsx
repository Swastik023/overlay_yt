import { useStore } from '../store/useStore'
import { Music2, WifiOff } from 'lucide-react'
import { useFocusTimerBridge } from '../hooks/useFocusTimerBridge'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function LeftSidebarNew() {
  // Connect to Focus Timer bridge
  const { timer, session, connectionStatus } = useFocusTimerBridge()

  // Tasks and Spotify from local store
  const tasks = useStore((s) => s.tasks)
  const toggleTask = useStore((s) => s.toggleTask)
  const addTask = useStore((s) => s.addTask)
  const nowPlaying = useStore((s) => s.nowPlaying)

  // Timer state from bridge (or defaults if offline)
  const timeLeft = Math.floor(timer?.remaining ?? 1500) // Round to integer seconds
  const timerMode = timer?.state === 'pomodoro' ? 'focus' : 'break'
  const pomodorosCompleted = session?.pomodorosCompleted ?? 0
  const currentCycle = session?.currentCycle ?? 1

  // Calculate progress
  const totalDuration = timer?.duration ?? 1500
  const progress = timer ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const completedTasks = tasks.filter(t => t.completed).length
  
  // Detect long break (15 minutes)
  const isLongBreak = timerMode === 'break' && totalDuration === 900

  // Show offline state
  const isOffline = connectionStatus !== 'connected' || !timer

  return (
    <div
      style={{
        position: 'absolute',
        top: '141px',
        left: 0,
        width: '251px',
        bottom: 0,
        background: 'rgba(15, 15, 20, 0.6)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Session Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#FFC107',
              textTransform: 'uppercase',
            }}
          >
            POMODORO
          </div>
          {/* Connection status indicator */}
          {isOffline && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <WifiOff size={10} />
              <span>{connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}</span>
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 400,
            color: isOffline ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)',
            lineHeight: '1.4',
          }}
        >
          Cycle {currentCycle}/4 • {pomodorosCompleted} completed
        </div>
        {isLongBreak && !isOffline && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#22d3ee',
              marginTop: '4px',
            }}
          >
            🎉 Long Break (15 min)
          </div>
        )}
      </div>

      {/* Timer Display (Read-only) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg
            width="160"
            height="160"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#FFC107"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: 'drop-shadow(0 0 6px rgba(255, 193, 7, 0.4))',
              }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.4)',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {timerMode}
            </div>
          </div>
        </div>

        {/* Cycle Dots */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4].map((i) => {
            // Dots represent completed pomodoros in the current set of 4
            // If we've completed 4, 8, 12, etc., all 4 dots are filled
            // Then when we start the next pomodoro, dots reset
            const completedInCurrentSet = pomodorosCompleted % 4 === 0 && pomodorosCompleted > 0
              ? 4  // Just completed a full set
              : pomodorosCompleted % 4; // Partial set
            
            const isFilled = i <= completedInCurrentSet;
            const isCurrentCycle = i === currentCycle;
            
            return (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isFilled ? '#FFC107' : 'rgba(255, 255, 255, 0.1)',
                  border: isCurrentCycle ? '2px solid #FFC107' : 'none',
                  boxShadow: isFilled ? '0 0 4px rgba(255, 193, 7, 0.5)' : 'none',
                  opacity: isOffline ? 0.3 : 1,
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#FFC107',
              textTransform: 'uppercase',
            }}
          >
            TODAY'S PLAN
          </div>
          <button
            onClick={() => addTask('New Task')}
            style={{
              width: '16px',
              height: '16px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '3px',
              color: '#FFC107',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => toggleTask(task.id)}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  minWidth: '14px',
                  borderRadius: '3px',
                  border: task.completed
                    ? '1.5px solid #FFC107'
                    : '1.5px solid rgba(255, 255, 255, 0.2)',
                  background: task.completed ? '#FFC107' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                }}
              >
                {task.completed && (
                  <span style={{ fontSize: '10px', color: '#0a0a0f' }}>✓</span>
                )}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: task.completed
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  lineHeight: '1.4',
                  flex: 1,
                }}
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Progress
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#FFC107',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {completedTasks}/{tasks.length}
          </div>
        </div>
      </div>

      {/* Now Playing - Spotify Integration - Enhanced Design */}
      <div
        style={{
          padding: '0',
          background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(30, 215, 96, 0.05) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(29, 185, 84, 0.2)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Animated background glow */}
        {nowPlaying.isPlaying && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.15) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Header */}
        <div
          style={{
            padding: '12px 14px 8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Music2 size={12} color="#1DB954" />
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#1DB954',
                textTransform: 'uppercase',
              }}
            >
              Now Playing
            </span>
          </div>
          {nowPlaying.isPlaying && (
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#1DB954',
                boxShadow: '0 0 8px rgba(29, 185, 84, 0.8)',
                animation: 'blink 1.5s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '0 14px 14px 14px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Album Art with Glow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {nowPlaying.albumArt ? (
                <>
                  {/* Glow effect behind album art */}
                  {nowPlaying.isPlaying && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        right: '-4px',
                        bottom: '-4px',
                        background: `url(${nowPlaying.albumArt})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(12px)',
                        opacity: 0.4,
                        borderRadius: '10px',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <img
                    src={nowPlaying.albumArt}
                    alt="Album Art"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '2px solid rgba(29, 185, 84, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.2) 0%, rgba(30, 215, 96, 0.1) 100%)',
                    border: '2px solid rgba(29, 185, 84, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  🎵
                </div>
              )}
            </div>

            {/* Track Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Track Name */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '4px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {nowPlaying.name}
              </div>
              
              {/* Artist Name */}
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '6px',
                }}
              >
                {nowPlaying.artist}
              </div>

              {/* Spotify Logo Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  background: 'rgba(29, 185, 84, 0.15)',
                  border: '1px solid rgba(29, 185, 84, 0.3)',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#1DB954',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </div>
            </div>
          </div>

          {/* Equalizer - Only show when playing */}
          {nowPlaying.isPlaying && (
            <div
              style={{
                display: 'flex',
                gap: '3px',
                alignItems: 'flex-end',
                height: '28px',
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(29, 185, 84, 0.1)',
              }}
            >
              {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.7, 0.3, 0.85, 0.55].map((height, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to top, #1DB954 0%, #1ed760 100%)',
                    borderRadius: '2px',
                    height: `${height * 100}%`,
                    minHeight: '4px',
                    animation: `eq-bounce ${0.5 + i * 0.08}s ease-in-out infinite`,
                    animationDelay: `${i * 0.04}s`,
                    boxShadow: '0 0 4px rgba(29, 185, 84, 0.5)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </div>
  )
}
