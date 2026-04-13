'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import AppNav from '@/components/AppNav'

export default function ThankYouPage() {
  const router = useRouter()
  const { user, refreshUser, hasMounted, setMounted } = useStore()

  useEffect(() => {
    if (!hasMounted) setMounted()
  }, [hasMounted, setMounted])

  // Refresh user data to get updated credits/plan from webhook
  useEffect(() => {
    if (hasMounted && user) {
      // Refresh multiple times to catch webhook processing delay
      refreshUser()
      const t1 = setTimeout(() => refreshUser(), 3000)
      const t2 = setTimeout(() => refreshUser(), 8000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted])

  return (
    <div className="min-h-screen flex flex-col items-center px-5">
      <AppNav />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[520px] text-center pt-32 pb-10 flex flex-col items-center"
      >
        {/* Success icon — mascot celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-8"
        >
          <motion.img
            src="/mascot.svg"
            alt=""
            className="w-16 h-16"
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Bienvenue dans le game
          <span className="text-emerald-400"> !</span>
        </h1>

        <p className="text-text-muted text-sm sm:text-base max-w-sm mx-auto mb-4 leading-relaxed">
          Ton abonnement est activé. Tes crédits sont prêts.
        </p>

        {/* Plan info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-surface border border-emerald-500/20 rounded-2xl p-5 mb-8 w-full"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-text-muted mb-1">Ton forfait</p>
                <p className="font-display font-bold text-lg capitalize">{user.plan === 'free' ? 'En cours...' : user.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted mb-1">Crédits disponibles</p>
                <p className="font-display font-bold text-lg text-emerald-400">{user.credits}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex flex-col gap-3 w-full"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Lancer une analyse
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-surface border border-border hover:border-accent/30 text-text-muted hover:text-text-primary font-medium px-6 py-3.5 rounded-xl text-sm transition-all"
          >
            Aller au tableau de bord
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
