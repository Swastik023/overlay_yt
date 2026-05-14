import { useDensityStore, type DensityMode } from '../store/useDensityStore'
import { Maximize2, Minimize2, Coffee } from 'lucide-react'

const MODES: { mode: DensityMode; label: string; icon: typeof Maximize2; tooltip: string }[] = [
  { mode: 'stream', label: 'Stream', icon: Maximize2, tooltip: 'Balanced layout for streaming' },
  { mode: 'focus', label: 'Focus', icon: Minimize2, tooltip: 'Minimal UI for deep work' },
  { mode: 'break', label: 'Break', icon: Coffee, tooltip: 'Expanded layout for breaks' },
]

export function DensityModeSwitcher() {
  const mode = useDensityStore((s) => s.mode)
  const setMode = useDensityStore((s) => s.setMode)

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
      {MODES.map(({ mode: m, label, icon: Icon, tooltip }) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200"
          style={{
            background: mode === m ? 'var(--accent-yellow)' : 'transparent',
            color: mode === m ? '#0a0a0f' : 'var(--text-muted)',
          }}
          title={tooltip}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  )
}
