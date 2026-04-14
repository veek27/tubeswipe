import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PLAN_CONFIG, PlanName } from '@/lib/plans'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('[admin/update-user] Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    const { userId, credits, plan, reason } = await req.json()

    console.log('[admin/update-user] Request:', { userId, credits, plan, reason })

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      console.error('[admin/update-user] User not found:', fetchError)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('[admin/update-user] Current user:', currentUser)

    const updates: Record<string, unknown> = {}

    // If plan changed, update plan AND auto-set credits from config
    if (plan !== undefined && plan !== currentUser.plan) {
      updates.plan = plan
      const planConfig = PLAN_CONFIG[plan as PlanName]
      if (planConfig) {
        updates.credits = planConfig.credits
        console.log('[admin/update-user] Plan changed to', plan, '-> auto credits:', planConfig.credits)
      }
    }

    // If credits explicitly set, use that value (overrides plan default)
    if (credits !== undefined && credits !== null) {
      updates.credits = credits
      console.log('[admin/update-user] Credits explicitly set to:', credits)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: 'Rien à modifier' })
    }

    console.log('[admin/update-user] Applying updates:', updates)

    const { data: updateData, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) {
      console.error('[admin/update-user] Supabase error:', error)
      return NextResponse.json({ error: `Erreur mise à jour: ${error.message}` }, { status: 500 })
    }

    console.log('[admin/update-user] Update result:', updateData)

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
    console.error('[admin/update-user] Server error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
