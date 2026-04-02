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

    // Fetch analyses
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch scripts
    const { data: scripts } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      analyses: analyses || [],
      scripts: scripts || [],
      profiles: profiles || [],
    })
  } catch (e) {
    console.error('Dashboard error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
