import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

interface StatusTickerProps {
  timerMode: 'focus' | 'break';
}

const THEME = {
  focus: {
    accent: '#FFC107',
    accentRgb: '255, 193, 7',
  },
  break: {
    accent: '#22c55e',
    accentRgb: '34, 197, 94',
  },
} as const;

/**
 * Inline editable field — click text to edit, Enter/blur to save, Escape to cancel.
 * In OBS mode, editing is disabled (read-only display).
 */
function EditableField({
  value,
  onSave,
  accentColor,
  isObs,
}: {
  value: string;
  onSave: (val: string) => void;
  accentColor: string;
  isObs: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

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
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: `1px solid ${accentColor}`,
          borderRadius: '4px',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          padding: '2px 6px',
          outline: 'none',
          width: '100%',
          maxWidth: '200px',
        }}
      />
    );
  }

  return (
    <span
      onClick={() => !isObs && setIsEditing(true)}
      style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#ffffff',
        cursor: isObs ? 'default' : 'pointer',
        borderBottom: isObs ? 'none' : '1px dashed rgba(255, 255, 255, 0.15)',
        paddingBottom: '1px',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '200px',
        display: 'inline-block',
      }}
    >
      {value}
    </span>
  );
}

export function StatusTicker({ timerMode }: StatusTickerProps) {
  const currentActivity = useStore((s) => s.currentActivity);
  const setCurrentActivity = useStore((s) => s.setCurrentActivity);
  const theme = THEME[timerMode];
  const isObs = document.body.classList.contains('obs-mode');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(0deg, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.92) 100%)',
        borderTop: `1px solid rgba(${theme.accentRgb}, 0.12)`,
        zIndex: 100,
        overflow: 'hidden',
        gap: '6px',
      }}
    >
      {/* Subtle animated scan line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, rgba(${theme.accentRgb}, 0.3) 50%, transparent 100%)`,
          animation: 'ticker-scan 4s ease-in-out infinite',
        }}
      />

      {/* Left decorative element */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '8px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: theme.accent,
            boxShadow: `0 0 8px rgba(${theme.accentRgb}, 0.5)`,
            animation: 'status-pulse 3s ease-in-out infinite',
            transition: 'background 0.6s ease, box-shadow 0.6s ease',
          }}
        />
        <span
          style={{
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: theme.accent,
            fontFamily: "'JetBrains Mono', monospace",
            transition: 'color 0.6s ease',
          }}
        >
          NOW
        </span>
      </div>

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '16px',
          background: `rgba(${theme.accentRgb}, 0.2)`,
          transition: 'background 0.6s ease',
        }}
      />

      {/* Project */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px' }}>
        <span style={{ fontSize: '14px', lineHeight: 1 }}>🔨</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          PROJECT
        </span>
        <EditableField
          value={currentActivity.project}
          onSave={(val) => setCurrentActivity({ project: val })}
          accentColor={theme.accent}
          isObs={isObs}
        />
      </div>

      {/* Separator */}
      <div
        style={{
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: `rgba(${theme.accentRgb}, 0.3)`,
          transition: 'background 0.6s ease',
        }}
      />

      {/* Current Task */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px' }}>
        <span style={{ fontSize: '14px', lineHeight: 1 }}>📋</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          DOING
        </span>
        <EditableField
          value={currentActivity.task}
          onSave={(val) => setCurrentActivity({ task: val })}
          accentColor={theme.accent}
          isObs={isObs}
        />
      </div>

      {/* Separator */}
      <div
        style={{
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: `rgba(${theme.accentRgb}, 0.3)`,
          transition: 'background 0.6s ease',
        }}
      />

      {/* Stage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px' }}>
        <span style={{ fontSize: '14px', lineHeight: 1 }}>🎯</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          STAGE
        </span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 10px',
            background: `rgba(${theme.accentRgb}, 0.08)`,
            border: `1px solid rgba(${theme.accentRgb}, 0.2)`,
            borderRadius: '10px',
            transition: 'all 0.6s ease',
          }}
        >
          <EditableField
            value={currentActivity.stage}
            onSave={(val) => setCurrentActivity({ stage: val })}
            accentColor={theme.accent}
            isObs={isObs}
          />
        </div>
      </div>

      {/* Right decorative bracket */}
      <div
        style={{
          marginLeft: '8px',
          display: 'flex',
          gap: '3px',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '2px',
              height: `${8 + i * 3}px`,
              background: `rgba(${theme.accentRgb}, ${0.15 + i * 0.1})`,
              borderRadius: '1px',
              transition: 'background 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes ticker-scan {
          0%, 100% { opacity: 0; transform: translateX(-100%); }
          50% { opacity: 1; transform: translateX(100%); }
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
