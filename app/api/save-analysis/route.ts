import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, youtubeUrl, videoInfo, analysis } = await req.json()

    if (!userId || !analysis) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        youtube_url: youtubeUrl,
        video_title: videoInfo?.title || null,
        video_thumbnail: videoInfo?.thumbnail || null,
        channel_name: videoInfo?.channelTitle || null,
        analysis,
        video_info: videoInfo,
      })
      .select()
      .single()

    if (error) {
      console.error('Save analysis error:', error)
      return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ analysis: data })
  } catch (e) {
    console.error('Save analysis error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
