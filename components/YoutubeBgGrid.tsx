'use client'

import { useState } from 'react'

// Business / Make Money / Entrepreneuriat YouTube video IDs
// Hormozi, Yomi Denzel, Iman Gadzhi, Alex Becker, Graham Stephan, etc.
const videoIds = [
  'MlMpsPmGq7M', // Hormozi - $100M Leads
  'MKlx3-Fh6rY', // Hormozi - How to get customers
  'DvnejAMN9pA', // Yomi Denzel
  '4xFMSaLPXso', // Yomi Denzel
  'n0F59LoSMHQ', // Iman Gadzhi
  'gqGEMQvBEJY', // Iman Gadzhi
  'jgpsE7aLD_Y', // Graham Stephan
  'NT1i26RbrhY', // Ali Abdaal
  '36mBhFSiVNM', // Alex Hormozi gym launch
  'c_hO_fjmMnk', // Gary Vee
  'mXB21XiF5ek', // Tai Lopez
  'lCcwn6bGUtU', // Grant Cardone
  'Tew8jPgHceQ', // Patrick Bet David
  'PqI5LNjbkMo', // Ryan Pineda
  'HcjHvCEDoIU', // Noah Kagan
  'r8mTJCOY9Hw', // Codie Sanchez
  'SB-MwPxJoHQ', // Hormozi
  'vAoB4VbhRzM', // My First Million
  'WvUFXEKBpJc', // Business casual
  'YVkMkSVbEjQ', // Make money online
  '3qHkcs3kG44', // Dan Lok
  'w3jLJU7DT5E', // Will Smith business
  'Unzc731iCUY', // TED business
  'qJNrZ-sMbO0', // Charlie Morgan
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
    <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, filter: 'blur(4px)', height: '100vh' }}>
      {/* YouTube top bar */}
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center px-5 gap-4 border-b border-white/8" style={{ backgroundColor: 'rgba(15,15,15,0.95)' }}>
        {/* Hamburger */}
        <div className="flex flex-col gap-[4px] mr-1">
          <div className="w-5 h-[2px] bg-white/30 rounded-full" />
          <div className="w-5 h-[2px] bg-white/30 rounded-full" />
          <div className="w-5 h-[2px] bg-white/30 rounded-full" />
        </div>
        {/* YT Logo */}
        <div className="flex items-center gap-1">
          <div className="w-8 h-5.5 bg-red-600 rounded flex items-center justify-center">
            <div style={{ width: 0, height: 0, borderLeft: '6px solid white', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
          </div>
          <span className="text-white/50 text-xs font-bold tracking-tight">YouTube</span>
        </div>
        {/* Search bar */}
        <div className="flex-1 max-w-[380px] mx-auto flex">
          <div className="flex-1 h-9 rounded-l-full border border-white/15 bg-white/5 flex items-center px-4">
            <div className="h-1.5 rounded-full bg-white/10 w-28" />
          </div>
          <div className="w-14 h-9 rounded-r-full bg-white/8 border border-l-0 border-white/15 flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {/* Right icons */}
        <div className="flex gap-4 items-center">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600/50" />
        </div>
      </div>

      {/* Category chips */}
      <div className="absolute top-14 left-[4.5rem] right-0 h-12 flex items-center gap-2.5 px-4 border-b border-white/5">
        {['Tout', 'Tendances', 'Business', 'Entrepreneuriat', 'Podcasts', 'Make Money', 'Marketing', 'Récemment mis en ligne'].map((c, i) => (
          <div key={c} className={`px-3.5 py-1.5 rounded-lg text-[9px] font-medium whitespace-nowrap ${i === 0 ? 'bg-white/90 text-black/80' : 'bg-white/10 text-white/40'}`}>
            {c}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="absolute left-0 top-14 bottom-0 w-[4.5rem] flex flex-col items-center pt-5 gap-5 border-r border-white/5" style={{ backgroundColor: 'rgba(15,15,15,0.7)' }}>
        {[
          { icon: '🏠', label: 'Accueil' },
          { icon: '🎬', label: 'Shorts' },
          { icon: '📺', label: 'Abonnements' },
          { icon: '📁', label: 'Bibliothèque' },
          { icon: '⏰', label: 'Historique' },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 ${i === 0 ? 'opacity-40' : 'opacity-20'}`}>
            <span className="text-xs">{item.icon}</span>
            <span className="text-[7px] text-white/60">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Video grid with real business thumbnails */}
      <div
        className="absolute top-[6.5rem] left-[5rem] right-3 bottom-0 grid gap-x-4 gap-y-6 p-3 overflow-hidden"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {videoIds.map((id, i) => (
          <Thumb key={id} id={id} index={i} />
        ))}
      </div>

      {/* Overlay — fade to black at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 35%, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.85) 45%, rgba(10,10,10,0.97) 85%),
            linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, transparent 8%, transparent 45%, rgba(10,10,10,1) 75%)
          `,
        }}
      />
    </div>
  )
}
