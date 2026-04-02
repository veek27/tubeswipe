import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key non configurée' }, { status: 500 })
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchQuery = query.trim().replace(/^@/, '')

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=5&key=${apiKey}`
    )
    const data = await res.json()

    if (!data.items?.length) {
      return NextResponse.json({ results: [] })
    }

    const results = data.items.map((item: { snippet: { channelId: string; title: string; description: string; thumbnails: { default?: { url: string } } } }) => ({
      id: item.snippet.channelId,
      name: item.snippet.title,
      description: item.snippet.description?.substring(0, 100) || '',
      thumbnail: item.snippet.thumbnails?.default?.url || '',
    }))

    return NextResponse.json({ results })
  } catch (error: unknown) {
    console.error('Channel search error:', error)
    return NextResponse.json({ error: 'Erreur recherche' }, { status: 500 })
  }
}
