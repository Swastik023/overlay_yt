/**
 * WebSocket connection hook for Focus Timer bridge
 * 
 * CRITICAL FOR OBS: Handles reconnection with exponential backoff
 * Maintains last known state during disconnection
 * 
 * Uses a MODULE-LEVEL SINGLETON WebSocket so multiple React components
 * (App, LeftSidebarNew, etc.) share a single connection.
 * 
 * Client-side interpolation keeps the timer visually smooth.
 * The bridge delivers D-Bus state ~1/s, but IPC latency can cause jitter.
 * A local 100ms interval counts down `remaining` between updates so the
 * displayed time never appears to stutter or lag.
 * 
 * Also relays Spotify data through the bridge so OBS (which has isolated
 * localStorage and can't authenticate with Spotify) can receive track data
 * from the authenticated browser overlay.
 */

import { useSyncExternalStore } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface TimerState {
  state: 'stopped' | 'pomodoro' | 'short-break' | 'long-break' | 'break';
  duration: number;
  elapsed: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startedTime: number;
  pausedTime: number;
  finishedTime: number;
  lastChangedTime: number;
}

export interface SessionState {
  currentState: string;
  startTime: number;
  endTime: number;
  hasUniformBreaks: boolean;
  canReset: boolean;
}

export interface SpotifyData {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

export interface BridgeState {
  timer: TimerState | null;
  session: SessionState | null;
  spotify: SpotifyData | null;
  connectionStatus: ConnectionStatus;
}

const BRIDGE_URL = 'ws://localhost:8080';
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;
const INTERPOLATION_INTERVAL = 100;

// ─── Module-level singleton state ────────────────────────────────────────────
// Only ONE WebSocket connection is opened, shared by all hook consumers.

type Listener = () => void;
const listeners = new Set<Listener>();

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let retryDelay = INITIAL_RETRY_DELAY;
let connectionCount = 0;

// Authoritative state from the bridge
let bridgeTimer: TimerState | null = null;
let bridgeReceivedAt = 0;
let currentSession: SessionState | null = null;
let currentConnectionStatus: ConnectionStatus = 'disconnected';
let currentSpotify: SpotifyData | null = null;

// Interpolated display timer (updated every 100ms)
let currentDisplayTimer: TimerState | null = null;
let interpolationInterval: ReturnType<typeof setInterval> | null = null;

// CRITICAL: Cached snapshot object for useSyncExternalStore.
// Must return the SAME reference unless data actually changed.
let cachedSnapshot: BridgeState = {
  timer: null,
  session: null,
  spotify: null,
  connectionStatus: 'disconnected',
};

function buildSnapshot(): BridgeState {
  // Only create a new object if something actually changed
  if (
    cachedSnapshot.timer === currentDisplayTimer &&
    cachedSnapshot.session === currentSession &&
    cachedSnapshot.spotify === currentSpotify &&
    cachedSnapshot.connectionStatus === currentConnectionStatus
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    timer: currentDisplayTimer,
    session: currentSession,
    spotify: currentSpotify,
    connectionStatus: currentConnectionStatus,
  };
  return cachedSnapshot;
}

function notify() {
  buildSnapshot();
  listeners.forEach(l => l());
}

function getSnapshot(): BridgeState {
  return cachedSnapshot;
}

function interpolate() {
  const base = bridgeTimer;
  if (!base || !base.isRunning) {
    if (base && currentDisplayTimer !== base) {
      currentDisplayTimer = base;
      notify();
    }
    return;
  }

  const elapsed = (performance.now() - bridgeReceivedAt) / 1000;
  const newRemaining = Math.max(0, base.remaining - elapsed);

  // Only update if the rounded second actually changed (avoids 10 re-renders/s)
  if (
    currentDisplayTimer &&
    Math.floor(currentDisplayTimer.remaining) === Math.floor(newRemaining)
  ) {
    return;
  }

  const newElapsed = Math.min(base.duration, base.elapsed + elapsed);
  const newProgress = base.duration > 0
    ? Math.min(1, newElapsed / base.duration)
    : base.progress;

  currentDisplayTimer = {
    ...base,
    remaining: newRemaining,
    elapsed: newElapsed,
    progress: newProgress,
  };
  notify();
}

function connect() {
  if (ws) return;

  try {
    const socket = new WebSocket(BRIDGE_URL);
    ws = socket;

    socket.onopen = () => {
      console.log('[Bridge] Connected to bridge ✓');
      currentConnectionStatus = 'connected';
      retryDelay = INITIAL_RETRY_DELAY;
      notify();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'timerState') {
          bridgeTimer = message.data.timer;
          bridgeReceivedAt = performance.now();
          currentDisplayTimer = bridgeTimer;
          currentSession = message.data.session;
          notify();
        } else if (message.type === 'spotifyUpdate') {
          // Spotify data relayed through the bridge (from authenticated browser client)
          currentSpotify = message.data;
          notify();
        } else if (message.type === 'offline') {
          console.warn('[Bridge] Focus Timer offline:', message.data.reason);
          currentConnectionStatus = 'disconnected';
          notify();
        }
      } catch (error) {
        console.error('[Bridge] Failed to parse message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('[Bridge] WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('[Bridge] Disconnected from bridge');
      ws = null;
      currentConnectionStatus = 'reconnecting';
      notify();

      if (connectionCount > 0) {
        const delay = Math.min(retryDelay, MAX_RETRY_DELAY);
        console.log(`[Bridge] Reconnecting in ${delay}ms...`);
        reconnectTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
          reconnectTimeout = null;
          connect();
        }, delay);
      }
    };
  } catch (error) {
    console.error('[Bridge] Failed to create WebSocket:', error);
    ws = null;
    currentConnectionStatus = 'reconnecting';
    notify();

    if (connectionCount > 0) {
      const delay = Math.min(retryDelay, MAX_RETRY_DELAY);
      reconnectTimeout = setTimeout(() => {
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
        reconnectTimeout = null;
        connect();
      }, delay);
    }
  }
}

function startInterpolation() {
  if (!interpolationInterval) {
    interpolationInterval = setInterval(interpolate, INTERPOLATION_INTERVAL);
  }
}

function stopInterpolation() {
  if (interpolationInterval) {
    clearInterval(interpolationInterval);
    interpolationInterval = null;
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  connectionCount++;

  // First subscriber → open connection + start interpolation
  if (connectionCount === 1) {
    connect();
    startInterpolation();
  }

  return () => {
    listeners.delete(listener);
    connectionCount--;

    // Last subscriber → tear down
    if (connectionCount === 0) {
      stopInterpolation();

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    }
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Send Spotify track data to the bridge for relay to other clients (OBS).
 * Called by the useSpotify hook when it successfully fetches a track.
 */
export function sendSpotifyToBridge(data: SpotifyData): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'spotifyUpdate', data }));
  }
}

/**
 * Connect to Focus Timer bridge and receive timer + Spotify state updates.
 * Multiple components calling this hook share a single WebSocket connection.
 */
export function useFocusTimerBridge(): BridgeState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
