'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function AppNav() {
  const router = useRouter()
  const { user } = useStore()

  if (!user) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-5 py-4">
      <div className="max-w-[900px] mx-auto flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs text-text-muted font-medium hover:text-text-primary transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          TubeSwipe
        </button>

        <div className="flex items-center gap-2">
          {user.isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 text-xs font-medium transition-all"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </button>
          )}
          {/* Credits badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs">
            <div className="w-5 h-5 rounded-md bg-accent/15 flex items-center justify-center">
              <span className="text-accent font-bold text-[10px]">{user.credits}</span>
            </div>
            <span className="text-text-dim">crédit{user.credits !== 1 ? 's' : ''}</span>
          </div>
          {/* Dashboard button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-primary hover:border-accent/30 text-xs font-medium transition-all"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Tableau de bord
          </button>
        </div>
      </div>
    </div>
  )
}
