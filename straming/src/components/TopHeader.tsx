import { useState, useEffect } from 'react'
import { useFocusTimerBridge } from '../hooks/useFocusTimerBridge'
import { useStore } from '../store/useStore'
import { Music2 } from 'lucide-react'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface TopHeaderProps {
  timerMode: 'focus' | 'break';
}

// Theme colors
const THEME = {
  focus: {
    accent: '#FFC107',
    accentRgb: '255, 193, 7',
    label: 'FOCUS',
    emoji: '⚡',
  },
  break: {
    accent: '#22c55e',
    accentRgb: '34, 197, 94',
    label: 'BREAK',
    emoji: '☕',
  },
} as const;

export function TopHeader({ timerMode }: TopHeaderProps) {
  const [time, setTime] = useState(new Date())
  const { timer } = useFocusTimerBridge()
  const nowPlaying = useStore((s) => s.nowPlaying)
  const theme = THEME[timerMode];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // Timer calculations
  const timeLeft = Math.floor(timer?.remaining ?? 1500)
  const totalDuration = timer?.duration ?? 1500
  const progress = timer && totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0
  
  // SVG Ring calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '141px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98) 0%, rgba(15, 15, 20, 0.95) 100%)',
        borderBottom: `2px solid rgba(${theme.accentRgb}, 0.1)`,
        zIndex: 100,
        overflow: 'hidden',
        transition: 'border-color 0.6s ease',
      }}
    >
      {/* Animated Grid Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(${theme.accentRgb}, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${theme.accentRgb}, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          opacity: 0.5,
          animation: 'grid-move 20s linear infinite',
        }}
      />

      {/* Animated Dot Matrix - Left Side */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: theme.accent,
              opacity: 0.3,
              animation: `dot-pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: `0 0 4px rgba(${theme.accentRgb}, 0.5)`,
              transition: 'background 0.6s ease, box-shadow 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Top Left Area (Clock + Mode + Timer) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
        }}
      >
        {/* Clock & Mode Badge Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Real-time Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: theme.accent,
                boxShadow: `0 0 8px rgba(${theme.accentRgb}, 0.6)`,
                transition: 'background 0.6s ease, box-shadow 0.6s ease',
              }}
            />
            <span
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              {timeStr}
            </span>
          </div>

          {/* Mode Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: '8px',
              padding: '4px 14px',
              background: `rgba(${theme.accentRgb}, 0.08)`,
              border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
              borderRadius: '8px',
              transition: 'all 0.6s ease',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{theme.emoji}</span>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: theme.accent,
                letterSpacing: '0.15em',
                lineHeight: 1,
                transition: 'color 0.6s ease',
              }}
            >
              {theme.label}
            </span>
          </div>
        </div>

        {/* Circular Timer Display */}
        <div style={{ position: 'relative', width: '110px', height: '110px' }}>
          <svg
            width="110"
            height="110"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={theme.accent}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease',
                filter: `drop-shadow(0 0 6px rgba(${theme.accentRgb}, 0.4))`,
              }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1,
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Mode Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: '8px',
            padding: '4px 14px',
            background: `rgba(${theme.accentRgb}, 0.08)`,
            border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
            borderRadius: '8px',
            transition: 'all 0.6s ease',
          }}
        >
          <span style={{ fontSize: '22px', lineHeight: 1 }}>{theme.emoji}</span>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: theme.accent,
              letterSpacing: '0.15em',
              lineHeight: 1,
              transition: 'color 0.6s ease',
            }}
          >
            {theme.label}
          </span>
        </div>
      </div>

      {/* Center Title with Logo */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Small Logo/Emblem Above Title */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            marginBottom: '8px',
            background: `linear-gradient(135deg, rgba(${theme.accentRgb}, 0.2) 0%, rgba(${theme.accentRgb}, 0.05) 100%)`,
            border: `2px solid rgba(${theme.accentRgb}, 0.3)`,
            borderRadius: '8px',
            position: 'relative',
            transition: 'all 0.6s ease',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              filter: `drop-shadow(0 0 4px rgba(${theme.accentRgb}, 0.5))`,
            }}
          >
            {theme.emoji}
          </div>
          {/* Corner accent */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '6px',
              height: '6px',
              background: theme.accent,
              borderRadius: '50%',
              boxShadow: `0 0 6px rgba(${theme.accentRgb}, 0.8)`,
              transition: 'all 0.6s ease',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '0.35em',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            position: 'relative',
          }}
        >
          LEARN AI <span style={{ color: theme.accent, textShadow: `0 0 20px rgba(${theme.accentRgb}, 0.4)`, transition: 'color 0.6s ease' }}>WITH ME</span>
        </h1>
        
        <p
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: '6px 0 0 0',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: `rgba(${theme.accentRgb}, 0.6)`, transition: 'color 0.6s ease' }}>●</span> FOCUS • LEARN • BUILD <span style={{ color: `rgba(${theme.accentRgb}, 0.6)`, transition: 'color 0.6s ease' }}>●</span>
        </p>

        {/* Session Info */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.15em',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {timerMode === 'focus' ? 'Deep Focus Session' : 'Taking a Break'}
        </div>
      </div>

      {/* Top Right Area (Spotify + LIVE) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          right: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Spotify Now Playing (Compact Horizontal Layout) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(30, 215, 96, 0.05) 100%)',
            border: '1px solid rgba(29, 185, 84, 0.2)',
            borderRadius: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          {nowPlaying.albumArt ? (
            <img
              src={nowPlaying.albumArt}
              alt="Album Art"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid rgba(29, 185, 84, 0.3)',
              }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(29, 185, 84, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Music2 size={16} color="#1DB954" />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '150px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {nowPlaying.name || 'Not Playing'}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
                marginTop: '2px',
              }}
            >
              {nowPlaying.artist || '-'}
            </span>
          </div>
          
          {/* Equalizer */}
          {nowPlaying.isPlaying && (
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px', marginLeft: '4px' }}>
              {[0.4, 0.8, 0.5, 1, 0.6].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: `${h * 100}%`,
                    background: '#1DB954',
                    borderRadius: '1px',
                    animation: `eq-bounce ${0.5 + i * 0.1}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* LIVE Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
              animation: 'live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: '#ef4444',
            }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* Animated Dot Matrix - Right Side */}
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: theme.accent,
              opacity: 0.3,
              animation: `dot-pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${(8 - i) * 0.15}s`,
              boxShadow: `0 0 4px rgba(${theme.accentRgb}, 0.5)`,
              transition: 'background 0.6s ease, box-shadow 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(30px); }
        }
      `}</style>
    </div>
  )
}
