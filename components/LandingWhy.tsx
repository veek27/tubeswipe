'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export default function LandingWhy() {
  return (
    <div className="mt-6 mb-20">
      {/* Separator */}
      <div className="flex items-center gap-4 mb-16">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-medium">Pourquoi ça marche</span>
          <div className="w-1 h-1 rounded-full bg-accent" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Hero statement */}
      <motion.div {...fadeUp} className="text-center mb-16 max-w-[620px] mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4">
          Sur YouTube, le sujet fait
          <span className="text-accent"> 80% du résultat.</span>
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          Ta caméra, ton montage, tes transitions — tout ça vient après. Un bon sujet avec un angle qui intrigue, c&apos;est ce qui déclenche le clic et fait que l&apos;algorithme pousse ta vidéo. Le sujet décide si ta vidéo explose ou reste invisible.
        </p>
      </motion.div>

      {/* 3 insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {/* Card 1 - Outliers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">Repérer les outliers</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Une chaîne fait habituellement 5 000 vues et d&apos;un coup une vidéo en fait 60 000 ? C&apos;est un <span className="text-text-primary font-medium">outlier</span> — le signe que l&apos;angle a touché une corde. Les meilleurs créateurs ne devinent pas, ils repèrent ce qui surperforme et s&apos;en inspirent.
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 2 - Sujet vs Angle */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">Le sujet reste, l&apos;angle change</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Les problématiques de ta cible sont limitées. Ce qui est infini, c&apos;est l&apos;<span className="text-text-primary font-medium">angle</span> avec lequel tu les traites. Un même sujet avec un angle nouveau, c&apos;est ce qui donne l&apos;impression que le contenu est toujours frais — alors que la base est la même.
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 3 - Attente vs Réalité */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">Attente vs réalité</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Quand la réalité bat les attentes, les gens restent et partagent. Quand les attentes battent la réalité, ils partent. C&apos;est le principe premier de la psychologie de contenu — et ça influence chaque décision dans un bon script.
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* Section 2: Anatomie d'une vidéo qui performe */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight mb-3">
          Anatomie d&apos;une vidéo qui <span className="text-accent">performe</span>
        </h3>
        <p className="text-text-dim text-xs max-w-md mx-auto">
          90% des vidéos YouTube font moins de 1 000 vues. Voici ce qui sépare le top 10%.
        </p>
      </motion.div>

      {/* Anatomy blocks - 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">

        {/* Block 1 — Confirmation du clic */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 flex-shrink-0">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] p-2.5 space-y-1.5">
                <div className="h-1.5 bg-accent/40 rounded-full w-full" />
                <div className="h-1 bg-white/8 rounded-full w-[80%]" />
                <div className="h-1 bg-white/5 rounded-full w-[60%]" />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full w-[8%] bg-accent rounded-full" />
                  </div>
                </div>
                <p className="text-[5px] text-white/20 text-center">0:00 — 0:03</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">01</span>
                <h4 className="font-display font-bold text-sm">Confirmer le clic, puis dépasser</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Les premières secondes doivent confirmer ce que le titre promettait — c&apos;est la <span className="text-text-primary font-medium">confirmation du clic</span>. Ensuite, tu rajoutes un élément inattendu qui monte les attentes encore plus haut. Si le spectateur ne se dit pas &quot;attends, quoi ?&quot; en 3 secondes, il est parti.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 2 — Boucles problème→solution */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 flex-shrink-0">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] p-2.5 space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-accent">?</span>
                  <div className="h-1 bg-accent/30 rounded-full flex-1" />
                </div>
                <div className="h-1 bg-white/6 rounded-full w-full" />
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-emerald-500">!</span>
                  <div className="h-1 bg-emerald-500/20 rounded-full flex-1" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-accent">?</span>
                  <div className="h-1 bg-accent/20 rounded-full flex-1" />
                </div>
                <div className="h-1 bg-white/6 rounded-full w-[90%]" />
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-emerald-500">!</span>
                  <div className="h-1 bg-emerald-500/15 rounded-full flex-1" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">02</span>
                <h4 className="font-display font-bold text-sm">Boucles : problème → solution → relance</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Tu poses un problème, tu donnes un exemple concret pour que le spectateur se reconnaisse, puis tu donnes la solution. Juste après — tu rouvres une nouvelle boucle. Le cerveau déteste les questions sans réponse. C&apos;est ce qui force les gens à rester.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 3 — Structure du script */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 flex-shrink-0">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] p-2.5 space-y-1.5">
                {['Intro', 'Body', 'Outro'].map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-accent/15 text-[5px] text-accent font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    <div className={`h-1 rounded-full flex-1 ${i === 1 ? 'bg-accent/30' : 'bg-white/8'}`} />
                  </div>
                ))}
                <p className="text-[5px] text-white/20 text-center mt-0.5">meilleur point = position 2</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">03</span>
                <h4 className="font-display font-bold text-sm">Un script, c&apos;est une architecture</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Intro, body, outro — chaque partie a un rôle. Ton 2e meilleur point arrive en premier, ton meilleur en 2e position. Pourquoi ? Parce que ça installe un <span className="text-text-primary font-medium">pattern</span> dans le cerveau du spectateur : les choses vont de mieux en mieux, donc il reste jusqu&apos;à la fin.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 4 — CTR + Rétention */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 flex-shrink-0">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[5px] text-accent font-bold">CTR</span>
                  <span className="text-[5px] text-white/20">8.2%</span>
                </div>
                <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden mb-2">
                  <div className="h-full w-[82%] bg-accent/50 rounded-full" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[5px] text-emerald-400 font-bold">APV</span>
                  <span className="text-[5px] text-white/20">62%</span>
                </div>
                <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-emerald-500/40 rounded-full" />
                </div>
                <p className="text-[5px] text-white/20 text-center mt-1.5">l&apos;algo recommande</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">04</span>
                <h4 className="font-display font-bold text-sm">Le clic te lance, la rétention te propulse</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                YouTube ne pousse pas les vidéos avec le plus de likes. Il pousse celles que les gens <span className="text-text-primary font-medium">regardent jusqu&apos;au bout</span>. Le sujet + l&apos;angle déclenchent le clic. Le script maintient l&apos;attention. Les deux ensemble, c&apos;est ce qui fait que l&apos;algo te met en recommandation.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* Pain point → solution */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="max-w-[640px] mx-auto mb-8"
      >
        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-muted text-xs font-medium">Tu sais tout ça. Le problème c&apos;est le process.</p>
          </div>

          <div className="space-y-2.5 mb-5">
            {[
              'Scroller des dizaines de chaînes pour repérer les vidéos outliers',
              'Analyser l\'angle qui a fait surperformer chaque vidéo',
              'Décortiquer la structure du script : hooks, boucles, transitions',
              'Réécrire un script de A à Z en adaptant à ta niche',
              'Recommencer si la rétention est mauvaise',
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-white/15 text-xs mt-px">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <p className="text-text-dim text-xs leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/[0.04] mb-4" />

          <div className="flex items-center gap-2 text-text-dim text-[11px]">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>À la main : <span className="text-white/40 font-medium line-through">3 à 5 heures par vidéo</span></span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-accent font-bold">3 minutes avec TubeSwipe</span>
          </div>
        </div>
      </motion.div>

      {/* Closing */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mt-10 mb-4"
      >
        <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed font-medium">
          Les créateurs qui percent ne réinventent pas la roue.
        </p>
        <p className="text-text-dim text-xs mt-1">
          Ils repèrent ce qui marche, prennent l&apos;angle, et le font à leur sauce.
        </p>
      </motion.div>
    </div>
  )
}
