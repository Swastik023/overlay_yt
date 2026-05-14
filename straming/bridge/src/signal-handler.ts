/**
 * Signal handler for Focus Timer D-Bus signals
 * Subscribes to Timer and Session signals and provides callbacks
 */

import type { TimerInterface, SessionInterface } from './types.js';
import { DBusClient } from './dbus-client.js';

/**
 * Callback types for signal handlers
 */
export interface SignalCallbacks {
  onTimerTick?: (timestamp: number) => void;
  onTimerChanged?: () => void;
  onTimerFinished?: () => void;
  onSessionChanged?: () => void;
}

/**
 * Signal handler for Focus Timer D-Bus signals
 */
export class SignalHandler {
  private timerInterface: TimerInterface | null = null;
  private sessionInterface: SessionInterface | null = null;
  private callbacks: SignalCallbacks = {};
  private isSubscribed: boolean = false;

  /**
   * Subscribe to all Timer and Session D-Bus signals
   * @param dbusClient D-Bus client instance
   * @param callbacks Signal callbacks
   */
  subscribe(dbusClient: DBusClient, callbacks: SignalCallbacks): void {
    if (this.isSubscribed) {
      console.warn('[SignalHandler] Already subscribed to signals');
      return;
    }

    this.callbacks = callbacks;
    this.timerInterface = dbusClient.getTimerInterface();
    this.sessionInterface = dbusClient.getSessionInterface();

    // Subscribe to Timer.Tick signal (emitted every second)
    this.timerInterface.on('Tick', (timestamp: bigint) => {
      const timestampSeconds = DBusClient.microsecondsToSeconds(timestamp);
      
      if (this.callbacks.onTimerTick) {
        this.callbacks.onTimerTick(timestampSeconds);
      }
    });

    // Subscribe to Timer.Changed signal (state transitions)
    this.timerInterface.on('Changed', () => {
      if (this.callbacks.onTimerChanged) {
        this.callbacks.onTimerChanged();
      }
    });

    // Subscribe to Timer.Finished signal (completion events)
    this.timerInterface.on('Finished', () => {
      if (this.callbacks.onTimerFinished) {
        this.callbacks.onTimerFinished();
      }
    });

    // Subscribe to Session.Changed signal
    this.sessionInterface.on('Changed', () => {
      if (this.callbacks.onSessionChanged) {
        this.callbacks.onSessionChanged();
      }
    });

    this.isSubscribed = true;
    console.log('[SignalHandler] Subscribed to Focus Timer D-Bus signals');
  }

  /**
   * Unsubscribe from all signals
   */
  unsubscribe(): void {
    // Note: dbus-next doesn't provide a direct way to unsubscribe from signals
    // We just clear our references and callbacks
    this.timerInterface = null;
    this.sessionInterface = null;
    this.callbacks = {};
    this.isSubscribed = false;
    
    console.log('[SignalHandler] Unsubscribed from Focus Timer D-Bus signals');
  }

  /**
   * Check if subscribed to signals
   */
  isSubscribedToSignals(): boolean {
    return this.isSubscribed;
  }
}
