# 🎵 Spotify Integration Setup Guide

This guide will help you connect your Spotify account to display real-time "Now Playing" information in your OBS overlay.

---

## 📋 Overview

The overlay uses the **Spotify Web API** to fetch currently playing track information including:
- ✅ Track name
- ✅ Artist name
- ✅ Album name
- ✅ Album artwork
- ✅ Playing status
- ✅ Animated equalizer when playing

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the details:
   - **App name:** `OBS Stream Overlay` (or any name)
   - **App description:** `Display now playing on stream`
   - **Redirect URI:** `http://localhost:5174/callback`
   - **API:** Check "Web API"
5. Click **"Save"**
6. You'll see your **Client ID** and **Client Secret**

---

### Step 2: Get Access Token

You need a Spotify access token to fetch "Now Playing" data.

#### Option A: Using Spotify Web Console (Easiest)

1. Go to [Spotify Web Console](https://developer.spotify.com/console/get-users-currently-playing-track/)
2. Click **"Get Token"**
3. Check the scope: `user-read-currently-playing` and `user-read-playback-state`
4. Click **"Request Token"**
5. Copy the **OAuth Token** (starts with `BQD...`)

#### Option B: Using Authorization Code Flow (Recommended for Production)

Create a simple auth server or use this quick method:

1. Build the authorization URL:
```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:5174/callback&scope=user-read-currently-playing%20user-read-playback-state
```

2. Replace `YOUR_CLIENT_ID` with your actual Client ID
3. Open the URL in your browser
4. Authorize the app
5. You'll be redirected to `http://localhost:5174/callback?code=...`
6. Copy the `code` parameter from the URL

7. Exchange the code for an access token:
```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=http://localhost:5174/callback" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

8. You'll receive a JSON response with `access_token` and `refresh_token`

---

### Step 3: Add Token to Overlay

#### Method 1: Browser Console (Quick Test)

1. Open your overlay in the browser: `http://localhost:5174`
2. Open Developer Console (F12)
3. Run this command:
```javascript
localStorage.setItem('stream-dashboard', JSON.stringify({
  ...JSON.parse(localStorage.getItem('stream-dashboard') || '{}'),
  state: {
    ...JSON.parse(localStorage.getItem('stream-dashboard') || '{}').state,
    spotifyAccessToken: 'YOUR_ACCESS_TOKEN_HERE'
  }
}))
```
4. Refresh the page

#### Method 2: Settings UI (Coming Soon)

We'll add a settings panel where you can paste your token directly.

---

### Step 4: Verify It's Working

1. Open Spotify and play a song
2. Check your overlay - you should see:
   - ✅ Song name
   - ✅ Artist name
   - ✅ Album artwork
   - ✅ Animated green equalizer (Spotify brand color)

---

## 🔄 Token Refresh

Spotify access tokens expire after **1 hour**. You have two options:

### Option 1: Manual Refresh (Simple)
- Get a new token from [Spotify Web Console](https://developer.spotify.com/console/get-users-currently-playing-track/)
- Update it in localStorage (see Step 3)

### Option 2: Automatic Refresh (Recommended)
- Use the `refresh_token` from Step 2B
- Implement token refresh logic (we can add this feature)

---

## 🛠️ Advanced: Automatic Token Refresh

Create a file `src/utils/spotifyAuth.ts`:

```typescript
const SPOTIFY_CLIENT_ID = 'your_client_id'
const SPOTIFY_CLIENT_SECRET = 'your_client_secret'

export async function refreshSpotifyToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  const data = await response.json()
  return data.access_token
}
```

Then update `useSpotify.ts` to automatically refresh when token expires.

---

## 🎨 Customization

### Change Equalizer Color

In `LeftSidebarNew.tsx`, find the equalizer section and change:
```typescript
background: '#1DB954', // Spotify green
```

To any color you want:
```typescript
background: '#FFC107', // Yellow (matches your theme)
background: '#FF6B6B', // Red
background: '#4ECDC4', // Cyan
```

### Hide Album Art

If you prefer just the icon, remove the album art conditional in `LeftSidebarNew.tsx`.

### Change Update Frequency

In `useSpotify.ts`, change:
```typescript
const POLL_INTERVAL = 5000 // Poll every 5 seconds
```

To update more or less frequently (in milliseconds).

---

## 🐛 Troubleshooting

### "Not Connected" showing
- ✅ Check if you added the access token
- ✅ Verify token is not expired (tokens last 1 hour)
- ✅ Check browser console for errors

### "Token Expired" showing
- ✅ Get a new token from Spotify Web Console
- ✅ Or implement automatic refresh (see Advanced section)

### "Nothing Playing" showing
- ✅ Make sure Spotify is actually playing music
- ✅ Check if Spotify is playing on the correct device
- ✅ Try playing/pausing the track

### "Connection Error" showing
- ✅ Check your internet connection
- ✅ Verify the access token is correct
- ✅ Check browser console for detailed error messages

### Album art not showing
- ✅ Some tracks don't have album art
- ✅ Check if the track has artwork in Spotify app
- ✅ Verify API response includes `album.images` array

---

## 📚 API Reference

### Spotify Web API Endpoints Used

**Get Currently Playing Track:**
```
GET https://api.spotify.com/v1/me/player/currently-playing
```

**Required Scopes:**
- `user-read-currently-playing`
- `user-read-playback-state`

**Response:**
```json
{
  "item": {
    "name": "Song Name",
    "artists": [{ "name": "Artist Name" }],
    "album": {
      "name": "Album Name",
      "images": [{ "url": "https://..." }]
    },
    "duration_ms": 180000
  },
  "is_playing": true,
  "progress_ms": 45000
}
```

---

## 🔐 Security Notes

### ⚠️ Important Security Considerations:

1. **Never commit tokens to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables for production

2. **Token Storage**
   - Tokens are stored in localStorage (browser only)
   - Not accessible from OBS Browser Source
   - Safe for local development

3. **Client Secret**
   - Never expose client secret in frontend code
   - Use a backend server for production
   - Or use PKCE flow (no client secret needed)

### Production Setup:

For production streaming, consider:
1. Backend server to handle token refresh
2. PKCE authorization flow (more secure)
3. Environment variables for credentials
4. Token encryption in storage

---

## 🎯 Alternative: OBS Tuna Plugin

If you prefer a plugin-based solution instead of API integration:

1. Install [Tuna Plugin](https://github.com/univrsal/tuna)
2. Configure it to read from Spotify
3. Use text sources in OBS to display track info

**Pros:**
- No API setup needed
- Works with multiple media players
- Native OBS integration

**Cons:**
- Requires OBS plugin installation
- Less customization
- No album artwork support

---

## 📖 Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)
- [Spotify Web Console](https://developer.spotify.com/console/)
- [OBS Tuna Plugin](https://github.com/univrsal/tuna)

---

## 🎉 You're All Set!

Your overlay should now display real-time Spotify information. Enjoy streaming with live music updates! 🎵

If you encounter any issues, check the troubleshooting section or open an issue on GitHub.

---

**Last Updated:** May 12, 2026  
**Version:** 1.0.0
