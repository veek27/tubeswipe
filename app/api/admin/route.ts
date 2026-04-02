import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { adminEmail } = await req.json()

    // Verify admin
    const { data: admin } = await supabase
      .from('admins')
      .select('email')
      .eq('email', adminEmail)
      .single()

    if (!admin) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Fetch all users with stats
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    // Fetch counts
    const { count: totalAnalyses } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })

    const { count: totalScripts } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })

    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Fetch recent transactions
    const { data: recentTransactions } = await supabase
      .from('credit_transactions')
      .select('*, users(first_name, email)')
      .order('created_at', { ascending: false })
      .limit(30)

    // Count by plan
    const planCounts = {
      free: users?.filter(u => u.plan === 'free').length || 0,
      starter: users?.filter(u => u.plan === 'starter').length || 0,
      pro: users?.filter(u => u.plan === 'pro').length || 0,
    }

    // Revenue estimate
    const revenue = (planCounts.starter * 6.90) + (planCounts.pro * 17.90)

    return NextResponse.json({
      users: users || [],
      stats: {
        totalUsers: users?.length || 0,
        totalAnalyses: totalAnalyses || 0,
        totalScripts: totalScripts || 0,
        totalProfiles: totalProfiles || 0,
        planCounts,
        monthlyRevenue: revenue,
      },
      recentTransactions: recentTransactions || [],
    })
  } catch (e) {
    console.error('Admin error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
