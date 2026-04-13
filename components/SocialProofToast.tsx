'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 60% hommes, 40% femmes
const MALE_NAMES = [
  'Julien', 'Thomas', 'Lucas', 'Hugo', 'Léo', 'Nathan', 'Maxime', 'Alexandre',
  'Antoine', 'Raphaël', 'Mathis', 'Théo', 'Enzo', 'Louis', 'Arthur', 'Paul',
  'Clément', 'Victor', 'Nicolas', 'Adrien', 'Romain', 'Bastien', 'Florian',
  'Valentin', 'Gabriel', 'Quentin', 'Dylan', 'Axel', 'Sacha', 'Mehdi',
]

const FEMALE_NAMES = [
  'Emma', 'Léa', 'Chloé', 'Manon', 'Camille', 'Sarah', 'Laura', 'Julie',
  'Marine', 'Pauline', 'Océane', 'Lisa', 'Clara', 'Inès', 'Jade', 'Zoé',
  'Mathilde', 'Charlotte', 'Margaux', 'Anaïs',
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

// Messages variés — ton pro mais accessible
const MESSAGES_STARTER = [
  (name: string) => `${name} vient de s'abonner au plan Starter`,
  (name: string) => `${name} a activé son abonnement Starter`,
  (name: string) => `${name} vient de passer au plan Starter`,
  (name: string) => `${name} a rejoint TubeSwap en Starter`,
  (name: string) => `${name} a débloqué le plan Starter`,
  (name: string) => `${name} vient de s'abonner — plan Starter activé`,
  (name: string) => `Nouveau membre : ${name} en plan Starter`,
  (name: string) => `${name} a choisi le plan Starter`,
]

const MESSAGES_PRO = [
  (name: string) => `${name} vient de passer au plan Pro`,
  (name: string) => `${name} a activé le plan Pro — scripts illimités`,
  (name: string) => `${name} a rejoint TubeSwap en Pro`,
  (name: string) => `${name} vient de s'abonner au plan Pro`,
  (name: string) => `${name} a débloqué le plan Pro`,
  (name: string) => `Nouveau membre Pro : ${name}`,
]

const EMOJIS_STARTER = ['🔥', '🚀', '⚡', '💪', '✨', '🎯']
const EMOJIS_PRO = ['👑', '💎', '🏆', '⭐', '🔱', '🎖️']

function generateNotification() {
  const isMale = Math.random() < 0.6
  const names = isMale ? MALE_NAMES : FEMALE_NAMES
  const firstName = names[Math.floor(Math.random() * names.length)]
  const lastInitial = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  const isPro = Math.random() > 0.65
  const plan = isPro ? 'Pro' : 'Starter'
  const timeAgo = Math.floor(Math.random() * 15) + 1
  const name = `${firstName} ${lastInitial}.`

  const messages = isPro ? MESSAGES_PRO : MESSAGES_STARTER
  const emojis = isPro ? EMOJIS_PRO : EMOJIS_STARTER
  const message = messages[Math.floor(Math.random() * messages.length)](name)
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]

  return {
    message,
    emoji,
    city,
    plan,
    timeAgo: timeAgo === 1 ? 'à l\'instant' : `il y a ${timeAgo} min`,
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

    // Hide after 5.5s
    setTimeout(() => setVisible(false), 5500)
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
        const delay = 8000 + Math.random() * 17000
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
            initial={{ opacity: 0, y: 30, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, x: -10, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto bg-surface/95 backdrop-blur-md border border-border/80 rounded-2xl px-5 py-4 shadow-2xl shadow-black/40 flex items-start gap-4 max-w-[400px]"
          >
            {/* Party emoji */}
            <div className="flex-shrink-0 text-xl">
              🎉
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-text-primary font-medium leading-snug">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  notification.plan === 'Pro'
                    ? 'bg-purple-500/15 text-purple-400'
                    : 'bg-accent/10 text-accent'
                }`}>
                  {notification.plan}
                </span>
                <span className="text-[10px] text-text-dim">
                  {notification.city}
                </span>
                <span className="text-[10px] text-text-dim">·</span>
                <span className="text-[10px] text-text-dim">
                  {notification.timeAgo}
                </span>
              </div>
            </div>

            {/* Live pulse */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
