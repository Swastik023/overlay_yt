/**
 * Super Productivity Bridge Service
 * 
 * Main entry point - wires Super Productivity SSE to WebSocket broadcasts
 * Keeps OBS overlay in sync with Super Productivity
 * 
 * Architecture:
 * Super Productivity (HTTP SSE) → Bridge Service → WebSocket → React Overlay (OBS)
 */

import { SuperProductivityClient, SpTickEvent, SpFocusMode, SpCurrentTask } from './super-productivity-client.js';
import { BridgeWebSocketServer } from './websocket-server.js';
import type { TimerState, SessionState } from './types.js';

// Parse command line arguments
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');
const port = args.includes('--port') 
  ? parseInt(args[args.indexOf('--port') + 1], 10) 
  : 8080;

// Configure logging
function log(message: string, ...args: unknown[]) {
  console.log(`[SP-Bridge] ${message}`, ...args);
}

function debug(message: string, ...args: unknown[]) {
  if (debugMode) {
    console.log(`[SP-Bridge:DEBUG] ${message}`, ...args);
  }
}

/**
 * Main bridge service for Super Productivity
 */
class SuperProductivityBridge {
  private spClient: SuperProductivityClient;
  private wsServer: BridgeWebSocketServer;
  private isShuttingDown: boolean = false;
  
  // Cached state for transformation
  private lastTick: SpTickEvent | null = null;
  private lastFocusMode: SpFocusMode | null = null;
  private lastCurrentTask: SpCurrentTask | null = null;

  constructor() {
    log('Initializing Super Productivity Bridge Service...');
    
    this.spClient = new SuperProductivityClient('http://127.0.0.1:3876');
    this.wsServer = new BridgeWebSocketServer(port);

    log(`WebSocket server listening on localhost:${port}`);
  }

  /**
   * Start the bridge service
   */
  async start(): Promise<void> {
    // Set up signal handlers for graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));

    // Set up Super Productivity event handlers
    this.setupEventHandlers();

    // Connect to Super Productivity SSE
    this.spClient.connect();
  }

  /**
   * Set up event handlers for Super Productivity SSE events
   */
  private setupEventHandlers(): void {
    // Current task changed
    this.spClient.on('current-task', (task: SpCurrentTask | null) => {
      debug('Current task changed:', task?.title ?? 'none');
      this.lastCurrentTask = task;
      this.broadcastState();
    });

    // Focus mode state changed
    this.spClient.on('focus-mode', (focusMode: SpFocusMode) => {
      debug(`Focus mode: ${focusMode.mode}, running: ${focusMode.isRunning}, break: ${focusMode.isBreakActive}`);
      this.lastFocusMode = focusMode;
      this.broadcastState();
    });

    // Timer tick (every second while active)
    this.spClient.on('tick', (tick: SpTickEvent) => {
      debug(`Tick: ${tick.title}, timeSpentToday: ${tick.timeSpentToday}, remaining: ${tick.focusMode.remaining}`);
      this.lastTick = tick;
      this.broadcastState();
    });

    // Connection status
    this.spClient.on('connected', () => {
      log('Connected to Super Productivity ✓');
      this.wsServer.broadcastOffline('super-productivity-connected');
    });

    this.spClient.on('offline', (reason: string) => {
      log(`Super Productivity offline: ${reason}`);
      this.wsServer.broadcastOffline('super-productivity-not-running');
    });

    this.spClient.on('error', (error: Error) => {
      console.error('[SP-Bridge] Error:', error.message);
    });
  }

  /**
   * Transform Super Productivity state to Bridge format and broadcast
   */
  private broadcastState(): void {
    const { timer, session } = this.spClient.transformToBridgeState();
    this.wsServer.broadcastState(timer, session);
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

    // Disconnect from Super Productivity
    this.spClient.disconnect();

    // Close WebSocket server
    try {
      await this.wsServer.close();
    } catch (error) {
      console.error('[SP-Bridge] Error closing WebSocket server:', error);
    }

    log('Shutdown complete');
    process.exit(0);
  }
}

// Start the bridge service
const bridge = new SuperProductivityBridge();

bridge.start().catch((error) => {
  console.error('[SP-Bridge] Fatal error:', error);
  process.exit(1);
});

log('Super Productivity Bridge Service started');
if (debugMode) {
  log('Debug mode enabled');
}
log('Connect overlay to: ws://localhost:8080');