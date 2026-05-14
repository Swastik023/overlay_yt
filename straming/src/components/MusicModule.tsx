import { Music } from 'lucide-react'
import { useBridgeStore } from '../store/useBridgeStore'

export function MusicModule() {
  const { nowPlaying, connected } = useBridgeStore()

  if (!connected || !nowPlaying) {
    return (
      <div className="floating-module rail-module">
        <div className="rail-module-label">NOW PLAYING</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div className="music-art-mini" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music size={11} style={{ color: 'var(--accent-yellow)', opacity: 0.25 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>Not Playing</p>
          </div>
        </div>
      </div>
    )
  }

  const { title, artist, albumArt } = nowPlaying

  return (
    <div className="floating-module rail-module">
      <div className="rail-module-label">NOW PLAYING</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div className="music-art-mini" style={albumArt ? { backgroundImage: `url(${albumArt})` } : undefined}>
          {!albumArt && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={11} style={{ color: 'var(--accent-yellow)' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '8px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
          <p style={{ fontSize: '6px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist}</p>
        </div>
        {/* Mini equalizer */}
        <div style={{ display: 'flex', alignItems: 'end', gap: '1px', height: '10px' }}>
          {[7, 4, 9, 6].map((h, i) => (
            <div key={i} className="eq-bar-mini" style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
