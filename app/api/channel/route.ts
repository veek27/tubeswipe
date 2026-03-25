import { NextRequest, NextResponse } from 'next/server'

function extractChannelIdentifier(url: string): { type: 'id' | 'handle' | 'custom'; value: string } | null {
  // Handle formats:
  // youtube.com/channel/UC...
  // youtube.com/@handle
  // youtube.com/c/CustomName
  // youtube.com/user/Username
  const channelIdMatch = url.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/)
  if (channelIdMatch) return { type: 'id', value: channelIdMatch[1] }

  const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/)
  if (handleMatch) return { type: 'handle', value: handleMatch[1] }

  const customMatch = url.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_.-]+)/)
  if (customMatch) return { type: 'custom', value: customMatch[1] }

  // Maybe they just pasted a handle like @handle
  const bareHandle = url.match(/^@?([a-zA-Z0-9_.-]+)$/)
  if (bareHandle) return { type: 'handle', value: bareHandle[1] }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { channelUrl } = await request.json()
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key non configurée' }, { status: 500 })
    }

    if (!channelUrl) {
      return NextResponse.json({ error: 'URL de chaîne manquante' }, { status: 400 })
    }

    const identifier = extractChannelIdentifier(channelUrl.trim())
    if (!identifier) {
      return NextResponse.json({ error: 'URL de chaîne YouTube invalide' }, { status: 400 })
    }

    let channelId = identifier.value

    // If we have a handle or custom name, we need to resolve it to a channel ID
    if (identifier.type === 'handle') {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(identifier.value)}&maxResults=1&key=${apiKey}`
      )
      const searchData = await searchRes.json()
      if (!searchData.items?.length) {
        return NextResponse.json({ error: 'Chaîne introuvable' }, { status: 404 })
      }
      channelId = searchData.items[0].snippet.channelId
    } else if (identifier.type === 'custom') {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(identifier.value)}&maxResults=1&key=${apiKey}`
      )
      const searchData = await searchRes.json()
      if (!searchData.items?.length) {
        return NextResponse.json({ error: 'Chaîne introuvable' }, { status: 404 })
      }
      channelId = searchData.items[0].snippet.channelId
    }

    // Fetch channel details
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`
    )
    const channelData = await channelRes.json()

    if (!channelData.items?.length) {
      return NextResponse.json({ error: 'Chaîne introuvable' }, { status: 404 })
    }

    const channel = channelData.items[0]
    const snippet = channel.snippet
    const stats = channel.statistics

    // Fetch recent videos to understand content
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=5&key=${apiKey}`
    )
    const videosData = await videosRes.json()
    const recentVideos = (videosData.items || []).map((v: { snippet: { title: string; publishedAt: string } }) => ({
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
    }))

    const result = {
      id: channelId,
      name: snippet.title,
      description: snippet.description || '',
      thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
      subscribers: formatNumber(parseInt(stats.subscriberCount || '0')),
      subscriberCount: parseInt(stats.subscriberCount || '0'),
      totalViews: formatNumber(parseInt(stats.viewCount || '0')),
      videoCount: parseInt(stats.videoCount || '0'),
      createdAt: snippet.publishedAt,
      country: snippet.country || 'Non spécifié',
      recentVideos,
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Channel fetch error:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'K'
  return num.toString()
}
