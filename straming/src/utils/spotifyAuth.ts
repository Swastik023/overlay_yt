/**
 * Spotify OAuth Authentication Utility
 * 
 * This module handles Spotify authentication using the Authorization Code Flow with PKCE.
 * It manages token generation, refresh, and storage.
 * 
 * Note: Spotify requires loopback IP (127.0.0.1) instead of localhost for redirect URIs
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || ''

// Use loopback IP address (127.0.0.1) as required by Spotify's new strict security policies.
// 'localhost' is explicitly not allowed.
// IMPORTANT: Add http://127.0.0.1:5173/ as a Redirect URI in your Spotify Developer Dashboard.
const getRedirectUri = () => {
  const port = window.location.port || '5173'
  return `http://127.0.0.1:${port}/`
}

const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
].join(' ')

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

/**
 * Generate a random string for PKCE code verifier
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

/**
 * Generate SHA256 hash for PKCE code challenge
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

/**
 * Base64 URL encode for PKCE
 */
function base64urlencode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const base64 = btoa(String.fromCharCode(...bytes))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Start the Spotify OAuth flow
 * Redirects user to Spotify authorization page
 */
export async function startSpotifyAuth(): Promise<void> {
  const codeVerifier = generateRandomString(64)
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64urlencode(hashed)

  // Store code verifier for later use
  localStorage.setItem('spotify_code_verifier', codeVerifier)

  const redirectUri = getRedirectUri()
  
  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('scope', SCOPES)
  authUrl.searchParams.append('code_challenge_method', 'S256')
  authUrl.searchParams.append('code_challenge', codeChallenge)

  window.location.href = authUrl.toString()
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const codeVerifier = localStorage.getItem('spotify_code_verifier')
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please restart the auth flow.')
  }

  const redirectUri = getRedirectUri()

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
  }

  const data: TokenResponse = await response.json()
  
  // Clean up code verifier
  localStorage.removeItem('spotify_code_verifier')
  
  return data
}

/**
 * Refresh an expired access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`)
  }

  return await response.json()
}

/**
 * Get a simple access token using Client Credentials flow
 * Note: This flow doesn't support user-specific endpoints like "currently playing"
 * Use Authorization Code flow instead for full functionality
 */
export async function getClientCredentialsToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Client credentials failed: ${error.error_description || error.error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Check if credentials are configured
 */
export function hasSpotifyCredentials(): boolean {
  return !!(SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET)
}

/**
 * Get the authorization URL for manual flow
 */
export function getAuthorizationUrl(): string {
  const redirectUri = getRedirectUri()
  
  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('scope', SCOPES)
  
  return authUrl.toString()
}
