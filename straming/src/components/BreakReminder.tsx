import { Coffee } from 'lucide-react'

export function BreakReminder() {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(167,139,250,0.12)',
          border: '1px solid rgba(167,139,250,0.15)',
        }}
      >
        <Coffee size={18} style={{ color: 'var(--accent-purple)' }} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-purple)' }}>
          BREAK REMINDER
        </span>
        <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
          Take a 5 min break<br />after 4 pomodoros!
        </p>
      </div>
    </div>
  )
}
