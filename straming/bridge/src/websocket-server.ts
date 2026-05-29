/**
 * WebSocket server for Focus Timer bridge service
 * Broadcasts timer state to connected overlays
 * 
 * CRITICAL: OBS browser sources need FAST reconnection and instant state
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { TimerState, SessionState } from './types.js';

/**
 * Message types sent to overlay clients
 */
export interface TimerStateMessage {
  type: 'timerState';
  data: {
    timer: TimerState;
    session: SessionState;
  };
}

export interface OfflineMessage {
  type: 'offline';
  data: {
    reason: 'focus-timer-not-running' | 'dbus-connection-lost';
  };
}

export interface SpotifyUpdateMessage {
  type: 'spotifyUpdate';
  data: {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    isPlaying: boolean;
    progress: number;
    duration: number;
  };
}

export type BridgeMessage = TimerStateMessage | OfflineMessage | SpotifyUpdateMessage;

/**
 * WebSocket server for overlay connections
 */
export class BridgeWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private port: number;
  private cachedSpotifyData: SpotifyUpdateMessage['data'] | null = null;

  constructor(port: number = 8080) {
    this.port = port;
    this.wss = new WebSocketServer({ 
      port,
      host: 'localhost' // localhost only for security
    });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.wss.on('error', (error: Error) => {
      console.error('[WebSocketServer] Server error:', error);
    });
  }

  /**
   * Handle new client connection
   * CRITICAL: Send current state immediately for OBS reload stability
   */
  private handleConnection(ws: WebSocket): void {
    console.log('[WebSocketServer] New overlay connected');
    
    this.clients.add(ws);

    // Send cached Spotify data immediately to new connections (critical for OBS)
    if (this.cachedSpotifyData) {
      this.sendToClient(ws, {
        type: 'spotifyUpdate',
        data: this.cachedSpotifyData,
      });
    }

    // Handle incoming messages from clients (e.g. Spotify data relay)
    ws.on('message', (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === 'spotifyUpdate' && message.data) {
          // Cache and relay Spotify data to all OTHER clients
          this.cachedSpotifyData = message.data;
          this.relayToOthers(ws, message);
        }
      } catch (error) {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      console.log('[WebSocketServer] Overlay disconnected');
      this.clients.delete(ws);
    });

    ws.on('error', (error: Error) => {
      console.error('[WebSocketServer] Client error:', error);
      this.clients.delete(ws);
    });

    // Note: Current state will be sent by the caller after connection
    // This keeps the WebSocket server decoupled from state management
  }

  /**
   * Broadcast timer state to all connected overlays
   * @param timer Current timer state
   * @param session Current session state
   */
  broadcastState(timer: TimerState, session: SessionState): void {
    const message: TimerStateMessage = {
      type: 'timerState',
      data: { timer, session }
    };

    this.broadcast(message);
  }

  /**
   * Broadcast offline status to all connected overlays
   * @param reason Why Focus Timer is offline
   */
  broadcastOffline(reason: 'focus-timer-not-running' | 'dbus-connection-lost'): void {
    const message: OfflineMessage = {
      type: 'offline',
      data: { reason }
    };

    this.broadcast(message);
  }

  /**
   * Send message to a specific client
   * @param ws WebSocket client
   * @param message Message to send
   */
  sendToClient(ws: WebSocket, message: BridgeMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[WebSocketServer] Failed to send to client:', error);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   * @param message Message to broadcast
   */
  private broadcast(message: BridgeMessage): void {
    const payload = JSON.stringify(message);
    let successCount = 0;
    let failCount = 0;

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          successCount++;
        } catch (error) {
          console.error('[WebSocketServer] Failed to send to client:', error);
          failCount++;
        }
      }
    });

    if (successCount > 0) {
      console.log(`[WebSocketServer] Broadcasted to ${successCount} overlay(s)`);
    }
    if (failCount > 0) {
      console.warn(`[WebSocketServer] Failed to send to ${failCount} client(s)`);
    }
  }

  /**
   * Relay a message to all clients EXCEPT the sender.
   * Used for Spotify data: browser sends → bridge relays → OBS receives.
   */
  private relayToOthers(sender: WebSocket, message: BridgeMessage): void {
    const payload = JSON.stringify(message);
    let relayCount = 0;

    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
          relayCount++;
        } catch (error) {
          console.error('[WebSocketServer] Failed to relay to client:', error);
        }
      }
    });

    if (relayCount > 0) {
      console.log(`[WebSocketServer] Relayed Spotify data to ${relayCount} overlay(s)`);
    }
  }

  /**
   * Get list of connected clients (for new connection state delivery)
   */
  getClients(): Set<WebSocket> {
    return this.clients;
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close all connections and shut down server
   */
  async close(): Promise<void> {
    console.log('[WebSocketServer] Closing all connections...');

    // Close all client connections
    this.clients.forEach((client) => {
      try {
        client.close(1000, 'Server shutting down');
      } catch (error) {
        console.error('[WebSocketServer] Error closing client:', error);
      }
    });

    this.clients.clear();

    // Close server
    return new Promise((resolve, reject) => {
      this.wss.close((error) => {
        if (error) {
          console.error('[WebSocketServer] Error closing server:', error);
          reject(error);
        } else {
          console.log('[WebSocketServer] Server closed');
          resolve();
        }
      });
    });
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.clients.size >= 0; // Server is running if it can accept clients
  }

  /**
   * Get server port
   */
  getPort(): number {
    return this.port;
  }
}
