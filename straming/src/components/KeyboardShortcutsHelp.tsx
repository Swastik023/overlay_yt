import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

  const shortcuts = [
    { key: 'Space', action: 'Start / Pause timer' },
    { key: 'R', action: 'Reset timer' },
    { key: '1', action: 'Stream mode' },
    { key: '2', action: 'Focus mode' },
    { key: '3', action: 'Break mode' },
    { key: 'F', action: 'Toggle Focus timer' },
    { key: 'B', action: 'Toggle Break timer' },
    { key: 'C', action: 'Collapse sidebar' },
  ]

  return (
    <>
      {/* Floating help button — bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '12px', right: '12px',
          width: '28px', height: '28px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-ghost)', color: 'var(--text-muted)',
          cursor: 'pointer', transition: 'var(--transition-fast)',
        }}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={12} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="floating-module"
            style={{ maxWidth: '360px', width: '90%', padding: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Keyboard size={14} style={{ color: 'var(--accent-yellow)' }} />
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Shortcuts</h3>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                <X size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {shortcuts.map(({ key, action }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{action}</span>
                  <kbd className="mono" style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, background: 'rgba(250,204,21,0.1)', color: 'var(--accent-yellow)', border: '1px solid rgba(250,204,21,0.15)' }}>{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
