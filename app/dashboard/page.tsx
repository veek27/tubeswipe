'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import AppNav from '@/components/AppNav'

interface ScriptRecord {
  id: string
  analysis_id: string | null
  script_content: string
  niche: string
  icp: string
  created_at: string
}

interface AnalysisRecord {
  id: string
  youtube_url: string
  video_title: string
  video_thumbnail: string
  channel_name: string
  analysis: Record<string, unknown>
  video_info: Record<string, unknown> | null
  created_at: string
  scripts?: ScriptRecord[]
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

type Tab = 'analyses' | 'profiles'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, setAnalysis, setVideoInfo, setYoutubeUrl, setSavedAnalysisId } = useStore()
  const [tab, setTab] = useState<Tab>('analyses')
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [profiles, setProfiles] = useState<ProfileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({ name: '', niche: '', icp: '', angle: '', style: '', extra: '', channelUrl: '' })
  const [profileChannelInfo, setProfileChannelInfo] = useState<{ id: string; name: string; description: string; thumbnail: string; subscribers?: string; totalViews?: string; videoCount?: number } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [channelQuery, setChannelQuery] = useState('')
  const [channelResults, setChannelResults] = useState<{ id: string; name: string; description: string; thumbnail: string }[]>([])
  const [channelSearching, setChannelSearching] = useState(false)
  const [channelLoading, setChannelLoading] = useState(false)
  const [showChannelDropdown, setShowChannelDropdown] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

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
        const allScripts: ScriptRecord[] = data.scripts || []

        // Attach scripts to their analyses
        const allAnalyses: AnalysisRecord[] = (data.analyses || []).map((a: AnalysisRecord) => ({
          ...a,
          scripts: allScripts.filter((s: ScriptRecord) => s.analysis_id === a.id),
        }))
        setAnalyses(allAnalyses)
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

  const resetProfileForm = () => {
    setProfileForm({ name: '', niche: '', icp: '', angle: '', style: '', extra: '', channelUrl: '' })
    setProfileChannelInfo(null)
    setChannelQuery('')
    setChannelResults([])
    setShowChannelDropdown(false)
    setEditingProfileId(null)
    setShowProfileForm(false)
  }

  const openEditProfile = (p: ProfileRecord) => {
    setProfileForm({
      name: p.name,
      niche: p.niche || '',
      icp: p.icp || '',
      angle: p.angle || '',
      style: p.style || '',
      extra: p.extra || '',
      channelUrl: p.channel_url || '',
    })
    setProfileChannelInfo(p.channel_info as typeof profileChannelInfo)
    setChannelQuery(p.channel_info ? (p.channel_info as { name?: string }).name || '' : '')
    setEditingProfileId(p.id)
    setShowProfileForm(true)
  }

  const handleChannelSearch = async (query: string) => {
    setChannelQuery(query)
    if (query.length < 2) {
      setChannelResults([])
      setShowChannelDropdown(false)
      return
    }
    setChannelSearching(true)
    setShowChannelDropdown(true)
    try {
      const res = await fetch('/api/channel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setChannelResults(data.results || [])
    } catch {
      setChannelResults([])
    } finally {
      setChannelSearching(false)
    }
  }

  const handleSelectChannel = async (channel: { id: string; name: string; thumbnail: string }) => {
    setShowChannelDropdown(false)
    setChannelQuery(channel.name)
    setChannelLoading(true)
    try {
      const res = await fetch('/api/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelUrl: `https://www.youtube.com/channel/${channel.id}` }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfileChannelInfo(data)
        setProfileForm(prev => ({ ...prev, channelUrl: `https://www.youtube.com/channel/${channel.id}` }))
      }
    } catch {
      // ignore
    } finally {
      setChannelLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profileForm.name.trim()) return
    setSavingProfile(true)
    try {
      const isEdit = !!editingProfileId
      const res = await fetch('/api/profiles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { profileId: editingProfileId } : {}),
          userId: user.id,
          name: profileForm.name.trim(),
          niche: profileForm.niche.trim(),
          icp: profileForm.icp.trim(),
          angle: profileForm.angle.trim(),
          style: profileForm.style.trim(),
          extra: profileForm.extra.trim(),
          channelUrl: profileForm.channelUrl.trim(),
          channelInfo: profileChannelInfo,
        }),
      })
      const data = await res.json()
      if (data.profile) {
        if (isEdit) {
          setProfiles(profiles.map(p => p.id === editingProfileId ? data.profile : p))
        } else {
          setProfiles([data.profile, ...profiles])
        }
      }
      resetProfileForm()
    } catch (e) {
      console.error('Save profile error:', e)
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

  const handleChangePassword = async () => {
    setPasswordMsg(null)
    if (!passwordForm.current) { setPasswordMsg({ type: 'error', text: 'Entre ton mot de passe actuel' }); return }
    if (passwordForm.newPw.length < 6) { setPasswordMsg({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }); return }
    if (passwordForm.newPw !== passwordForm.confirm) { setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' }); return }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPw,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur')
      }
      setPasswordMsg({ type: 'success', text: 'Mot de passe modifié avec succès' })
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordForm({ current: '', newPw: '', confirm: '' })
        setPasswordMsg(null)
      }, 1500)
    } catch (e: unknown) {
      setPasswordMsg({ type: 'error', text: e instanceof Error ? e.message : 'Erreur' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffH = Math.floor(diffMin / 60)
    const diffD = Math.floor(diffH / 24)
    if (diffMin < 60) return `il y a ${diffMin}min`
    if (diffH < 24) return `il y a ${diffH}h`
    if (diffD < 7) return `il y a ${diffD}j`
    return formatDate(dateStr)
  }

  if (!user) return null

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'analyses',
      label: 'Mes analyses',
      count: analyses.length,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      key: 'profiles',
      label: 'Mes profils',
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
      <AppNav />
      <div className="max-w-[900px] mx-auto pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-6 w-1 bg-accent rounded-full" />
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Salut {user.first_name}
                </h1>
              </div>
              <p className="text-text-muted text-sm ml-4">Ton espace personnel</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nouvelle analyse
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-3 py-2.5 rounded-xl border border-border text-text-dim hover:text-text-muted hover:border-accent/30 text-xs transition-all"
                title="Modifier le mot de passe"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-xl border border-border text-text-dim hover:text-red-400 hover:border-red-400/30 text-xs transition-all"
                title="Se déconnecter"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
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
                Forfait <span className={`font-medium capitalize ${
                  user.plan === 'pro' ? 'text-purple-400' :
                  user.plan === 'starter' ? 'text-amber-400' :
                  'text-text-muted'
                }`}>{user.plan}</span>
              </p>
            </div>
          </div>
          {user.plan === 'free' ? (
            <button
              onClick={() => router.push('/pricing')}
              className="bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-text-primary font-semibold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2"
            >
              Obtenir plus de crédits
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ) : (
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
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-text-dim text-sm mb-1">Aucune analyse pour le moment</p>
                    <p className="text-text-dim text-xs mb-4">Lance ta première analyse pour commencer.</p>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      Analyser une vidéo
                    </button>
                  </div>
                ) : (
                  analyses.map((a, i) => {
                    const hasScripts = a.scripts && a.scripts.length > 0
                    const isExpanded = expandedAnalysis === a.id

                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/20 transition-colors"
                      >
                        <div className="p-4 flex gap-4 items-start">
                          {a.video_thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.video_thumbnail}
                              alt={a.video_title || ''}
                              className="w-36 aspect-video object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm leading-snug mb-1.5">
                              {a.video_title || 'Vidéo analysée'}
                            </h3>
                            {a.channel_name && (
                              <p className="text-text-dim text-xs mb-2 flex items-center gap-1.5">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {a.channel_name}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-text-dim text-[11px]">
                              <span className="flex items-center gap-1">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(a.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(a.created_at)}
                              </span>
                              <span className="text-text-dim/60">{timeAgo(a.created_at)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  setAnalysis(a.analysis as any)
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  setVideoInfo((a.video_info || { title: a.video_title, thumbnail: a.video_thumbnail, channelTitle: a.channel_name, views: 'N/A', publishedAt: 'N/A' }) as any)
                                  setYoutubeUrl(a.youtube_url)
                                  setSavedAnalysisId(a.id)
                                  router.push('/analyze')
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-text-primary hover:border-accent/30 text-xs font-medium transition-all"
                              >
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                Voir l&apos;analyse
                              </button>
                              {hasScripts ? (
                                <>
                                  <button
                                    onClick={() => setExpandedAnalysis(isExpanded ? null : a.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-medium transition-all hover:bg-accent/20"
                                  >
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    {isExpanded ? 'Masquer le script' : 'Voir le script'}
                                    <svg
                                      width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleCopyScript(a.id, a.scripts![0].script_content)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      copiedId === a.id
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-surface-2 border border-border text-text-muted hover:text-text-primary'
                                    }`}
                                  >
                                    {copiedId === a.id ? 'Copié !' : 'Copier'}
                                  </button>
                                </>
                              ) : (
                                <span className="text-text-dim text-[11px] flex items-center gap-1.5">
                                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Pas de script généré
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded script */}
                        <AnimatePresence>
                          {isExpanded && hasScripts && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {a.scripts!.map((s) => (
                                <div key={s.id} className="px-4 pb-4 border-t border-border pt-4">
                                  {s.niche && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-medium">
                                        {s.niche.length > 40 ? s.niche.substring(0, 40) + '...' : s.niche}
                                      </span>
                                      <span className="text-text-dim text-[10px] font-mono">{formatDate(s.created_at)} {formatTime(s.created_at)}</span>
                                    </div>
                                  )}
                                  <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                                    {s.script_content}
                                  </pre>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })
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
                {/* Profile form (create or edit) */}
                {showProfileForm ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-accent/30 rounded-2xl p-5"
                  >
                    <h3 className="font-display font-bold text-base mb-4">
                      {editingProfileId ? 'Modifier le profil' : 'Nouveau profil'}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Nom du profil <span className="text-accent">*</span></label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="ex: Ma chaîne fitness"
                          className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono"
                          autoFocus
                        />
                      </div>

                      {/* Channel YouTube search */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#E40000">
                            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          Chaîne YouTube
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={channelQuery}
                            onChange={(e) => handleChannelSearch(e.target.value)}
                            onFocus={() => channelResults.length > 0 && setShowChannelDropdown(true)}
                            placeholder="@handle ou nom de la chaîne"
                            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono pr-10"
                          />
                          {channelSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                            </div>
                          )}
                          {/* Dropdown results */}
                          {showChannelDropdown && channelResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-surface-2 border border-border rounded-xl overflow-hidden shadow-xl z-20 max-h-[240px] overflow-y-auto">
                              {channelResults.map((ch) => (
                                <button
                                  key={ch.id}
                                  onClick={() => handleSelectChannel(ch)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={ch.thumbnail} alt={ch.name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-text-primary truncate">{ch.name}</p>
                                    <p className="text-[10px] text-text-dim truncate">{ch.description}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Channel preview card */}
                        {channelLoading && (
                          <div className="mt-2 flex items-center gap-2 text-text-dim text-xs">
                            <div className="w-3 h-3 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                            Chargement de la chaîne...
                          </div>
                        )}
                        {profileChannelInfo && !channelLoading && (
                          <div className="mt-2 flex items-center gap-3 bg-surface-2 border border-border rounded-xl p-3">
                            {profileChannelInfo.thumbnail && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={profileChannelInfo.thumbnail} alt={profileChannelInfo.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-text-primary truncate">{profileChannelInfo.name}</p>
                              <div className="flex items-center gap-3 text-[10px] text-text-dim mt-0.5">
                                {profileChannelInfo.subscribers && <span>{profileChannelInfo.subscribers} abonnés</span>}
                                {profileChannelInfo.videoCount !== undefined && <span>{profileChannelInfo.videoCount} vidéos</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => { setProfileChannelInfo(null); setChannelQuery(''); setProfileForm(prev => ({ ...prev, channelUrl: '' })) }}
                              className="text-text-dim hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Niche</label>
                          <textarea value={profileForm.niche} onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })} placeholder="De quoi parle ta chaîne ?" rows={2} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">ICP (audience cible)</label>
                          <textarea value={profileForm.icp} onChange={(e) => setProfileForm({ ...profileForm, icp: e.target.value })} placeholder="Qui regarde tes vidéos ?" rows={2} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Angle</label>
                          <textarea value={profileForm.angle} onChange={(e) => setProfileForm({ ...profileForm, angle: e.target.value })} placeholder="Ton positionnement unique" rows={2} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Style</label>
                          <textarea value={profileForm.style} onChange={(e) => setProfileForm({ ...profileForm, style: e.target.value })} placeholder="Ton ton, énergie, format" rows={2} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Infos supplémentaires</label>
                        <textarea value={profileForm.extra} onChange={(e) => setProfileForm({ ...profileForm, extra: e.target.value })} placeholder="Produit, valeurs, CTA spécifique..." rows={2} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim font-mono resize-y" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={resetProfileForm}
                        className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary text-sm font-medium transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={!profileForm.name.trim() || savingProfile}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sauvegarde...
                          </>
                        ) : editingProfileId ? 'Enregistrer' : 'Créer le profil'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => { resetProfileForm(); setShowProfileForm(true) }}
                    className="w-full bg-surface border border-dashed border-border rounded-2xl p-4 flex items-center justify-center gap-2 text-text-muted hover:text-accent hover:border-accent/30 text-sm font-medium transition-all"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Nouveau profil
                  </button>
                )}

                {profiles.length === 0 && !showProfileForm ? (
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
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Channel thumbnail if available */}
                          {p.channel_info && (p.channel_info as { thumbnail?: string }).thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={(p.channel_info as { thumbnail: string }).thumbnail}
                              alt={p.name}
                              className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-base truncate">{p.name}</h3>
                            {p.channel_info && (p.channel_info as { name?: string }).name && (
                              <p className="text-text-dim text-[10px] truncate">{(p.channel_info as { name: string }).name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => openEditProfile(p)}
                            className="text-text-dim hover:text-accent transition-colors p-1"
                            title="Modifier"
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(p.id)}
                            className="text-text-dim hover:text-red-400 transition-colors p-1"
                            title="Supprimer"
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

      {/* Password change modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/70 backdrop-blur-md"
            onClick={() => { setShowPasswordModal(false); setPasswordMsg(null); setPasswordForm({ current: '', newPw: '', confirm: '' }) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold mb-1">Modifier le mot de passe</h3>
              <p className="text-text-dim text-xs mb-5">Change ton mot de passe de connexion.</p>

              <div className="space-y-3">
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, current: e.target.value }); setPasswordMsg(null) }}
                  placeholder="Mot de passe actuel"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none"
                  autoFocus
                />
                <input
                  type="password"
                  value={passwordForm.newPw}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, newPw: e.target.value }); setPasswordMsg(null) }}
                  placeholder="Nouveau mot de passe (6 car. min.)"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none"
                />
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, confirm: e.target.value }); setPasswordMsg(null) }}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none"
                />
              </div>

              {passwordMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-3 font-mono ${passwordMsg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
                >
                  {passwordMsg.text}
                </motion.p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowPasswordModal(false); setPasswordMsg(null); setPasswordForm({ current: '', newPw: '', confirm: '' }) }}
                  className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary text-sm font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Modification...
                    </>
                  ) : 'Modifier'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
