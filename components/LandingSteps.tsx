'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Step 1: Copy YouTube link animation ────────────────────────────────────
function StepCopyLink() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [phase, setPhase] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!inView) return
    const run = () => {
      setPhase(0)
      let step = 0
      intervalRef.current = setInterval(() => {
        step++
        if (step > 6) {
          step = 0
        }
        setPhase(step)
      }, 900)
    }
    run()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [inView])

  // Phases: 0=idle, 1=cursor moves to URL bar, 2=select URL, 3=copy, 4=cursor moves to input, 5=paste, 6=done
  const cursorX = phase <= 1 ? (phase === 0 ? 65 : 50) : phase <= 3 ? 50 : phase === 4 ? 50 : 50
  const cursorY = phase <= 1 ? (phase === 0 ? 30 : 14) : phase <= 3 ? 14 : phase === 4 ? 75 : 75
  const urlSelected = phase >= 2 && phase <= 3
  const showCopied = phase === 3
  const inputHasText = phase >= 5
  const showPasted = phase === 5

  return (
    <div ref={ref} className="relative w-full aspect-[4/3] bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
      {/* Mini YouTube browser mockup */}
      <div className="absolute inset-3">
        {/* Browser chrome */}
        <div className="bg-[#1a1a1a] rounded-lg border border-white/[0.06] overflow-hidden h-full flex flex-col">
          {/* URL bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
            <div className="flex gap-1">
              <div className="w-[6px] h-[6px] rounded-full bg-white/10" />
              <div className="w-[6px] h-[6px] rounded-full bg-white/10" />
              <div className="w-[6px] h-[6px] rounded-full bg-white/10" />
            </div>
            <div className={`flex-1 rounded-md px-2 py-1 text-[8px] font-mono transition-all duration-300 ${urlSelected ? 'bg-accent/20 text-accent' : 'bg-white/[0.04] text-white/40'}`}>
              <span className={urlSelected ? 'bg-accent/30 px-0.5 rounded-sm' : ''}>
                youtube.com/watch?v=dQw4w9WgXcQ
              </span>
            </div>
          </div>

          {/* YouTube content mockup */}
          <div className="flex-1 p-3 space-y-2">
            {/* Video player */}
            <div className="w-full aspect-video bg-[#111] rounded-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              {/* Play button */}
              <div className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center">
                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                <div className="h-full w-[65%] bg-accent rounded-full" />
              </div>
            </div>
            {/* Title */}
            <div className="space-y-1">
              <div className="h-2 bg-white/10 rounded-full w-[80%]" />
              <div className="h-1.5 bg-white/5 rounded-full w-[50%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating "Copied" badge */}
      <div className={`absolute top-[18%] left-1/2 -translate-x-1/2 transition-all duration-300 ${showCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="bg-accent text-white text-[7px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-accent/30">
          Copié !
        </div>
      </div>

      {/* TubeSwipe input mockup at bottom */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className={`bg-[#1a1a1a] rounded-lg border transition-all duration-300 px-3 py-2 flex items-center gap-2 ${inputHasText ? 'border-accent/40' : 'border-white/[0.06]'}`}>
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          <span className="text-[7px] font-medium text-white/30">TubeSwipe</span>
          <div className="flex-1 bg-white/[0.03] rounded-md px-2 py-1">
            <span className={`text-[7px] font-mono transition-all duration-500 ${inputHasText ? 'text-white/70' : 'text-white/15'}`}>
              {inputHasText ? 'youtube.com/watch?v=dQw4w...' : 'Colle un lien YouTube ici...'}
            </span>
          </div>
          <div className={`px-2 py-0.5 rounded-md text-[7px] font-bold transition-all duration-300 ${inputHasText ? 'bg-accent text-white' : 'bg-white/5 text-white/20'}`}>
            Analyser
          </div>
        </div>
      </div>

      {/* Floating "Collé" badge */}
      <div className={`absolute bottom-[18%] left-1/2 -translate-x-1/2 transition-all duration-300 ${showPasted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="bg-emerald-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/30">
          Collé !
        </div>
      </div>

      {/* Animated cursor */}
      <motion.div
        animate={{
          left: `${cursorX}%`,
          top: `${cursorY}%`,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute z-20 pointer-events-none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
      >
        <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
          <path d="M0 0L13.5 10.5H6.5L3.5 17L0 0Z" fill="white" />
          <path d="M0 0L13.5 10.5H6.5L3.5 17L0 0Z" stroke="black" strokeWidth="0.5" />
        </svg>
      </motion.div>
    </div>
  )
}

// ─── Step 2: Analysis scroll animation ──────────────────────────────────────
function StepAnalysis() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const interval = setInterval(() => {
      frame++
      // Smooth scroll loop: 0 → 100 → 0
      const cycle = frame % 200
      const progress = cycle < 100 ? cycle : 200 - cycle
      setScrollY(progress * 1.2)
    }, 50)
    return () => clearInterval(interval)
  }, [inView])

  return (
    <div ref={ref} className="relative w-full aspect-[4/3] bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="absolute inset-3">
        <div className="bg-[#1a1a1a] rounded-lg border border-white/[0.06] overflow-hidden h-full flex flex-col">
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[7px] font-medium text-white/30">TubeSwipe</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                <span className="text-[6px] font-bold text-accent">HOT</span>
              </div>
            </div>
          </div>

          {/* Scrolling analysis content */}
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              animate={{ y: -scrollY }}
              transition={{ duration: 0.05, ease: 'linear' }}
              className="p-3 space-y-2.5"
            >
              {/* Video info */}
              <div className="flex gap-2">
                <div className="w-16 aspect-video bg-[#111] rounded-md flex-shrink-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg width="6" height="6" fill="#E40000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="h-2 bg-white/15 rounded-full w-full" />
                  <div className="h-1.5 bg-white/8 rounded-full w-[60%]" />
                  <div className="flex gap-1">
                    <div className="h-1 bg-accent/20 rounded-full w-[30%]" />
                    <div className="h-1 bg-white/5 rounded-full w-[20%]" />
                  </div>
                </div>
              </div>

              {/* Sujet */}
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider mb-1">Sujet identifié</div>
                <div className="h-2 bg-white/12 rounded-full w-[85%] mb-1" />
                <div className="h-1.5 bg-white/6 rounded-full w-[65%]" />
              </div>

              {/* Angle */}
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider mb-1">Angle d&apos;attaque</div>
                <div className="h-1.5 bg-white/10 rounded-full w-[90%] mb-1" />
                <div className="h-1.5 bg-white/6 rounded-full w-[70%]" />
              </div>

              {/* Keywords */}
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider mb-1.5">Mots-clés</div>
                <div className="flex flex-wrap gap-1">
                  {['marketing', 'growth', 'audience', 'viral', 'hook'].map(k => (
                    <span key={k} className="px-1.5 py-0.5 bg-accent/10 border border-accent/15 rounded text-[5px] text-accent/80 font-medium">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Plan */}
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider mb-1.5">Structure</div>
                {['Hook percutant', 'Problème & contexte', 'Solution step-by-step', 'CTA puissant'].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full bg-accent/15 text-accent text-[5px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <div className="h-1.5 bg-white/8 rounded-full flex-1" />
                    <span className="text-[5px] text-white/20 hidden">{s}</span>
                  </div>
                ))}
              </div>

              {/* Pourquoi ça marche */}
              <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
                <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider mb-1">Pourquoi ça cartonne</div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-white/8 rounded-full w-[95%]" />
                  <div className="h-1.5 bg-white/6 rounded-full w-[80%]" />
                  <div className="h-1.5 bg-white/5 rounded-full w-[70%]" />
                </div>
              </div>

              {/* Tendance */}
              <div className="bg-accent/5 rounded-lg p-2 border border-accent/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="text-[6px] font-bold text-accent/60 uppercase tracking-wider">Tendance</div>
                  <div className="px-1 py-0.5 rounded bg-accent/20 text-[5px] font-bold text-accent">HOT</div>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full w-[75%]" />
              </div>
            </motion.div>

            {/* Fade edges */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#1a1a1a] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Script generation animation ────────────────────────────────────
const SCRIPT_LINES = [
  { type: 'section', text: '[HOOK - 0:00 à 0:15]' },
  { type: 'line', text: '"Tu veux exploser sur YouTube mais' },
  { type: 'line', text: 'tu sais jamais quoi poster ?"' },
  { type: 'line', text: '' },
  { type: 'line', text: 'Pose-toi 2 secondes.' },
  { type: 'line', text: 'Si tu copies les bons formats' },
  { type: 'line', text: 'de ceux qui cartonnent déjà...' },
  { type: 'line', text: '' },
  { type: 'section', text: '[INTRO - 0:15 à 0:45]' },
  { type: 'line', text: 'Salut ! Aujourd\'hui je vais te' },
  { type: 'line', text: 'montrer comment transformer' },
  { type: 'line', text: 'n\'importe quelle vidéo virale' },
  { type: 'line', text: 'en ton propre contenu.' },
  { type: 'line', text: '' },
  { type: 'line', text: 'C\'est pas du plagiat, c\'est de' },
  { type: 'line', text: 'la stratégie. Et les plus gros' },
  { type: 'line', text: 'créateurs font exactement ça.' },
  { type: 'line', text: '' },
  { type: 'section', text: '[CONTENU - 0:45 à 4:00]' },
  { type: 'line', text: 'Étape 1 : Identifie LE sujet' },
  { type: 'line', text: 'qui performe dans ta niche.' },
  { type: 'line', text: '' },
  { type: 'line', text: 'Étape 2 : Analyse pourquoi' },
  { type: 'line', text: 'ça marche — le hook, la rétention' },
  { type: 'line', text: 'la structure, le CTA...' },
]

function StepScript() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!inView) return
    setVisibleLines(0)
    let line = 0
    const interval = setInterval(() => {
      line++
      if (line > SCRIPT_LINES.length) {
        // Reset after pause
        setTimeout(() => setVisibleLines(0), 1500)
        line = 0
      }
      setVisibleLines(line)
    }, 180)
    return () => clearInterval(interval)
  }, [inView])

  return (
    <div ref={ref} className="relative w-full aspect-[4/3] bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="absolute inset-3">
        <div className="bg-[#1a1a1a] rounded-lg border border-white/[0.06] overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[7px] font-medium text-white/30">TubeSwipe</span>
              <span className="text-[6px] text-white/15">/ Script</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[6px] font-medium text-emerald-400">Génération...</span>
              </div>
            </div>
          </div>

          {/* Script content */}
          <div className="flex-1 overflow-hidden relative">
            <div className="p-3 font-mono text-[7px] leading-[1.8] space-y-0">
              {SCRIPT_LINES.map((line, i) => {
                const isVisible = i < visibleLines
                if (line.type === 'section') {
                  return (
                    <div
                      key={i}
                      className={`transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-1'}`}
                    >
                      <span className="text-accent font-bold">{line.text}</span>
                    </div>
                  )
                }
                if (line.text === '') {
                  return <div key={i} className="h-1.5" />
                }
                return (
                  <div
                    key={i}
                    className={`transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-1'}`}
                  >
                    <span className="text-white/60">{line.text}</span>
                  </div>
                )
              })}

              {/* Blinking cursor */}
              {visibleLines > 0 && visibleLines <= SCRIPT_LINES.length && (
                <span className="inline-block w-[4px] h-[10px] bg-accent animate-pulse rounded-sm ml-0.5" />
              )}
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Progress bar at the very bottom */}
      <div className="absolute bottom-3 left-6 right-6">
        <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${Math.min((visibleLines / SCRIPT_LINES.length) * 100, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main Steps Component ───────────────────────────────────────────────────
export default function LandingSteps() {
  const steps = [
    {
      num: 1,
      title: 'Copie le lien',
      desc: 'Trouve une vidéo qui cartonne, copie le lien et colle-le sur TubeSwipe.',
      component: <StepCopyLink />,
    },
    {
      num: 2,
      title: 'Analyse complète',
      desc: 'Sujet, angle, mots-clés, structure, tendances — tout décortiqué.',
      component: <StepAnalysis />,
    },
    {
      num: 3,
      title: 'Script généré',
      desc: 'Un script prêt à tourner, adapté à ta niche et ton style.',
      component: <StepScript />,
    },
  ]

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
      {steps.map((step, i) => (
        <motion.div
          key={step.num}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
          className="text-center"
        >
          {/* Visual */}
          <div className="w-full mb-4">
            {step.component}
          </div>

          {/* Text */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
              {step.num}
            </span>
            <h3 className="font-display text-base font-bold tracking-tight">
              {step.title}
            </h3>
          </div>
          <p className="text-text-muted text-xs leading-relaxed max-w-[220px] mx-auto">
            {step.desc}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
