import express from 'express';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import { exchangeCodeForTokens, getCurrentlyPlaying, getTokens, refreshAccessToken } from './spotify.js';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());

const PORT = 4000;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:4000/callback';

let currentTrackInfo = null;

app.get('/login', (req, res) => {
  const scope = 'user-read-currently-playing user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    }).toString()
  );
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.send('No code provided');
  }

  try {
    await exchangeCodeForTokens(code, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI);
    res.send('Successfully authenticated with Spotify! You can close this window.');
  } catch (error) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error('Error during token exchange:', errorDetails);
    res.send(`Error authenticating with Spotify: ${errorDetails}`);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Bridge Server running on http://localhost:${PORT}`);
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error("WARNING: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing from .env");
  }
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  if (currentTrackInfo) {
    ws.send(JSON.stringify({ type: 'SPOTIFY_UPDATE', data: currentTrackInfo }));
  }

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

setInterval(async () => {
  let tokens = getTokens();
  if (!tokens || !tokens.access_token) return;

  try {
    const track = await getCurrentlyPlaying(tokens.access_token);
    
    // Only broadcast if something changed to avoid spam? 
    // For now always broadcast to keep progress synced
    currentTrackInfo = track;
    broadcast({ type: 'SPOTIFY_UPDATE', data: track });
  } catch (error) {
    if (error.message === 'Unauthorized' && tokens.refresh_token) {
      console.log("Token expired, refreshing...");
      try {
        await refreshAccessToken(tokens.refresh_token, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError.message);
      }
    }
  }
}, 2000);
