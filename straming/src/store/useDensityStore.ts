import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DensityMode = 'stream' | 'focus' | 'break'

interface DensityStore {
  mode: DensityMode
  isUserTyping: boolean
  leftSidebarCollapsed: boolean
  
  // Actions
  setMode: (mode: DensityMode) => void
  setUserTyping: (typing: boolean) => void
  toggleLeftSidebar: () => void
}

export const useDensityStore = create<DensityStore>()(
  persist(
    (set) => ({
      mode: 'stream',
      isUserTyping: false,
      leftSidebarCollapsed: false,

      setMode: (mode) => set({ mode }),
      setUserTyping: (typing) => set({ isUserTyping: typing }),
      toggleLeftSidebar: () => set((s) => ({ leftSidebarCollapsed: !s.leftSidebarCollapsed })),
    }),
    {
      name: 'density-mode',
      partialize: (state) => ({
        mode: state.mode,
        leftSidebarCollapsed: state.leftSidebarCollapsed,
      }),
    }
  )
)
