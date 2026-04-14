// Plan configuration — single source of truth
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    credits: 1,
    maxProfiles: 1,
    historyLimit: 1, // only last analysis visible
    youtubeChannel: false,
    price: 0,
  },
  starter: {
    name: 'Starter',
    credits: 10,
    maxProfiles: 1,
    historyLimit: Infinity, // all history
    youtubeChannel: false,
    price: 690, // cents
  },
  pro: {
    name: 'Pro',
    credits: 35,
    maxProfiles: Infinity,
    historyLimit: Infinity,
    youtubeChannel: true,
    price: 1790, // cents
  },
} as const

export type PlanName = keyof typeof PLAN_CONFIG

export const CREDIT_COSTS = {
  analysis: 0.5,
  script: 0.5,
} as const

export function getPlanConfig(plan: string) {
  return PLAN_CONFIG[(plan as PlanName)] || PLAN_CONFIG.free
}
