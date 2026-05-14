import { useState, useEffect } from 'react'
import { useFocusTimerBridge } from '../hooks/useFocusTimerBridge'

export function TopHeader() {
  const [time, setTime] = useState(new Date())
  const { session } = useFocusTimerBridge()
  const pomodorosCompleted = session?.pomodorosCompleted ?? 0
  const currentCycle = session?.currentCycle ?? 1

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

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
        borderBottom: '2px solid rgba(255, 193, 7, 0.1)',
        zIndex: 100,
        overflow: 'hidden',
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
            linear-gradient(rgba(255, 193, 7, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 193, 7, 0.03) 1px, transparent 1px)
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
              background: '#FFC107',
              opacity: 0.3,
              animation: `dot-pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: '0 0 4px rgba(255, 193, 7, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Time Display with Icon - Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#FFC107',
            boxShadow: '0 0 8px rgba(255, 193, 7, 0.6)',
          }}
        />
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
          }}
        >
          {timeStr}
        </span>
      </div>

      {/* Session Counter - Top Left Below Time */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(255, 193, 7, 0.08)',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          borderRadius: '6px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'rgba(255, 193, 7, 0.6)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Session
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#FFC107',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          #{currentCycle.toString().padStart(2, '0')}
        </span>
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
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.05) 100%)',
            border: '2px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              filter: 'drop-shadow(0 0 4px rgba(255, 193, 7, 0.5))',
            }}
          >
            ⚡
          </div>
          {/* Corner accent */}
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '6px',
              height: '6px',
              background: '#FFC107',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(255, 193, 7, 0.8)',
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
          STUDY WITH <span style={{ color: '#FFC107', textShadow: '0 0 20px rgba(255, 193, 7, 0.4)' }}>ME</span>
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
          <span style={{ color: 'rgba(255, 193, 7, 0.6)' }}>●</span> FOCUS • LEARN • BUILD <span style={{ color: 'rgba(255, 193, 7, 0.6)' }}>●</span>
        </p>

        {/* Unique Timer Style - Session Info */}
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
          Deep Focus Session • {pomodorosCompleted} Pomodoros Completed
        </div>
      </div>

      {/* LIVE Indicator - Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '30px',
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
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
            animation: 'live-pulse 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#ef4444',
            textShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
          }}
        >
          LIVE
        </span>
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
              background: '#FFC107',
              opacity: 0.3,
              animation: `dot-pulse ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${(8 - i) * 0.15}s`,
              boxShadow: '0 0 4px rgba(255, 193, 7, 0.5)',
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
