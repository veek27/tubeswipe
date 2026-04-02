import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Credit amounts per plan
const PLAN_CREDITS: Record<string, { credits: number; plan: string }> = {
  starter: { credits: 10, plan: 'starter' },
  pro: { credits: 35, plan: 'pro' },
}

function determinePlan(data: Record<string, unknown>): string {
  const planId = data.plan_id || data.product_id || (data.plan as Record<string, unknown>)?.id
  const whopStarterId = process.env.WHOP_STARTER_PLAN_ID
  const whopProId = process.env.WHOP_PRO_PLAN_ID

  if (planId === whopProId) return 'pro'
  if (planId === whopStarterId) return 'starter'

  // Fallback: try to determine from amount (in cents)
  const amount = Number(data.amount || data.final_amount || 0)
  if (amount >= 1500) return 'pro'
  return 'starter'
}

function extractEmail(data: Record<string, unknown>): string | null {
  return (
    (data.email as string) ||
    (data.customer_email as string) ||
    ((data.user as Record<string, unknown>)?.email as string) ||
    ((data.customer as Record<string, unknown>)?.email as string) ||
    null
  )
}

export async function POST(req: Request) {
  try {
    // Verify Whop webhook secret
    const whopSecret = process.env.WHOP_WEBHOOK_SECRET
    const headerSecret = req.headers.get('x-whop-signature') || req.headers.get('authorization')

    if (whopSecret && headerSecret !== whopSecret && headerSecret !== `Bearer ${whopSecret}`) {
      console.error('Whop webhook: invalid signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Whop webhook received:', JSON.stringify(body).substring(0, 500))

    // Whop V1 sends: { event: "...", data: { ... } }
    const event = body.event || body.action
    const data = body.data || body

    // ============================================
    // MEMBERSHIP ACTIVATED — new subscription
    // ============================================
    if (event === 'membership_activated' || event === 'membership.went_valid') {
      const email = extractEmail(data)
      const whopUserId = (data.user_id as string) || ((data.user as Record<string, unknown>)?.id as string)
      const planType = determinePlan(data)
      const planConfig = PLAN_CREDITS[planType]

      if (!email) {
        console.error('Whop webhook membership_activated: no email found', JSON.stringify(data).substring(0, 300))
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }

      // Find user by email
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (!user) {
        console.error('Whop webhook: user not found for email', email)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Update user: set plan, add credits, save Whop ID
      const newCredits = user.credits + planConfig.credits
      await supabase
        .from('users')
        .update({
          credits: newCredits,
          plan: planConfig.plan,
          whop_customer_id: whopUserId || user.whop_customer_id,
        })
        .eq('id', user.id)

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: planConfig.credits,
        type: 'purchase',
        description: `Activation forfait ${planConfig.plan} (+${planConfig.credits} crédits)`,
      })

      console.log(`Whop: activated ${planType} for ${email}, +${planConfig.credits} crédits (total: ${newCredits})`)
      return NextResponse.json({ success: true, credits: newCredits })
    }

    // ============================================
    // INVOICE PAID — monthly renewal
    // ============================================
    if (event === 'invoice_paid' || event === 'payment.succeeded') {
      const email = extractEmail(data)
      const planType = determinePlan(data)
      const planConfig = PLAN_CREDITS[planType]

      if (!email) {
        console.error('Whop webhook invoice_paid: no email found', JSON.stringify(data).substring(0, 300))
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (!user) {
        console.error('Whop webhook: user not found for email', email)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Reset credits to plan amount (monthly renewal = fresh credits)
      await supabase
        .from('users')
        .update({
          credits: planConfig.credits,
          plan: planConfig.plan,
        })
        .eq('id', user.id)

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: planConfig.credits,
        type: 'renewal',
        description: `Renouvellement forfait ${planConfig.plan} (${planConfig.credits} crédits)`,
      })

      console.log(`Whop: renewed ${planType} for ${email}, reset to ${planConfig.credits} crédits`)
      return NextResponse.json({ success: true, credits: planConfig.credits })
    }

    // ============================================
    // MEMBERSHIP DEACTIVATED — cancellation
    // ============================================
    if (event === 'membership_deactivated' || event === 'membership.went_invalid' || event === 'membership.cancelled') {
      const email = extractEmail(data)

      if (email) {
        await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('email', email.toLowerCase())

        console.log(`Whop: deactivated plan for ${email}, back to free`)
      }

      return NextResponse.json({ success: true })
    }

    // Unknown event — just acknowledge
    console.log('Whop webhook: unhandled event', event)
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Whop webhook error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
