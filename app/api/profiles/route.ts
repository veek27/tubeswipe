import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Create a profile
export async function POST(req: Request) {
  try {
    const { userId, name, niche, icp, angle, style, extra, channelUrl, channelInfo } = await req.json()

    if (!userId || !name?.trim()) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name: name.trim(),
        niche: niche || null,
        icp: icp || null,
        angle: angle || null,
        style: style || null,
        extra: extra || null,
        channel_url: channelUrl || null,
        channel_info: channelInfo || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create profile error:', error)
      return NextResponse.json({ error: 'Erreur création profil' }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (e) {
    console.error('Profile error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Update a profile
export async function PUT(req: Request) {
  try {
    const { profileId, userId, name, niche, icp, angle, style, extra, channelUrl, channelInfo } = await req.json()

    if (!profileId || !userId || !name?.trim()) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        niche: niche || null,
        icp: icp || null,
        angle: angle || null,
        style: style || null,
        extra: extra || null,
        channel_url: channelUrl || null,
        channel_info: channelInfo || null,
      })
      .eq('id', profileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update profile error:', error)
      return NextResponse.json({ error: 'Erreur mise à jour profil' }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (e) {
    console.error('Profile update error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Delete a profile
export async function DELETE(req: Request) {
  try {
    const { profileId, userId } = await req.json()

    if (!profileId || !userId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', userId)

    if (error) {
      console.error('Delete profile error:', error)
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Profile delete error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
