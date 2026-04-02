'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '6,90',
    period: '/mois',
    credits: 10,
    features: [
      '10 crédits par mois',
      'Analyse complète des vidéos',
      'Scripts personnalisés illimités',
      'Profils sauvegardés',
      'Historique complet',
    ],
    cta: 'Choisir Starter',
    popular: false,
    accent: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '17,90',
    period: '/mois',
    credits: 35,
    features: [
      '35 crédits par mois',
      'Analyse complète des vidéos',
      'Scripts personnalisés illimités',
      'Profils sauvegardés',
      'Historique complet',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
    popular: true,
    accent: true,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { user } = useStore()

  const handleChoosePlan = (planId: string) => {
    // Redirect to Whop checkout - will be configured with real URLs
    const whopUrls: Record<string, string> = {
      starter: process.env.NEXT_PUBLIC_WHOP_STARTER_URL || '#',
      pro: process.env.NEXT_PUBLIC_WHOP_PRO_URL || '#',
    }
    const url = whopUrls[planId]
    if (url && url !== '#') {
      // Pass email for auto-matching
      const separator = url.includes('?') ? '&' : '?'
      window.open(`${url}${separator}email=${encodeURIComponent(user?.email || '')}`, '_blank')
    } else {
      alert('Lien de paiement en cours de configuration. Reviens bientôt !')
    }
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <button
            onClick={() => router.back()}
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-6 w-1 bg-accent rounded-full" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Continue à créer des scripts
              </h1>
              <div className="h-6 w-1 bg-accent rounded-full" />
            </div>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              Choisis le forfait qui correspond à ton rythme de publication.
            </p>
          </div>
        </motion.div>

        {/* Current status */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-surface border border-border rounded-2xl p-4 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-sm">{user.credits}</span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user.credits} crédit{user.credits !== 1 ? 's' : ''} restant{user.credits !== 1 ? 's' : ''}
                </p>
                <p className="text-text-dim text-xs">
                  Forfait actuel : <span className="text-text-muted capitalize">{user.plan}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className={`relative bg-surface border rounded-2xl p-6 ${
                plan.popular
                  ? 'border-accent/50 shadow-lg shadow-accent/5'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-display text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold">{plan.price}€</span>
                  <span className="text-text-dim text-sm">{plan.period}</span>
                </div>
                <p className="text-text-muted text-xs mt-1">{plan.credits} crédits/mois</p>
              </div>

              <div className="space-y-2.5 mb-6">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={plan.accent ? '#E40000' : '#888'} strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-muted">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleChoosePlan(plan.id)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.accent
                    ? 'bg-accent hover:bg-accent-hover text-white'
                    : 'bg-surface-2 border border-border text-text-primary hover:border-accent/30'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ-ish */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-text-dim text-xs">
            1 crédit = 1 analyse complète + 1 script personnalisé.
            <br />
            Les crédits se renouvellent chaque mois. Annulable à tout moment.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
