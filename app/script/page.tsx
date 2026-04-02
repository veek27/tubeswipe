'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export default function ScriptPage() {
  const router = useRouter()
  const { script, analysis, nicheData, user, savedAnalysisId, reset } = useStore()
  const [copied, setCopied] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => {
    if (!script) router.replace('/')
  }, [script, router])

  // Save script to Supabase
  useEffect(() => {
    if (script && user && !savedRef.current) {
      savedRef.current = true
      fetch('/api/save-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          analysisId: savedAnalysisId || null,
          scriptContent: script,
          niche: nicheData?.niche || null,
          icp: nicheData?.icp || null,
        }),
      }).catch(console.error)
    }
  }, [script, user, nicheData, savedAnalysisId])

  if (!script) return null

  const handleCopy = async () => {
    // Strip formatting markers for clean copy
    const cleanText = script
      .replace(/\[([^\]]+)\]/g, '--- $1 ---')
    await navigator.clipboard.writeText(cleanText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRestart = () => {
    reset()
    router.push('/')
  }

  // Parse script sections
  const renderScript = () => {
    const parts = script.split(/\[([^\]]+)\]/)
    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (!part) continue

      // Odd indices are section titles (captured groups)
      if (i % 2 === 1) {
        elements.push(
          <div key={`title-${i}`} className="mt-8 mb-3 first:mt-0">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 bg-accent rounded-full" />
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider">{part}</h3>
            </div>
          </div>
        )
      } else {
        elements.push(
          <div key={`content-${i}`} className="text-sm text-text-primary leading-[1.8] font-mono whitespace-pre-wrap">
            {part}
          </div>
        )
      }
    }

    return elements
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-[780px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/niche')}
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Modifier ma niche
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 w-1 bg-accent rounded-full" />
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Ton script personnalisé</h1>
              </div>
              <p className="text-text-muted text-sm ml-4">
                Basé sur : &quot;<span className="text-text-primary">{analysis?.sujet}</span>&quot;
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                copied
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-border text-text-muted hover:text-text-primary hover:border-accent/30'
              }`}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copié !
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copier le script
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Script content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-6 sm:p-8"
        >
          {renderScript()}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => router.push('/niche')}
            className="px-5 py-3 rounded-xl border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 text-sm font-medium transition-all"
          >
            Modifier ma niche
          </button>
          <button
            onClick={handleCopy}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copier le script
          </button>
          <button
            onClick={handleRestart}
            className="px-5 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Nouvelle vidéo
          </button>
        </motion.div>
      </div>
    </div>
  )
}
