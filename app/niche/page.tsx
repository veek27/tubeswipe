'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export default function NichePage() {
  const router = useRouter()
  const { analysis, setNicheData, setScript, setLoading: setStoreLoading } = useStore()

  const [niche, setNiche] = useState('')
  const [icp, setIcp] = useState('')
  const [angle, setAngle] = useState('')
  const [style, setStyle] = useState('')
  const [extra, setExtra] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!analysis) router.replace('/')
  }, [analysis, router])

  if (!analysis) return null

  const handleGenerate = async () => {
    setError('')
    if (!niche.trim() || !icp.trim()) {
      setError('Renseigne au minimum ta niche et ton ICP.')
      return
    }

    const nicheData = { niche: niche.trim(), icp: icp.trim(), angle: angle.trim(), style: style.trim(), extra: extra.trim() }
    setNicheData(nicheData)
    setLoading(true)
    setStoreLoading(true, 'Génération du script...')

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, ...nicheData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      const data = await res.json()
      setScript(data.script)
      setStoreLoading(false)
      router.push('/script')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setError(message)
      setLoading(false)
      setStoreLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/analyze')}
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l&apos;analyse
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-accent rounded-full" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Ta niche & ton audience</h1>
          </div>
          <p className="text-text-muted text-sm ml-4">
            On va adapter le sujet &quot;<span className="text-text-primary font-medium">{analysis.sujet}</span>&quot; à ton positionnement
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-5">
            {/* Niche + ICP side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Ma niche / thématique <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="ex: fitness pour femmes actives"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Mon ICP (profil client idéal) <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={icp}
                  onChange={(e) => setIcp(e.target.value)}
                  placeholder="ex: femmes 28-40 ans, cadres, peu de temps"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
                />
              </div>
            </div>

            {/* Angle */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Mon angle / positionnement unique
              </label>
              <input
                type="text"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="ex: méthode minimaliste, 20 min/jour, sans salle de sport"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Ton style de contenu <span className="text-text-dim">(optionnel)</span>
              </label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="ex: direct, pratique, avec de l'humour, format storytelling"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
              />
            </div>

            {/* Extra */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Infos supplémentaires <span className="text-text-dim">(optionnel)</span>
              </label>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={3}
                placeholder="Contraintes, valeurs, éléments importants à inclure..."
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs mt-4 font-mono">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => router.push('/analyze')}
              className="px-5 py-3 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 text-sm font-medium transition-all"
            >
              Retour
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Générer mon script
                </>
              )}
            </button>
          </div>

          {/* Loading message */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-3 text-text-muted text-xs"
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 1.4s infinite 0.4s' }} />
              </div>
              Réécriture du script adapté à ta niche...
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
