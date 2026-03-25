'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export default function Home() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setYoutubeUrl, setVideoInfo, setAnalysis, setLoading: setStoreLoading } = useStore()

  const isValidYoutubeUrl = (u: string) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(u)
  }

  const handleAnalyze = async () => {
    setError('')
    if (!url.trim() || !isValidYoutubeUrl(url.trim())) {
      setError('Colle un lien YouTube valide pour continuer.')
      return
    }

    setLoading(true)
    setStoreLoading(true, 'Analyse de la vidéo en cours...')
    setYoutubeUrl(url.trim())

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errMsg = data.error || (res.status === 529 ? 'L\'IA est temporairement surchargée. Réessaie dans quelques secondes.' : `Erreur ${res.status} lors de l'analyse`)
        throw new Error(errMsg)
      }

      const data = await res.json()
      setVideoInfo(data.videoInfo)
      setAnalysis(data.analysis)
      setStoreLoading(false)
      router.push('/analyze')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setError(message)
      setLoading(false)
      setStoreLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[640px] text-center"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface mb-8 text-xs text-text-muted font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          TubeSwipe
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-[1.15] mb-3">
          Arrête d&apos;inventer des sujets.
          <br />
          <span className="text-accent">Copie ce qui marche déjà.</span>
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-sm mx-auto mb-10 leading-relaxed">
          Ton prochain script YouTube en 3 minutes, basé sur une vidéo qui cartonne déjà.
        </p>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl p-2 shadow-lg shadow-black/20"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
              placeholder="Colle un lien YouTube ici..."
              className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Analyser
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-xs mt-3 font-mono"
          >
            {error}
          </motion.p>
        )}

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-center gap-3 text-text-muted text-sm"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0.4s' }} />
            </div>
            Extraction du sujet, analyse des tendances...
          </motion.div>
        )}

        {/* 3 steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
        >
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-text-primary text-sm font-semibold mb-0.5">Colle le lien</p>
              <p className="text-text-dim text-xs leading-relaxed">La vidéo que tu veux swiper, juste au-dessus.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-text-primary text-sm font-semibold mb-0.5">Décris ta niche</p>
              <p className="text-text-dim text-xs leading-relaxed">Ton audience, ton positionnement, ton style — on adapte tout.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-text-primary text-sm font-semibold mb-0.5">Script prêt</p>
              <p className="text-text-dim text-xs leading-relaxed">Plus qu&apos;à allumer la caméra et tourner ta vidéo.</p>
            </div>
          </div>
        </motion.div>

        {/* Footer hint */}
        <p className="text-text-dim text-xs mt-10">
          Fonctionne avec n&apos;importe quelle vidéo YouTube publique
        </p>
      </motion.div>
    </div>
  )
}
