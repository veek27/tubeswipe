'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useEffect, useState } from 'react'

const steps = [
  { text: 'Récupération des données YouTube...', duration: 2000 },
  { text: 'Analyse du sujet et de la structure...', duration: 4000 },
  { text: 'Évaluation du potentiel du sujet...', duration: 5000 },
  { text: 'Comparaison avec les autres vidéos de la chaîne...', duration: 4000 },
  { text: 'Détection des outliers...', duration: 3000 },
  { text: 'Préparation des résultats...', duration: 3000 },
  { text: 'Encore quelques secondes...', duration: 99000 },
]

export default function AnalysisLoader() {
  const { isLoading } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [tongueOut, setTongueOut] = useState(false)

  // Progress through steps
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      return
    }

    let timeout: NodeJS.Timeout
    const advance = (step: number) => {
      if (step >= steps.length - 1) return
      timeout = setTimeout(() => {
        setCurrentStep(step + 1)
        advance(step + 1)
      }, steps[step].duration)
    }
    advance(0)

    return () => clearTimeout(timeout)
  }, [isLoading])

  // Tongue animation
  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setTongueOut(true)
      setTimeout(() => setTongueOut(false), 600)
    }, 2500)
    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(8px)' }}
        >
          {/* Caméléon */}
          <motion.div
            className="relative mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.svg" alt="TubeSwap" className="w-28 h-28 sm:w-36 sm:h-36" />

            {/* Tongue */}
            <motion.div
              className="absolute right-[-8px] top-[42%]"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: tongueOut ? 1 : 0 }}
              transition={{ duration: 0.3, ease: tongueOut ? 'easeOut' : 'easeIn' }}
            >
              <div className="flex items-center">
                <div className="w-8 h-1 bg-accent rounded-full" />
                <div className="w-2 h-2 bg-accent rounded-full -ml-0.5" />
              </div>
            </motion.div>
          </motion.div>

          {/* Step text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-base text-text-primary font-medium mb-4 text-center px-6"
            >
              {steps[currentStep].text}
            </motion.p>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {steps.slice(0, -1).map((_, i) => (
              <motion.div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i <= currentStep ? 'bg-accent' : 'bg-white/10'
                }`}
                animate={i === currentStep ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.6, repeat: i === currentStep ? Infinity : 0 }}
              />
            ))}
          </div>

          {/* Subtle hint */}
          <p className="text-[11px] text-text-dim">
            L&apos;analyse prend environ 15 secondes
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
