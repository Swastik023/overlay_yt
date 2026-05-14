import { useEffect } from 'react'
import { useDensityStore } from '../store/useDensityStore'

export function useKeyboardShortcuts() {
  const setDensityMode = useDensityStore((s) => s.setMode)
  const toggleLeftSidebar = useDensityStore((s) => s.toggleLeftSidebar)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Prevent default for our shortcuts
      const shortcutKeys = ['1', '2', '3', 'c', 'C']
      if (shortcutKeys.includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case '1': // 1 - Stream mode
          setDensityMode('stream')
          break

        case '2': // 2 - Focus mode
          setDensityMode('focus')
          break

        case '3': // 3 - Break mode
          setDensityMode('break')
          break

        case 'c':
        case 'C': // C - Collapse sidebar
          toggleLeftSidebar()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [setDensityMode, toggleLeftSidebar])
}
