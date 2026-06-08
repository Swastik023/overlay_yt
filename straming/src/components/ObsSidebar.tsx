/**
 * OBS Sidebar - 259px width, state-based display
 * 
 * Optimized for OBS browser source with webcam overlay.
 * - Top area: Productivity content (readable fonts)
 * - Bottom 198px: Reserved for webcam (empty/transparent)
 */

import { useState, useEffect, useRef } from 'react'
import { WifiOff } from 'lucide-react'
import {
  useSuperProductivity,
  resolveProjectName,
  formatMs,
  formatMsHuman,
} from '../hooks/useSuperProductivity'
import { useOverlayState } from '../hooks/useOverlayState'

// ─── Compact Break Tips (very short) ─────────────────────────────────────────

const BREAK_TIPS_COMPACT = [
  { emoji: '👀', text: 'Blink and look away' },
  { emoji: '🧘', text: 'Take 3 deep breaths' },
  { emoji: '🚶', text: 'Stand and stretch' },
  { emoji: '💧', text: 'Drink water' },
  { emoji: '🤲', text: 'Rotate your wrists' },
  { emoji: '🌿', text: 'Look at distance' },
  { emoji: '🦴', text: 'Roll shoulders back' },
  { emoji: '☕', text: 'Quick coffee break' },
]

// ─── Idle Engagement: rotating messages to keep stream viewers interested ─────

const IDLE_MESSAGES = [
  { emoji: '👋', text: 'Be right back — grab a coffee!' },
  { emoji: '💬', text: 'Drop a hello in the chat' },
  { emoji: '🎯', text: 'What should we build next?' },
  { emoji: '🚀', text: 'Stretching before the next sprint' },
  { emoji: '🔥', text: 'Stay tuned — more focus incoming' },
  { emoji: '🧠', text: 'Thinking through the next move' },
  { emoji: '❤️', text: 'Thanks for hanging out!' },
  { emoji: '⚡', text: 'Recharging for the next session' },
]

// Fun fact / motivational lines shown under idle stats
const IDLE_FACTS = [
  '💡 Consistency beats intensity',
  '🍅 Small sprints, big results',
  '🌱 Progress compounds daily',
  '🎬 Building in public, live',
  '📈 Every session counts',
  '⏳ Deep work changes everything',
]


// ─── Helper Components ────────────────────────────────────────────────────────

function SectionLabel({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: accent,
        textTransform: 'uppercase' as const,
        marginBottom: '8px',
        transition: 'color 0.6s ease',
      }}
    >
      {children}
    </div>
  )
}

function StatRow({
  label,
  value,
  accent,
  mono,
}: {
  label: string
  value: string
  accent: string
  mono?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: accent,
          fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
          transition: 'color 0.6s ease',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ProgressBar({ progress, accentRgb }: { progress: number; accentRgb: string }) {
  return (
    <div
      style={{
        height: '5px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginTop: '6px',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: `rgba(${accentRgb}, 0.9)`,
          borderRadius: '3px',
          transition: 'width 1s linear',
          boxShadow: `0 0 8px rgba(${accentRgb}, 0.4)`,
        }}
      />
    </div>
  )
}

/** Shows progress through the 4 Pomodoros in the current round,
 *  plus a dot-based tally of fully completed rounds. */
function RoundProgressBar({
  pomodoroInRound,
  currentRound,
  accentRgb,
  accentColor,
}: {
  pomodoroInRound: number
  currentRound: number
  accentRgb: string
  accentColor: string
}) {
  const completedRounds = currentRound - 1 // rounds fully finished

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
          Round {currentRound}
        </span>
        <span style={{ fontSize: '11px', color: `rgba(${accentRgb}, 0.8)`, fontWeight: 700 }}>
          {pomodoroInRound}/4
        </span>
      </div>

      {/* 4-segment bar — current round progress */}
      <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            style={{
              flex: 1,
              borderRadius: '3px',
              background:
                segment <= pomodoroInRound
                  ? `rgba(${accentRgb}, 0.9)`
                  : 'rgba(255,255,255,0.1)',
              boxShadow:
                segment <= pomodoroInRound
                  ? `0 0 8px rgba(${accentRgb}, 0.4)`
                  : 'none',
              transition: 'all 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Completed rounds tally — only show if at least 1 round done */}
      {completedRounds > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '7px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            Done
          </span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' as const }}>
            {Array.from({ length: completedRounds }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: accentColor,
                  opacity: 0.7,
                  boxShadow: `0 0 4px rgba(${accentRgb}, 0.5)`,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '10px', color: `rgba(${accentRgb}, 0.75)`, fontWeight: 700 }}>
            {completedRounds} round{completedRounds > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ObsSidebar() {
  const [time, setTime] = useState(new Date())
  const { connectionStatus, currentTask, focusMode, tick, todayStats, projects, todayTasks } =
    useSuperProductivity()

  const overlayState = useOverlayState(focusMode, currentTask, connectionStatus)
  const { state, group, statusLabel, statusEmoji, accentColor, accentRgb } = overlayState

  const isOffline = connectionStatus !== 'connected'
  const isReconnecting = connectionStatus === 'reconnecting'

  // Track total break time for the day
  const lastBreakEndRef = useRef<number | null>(null)
  const breakStartTimeRef = useRef<number | null>(null)

  // Track break time accumulation (refs kept for future use)
  useEffect(() => {
    const isBreak = state === 'BREAK'
    if (isBreak && breakStartTimeRef.current === null) {
      breakStartTimeRef.current = Date.now()
    } else if (!isBreak && breakStartTimeRef.current !== null) {
      breakStartTimeRef.current = null
      lastBreakEndRef.current = Date.now()
    }
  }, [state])

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Rotating idle message index (changes every 4s) - keeps idle screen lively
  const [idleRotation, setIdleRotation] = useState(0)
  useEffect(() => {
    if (state !== 'IDLE') return
    const interval = setInterval(() => {
      setIdleRotation((prev) => prev + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [state])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // Project name - map "Inbox" to "General" for viewers
  const rawProjectName = resolveProjectName(currentTask?.projectId, projects)
  const projectName = rawProjectName === 'Inbox' || rawProjectName === 'INBOX' || !rawProjectName 
    ? 'General' 
    : rawProjectName

  // Break tip - use the tip from the API (same as what the app shows)
  // Fall back to a local compact tip only when the API provides nothing
  const isBreak = state === 'BREAK'
  const lastBreakRef = useRef(false)
  const breakTipRef = useRef(
    BREAK_TIPS_COMPACT[Math.floor(Math.random() * BREAK_TIPS_COMPACT.length)]
  )
  if (isBreak && !lastBreakRef.current) {
    breakTipRef.current =
      BREAK_TIPS_COMPACT[Math.floor(Math.random() * BREAK_TIPS_COMPACT.length)]
  }
  lastBreakRef.current = isBreak

  // The app sends the exact tip text it selected — prefer that over local random
  const apiBreakTip = focusMode?.breakTip ?? null

  // Task data
  const taskTimeToday = tick?.timeSpentToday ?? currentTask?.timeSpentToday ?? 0
  const taskTitle = tick?.title ?? currentTask?.title ?? null

  // Focus timer data
  const focusModeLabel = focusMode?.mode ?? null
  const remainingMs = focusMode?.remaining ?? 0
  const elapsedMs = focusMode?.elapsed ?? 0
  const durationMs = focusMode?.duration ?? 0
  const sessionProgress = durationMs > 0 ? (elapsedMs / durationMs) * 100 : 0
  const isFlowtime = focusMode?.mode === 'Flowtime'
  const isPomodoro = focusMode?.mode === 'Pomodoro'
  const displayMs = isFlowtime ? elapsedMs : remainingMs

  // Pomodoro round logic
  // One Pomodoro = one focus session
  // One cycle = focus session + its break
  // A round = 4 Pomodoros (cycles 1-4)
  // Cycle 1,2,3 → short break | Cycle 4 → long break
  const rawCycle = focusMode?.currentCycle ?? 0
  const pomodoroInRound = rawCycle > 0 ? ((rawCycle - 1) % 4) + 1 : 0 // 1-4
  const currentRound = rawCycle > 0 ? Math.floor((rawCycle - 1) / 4) + 1 : 0 // 1, 2, 3...
  const isLongBreakCycle = pomodoroInRound === 4
  const isRoundComplete = isLongBreakCycle && (state === 'BREAK' || group === 'READY')

  // Today stats
  const timeSpentToday = todayStats?.timeSpentToday ?? 0
  const completedToday = todayStats?.completedToday ?? 0
  const plannedTotal = todayStats?.planned.total ?? 0
  const plannedDone = todayStats?.planned.done ?? 0
  const planProgress = todayStats?.planned.progress ?? 0

  // Today's tasks (open first, then done) - LIMIT TO 3 for webcam space
  const activeId = tick?.currentTaskId ?? currentTask?.id ?? null
  const openTasks = todayTasks.filter((t) => !t.isDone)
  const doneTasks = todayTasks.filter((t) => t.isDone)
  const orderedTasks = [...openTasks, ...doneTasks].slice(0, 3) // Max 3 tasks for space

  // Rotating idle content (advances every 4s via idleRotation)
  const idleMessage = IDLE_MESSAGES[idleRotation % IDLE_MESSAGES.length]
  const idleFact = IDLE_FACTS[idleRotation % IDLE_FACTS.length]

  // State-specific messages and labels
  const getStateMessage = () => {
    switch (state) {
      case 'FOCUS':
        if (isPomodoro && pomodoroInRound > 0) {
          // Always show both Pomodoro position AND round number
          return `Pomodoro ${pomodoroInRound}/4 • Round ${currentRound}`
        }
        return focusModeLabel || 'Pomodoro'
      case 'BREAK':
        if (isPomodoro && isRoundComplete) {
          return 'Round complete'
        }
        return focusMode?.isLongBreak ? 'Long Break' : 'Short Break'
      case 'READY_TO_BREAK':
        if (isPomodoro && isRoundComplete) {
          return 'Round complete'
        }
        return 'Focus complete'
      case 'READY_TO_FOCUS':
        if (isPomodoro && isRoundComplete) {
          return 'Ready • Start next round'
        }
        return 'Break complete'
      case 'TASK_SELECTED':
        return 'Task selected'
      case 'PAUSED':
        return `Paused at ${formatMs(remainingMs)} remaining`
      case 'OVERTIME':
        return 'Session exceeded'
      case 'DISCONNECTED':
        return 'OFFLINE'
      case 'IDLE':
        return 'No active task'
    }
  }

  const getSubMessage = () => {
    switch (state) {
      case 'READY_TO_BREAK':
        return isPomodoro && isRoundComplete
          ? 'Start your long break'
          : 'Start your break'
      case 'READY_TO_FOCUS':
        if (isPomodoro && isRoundComplete) {
          return null // Already in main message
        }
        return 'Start next focus session'
      case 'TASK_SELECTED':
        return 'Start focus session'
      case 'DISCONNECTED':
        return 'Super Productivity not connected'
      case 'IDLE':
        return 'Start a task'
      default:
        return null
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '259px',
        height: '100vh',
        background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%)',
        borderRight: `2px solid rgba(${accentRgb}, 0.2)`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.6s ease',
        zIndex: 1000,
      }}
    >
      {/* ── Scrollable Content Area (above webcam) ──────────────── */}
      <div
        style={{
          flex: 1,
          maxHeight: 'calc(100vh - 198px)', // Reserve 198px for webcam
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* ── Brand Heading (Stronger) ────────────────────────────── */}
        <div
          style={{
            paddingBottom: '10px',
            borderBottom: `2px solid rgba(${accentRgb}, 0.25)`,
            marginBottom: '2px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.06em',
              marginBottom: '5px',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ color: '#ffffff' }}>LEARN AI</span>
            {' '}
            <span style={{ color: accentColor, transition: 'color 0.6s ease' }}>WITH ME</span>
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: `rgba(${accentRgb}, 0.85)`,
              letterSpacing: '0.2em',
              textAlign: 'center',
              textTransform: 'uppercase' as const,
            }}
          >
            Focus • Build • Ship
          </div>
        </div>

        {/* ── Clock + Status Row ──────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: `1px solid rgba(${accentRgb}, 0.15)`,
          }}
        >
          {/* Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: accentColor,
                boxShadow: `0 0 12px rgba(${accentRgb}, 0.8)`,
                transition: 'all 0.6s ease',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.98)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.02em',
              }}
            >
              {timeStr}
            </span>
          </div>

          {/* Status pill - BIGGER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 13px',
              background: `rgba(${accentRgb}, 0.18)`,
              border: `2px solid rgba(${accentRgb}, 0.4)`,
              borderRadius: '16px',
              transition: 'all 0.6s ease',
              boxShadow: `0 0 15px rgba(${accentRgb}, 0.25)`,
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{statusEmoji}</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: accentColor,
                letterSpacing: '0.08em',
                transition: 'color 0.6s ease',
              }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* ── Connection Status (warning only, not main mode) ─────────── */}
        {(isOffline || isReconnecting) && (
          <div
            style={{
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <WifiOff size={16} color="#ef4444" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', marginBottom: '3px' }}>
                {isReconnecting ? '⚠ Reconnecting...' : 'OFFLINE'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                {isReconnecting ? 'Trying to reconnect' : 'Super Productivity not connected'}
              </div>
            </div>
          </div>
        )}

        {/* ── Session Section (FOCUS, PAUSED, OVERTIME) ──────────────── */}
        {(state === 'FOCUS' || state === 'PAUSED' || state === 'OVERTIME') && (
          <div>
            <SectionLabel accent={accentColor}>SESSION</SectionLabel>

            <div
              style={{
                padding: '16px',
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.12) 0%, rgba(${accentRgb}, 0.06) 100%)`,
                border: `2px solid rgba(${accentRgb}, 0.3)`,
                borderRadius: '12px',
                boxShadow: `0 4px 20px rgba(${accentRgb}, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* Timer label */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '6px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}
              >
                {isFlowtime ? 'ELAPSED' : state === 'OVERTIME' ? 'OVERTIME' : 'REMAINING'}
              </div>

              {/* Main timer - HERO ELEMENT */}
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: 700,
                  color: accentColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center',
                  marginBottom: '12px',
                  transition: 'color 0.6s ease',
                  textShadow: `0 0 25px rgba(${accentRgb}, 0.6), 0 2px 8px rgba(0,0,0,0.5)`,
                  letterSpacing: '0.02em',
                }}
              >
                {state === 'OVERTIME' ? `+${formatMs(elapsedMs - durationMs)}` : formatMs(displayMs)}
              </div>

              {/* Mode/Cycle/Message - BIGGER and on one line */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                {getStateMessage()}
                {getSubMessage() && (
                  <span style={{ marginLeft: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    • {getSubMessage()}
                  </span>
                )}
              </div>

              {/* Round Progress Bar */}
              {isPomodoro && pomodoroInRound > 0 && (
                <RoundProgressBar
                  pomodoroInRound={pomodoroInRound}
                  currentRound={currentRound}
                  accentRgb={accentRgb}
                  accentColor={accentColor}
                />
              )}

              {/* Progress bar - not for OVERTIME */}
              {state !== 'OVERTIME' && durationMs > 0 && (
                <ProgressBar progress={sessionProgress} accentRgb={accentRgb} />
              )}

              {/* Bottom info - show Total task time */}
              {state === 'FOCUS' && taskTimeToday > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                    Total task time
                  </span>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: accentColor,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {formatMsHuman(taskTimeToday)}
                  </span>
                </div>
              )}

              {/* Current task indicator - show which task is being worked on */}
              {state === 'FOCUS' && taskTitle && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: `linear-gradient(135deg, rgba(${accentRgb}, 0.15) 0%, rgba(${accentRgb}, 0.08) 100%)`,
                    border: `2px solid rgba(${accentRgb}, 0.35)`,
                    borderRadius: '8px',
                    boxShadow: `0 2px 12px rgba(${accentRgb}, 0.2)`,
                  }}
                >
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '6px' }}>
                    ▶ Working on
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {taskTitle}
                  </div>
                </div>
              )}
              {state === 'PAUSED' && (
                <div
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.6)',
                    textAlign: 'center',
                    marginTop: '8px',
                    fontWeight: 600,
                  }}
                >
                  Session paused
                </div>
              )}
              {state === 'OVERTIME' && (
                <div
                  style={{
                    fontSize: '13px',
                    color: accentColor,
                    textAlign: 'center',
                    fontWeight: 700,
                    marginTop: '8px',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
                  }}
                >
                  {getStateMessage()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Break Section (BREAK only) ─────────────────────────────── */}
        {state === 'BREAK' && (
          <div>
            <SectionLabel accent={accentColor}>BREAK</SectionLabel>

            <div
              style={{
                padding: '16px',
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.12) 0%, rgba(${accentRgb}, 0.06) 100%)`,
                border: `2px solid rgba(${accentRgb}, 0.3)`,
                borderRadius: '12px',
                boxShadow: `0 4px 20px rgba(${accentRgb}, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* Timer label */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '6px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}
              >
                REMAINING
              </div>

              {/* Break timer - HERO */}
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: 700,
                  color: accentColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center',
                  marginBottom: '12px',
                  transition: 'color 0.6s ease',
                  textShadow: `0 0 25px rgba(${accentRgb}, 0.6), 0 2px 8px rgba(0,0,0,0.5)`,
                  letterSpacing: '0.02em',
                }}
              >
                {formatMs(remainingMs)}
              </div>

              {/* Break type and cycle - BIGGER */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                {getStateMessage()}
                {isPomodoro && pomodoroInRound > 0 && !isRoundComplete && (
                  <span style={{ marginLeft: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    • After Pomodoro {pomodoroInRound}/4
                  </span>
                )}
              </div>

              {/* Round Progress Bar */}
              {isPomodoro && pomodoroInRound > 0 && (
                <RoundProgressBar
                  pomodoroInRound={pomodoroInRound}
                  currentRound={currentRound}
                  accentRgb={accentRgb}
                  accentColor={accentColor}
                />
              )}

              {/* Progress bar */}
              {durationMs > 0 && <ProgressBar progress={sessionProgress} accentRgb={accentRgb} />}

              {/* Tiny break tip - instead of repeating time */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{apiBreakTip ? '💡' : breakTipRef.current.emoji}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 500,
                  }}
                >
                  Tip: {apiBreakTip ?? breakTipRef.current.text}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Ready / Task-Selected Section ──────────────────────────── */}
        {(group === 'READY' || state === 'TASK_SELECTED') && (
          <div>
            <SectionLabel accent={accentColor}>
              {state === 'TASK_SELECTED' ? 'TASK SELECTED' : 'READY'}
            </SectionLabel>

            <div
              style={{
                padding: '18px',
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.15) 0%, rgba(${accentRgb}, 0.08) 100%)`,
                border: `2px solid rgba(${accentRgb}, 0.35)`,
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: `0 4px 20px rgba(${accentRgb}, 0.2)`,
              }}
            >
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: '8px',
                  textShadow: `0 0 15px rgba(${accentRgb}, 0.4)`,
                }}
              >
                {getStateMessage()}
              </div>
              {getSubMessage() && (
                <div
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {getSubMessage()}
                </div>
              )}
            </div>

            {/* Show which task is queued up (for TASK_SELECTED / READY_TO_FOCUS) */}
            {taskTitle && (state === 'TASK_SELECTED' || state === 'READY_TO_FOCUS') && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 12px',
                  background: `linear-gradient(135deg, rgba(${accentRgb}, 0.12) 0%, rgba(${accentRgb}, 0.06) 100%)`,
                  border: `1px solid rgba(${accentRgb}, 0.25)`,
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '5px' }}>
                  Next up
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {taskTitle}
                </div>
                {projectName && (
                  <div style={{ fontSize: '11px', color: `rgba(${accentRgb}, 0.8)`, fontWeight: 600, marginTop: '4px' }}>
                    📁 {projectName}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Disconnected Section (simple) ──────────────────────────── */}
        {state === 'DISCONNECTED' && (
          <div>
            <SectionLabel accent={accentColor}>OFFLINE</SectionLabel>
            <div
              style={{
                padding: '18px',
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
                {getStateMessage()}
              </div>
              {getSubMessage() && (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, fontWeight: 500 }}>
                  {getSubMessage()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Idle Section (engaging "be right back" for viewers) ─────── */}
        {state === 'IDLE' && (
          <div>
            <SectionLabel accent={accentColor}>AWAY</SectionLabel>

            {/* Rotating BRB message - HERO */}
            <div
              key={idleRotation}
              style={{
                padding: '20px 16px',
                background: `linear-gradient(135deg, rgba(${accentRgb}, 0.14) 0%, rgba(56, 189, 248, 0.10) 100%)`,
                border: `2px solid rgba(${accentRgb}, 0.3)`,
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: `0 4px 20px rgba(${accentRgb}, 0.18)`,
                animation: 'fadeIn 0.6s ease',
              }}
            >
              <div style={{ fontSize: '34px', lineHeight: 1, marginBottom: '10px' }}>
                {idleMessage.emoji}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.35,
                  textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}
              >
                {idleMessage.text}
              </div>
            </div>

            {/* Highlight stat tiles - keep viewers engaged with progress */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <div
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'rgba(255,193,7,0.08)',
                  border: '1px solid rgba(255,193,7,0.25)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#FFC107', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                  {timeSpentToday > 0 ? formatMsHuman(timeSpentToday) : '0m'}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: '4px' }}>
                  Focused
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                  {completedToday}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: '4px' }}>
                  Done
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#8B5CF6', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                  {plannedTotal > 0 ? `${planProgress}%` : '—'}
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: '4px' }}>
                  Plan
                </div>
              </div>
            </div>

            {/* Rotating fun fact */}
            <div
              key={`fact-${idleRotation}`}
              style={{
                marginTop: '10px',
                padding: '10px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: `rgba(${accentRgb}, 0.85)`,
                letterSpacing: '0.02em',
                animation: 'fadeIn 0.6s ease',
              }}
            >
              {idleFact}
            </div>
          </div>
        )}

        {/* ── Today Section ──────────────────────────────────────────── */}
        <div>
          <SectionLabel accent={accentColor}>TODAY</SectionLabel>
          <div
            style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <StatRow
              label="Work time"
              value={timeSpentToday > 0 ? formatMsHuman(timeSpentToday) : '—'}
              accent={accentColor}
            />
            <StatRow
              label="Done"
              value={completedToday > 0 ? String(completedToday) : '—'}
              accent={accentColor}
            />
            {plannedTotal > 0 && (
              <>
                <StatRow
                  label="Planned"
                  value={`${plannedDone}/${plannedTotal}`}
                  accent={accentColor}
                />
                <ProgressBar progress={planProgress} accentRgb={accentRgb} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: accentColor,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {planProgress}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Today's Tasks (max 3) ──────────────────────────────────── */}
        {orderedTasks.length > 0 && (
          <div>
            <SectionLabel accent={accentColor}>
              TASKS{' '}
              <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                {doneTasks.length}/{todayTasks.length}
              </span>
            </SectionLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {orderedTasks.map((t) => {
                const isActiveTask = t.id === activeId
                return (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '9px',
                      padding: isActiveTask ? '6px 8px' : '4px 1px',
                      borderRadius: '7px',
                      background: isActiveTask ? `rgba(${accentRgb}, 0.15)` : 'transparent',
                      border: isActiveTask
                        ? `1px solid rgba(${accentRgb}, 0.35)`
                        : '1px solid transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        minWidth: '14px',
                        marginTop: '3px',
                        borderRadius: '3px',
                        border: t.isDone
                          ? `2px solid ${accentColor}`
                          : '2px solid rgba(255,255,255,0.35)',
                        background: t.isDone ? accentColor : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {t.isDone && <span style={{ fontSize: '10px', color: '#0a0a0f', fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Title */}
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isActiveTask ? 600 : 500,
                        color: t.isDone
                          ? 'rgba(255,255,255,0.35)'
                          : isActiveTask
                          ? '#ffffff'
                          : 'rgba(255,255,255,0.75)',
                        textDecoration: t.isDone ? 'line-through' : 'none',
                        lineHeight: 1.35,
                        flex: 1,
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {isActiveTask && !t.isDone && '▶ '}
                      {t.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Motivational tagline above webcam ───────────────────────── */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 600,
            color: `rgba(${accentRgb}, 0.6)`,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            padding: '8px 0',
          }}
        >
          Focus • Build • Ship
        </div>
      </div>

      {/* ── Webcam Reserved Space (198px) with divider ──────────────── */}
      <div
        style={{
          height: '198px',
          minHeight: '198px',
          maxHeight: '198px',
          background: 'transparent',
          pointerEvents: 'none',
          borderTop: `2px solid rgba(${accentRgb}, 0.2)`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '8px',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
          }}
        >
          CAM
        </div>
      </div>
    </div>
  )
}
