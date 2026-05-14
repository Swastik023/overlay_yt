import { useState } from 'react'
import { Users } from 'lucide-react'

export function SubscriberCount() {
  // In production, this would fetch from YouTube API
  // For now, it's editable for demo purposes
  const [count] = useState(() => {
    const saved = localStorage.getItem('subscriberCount')
    return saved ? parseInt(saved) : 2400
  })

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      title="Subscribe to join the community!"
    >
      <Users size={14} style={{ color: 'var(--accent-yellow)' }} />
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {formatCount(count)}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          subs
        </span>
      </div>
    </div>
  )
}
