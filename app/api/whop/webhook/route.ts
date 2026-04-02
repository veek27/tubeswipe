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

export async function POST(req: Request) {
  try {
    // Verify Whop webhook secret
    const whopSecret = process.env.WHOP_WEBHOOK_SECRET
    const headerSecret = req.headers.get('x-whop-signature') || req.headers.get('authorization')

    if (whopSecret && headerSecret !== whopSecret && headerSecret !== `Bearer ${whopSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const event = body.event || body.action
    const data = body.data || body

    // Handle different Whop events
    if (event === 'membership.went_valid' || event === 'payment.succeeded') {
      const email = data.email || data.customer_email || data.user?.email
      const planId = data.plan_id || data.product_id || data.plan?.id
      const whopCustomerId = data.customer_id || data.user?.id

      if (!email) {
        console.error('Whop webhook: no email found', body)
        return NextResponse.json({ error: 'No email' }, { status: 400 })
      }

      // Determine plan from Whop product/plan ID
      // Map your Whop product IDs here
      let planType = 'starter'
      const whopStarterId = process.env.WHOP_STARTER_PLAN_ID
      const whopProId = process.env.WHOP_PRO_PLAN_ID

      if (planId === whopProId) {
        planType = 'pro'
      } else if (planId === whopStarterId) {
        planType = 'starter'
      } else {
        // Try to determine from amount
        const amount = data.amount || data.final_amount || 0
        if (amount >= 1500) planType = 'pro' // 17.90€ = 1790 cents
        else planType = 'starter'
      }

      const planConfig = PLAN_CREDITS[planType]

      // Find user by email
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (!user) {
        console.error('Whop webhook: user not found', email)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Update user: set plan, add credits, save Whop ID
      const newCredits = user.credits + planConfig.credits
      await supabase
        .from('users')
        .update({
          credits: newCredits,
          plan: planConfig.plan,
          whop_customer_id: whopCustomerId || user.whop_customer_id,
        })
        .eq('id', user.id)

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: planConfig.credits,
        type: 'purchase',
        description: `Achat forfait ${planConfig.plan} (+${planConfig.credits} crédits)`,
      })

      console.log(`Whop: credited ${planConfig.credits} to ${email} (${planType})`)
      return NextResponse.json({ success: true, credits: newCredits })
    }

    // Handle cancellation
    if (event === 'membership.went_invalid' || event === 'membership.cancelled') {
      const email = data.email || data.customer_email || data.user?.email
      if (email) {
        await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('email', email.toLowerCase())

        console.log(`Whop: cancelled plan for ${email}`)
      }
      return NextResponse.json({ success: true })
    }

    // Unknown event — just acknowledge
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('Whop webhook error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
