export function RightSidebarNew() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '141px',
        right: 0,
        width: '150px',
        bottom: '80px',
        background: 'rgba(15, 15, 20, 0.6)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '20px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Webcam Frame */}
      <div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#FFC107',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          WEBCAM
        </div>
        <div
          style={{
            width: '120px',
            height: '68px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '2px solid rgba(255, 193, 7, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner accents */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              width: '12px',
              height: '12px',
              borderTop: '2px solid #FFC107',
              borderLeft: '2px solid #FFC107',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '12px',
              height: '12px',
              borderTop: '2px solid #FFC107',
              borderRight: '2px solid #FFC107',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '4px',
              width: '12px',
              height: '12px',
              borderBottom: '2px solid #FFC107',
              borderLeft: '2px solid #FFC107',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '12px',
              height: '12px',
              borderBottom: '2px solid #FFC107',
              borderRight: '2px solid #FFC107',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
            }}
          >
            👤
            <br />
            <span style={{ fontSize: '8px' }}>Camera Feed</span>
          </div>
        </div>
      </div>

      {/* Motivation Card */}
      <div
        style={{
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.15)',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#FFC107',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          MOTIVATION
        </div>
        <p
          style={{
            fontSize: '12px',
            lineHeight: '1.5',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          Focus on the process, not the outcome.
        </p>
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'right',
          }}
        >
          — Stay Focused
        </div>
      </div>

      {/* Streak Reminder */}
      <div
        style={{
          padding: '12px',
          background: 'rgba(34, 211, 238, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(34, 211, 238, 0.15)',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#22d3ee',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          STREAK REMINDER
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
            }}
          >
            🔥
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Take a 5 min break after 4 pomodoros
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
