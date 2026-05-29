/**
 * State query module for Focus Timer D-Bus interface
 * Provides methods to query current timer and session state
 */

import type { TimerInterface, TimerState, SessionState } from './types.js';
import { DBusClient } from './dbus-client.js';

/**
 * State query helper for Focus Timer
 */
export class StateQuery {
  private dbusClient: DBusClient;
  private timerInterface: TimerInterface;


  constructor(dbusClient: DBusClient) {
    this.dbusClient = dbusClient;
    this.timerInterface = dbusClient.getTimerInterface();

  }

  /**
   * Query current timer state from D-Bus
   * @returns Complete timer state
   */
  async queryTimerState(): Promise<TimerState> {
    try {
      // Query timer properties via Properties interface
      const [
        state,
        duration,
        startedTime,
        pausedTime,
        finishedTime,
        lastChangedTime,
        isRunning,
        isPaused,
        isFinished,
        elapsed,
        remaining,
        progress
      ] = await Promise.all([
        this.dbusClient.getTimerProperty('State'),
        this.dbusClient.getTimerProperty('Duration'),
        this.dbusClient.getTimerProperty('StartedTime'),
        this.dbusClient.getTimerProperty('PausedTime'),
        this.dbusClient.getTimerProperty('FinishedTime'),
        this.dbusClient.getTimerProperty('LastChangedTime'),
        this.timerInterface.IsRunning(),
        this.timerInterface.IsPaused(),
        this.timerInterface.IsFinished(),
        this.timerInterface.GetElapsed(BigInt(-1)),
        this.timerInterface.GetRemaining(BigInt(-1)),
        this.timerInterface.GetProgress(BigInt(-1))
      ]);

      // Convert microseconds to seconds
      const timerState: TimerState = {
        state: state as TimerState['state'],
        duration: DBusClient.microsecondsToSeconds(duration),
        elapsed: DBusClient.microsecondsToSeconds(elapsed),
        remaining: DBusClient.microsecondsToSeconds(remaining),
        progress: progress,
        isRunning: isRunning,
        isPaused: isPaused,
        isFinished: isFinished,
        startedTime: startedTime === BigInt(-1) ? -1 : DBusClient.microsecondsToSeconds(startedTime),
        pausedTime: pausedTime === BigInt(-1) ? -1 : DBusClient.microsecondsToSeconds(pausedTime),
        finishedTime: finishedTime === BigInt(-1) ? -1 : DBusClient.microsecondsToSeconds(finishedTime),
        lastChangedTime: lastChangedTime === BigInt(-1) ? -1 : DBusClient.microsecondsToSeconds(lastChangedTime)
      };

      return timerState;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query timer state: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Query current session state from D-Bus
   * @returns Complete session state
   */
  async querySessionState(): Promise<SessionState> {
    try {
      // Query session properties via Properties interface and methods
      const [
        currentState,
        startTime,
        endTime,
        hasUniformBreaks,
        canReset
      ] = await Promise.all([
        this.dbusClient.getSessionProperty('CurrentState'),
        this.dbusClient.getSessionProperty('StartTime'),
        this.dbusClient.getSessionProperty('EndTime'),
        this.dbusClient.getSessionProperty('HasUniformBreaks'),
        this.dbusClient.getSessionProperty('CanReset')
      ]);

      // Convert milliseconds to seconds (Session interface uses milliseconds, not microseconds!)
      const sessionState: SessionState = {
        currentState: currentState,
        startTime: Number(startTime) / 1000, // milliseconds to seconds
        endTime: Number(endTime) / 1000,     // milliseconds to seconds
        hasUniformBreaks: hasUniformBreaks,
        canReset: canReset
      };

      return sessionState;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query session state: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Query both timer and session state
   * @returns Object containing both timer and session state
   */
  async queryFullState(): Promise<{ timer: TimerState; session: SessionState }> {
    const [timer, session] = await Promise.all([
      this.queryTimerState(),
      this.querySessionState()
    ]);

    return { timer, session };
  }
}
