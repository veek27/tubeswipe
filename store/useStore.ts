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
  pourquoi: {
    sujet_attire: string
    hook_fonctionne: string
    structure_retient: string
    elements_cles: string[]
  }
  tendances: {
    score: 'HOT' | 'WARM' | 'EVERGREEN'
    explication: string
    opportunite: string
    conseil: string
  }
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
    const raw = localStorage.getItem('tubeswipe-user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function persistUser(user: UserData | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('tubeswipe-user', JSON.stringify(user))
  } else {
    localStorage.removeItem('tubeswipe-user')
  }
}

interface AppState {
  youtubeUrl: string
  videoInfo: VideoInfo | null
  analysis: Analysis | null
  nicheData: NicheData | null
  script: string | null
  savedAnalysisId: string | null
  isLoading: boolean
  loadingMessage: string
  user: UserData | null

  setYoutubeUrl: (url: string) => void
  setVideoInfo: (info: VideoInfo) => void
  setAnalysis: (analysis: Analysis) => void
  setNicheData: (data: NicheData) => void
  setScript: (script: string) => void
  setSavedAnalysisId: (id: string | null) => void
  setLoading: (loading: boolean, message?: string) => void
  setUser: (user: UserData | null) => void
  updateCredits: (credits: number) => void
  logout: () => void
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  youtubeUrl: '',
  videoInfo: null,
  analysis: null,
  nicheData: null,
  script: null,
  savedAnalysisId: null,
  isLoading: false,
  loadingMessage: '',
  user: loadUser(),

  setYoutubeUrl: (url) => set({ youtubeUrl: url }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setAnalysis: (analysis) => set({ analysis }),
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
  logout: () => {
    persistUser(null)
    set({ user: null })
  },
  reset: () => set({
    youtubeUrl: '',
    videoInfo: null,
    analysis: null,
    nicheData: null,
    script: null,
    savedAnalysisId: null,
    isLoading: false,
    loadingMessage: '',
  }),
}))
