/**
 * State query module for Focus Timer D-Bus interface
 * Provides methods to query current timer and session state
 */

import type { TimerInterface, SessionInterface, TimerState, SessionState } from './types.js';
import { DBusClient } from './dbus-client.js';

/**
 * State query helper for Focus Timer
 */
export class StateQuery {
  private dbusClient: DBusClient;
  private timerInterface: TimerInterface;
  private sessionInterface: SessionInterface;

  constructor(dbusClient: DBusClient) {
    this.dbusClient = dbusClient;
    this.timerInterface = dbusClient.getTimerInterface();
    this.sessionInterface = dbusClient.getSessionInterface();
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
        lastChangedTime: DBusClient.microsecondsToSeconds(lastChangedTime)
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
        canReset,
        cycles
      ] = await Promise.all([
        this.dbusClient.getSessionProperty('CurrentState'),
        this.dbusClient.getSessionProperty('StartTime'),
        this.dbusClient.getSessionProperty('EndTime'),
        this.dbusClient.getSessionProperty('HasUniformBreaks'),
        this.dbusClient.getSessionProperty('CanReset'),
        this.sessionInterface.ListCycles()
      ]);

      // Count completed pomodoros from cycles
      // A cycle is completed when it has a completion_time > 0
      // completion_time comes from D-Bus as a Variant object with a .value property
      
      // Debug: Log raw cycle data to understand structure
      console.log('[StateQuery] Raw cycles data:', {
        totalCycles: cycles.length,
        firstCycle: cycles[0] ? Object.keys(cycles[0]) : 'no cycles'
      });
      
      const pomodorosCompleted = cycles.filter((cycle: any) => {
        if (!cycle.completion_time) {
          console.log('[StateQuery] Cycle missing completion_time:', cycle);
          return false;
        }
        
        // Extract the actual value from D-Bus Variant wrapper
        let rawValue = cycle.completion_time.value !== undefined 
          ? cycle.completion_time.value 
          : cycle.completion_time;
        
        // Handle nested Variant wrappers
        while (rawValue && typeof rawValue === 'object' && rawValue.value !== undefined) {
          rawValue = rawValue.value;
        }
        
        // Convert to number for comparison (milliseconds timestamp)
        const completionTime = typeof rawValue === 'bigint' 
          ? Number(rawValue) 
          : Number(rawValue);
        
        const isCompleted = !isNaN(completionTime) && completionTime > 0;
        console.log('[StateQuery] Cycle completion check:', { 
          rawValue: typeof rawValue, 
          completionTime, 
          isCompleted 
        });
        
        return isCompleted;
      }).length;

      // Current cycle position in the 4-cycle pattern (1-4)
      // The cycle number represents which pomodoro you're currently on or about to start
      // Examples:
      // - 0 completed, on pomodoro: Cycle 1 (working on 1st)
      // - 1 completed, on break: Cycle 1 (just finished 1st)
      // - 1 completed, on pomodoro: Cycle 2 (working on 2nd)
      // - 4 completed, on break: Cycle 4 (just finished 4th)
      // - 4 completed, on pomodoro: Cycle 1 (working on 5th, new set)
      
      let currentCycle: number;
      
      if (currentState === 'pomodoro' || currentState === 'stopped') {
        // During a pomodoro or stopped, show which one we're working on
        // 0 completed = cycle 1, 1 completed = cycle 2, etc.
        currentCycle = (pomodorosCompleted % 4) + 1;
        if (currentCycle === 5) currentCycle = 1; // Wrap 5 to 1
      } else {
        // During a break, show which pomodoro we just completed
        // 1 completed = cycle 1, 2 completed = cycle 2, etc.
        const justCompleted = pomodorosCompleted % 4;
        currentCycle = justCompleted === 0 ? 4 : justCompleted;
      }
      
      // Debug logging without BigInt serialization issues
      console.log('[StateQuery] Session stats:', {
        totalCycles: cycles.length,
        pomodorosCompleted,
        currentState,
        currentCyclePosition: currentCycle,
        logic: currentState === 'pomodoro' ? 'working on next' : 'just completed'
      });

      // Convert milliseconds to seconds (Session interface uses milliseconds, not microseconds!)
      const sessionState: SessionState = {
        currentState: currentState,
        startTime: Number(startTime) / 1000, // milliseconds to seconds
        endTime: Number(endTime) / 1000,     // milliseconds to seconds
        pomodorosCompleted: pomodorosCompleted,
        currentCycle: currentCycle,
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
