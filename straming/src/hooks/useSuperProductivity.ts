/**
 * Super Productivity SSE hook
 *
 * Connects directly from the browser to Super Productivity's local REST API
 * SSE endpoint (http://127.0.0.1:3876/events) and exposes live state.
 *
 * Three SSE event types:
 *   current-task  — instant push on start/stop/switch
 *   focus-mode    — pushed on state change (~1 s resolution)
 *   tick          — every second while a task or focus session is active
 *
 * Polls /stats/today every 20 s and /projects every 60 s so the sidebar
 * always shows up-to-date today stats and the correct project name.
 *
 * All state is kept in a module-level singleton so every component share
 * one SSE connection and one set of polling timers.
 */

import { useSyncExternalStore } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

export interface SpFocusMode {
  isRunning: boolean
  isSessionRunning: boolean
  isBreakActive: boolean
  isSessionPaused: boolean
  isLongBreak: boolean
  isInOvertime: boolean
  isBreakCompleted: boolean
  isBreakOffer: boolean
  breakTip: string | null
  mode: 'Flowtime' | 'Pomodoro' | 'Countdown'
  elapsed: number    // ms
  remaining: number  // ms
  duration: number   // ms
  progress: number   // 0–100
  currentCycle: number
}

export interface SpCurrentTask {
  id: string
  title: string
  timeSpent: number       // ms total
  timeSpentToday: number  // ms today
  timeEstimate: number    // ms
  projectId: string
  isDone: boolean
  [key: string]: unknown
}

export interface SpTickPayload {
  currentTaskId: string | null
  title: string | null
  timeSpent: number
  timeSpentToday: number
  timeEstimate: number
  focusMode: SpFocusMode
  timestamp: number
}

export interface SpTodayStats {
  dateStr: string
  timeSpentToday: number   // ms
  completedToday: number
  planned: {
    total: number
    done: number
    remaining: number
    progress: number       // 0–100
  }
  estimateRemaining: number // ms
}

export interface SpProject {
  id: string
  title: string
}

export interface SpTask {
  id: string
  title: string
  isDone: boolean
  projectId: string
  timeSpent: number
  timeEstimate: number
}

export interface SpState {
  connectionStatus: SpConnectionStatus
  currentTask: SpCurrentTask | null
  focusMode: SpFocusMode | null
  tick: SpTickPayload | null
  todayStats: SpTodayStats | null
  projects: SpProject[]
  todayTasks: SpTask[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Default: use Vite proxy to avoid browser CORS/Origin blocks.
export const SP_BASE = '/sp-api'
export const SSE_URL = `${SP_BASE}/events`
const STATS_INTERVAL_MS = 20_000
const PROJECTS_INTERVAL_MS = 60_000
const TASKS_INTERVAL_MS = 15_000
const RECONNECT_BASE_MS = 2_000
const RECONNECT_MAX_MS = 30_000

// ─── Singleton state ──────────────────────────────────────────────────────────

type Listener = () => void
const listeners = new Set<Listener>()

let connectionCount = 0
let es: EventSource | null = null
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
let statsTimer: ReturnType<typeof setInterval> | null = null
let projectsTimer: ReturnType<typeof setInterval> | null = null
let tasksTimer: ReturnType<typeof setInterval> | null = null

let currentConnectionStatus: SpConnectionStatus = 'disconnected'
let currentTask: SpCurrentTask | null = null
let currentFocusMode: SpFocusMode | null = null
let currentTick: SpTickPayload | null = null
let todayStats: SpTodayStats | null = null
let projects: SpProject[] = []
let todayTasks: SpTask[] = []

let cachedSnapshot: SpState = {
  connectionStatus: 'disconnected',
  currentTask: null,
  focusMode: null,
  tick: null,
  todayStats: null,
  projects: [],
  todayTasks: [],
}

function buildSnapshot(): SpState {
  if (
    cachedSnapshot.connectionStatus === currentConnectionStatus &&
    cachedSnapshot.currentTask === currentTask &&
    cachedSnapshot.focusMode === currentFocusMode &&
    cachedSnapshot.tick === currentTick &&
    cachedSnapshot.todayStats === todayStats &&
    cachedSnapshot.projects === projects &&
    cachedSnapshot.todayTasks === todayTasks
  ) {
    return cachedSnapshot
  }
  cachedSnapshot = {
    connectionStatus: currentConnectionStatus,
    currentTask,
    focusMode: currentFocusMode,
    tick: currentTick,
    todayStats,
    projects,
    todayTasks,
  }
  return cachedSnapshot
}

function notify() {
  buildSnapshot()
  listeners.forEach(l => l())
}

function getSnapshot(): SpState {
  return cachedSnapshot
}

// ─── HTTP polling helpers ─────────────────────────────────────────────────────

async function fetchTodayStats(): Promise<void> {
  try {
    const res = await fetch(`${SP_BASE}/stats/today`)
    if (!res.ok) return
    const json = await res.json()
    if (json.ok && json.data) {
      todayStats = json.data as SpTodayStats
      notify()
    }
  } catch {
    // SP closed or API unreachable — ignore, SSE onerror handles status
  }
}

async function fetchProjects(): Promise<void> {
  try {
    const res = await fetch(`${SP_BASE}/projects`)
    if (!res.ok) return
    const json = await res.json()
    if (json.ok && Array.isArray(json.data)) {
      projects = json.data as SpProject[]
      notify()
    }
  } catch {
    // ignore
  }
}

async function fetchTodayTasks(): Promise<void> {
  try {
    const res = await fetch(`${SP_BASE}/tasks?tagId=TODAY&includeDone=true`)
    if (!res.ok) {
      console.warn(`[SP] Failed to fetch tasks: ${res.status} ${res.statusText}`)
      return
    }
    const json = await res.json()
    if (json.ok && Array.isArray(json.data)) {
      todayTasks = (json.data as SpTask[]).map((t) => ({
        id: t.id,
        title: t.title,
        isDone: t.isDone,
        projectId: t.projectId,
        timeSpent: t.timeSpent,
        timeEstimate: t.timeEstimate,
      }))
      notify()
    } else {
      console.warn('[SP] Unexpected tasks response format:', json)
    }
  } catch (err) {
    console.error('[SP] Error fetching tasks:', err)
  }
}

function startPolling() {
  // Clear any stale timers before registering fresh ones so that a reconnect
  // after a disconnect always gets a clean polling cycle rather than silently
  // skipping registration because the null-guard fires on stale timer IDs.
  stopPolling()
  fetchTodayStats()
  statsTimer = setInterval(fetchTodayStats, STATS_INTERVAL_MS)
  fetchProjects()
  projectsTimer = setInterval(fetchProjects, PROJECTS_INTERVAL_MS)
  fetchTodayTasks()
  tasksTimer = setInterval(fetchTodayTasks, TASKS_INTERVAL_MS)
}

function stopPolling() {
  if (statsTimer) { clearInterval(statsTimer); statsTimer = null }
  if (projectsTimer) { clearInterval(projectsTimer); projectsTimer = null }
  if (tasksTimer) { clearInterval(tasksTimer); tasksTimer = null }
}

// ─── SSE connection ───────────────────────────────────────────────────────────

function scheduleReconnect() {
  if (reconnectTimeout) return
  const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts), RECONNECT_MAX_MS)
  reconnectAttempts++
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null
    openSse()
  }, delay)
}

function closeSse() {
  if (es) {
    es.close()
    es = null
  }
}

function openSse() {
  closeSse()
  try {
    const source = new EventSource(SSE_URL)
    es = source

    source.onopen = () => {
      currentConnectionStatus = 'connected'
      reconnectAttempts = 0
      startPolling()
      notify()
    }

    source.onerror = () => {
      currentConnectionStatus = 'reconnecting'
      closeSse()
      stopPolling()
      notify()
      scheduleReconnect()
    }

    source.addEventListener('current-task', (e: MessageEvent) => {
      try {
        currentTask = JSON.parse(e.data) as SpCurrentTask | null
        notify()
        // A task just started/stopped/switched — refresh list + stats promptly
        // instead of waiting for the next poll tick.
        fetchTodayTasks()
        fetchTodayStats()
      } catch { /* ignore */ }
    })

    source.addEventListener('focus-mode', (e: MessageEvent) => {
      try {
        currentFocusMode = JSON.parse(e.data) as SpFocusMode
        notify()
      } catch { /* ignore */ }
    })

    source.addEventListener('tick', (e: MessageEvent) => {
      try {
        currentTick = JSON.parse(e.data) as SpTickPayload
        // Sync focusMode from tick for sub-second accuracy
        if (currentTick.focusMode) {
          currentFocusMode = currentTick.focusMode
        }
        notify()
      } catch { /* ignore */ }
    })
  } catch {
    currentConnectionStatus = 'reconnecting'
    notify()
    scheduleReconnect()
  }
}

function tearDown() {
  closeSse()
  stopPolling()
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  currentConnectionStatus = 'disconnected'
  reconnectAttempts = 0
  notify()
}

// ─── useSyncExternalStore wiring ──────────────────────────────────────────────

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  connectionCount++
  if (connectionCount === 1) {
    // First subscriber — open connection
    currentConnectionStatus = 'reconnecting'
    openSse()
  }
  return () => {
    listeners.delete(listener)
    connectionCount--
    if (connectionCount === 0) {
      tearDown()
    }
  }
}

// ─── Public hook ─────────────────────────────────────────────────────────────

/**
 * Read live Super Productivity state in any React component.
 * All components share one SSE connection.
 */
export function useSuperProductivity(): SpState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

/**
 * Activity state — what the user is actually doing right now.
 * Drives both theming and the status label.
 */
export type ActivityState = 'focus' | 'break' | 'paused' | 'overtime' | 'idle'

export function deriveActivityState(
  focusMode: SpFocusMode | null,
  currentTask: SpCurrentTask | null,
): ActivityState {
  if (focusMode?.isBreakActive) return 'break'
  if (focusMode?.isSessionPaused) return 'paused'
  if (focusMode?.isInOvertime) return 'overtime'
  if (focusMode?.isSessionRunning || focusMode?.isRunning || currentTask) return 'focus'
  return 'idle'
}

/**
 * Human-readable status combining connection + activity for the overlay chip.
 * Note: when SP is unreachable we can't tell "app closed" from "API disabled"
 * (both mean nothing is listening on the port), so we report one honest state.
 */
export function deriveStatus(
  connectionStatus: SpConnectionStatus,
  activity: ActivityState,
): { label: string; tone: 'live' | 'warn' | 'idle' } {
  if (connectionStatus === 'reconnecting') return { label: 'Reconnecting…', tone: 'warn' }
  if (connectionStatus === 'disconnected') return { label: 'SP Offline', tone: 'warn' }
  // connected:
  switch (activity) {
    case 'focus': return { label: 'Focus', tone: 'live' }
    case 'overtime': return { label: 'Overtime', tone: 'live' }
    case 'break': return { label: 'Break', tone: 'live' }
    case 'paused': return { label: 'Paused', tone: 'idle' }
    case 'idle': return { label: 'Idle', tone: 'idle' }
  }
}

/**
 * Map SP focus mode + current task to a simple timerMode string.
 * Used for theming (yellow = focus, green = break).
 * @deprecated prefer deriveActivityState for richer states
 */
export function deriveTimerMode(
  focusMode: SpFocusMode | null,
  currentTask: SpCurrentTask | null,
): 'focus' | 'break' | 'idle' {
  const a = deriveActivityState(focusMode, currentTask)
  if (a === 'break') return 'break'
  if (a === 'idle' || a === 'paused') return 'idle'
  return 'focus'
}

/**
 * Resolve project name from project list.
 */
export function resolveProjectName(
  projectId: string | undefined | null,
  projectList: SpProject[],
): string | null {
  if (!projectId) return null
  return projectList.find(p => p.id === projectId)?.title ?? null
}

/** Format milliseconds → HH:MM:SS or MM:SS */
export function formatMs(ms: number, alwaysHours = false): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0 || alwaysHours) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format milliseconds → human-readable duration like "1h 23m" */
export function formatMsHuman(ms: number): string {
  const totalMin = Math.floor(ms / 60_000)
  if (totalMin < 1) return '< 1m'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
