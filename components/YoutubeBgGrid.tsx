'use client'

// Realistic YouTube interface as subtle background
// Mimics the actual YouTube homepage grid layout

const thumbColors = [
  '#2a1f3d', '#1a2e4a', '#3d1f1f', '#1f3d2a', '#3d3a1f', '#1f2d3d',
  '#2d1f3d', '#1a3a4a', '#3d2a1f', '#1f3d35', '#3a3d1f', '#1f1f3d',
  '#2a3d1f', '#4a1a2e', '#1f3d3d', '#3d1f2d', '#1f4a3a', '#3d2d1f',
  '#1f2a3d', '#2e1a4a', '#3d1f3a', '#2a3d2d', '#4a3a1a', '#1f3d1f',
]

function VideoCard({ color, index }: { color: string; index: number }) {
  const durations = ['12:34', '8:21', '15:07', '6:45', '22:18', '10:03', '4:56', '18:32', '7:14', '11:49', '3:28', '14:55', '9:37', '20:11', '5:43', '16:28', '13:09', '7:52', '19:44', '8:15', '11:23', '6:08', '17:36', '9:51']

  return (
    <div className="flex flex-col gap-1.5">
      {/* Thumbnail */}
      <div
        className="w-full rounded-lg relative overflow-hidden"
        style={{
          aspectRatio: '16/9',
          backgroundColor: color,
        }}
      >
        {/* Play icon center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-6 rounded bg-black/40 flex items-center justify-center">
            <div style={{ width: 0, height: 0, borderLeft: '6px solid rgba(255,255,255,0.6)', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white/80 text-[7px] font-mono px-1 py-0.5 rounded">
          {durations[index % durations.length]}
        </div>
        {/* Red progress bar */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-red-600" style={{ width: `${30 + (index * 17) % 70}%` }} />
      </div>
      {/* Video info */}
      <div className="flex gap-1.5">
        {/* Channel avatar */}
        <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}cc` }} />
        <div className="flex-1 min-w-0">
          {/* Title lines */}
          <div className="h-1.5 rounded-full bg-white/15 mb-1 w-full" />
          <div className="h-1.5 rounded-full bg-white/10 mb-1.5" style={{ width: `${50 + (index * 13) % 40}%` }} />
          {/* Channel + views */}
          <div className="h-1 rounded-full bg-white/6 mb-0.5" style={{ width: `${40 + (index * 11) % 30}%` }} />
          <div className="flex gap-1 items-center">
            <div className="h-1 rounded-full bg-white/5 w-6" />
            <div className="w-0.5 h-0.5 rounded-full bg-white/5" />
            <div className="h-1 rounded-full bg-white/5 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function YoutubeBgGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* YouTube-like top bar */}
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 gap-3" style={{ backgroundColor: 'rgba(15,15,15,0.9)' }}>
        {/* Hamburger */}
        <div className="flex flex-col gap-[3px]">
          <div className="w-4 h-[2px] bg-white/20 rounded-full" />
          <div className="w-4 h-[2px] bg-white/20 rounded-full" />
          <div className="w-4 h-[2px] bg-white/20 rounded-full" />
        </div>
        {/* YT Logo */}
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-3.5 bg-red-600/60 rounded-sm flex items-center justify-center">
            <div style={{ width: 0, height: 0, borderLeft: '4px solid white', borderTop: '2.5px solid transparent', borderBottom: '2.5px solid transparent', opacity: 0.6 }} />
          </div>
          <span className="text-white/25 text-[8px] font-bold tracking-tight">YouTube</span>
        </div>
        {/* Search bar */}
        <div className="flex-1 max-w-[240px] mx-auto h-5 rounded-full border border-white/10 bg-white/5 flex items-center px-3">
          <div className="w-full h-1 rounded-full bg-white/5" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="absolute left-0 top-10 bottom-0 w-14 flex flex-col items-center pt-3 gap-4" style={{ backgroundColor: 'rgba(15,15,15,0.6)' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 rounded-full bg-white/8" />
            <div className="w-6 h-0.5 rounded-full bg-white/5" />
          </div>
        ))}
      </div>

      {/* Video grid */}
      <div
        className="absolute top-12 left-16 right-2 bottom-0 grid gap-x-3 gap-y-5 p-2"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'min-content',
          opacity: 0.8,
        }}
      >
        {thumbColors.map((color, i) => (
          <VideoCard key={i} color={color} index={i} />
        ))}
      </div>

      {/* Dark overlay — smooth fade on all edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 40%, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.90) 50%, rgba(10,10,10,0.98) 100%),
            linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, transparent 15%, transparent 60%, rgba(10,10,10,1) 85%),
            linear-gradient(to right, rgba(10,10,10,0.9) 0%, transparent 10%, transparent 90%, rgba(10,10,10,0.9) 100%)
          `,
        }}
      />
    </div>
  )
}
