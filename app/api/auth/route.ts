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
    const { firstName, email, password, mode, action } = await req.json()

    // Mode "refresh" = re-fetch user data from DB
    if (mode === 'refresh' || action === 'refresh') {
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email requis' }, { status: 400 })
      }
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (!user) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()

      return NextResponse.json({
        user: {
          id: user.id,
          first_name: user.first_name,
          email: user.email,
          credits: user.credits,
          plan: user.plan || 'free',
          isAdmin: !!admin,
        }
      })
    }

    // Mode "login" = connexion avec email + mot de passe
    if (mode === 'login') {
      if (!email?.trim() || !password) {
        return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
      }

      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (!existing) {
        return NextResponse.json({ error: 'Aucun compte trouvé avec cet email' }, { status: 404 })
      }

      if (!existing.password_hash) {
        return NextResponse.json({ error: 'Ce compte n\'a pas de mot de passe. Contacte le support.' }, { status: 400 })
      }

      if (!verifyPassword(password, existing.password_hash)) {
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
      }

      // Check if admin
      const { data: admin } = await supabase
        .from('admins')
        .select('email')
        .eq('email', existing.email)
        .single()

      return NextResponse.json({
        user: {
          id: existing.id,
          first_name: existing.first_name,
          email: existing.email,
          credits: existing.credits,
          plan: existing.plan,
          isAdmin: !!admin,
        }
      })
    }

    // Mode "register" = création de compte (depuis EmailGate)
    if (!firstName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Prénom et email requis' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email. Connecte-toi.' }, { status: 409 })
    }

    // Create new user with password
    const passwordHash = hashPassword(password)

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        first_name: firstName.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    // Log the free credit
    await supabase.from('credit_transactions').insert({
      user_id: newUser.id,
      amount: 1,
      type: 'bonus',
      description: 'Crédit offert à l\'inscription',
    })

    // Check if admin
    const { data: admin } = await supabase
      .from('admins')
      .select('email')
      .eq('email', newUser.email)
      .single()

    return NextResponse.json({
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        email: newUser.email,
        credits: newUser.credits,
        plan: newUser.plan,
        isAdmin: !!admin,
      }
    })
  } catch (e) {
    console.error('Auth error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
