import { useEffect, useState } from 'react'

export function SessionTimer() {
  const [sessionStart] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - sessionStart)
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStart])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    if (hours > 0) return `${hours}h${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="stat-pill">
      <span className="stat-icon">⏱</span>
      <span className="stat-value">{formatTime(elapsed)}</span>
    </div>
  )
}
