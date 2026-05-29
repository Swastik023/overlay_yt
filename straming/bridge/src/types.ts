/**
 * Type definitions for Focus Timer OBS Integration Bridge Service
 */

/**
 * Timer state from Focus Timer D-Bus interface
 * All time values are in seconds (converted from microseconds)
 */
export interface TimerState {
  // Current State
  state: 'stopped' | 'pomodoro' | 'short-break' | 'long-break' | 'break';
  
  // Time Values (seconds)
  duration: number;        // Total duration of current timer
  elapsed: number;         // Time elapsed since start
  remaining: number;       // Time remaining until finish
  progress: number;        // Progress as decimal 0.0 to 1.0
  
  // Status Flags
  isRunning: boolean;      // Timer is actively counting
  isPaused: boolean;       // Timer is paused
  isFinished: boolean;     // Timer has completed
  
  // Timestamps (unix seconds)
  startedTime: number;     // When timer started (-1 if not started)
  pausedTime: number;      // When timer paused (-1 if not paused)
  finishedTime: number;    // When timer finished (-1 if not finished)
  lastChangedTime: number; // Last state change timestamp
}

/**
 * Session state from Focus Timer D-Bus interface
 */
export interface SessionState {
  currentState: string;           // Current time block state
  startTime: number;              // Session start timestamp (seconds)
  endTime: number;                // Session end timestamp (seconds)

  hasUniformBreaks: boolean;      // Whether breaks are uniform duration
  canReset: boolean;              // Whether reset is available
}

/**
 * D-Bus Timer interface proxy
 */
export interface TimerInterface {
  // Properties
  State: string;
  Duration: bigint;
  Offset: bigint;
  StartedTime: bigint;
  PausedTime: bigint;
  FinishedTime: bigint;
  LastChangedTime: bigint;
  
  // Methods
  IsStarted(): Promise<boolean>;
  IsRunning(): Promise<boolean>;
  IsPaused(): Promise<boolean>;
  IsFinished(): Promise<boolean>;
  GetElapsed(timestamp: bigint): Promise<bigint>;
  GetRemaining(timestamp: bigint): Promise<bigint>;
  GetProgress(timestamp: bigint): Promise<number>;
  Start(): Promise<void>;
  Stop(): Promise<void>;
  Pause(): Promise<void>;
  Resume(): Promise<void>;
  Rewind(interval: bigint): Promise<void>;
  Extend(interval: bigint): Promise<void>;
  Skip(): Promise<void>;
  Reset(): Promise<void>;
  
  // Signal handlers
  on(event: 'Changed', handler: () => void): void;
  on(event: 'Tick', handler: (timestamp: bigint) => void): void;
  on(event: 'Finished', handler: () => void): void;
}

/**
 * D-Bus Session interface proxy
 */
export interface SessionInterface {
  // Properties
  CurrentState: string;
  StartTime: bigint;
  EndTime: bigint;
  HasUniformBreaks: boolean;
  CanReset: boolean;
  
  // Methods
  Advance(): Promise<void>;
  AdvanceToState(state: string): Promise<void>;
  Reset(): Promise<void>;
  GetCurrentTimeBlock(): Promise<Record<string, any>>;
  GetCurrentGap(): Promise<Record<string, any>>;
  GetNextTimeBlock(): Promise<Record<string, any>>;
  ListTimeBlocks(): Promise<Array<Record<string, any>>>;
  ListCycles(): Promise<Array<Record<string, any>>>;
  
  // Signal handlers
  on(event: 'Changed', handler: () => void): void;
  on(event: 'EnterTimeBlock', handler: (timeBlock: any) => void): void;
  on(event: 'LeaveTimeBlock', handler: (timeBlock: any) => void): void;
  on(event: 'ConfirmAdvancement', handler: (current: any, next: any) => void): void;
}

/**
 * Connection status
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

/**
 * Validation error for timer/session state
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valid timer state values
 */
const VALID_TIMER_STATES = ['stopped', 'pomodoro', 'short-break', 'long-break', 'break'] as const;

/**
 * Validates a TimerState object
 * @param state - The timer state to validate
 * @throws {ValidationError} If validation fails
 * @returns The validated timer state
 * 
 * Validates Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */
export function validateTimerState(state: any): TimerState {
  // Requirement 11.1: State field validation
  if (!state || typeof state !== 'object') {
    throw new ValidationError('Timer state must be an object');
  }
  
  if (!VALID_TIMER_STATES.includes(state.state)) {
    throw new ValidationError(
      `Invalid state: ${state.state}. Must be one of: ${VALID_TIMER_STATES.join(', ')}`
    );
  }
  
  // Requirement 11.2: Time values must be non-negative integers
  if (typeof state.duration !== 'number' || state.duration < 0 || !Number.isFinite(state.duration)) {
    throw new ValidationError(`Invalid duration: ${state.duration}. Must be a non-negative number`);
  }
  
  if (typeof state.elapsed !== 'number' || state.elapsed < 0 || !Number.isFinite(state.elapsed)) {
    throw new ValidationError(`Invalid elapsed: ${state.elapsed}. Must be a non-negative number`);
  }
  
  if (typeof state.remaining !== 'number' || state.remaining < 0 || !Number.isFinite(state.remaining)) {
    throw new ValidationError(`Invalid remaining: ${state.remaining}. Must be a non-negative number`);
  }
  
  // Requirement 11.3: Progress must be between 0.0 and 1.0
  if (typeof state.progress !== 'number' || state.progress < 0.0 || state.progress > 1.0 || !Number.isFinite(state.progress)) {
    throw new ValidationError(`Invalid progress: ${state.progress}. Must be between 0.0 and 1.0`);
  }
  
  // Requirement 11.4: Boolean flags validation
  if (typeof state.isRunning !== 'boolean') {
    throw new ValidationError(`Invalid isRunning: ${state.isRunning}. Must be a boolean`);
  }
  
  if (typeof state.isPaused !== 'boolean') {
    throw new ValidationError(`Invalid isPaused: ${state.isPaused}. Must be a boolean`);
  }
  
  if (typeof state.isFinished !== 'boolean') {
    throw new ValidationError(`Invalid isFinished: ${state.isFinished}. Must be a boolean`);
  }
  
  // Requirement 11.5: Timestamp validation (unix seconds or -1)
  const validateTimestamp = (value: any, name: string) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new ValidationError(`Invalid ${name}: ${value}. Must be a number`);
    }
    if (value !== -1 && value < 0) {
      throw new ValidationError(`Invalid ${name}: ${value}. Must be a valid unix timestamp or -1`);
    }
  };
  
  validateTimestamp(state.startedTime, 'startedTime');
  validateTimestamp(state.pausedTime, 'pausedTime');
  validateTimestamp(state.finishedTime, 'finishedTime');
  validateTimestamp(state.lastChangedTime, 'lastChangedTime');
  
  return state as TimerState;
}

/**
 * Validates a SessionState object
 * @param state - The session state to validate
 * @throws {ValidationError} If validation fails
 * @returns The validated session state
 * 
 * Validates Requirements 12.1, 12.2, 12.3, 12.4
 */
export function validateSessionState(state: any): SessionState {
  if (!state || typeof state !== 'object') {
    throw new ValidationError('Session state must be an object');
  }
  
  // Requirement 12.1: currentState field validation
  if (typeof state.currentState !== 'string') {
    throw new ValidationError(`Invalid currentState: ${state.currentState}. Must be a string`);
  }
  

  // Requirement 12.4: Timestamp validation and startTime <= endTime
  if (typeof state.startTime !== 'number' || !Number.isFinite(state.startTime)) {
    throw new ValidationError(`Invalid startTime: ${state.startTime}. Must be a valid unix timestamp`);
  }
  
  if (typeof state.endTime !== 'number' || !Number.isFinite(state.endTime)) {
    throw new ValidationError(`Invalid endTime: ${state.endTime}. Must be a valid unix timestamp`);
  }
  
  if (state.startTime > state.endTime) {
    throw new ValidationError(
      `Invalid time range: startTime (${state.startTime}) must be <= endTime (${state.endTime})`
    );
  }
  
  // Validate boolean fields
  if (typeof state.hasUniformBreaks !== 'boolean') {
    throw new ValidationError(`Invalid hasUniformBreaks: ${state.hasUniformBreaks}. Must be a boolean`);
  }
  
  if (typeof state.canReset !== 'boolean') {
    throw new ValidationError(`Invalid canReset: ${state.canReset}. Must be a boolean`);
  }
  
  return state as SessionState;
}
