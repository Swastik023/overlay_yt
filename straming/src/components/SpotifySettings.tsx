import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Music2, Check, X, ExternalLink, Zap } from 'lucide-react'
import { startSpotifyAuth, hasSpotifyCredentials } from '../utils/spotifyAuth'

export function SpotifySettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState('')
  const [useOAuth, setUseOAuth] = useState(true)
  const spotifyAccessToken = useStore((s) => s.spotifyAccessToken)
  const setSpotifyAccessToken = useStore((s) => s.setSpotifyAccessToken)
  const setSpotifyRefreshToken = useStore((s) => s.setSpotifyRefreshToken)
  const nowPlaying = useStore((s) => s.nowPlaying)

  const hasCredentials = hasSpotifyCredentials()

  const handleOAuthConnect = async () => {
    try {
      await startSpotifyAuth()
    } catch (error) {
      console.error('OAuth error:', error)
      alert('Failed to start OAuth flow. Check console for details.')
    }
  }

  const handleManualSave = () => {
    if (token.trim()) {
      setSpotifyAccessToken(token.trim())
      setToken('')
      setIsOpen(false)
    }
  }

  const handleDisconnect = () => {
    setSpotifyAccessToken(null)
    setSpotifyRefreshToken(null)
    setToken('')
    localStorage.removeItem('spotify_token_expires_at')
  }

  const isConnected = !!spotifyAccessToken && nowPlaying.name !== 'Not Connected' && nowPlaying.name !== 'Token Expired'

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: isConnected ? '#1DB954' : 'rgba(255, 193, 7, 0.2)',
          border: isConnected ? '2px solid #1DB954' : '2px solid rgba(255, 193, 7, 0.4)',
          color: isConnected ? '#ffffff' : '#FFC107',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
        }}
        title="Spotify Settings"
      >
        <Music2 size={24} />
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        background: 'rgba(15, 15, 20, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Music2 size={20} color="#1DB954" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            Spotify Integration
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          padding: '12px',
          background: isConnected ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 193, 7, 0.1)',
          border: isConnected ? '1px solid rgba(29, 185, 84, 0.3)' : '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isConnected ? (
          <>
            <Check size={16} color="#1DB954" />
            <span style={{ fontSize: '12px', color: '#1DB954', fontWeight: 600 }}>
              Connected - Now Playing: {nowPlaying.name}
            </span>
          </>
        ) : (
          <>
            <X size={16} color="#FFC107" />
            <span style={{ fontSize: '12px', color: '#FFC107', fontWeight: 600 }}>
              Not Connected
            </span>
          </>
        )}
      </div>

      {/* Instructions */}
      <div style={{ marginBottom: '16px' }}>
        {hasCredentials && useOAuth ? (
          <>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              Click the button below to connect your Spotify account using OAuth (recommended):
            </p>
            <button
              onClick={handleOAuthConnect}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1DB954',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Zap size={16} />
              Connect with Spotify OAuth
            </button>
            <button
              onClick={() => setUseOAuth(false)}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '8px',
                background: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Or use manual token →
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 8px 0', lineHeight: '1.5' }}>
              To connect Spotify manually, you need an access token:
            </p>
            <ol style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Go to Spotify Developer Console</li>
              <li>Click "Get Token" and authorize</li>
              <li>Copy the OAuth Token</li>
              <li>Paste it below</li>
            </ol>
            <a
              href="https://developer.spotify.com/console/get-users-currently-playing-track/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#1DB954',
                textDecoration: 'none',
                marginTop: '8px',
              }}
            >
              Open Spotify Console <ExternalLink size={12} />
            </a>
            {hasCredentials && (
              <button
                onClick={() => setUseOAuth(true)}
                style={{
                  display: 'block',
                  marginTop: '8px',
                  padding: '4px',
                  background: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ← Back to OAuth
              </button>
            )}
          </>
        )}
      </div>

      {/* Token Input - Only show if not using OAuth or no credentials */}
      {(!hasCredentials || !useOAuth) && !isConnected && (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Access Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your Spotify access token here..."
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isConnected && (!hasCredentials || !useOAuth) ? (
          <button
            onClick={handleManualSave}
            disabled={!token.trim()}
            style={{
              flex: 1,
              padding: '10px',
              background: token.trim() ? '#1DB954' : 'rgba(255, 255, 255, 0.1)',
              color: token.trim() ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: token.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            Connect Spotify
          </button>
        ) : isConnected ? (
          <button
            onClick={handleDisconnect}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255, 59, 48, 0.2)',
              color: '#FF3B30',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Disconnect
          </button>
        ) : null}
      </div>

      {/* Help Link */}
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <a
          href="/SPOTIFY_SETUP.md"
          target="_blank"
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            textDecoration: 'none',
          }}
        >
          Need help? Read the setup guide →
        </a>
      </div>
    </div>
  )
}
