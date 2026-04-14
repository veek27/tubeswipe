'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Kévin M.',
    avatar: 'https://i.pravatar.cc/80?img=52',
    niche: 'Finance & Investissement',
    plan: 'Pro',
    quote: 'Avant je passais 4-5h par semaine à chercher des idées de vidéos. Maintenant j\'analyse ce qui cartonne, je génère un script et en 30 min c\'est bouclé. Ma chaîne a pris 2 000 abonnés en 2 mois depuis que j\'utilise TubeSwap.',
  },
  {
    name: 'Amira L.',
    avatar: 'https://i.pravatar.cc/80?img=24',
    niche: 'Développement personnel',
    plan: 'Starter',
    quote: 'Le principe est simple : tu repères une vidéo qui cartonne chez un créateur US ou dans une autre niche, tu colles le lien, et TubeSwap t\'adapte le sujet avec un script prêt à tourner. Ce qui me prenait une après-midi se fait en quelques secondes maintenant.',
  },
  {
    name: 'Maxime R.',
    avatar: 'https://i.pravatar.cc/80?img=14',
    niche: 'Tech & Productivité',
    plan: 'Pro',
    quote: 'Le game changer c\'est l\'analyse. Tu vois exactement pourquoi une vidéo a marché — le hook, la structure, le sujet. Tu copies pas, tu comprends la logique et tu l\'appliques à ta niche. Mes vues ont doublé.',
  },
  {
    name: 'Sarah B.',
    avatar: 'https://i.pravatar.cc/80?img=26',
    niche: 'Cuisine & Recettes',
    plan: 'Starter',
    quote: 'Honnêtement j\'étais sceptique au début. Mais le premier script que j\'ai généré m\'a fait une vidéo à 15K vues alors que je plafonnais à 2-3K. C\'est devenu mon outil de travail quotidien.',
  },
]

export default function LandingTestimonials() {
  return (
    <section className="py-16 w-full">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-5 w-1 bg-accent rounded-full" />
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            Ils l&apos;utilisent, ils en parlent
          </h2>
          <div className="h-5 w-1 bg-accent rounded-full" />
        </div>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Des créateurs YouTube qui ont transformé leur façon de produire du contenu.
        </p>
      </motion.div>

      {/* Testimonial grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-surface border border-border rounded-2xl p-5 sm:p-6 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, j) => (
                <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-text-muted text-sm leading-relaxed mb-5 flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full border-2 border-border object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                <p className="text-text-dim text-xs truncate">{t.niche}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                t.plan === 'Pro'
                  ? 'bg-accent/10 text-accent'
                  : 'bg-amber-500/10 text-amber-400'
              }`}>
                {t.plan}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA-like line */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-center text-text-dim text-xs mt-8"
      >
        Résultats réels de créateurs utilisant TubeSwap au quotidien.
      </motion.p>
    </section>
  )
}
