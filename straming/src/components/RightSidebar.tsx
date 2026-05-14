import { WebcamFrame } from './WebcamFrame'
import { useClock } from '../hooks/useClock'

export function RightSidebar() {
  const now = useClock()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <aside
      className="flex flex-col gap-3 flex-shrink-0"
      style={{
        width: 'var(--sidebar-right-width)',
        opacity: 'var(--module-opacity)',
        transform: `scale(var(--module-scale))`,
        transition: 'var(--transition-density)',
      }}
    >
      <WebcamFrame />
      
      {/* Time Display */}
      <div className="glass-card p-3 flex flex-col items-center gap-1">
        <span className="section-label" style={{ fontSize: '9px' }}>CURRENT TIME</span>
        <span className="mono text-xl font-bold" style={{ color: 'var(--accent-yellow)' }}>
          {timeStr}
        </span>
      </div>
    </aside>
  )
}
