'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useAnimation } from 'framer-motion'
import { useStore } from '@/store/useStore'
import LandingSteps from '@/components/LandingSteps'
import LandingWhy from '@/components/LandingWhy'

export default function Home() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setYoutubeUrl, setVideoInfo, setAnalysis, setLoading: setStoreLoading, user } = useStore()

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
      let message = e instanceof Error ? e.message : 'Erreur inconnue'
      // Clean up raw JSON errors
      if (message.includes('overloaded') || message.includes('529') || message.includes('Overloaded')) {
        message = 'L\'IA est temporairement surchargée. Réessaie dans 30 secondes.'
      } else if (message.includes('"type":"error"')) {
        message = 'Erreur temporaire du serveur. Réessaie dans quelques secondes.'
      }
      setError(message)
      setLoading(false)
      setStoreLoading(false)
    }
  }

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const logoControls = useAnimation()
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    // Trigger spin every 300px scrolled down
    if (currentY > lastScrollY + 300) {
      logoControls.start({ rotate: [0, 360], transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } })
      setLastScrollY(currentY)
    } else if (currentY < lastScrollY - 100) {
      setLastScrollY(currentY)
    }
  }, [lastScrollY, logoControls])

  // Initial spin on mount
  useEffect(() => {
    logoControls.set({ opacity: 0, rotate: -360, scale: 0.5 })
    logoControls.start({ opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Spin on scroll down
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="min-h-screen flex flex-col items-center px-5">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Top nav bar — fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 px-5 py-4">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.img
              src="/logo.png"
              alt="TubeSwipe"
              className="w-8 h-8 rounded-md"
              animate={logoControls}
            />
            <span className="font-display font-bold text-lg text-white tracking-tight">tubeswipe</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 text-xs font-medium transition-all"
                >
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </button>
              )}
              {/* Credits badge */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs">
                <div className="w-5 h-5 rounded-md bg-accent/15 flex items-center justify-center">
                  <span className="text-accent font-bold text-[10px]">{user.credits}</span>
                </div>
                <span className="text-text-dim">crédit{user.credits !== 1 ? 's' : ''}</span>
              </div>
              {/* Dashboard button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary hover:border-accent/30 text-xs font-medium transition-all"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Tableau de bord
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary hover:border-accent/30 text-xs font-medium transition-all"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all"
              >
                Créer un compte
              </button>
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[780px] text-center pt-28 pb-10 flex flex-col items-center justify-center"
      >
        {/* Spacer for fixed nav */}
        <div className="mb-8" />

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
          className="bg-surface border border-border rounded-2xl p-2 shadow-lg shadow-black/20 w-full"
        >
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
              placeholder="Colle un lien YouTube ici..."
              style={{ flex: '1 1 0%', minWidth: 0 }}
              className="bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-5 py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
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
          <p className="text-center text-[11px] text-text-dim mt-2 px-1 flex items-center justify-center gap-2">
            <span className="text-accent font-semibold">1 analyse + 1 script offerts</span>
            <span className="text-white/10">|</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold">CB non requise</span>
            </span>
          </p>
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

        {/* Footer hint */}
        <p className="text-text-dim text-xs mt-10">
          Fonctionne avec n&apos;importe quelle vidéo YouTube publique
        </p>

      </motion.div>

      {/* Animated Steps */}
      <div className="relative z-10 w-full max-w-[900px]">
        <LandingSteps />
      </div>

      {/* Why section */}
      <div className="relative z-10 w-full max-w-[900px]">
        <LandingWhy />
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {/* Register Modal */}
      {showRegisterModal && <RegisterModal onClose={() => setShowRegisterModal(false)} />}
    </div>
  )
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useStore()
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email invalide.'); return }
    if (!password) { setError('Entre ton mot de passe.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, mode: 'login' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur de connexion')
      }
      const data = await res.json()
      setUser(data.user)
      onClose()
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-bold text-center mb-1">Connexion</h2>
        <p className="text-text-muted text-sm text-center mb-6">Connecte-toi à ton compte TubeSwipe.</p>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="ton@email.com"
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all focus:border-accent/50 focus:outline-none"
            autoFocus
            disabled={loading}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Mot de passe"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none pr-11"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-3 font-mono">
            {error}
          </motion.p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connexion...
            </>
          ) : 'Se connecter'}
        </button>

        <button onClick={onClose} className="w-full mt-3 text-text-dim text-xs hover:text-text-muted transition-colors text-center">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useStore()
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    if (!firstName.trim()) { setError('Entre ton prénom.'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email invalide.'); return }
    if (!password || password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim().toLowerCase(), password, mode: 'register' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la création du compte')
      }
      const data = await res.json()
      setUser(data.user)
      onClose()
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-bold text-center mb-1">Créer un compte</h2>
        <p className="text-text-muted text-sm text-center mb-1">1 analyse + 1 script offerts.</p>
        <p className="text-accent text-[11px] text-center mb-6 font-medium">Sans carte bancaire</p>

        <div className="space-y-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ton prénom"
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none"
            autoFocus
            disabled={loading}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="ton@email.com"
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim font-mono transition-all focus:border-accent/50 focus:outline-none"
            disabled={loading}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Mot de passe (6 car. min.)"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-dim transition-all focus:border-accent/50 focus:outline-none pr-11"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors"
            >
              {showPassword ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-3 font-mono">
            {error}
          </motion.p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Création...
            </>
          ) : 'Créer mon compte gratuit'}
        </button>

        <button onClick={onClose} className="w-full mt-3 text-text-dim text-xs hover:text-text-muted transition-colors text-center">
          Fermer
        </button>
      </motion.div>
    </motion.div>
  )
}
