'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import AppNav from '@/components/AppNav'

interface ChannelInfo {
  id: string
  name: string
  description: string
  thumbnail: string
  subscribers: string
  subscriberCount: number
  totalViews: string
  videoCount: number
  createdAt: string
  country: string
  recentVideos: { title: string; publishedAt: string }[]
}

interface Profile {
  id: string
  name: string
  niche: string
  icp: string
  angle: string
  style: string
  extra: string
  channelUrl?: string
  channelInfo?: ChannelInfo | null
}

// Profiles are now loaded exclusively from Supabase via API

export default function NichePage() {
  const router = useRouter()
  const { analysis, setNicheData, setScript, setLoading: setStoreLoading, user, updateCredits, hasMounted, setMounted } = useStore()
  const [showNoCredits, setShowNoCredits] = useState(false)

  const [niche, setNiche] = useState('')
  const [icp, setIcp] = useState('')
  const [angle, setAngle] = useState('')
  const [style, setStyle] = useState('')
  const [extra, setExtra] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [channelUrl, setChannelUrl] = useState('')
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [channelLoading, setChannelLoading] = useState(false)
  const [channelError, setChannelError] = useState('')

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!hasMounted) setMounted()
  }, [hasMounted, setMounted])

  useEffect(() => {
    if (!hasMounted) return
    if (!analysis) router.replace('/')
  }, [analysis, router, hasMounted])

  // Load profiles from Supabase
  useEffect(() => {
    if (!user) return
    fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => {
        const dbProfiles = (data.profiles || []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          niche: (p.niche as string) || '',
          icp: (p.icp as string) || '',
          angle: (p.angle as string) || '',
          style: (p.style as string) || '',
          extra: (p.extra as string) || '',
          channelUrl: (p.channel_url as string) || '',
          channelInfo: p.channel_info as ChannelInfo | null,
        }))
        setProfiles(dbProfiles)
      })
      .catch(console.error)
  }, [user])

  const selectProfile = useCallback((profile: Profile) => {
    setNiche(profile.niche)
    setIcp(profile.icp)
    setAngle(profile.angle)
    setStyle(profile.style)
    setExtra(profile.extra)
    setChannelUrl(profile.channelUrl || '')
    setChannelInfo(profile.channelInfo || null)
    setActiveProfileId(profile.id)
  }, [])

  const handleFetchChannel = async () => {
    if (!channelUrl.trim()) return
    setChannelError('')
    setChannelLoading(true)
    setChannelInfo(null)

    try {
      const res = await fetch('/api/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: channelUrl.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Impossible de récupérer la chaîne')
      }

      const data = await res.json()
      setChannelInfo(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setChannelError(message)
    } finally {
      setChannelLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return
    if (!niche.trim() && !icp.trim()) return
    if (!user) return

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: profileName.trim(),
          niche: niche.trim(),
          icp: icp.trim(),
          angle: angle.trim(),
          style: style.trim(),
          extra: extra.trim(),
          channelUrl: channelUrl.trim(),
          channelInfo,
        }),
      })
      const data = await res.json()
      if (data.profile) {
        const saved: Profile = {
          id: data.profile.id,
          name: data.profile.name,
          niche: data.profile.niche || '',
          icp: data.profile.icp || '',
          angle: data.profile.angle || '',
          style: data.profile.style || '',
          extra: data.profile.extra || '',
          channelUrl: data.profile.channel_url || '',
          channelInfo: data.profile.channel_info || null,
        }
        setProfiles([...profiles, saved])
        setActiveProfileId(saved.id)
      }
    } catch (e) {
      console.error('Error saving profile:', e)
    }

    setShowSaveModal(false)
    setProfileName('')
  }

  const handleDeleteProfile = async (id: string) => {
    if (!user) return
    try {
      await fetch('/api/profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: id, userId: user.id }),
      })
      setProfiles(profiles.filter(p => p.id !== id))
      if (activeProfileId === id) setActiveProfileId(null)
    } catch (e) {
      console.error('Error deleting profile:', e)
    }
    setShowDeleteConfirm(null)
  }

  if (!analysis) return null

  const handleGenerate = async () => {
    setError('')
    if (!niche.trim() || !icp.trim()) {
      setError('Renseigne au minimum ta niche et ton ICP.')
      return
    }

    // Check credits before starting
    if (!user || user.credits <= 0) {
      setShowNoCredits(true)
      return
    }

    const nicheData = {
      niche: niche.trim(),
      icp: icp.trim(),
      angle: angle.trim(),
      style: style.trim(),
      extra: extra.trim(),
      channelInfo: channelInfo || undefined,
    }
    setNicheData(nicheData)
    setLoading(true)
    setStoreLoading(true, 'Génération du script...')

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, ...nicheData, userId: user.id }),
      })

      if (!res.ok) {
        let errorMsg = 'Erreur lors de la génération'
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch {
          if (res.status === 504) errorMsg = 'Le serveur a mis trop de temps. Réessaie.'
          else if (res.status === 503) errorMsg = 'L\'IA est temporairement surchargée. Attends 1 minute et réessaie.'
          else errorMsg = `Erreur serveur (${res.status}). Réessaie.`
        }
        throw new Error(errorMsg)
      }

      let data
      try {
        data = await res.json()
      } catch {
        throw new Error('Réponse invalide du serveur. Réessaie.')
      }

      // Credits already deducted server-side — update local state
      if (data.credits !== undefined) {
        updateCredits(data.credits)
      }

      setScript(data.script)
      setStoreLoading(false)
      router.push('/script')
    } catch (e: unknown) {
      // Script generation failed — NO credit consumed
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setError(message)
      setLoading(false)
      setStoreLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <AppNav />
      <div className="max-w-[800px] mx-auto pt-12">
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

        {/* Saved Profiles */}
        {profiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-6"
          >
            <p className="text-text-muted text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Mes profils sauvegardés
            </p>
            <div className="flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <div key={profile.id} className="group relative">
                  <button
                    onClick={() => selectProfile(profile)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeProfileId === profile.id
                        ? 'bg-accent text-white'
                        : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-accent/50'
                    }`}
                  >
                    {profile.name}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(profile.id) }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface-2 border border-border text-text-dim hover:text-red-400 hover:border-red-400/50 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ×
                  </button>
                  <AnimatePresence>
                    {showDeleteConfirm === profile.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 z-20 bg-surface border border-border rounded-xl p-3 shadow-xl shadow-black/30 whitespace-nowrap"
                      >
                        <p className="text-xs text-text-muted mb-2">Supprimer ce profil ?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                          >
                            Supprimer
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 rounded-lg bg-surface-2 text-text-muted text-xs font-medium hover:text-text-primary transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Starter lock: must use profile */}
        {user?.plan === 'starter' && profiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted">Crée d&apos;abord ton profil pour générer des scripts.</p>
              <p className="text-[10px] text-amber-400 font-medium mt-0.5">Avec le plan Starter, les scripts sont générés via ton profil.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              Créer mon profil
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        )}

        {user?.plan === 'starter' && profiles.length > 0 && !activeProfileId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-text-muted">Sélectionne ton profil ci-dessus pour continuer.</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-6">
            {/* Niche */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Ma niche / thématique <span className="text-accent">*</span>
              </label>
              <p className="text-text-dim text-xs mb-3">De quoi parle ta chaîne ? Quel est ton domaine principal ?</p>
              <textarea
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                rows={2}
                placeholder="ex: Je parle de fitness et nutrition pour les femmes actives qui veulent se remettre en forme sans passer 2h à la salle"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
                readOnly={user?.plan === 'starter' && !!activeProfileId}
              />
            </div>

            {/* ICP */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Mon audience cible (ICP) <span className="text-accent">*</span>
              </label>
              <p className="text-text-dim text-xs mb-3">Qui regarde tes vidéos ? Âge, situation, problèmes, aspirations...</p>
              <textarea
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
                rows={2}
                placeholder="ex: Femmes 25-40 ans, cadres ou entrepreneures, peu de temps, veulent des résultats visibles rapidement sans régime restrictif"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
                readOnly={user?.plan === 'starter' && !!activeProfileId}
              />
            </div>

            {/* Angle */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Mon angle / positionnement unique
              </label>
              <p className="text-text-dim text-xs mb-3">Qu&apos;est-ce qui te différencie des autres créateurs sur le même sujet ?</p>
              <textarea
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                rows={2}
                placeholder="ex: Approche minimaliste, 20 min/jour max, sans salle de sport, basée sur la science. Je démonte les mythes du fitness traditionnel."
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
                readOnly={user?.plan === 'starter' && !!activeProfileId}
              />
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Ton style de contenu <span className="text-text-dim">(optionnel)</span>
              </label>
              <p className="text-text-dim text-xs mb-3">Comment tu parles à ta caméra ? Le ton, le format, l&apos;énergie...</p>
              <textarea
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                rows={2}
                placeholder="ex: Direct et cash, pas de blabla, format face caméra avec des coupes dynamiques, un peu d'humour sarcastique"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
                readOnly={user?.plan === 'starter' && !!activeProfileId}
              />
            </div>

            {/* Extra */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Infos supplémentaires <span className="text-text-dim">(optionnel)</span>
              </label>
              <p className="text-text-dim text-xs mb-3">Tout ce qui peut aider à personnaliser le script : ton produit, tes valeurs, un CTA spécifique...</p>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={3}
                placeholder="ex: Je vends un programme en ligne à 97€, je veux que le script mentionne subtilement mon offre. Je ne veux jamais de body shaming dans mes contenus."
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all resize-y"
              />
            </div>
          </div>
        </motion.div>

        {/* YouTube Channel Section — Pro only */}
        {user?.plan !== 'pro' ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-purple-500/10 border border-purple-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-muted font-medium">Connecte ta chaîne YouTube</p>
              <p className="text-[10px] text-purple-400 mt-0.5">Enrichis tes scripts avec les données de ta chaîne — Plan Pro</p>
            </div>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              Pro
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 bg-surface border border-border rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#E40000">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Ta chaîne YouTube
              </h3>
              <p className="text-text-dim text-xs">Ajoute ta chaîne pour enrichir encore plus le script</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => { setChannelUrl(e.target.value); setChannelError('') }}
              onKeyDown={(e) => e.key === 'Enter' && !channelLoading && handleFetchChannel()}
              placeholder="youtube.com/@tachaîne ou lien de ta chaîne"
              className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
              disabled={channelLoading}
            />
            <button
              onClick={handleFetchChannel}
              disabled={channelLoading || !channelUrl.trim()}
              className="px-5 py-3 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary hover:border-accent/50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {channelLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-text-dim/30 border-t-text-muted rounded-full animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Analyser ma chaîne
                </>
              )}
            </button>
          </div>

          {channelError && (
            <p className="text-red-400 text-xs mt-3 font-mono">{channelError}</p>
          )}

          {/* Channel Info Card */}
          <AnimatePresence>
            {channelInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5"
              >
                <div className="bg-surface-2 border border-border rounded-xl p-5">
                  {/* Channel header */}
                  <div className="flex items-start gap-4 mb-5">
                    {channelInfo.thumbnail && (
                      <img
                        src={channelInfo.thumbnail}
                        alt={channelInfo.name}
                        className="w-14 h-14 rounded-full border-2 border-border object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-text-primary text-base truncate">{channelInfo.name}</h4>
                      {channelInfo.description && (
                        <p className="text-text-dim text-xs mt-1 line-clamp-2">{channelInfo.description}</p>
                      )}
                    </div>
                    {/* Remove channel button */}
                    <button
                      onClick={() => { setChannelInfo(null); setChannelUrl('') }}
                      className="ml-auto flex-shrink-0 text-text-dim hover:text-red-400 transition-colors"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-surface border border-border rounded-lg p-3 text-center">
                      <p className="text-accent font-bold text-lg font-mono">{channelInfo.subscribers}</p>
                      <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-0.5">Abonnés</p>
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-3 text-center">
                      <p className="text-text-primary font-bold text-lg font-mono">{channelInfo.totalViews}</p>
                      <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-0.5">Vues totales</p>
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-3 text-center">
                      <p className="text-text-primary font-bold text-lg font-mono">{channelInfo.videoCount}</p>
                      <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-0.5">Vidéos</p>
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-3 text-center">
                      <p className="text-text-primary font-bold text-lg font-mono">{channelInfo.country}</p>
                      <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-0.5">Pays</p>
                    </div>
                  </div>

                  {/* Recent videos */}
                  {channelInfo.recentVideos.length > 0 && (
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-2">Dernières vidéos</p>
                      <div className="space-y-1.5">
                        {channelInfo.recentVideos.map((video, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-text-dim font-mono w-4 text-right flex-shrink-0">{i + 1}.</span>
                            <span className="text-text-primary truncate">{video.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-text-dim text-xs flex items-center gap-1.5">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Ces infos seront utilisées pour personnaliser ton script
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mt-4 font-mono">{error}</p>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-6"
        >
          <button
            onClick={() => router.push('/analyze')}
            className="px-5 py-3 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 text-sm font-medium transition-all"
          >
            Retour
          </button>

          {user?.plan !== 'free' && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-5 py-3 rounded-xl border border-accent/30 text-accent hover:bg-accent/10 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Sauvegarder ce profil
          </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (user?.plan === 'starter' && !activeProfileId)}
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
        </motion.div>

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
      </div>

      {/* No Credits Modal */}
      <AnimatePresence>
        {showNoCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNoCredits(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-black/40 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Plus de crédits</h3>
              <p className="text-text-muted text-sm mb-6">
                Tu as utilisé ton crédit gratuit. Passe sur un forfait pour continuer à générer des scripts.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                Voir les forfaits
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => setShowNoCredits(false)}
                className="mt-3 text-text-dim text-xs hover:text-text-muted transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Profile Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-text-primary mb-1">Sauvegarder ce profil</h3>
              <p className="text-text-dim text-xs mb-2">Donne un nom à ce profil pour le retrouver facilement.</p>
              {channelInfo && (
                <p className="text-accent text-xs mb-4 flex items-center gap-1.5">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  La chaîne {channelInfo.name} sera aussi sauvegardée
                </p>
              )}

              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                placeholder="ex: Ma chaîne fitness, Mon podcast tech..."
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary text-sm font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={!profileName.trim()}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sauvegarder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
