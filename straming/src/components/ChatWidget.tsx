import { useState } from 'react'
import { Users } from 'lucide-react'

const CHAT_MESSAGES = [
  { user: 'CodeNinja', color: '#ef4444', msg: "Let's goo 🔥" },
  { user: 'DevMaster', color: '#22d3ee', msg: 'Consistency is the key!' },
  { user: 'AIExplorer', color: '#a78bfa', msg: 'Great explanation 💯' },
  { user: 'FocusMode', color: '#facc15', msg: 'Stay focused guys ✨' },
  { user: 'ByteBuilder', color: '#4ade80', msg: 'Which problem is this?' },
  { user: 'DevMaster', color: '#22d3ee', msg: 'Coin Change DP 🔥' },
  { user: 'CodeNinja', color: '#ef4444', msg: 'Thanks!' },
]

export function ChatWidget() {
  const [message, setMessage] = useState('')

  return (
    <div className="glass-card p-4 flex flex-col gap-3 flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="section-label" style={{ color: 'var(--accent-yellow)' }}>CHAT</span>
        <div className="flex items-center gap-1.5">
          <Users size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>128</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1" style={{ maxHeight: '180px' }}>
        {CHAT_MESSAGES.map((m, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="text-xs font-bold flex-shrink-0" style={{ color: m.color }}>{m.user}:</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.msg}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'var(--accent-yellow)', color: '#0a0a0f' }}
        >
          SEND
        </button>
      </div>
    </div>
  )
}
