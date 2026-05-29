import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { WifiOff, Edit2, Trash2 } from 'lucide-react'
import { useFocusTimerBridge } from '../hooks/useFocusTimerBridge'

function TaskItem({ task, toggleTask, updateTask, removeTask, accentColor }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim()) {
      updateTask(task.id, editText.trim());
    } else {
      removeTask(task.id);
    }
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => toggleTask(task.id)}
        style={{
          width: '14px',
          height: '14px',
          minWidth: '14px',
          borderRadius: '3px',
          border: task.completed
            ? `1.5px solid ${accentColor}`
            : '1.5px solid rgba(255, 255, 255, 0.2)',
          background: task.completed ? accentColor : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px',
          cursor: 'pointer'
        }}
      >
        {task.completed && (
          <span style={{ fontSize: '10px', color: '#0a0a0f' }}>✓</span>
        )}
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditText(task.text);
              setIsEditing(false);
            }
          }}
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '12px',
            flex: 1,
            outline: 'none',
            borderRadius: '3px',
            padding: '2px 4px',
            marginTop: '-2px'
          }}
        />
      ) : (
        <span
          onClick={() => toggleTask(task.id)}
          style={{
            fontSize: '12px',
            color: task.completed
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.7)',
            textDecoration: task.completed ? 'line-through' : 'none',
            lineHeight: '1.4',
            flex: 1,
            wordBreak: 'break-word',
            cursor: 'pointer'
          }}
        >
          {task.text}
        </span>
      )}

      {isHovered && !isEditing && (
        <div style={{ display: 'flex', gap: '4px', position: 'absolute', right: 0, background: 'rgba(15, 15, 20, 0.8)', paddingLeft: '4px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255, 100, 100, 0.7)', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityField({
  label,
  value,
  onSave,
  accentColor,
  accentRgb,
  hideLabel,
}: {
  label: string;
  value: string;
  onSave: (val: string) => void;
  accentColor: string;
  accentRgb: string;
  hideLabel?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    else setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {!hideLabel && (
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.35)',
              minWidth: '38px',
            }}
          >
            {label}
          </span>
        )}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setDraft(value); setIsEditing(false); }
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: `1px solid rgba(${accentRgb}, 0.4)`,
            borderRadius: '3px',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 6px',
            outline: 'none',
            flex: 1,
            width: '100%',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
      onClick={() => setIsEditing(true)}
    >
      {!hideLabel && (
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'rgba(255, 255, 255, 0.35)',
            minWidth: '38px',
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.75)',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// Theme colors shared across components
export const THEME_COLORS = {
  focus: { accent: '#FFC107', accentRgb: '255, 193, 7' },
  break: { accent: '#22c55e', accentRgb: '34, 197, 94' },
} as const;

export function LeftSidebarNew() {
  // Connect to Focus Timer bridge
  const { timer, session, connectionStatus } = useFocusTimerBridge()

  // Tasks and Spotify from local store
  const tasks = useStore((s) => s.tasks)
  const toggleTask = useStore((s) => s.toggleTask)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const currentActivity = useStore((s) => s.currentActivity)
  const setCurrentActivity = useStore((s) => s.setCurrentActivity)

  // Timer state from bridge (or defaults if offline)
  const timeLeft = Math.floor(timer?.remaining ?? 1500) // Round to integer seconds
  const timerMode = timer?.state === 'pomodoro' ? 'focus' : 'break'

  // Dynamic theme
  const theme = THEME_COLORS[timerMode];

  const totalDuration = timer?.duration ?? 1500
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
              color: theme.accent,
              textTransform: 'uppercase',
              transition: 'color 0.6s ease',
            }}
          >
            {timerMode === 'focus' ? '🔥 FOCUS' : '☕ BREAK'}
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

      {/* Now Working On — Viewer Context */}
      <div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: theme.accent,
            textTransform: 'uppercase',
            transition: 'color 0.6s ease',
            marginBottom: '10px',
          }}
        >
          🔨 NOW WORKING ON
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Project */}
          <ActivityField
            label="PROJECT"
            value={currentActivity.project}
            onSave={(val) => setCurrentActivity({ project: val })}
            accentColor={theme.accent}
            accentRgb={theme.accentRgb}
          />
          {/* Current Task */}
          <ActivityField
            label="DOING"
            value={currentActivity.task}
            onSave={(val) => setCurrentActivity({ task: val })}
            accentColor={theme.accent}
            accentRgb={theme.accentRgb}
          />
          {/* Stage */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'rgba(255, 255, 255, 0.35)',
                minWidth: '38px',
              }}
            >
              STAGE
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                background: `rgba(${theme.accentRgb}, 0.1)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
                borderRadius: '8px',
                transition: 'all 0.6s ease',
              }}
            >
              <ActivityField
                label=""
                value={currentActivity.stage}
                onSave={(val) => setCurrentActivity({ stage: val })}
                accentColor={theme.accent}
                accentRgb={theme.accentRgb}
                hideLabel
              />
            </div>
          </div>
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
              color: theme.accent,
              textTransform: 'uppercase',
              transition: 'color 0.6s ease',
            }}
          >
            TODAY'S PLAN
          </div>
          <button
            onClick={() => addTask('New Task')}
            style={{
              width: '16px',
              height: '16px',
              background: `rgba(${theme.accentRgb}, 0.1)`,
              border: `1px solid rgba(${theme.accentRgb}, 0.3)`,
              borderRadius: '3px',
              color: theme.accent,
              transition: 'all 0.6s ease',
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
          {tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              toggleTask={toggleTask}
              updateTask={updateTask}
              removeTask={removeTask}
              accentColor={theme.accent}
            />
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
              color: theme.accent,
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'color 0.6s ease',
            }}
          >
            {completedTasks}/{tasks.length}
          </div>
        </div>
      </div>
    </div>
  )
}
