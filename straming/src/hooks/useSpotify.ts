import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { refreshAccessToken } from '../utils/spotifyAuth'
import { sendSpotifyToBridge, useFocusTimerBridge } from './useFocusTimerBridge'

interface SpotifyTrack {
  name: string
  artist: string
  album: string
  albumArt: string
  isPlaying: boolean
  progress: number
  duration: number
}

/**
 * Spotify Web API Integration Hook
 * 
 * This hook fetches the currently playing track from Spotify.
 * It automatically refreshes expired tokens using the stored refresh token.
 * 
 * Setup Instructions:
 * 1. Go to https://developer.spotify.com/dashboard
 * 2. Create a new app
 * 3. Add http://127.0.0.1:5173/ to Redirect URIs
 * 4. Copy Client ID and Client Secret to .env file
 * 5. Connect via the Spotify Settings panel in the overlay
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const POLL_INTERVAL = 5000 // Poll every 5 seconds

export function useSpotify() {
  const setNowPlaying = useStore((s) => s.setNowPlaying)
  const spotifyAccessToken = useStore((s) => s.spotifyAccessToken)
  const spotifyRefreshToken = useStore((s) => s.spotifyRefreshToken)
  const setSpotifyAccessToken = useStore((s) => s.setSpotifyAccessToken)
  const setSpotifyRefreshToken = useStore((s) => s.setSpotifyRefreshToken)

  // Use refs to avoid re-triggering the effect when tokens change during refresh
  const accessTokenRef = useRef(spotifyAccessToken)
  const refreshTokenRef = useRef(spotifyRefreshToken)
  const isRefreshingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => {
    accessTokenRef.current = spotifyAccessToken
  }, [spotifyAccessToken])

  useEffect(() => {
    refreshTokenRef.current = spotifyRefreshToken
  }, [spotifyRefreshToken])

  // Subscribe to bridge state to receive Spotify data (for OBS mode)
  const { spotify: bridgeSpotify } = useFocusTimerBridge()

  // Update store when bridge sends new Spotify data
  // This is how the OBS browser source gets the data
  useEffect(() => {
    if (!spotifyAccessToken && bridgeSpotify) {
      setNowPlaying(bridgeSpotify)
    }
  }, [bridgeSpotify, spotifyAccessToken, setNowPlaying])

  useEffect(() => {
    if (!spotifyAccessToken) {
      // No token, set to not playing (unless bridge has data)
      if (!bridgeSpotify) {
        setNowPlaying({
          name: 'Not Connected',
          artist: 'Connect Spotify',
          album: '',
          albumArt: '',
          isPlaying: false,
          progress: 0,
          duration: 0,
        })
      }
      return
    }

    let isMounted = true

    /**
     * Attempt to refresh the access token using the stored refresh token.
     * Returns the new access token on success, or null on failure.
     */
    const tryRefreshToken = async (): Promise<string | null> => {
      const refreshToken = refreshTokenRef.current
      if (!refreshToken || isRefreshingRef.current) return null

      isRefreshingRef.current = true
      console.log('[Spotify] Token expired, attempting refresh...')

      try {
        const tokens = await refreshAccessToken(refreshToken)

        if (!isMounted) return null

        // Update tokens in store
        setSpotifyAccessToken(tokens.access_token)
        accessTokenRef.current = tokens.access_token

        if (tokens.refresh_token) {
          setSpotifyRefreshToken(tokens.refresh_token)
          refreshTokenRef.current = tokens.refresh_token
        }

        // Update expiration time
        const expiresAt = Date.now() + tokens.expires_in * 1000
        localStorage.setItem('spotify_token_expires_at', expiresAt.toString())

        console.log('[Spotify] Token refreshed successfully ✓')
        return tokens.access_token
      } catch (error) {
        console.error('[Spotify] Token refresh failed:', error)
        if (isMounted) {
          // Refresh failed — clear tokens so user can re-authenticate
          setSpotifyAccessToken(null)
          setSpotifyRefreshToken(null)
          localStorage.removeItem('spotify_token_expires_at')
        }
        return null
      } finally {
        isRefreshingRef.current = false
      }
    }

    const fetchNowPlaying = async () => {
      const token = accessTokenRef.current
      if (!token) return

      try {
        let response = await fetch(`${SPOTIFY_API_BASE}/me/player?additional_types=track,episode`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!isMounted) return

        // Handle token expiration with auto-refresh
        if (response.status === 401) {
          const newToken = await tryRefreshToken()
          if (!newToken || !isMounted) return

          // Retry with the new token
          response = await fetch(`${SPOTIFY_API_BASE}/me/player?additional_types=track,episode`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          })

          if (!isMounted) return
        }

        if (response.status === 204 || response.status === 404) {
          // Nothing playing
          const emptyTrack = {
            name: 'Nothing Playing',
            artist: 'Spotify',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          }
          setNowPlaying(emptyTrack)
          sendSpotifyToBridge(emptyTrack)
          return
        }

        if (response.status === 401) {
          // Still 401 after refresh — token is truly dead
          console.error('[Spotify] Token invalid even after refresh')
          const expiredTrack = {
            name: 'Token Expired',
            artist: 'Re-authenticate',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          }
          setNowPlaying(expiredTrack)
          sendSpotifyToBridge(expiredTrack)
          return
        }

        if (!response.ok) {
          throw new Error(`Spotify API error: ${response.status}`)
        }

        const data = await response.json()

        if (!isMounted) return

        if (data && data.item) {
          const isEpisode = data.currently_playing_type === 'episode';
          const track: SpotifyTrack = {
            name: data.item.name || 'Unknown Track',
            artist: isEpisode ? (data.item.show?.name || 'Podcast') : (data.item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist'),
            album: isEpisode ? (data.item.show?.publisher || '') : (data.item.album?.name || ''),
            albumArt: isEpisode ? (data.item.images?.[0]?.url || data.item.show?.images?.[0]?.url || '') : (data.item.album?.images?.[0]?.url || ''),
            isPlaying: data.is_playing,
            progress: data.progress_ms,
            duration: data.item.duration_ms,
          }

          setNowPlaying(track)
          sendSpotifyToBridge(track)
        }
      } catch (error) {
        console.error('[Spotify] Error fetching now playing:', error)
        if (isMounted) {
          const errorTrack = {
            name: 'Connection Error',
            artist: 'Check Console',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          }
          setNowPlaying(errorTrack)
          sendSpotifyToBridge(errorTrack)
        }
      }
    }

    // Proactive refresh: if token is about to expire, refresh before polling
    const maybeProactiveRefresh = async () => {
      const expiresAtStr = localStorage.getItem('spotify_token_expires_at')
      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10)
        const timeUntilExpiry = expiresAt - Date.now()
        // Refresh if less than 5 minutes remaining
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('[Spotify] Token expiring soon, proactively refreshing...')
          await tryRefreshToken()
        }
      }
    }

    // Initial fetch (with proactive refresh check)
    maybeProactiveRefresh().then(() => {
      if (isMounted) fetchNowPlaying()
    })

    // Poll for updates
    const interval = setInterval(fetchNowPlaying, POLL_INTERVAL)

    // Proactive refresh check every 4 minutes
    const refreshCheckInterval = setInterval(maybeProactiveRefresh, 4 * 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
      clearInterval(refreshCheckInterval)
    }
  }, [spotifyAccessToken, setNowPlaying, setSpotifyAccessToken, setSpotifyRefreshToken])
}
