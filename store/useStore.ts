import { create } from 'zustand'

interface VideoInfo {
  title: string
  description: string
  thumbnail: string
  views: string
  publishedAt: string
  channelTitle: string
}

interface Analysis {
  sujet: string
  angle: string
  mots_cles: string[]
  plan: { partie: string; description: string }[]
  pourquoi?: {
    sujet_attire: string
    hook_fonctionne: string
    structure_retient: string
    elements_cles: string[]
  }
  analyse_contenu?: {
    sujet_attire: string
    hook_analyse: string
    structure_analyse: string
    points_forts: string[]
    axes_amelioration: string[]
  }
  tendances: {
    score: 'HOT' | 'WARM' | 'EVERGREEN'
    explication: string
    opportunite: string
    conseil: string
  }
}

export interface OutlierVideo {
  videoId: string
  title: string
  thumbnail: string
  views: number
  viewsFormatted: string
  publishedAt: string
  multiplier: number
  url: string
}

export interface OutlierData {
  channelAvgViews: number
  multiplier: number
  isOutlier: boolean
  outlierVideos: OutlierVideo[]
}

interface NicheData {
  niche: string
  icp: string
  angle: string
  style: string
  extra: string
}

export interface UserData {
  id: string
  first_name: string
  email: string
  credits: number
  plan: string
  isAdmin: boolean
}

function loadUser(): UserData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('tubeswap-user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function persistUser(user: UserData | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('tubeswap-user', JSON.stringify(user))
  } else {
    localStorage.removeItem('tubeswap-user')
  }
}

interface AppState {
  youtubeUrl: string
  videoInfo: VideoInfo | null
  analysis: Analysis | null
  outlierData: OutlierData | null
  nicheData: NicheData | null
  script: string | null
  savedAnalysisId: string | null
  isLoading: boolean
  loadingMessage: string
  user: UserData | null
  hasMounted: boolean

  setYoutubeUrl: (url: string) => void
  setVideoInfo: (info: VideoInfo) => void
  setAnalysis: (analysis: Analysis) => void
  setOutlierData: (data: OutlierData | null) => void
  setNicheData: (data: NicheData) => void
  setScript: (script: string) => void
  setSavedAnalysisId: (id: string | null) => void
  setLoading: (loading: boolean, message?: string) => void
  setUser: (user: UserData | null) => void
  updateCredits: (credits: number) => void
  refreshUser: () => Promise<void>
  setMounted: () => void
  logout: () => void
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  youtubeUrl: '',
  videoInfo: null,
  analysis: null,
  outlierData: null,
  nicheData: null,
  script: null,
  savedAnalysisId: null,
  isLoading: false,
  loadingMessage: '',
  user: null,
  hasMounted: false,

  setYoutubeUrl: (url) => set({ youtubeUrl: url }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setAnalysis: (analysis) => set({ analysis }),
  setOutlierData: (data) => set({ outlierData: data }),
  setNicheData: (data) => set({ nicheData: data }),
  setScript: (script) => set({ script }),
  setSavedAnalysisId: (id) => set({ savedAnalysisId: id }),
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  setUser: (user) => {
    persistUser(user)
    set({ user })
  },
  updateCredits: (credits) => set((state) => {
    if (!state.user) return {}
    const updated = { ...state.user, credits }
    persistUser(updated)
    return { user: updated }
  }),
  refreshUser: async () => {
    const currentUser = loadUser()
    if (!currentUser?.email) return
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh', email: currentUser.email }),
      })
      if (res.ok) {
        const { user } = await res.json()
        if (user) {
          const updated: UserData = {
            id: user.id,
            first_name: user.first_name,
            email: user.email,
            credits: user.credits,
            plan: user.plan || 'free',
            isAdmin: user.isAdmin || false,
          }
          persistUser(updated)
          set({ user: updated })
        }
      }
    } catch (e) {
      console.error('refreshUser error:', e)
    }
  },
  setMounted: () => {
    const saved = loadUser()
    set({ hasMounted: true, user: saved })
    // Auto-refresh credits from DB to avoid stale localStorage
    if (saved?.email) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh', email: saved.email }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.user) {
            const updated: UserData = {
              id: data.user.id,
              first_name: data.user.first_name,
              email: data.user.email,
              credits: data.user.credits,
              plan: data.user.plan || 'free',
              isAdmin: data.user.isAdmin || false,
            }
            persistUser(updated)
            set({ user: updated })
          }
        })
        .catch(() => {})
    }
  },
  logout: () => {
    persistUser(null)
    set({ user: null })
  },
  reset: () => set({
    youtubeUrl: '',
    videoInfo: null,
    analysis: null,
    outlierData: null,
    nicheData: null,
    script: null,
    savedAnalysisId: null,
    isLoading: false,
    loadingMessage: '',
  }),
}))
