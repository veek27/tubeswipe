import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { firstName, email } = await req.json()

    if (!firstName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Prénom et email requis' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      if (existing.first_name !== firstName.trim()) {
        await supabase
          .from('users')
          .update({ first_name: firstName.trim() })
          .eq('id', existing.id)
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

    // Create new user (1 free credit by default via DB default)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        first_name: firstName.trim(),
        email: email.trim().toLowerCase(),
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
