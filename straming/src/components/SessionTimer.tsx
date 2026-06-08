/**
 * SessionTimer — shows the current focus session's elapsed time.
 *
 * Previously used Date.now() captured at component mount, which meant it showed
 * "how long the overlay tab has been open" rather than the actual session time.
 *
 * Now reads focusMode.elapsed directly from Super Productivity via SSE so the
 * displayed time always matches the real session (including across page reloads).
 * Falls back to a local wall-clock counter when SP is disconnected.
 */
import { useEffect, useState } from 'react'
import { useSuperProductivity } from '../hooks/useSuperProductivity'

export function SessionTimer() {
  // Local fallback: accumulate time only while SP is disconnected
  const [fallbackElapsed, setFallbackElapsed] = useState(0)
  const { focusMode, connectionStatus } = useSuperProductivity()

  const isConnected = connectionStatus === 'connected'
  const isRunning = focusMode?.isRunning ?? false

  useEffect(() => {
    // Only run the local counter when SP is unreachable and there's nothing
    // tracking yet — once SP reconnects we switch back to focusMode.elapsed.
    if (isConnected) {
      setFallbackElapsed(0)
      return
    }

    const interval = setInterval(() => {
      setFallbackElapsed((prev) => prev + 1000)
    }, 1000)
    return () => clearInterval(interval)
  }, [isConnected, isRunning])

  // Prefer live SP elapsed; fall back to local counter when disconnected
  const elapsedMs = isConnected ? (focusMode?.elapsed ?? 0) : fallbackElapsed

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) return `${hours}h${String(minutes).padStart(2, '0')}m`
    if (minutes > 0) return `${minutes}m${String(seconds).padStart(2, '0')}s`
    return `${seconds}s`
  }

  return (
    <div className="stat-pill">
      <span className="stat-icon">⏱</span>
      <span className="stat-value">{formatTime(elapsedMs)}</span>
    </div>
  )
}
