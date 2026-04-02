'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

interface EmailGateProps {
  onAuthenticated: (userId: string) => void
}

export default function EmailGate({ onAuthenticated }: EmailGateProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useStore()

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async () => {
    setError('')

    if (!firstName.trim()) {
      setError('Entre ton prénom pour continuer.')
      return
    }
    if (!email.trim() || !isValidEmail(email.trim())) {
      setError('Entre une adresse email valide.')
      return
    }
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          password,
          mode: 'register',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la création du compte')
      }

      const data = await res.json()
      setUser(data.user)
      onAuthenticated(data.user.id)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-black/50"
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display text-xl font-bold text-center mb-1">
            Ton analyse est prête
          </h2>
          <p className="text-text-muted text-sm text-center mb-2">
            Crée ton compte pour y accéder.
          </p>
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-accent text-[11px] font-bold">1re analyse + script offerts</span>
              <span className="text-text-dim text-[10px]">sans CB</span>
            </span>
          </div>

          {/* Form */}
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
                placeholder="Mot de passe (6 caractères min.)"
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création du compte...
              </>
            ) : (
              <>
                Créer mon compte
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Privacy note */}
          <p className="text-text-dim text-[10px] text-center mt-4 leading-relaxed">
            Pas de spam. Tes données restent privées.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
