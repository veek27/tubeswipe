'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore, OutlierVideo } from '@/store/useStore'
import { useEffect, useState, useRef } from 'react'
import EmailGate from '@/components/EmailGate'
import AppNav from '@/components/AppNav'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { bg: string; border: string; text: string }> = {
    EXCELLENT: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    BON: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
    MOYEN: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
    FAIBLE: { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400' },
  }
  const c = config[verdict] || config.MOYEN
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg ${c.bg} border ${c.border} ${c.text} text-xs font-bold`}>
      {verdict}
    </span>
  )
}

function OutlierBadge({ multiplier }: { multiplier: number }) {
  if (multiplier <= 0) return null
  const isOutlier = multiplier >= 2
  const color = multiplier >= 5
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    : multiplier >= 2
      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
      : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <span className="text-lg font-black font-mono">{multiplier}x</span>
      <span className="text-[10px] font-semibold uppercase">{isOutlier ? 'Outlier' : 'Standard'}</span>
    </div>
  )
}

function OutlierCard({ video, onAnalyze }: { video: OutlierVideo; onAnalyze: (url: string) => void }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden group hover:border-accent/30 transition-all flex-shrink-0 w-[200px] sm:w-auto">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            video.multiplier >= 5 ? 'bg-emerald-500/90 text-white' :
            video.multiplier >= 2 ? 'bg-amber-500/90 text-white' :
            'bg-zinc-600/90 text-white'
          }`}>{video.multiplier}x</span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[11px] font-semibold leading-snug mb-2 line-clamp-2">{video.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-dim">{video.viewsPerDay} vues/j</span>
          <button onClick={() => onAnalyze(video.url)} className="text-[10px] font-semibold text-accent hover:text-accent-hover transition-colors">
            Analyser →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const router = useRouter()
  const { videoInfo, analysis, outlierData, youtubeUrl, user, setSavedAnalysisId, setYoutubeUrl, hasMounted, setMounted } = useStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => { if (!hasMounted) setMounted() }, [hasMounted, setMounted])
  useEffect(() => { if (!analysis) router.replace('/') }, [analysis, router])
  useEffect(() => { if (user) setIsAuthenticated(true) }, [user])

  useEffect(() => {
    if (isAuthenticated && user && analysis && !savedRef.current) {
      savedRef.current = true
      fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, youtubeUrl, videoInfo, analysis }),
      })
        .then(res => res.json())
        .then(data => { if (data.analysis?.id) setSavedAnalysisId(data.analysis.id) })
        .catch(console.error)
    }
  }, [isAuthenticated, user, analysis, youtubeUrl, videoInfo, setSavedAnalysisId])

  if (!analysis || !videoInfo) return null

  const handleAuthenticated = (userId: string) => { setIsAuthenticated(true); void userId }

  const handleAnalyzeOutlier = (url: string) => {
    setYoutubeUrl(url)
    router.push('/dashboard')
  }

  const multiplier = outlierData?.multiplier || 0
  const isOutlier = outlierData?.isOutlier || false
  const channelAvgVPD = outlierData?.channelAvgViewsPerDay || 0
  const currentVPD = outlierData?.currentViewsPerDay || 0
  const currentDaysOld = outlierData?.currentDaysOld || 0
  const outlierVideos = outlierData?.outlierVideos || []

  // Backward compat with old analysis format
  const pointsForts = analysis.points_forts || analysis.analyse_contenu?.points_forts || analysis.pourquoi?.elements_cles || []
  const pointsFaibles = analysis.points_faibles || analysis.analyse_contenu?.axes_amelioration || []
  const verdict = analysis.verdict || (isOutlier ? 'BON' : 'MOYEN')
  const verdictExplication = analysis.verdict_explication || analysis.analyse_contenu?.sujet_attire || ''
  const adaptabilite = analysis.adaptabilite || null
  const conseilFinal = analysis.conseil_final || analysis.tendances?.conseil || ''

  const ageLabel = currentDaysOld < 30 ? `${currentDaysOld}j` : currentDaysOld < 365 ? `${Math.round(currentDaysOld / 30)} mois` : `${Math.round(currentDaysOld / 365 * 10) / 10} ans`

  return (
    <div className="min-h-screen px-5 py-10">
      <AppNav />
      {!isAuthenticated && <EmailGate onAuthenticated={handleAuthenticated} />}

      <div className={`max-w-page mx-auto pt-12 transition-all duration-500 ${!isAuthenticated ? 'blur-sm pointer-events-none select-none' : ''}`}>

        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-8">
          <button
            onClick={() => router.push(user ? '/dashboard' : '/')}
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {user ? 'Tableau de bord' : 'Nouvelle analyse'}
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-accent rounded-full" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Résultats de l&apos;analyse</h1>
          </div>
        </motion.div>

        {/* === TOP ROW: Video + Verdict + Outlier === */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

          {/* Video card */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full aspect-video object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-sm leading-snug mb-2">{videoInfo.title || 'Vidéo YouTube'}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                {videoInfo.channelTitle !== 'N/A' && <span>{videoInfo.channelTitle}</span>}
                {videoInfo.views !== 'N/A' && <span>{videoInfo.views} vues</span>}
                {videoInfo.publishedAt !== 'N/A' && <span>{videoInfo.publishedAt}</span>}
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <VerdictBadge verdict={verdict} />
                <span className="text-xs text-text-dim">Verdict</span>
              </div>
              <p className="text-lg font-bold mb-2">{analysis.sujet}</p>
              <p className="text-sm text-text-muted font-mono mb-3">{analysis.angle}</p>
              <p className="text-xs text-text-dim leading-relaxed">{verdictExplication}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {analysis.mots_cles?.map((kw: string, i: number) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Outlier Score */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-2xl p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Score Outlier</p>
            {multiplier > 0 ? (
              <>
                <OutlierBadge multiplier={multiplier} />
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim">Moy. chaîne</span>
                    <span className="text-text-muted font-mono">{channelAvgVPD} v/j</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim">Cette vidéo</span>
                    <span className="text-text-primary font-mono font-semibold">{currentVPD} v/j</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim">Âge</span>
                    <span className="text-text-muted font-mono">{ageLabel}</span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOutlier ? 'bg-gradient-to-r from-amber-500 to-emerald-500' : 'bg-zinc-500'}`}
                    style={{ width: `${Math.min(multiplier / 10 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-dim mt-2">
                  {isOutlier
                    ? `${multiplier}x la moyenne — c'est une outlier.`
                    : multiplier >= 1 ? 'Performance standard.' : 'Sous la moyenne.'}
                </p>
              </>
            ) : (
              <p className="text-xs text-text-dim">Données insuffisantes pour calculer le score.</p>
            )}
          </div>
        </motion.div>

        {/* === MIDDLE ROW: Plan + Points forts/faibles === */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }} className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

          {/* Plan */}
          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Plan reconstruit</p>
            <div className="space-y-3">
              {analysis.plan?.map((p: { partie: string; description: string }, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.partie}</p>
                    <p className="text-text-muted text-xs mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points forts + faibles side by side */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Points forts */}
            <div className="bg-surface border border-border rounded-2xl p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Points forts</p>
              </div>
              <div className="space-y-2">
                {pointsForts.map((el: string, i: number) => (
                  <p key={i} className="text-xs text-text-muted leading-relaxed pl-1">• {el}</p>
                ))}
              </div>
            </div>

            {/* Points faibles */}
            {pointsFaibles.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" /></svg>
                  </span>
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Points faibles</p>
                </div>
                <div className="space-y-2">
                  {pointsFaibles.map((el: string, i: number) => (
                    <p key={i} className="text-xs text-text-muted leading-relaxed pl-1">• {el}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* === BOTTOM ROW: Adaptabilité + Conseil === */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Adaptabilité */}
          {adaptabilite && (
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-purple-500/15 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Adaptabilité</p>
                <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold ${
                  adaptabilite.score === 'FORT' ? 'bg-emerald-500/15 text-emerald-400' :
                  adaptabilite.score === 'MOYEN' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                }`}>{adaptabilite.score}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-3">{adaptabilite.explication}</p>
              <div className="bg-surface-2 border border-border rounded-lg p-3">
                <p className="text-xs text-text-primary leading-relaxed">
                  <span className="font-bold text-accent">💡</span> {adaptabilite.suggestion}
                </p>
              </div>
            </div>
          )}

          {/* Conseil final */}
          {conseilFinal && (
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-accent/15 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Conseil</p>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{conseilFinal}</p>
            </div>
          )}
        </motion.div>

        {/* === OUTLIER SUGGESTIONS === */}
        {outlierVideos.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }} className="mb-5">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-purple-500/15 flex items-center justify-center">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <p className="text-sm font-bold">Vidéos outliers sur cette chaîne</p>
              </div>
              <p className="text-[11px] text-text-dim mb-4 ml-8">Ces vidéos surperforment — des sujets potentiellement meilleurs à adapter.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {outlierVideos.map((video) => (
                  <OutlierCard key={video.videoId} video={video} onAnalyze={handleAnalyzeOutlier} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.3 }} className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/niche')}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all flex items-center gap-3"
          >
            Adapter à ma niche
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
