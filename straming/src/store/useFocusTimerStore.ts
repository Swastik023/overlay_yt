/**
 * Zustand store for Focus Timer bridge state
 * Stores timer and session state received from bridge
 */

import { create } from 'zustand';
import type { TimerState, SessionState, ConnectionStatus } from '../hooks/useFocusTimerBridge';

interface FocusTimerStore {
  // State from bridge
  timer: TimerState | null;
  session: SessionState | null;
  connectionStatus: ConnectionStatus;

  // Actions
  updateTimerState: (timer: TimerState) => void;
  updateSessionState: (session: SessionState) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateFullState: (timer: TimerState, session: SessionState) => void;
}

export const useFocusTimerStore = create<FocusTimerStore>((set) => ({
  timer: null,
  session: null,
  connectionStatus: 'disconnected',

  updateTimerState: (timer) => set({ timer }),
  
  updateSessionState: (session) => set({ session }),
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updateFullState: (timer, session) => set({ timer, session }),
}));
