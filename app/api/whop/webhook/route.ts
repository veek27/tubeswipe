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

function extractMetadataUserId(data: Record<string, unknown>): string | null {
  // Whop sends metadata from checkout URL
  const metadata = data.metadata as Record<string, unknown> | undefined
  if (metadata?.user_id) return metadata.user_id as string

  // Also check nested checkout.metadata
  const checkout = data.checkout as Record<string, unknown> | undefined
  const checkoutMeta = checkout?.metadata as Record<string, unknown> | undefined
  if (checkoutMeta?.user_id) return checkoutMeta.user_id as string

  return null
}

// Find user: try by metadata user_id first, then by whop_customer_id, then by email
async function findUser(data: Record<string, unknown>) {
  // 1. Try metadata user_id (most reliable — passed from our checkout URL)
  const metaUserId = extractMetadataUserId(data)
  if (metaUserId) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', metaUserId)
      .single()
    if (user) {
      console.log(`Whop: found user by metadata user_id: ${metaUserId}`)
      return user
    }
  }

  // 2. Try whop_customer_id (for renewals after first activation)
  const whopUserId = (data.user_id as string) || ((data.user as Record<string, unknown>)?.id as string)
  if (whopUserId) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('whop_customer_id', whopUserId)
      .single()
    if (user) {
      console.log(`Whop: found user by whop_customer_id: ${whopUserId}`)
      return user
    }
  }

  // 3. Fallback: email
  const email = extractEmail(data)
  if (email) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
    if (user) {
      console.log(`Whop: found user by email: ${email}`)
      return user
    }
  }

  console.error('Whop: could not find user. metadata_user_id:', metaUserId, 'whop_user_id:', whopUserId, 'email:', email)
  return null
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
      const whopUserId = (data.user_id as string) || ((data.user as Record<string, unknown>)?.id as string)
      const planType = determinePlan(data)
      const planConfig = PLAN_CREDITS[planType]

      const user = await findUser(data)
      if (!user) {
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

      console.log(`Whop: activated ${planType} for ${user.email}, +${planConfig.credits} crédits (total: ${newCredits})`)
      return NextResponse.json({ success: true, credits: newCredits })
    }

    // ============================================
    // INVOICE PAID — monthly renewal
    // ============================================
    if (event === 'invoice_paid' || event === 'payment.succeeded') {
      const planType = determinePlan(data)
      const planConfig = PLAN_CREDITS[planType]

      const user = await findUser(data)
      if (!user) {
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

      console.log(`Whop: renewed ${planType} for ${user.email}, reset to ${planConfig.credits} crédits`)
      return NextResponse.json({ success: true, credits: planConfig.credits })
    }

    // ============================================
    // MEMBERSHIP DEACTIVATED — cancellation
    // ============================================
    if (event === 'membership_deactivated' || event === 'membership.went_invalid' || event === 'membership.cancelled') {
      const user = await findUser(data)

      if (user) {
        await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('id', user.id)

        console.log(`Whop: deactivated plan for ${user.email}, back to free`)
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
