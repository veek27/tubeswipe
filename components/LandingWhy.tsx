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
      <motion.div {...fadeUp} className="text-center mb-16 max-w-[600px] mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4">
          Sur YouTube, le sujet fait
          <span className="text-accent"> 80% du résultat.</span>
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          La qualité de ta caméra, ton montage, tes transitions — tout ça vient après.
          Ce qui décide si ta vidéo explose ou reste à 47 vues, c&apos;est le sujet que tu choisis.
        </p>
      </motion.div>

      {/* 3 insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {/* Card 1 - Topic is king */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          {/* Decorative icon */}
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">Le sujet, pas la forme</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Les plus gros créateurs le disent : une vidéo avec un sujet qui intéresse les gens performera toujours mieux qu&apos;un sujet moyen avec un montage incroyable. Le sujet déclenche le clic.
          </p>
          {/* Subtle glow */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 2 - Copy what works */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">Observe, adapte, publie</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Si une vidéo a déjà fait des millions de vues, c&apos;est que le sujet a été validé par l&apos;audience. Prends ce sujet, mets-le à ta sauce, adapte-le à ta niche. C&apos;est comme ça que les pros font.
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Card 3 - Open loops */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-sm mb-2">La structure qui retient</h3>
          <p className="text-text-muted text-xs leading-relaxed">
            Les vidéos virales utilisent des <span className="text-accent font-medium">open loops</span> — des questions ouvertes qui donnent envie de rester jusqu&apos;au bout. TubeSwipe analyse cette structure pour toi.
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* Deep dive: anatomy of a viral video */}
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
          Chaque vidéo virale repose sur les mêmes piliers. Voici ce qui sépare 1 000 vues de 1 000 000.
        </p>
      </motion.div>

      {/* Anatomy blocks - 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">

        {/* Block 1 - Hook */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0 }}
          className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-accent/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Mini visual */}
            <div className="w-16 flex-shrink-0">
              <div className="bg-[#0a0a0a] rounded-lg border border-white/[0.06] p-2.5 space-y-1.5">
                <div className="h-1.5 bg-accent/40 rounded-full w-full" />
                <div className="h-1 bg-white/8 rounded-full w-[80%]" />
                <div className="h-1 bg-white/5 rounded-full w-[60%]" />
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-accent rounded-full" />
                  </div>
                </div>
                <p className="text-[5px] text-white/20 text-center">0:00 — 0:15</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">01</span>
                <h4 className="font-display font-bold text-sm">Le hook : 3 secondes pour tout gagner</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Les 3 premières secondes décident de tout. Un bon hook crée une <span className="text-text-primary font-medium">tension</span> immédiate — une question, une stat choc, une promesse. Si ton viewer ne se dit pas &quot;attends, quoi ?&quot; dans les 3 secondes, il est parti.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 2 - Open Loops */}
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
                <div className="h-1 bg-white/6 rounded-full w-[70%]" />
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-accent">?</span>
                  <div className="h-1 bg-accent/20 rounded-full flex-1" />
                </div>
                <div className="h-1 bg-white/6 rounded-full w-[90%]" />
                <div className="flex items-center gap-1 mt-0.5">
                  <svg width="6" height="6" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  <span className="text-[5px] text-white/20">boucles ouvertes</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">02</span>
                <h4 className="font-display font-bold text-sm">Open loops : la rétention invisible</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Un <span className="text-text-primary font-medium">open loop</span>, c&apos;est poser une question sans donner la réponse tout de suite. Le cerveau humain déteste les boucles ouvertes — il <span className="text-text-primary font-medium">doit</span> connaître la suite. Les meilleures vidéos en placent 3 à 5 dans les 60 premières secondes.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 3 - Structure */}
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
                {['Hook', 'Problème', 'Solution', 'CTA'].map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-accent/15 text-[5px] text-accent font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    <div className={`h-1 rounded-full flex-1 ${i === 0 ? 'bg-accent/30' : 'bg-white/8'}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">03</span>
                <h4 className="font-display font-bold text-sm">Un bon script = une architecture</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Les vidéos qui performent ne sont pas improvisées. Elles suivent une structure précise : hook, problème, montée de tension, solution, CTA. Chaque partie a un rôle. Sans cette architecture, même le meilleur sujet du monde tombe à plat.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Block 4 - Retention */}
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
                {/* Mini graph */}
                <div className="flex items-end gap-[3px] h-10 justify-center">
                  {[30, 25, 20, 15, 10, 8].map((h, i) => (
                    <div key={i} className="w-1.5 rounded-t-sm bg-white/10" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div className="h-px bg-white/[0.06] mt-1" />
                <p className="text-[5px] text-white/20 text-center mt-1">sans structure</p>
                <div className="flex items-end gap-[3px] h-10 justify-center mt-2">
                  {[20, 28, 32, 35, 33, 30].map((h, i) => (
                    <div key={i} className="w-1.5 rounded-t-sm bg-accent/50" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div className="h-px bg-white/[0.06] mt-1" />
                <p className="text-[5px] text-accent/50 text-center mt-1">avec structure</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/15 text-[9px] font-bold text-accent">04</span>
                <h4 className="font-display font-bold text-sm">L&apos;algorithme récompense la rétention</h4>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                YouTube ne pousse pas les vidéos avec le plus de likes. Il pousse celles que les gens <span className="text-text-primary font-medium">regardent jusqu&apos;au bout</span>. Un script bien structuré avec des open loops, c&apos;est la différence entre une vidéo à 200 vues et une vidéo que l&apos;algorithme propulse dans les recommandations.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </div>

      {/* Pain point → solution (subtle) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="max-w-[640px] mx-auto mb-8"
      >
        {/* The pain */}
        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-muted text-xs font-medium">Le problème, tu le connais déjà.</p>
          </div>

          <div className="space-y-2.5 mb-5">
            {[
              'Regarder 10 vidéos pour comprendre ce qui marche dans ta niche',
              'Prendre des notes sur la structure, les hooks, les transitions',
              'Analyser les tendances, les mots-clés, les angles d\'attaque',
              'Écrire un script de zéro en essayant de tout rassembler',
              'Recommencer parce que le résultat sonne pas naturel',
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

          <div className="flex items-center gap-2 text-text-dim text-[11px]">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Temps estimé : <span className="text-white/40 font-medium line-through">3 à 5 heures</span></span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-accent font-bold">3 minutes</span>
          </div>
        </div>
      </motion.div>

      {/* Closing line */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mt-10 mb-4"
      >
        <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed font-medium">
          Les créateurs qui réussissent ne réinventent pas la roue.
        </p>
        <p className="text-text-dim text-xs mt-1">
          Ils trouvent ce qui marche, et le font mieux.
        </p>
      </motion.div>
    </div>
  )
}
