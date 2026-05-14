/**
 * WebSocket connection hook for Focus Timer bridge
 * 
 * CRITICAL FOR OBS: Handles reconnection with exponential backoff
 * Maintains last known state during disconnection
 */

import { useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface TimerState {
  state: 'stopped' | 'pomodoro' | 'short-break' | 'long-break' | 'break';
  duration: number;
  elapsed: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startedTime: number;
  pausedTime: number;
  finishedTime: number;
  lastChangedTime: number;
}

export interface SessionState {
  currentState: string;
  startTime: number;
  endTime: number;
  pomodorosCompleted: number;
  currentCycle: number;
  hasUniformBreaks: boolean;
  canReset: boolean;
}

export interface BridgeState {
  timer: TimerState | null;
  session: SessionState | null;
  connectionStatus: ConnectionStatus;
}

const BRIDGE_URL = 'ws://localhost:8080';
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

/**
 * Connect to Focus Timer bridge and receive timer state updates
 */
export function useFocusTimerBridge(): BridgeState {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef<number>(INITIAL_RETRY_DELAY);
  const isUnmountedRef = useRef<boolean>(false);

  useEffect(() => {
    isUnmountedRef.current = false;
    
    const connect = () => {
      if (isUnmountedRef.current) return;
      
      console.log('[Bridge] Connecting to Focus Timer bridge...');
      
      try {
        const ws = new WebSocket(BRIDGE_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmountedRef.current) return;
          
          console.log('[Bridge] Connected to bridge ✓');
          setConnectionStatus('connected');
          retryDelayRef.current = INITIAL_RETRY_DELAY; // Reset retry delay on successful connection
        };

        ws.onmessage = (event) => {
          if (isUnmountedRef.current) return;
          
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'timerState') {
              // Update timer and session state
              setTimerState(message.data.timer);
              setSessionState(message.data.session);
              
              console.log('[Bridge] State updated:', {
                state: message.data.timer.state,
                remaining: Math.floor(message.data.timer.remaining),
                pomodoros: message.data.session.pomodorosCompleted
              });
            } else if (message.type === 'offline') {
              // Focus Timer is offline
              console.warn('[Bridge] Focus Timer offline:', message.data.reason);
              // Keep last known state but show disconnected status
              setConnectionStatus('disconnected');
            }
          } catch (error) {
            console.error('[Bridge] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[Bridge] WebSocket error:', error);
        };

        ws.onclose = () => {
          if (isUnmountedRef.current) return;
          
          console.log('[Bridge] Disconnected from bridge');
          setConnectionStatus('reconnecting');
          wsRef.current = null;
          
          // Exponential backoff reconnection
          const delay = Math.min(retryDelayRef.current, MAX_RETRY_DELAY);
          console.log(`[Bridge] Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY);
            connect();
          }, delay);
        };
      } catch (error) {
        console.error('[Bridge] Failed to create WebSocket:', error);
        setConnectionStatus('reconnecting');
        
        // Retry connection
        const delay = Math.min(retryDelayRef.current, MAX_RETRY_DELAY);
        reconnectTimeoutRef.current = setTimeout(() => {
          retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_DELAY);
          connect();
        }, delay);
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      isUnmountedRef.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    timer: timerState,
    session: sessionState,
    connectionStatus
  };
}
