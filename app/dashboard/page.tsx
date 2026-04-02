'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

interface AnalysisRecord {
  id: string
  youtube_url: string
  video_title: string
  video_thumbnail: string
  channel_name: string
  analysis: Record<string, unknown>
  created_at: string
}

interface ScriptRecord {
  id: string
  script_content: string
  niche: string
  icp: string
  created_at: string
}

interface ProfileRecord {
  id: string
  name: string
  niche: string
  icp: string
  angle: string
  style: string
  extra: string
  channel_url: string
  channel_info: Record<string, unknown> | null
  created_at: string
}

type Tab = 'analyses' | 'scripts' | 'profiles'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useStore()
  const [tab, setTab] = useState<Tab>('analyses')
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [scripts, setScripts] = useState<ScriptRecord[]>([])
  const [profiles, setProfiles] = useState<ProfileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedScript, setExpandedScript] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showNewProfile, setShowNewProfile] = useState(false)
  const [newProfile, setNewProfile] = useState({ name: '', niche: '', icp: '', angle: '', style: '', extra: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/')
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })
        const data = await res.json()
        setAnalyses(data.analyses || [])
        setScripts(data.scripts || [])
        setProfiles(data.profiles || [])
      } catch (e) {
        console.error('Dashboard fetch error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, router])

  const handleDeleteProfile = async (profileId: string) => {
    if (!user) return
    try {
      await fetch('/api/profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, userId: user.id }),
      })
      setProfiles(profiles.filter(p => p.id !== profileId))
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleCreateProfile = async () => {
    if (!user || !newProfile.name.trim()) return
    setSavingProfile(true)
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newProfile.name.trim(),
          niche: newProfile.niche.trim(),
          icp: newProfile.icp.trim(),
          angle: newProfile.angle.trim(),
          style: newProfile.style.trim(),
          extra: newProfile.extra.trim(),
        }),
      })
      const data = await res.json()
      if (data.profile) {
        setProfiles([data.profile, ...profiles])
      }
      setShowNewProfile(false)
      setNewProfile({ name: '', niche: '', icp: '', angle: '', style: '', extra: '' })
    } catch (e) {
      console.error('Create profile error:', e)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCopyScript = async (id: string, content: string) => {
    const clean = content.replace(/\[([^\]]+)\]/g, '--- $1 ---')
    await navigator.clipboard.writeText(clean)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user) return null

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'analyses',
      label: 'Analyses',
      count: analyses.length,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      key: 'scripts',
      label: 'Scripts',
      count: scripts.length,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      key: 'profiles',
      label: 'Profils',
      count: profiles.length,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Nouvelle analyse
            </button>
            <button
              onClick={handleLogout}
              className="text-text-dim hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-accent rounded-full" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Salut {user.first_name}
            </h1>
          </div>
          <p className="text-text-muted text-sm ml-4">Ton historique et tes profils sauvegardés</p>
        </motion.div>

        {/* Credits Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-surface border border-border rounded-2xl p-5 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-xl font-mono">{user.credits}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">
                {user.credits} crédit{user.credits !== 1 ? 's' : ''} restant{user.credits !== 1 ? 's' : ''}
              </p>
              <p className="text-text-dim text-xs">
                Forfait <span className={`font-medium ${
                  user.plan === 'pro' ? 'text-purple-400' :
                  user.plan === 'starter' ? 'text-amber-400' :
                  'text-text-muted'
                } capitalize`}>{user.plan}</span>
              </p>
            </div>
          </div>
          {user.plan === 'free' && (
            <button
              onClick={() => router.push('/pricing')}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2"
            >
              Obtenir plus de crédits
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
          {user.plan !== 'free' && (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              user.plan === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {user.plan === 'pro' ? 'Pro' : 'Starter'}
            </span>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-text-muted hover:text-text-primary hover:border-accent/30'
              }`}
            >
              {t.icon}
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                tab === t.key ? 'bg-white/20' : 'bg-surface-2'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted text-sm">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Chargement...
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Analyses Tab */}
            {tab === 'analyses' && (
              <motion.div
                key="analyses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {analyses.length === 0 ? (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-text-dim text-sm mb-3">Aucune analyse pour le moment</p>
                    <button
                      onClick={() => router.push('/')}
                      className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
                    >
                      Analyser une vidéo
                    </button>
                  </div>
                ) : (
                  analyses.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface border border-border rounded-2xl p-4 flex gap-4 items-start hover:border-accent/20 transition-colors"
                    >
                      {a.video_thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.video_thumbnail}
                          alt={a.video_title || ''}
                          className="w-32 aspect-video object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-snug mb-1 truncate">
                          {a.video_title || 'Vidéo analysée'}
                        </h3>
                        {a.channel_name && (
                          <p className="text-text-dim text-xs mb-2">{a.channel_name}</p>
                        )}
                        <p className="text-text-muted text-xs font-mono">{formatDate(a.created_at)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Scripts Tab */}
            {tab === 'scripts' && (
              <motion.div
                key="scripts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {scripts.length === 0 ? (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-text-dim text-sm">Aucun script généré pour le moment</p>
                  </div>
                ) : (
                  scripts.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/20 transition-colors"
                    >
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedScript(expandedScript === s.id ? null : s.id)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {s.niche && (
                              <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-medium">
                                {s.niche.length > 30 ? s.niche.substring(0, 30) + '...' : s.niche}
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted text-xs font-mono">{formatDate(s.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyScript(s.id, s.script_content) }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              copiedId === s.id
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-surface-2 border border-border text-text-muted hover:text-text-primary'
                            }`}
                          >
                            {copiedId === s.id ? 'Copié !' : 'Copier'}
                          </button>
                          <svg
                            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                            className={`text-text-dim transition-transform ${expandedScript === s.id ? 'rotate-180' : ''}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedScript === s.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-border pt-4">
                              <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                                {s.script_content}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Profiles Tab */}
            {tab === 'profiles' && (
              <motion.div
                key="profiles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* New profile button / form */}
                {showNewProfile ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-accent/30 rounded-2xl p-5"
                  >
                    <h3 className="font-display font-bold text-base mb-4">Nouveau profil</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Nom du profil <span className="text-accent">*</span></label>
                        <input
                          type="text"
                          value={newProfile.name}
                          onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                          placeholder="ex: Ma chaîne fitness"
                          className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Niche</label>
                          <textarea
                            value={newProfile.niche}
                            onChange={(e) => setNewProfile({ ...newProfile, niche: e.target.value })}
                            placeholder="De quoi parle ta chaîne ?"
                            rows={2}
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">ICP (audience cible)</label>
                          <textarea
                            value={newProfile.icp}
                            onChange={(e) => setNewProfile({ ...newProfile, icp: e.target.value })}
                            placeholder="Qui regarde tes vidéos ?"
                            rows={2}
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Angle</label>
                          <textarea
                            value={newProfile.angle}
                            onChange={(e) => setNewProfile({ ...newProfile, angle: e.target.value })}
                            placeholder="Ton positionnement unique"
                            rows={2}
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Style</label>
                          <textarea
                            value={newProfile.style}
                            onChange={(e) => setNewProfile({ ...newProfile, style: e.target.value })}
                            placeholder="Ton ton, énergie, format"
                            rows={2}
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Infos supplémentaires</label>
                        <textarea
                          value={newProfile.extra}
                          onChange={(e) => setNewProfile({ ...newProfile, extra: e.target.value })}
                          placeholder="Produit, valeurs, CTA spécifique..."
                          rows={2}
                          className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => { setShowNewProfile(false); setNewProfile({ name: '', niche: '', icp: '', angle: '', style: '', extra: '' }) }}
                        className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary text-sm font-medium transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleCreateProfile}
                        disabled={!newProfile.name.trim() || savingProfile}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sauvegarde...
                          </>
                        ) : 'Créer le profil'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowNewProfile(true)}
                    className="w-full bg-surface border border-dashed border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-text-muted hover:text-accent hover:border-accent/30 text-sm font-medium transition-all"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nouveau profil
                  </button>
                )}

                {profiles.length === 0 && !showNewProfile ? (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <p className="text-text-dim text-sm mb-3">Aucun profil sauvegardé</p>
                    <p className="text-text-dim text-xs">Clique sur &quot;Nouveau profil&quot; pour en créer un.</p>
                  </div>
                ) : (
                  profiles.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface border border-border rounded-2xl p-5 hover:border-accent/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-display font-bold text-base">{p.name}</h3>
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="text-text-dim hover:text-red-400 transition-colors"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {p.niche && (
                          <div>
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Niche</p>
                            <p className="text-xs text-text-muted line-clamp-2">{p.niche}</p>
                          </div>
                        )}
                        {p.icp && (
                          <div>
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">ICP</p>
                            <p className="text-xs text-text-muted line-clamp-2">{p.icp}</p>
                          </div>
                        )}
                        {p.angle && (
                          <div>
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Angle</p>
                            <p className="text-xs text-text-muted line-clamp-2">{p.angle}</p>
                          </div>
                        )}
                        {p.style && (
                          <div>
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Style</p>
                            <p className="text-xs text-text-muted line-clamp-2">{p.style}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-text-dim text-[10px] font-mono mt-3">{formatDate(p.created_at)}</p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
