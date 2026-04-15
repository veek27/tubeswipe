'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore, OutlierData, OutlierVideo } from '@/store/useStore'
import { useEffect, useState, useRef } from 'react'
import EmailGate from '@/components/EmailGate'
import AppNav from '@/components/AppNav'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

function MultiplierBadge({ multiplier, isOutlier }: { multiplier: number; isOutlier: boolean }) {
  if (multiplier <= 0) return null

  const getColor = () => {
    if (multiplier >= 5) return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' }
    if (multiplier >= 2) return { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' }
    return { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400', glow: '' }
  }

  const color = getColor()
  const label = isOutlier ? 'Outlier' : 'Standard'

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl ${color.bg} border ${color.border} ${color.glow ? `shadow-lg ${color.glow}` : ''}`}>
      <span className={`text-2xl font-black font-mono ${color.text}`}>{multiplier}x</span>
      <div className="flex flex-col">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.text}`}>{label}</span>
        <span className="text-[10px] text-text-dim">vs moyenne chaîne</span>
      </div>
    </div>
  )
}

function OutlierCard({ video, onAnalyze }: { video: OutlierVideo; onAnalyze: (url: string) => void }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden group hover:border-accent/30 transition-all">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
            video.multiplier >= 5 ? 'bg-emerald-500/90 text-white' :
            video.multiplier >= 2 ? 'bg-amber-500/90 text-white' :
            'bg-zinc-600/90 text-white'
          }`}>
            {video.multiplier}x
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold leading-snug mb-2 line-clamp-2">{video.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-dim">{video.viewsFormatted} vues</span>
          <button
            onClick={() => onAnalyze(video.url)}
            className="text-[10px] font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            Analyser
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

  useEffect(() => {
    if (!hasMounted) setMounted()
  }, [hasMounted, setMounted])

  useEffect(() => {
    if (!analysis) router.replace('/')
  }, [analysis, router])

  useEffect(() => {
    if (user) setIsAuthenticated(true)
  }, [user])

  // Save analysis to Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated && user && analysis && !savedRef.current) {
      savedRef.current = true
      fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, youtubeUrl, videoInfo, analysis }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.analysis?.id) setSavedAnalysisId(data.analysis.id)
        })
        .catch(console.error)
    }
  }, [isAuthenticated, user, analysis, youtubeUrl, videoInfo, setSavedAnalysisId])

  if (!analysis || !videoInfo) return null

  const handleAuthenticated = (userId: string) => {
    setIsAuthenticated(true)
    void userId
  }

  const handleAnalyzeOutlier = (url: string) => {
    setYoutubeUrl(url)
    router.push('/dashboard')
  }

  const trendColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    HOT: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'HOT' },
    WARM: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'WARM' },
    EVERGREEN: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'EVERGREEN' },
  }

  const trend = trendColors[analysis.tendances?.score] || trendColors.WARM

  // Use new analyse_contenu if available, fallback to old pourquoi
  const contenu = analysis.analyse_contenu || (analysis.pourquoi ? {
    sujet_attire: analysis.pourquoi.sujet_attire,
    hook_analyse: analysis.pourquoi.hook_fonctionne,
    structure_analyse: analysis.pourquoi.structure_retient,
    points_forts: analysis.pourquoi.elements_cles,
    axes_amelioration: [],
  } : null)

  const multiplier = outlierData?.multiplier || 0
  const isOutlier = outlierData?.isOutlier || false
  const channelAvg = outlierData?.channelAvgViews || 0
  const outlierVideos = outlierData?.outlierVideos || []

  // Dynamic section title based on outlier status
  const performanceTitle = isOutlier
    ? 'Pourquoi cette vidéo surperforme'
    : multiplier > 0 && multiplier < 1
      ? 'Analyse du contenu'
      : 'Ce qui rend cette vidéo intéressante'

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
          <p className="text-text-muted text-sm ml-4">Voici ce qu&apos;on a trouvé sur cette vidéo</p>
        </motion.div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Sidebar — Video + Outlier Score */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1 space-y-5"
          >
            {/* Video card */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full aspect-video object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-sm leading-snug mb-3">{videoInfo.title || 'Vidéo YouTube'}</h3>
                <div className="space-y-2 text-xs text-text-muted">
                  {videoInfo.channelTitle !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {videoInfo.channelTitle}
                    </div>
                  )}
                  {videoInfo.views !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {videoInfo.views} vues
                    </div>
                  )}
                  {videoInfo.publishedAt !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {videoInfo.publishedAt}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Outlier Score Card */}
            {multiplier > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <h2 className="font-display font-bold text-sm">Score Outlier</h2>
                </div>

                <MultiplierBadge multiplier={multiplier} isOutlier={isOutlier} />

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">Moyenne chaîne</span>
                    <span className="text-text-muted font-mono">{channelAvg.toLocaleString('fr-FR')} vues</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">Cette vidéo</span>
                    <span className="text-text-primary font-mono font-semibold">{videoInfo.views} vues</span>
                  </div>

                  {/* Visual bar */}
                  <div className="mt-3 relative h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isOutlier ? 'bg-gradient-to-r from-amber-500 to-emerald-500' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${Math.min(multiplier / 10 * 100, 100)}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-text-dim mt-2">
                    {isOutlier
                      ? `Cette vidéo fait ${multiplier}x la moyenne — c'est une vraie outlier, un sujet qui a clairement touché l'audience.`
                      : multiplier >= 1
                        ? `Performance dans la moyenne de la chaîne. Le sujet n'est pas un outlier mais reste analysable.`
                        : `Cette vidéo performe en dessous de la moyenne. Regarde les suggestions ci-dessous pour des sujets plus porteurs.`
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bloc — Sujet & Plan */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h2 className="font-display font-bold text-lg">Sujet & Structure</h2>
              </div>

              <div className="mb-5">
                <p className="text-xl font-bold mb-2">{analysis.sujet}</p>
                <p className="text-text-muted text-sm font-mono">{analysis.angle}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {analysis.mots_cles?.map((kw: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Plan reconstruit</p>
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
            </motion.div>

            {/* Bloc — Analyse du contenu */}
            {contenu && (
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-surface border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h2 className="font-display font-bold text-lg">{performanceTitle}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div className="bg-surface-2 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                      <p className="text-xs font-bold text-accent uppercase">Le sujet</p>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{contenu.sujet_attire}</p>
                  </div>

                  <div className="bg-surface-2 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs font-bold text-amber-400 uppercase">Le hook</p>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{contenu.hook_analyse}</p>
                  </div>

                  <div className="bg-surface-2 border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      <p className="text-xs font-bold text-emerald-400 uppercase">La structure</p>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{contenu.structure_analyse}</p>
                  </div>
                </div>

                {/* Points forts */}
                <div className="bg-surface-2 border border-border rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Points forts</p>
                  <div className="space-y-2">
                    {contenu.points_forts?.map((el: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <p className="text-sm text-text-primary">{el}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Axes d'amélioration */}
                {contenu.axes_amelioration && contenu.axes_amelioration.length > 0 && (
                  <div className="bg-surface-2 border border-border rounded-xl p-4">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Axes d&apos;amélioration</p>
                    <div className="space-y-2">
                      {contenu.axes_amelioration.map((el: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          </span>
                          <p className="text-sm text-text-primary">{el}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bloc — Tendances */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h2 className="font-display font-bold text-lg">Tendances</h2>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${trend.bg} border ${trend.border} mb-4`}>
                <span className={`font-bold text-sm ${trend.text}`}>{trend.label}</span>
                <span className="text-text-muted text-xs">— Ce sujet en ce moment</span>
              </div>

              <p className="text-sm text-text-muted leading-relaxed mb-3">{analysis.tendances?.explication}</p>
              <p className="text-sm text-text-primary leading-relaxed mb-2">{analysis.tendances?.opportunite}</p>
              {analysis.tendances?.conseil && (
                <div className="bg-surface-2 border border-border rounded-lg p-3 mt-3">
                  <p className="text-xs text-text-muted">
                    <span className="font-bold text-accent">Conseil :</span> {analysis.tendances.conseil}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Outlier Suggestions */}
        {outlierVideos.length > 0 && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <h2 className="font-display font-bold text-lg">Vidéos outliers de cette chaîne</h2>
              </div>
              <p className="text-text-dim text-xs mb-5 ml-10">
                Ces vidéos surperforment la moyenne de la chaîne — des sujets potentiellement plus intéressants à adapter.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {outlierVideos.map((video) => (
                  <OutlierCard
                    key={video.videoId}
                    video={video}
                    onAnalyze={handleAnalyzeOutlier}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-8 flex justify-center"
        >
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
