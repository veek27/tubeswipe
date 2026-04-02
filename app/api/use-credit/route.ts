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

    // Decrement credit
    const newCredits = user.credits - 1
    const { error } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (error) {
      console.error('Credit update error:', error)
      return NextResponse.json({ error: 'Erreur mise à jour crédits' }, { status: 500 })
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -1,
      type: 'usage',
      description: 'Génération d\'un script',
    })

    return NextResponse.json({ credits: newCredits })
  } catch (e) {
    console.error('Use credit error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
