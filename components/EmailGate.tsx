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

    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de la connexion')
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
          <p className="text-text-muted text-sm text-center mb-6">
            Entre ton prénom et ton email pour y accéder.
          </p>

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
                Connexion...
              </>
            ) : (
              <>
                Voir mon analyse
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
