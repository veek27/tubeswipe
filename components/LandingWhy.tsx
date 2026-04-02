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

      {/* Open Loop explainer - visual */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-[700px] mx-auto relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Left: Open loop visual */}
          <div className="w-full sm:w-[200px] flex-shrink-0">
            <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.06] p-4 space-y-3">
              {/* Loop visual */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#E40000" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Open Loop</span>
              </div>

              {/* Hook example */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-[8px] text-accent font-bold mt-0.5">?</span>
                  <p className="text-[8px] text-white/50 leading-relaxed italic">
                    &quot;Tu sais pourquoi 90% des créateurs ne dépassent jamais 1000 abonnés ?&quot;
                  </p>
                </div>
                <div className="h-px bg-white/[0.04]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-accent to-accent/40 rounded-full" />
                  </div>
                  <span className="text-[7px] text-white/30 flex-shrink-0">85% rétention</span>
                </div>
              </div>

              {/* Contrast */}
              <div className="space-y-1.5 opacity-40">
                <div className="flex items-start gap-2">
                  <span className="text-[8px] text-white/30 font-bold mt-0.5">—</span>
                  <p className="text-[8px] text-white/30 leading-relaxed italic">
                    &quot;Salut, aujourd&apos;hui on va parler de YouTube.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full w-[25%] bg-white/10 rounded-full" />
                  </div>
                  <span className="text-[7px] text-white/20 flex-shrink-0">25% rétention</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-0.5 bg-accent rounded-full" />
              <h3 className="font-display font-bold text-base">C&apos;est quoi un open loop ?</h3>
            </div>
            <p className="text-text-muted text-xs leading-relaxed mb-4">
              Un <span className="text-text-primary font-medium">open loop</span>, c&apos;est une question ou une promesse que tu poses au début de ta vidéo sans donner la réponse tout de suite. Le cerveau humain déteste les boucles non fermées — il <span className="text-text-primary font-medium">doit</span> connaître la suite.
            </p>
            <p className="text-text-muted text-xs leading-relaxed mb-4">
              Résultat : ta rétention explose, YouTube pousse ta vidéo, et tu rentres dans le cercle vertueux de l&apos;algorithme.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-accent/8 border border-accent/12 text-[10px] text-accent font-medium">
                Rétention
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-accent/8 border border-accent/12 text-[10px] text-accent font-medium">
                Algorithme
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-accent/8 border border-accent/12 text-[10px] text-accent font-medium">
                Watch time
              </span>
            </div>
          </div>
        </div>

        {/* Subtle bg glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* Bottom quote */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-text-dim text-xs max-w-md mx-auto leading-relaxed">
          Les créateurs qui réussissent ne réinventent pas la roue.
          <br />
          <span className="text-text-muted font-medium">Ils trouvent ce qui marche, et le font mieux.</span>
        </p>
      </motion.div>
    </div>
  )
}
