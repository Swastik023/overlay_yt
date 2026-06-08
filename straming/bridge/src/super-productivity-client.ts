/**
 * Super Productivity SSE Client
 * Connects to Super Productivity's /events endpoint and parses event stream
 */

import { EventEmitter } from 'events';
import { TimerState, SessionState } from './types.js';

/**
 * Super Productivity tick event payload (from /events SSE)
 */
export interface SpTickEvent {
  currentTaskId: string | null;
  title: string | null;
  timeSpent: number;
  timeSpentToday: number;
  timeEstimate: number;
  focusMode: SpFocusMode;
  timestamp: number;
}

/**
 * Super Productivity focus-mode event payload
 */
export interface SpFocusMode {
  isRunning: boolean;
  isSessionRunning: boolean;
  isBreakActive: boolean;
  isSessionPaused: boolean;
  isLongBreak: boolean;
  isInOvertime: boolean;
  mode: 'Flowtime' | 'Pomodoro' | 'Countdown';
  elapsed: number;
  remaining: number;
  duration: number;
  progress: number;
  currentCycle: number;
}

/**
 * Super Productivity current-task event payload
 */
export interface SpCurrentTask {
  id: string;
  title: string;
  timeSpent: number;
  timeSpentToday: number;
  timeEstimate: number;
  projectId: string;
  projectName?: string;
  isDone: boolean;
  [key: string]: unknown;
}

/**
 * Emitted events from this client
 */
export interface SpClientEvents {
  'tick': (data: SpTickEvent) => void;
  'focus-mode': (data: SpFocusMode) => void;
  'current-task': (data: SpCurrentTask | null) => void;
  'offline': (reason: string) => void;
  'connected': () => void;
  'error': (error: Error) => void;
}

/**
 * SSE event types from Super Productivity
 */
type SpEventType = 'tick' | 'focus-mode' | 'current-task';

/**
 * Client for Super Productivity's Server-Sent Events endpoint
 */
export class SuperProductivityClient extends EventEmitter {
  private baseUrl: string;
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private lastEventId: Map<SpEventType, string> = new Map();

  // Cached state for transformation
  private cachedTick: SpTickEvent | null = null;
  private cachedFocusMode: SpFocusMode | null = null;
  private cachedCurrentTask: SpCurrentTask | null = null;

  constructor(baseUrl: string = 'http://127.0.0.1:3876') {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * Connect to Super Productivity SSE endpoint
   */
  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = `${this.baseUrl}/events`;
    console.log(`[SP-Client] Connecting to ${url}...`);

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[SP-Client] Connected to Super Productivity SSE ✓');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');

        // Replay cached events to let consumers initialize
        if (this.cachedCurrentTask) {
          this.emit('current-task', this.cachedCurrentTask);
        }
        if (this.cachedFocusMode) {
          this.emit('focus-mode', this.cachedFocusMode);
        }
        if (this.cachedTick) {
          this.emit('tick', this.cachedTick);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('[SP-Client] SSE connection error:', event);
        this.isConnected = false;
        this.emit('offline', 'super-productivity-not-running');

        // Clean up and schedule reconnect
        this.cleanup();
        this.scheduleReconnect();
      };

      // Register event handlers for each event type
      this.setupEventHandler('current-task');
      this.setupEventHandler('focus-mode');
      this.setupEventHandler('tick');

    } catch (error) {
      console.error('[SP-Client] Failed to create EventSource:', error);
      this.emit('error', error as Error);
      this.scheduleReconnect();
    }
  }

  /**
   * Set up handler for a specific SSE event type
   */
  private setupEventHandler(eventType: SpEventType): void {
    if (!this.eventSource) return;

    this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // Store in cache
        switch (eventType) {
          case 'current-task':
            this.cachedCurrentTask = data as SpCurrentTask;
            break;
          case 'focus-mode':
            this.cachedFocusMode = data as SpFocusMode;
            break;
          case 'tick':
            this.cachedTick = data as SpTickEvent;
            break;
        }

        // Emit to consumers
        this.emit(eventType, data);
        
        // Track event ID for debugging
        this.lastEventId.set(eventType, event.lastEventId);
        
      } catch (error) {
        console.error(`[SP-Client] Failed to parse ${eventType} event:`, error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SP-Client] Max reconnection attempts reached');
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s... up to 30s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`[SP-Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Clean up existing connection
   */
  private cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Disconnect from Super Productivity
   */
  disconnect(): void {
    this.cleanup();
    this.isConnected = false;
    console.log('[SP-Client] Disconnected');
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    if (this.isConnected) return 'connected';
    if (this.reconnectAttempts > 0) return 'reconnecting';
    return 'disconnected';
  }

  /**
   * Transform Super Productivity data to Bridge timer/session state
   * This maps SP's event format to what the overlay expects
   */
  transformToBridgeState(): { timer: TimerState; session: SessionState } {
    const timer = this.transformToTimerState();
    const session = this.transformToSessionState();
    return { timer, session };
  }

  /**
   * Transform Super Productivity focus-mode to TimerState
   */
  private transformToTimerState(): TimerState {
    const fm = this.cachedFocusMode;
    const tick = this.cachedTick;

    // Map SP focus-mode state to bridge TimerState format
    let state: TimerState['state'] = 'stopped';
    
    if (fm) {
      if (fm.isBreakActive) {
        state = fm.isLongBreak ? 'long-break' : 'short-break';
      } else if (fm.isSessionRunning || fm.isRunning) {
        state = fm.mode === 'Pomodoro' ? 'pomodoro' : 'pomodoro'; // Use pomodoro as proxy for focus
      }
    }

    // If no focus session but task is being tracked, still show "pomodoro" (timer active)
    if (!fm?.isRunning && tick?.currentTaskId) {
      state = 'pomodoro'; // Task timer running
    }

    return {
      state,
      duration: fm?.duration ?? tick?.timeEstimate ?? 0,
      elapsed: fm?.elapsed ?? tick?.timeSpentToday ?? 0,
      remaining: fm?.remaining ?? Math.max(0, (tick?.timeEstimate ?? 0) - (tick?.timeSpentToday ?? 0)),
      progress: fm?.progress ?? (tick && tick.timeEstimate > 0 ? (tick.timeSpentToday / tick.timeEstimate) * 100 : 0),
      isRunning: fm?.isRunning ?? !!tick?.currentTaskId,
      isPaused: fm?.isSessionPaused ?? false,
      isFinished: false,
      startedTime: fm && fm.isRunning ? Math.floor(Date.now() / 1000) - Math.floor((fm.elapsed || 0) / 1000) : -1,
      pausedTime: -1,
      finishedTime: -1,
      lastChangedTime: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Transform to SessionState
   */
  private transformToSessionState(): SessionState {
    const fm = this.cachedFocusMode;

    return {
      currentState: fm?.isBreakActive ? 'break' : (fm?.isRunning ? 'pomodoro' : 'stopped'),
      startTime: fm && fm.isRunning ? Math.floor(Date.now() / 1000) - Math.floor((fm.elapsed || 0) / 1000) : -1,
      endTime: fm && fm.isRunning && fm.duration ? Math.floor(Date.now() / 1000) + Math.floor((fm.remaining || 0) / 1000) : -1,
      hasUniformBreaks: true,
      canReset: true,
    };
  }
}