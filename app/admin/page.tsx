'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'

interface UserRecord {
  id: string
  first_name: string
  email: string
  credits: number
  plan: string
  whop_customer_id: string | null
  created_at: string
}

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string
  created_at: string
  users: { first_name: string; email: string } | null
}

interface Stats {
  totalUsers: number
  totalAnalyses: number
  totalScripts: number
  totalProfiles: number
  planCounts: { free: number; starter: number; pro: number }
  monthlyRevenue: number
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useStore()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [editCredits, setEditCredits] = useState('')
  const [editPlan, setEditPlan] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/')
      return
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router])

  const fetchData = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email }),
      })
      const data = await res.json()
      setUsers(data.users || [])
      setStats(data.stats || null)
      setTransactions(data.recentTransactions || [])
    } catch (e) {
      console.error('Admin fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !user) return
    try {
      await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          userId: editingUser.id,
          credits: editCredits ? parseInt(editCredits) : undefined,
          plan: editPlan || undefined,
        }),
      })
      setEditingUser(null)
      fetchData()
    } catch (e) {
      console.error('Update error:', e)
    }
  }

  const openEdit = (u: UserRecord) => {
    setEditingUser(u)
    setEditCredits(u.credits.toString())
    setEditPlan(u.plan)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const daysSince = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  }

  const filteredUsers = users.filter(u =>
    u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user?.isAdmin) return null

  return (
    <div className="min-h-screen px-5 py-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-text-muted hover:text-text-primary text-sm flex items-center gap-2 mb-6 transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-accent rounded-full" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold uppercase">Admin</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted text-sm">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Chargement...
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8"
              >
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-accent font-bold text-2xl font-mono">{stats.totalUsers}</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">Utilisateurs</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-text-primary font-bold text-2xl font-mono">{stats.totalAnalyses}</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">Analyses</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-text-primary font-bold text-2xl font-mono">{stats.totalScripts}</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">Scripts</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-emerald-400 font-bold text-2xl font-mono">{stats.monthlyRevenue.toFixed(0)}€</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">MRR</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-amber-400 font-bold text-2xl font-mono">{stats.planCounts.starter}</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">Starter</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="text-purple-400 font-bold text-2xl font-mono">{stats.planCounts.pro}</p>
                  <p className="text-text-dim text-[10px] uppercase tracking-wider font-medium mt-1">Pro</p>
                </div>
              </motion.div>
            )}

            {/* Users Table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-8"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-base">Utilisateurs ({users.length})</h2>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-dim font-mono w-48"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-text-dim text-[10px] uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                      <th className="text-left px-4 py-3 font-medium">Plan</th>
                      <th className="text-center px-4 py-3 font-medium">Crédits</th>
                      <th className="text-left px-4 py-3 font-medium">Inscrit</th>
                      <th className="text-center px-4 py-3 font-medium">Ancienneté</th>
                      <th className="text-center px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium">{u.first_name}</p>
                          <p className="text-text-dim text-xs font-mono">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            u.plan === 'pro' ? 'bg-purple-500/15 text-purple-400' :
                            u.plan === 'starter' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-surface-2 text-text-dim'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-mono font-bold text-sm ${u.credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {u.credits}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-text-muted font-mono">{formatDate(u.created_at)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-text-muted">{daysSince(u.created_at)}j</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEdit(u)}
                            className="px-3 py-1 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-accent hover:border-accent/30 text-xs font-medium transition-all"
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-surface border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h2 className="font-display font-bold text-base">Transactions récentes</h2>
              </div>
              <div className="divide-y divide-border/50">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-text-dim text-sm">Aucune transaction</div>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          t.amount > 0
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {t.amount > 0 ? `+${t.amount}` : t.amount}
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{t.users?.first_name || '?'}</span>
                            <span className="text-text-dim text-xs ml-2">{t.users?.email}</span>
                          </p>
                          <p className="text-text-dim text-xs">{t.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          t.type === 'bonus' ? 'bg-emerald-500/10 text-emerald-400' :
                          t.type === 'purchase' ? 'bg-blue-500/10 text-blue-400' :
                          t.type === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-surface-2 text-text-dim'
                        }`}>
                          {t.type}
                        </span>
                        <p className="text-text-dim text-[10px] font-mono mt-1">{formatDate(t.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold mb-1">Modifier {editingUser.first_name}</h3>
              <p className="text-text-dim text-xs mb-5 font-mono">{editingUser.email}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Crédits</label>
                  <input
                    type="number"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Plan</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text-primary text-sm font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  Sauvegarder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
