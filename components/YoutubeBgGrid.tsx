'use client'

import { useState } from 'react'

// Real YouTube video IDs for thumbnails
const videoIds = [
  'dQw4w9WgXcQ', 'kJQP7kiw5Fk', '9bZkp7q19f0', 'JGwWNGJdvx8',
  'RgKAFK5djSk', 'OPf0YbXqDm0', 'fJ9rUzIMcZQ', '60ItHLz5WEA',
  'hT_nvWreIhg', 'YQHsXMglC9A', 'CevxZvSJLk8', 'pRpeEdMmmQ0',
  'lp-EO5I60KA', 'SlPhMPnQ58k', 'e-ORhEE9VVg', '2Vv-BfVoq4g',
  'bo_efYhYU2A', 'aircAruvnKk', 'nfs8NYg7yQM', '09R8_2nJtjg',
  'PT2_F-1esPk', 'HP-MbfHFUqs', 'B-N1yJyrQRY', '7wtfhZwyrcc',
]

const durations = ['12:34', '8:21', '15:07', '6:45', '22:18', '10:03', '4:56', '18:32', '7:14', '11:49', '3:28', '14:55', '9:37', '20:11', '5:43', '16:28', '13:09', '7:52', '19:44', '8:15', '11:23', '6:08', '17:36', '9:51']

function Thumb({ id, index }: { id: string; index: number }) {
  const [err, setErr] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#1a1a1a' }}>
        {!err ? (
          <img
            src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setErr(true)}
          />
        ) : (
          <div className="w-full h-full bg-zinc-800" />
        )}
        {/* Duration */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[8px] font-mono font-medium px-1.5 py-0.5 rounded">
          {durations[index]}
        </div>
        {/* Red progress bar */}
        <div className="absolute bottom-0 left-0 h-[3px] bg-red-600" style={{ width: `${20 + (index * 23) % 75}%` }} />
      </div>
      {/* Info row */}
      <div className="flex gap-2 px-0.5">
        <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="h-2 bg-white/12 rounded-sm mb-1.5 w-full" />
          <div className="h-2 bg-white/8 rounded-sm mb-2" style={{ width: `${55 + (index * 17) % 35}%` }} />
          <div className="h-1.5 bg-white/5 rounded-sm w-16" />
        </div>
      </div>
    </div>
  )
}

export default function YoutubeBgGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* YouTube top bar */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center px-5 gap-4 border-b border-white/5" style={{ backgroundColor: 'rgba(15,15,15,0.95)' }}>
        <div className="flex flex-col gap-[3px]">
          <div className="w-5 h-[2px] bg-white/25 rounded-full" />
          <div className="w-5 h-[2px] bg-white/25 rounded-full" />
          <div className="w-5 h-[2px] bg-white/25 rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-7 h-5 bg-red-600/70 rounded flex items-center justify-center">
            <div style={{ width: 0, height: 0, borderLeft: '5px solid rgba(255,255,255,0.8)', borderTop: '3px solid transparent', borderBottom: '3px solid transparent' }} />
          </div>
          <span className="text-white/30 text-[10px] font-bold">YouTube</span>
        </div>
        <div className="flex-1 max-w-[300px] mx-auto h-7 rounded-full border border-white/10 bg-white/5 flex items-center px-4">
          <div className="h-1.5 rounded-full bg-white/8 w-24" />
        </div>
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-white/5" />
          <div className="w-7 h-7 rounded-full bg-white/5" />
          <div className="w-7 h-7 rounded-full bg-purple-600/40" />
        </div>
      </div>

      {/* Category chips */}
      <div className="absolute top-12 left-16 right-0 h-10 flex items-center gap-2 px-4">
        {['Tout', 'Tendances', 'Musique', 'Gaming', 'Podcasts', 'En direct', 'Récemment'].map((c, i) => (
          <div key={c} className={`px-3 py-1 rounded-lg text-[8px] font-medium whitespace-nowrap ${i === 0 ? 'bg-white/15 text-white/40' : 'bg-white/5 text-white/20'}`}>
            {c}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="absolute left-0 top-12 bottom-0 w-16 flex flex-col items-center pt-4 gap-5 border-r border-white/5" style={{ backgroundColor: 'rgba(15,15,15,0.7)' }}>
        {['🏠', '🔥', '📺', '🎬', '📡', '⏰'].map((icon, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] opacity-20">{icon}</span>
            <div className="w-7 h-1 rounded-full bg-white/5" />
          </div>
        ))}
      </div>

      {/* Video grid with real thumbnails */}
      <div
        className="absolute top-[5.5rem] left-[4.5rem] right-3 bottom-0 grid gap-x-4 gap-y-6 p-3 overflow-hidden"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {videoIds.map((id, i) => (
          <Thumb key={id} id={id} index={i} />
        ))}
      </div>

      {/* Overlay — dark fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 35%, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.88) 45%, rgba(10,10,10,0.97) 85%),
            linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, transparent 10%, transparent 50%, rgba(10,10,10,1) 80%)
          `,
        }}
      />
    </div>
  )
}
