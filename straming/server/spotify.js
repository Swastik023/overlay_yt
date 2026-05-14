import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TOKENS_FILE = path.join(process.cwd(), 'tokens.json');

export function getTokens() {
  if (fs.existsSync(TOKENS_FILE)) {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  }
  return null;
}

export function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

export async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    }
  });

  saveTokens(response.data);
  return response.data;
}

export async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const response = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    }
  });

  const tokens = getTokens();
  const newTokens = { ...tokens, ...response.data };
  saveTokens(newTokens);
  return newTokens.access_token;
}

export async function getCurrentlyPlaying(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.status > 400) {
      return null;
    }

    const data = response.data;
    if (!data || !data.item) return null;

    return {
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map(a => a.name).join(', '),
      albumArt: data.item.album.images[0]?.url || '',
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Unauthorized');
    }
    console.error("Error fetching Spotify playing status:", error.message);
    return null;
  }
}
