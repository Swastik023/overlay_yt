import { useRef } from 'react'
import { WifiOff } from 'lucide-react'
import { useSuperProductivity, resolveProjectName, formatMs, formatMsHuman, deriveActivityState } from '../hooks/useSuperProductivity'

// ─── Theme ────────────────────────────────────────────────────────────────────

export const THEME_COLORS = {
  focus:    { accent: '#FFC107', accentRgb: '255, 193, 7' },
  overtime: { accent: '#f97316', accentRgb: '249, 115, 22' },
  break:    { accent: '#22c55e', accentRgb: '34, 197, 94' },
  paused:   { accent: '#94a3b8', accentRgb: '148, 163, 184' },
  idle:     { accent: '#6b7280', accentRgb: '107, 114, 128' },
} as const

// ─── Tiny helper components ───────────────────────────────────────────────────

function Label({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        color: accent,
        textTransform: 'uppercase' as const,
        marginBottom: '10px',
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
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
        height: '4px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '6px',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: `rgba(${accentRgb}, 0.8)`,
          borderRadius: '2px',
          transition: 'width 1s linear',
        }}
      />
    </div>
  )
}

// ─── Compact break tips for sidebar ───────────────────────────────────────────

const BREAK_TIPS_COMPACT = [
  { emoji: '👀', text: 'Blink rapidly for a few seconds to refresh your eyes.' },
  { emoji: '🧘', text: 'Close your eyes and take 3 deep breaths.' },
  { emoji: '🚶', text: 'Stand up and stretch your legs.' },
  { emoji: '💧', text: 'Drink some water — stay hydrated.' },
  { emoji: '🤲', text: 'Rotate your wrists 4x clockwise, 4x counter-clockwise.' },
  { emoji: '🌿', text: 'Look at something green or far away for 20 seconds.' },
  { emoji: '🦴', text: 'Roll your shoulders back and sit up straight.' },
  { emoji: '☕', text: 'Grab a quick coffee or fruit.' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function LeftSidebarNew() {
  const { connectionStatus, currentTask, focusMode, tick, todayStats, projects, todayTasks } =
    useSuperProductivity()

  // Derive theme from activity state (matches the header)
  const activityState = deriveActivityState(focusMode, currentTask)
  const isBreak = focusMode?.isBreakActive ?? false
  const theme = THEME_COLORS[activityState]

  const isOffline = connectionStatus !== 'connected'
  const isReconnecting = connectionStatus === 'reconnecting'

  // Project name resolution
  const projectName = resolveProjectName(currentTask?.projectId, projects)

  // Compact break tip — pick once per break (re-randomizes when break toggles)
  const lastBreakRef = useRef(false)
  const breakTipRef = useRef(BREAK_TIPS_COMPACT[Math.floor(Math.random() * BREAK_TIPS_COMPACT.length)])
  if (isBreak && !lastBreakRef.current) {
    breakTipRef.current = BREAK_TIPS_COMPACT[Math.floor(Math.random() * BREAK_TIPS_COMPACT.length)]
  }
  lastBreakRef.current = isBreak

  // Session header label
  let sessionLabel = '🌙 IDLE'
  if (isBreak) {
    sessionLabel = focusMode?.isLongBreak ? '☕ LONG BREAK' : '☕ BREAK'
  } else if (focusMode?.isSessionPaused) {
    sessionLabel = '⏸ PAUSED'
  } else if (focusMode?.isInOvertime) {
    sessionLabel = '🔥 OVERTIME'
  } else if (focusMode?.isSessionRunning) {
    sessionLabel = '🔥 FOCUS'
  } else if (currentTask) {
    sessionLabel = '🔥 TRACKING'
  }

  // Focus timer display
  const focusModeLabel = focusMode?.mode ?? null

  // Time values from tick (most up-to-date) or focusMode
  const taskTimeToday = tick?.timeSpentToday ?? currentTask?.timeSpentToday ?? 0
  const taskEstimate = tick?.timeEstimate ?? currentTask?.timeEstimate ?? 0
  const taskTitle = tick?.title ?? currentTask?.title ?? null
  const taskProgress =
    taskEstimate > 0 ? Math.min(100, (taskTimeToday / taskEstimate) * 100) : 0

  // Today's task list (open first, then done). Highlight the actively-tracked one.
  const activeId = tick?.currentTaskId ?? currentTask?.id ?? null
  const openTasks = todayTasks.filter((t) => !t.isDone)
  const doneTasks = todayTasks.filter((t) => t.isDone)
  const orderedTasks = [...openTasks, ...doneTasks]


  // Today stats
  const timeSpentToday = todayStats?.timeSpentToday ?? 0
  const completedToday = todayStats?.completedToday ?? 0
  const plannedTotal = todayStats?.planned.total ?? 0
  const plannedDone = todayStats?.planned.done ?? 0
  const plannedRemaining = todayStats?.planned.remaining ?? 0
  const planProgress = todayStats?.planned.progress ?? 0
  const estimateRemaining = todayStats?.estimateRemaining ?? 0

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
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* ── Session Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: theme.accent,
            textTransform: 'uppercase',
            transition: 'color 0.6s ease',
          }}
        >
          {sessionLabel}
          {focusModeLabel && (
            <span
              style={{
                marginLeft: '6px',
                padding: '1px 6px',
                background: `rgba(${theme.accentRgb}, 0.12)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
                borderRadius: '4px',
                fontSize: '9px',
                letterSpacing: '0.08em',
              }}
            >
              {focusModeLabel.toUpperCase()}
            </span>
          )}
        </div>

        {isOffline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
            <WifiOff size={10} />
            <span>{isReconnecting ? 'Reconnecting…' : 'SP Offline'}</span>
          </div>
        )}
      </div>

      {/* ── Current Task ──────────────────────────────────────── */}
      <div>
        <Label accent={theme.accent}>📋 CURRENT TASK</Label>
        {taskTitle ? (
          <div>
            {/* Task title */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                marginBottom: '6px',
              }}
            >
              {taskTitle}
            </div>

            {/* Project name */}
            {projectName && (
              <div
                style={{
                  fontSize: '10px',
                  color: `rgba(${theme.accentRgb}, 0.8)`,
                  marginBottom: '8px',
                  fontWeight: 500,
                }}
              >
                📁 {projectName}
              </div>
            )}

            {/* Time today vs estimate */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '4px',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {formatMs(taskTimeToday)}
              </span>
              {taskEstimate > 0 && (
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                  / {formatMs(taskEstimate)}
                </span>
              )}
            </div>

            {/* Task progress bar */}
            {taskEstimate > 0 && (
              <ProgressBar progress={taskProgress} accentRgb={theme.accentRgb} />
            )}
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            No active task
          </div>
        )}
      </div>

      {/* ── Today's Tasks ─────────────────────────────────────── */}
      {orderedTasks.length > 0 && (
        <div>
          <Label accent={theme.accent}>
            ✅ TODAY'S TASKS{' '}
            <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              {doneTasks.length}/{orderedTasks.length}
            </span>
          </Label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {orderedTasks.map((t) => {
              const isActiveTask = t.id === activeId
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: isActiveTask ? '4px 6px' : '0',
                    borderRadius: '6px',
                    background: isActiveTask ? `rgba(${theme.accentRgb}, 0.1)` : 'transparent',
                    border: isActiveTask
                      ? `1px solid rgba(${theme.accentRgb}, 0.3)`
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '13px',
                      height: '13px',
                      minWidth: '13px',
                      marginTop: '2px',
                      borderRadius: '3px',
                      border: t.isDone
                        ? `1.5px solid ${theme.accent}`
                        : '1.5px solid rgba(255,255,255,0.25)',
                      background: t.isDone ? theme.accent : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {t.isDone && <span style={{ fontSize: '9px', color: '#0a0a0f' }}>✓</span>}
                  </div>

                  {/* Title */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isActiveTask ? 600 : 500,
                      color: t.isDone
                        ? 'rgba(255,255,255,0.3)'
                        : isActiveTask
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.75)',
                      textDecoration: t.isDone ? 'line-through' : 'none',
                      lineHeight: 1.4,
                      flex: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {isActiveTask && !t.isDone ? '▶ ' : ''}
                    {t.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Break Tip (compact, shown during break) ────────────── */}
      {isBreak && (
        <div
          style={{
            padding: '10px',
            background: 'rgba(34, 197, 94, 0.06)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.15)',
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: '#22c55e', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
            💡 BREAK TIP
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{breakTipRef.current.emoji}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              {breakTipRef.current.text}
            </span>
          </div>
        </div>
      )}

      {/* ── Today's Stats ─────────────────────────────────────── */}
      <div>
        <Label accent={theme.accent}>📊 TODAY</Label>

        <div
          style={{
            padding: '10px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
          }}
        >
          <StatRow
            label="Focused"
            value={timeSpentToday > 0 ? formatMsHuman(timeSpentToday) : '—'}
            accent={theme.accent}
          />
          <StatRow
            label="Completed"
            value={completedToday > 0 ? String(completedToday) : '—'}
            accent={theme.accent}
          />
          {plannedTotal > 0 && (
            <>
              <StatRow
                label="Planned"
                value={`${plannedDone} / ${plannedTotal}`}
                accent={theme.accent}
              />
              <ProgressBar progress={planProgress} accentRgb={theme.accentRgb} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                  {plannedRemaining} remaining
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: theme.accent,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {planProgress}%
                </span>
              </div>
            </>
          )}
          {estimateRemaining > 0 && (
            <StatRow
              label="Est. left"
              value={formatMsHuman(estimateRemaining)}
              accent="rgba(255,255,255,0.45)"
            />
          )}
        </div>
      </div>

      {/* ── Connection status ─────────────────────────────────── */}
      {isOffline && (
        <div
          style={{
            padding: '8px 10px',
            background: 'rgba(255,59,48,0.08)',
            border: '1px solid rgba(255,59,48,0.2)',
            borderRadius: '8px',
            fontSize: '10px',
            color: 'rgba(255,100,80,0.8)',
            lineHeight: 1.5,
          }}
        >
          <strong>OFFLINE</strong>
          <br />
          Super Productivity not connected
        </div>
      )}
    </div>
  )
}
