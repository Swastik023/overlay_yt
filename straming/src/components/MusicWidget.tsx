import { Music } from 'lucide-react'
import { useBridgeStore } from '../store/useBridgeStore'

export function MusicWidget() {
  const { nowPlaying, connected } = useBridgeStore()

  // Disconnected or not playing
  if (!connected || !nowPlaying) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--accent-yellow)' }}>
          NOW PLAYING
        </span>
        <div className="flex items-center gap-2 py-2 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(250,204,21,0.15)' }}>
            <Music size={20} style={{ color: 'var(--accent-yellow)', opacity: 0.6 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Not Playing</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Spotify Paused</p>
          </div>
        </div>
      </div>
    )
  }

  const { title, artist, albumArt } = nowPlaying

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--accent-yellow)' }}>
        NOW PLAYING
      </span>
      <div className="flex items-center gap-2 py-2 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {/* Album Art */}
        <div
          className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: albumArt ? `url(${albumArt})` : 'none',
            background: albumArt ? undefined : 'rgba(250,204,21,0.15)',
            border: '2px solid rgba(250,204,21,0.3)',
          }}
        >
          {!albumArt && (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={20} style={{ color: 'var(--accent-yellow)' }} />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {artist}
          </p>
        </div>

        {/* Equalizer Bars */}
        <div className="flex items-end gap-0.5 h-5 flex-shrink-0">
          {[12, 8, 14, 10, 7].map((h, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full"
              style={{
                height: `${h}px`,
                background: 'var(--accent-yellow)',
                animation: 'eq-bounce 0.8s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
