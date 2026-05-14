import { useState, useEffect } from 'react'

/**
 * Wall clock hook — updates once per second.
 * Isolated so only components that need the clock re-render.
 */
export function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return now
}
