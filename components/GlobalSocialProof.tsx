'use client'

import { useStore } from '@/store/useStore'
import SocialProofToast from './SocialProofToast'

export default function GlobalSocialProof() {
  const { user, hasMounted } = useStore()

  // Don't show until hydrated
  if (!hasMounted) return null

  // Hide for paying users (Starter/Pro)
  if (user && user.plan !== 'free') return null

  // Show for: not logged in, or logged in on free plan
  return <SocialProofToast />
}
