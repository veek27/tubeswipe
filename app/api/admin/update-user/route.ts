import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, credits, plan, reason } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (credits !== undefined) updates.credits = credits
    if (plan !== undefined) updates.plan = plan

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    // Log credit change
    if (credits !== undefined) {
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: credits,
        type: 'admin',
        description: reason || `Modification admin (nouveau solde: ${credits})`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin update error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
