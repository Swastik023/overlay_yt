/**
 * State manager for Focus Timer bridge service
 * Caches current timer and session state for instant rehydration on reconnect
 * 
 * CRITICAL FOR OBS: Browser sources reload randomly - must serve state FAST
 */

import type { TimerState, SessionState } from './types.js';
import { validateTimerState, validateSessionState } from './types.js';

/**
 * State manager - caches current state and provides instant access
 */
export class StateManager {
  private timerState: TimerState | null = null;
  private sessionState: SessionState | null = null;
  private lastUpdateTime: number = 0;

  /**
   * Update cached timer state
   * @param state New timer state from D-Bus
   */
  updateTimerState(state: TimerState): void {
    try {
      // Validate before caching
      this.timerState = validateTimerState(state);
      this.lastUpdateTime = Date.now();
      
      console.log('[StateManager] Timer state updated:', {
        state: this.timerState.state,
        remaining: Math.floor(this.timerState.remaining),
        isRunning: this.timerState.isRunning
      });
    } catch (error) {
      console.error('[StateManager] Invalid timer state:', error);
      // Don't update cache with invalid state
    }
  }

  /**
   * Update cached session state
   * @param state New session state from D-Bus
   */
  updateSessionState(state: SessionState): void {
    try {
      // Validate before caching
      this.sessionState = validateSessionState(state);
      this.lastUpdateTime = Date.now();
      
      console.log('[StateManager] Session state updated:', {
        currentState: this.sessionState.currentState,
        pomodorosCompleted: this.sessionState.pomodorosCompleted,
        currentCycle: this.sessionState.currentCycle
      });
    } catch (error) {
      console.error('[StateManager] Invalid session state:', error);
      // Don't update cache with invalid state
    }
  }

  /**
   * Get current timer state (for new connections)
   * CRITICAL: OBS browser sources need instant state on reconnect
   * @returns Current timer state or null if not available
   */
  getTimerState(): TimerState | null {
    return this.timerState;
  }

  /**
   * Get current session state (for new connections)
   * @returns Current session state or null if not available
   */
  getSessionState(): SessionState | null {
    return this.sessionState;
  }

  /**
   * Get complete current state
   * @returns Object with timer and session state, or null if not available
   */
  getCurrentState(): { timer: TimerState; session: SessionState } | null {
    if (!this.timerState || !this.sessionState) {
      return null;
    }

    return {
      timer: this.timerState,
      session: this.sessionState
    };
  }

  /**
   * Calculate remaining time from authoritative timestamps
   * Uses Focus Timer's timestamps - no local intervals
   * 
   * @param duration Total duration in seconds
   * @param startedTime When timer started (unix seconds)
   * @param pausedTime When timer paused (unix seconds, -1 if not paused)
   * @param isRunning Whether timer is currently running
   * @returns Remaining time in seconds
   */
  static calculateRemaining(
    duration: number,
    startedTime: number,
    pausedTime: number,
    isRunning: boolean
  ): number {
    // If not started, full duration remains
    if (startedTime === -1) {
      return duration;
    }

    // If paused, use paused time as reference
    if (pausedTime !== -1) {
      const elapsed = pausedTime - startedTime;
      return Math.max(0, duration - elapsed);
    }

    // If running, calculate from current time
    if (isRunning) {
      const currentTime = Date.now() / 1000; // Convert to seconds
      const elapsed = currentTime - startedTime;
      return Math.max(0, duration - elapsed);
    }

    // Finished or stopped
    return 0;
  }

  /**
   * Check if state is available
   */
  hasState(): boolean {
    return this.timerState !== null && this.sessionState !== null;
  }

  /**
   * Get time since last update (for debugging)
   */
  getTimeSinceUpdate(): number {
    if (this.lastUpdateTime === 0) {
      return -1;
    }
    return Date.now() - this.lastUpdateTime;
  }

  /**
   * Clear cached state (for disconnect/reset)
   */
  clear(): void {
    this.timerState = null;
    this.sessionState = null;
    this.lastUpdateTime = 0;
    console.log('[StateManager] State cleared');
  }
}
