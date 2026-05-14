import { create } from 'zustand';

export interface TrackInfo {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArt: string;
  progressMs: number;
  durationMs: number;
}

interface BridgeState {
  connected: boolean;
  nowPlaying: TrackInfo | null;
  connect: () => void;
  disconnect: () => void;
}

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout>;

export const useBridgeStore = create<BridgeState>((set, get) => ({
  connected: false,
  nowPlaying: null,

  connect: () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => {
      console.log('Connected to local bridge');
      set({ connected: true });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SPOTIFY_UPDATE') {
          set({ nowPlaying: message.data });
        }
      } catch (err) {
        console.error('Failed to parse bridge message', err);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from local bridge. Reconnecting in 3s...');
      set({ connected: false });
      ws = null;
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        get().connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws?.close();
    };
  },

  disconnect: () => {
    clearTimeout(reconnectTimeout);
    if (ws) {
      ws.close();
      ws = null;
    }
    set({ connected: false });
  }
}));
