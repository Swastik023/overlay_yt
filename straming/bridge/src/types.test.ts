/**
 * Unit tests for TimerState and SessionState validation
 */

import { describe, it, expect } from 'vitest';
import { validateTimerState, validateSessionState, ValidationError, TimerState, SessionState } from './types';

describe('validateTimerState', () => {
  const validTimerState: TimerState = {
    state: 'pomodoro',
    duration: 1500,
    elapsed: 300,
    remaining: 1200,
    progress: 0.2,
    isRunning: true,
    isPaused: false,
    isFinished: false,
    startedTime: 1700000000,
    pausedTime: -1,
    finishedTime: -1,
    lastChangedTime: 1700000000,
  };

  it('should validate a correct timer state', () => {
    expect(() => validateTimerState(validTimerState)).not.toThrow();
    const result = validateTimerState(validTimerState);
    expect(result).toEqual(validTimerState);
  });

  it('should reject null or non-object input', () => {
    expect(() => validateTimerState(null)).toThrow(ValidationError);
    expect(() => validateTimerState(undefined)).toThrow(ValidationError);
    expect(() => validateTimerState('string')).toThrow(ValidationError);
    expect(() => validateTimerState(123)).toThrow(ValidationError);
  });

  describe('state field validation (Requirement 11.1)', () => {
    it('should accept valid state values', () => {
      const states = ['stopped', 'pomodoro', 'short-break', 'long-break', 'break'];
      states.forEach(state => {
        expect(() => validateTimerState({ ...validTimerState, state })).not.toThrow();
      });
    });

    it('should reject invalid state values', () => {
      expect(() => validateTimerState({ ...validTimerState, state: 'invalid' }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, state: '' }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, state: null }))
        .toThrow(ValidationError);
    });
  });

  describe('time values validation (Requirement 11.2)', () => {
    it('should accept non-negative time values', () => {
      expect(() => validateTimerState({ ...validTimerState, duration: 0 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, elapsed: 0 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, remaining: 0 })).not.toThrow();
    });

    it('should reject negative duration', () => {
      expect(() => validateTimerState({ ...validTimerState, duration: -1 }))
        .toThrow(ValidationError);
    });

    it('should reject negative elapsed', () => {
      expect(() => validateTimerState({ ...validTimerState, elapsed: -1 }))
        .toThrow(ValidationError);
    });

    it('should reject negative remaining', () => {
      expect(() => validateTimerState({ ...validTimerState, remaining: -1 }))
        .toThrow(ValidationError);
    });

    it('should reject non-finite time values', () => {
      expect(() => validateTimerState({ ...validTimerState, duration: Infinity }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, elapsed: NaN }))
        .toThrow(ValidationError);
    });
  });

  describe('progress validation (Requirement 11.3)', () => {
    it('should accept progress between 0.0 and 1.0', () => {
      expect(() => validateTimerState({ ...validTimerState, progress: 0.0 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, progress: 0.5 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, progress: 1.0 })).not.toThrow();
    });

    it('should reject progress < 0.0', () => {
      expect(() => validateTimerState({ ...validTimerState, progress: -0.1 }))
        .toThrow(ValidationError);
    });

    it('should reject progress > 1.0', () => {
      expect(() => validateTimerState({ ...validTimerState, progress: 1.1 }))
        .toThrow(ValidationError);
    });

    it('should reject non-finite progress', () => {
      expect(() => validateTimerState({ ...validTimerState, progress: Infinity }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, progress: NaN }))
        .toThrow(ValidationError);
    });
  });

  describe('boolean flags validation (Requirement 11.4)', () => {
    it('should accept boolean values', () => {
      expect(() => validateTimerState({ ...validTimerState, isRunning: true })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, isRunning: false })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, isPaused: true })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, isPaused: false })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, isFinished: true })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, isFinished: false })).not.toThrow();
    });

    it('should reject non-boolean isRunning', () => {
      expect(() => validateTimerState({ ...validTimerState, isRunning: 1 as any }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, isRunning: 'true' as any }))
        .toThrow(ValidationError);
    });

    it('should reject non-boolean isPaused', () => {
      expect(() => validateTimerState({ ...validTimerState, isPaused: 0 as any }))
        .toThrow(ValidationError);
    });

    it('should reject non-boolean isFinished', () => {
      expect(() => validateTimerState({ ...validTimerState, isFinished: null as any }))
        .toThrow(ValidationError);
    });
  });

  describe('timestamp validation (Requirement 11.5)', () => {
    it('should accept valid unix timestamps', () => {
      expect(() => validateTimerState({ ...validTimerState, startedTime: 1700000000 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, pausedTime: 1700000100 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, finishedTime: 1700000200 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, lastChangedTime: 1700000300 })).not.toThrow();
    });

    it('should accept -1 for unset timestamps', () => {
      expect(() => validateTimerState({ ...validTimerState, startedTime: -1 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, pausedTime: -1 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, finishedTime: -1 })).not.toThrow();
      expect(() => validateTimerState({ ...validTimerState, lastChangedTime: -1 })).not.toThrow();
    });

    it('should reject negative timestamps other than -1', () => {
      expect(() => validateTimerState({ ...validTimerState, startedTime: -2 }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, pausedTime: -100 }))
        .toThrow(ValidationError);
    });

    it('should reject non-finite timestamps', () => {
      expect(() => validateTimerState({ ...validTimerState, startedTime: Infinity }))
        .toThrow(ValidationError);
      expect(() => validateTimerState({ ...validTimerState, pausedTime: NaN }))
        .toThrow(ValidationError);
    });
  });
});

describe('validateSessionState', () => {
  const validSessionState: SessionState = {
    currentState: 'pomodoro',
    startTime: 1700000000,
    endTime: 1700001500,
    pomodorosCompleted: 2,
    currentCycle: 1,
    hasUniformBreaks: true,
    canReset: true,
  };

  it('should validate a correct session state', () => {
    expect(() => validateSessionState(validSessionState)).not.toThrow();
    const result = validateSessionState(validSessionState);
    expect(result).toEqual(validSessionState);
  });

  it('should reject null or non-object input', () => {
    expect(() => validateSessionState(null)).toThrow(ValidationError);
    expect(() => validateSessionState(undefined)).toThrow(ValidationError);
    expect(() => validateSessionState('string')).toThrow(ValidationError);
  });

  describe('currentState validation (Requirement 12.1)', () => {
    it('should accept string currentState', () => {
      expect(() => validateSessionState({ ...validSessionState, currentState: 'pomodoro' })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, currentState: 'break' })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, currentState: '' })).not.toThrow();
    });

    it('should reject non-string currentState', () => {
      expect(() => validateSessionState({ ...validSessionState, currentState: null as any }))
        .toThrow(ValidationError);
      expect(() => validateSessionState({ ...validSessionState, currentState: 123 as any }))
        .toThrow(ValidationError);
    });
  });

  describe('pomodorosCompleted validation (Requirement 12.2)', () => {
    it('should accept non-negative integers', () => {
      expect(() => validateSessionState({ ...validSessionState, pomodorosCompleted: 0 })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, pomodorosCompleted: 1 })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, pomodorosCompleted: 100 })).not.toThrow();
    });

    it('should reject negative values', () => {
      expect(() => validateSessionState({ ...validSessionState, pomodorosCompleted: -1 }))
        .toThrow(ValidationError);
    });

    it('should reject non-integers', () => {
      expect(() => validateSessionState({ ...validSessionState, pomodorosCompleted: 1.5 }))
        .toThrow(ValidationError);
    });
  });

  describe('currentCycle validation (Requirement 12.3)', () => {
    it('should accept positive integers', () => {
      expect(() => validateSessionState({ ...validSessionState, currentCycle: 1 })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, currentCycle: 2 })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, currentCycle: 100 })).not.toThrow();
    });

    it('should reject zero', () => {
      expect(() => validateSessionState({ ...validSessionState, currentCycle: 0 }))
        .toThrow(ValidationError);
    });

    it('should reject negative values', () => {
      expect(() => validateSessionState({ ...validSessionState, currentCycle: -1 }))
        .toThrow(ValidationError);
    });

    it('should reject non-integers', () => {
      expect(() => validateSessionState({ ...validSessionState, currentCycle: 1.5 }))
        .toThrow(ValidationError);
    });
  });

  describe('timestamp validation (Requirement 12.4)', () => {
    it('should accept valid timestamps with startTime <= endTime', () => {
      expect(() => validateSessionState({ 
        ...validSessionState, 
        startTime: 1700000000, 
        endTime: 1700001500 
      })).not.toThrow();
      
      expect(() => validateSessionState({ 
        ...validSessionState, 
        startTime: 1700000000, 
        endTime: 1700000000 
      })).not.toThrow();
    });

    it('should reject startTime > endTime', () => {
      expect(() => validateSessionState({ 
        ...validSessionState, 
        startTime: 1700001500, 
        endTime: 1700000000 
      })).toThrow(ValidationError);
    });

    it('should reject non-finite timestamps', () => {
      expect(() => validateSessionState({ ...validSessionState, startTime: Infinity }))
        .toThrow(ValidationError);
      expect(() => validateSessionState({ ...validSessionState, endTime: NaN }))
        .toThrow(ValidationError);
    });
  });

  describe('boolean fields validation', () => {
    it('should accept boolean values', () => {
      expect(() => validateSessionState({ ...validSessionState, hasUniformBreaks: true })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, hasUniformBreaks: false })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, canReset: true })).not.toThrow();
      expect(() => validateSessionState({ ...validSessionState, canReset: false })).not.toThrow();
    });

    it('should reject non-boolean hasUniformBreaks', () => {
      expect(() => validateSessionState({ ...validSessionState, hasUniformBreaks: 1 as any }))
        .toThrow(ValidationError);
    });

    it('should reject non-boolean canReset', () => {
      expect(() => validateSessionState({ ...validSessionState, canReset: 'true' as any }))
        .toThrow(ValidationError);
    });
  });
});
