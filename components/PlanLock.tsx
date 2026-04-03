'use client'

import { useRouter } from 'next/navigation'

interface PlanLockProps {
  message: string
  planRequired?: 'starter' | 'pro'
  children: React.ReactNode
  blur?: boolean
}

export default function PlanLock({ message, planRequired = 'starter', children, blur = false }: PlanLockProps) {
  const router = useRouter()

  const planLabel = planRequired === 'pro' ? 'Pro' : 'Starter'
  const planColor = planRequired === 'pro' ? 'text-purple-400' : 'text-amber-400'
  const planBorderColor = planRequired === 'pro' ? 'border-purple-500/20' : 'border-amber-500/20'
  const planBgColor = planRequired === 'pro' ? 'bg-purple-500/10' : 'bg-amber-500/10'
  const btnColor = planRequired === 'pro' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-amber-500 hover:bg-amber-600'

  if (blur) {
    return (
      <div className="relative">
        <div className="blur-[6px] pointer-events-none select-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-surface/90 backdrop-blur-sm border ${planBorderColor} max-w-[280px]`}>
            <div className={`w-10 h-10 rounded-xl ${planBgColor} flex items-center justify-center`}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={planColor}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs text-text-muted text-center leading-relaxed">{message}</p>
            <button
              onClick={() => router.push('/pricing')}
              className={`${btnColor} text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5`}
            >
              Passer {planLabel}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Inline lock (not blurred, just a message)
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${planBgColor} border ${planBorderColor}`}>
      <div className={`w-8 h-8 rounded-lg ${planBgColor} flex items-center justify-center flex-shrink-0`}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={planColor}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="text-xs text-text-muted flex-1">{message}</p>
      <button
        onClick={() => router.push('/pricing')}
        className={`${btnColor} text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0`}
      >
        {planLabel}
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  )
}
