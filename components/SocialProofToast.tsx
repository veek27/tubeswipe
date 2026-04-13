'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FIRST_NAMES = [
  'Julien', 'Thomas', 'Lucas', 'Hugo', 'Léo', 'Nathan', 'Maxime', 'Alexandre',
  'Antoine', 'Raphaël', 'Mathis', 'Théo', 'Enzo', 'Louis', 'Arthur', 'Paul',
  'Clément', 'Victor', 'Nicolas', 'Adrien', 'Romain', 'Bastien', 'Florian',
  'Emma', 'Léa', 'Chloé', 'Manon', 'Camille', 'Sarah', 'Laura', 'Julie',
  'Marine', 'Pauline', 'Océane', 'Lisa', 'Clara', 'Inès', 'Jade', 'Zoé',
  'Mathilde', 'Charlotte', 'Margaux', 'Anaïs', 'Louise', 'Romane', 'Ambre',
]

const CITIES = [
  // France
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes',
  'Strasbourg', 'Montpellier', 'Nice', 'Rennes', 'Grenoble', 'Rouen',
  'Toulon', 'Dijon', 'Angers', 'Reims', 'Saint-Étienne', 'Clermont-Ferrand',
  'Le Havre', 'Brest', 'Tours', 'Metz', 'Perpignan', 'Caen', 'Aix-en-Provence',
  // Belgique
  'Bruxelles', 'Liège', 'Namur', 'Charleroi', 'Mons', 'Louvain-la-Neuve',
  // Suisse
  'Genève', 'Lausanne', 'Zurich', 'Berne', 'Fribourg', 'Neuchâtel', 'Sion',
]

function generateNotification() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  const plan = Math.random() > 0.35 ? 'Starter' : 'Pro'
  const timeAgo = Math.floor(Math.random() * 12) + 1

  return {
    name: `${firstName} ${lastInitial}.`,
    city,
    plan,
    timeAgo: `il y a ${timeAgo} min`,
    id: Date.now(),
  }
}

export default function SocialProofToast() {
  const [notification, setNotification] = useState<ReturnType<typeof generateNotification> | null>(null)
  const [visible, setVisible] = useState(false)

  const showNotification = useCallback(() => {
    const notif = generateNotification()
    setNotification(notif)
    setVisible(true)

    // Hide after 4s
    setTimeout(() => setVisible(false), 4000)
  }, [])

  useEffect(() => {
    // First notification after 3-5s
    const initialDelay = 3000 + Math.random() * 2000
    const firstTimer = setTimeout(() => {
      showNotification()
      startLoop()
    }, initialDelay)

    let interval: NodeJS.Timeout

    function startLoop() {
      // Then every 8s to 25s randomly
      function scheduleNext() {
        const delay = 8000 + Math.random() * 17000 // 8s to 25s
        interval = setTimeout(() => {
          showNotification()
          scheduleNext()
        }, delay)
      }
      scheduleNext()
    }

    return () => {
      clearTimeout(firstTimer)
      clearTimeout(interval)
    }
  }, [showNotification])

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="pointer-events-auto bg-surface border border-border rounded-xl px-4 py-3 shadow-xl shadow-black/30 flex items-center gap-3 max-w-[340px]"
          >
            {/* Green dot — "live" indicator */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-text-primary font-medium truncate">
                <span className="font-semibold">{notification.name}</span>
                {' '}vient de passer{' '}
                <span className={notification.plan === 'Pro' ? 'text-purple-400 font-bold' : 'text-accent font-bold'}>
                  {notification.plan}
                </span>
              </p>
              <p className="text-[10px] text-text-dim mt-0.5">
                {notification.city} · {notification.timeAgo}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
