import { useEffect, useState } from 'react'
import { TopHeader } from './components/TopHeader'
import { LeftSidebarNew } from './components/LeftSidebarNew'
import { SpotifySettings } from './components/SpotifySettings'
import { useBridgeStore } from './store/useBridgeStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useSpotify } from './hooks/useSpotify'
import { exchangeCodeForToken } from './utils/spotifyAuth'
import { useStore } from './store/useStore'
import { useFocusTimerBridge } from './hooks/useFocusTimerBridge'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function App() {
  const connect = useBridgeStore(s => s.connect)
  const [callbackStatus, setCallbackStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [callbackMessage, setCallbackMessage] = useState('')
  const setSpotifyAccessToken = useStore((s) => s.setSpotifyAccessToken)
  const setSpotifyRefreshToken = useStore((s) => s.setSpotifyRefreshToken)

  // Get timer state for theming
  const { timer } = useFocusTimerBridge()
  const timerMode: 'focus' | 'break' = timer?.state === 'pomodoro' ? 'focus' : 'break'

  useEffect(() => {
    connect()

    // Auto-detect OBS mode via URL param
    const params = new URLSearchParams(window.location.search)
    if (params.get('obs') === 'true') {
      document.body.classList.add('obs-mode')
    }

    // Handle Spotify OAuth callback
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      setCallbackStatus('error')
      setCallbackMessage(`Authorization failed: ${error}`)
      // Clear URL params after 3 seconds
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname)
        setCallbackStatus('idle')
      }, 3000)
    } else if (code) {
      setCallbackStatus('loading')
      setCallbackMessage('Connecting to Spotify...')

      // Exchange code for tokens
      exchangeCodeForToken(code)
        .then((tokens) => {
          setSpotifyAccessToken(tokens.access_token)
          if (tokens.refresh_token) {
            setSpotifyRefreshToken(tokens.refresh_token)
          }
          
          // Store expiration time
          const expiresAt = Date.now() + tokens.expires_in * 1000
          localStorage.setItem('spotify_token_expires_at', expiresAt.toString())

          setCallbackStatus('success')
          setCallbackMessage('Successfully connected to Spotify!')

          // Clear URL params and reset status after 2 seconds
          setTimeout(() => {
            window.history.replaceState({}, '', window.location.pathname)
            setCallbackStatus('idle')
          }, 2000)
        })
        .catch((err) => {
          console.error('Spotify callback error:', err)
          setCallbackStatus('error')
          setCallbackMessage(err instanceof Error ? err.message : 'Failed to connect to Spotify')

          // Clear URL params after 3 seconds
          setTimeout(() => {
            window.history.replaceState({}, '', window.location.pathname)
            setCallbackStatus('idle')
          }, 3000)
        })
    }
  }, [connect, setSpotifyAccessToken, setSpotifyRefreshToken])

  useKeyboardShortcuts()
  useSpotify() // Initialize Spotify integration

  // Show callback status overlay
  if (callbackStatus !== 'idle') {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            padding: '40px',
            background: 'rgba(15, 15, 20, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            {callbackStatus === 'loading' && (
              <Loader2
                size={48}
                color="#1DB954"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {callbackStatus === 'success' && <CheckCircle size={48} color="#1DB954" />}
            {callbackStatus === 'error' && <XCircle size={48} color="#FF3B30" />}
          </div>

          {/* Title */}
          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {callbackStatus === 'loading' && 'Connecting...'}
            {callbackStatus === 'success' && 'Success!'}
            {callbackStatus === 'error' && 'Error'}
          </h2>

          {/* Message */}
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.6',
            }}
          >
            {callbackMessage}
          </p>

          {/* Redirect message */}
          {(callbackStatus === 'success' || callbackStatus === 'error') && (
            <p
              style={{
                marginTop: '16px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Redirecting...
            </p>
          )}
        </div>

        {/* Spinner animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      id="overlay-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0a0a0f',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header */}
      <TopHeader timerMode={timerMode} />

      {/* Left Sidebar */}
      <LeftSidebarNew />

      {/* Center area is transparent for screen capture */}
      <div
        style={{
          position: 'absolute',
          top: '141px',
          left: '251px',
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.1)',
          fontSize: '14px',
          fontWeight: 300,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        SCREEN CAPTURE AREA
      </div>



      {/* Spotify Settings - Hidden in OBS mode */}
      {!document.body.classList.contains('obs-mode') && <SpotifySettings />}
    </div>
  )
}
