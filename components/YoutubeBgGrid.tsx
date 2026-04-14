'use client'

// Mosaic of blurred YouTube thumbnails as a subtle background
// Uses real public YouTube thumbnail URLs from popular videos
const thumbnails = [
  'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
  'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
  'https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg',
  'https://img.youtube.com/vi/RgKAFK5djSk/mqdefault.jpg',
  'https://img.youtube.com/vi/OPf0YbXqDm0/mqdefault.jpg',
  'https://img.youtube.com/vi/fJ9rUzIMcZQ/mqdefault.jpg',
  'https://img.youtube.com/vi/60ItHLz5WEA/mqdefault.jpg',
  'https://img.youtube.com/vi/hT_nvWreIhg/mqdefault.jpg',
  'https://img.youtube.com/vi/YQHsXMglC9A/mqdefault.jpg',
  'https://img.youtube.com/vi/CevxZvSJLk8/mqdefault.jpg',
  'https://img.youtube.com/vi/pRpeEdMmmQ0/mqdefault.jpg',
  'https://img.youtube.com/vi/lp-EO5I60KA/mqdefault.jpg',
  'https://img.youtube.com/vi/SlPhMPnQ58k/mqdefault.jpg',
  'https://img.youtube.com/vi/KQ6zr6kCPj8/mqdefault.jpg',
  'https://img.youtube.com/vi/450p7goxZqg/mqdefault.jpg',
  'https://img.youtube.com/vi/e-ORhEE9VVg/mqdefault.jpg',
  'https://img.youtube.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
  'https://img.youtube.com/vi/QcIy9NiNbmo/mqdefault.jpg',
  'https://img.youtube.com/vi/bo_efYhYU2A/mqdefault.jpg',
  'https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg',
  'https://img.youtube.com/vi/XqZsoesa55w/mqdefault.jpg',
  'https://img.youtube.com/vi/nfs8NYg7yQM/mqdefault.jpg',
  'https://img.youtube.com/vi/09R8_2nJtjg/mqdefault.jpg',
  'https://img.youtube.com/vi/YykjpeuMNEk/mqdefault.jpg',
  'https://img.youtube.com/vi/7wtfhZwyrcc/mqdefault.jpg',
  'https://img.youtube.com/vi/DyDfgMOUjCI/mqdefault.jpg',
  'https://img.youtube.com/vi/PIh2xe4jnpk/mqdefault.jpg',
  'https://img.youtube.com/vi/Zi_XLOBDo_Y/mqdefault.jpg',
  'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg',
  'https://img.youtube.com/vi/PT2_F-1esPk/mqdefault.jpg',
  'https://img.youtube.com/vi/HP-MbfHFUqs/mqdefault.jpg',
  'https://img.youtube.com/vi/tjWMnP63FKM/mqdefault.jpg',
  'https://img.youtube.com/vi/uelHwf8o7_U/mqdefault.jpg',
  'https://img.youtube.com/vi/B-N1yJyrQRY/mqdefault.jpg',
  'https://img.youtube.com/vi/8SbUC-UaAxE/mqdefault.jpg',
]

export default function YoutubeBgGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Grid of thumbnails */}
      <div
        className="absolute inset-0 grid gap-1.5"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: '100px',
          padding: '0',
          filter: 'blur(8px)',
          opacity: 0.04,
          transform: 'scale(1.1)',
        }}
      >
        {thumbnails.map((thumb, i) => (
          <div
            key={i}
            className="w-full h-full bg-cover bg-center rounded-sm"
            style={{ backgroundImage: `url(${thumb})` }}
          />
        ))}
      </div>

      {/* Dark gradient overlay — stronger at top and bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 30%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%)',
        }}
      />

      {/* Subtle red tint overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(228,0,0,0.03) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
