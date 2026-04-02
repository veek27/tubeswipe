import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === verify
}

export async function POST(req: Request) {
  try {
    const { userId, currentPassword, newPassword } = await req.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Aucun mot de passe défini' }, { status: 400 })
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
    }

    // Update password
    const newHash = hashPassword(newPassword)
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId)

    if (error) {
      console.error('Update password error:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Change password error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
