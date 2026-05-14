/**
 * Focus Timer Bridge Service
 * 
 * Main entry point - wires D-Bus signals to WebSocket broadcasts
 * Keeps OBS overlay in sync with Focus Timer
 */

import { DBusClient } from './dbus-client.js';
import { SignalHandler } from './signal-handler.js';
import { StateQuery } from './state-query.js';
import { StateManager } from './state-manager.js';
import { BridgeWebSocketServer } from './websocket-server.js';

// Parse command line arguments
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');

// Configure logging
function log(message: string, ...args: any[]) {
  console.log(`[Bridge] ${message}`, ...args);
}

function debug(message: string, ...args: any[]) {
  if (debugMode) {
    console.log(`[Bridge:DEBUG] ${message}`, ...args);
  }
}

/**
 * Main bridge service
 */
class FocusTimerBridge {
  private dbusClient: DBusClient;
  private signalHandler: SignalHandler;
  private stateQuery: StateQuery | null = null;
  private stateManager: StateManager;
  private wsServer: BridgeWebSocketServer;
  private isShuttingDown: boolean = false;

  constructor() {
    log('Initializing Focus Timer Bridge Service...');
    
    this.dbusClient = new DBusClient();
    this.signalHandler = new SignalHandler();
    this.stateManager = new StateManager();
    this.wsServer = new BridgeWebSocketServer(8080);

    log('WebSocket server listening on localhost:8080');
  }

  /**
   * Start the bridge service
   */
  async start(): Promise<void> {
    // Set up signal handlers for graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));

    // Connect to Focus Timer
    await this.connectToFocusTimer();
  }

  /**
   * Connect to Focus Timer D-Bus interface
   */
  private async connectToFocusTimer(): Promise<void> {
    try {
      log('Connecting to Focus Timer D-Bus interface...');
      await this.dbusClient.connect();
      log('Connected to Focus Timer ✓');

      // Initialize state query
      this.stateQuery = new StateQuery(this.dbusClient);

      // Query initial state
      await this.queryAndBroadcastState();

      // Subscribe to D-Bus signals
      this.subscribeToSignals();

      // Send current state to any already-connected overlays
      this.sendStateToAllClients();

    } catch (error) {
      console.error('[Bridge] Failed to connect to Focus Timer:', error);
      log('Focus Timer not running - will retry in 5 seconds...');
      
      // Broadcast offline state
      this.wsServer.broadcastOffline('focus-timer-not-running');

      // Start reconnection attempts
      this.dbusClient.startReconnecting(() => {
        log('Reconnected to Focus Timer ✓');
        this.onReconnected();
      });
    }
  }

  /**
   * Handle reconnection to Focus Timer
   */
  private async onReconnected(): Promise<void> {
    try {
      // Reinitialize state query
      this.stateQuery = new StateQuery(this.dbusClient);

      // Query current state
      await this.queryAndBroadcastState();

      // Re-subscribe to signals
      this.signalHandler.unsubscribe();
      this.subscribeToSignals();

      // Send state to all clients
      this.sendStateToAllClients();

    } catch (error) {
      console.error('[Bridge] Error during reconnection:', error);
    }
  }

  /**
   * Subscribe to Focus Timer D-Bus signals
   */
  private subscribeToSignals(): void {
    debug('Subscribing to D-Bus signals...');

    this.signalHandler.subscribe(this.dbusClient, {
      onTimerTick: (timestamp) => {
        debug(`Timer tick: ${timestamp}`);
        // Timer tick - query and broadcast updated state
        this.queryAndBroadcastState();
      },

      onTimerChanged: () => {
        log('Timer state changed');
        // Timer state changed - query and broadcast
        this.queryAndBroadcastState();
      },

      onTimerFinished: () => {
        log('Timer finished');
        // Timer finished - query and broadcast
        this.queryAndBroadcastState();
      },

      onSessionChanged: () => {
        log('Session state changed');
        // Session changed - query and broadcast
        this.queryAndBroadcastState();
      }
    });

    debug('Subscribed to D-Bus signals ✓');
  }

  /**
   * Query current state from Focus Timer and broadcast to overlays
   */
  private async queryAndBroadcastState(): Promise<void> {
    if (!this.stateQuery) {
      return;
    }

    try {
      const { timer, session } = await this.stateQuery.queryFullState();
      
      // Update state manager cache
      this.stateManager.updateTimerState(timer);
      this.stateManager.updateSessionState(session);

      // Broadcast to all connected overlays
      this.wsServer.broadcastState(timer, session);

    } catch (error) {
      console.error('[Bridge] Failed to query state:', error);
    }
  }

  /**
   * Send current state to all connected clients
   * CRITICAL: For OBS browser source reloads
   */
  private sendStateToAllClients(): void {
    const state = this.stateManager.getCurrentState();
    
    if (!state) {
      debug('No cached state available yet');
      return;
    }

    const clients = this.wsServer.getClients();
    clients.forEach((client) => {
      this.wsServer.sendToClient(client, {
        type: 'timerState',
        data: state
      });
    });

    debug(`Sent current state to ${clients.size} client(s)`);
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    log(`Received ${signal} - shutting down gracefully...`);

    // Stop reconnection attempts
    this.dbusClient.stopReconnecting();

    // Unsubscribe from signals
    this.signalHandler.unsubscribe();

    // Close WebSocket server
    try {
      await this.wsServer.close();
    } catch (error) {
      console.error('[Bridge] Error closing WebSocket server:', error);
    }

    // Disconnect from D-Bus
    this.dbusClient.disconnect();

    log('Shutdown complete');
    process.exit(0);
  }
}

// Start the bridge service
const bridge = new FocusTimerBridge();

bridge.start().catch((error) => {
  console.error('[Bridge] Fatal error:', error);
  process.exit(1);
});

log('Focus Timer Bridge Service started');
if (debugMode) {
  log('Debug mode enabled');
}
