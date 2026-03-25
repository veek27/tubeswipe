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

interface AppState {
  youtubeUrl: string
  videoInfo: VideoInfo | null
  analysis: Analysis | null
  nicheData: NicheData | null
  script: string | null
  isLoading: boolean
  loadingMessage: string

  setYoutubeUrl: (url: string) => void
  setVideoInfo: (info: VideoInfo) => void
  setAnalysis: (analysis: Analysis) => void
  setNicheData: (data: NicheData) => void
  setScript: (script: string) => void
  setLoading: (loading: boolean, message?: string) => void
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  youtubeUrl: '',
  videoInfo: null,
  analysis: null,
  nicheData: null,
  script: null,
  isLoading: false,
  loadingMessage: '',

  setYoutubeUrl: (url) => set({ youtubeUrl: url }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setAnalysis: (analysis) => set({ analysis }),
  setNicheData: (data) => set({ nicheData: data }),
  setScript: (script) => set({ script }),
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
  reset: () => set({
    youtubeUrl: '',
    videoInfo: null,
    analysis: null,
    nicheData: null,
    script: null,
    isLoading: false,
    loadingMessage: '',
  }),
}))
