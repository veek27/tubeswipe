'use client'

import { motion } from 'framer-motion'

// YouTube FR creator avatars — using UI Faces / placeholder style
const creators = [
  { name: 'Léo', img: 'https://i.pravatar.cc/80?img=11' },
  { name: 'Manon', img: 'https://i.pravatar.cc/80?img=5' },
  { name: 'Hugo', img: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Théo', img: 'https://i.pravatar.cc/80?img=33' },
  { name: 'Clara', img: 'https://i.pravatar.cc/80?img=9' },
  { name: 'Karim', img: 'https://i.pravatar.cc/80?img=51' },
  { name: 'Julie', img: 'https://i.pravatar.cc/80?img=23' },
  { name: 'Enzo', img: 'https://i.pravatar.cc/80?img=53' },
]

export default function CreatorsBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex items-center gap-3 mb-6"
    >
      {/* Stacked avatars */}
      <div className="flex -space-x-2.5">
        {creators.map((creator, i) => (
          <motion.img
            key={creator.name}
            src={creator.img}
            alt={creator.name}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            className="w-8 h-8 rounded-full border-2 border-bg object-cover"
            style={{ zIndex: creators.length - i }}
          />
        ))}
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-amber-400 text-xs font-bold">4.9</span>
        </div>
        <p className="text-text-muted text-xs">
          Rejoint par <span className="text-text-primary font-semibold">850+ créateurs</span> YouTube
        </p>
      </div>
    </motion.div>
  )
}
