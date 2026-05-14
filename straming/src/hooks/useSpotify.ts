import { useEffect } from 'react'
import { useStore } from '../store/useStore'

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
 * 
 * Setup Instructions:
 * 1. Go to https://developer.spotify.com/dashboard
 * 2. Create a new app
 * 3. Add http://localhost:5174/callback to Redirect URIs
 * 4. Copy Client ID and Client Secret to .env file
 * 5. Get your access token (see SPOTIFY_SETUP.md)
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const POLL_INTERVAL = 5000 // Poll every 5 seconds

export function useSpotify() {
  const setNowPlaying = useStore((s) => s.setNowPlaying)
  const spotifyAccessToken = useStore((s) => s.spotifyAccessToken)

  useEffect(() => {
    if (!spotifyAccessToken) {
      // No token, set to not playing
      setNowPlaying({
        name: 'Not Connected',
        artist: 'Connect Spotify',
        album: '',
        albumArt: '',
        isPlaying: false,
        progress: 0,
        duration: 0,
      })
      return
    }

    let isMounted = true

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
          headers: {
            Authorization: `Bearer ${spotifyAccessToken}`,
          },
        })

        if (!isMounted) return

        if (response.status === 204 || response.status === 404) {
          // Nothing playing
          setNowPlaying({
            name: 'Nothing Playing',
            artist: 'Spotify',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          })
          return
        }

        if (response.status === 401) {
          // Token expired
          console.error('Spotify token expired. Please refresh.')
          setNowPlaying({
            name: 'Token Expired',
            artist: 'Refresh Token',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          })
          return
        }

        if (!response.ok) {
          throw new Error(`Spotify API error: ${response.status}`)
        }

        const data = await response.json()

        if (!isMounted) return

        if (data && data.item) {
          const track: SpotifyTrack = {
            name: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(', '),
            album: data.item.album.name,
            albumArt: data.item.album.images[0]?.url || '',
            isPlaying: data.is_playing,
            progress: data.progress_ms,
            duration: data.item.duration_ms,
          }

          setNowPlaying(track)
        }
      } catch (error) {
        console.error('Error fetching Spotify data:', error)
        if (isMounted) {
          setNowPlaying({
            name: 'Connection Error',
            artist: 'Check Console',
            album: '',
            albumArt: '',
            isPlaying: false,
            progress: 0,
            duration: 0,
          })
        }
      }
    }

    // Initial fetch
    fetchNowPlaying()

    // Poll for updates
    const interval = setInterval(fetchNowPlaying, POLL_INTERVAL)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [spotifyAccessToken, setNowPlaying])
}
