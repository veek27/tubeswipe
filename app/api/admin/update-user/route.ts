import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { adminEmail, userId, credits, plan } = await req.json()

    // Verify admin
    const { data: admin } = await supabase
      .from('admins')
      .select('email')
      .eq('email', adminEmail)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
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

    // Log credit change if applicable
    if (credits !== undefined) {
      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: credits,
        type: 'admin',
        description: `Modification admin (nouveau solde: ${credits})`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin update error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
