import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PLAN_CONFIG, PlanName } from '@/lib/plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, credits, plan, reason } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    // Get current user data
    const { data: currentUser } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', userId)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    // If plan changed, auto-set credits to the new plan's default
    if (plan !== undefined && plan !== currentUser.plan) {
      updates.plan = plan
      const planConfig = PLAN_CONFIG[plan as PlanName]
      if (planConfig) {
        updates.credits = planConfig.credits
      }
    }

    // If credits explicitly set, use that value (overrides plan default)
    if (credits !== undefined) {
      updates.credits = credits
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: 'Rien à modifier' })
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Admin update error:', error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    // Log the change
    const newCredits = updates.credits !== undefined ? updates.credits : currentUser.credits
    const description = reason
      || (updates.plan
        ? `Plan changé: ${currentUser.plan} → ${updates.plan} (crédits: ${newCredits})`
        : `Modification admin (nouveau solde: ${newCredits})`)

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: Number(newCredits) - currentUser.credits,
      type: 'admin',
      description,
    })

    return NextResponse.json({ success: true, updates })
  } catch (e) {
    console.error('Admin update error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
