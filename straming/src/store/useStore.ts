import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  text: string
  completed: boolean
}

export interface NowPlaying {
  name: string
  artist: string
  album: string
  albumArt: string
  isPlaying: boolean
  progress: number
  duration: number
}

export interface CurrentActivity {
  project: string
  task: string
  stage: string
}

interface StreamStore {
  // Tasks
  tasks: Task[]
  dailyGoal: number

  // Spotify
  nowPlaying: NowPlaying
  spotifyAccessToken: string | null
  spotifyRefreshToken: string | null

  // Current Activity (for viewer context)
  currentActivity: CurrentActivity

  // Actions — Tasks
  addTask: (text: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  updateTask: (id: string, text: string) => void
  setDailyGoal: (n: number) => void

  // Actions — Spotify
  setNowPlaying: (track: NowPlaying) => void
  setSpotifyAccessToken: (token: string | null) => void
  setSpotifyRefreshToken: (token: string | null) => void

  // Actions — Current Activity
  setCurrentActivity: (activity: Partial<CurrentActivity>) => void
}

export const useStore = create<StreamStore>()(
  persist(
    (set) => ({
      tasks: [
        { id: '1', text: 'LeetCode Practice', completed: true },
        { id: '2', text: 'System Design', completed: false },
        { id: '3', text: 'DevOps Revision', completed: false },
        { id: '4', text: 'AI Research', completed: false },
        { id: '5', text: 'Project Work', completed: false },
      ],
      dailyGoal: 5,

      nowPlaying: {
        name: 'Deep Focus',
        artist: 'Lofi Beats',
        album: 'Study Music',
        albumArt: '',
        isPlaying: false,
        progress: 0,
        duration: 0,
      },
      spotifyAccessToken: null,
      spotifyRefreshToken: null,

      currentActivity: {
        project: 'OBS Stream Overlay',
        task: 'Building UI components',
        stage: 'In Progress',
      },

      // ── Task Actions ──────────────────────────────────────
      addTask: (text) =>
        set((s) => ({
          tasks: [...s.tasks, { id: Date.now().toString(), text, completed: false }],
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      updateTask: (id, text) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
        })),

      setDailyGoal: (n) => set({ dailyGoal: n }),

      // ── Spotify Actions ───────────────────────────────────
      setNowPlaying: (track) => set({ nowPlaying: track }),
      
      setSpotifyAccessToken: (token) => set({ spotifyAccessToken: token }),
      
      setSpotifyRefreshToken: (token) => set({ spotifyRefreshToken: token }),

      // ── Current Activity Actions ───────────────────────────
      setCurrentActivity: (activity) =>
        set((s) => ({
          currentActivity: { ...s.currentActivity, ...activity },
        })),
    }),
    {
      name: 'stream-dashboard',
      partialize: (state) => ({
        tasks: state.tasks,
        dailyGoal: state.dailyGoal,
        spotifyAccessToken: state.spotifyAccessToken,
        spotifyRefreshToken: state.spotifyRefreshToken,
        currentActivity: state.currentActivity,
      }),
    }
  )
)
