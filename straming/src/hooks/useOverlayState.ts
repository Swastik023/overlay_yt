/**
 * Overlay State Machine
 *
 * States (derived from real backend flags, no fragile history tracking):
 *
 * DISCONNECTED    - API not connected (no reliable data)
 * PAUSED          - Focus or break session paused by user
 * OVERTIME        - Focus session exceeded planned duration
 * BREAK           - Break timer actively running
 * FOCUS           - Focus session actively running
 * READY_TO_BREAK  - Focus complete, break offered, waiting for user to start it
 * READY_TO_FOCUS  - Break complete, waiting for user to start next focus session
 * TASK_SELECTED   - A task is selected but no session is running
 * IDLE            - No task selected, nothing running
 *
 * Priority (first match wins):
 *   1. !connected           -> DISCONNECTED
 *   2. isBreakOffer         -> READY_TO_BREAK   (checked before PAUSED: an offered
 *                                                break has purpose='break'+!isRunning,
 *                                                which the backend also reports as
 *                                                "paused" — the offer flag disambiguates)
 *   3. isSessionPaused      -> PAUSED
 *   4. isInOvertime         -> OVERTIME
 *   5. isBreakActive        -> BREAK            (only true running breaks reach here)
 *   6. isSessionRunning     -> FOCUS
 *   7. isBreakCompleted     -> READY_TO_FOCUS
 *   8. currentTask          -> TASK_SELECTED
 *   9. otherwise            -> IDLE
 */

import { useMemo } from 'react'
import type {
  SpFocusMode,
  SpCurrentTask,
  SpConnectionStatus,
} from './useSuperProductivity'

// ─── Overlay States ────────────────────────────────────────────────────────

export type OverlayState =
  | 'DISCONNECTED'
  | 'PAUSED'
  | 'OVERTIME'
  | 'BREAK'
  | 'FOCUS'
  | 'READY_TO_BREAK'
  | 'READY_TO_FOCUS'
  | 'TASK_SELECTED'
  | 'IDLE'

/** Coarse display group — useful for shared styling/sections. */
export type OverlayDisplayGroup =
  | 'FOCUS'
  | 'BREAK'
  | 'READY'
  | 'TASK_SELECTED'
  | 'PAUSED'
  | 'OVERTIME'
  | 'IDLE'
  | 'DISCONNECTED'

export interface OverlayStateDetails {
  state: OverlayState
  /** Coarse group for sections that don't need the fine-grained READY split. */
  group: OverlayDisplayGroup
  statusLabel: string
  statusEmoji: string
  accentColor: string
  accentRgb: string
  description: string
}

// ─── Theme Configuration ──────────────────────────────────────────────────────

const STATE_THEMES: Record<
  OverlayState,
  Omit<OverlayStateDetails, 'state'>
> = {
  FOCUS: {
    group: 'FOCUS',
    statusLabel: 'FOCUS',
    statusEmoji: '🔥',
    accentColor: '#FFC107',
    accentRgb: '255, 193, 7',
    description: 'Active work session',
  },
  BREAK: {
    group: 'BREAK',
    statusLabel: 'BREAK',
    statusEmoji: '🌙',
    accentColor: '#10B981',
    accentRgb: '16, 185, 129',
    description: 'Break running',
  },
  READY_TO_BREAK: {
    group: 'READY',
    statusLabel: 'READY',
    statusEmoji: '☕',
    accentColor: '#8B5CF6',
    accentRgb: '139, 92, 246',
    description: 'Focus complete — start your break',
  },
  READY_TO_FOCUS: {
    group: 'READY',
    statusLabel: 'READY',
    statusEmoji: '✅',
    accentColor: '#8B5CF6',
    accentRgb: '139, 92, 246',
    description: 'Break complete — start next focus',
  },
  TASK_SELECTED: {
    group: 'TASK_SELECTED',
    statusLabel: 'SELECTED',
    statusEmoji: '📋',
    accentColor: '#38BDF8',
    accentRgb: '56, 189, 248',
    description: 'Task selected — start focus session',
  },
  PAUSED: {
    group: 'PAUSED',
    statusLabel: 'PAUSED',
    statusEmoji: '⏸',
    accentColor: '#94A3B8',
    accentRgb: '148, 163, 184',
    description: 'Session paused',
  },
  OVERTIME: {
    group: 'OVERTIME',
    statusLabel: 'OVERTIME',
    statusEmoji: '🔴',
    accentColor: '#EF4444',
    accentRgb: '239, 68, 68',
    description: 'Session exceeded duration',
  },
  IDLE: {
    group: 'IDLE',
    statusLabel: 'IDLE',
    statusEmoji: '⚪',
    accentColor: '#6B7280',
    accentRgb: '107, 114, 128',
    description: 'No active task',
  },
  DISCONNECTED: {
    group: 'DISCONNECTED',
    statusLabel: 'OFFLINE',
    statusEmoji: '🔌',
    accentColor: '#F59E0B',
    accentRgb: '245, 158, 11',
    description: 'Super Productivity not connected',
  },
}

// ─── State Derivation Logic ──────────────────────────────────────────────────

export function deriveOverlayState(
  connectionStatus: SpConnectionStatus,
  focusMode: SpFocusMode | null,
  currentTask: SpCurrentTask | null,
): OverlayState {
  // 1. Not connected — backend data is stale/unavailable
  if (connectionStatus !== 'connected') {
    return 'DISCONNECTED'
  }

  // 2. Break offered (focus just completed). Must come before PAUSED because an
  //    offered break is { purpose:'break', isRunning:false }, which the backend
  //    also reports as isSessionPaused=true. The offer flag disambiguates.
  if (focusMode?.isBreakOffer) {
    return 'READY_TO_BREAK'
  }

  // 3. Session paused (work or running break paused by user)
  if (focusMode?.isSessionPaused) {
    return 'PAUSED'
  }

  // 4. Overtime
  if (focusMode?.isInOvertime) {
    return 'OVERTIME'
  }

  // 5. Break actively running
  if (focusMode?.isBreakActive) {
    return 'BREAK'
  }

  // 6. Focus session running
  if (focusMode?.isSessionRunning) {
    return 'FOCUS'
  }

  // 7. Break completed, awaiting next focus session
  if (focusMode?.isBreakCompleted) {
    return 'READY_TO_FOCUS'
  }

  // 8. A task is selected but nothing is running
  if (currentTask) {
    return 'TASK_SELECTED'
  }

  // 9. Nothing happening
  return 'IDLE'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOverlayState(
  focusMode: SpFocusMode | null,
  currentTask: SpCurrentTask | null,
  connectionStatus: SpConnectionStatus = 'connected',
): OverlayStateDetails {
  return useMemo(() => {
    const state = deriveOverlayState(connectionStatus, focusMode, currentTask)
    return {
      state,
      ...STATE_THEMES[state],
    }
  }, [connectionStatus, focusMode, currentTask])
}
