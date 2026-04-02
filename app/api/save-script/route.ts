import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, analysisId, scriptContent, niche, icp } = await req.json()

    if (!userId || !scriptContent) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('scripts')
      .insert({
        user_id: userId,
        analysis_id: analysisId || null,
        script_content: scriptContent,
        niche: niche || null,
        icp: icp || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Save script error:', error)
      return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ script: data })
  } catch (e) {
    console.error('Save script error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
