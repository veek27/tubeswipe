import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }

    // Get current credits
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (user.credits <= 0) {
      return NextResponse.json({ error: 'no_credits', message: 'Plus de crédits disponibles' }, { status: 403 })
    }

    // Decrement credit and verify the update
    const newCredits = user.credits - 1
    const { data: updated, error } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)
      .select('credits')
      .single()

    if (error) {
      console.error('Credit update error:', error)
      return NextResponse.json({ error: 'Erreur mise à jour crédits' }, { status: 500 })
    }

    if (!updated) {
      console.error('Credit update returned no data — RLS may be blocking the update')
      return NextResponse.json({ error: 'Mise à jour crédits échouée' }, { status: 500 })
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -1,
      type: 'usage',
      description: 'Génération d\'un script',
    })

    return NextResponse.json({ credits: updated.credits })
  } catch (e) {
    console.error('Use credit error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
