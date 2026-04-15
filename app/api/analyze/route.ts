import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { CREDIT_COSTS } from '@/lib/plans'

export const maxDuration = 60 // Vercel Hobby plan max

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

console.log('[analyze] Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

async function fetchYouTubeData(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return {
      title: '',
      description: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      views: 'N/A',
      viewCount: 0,
      publishedAt: 'N/A',
      channelTitle: 'N/A',
      channelId: '',
    }
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
  )
  const data = await res.json()

  if (!data.items || data.items.length === 0) {
    throw new Error('Vidéo non trouvée')
  }

  const item = data.items[0]
  const snippet = item.snippet
  const stats = item.statistics

  return {
    title: snippet.title,
    description: snippet.description,
    thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    views: Number(stats.viewCount).toLocaleString('fr-FR'),
    viewCount: Number(stats.viewCount),
    publishedAt: new Date(snippet.publishedAt).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    publishedAtRaw: snippet.publishedAt,
    channelTitle: snippet.channelTitle,
    channelId: snippet.channelId,
  }
}

interface ChannelVideo {
  videoId: string
  title: string
  thumbnail: string
  views: number
  viewsFormatted: string
  viewsPerDay: number
  publishedAt: string
  daysOld: number
  multiplier: number
  url: string
}

function getDaysOld(publishedAt: string): number {
  const published = new Date(publishedAt)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24))) // min 1 day
}

function getViewsPerDay(views: number, publishedAt: string): number {
  const days = getDaysOld(publishedAt)
  return Math.round((views / days) * 10) / 10
}

async function fetchChannelOutliers(channelId: string, currentVideoId: string, currentViews: number, currentPublishedAt: string): Promise<{
  channelAvgViewsPerDay: number
  channelAvgViews: number
  multiplier: number
  isOutlier: boolean
  currentViewsPerDay: number
  currentDaysOld: number
  outlierVideos: ChannelVideo[]
}> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const empty = { channelAvgViewsPerDay: 0, channelAvgViews: 0, multiplier: 0, isOutlier: false, currentViewsPerDay: 0, currentDaysOld: 0, outlierVideos: [] }
  if (!apiKey || !channelId) return empty

  try {
    // 1. Get recent videos from the channel (up to 20 to stay fast)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=20&key=${apiKey}`
    )
    const searchData = await searchRes.json()

    if (!searchData.items || searchData.items.length === 0) return empty

    const videoIds = searchData.items
      .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
      .filter(Boolean)
      .join(',')

    // 2. Get view counts + publish dates for all videos
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
    )
    const statsData = await statsRes.json()

    if (!statsData.items || statsData.items.length === 0) return empty

    // 3. Calculate views/day for each video
    const otherVideos = statsData.items.filter(
      (v: { id: string }) => v.id !== currentVideoId
    )

    const otherViewsPerDay = otherVideos.map(
      (v: { statistics: { viewCount: string }; snippet: { publishedAt: string } }) =>
        getViewsPerDay(Number(v.statistics.viewCount), v.snippet.publishedAt)
    )

    const totalViewsPerDay = otherViewsPerDay.reduce((sum: number, vpd: number) => sum + vpd, 0)
    const channelAvgViewsPerDay = otherViewsPerDay.length > 0
      ? Math.round((totalViewsPerDay / otherViewsPerDay.length) * 10) / 10
      : 0

    // Also keep raw avg views for display
    const totalViews = otherVideos.reduce(
      (sum: number, v: { statistics: { viewCount: string } }) => sum + Number(v.statistics.viewCount),
      0
    )
    const channelAvgViews = otherVideos.length > 0 ? Math.round(totalViews / otherVideos.length) : 0

    // 4. Calculate multiplier based on views/day (time-normalized)
    const currentVPD = getViewsPerDay(currentViews, currentPublishedAt)
    const currentDays = getDaysOld(currentPublishedAt)
    const multiplier = channelAvgViewsPerDay > 0
      ? Math.round((currentVPD / channelAvgViewsPerDay) * 10) / 10
      : 0

    const isOutlier = multiplier >= 2

    // 5. Find outlier videos (time-normalized), sorted by multiplier
    const allWithMultiplier: ChannelVideo[] = statsData.items
      .filter((v: { id: string }) => v.id !== currentVideoId)
      .map((v: { id: string; snippet: { title: string; thumbnails: { high?: { url: string }; medium?: { url: string } }; publishedAt: string }; statistics: { viewCount: string } }) => {
        const views = Number(v.statistics.viewCount)
        const vpd = getViewsPerDay(views, v.snippet.publishedAt)
        const days = getDaysOld(v.snippet.publishedAt)
        const vidMultiplier = channelAvgViewsPerDay > 0
          ? Math.round((vpd / channelAvgViewsPerDay) * 10) / 10
          : 0
        return {
          videoId: v.id,
          title: v.snippet.title,
          thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`,
          views,
          viewsFormatted: views.toLocaleString('fr-FR'),
          viewsPerDay: vpd,
          publishedAt: new Date(v.snippet.publishedAt).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'short', day: 'numeric'
          }),
          daysOld: days,
          multiplier: vidMultiplier,
          url: `https://www.youtube.com/watch?v=${v.id}`,
        }
      })
      .filter((v: ChannelVideo) => v.multiplier >= 1.5)
      .sort((a: ChannelVideo, b: ChannelVideo) => b.multiplier - a.multiplier)
      .slice(0, 5)

    return {
      channelAvgViewsPerDay,
      channelAvgViews,
      multiplier,
      isOutlier,
      currentViewsPerDay: currentVPD,
      currentDaysOld: currentDays,
      outlierVideos: allWithMultiplier,
    }
  } catch (e) {
    console.error('[analyze] Channel outlier fetch error:', e)
    return { channelAvgViewsPerDay: 0, channelAvgViews: 0, multiplier: 0, isOutlier: false, currentViewsPerDay: 0, currentDaysOld: 0, outlierVideos: [] }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, userId } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'URL YouTube requise' }, { status: 400 })
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'URL YouTube invalide' }, { status: 400 })
    }

    // ── Deduct 0.5 credit for analysis ──
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      if (!user || user.credits < CREDIT_COSTS.analysis) {
        return NextResponse.json({ error: 'no_credits', message: 'Plus de crédits disponibles' }, { status: 403 })
      }

      const newCredits = Math.round((user.credits - CREDIT_COSTS.analysis) * 10) / 10
      console.log('[analyze] Deducting credits:', { userId, oldCredits: user.credits, newCredits })

      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId)
        .select('credits')
        .maybeSingle()

      if (updateError) {
        console.error('[analyze] Credit update ERROR:', updateError)
      }
      if (!updated) {
        console.error('[analyze] Credit update returned no data for user:', userId)
      } else {
        console.log('[analyze] Credits updated successfully:', updated.credits)
      }

      await supabase.from('credit_transactions').insert({
        user_id: userId,
        amount: -CREDIT_COSTS.analysis,
        type: 'usage',
        description: 'Analyse d\'une vidéo',
      })
    }

    // 1. Fetch YouTube data
    const videoInfo = await fetchYouTubeData(videoId)

    // 2. Fetch channel data for outlier detection (in parallel with Claude call, with timeout)
    const outlierTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)) // 15s max
    const outlierPromise = Promise.race([
      fetchChannelOutliers(videoInfo.channelId, videoId, videoInfo.viewCount, videoInfo.publishedAtRaw),
      outlierTimeout,
    ])

    // 3. Call Claude to analyze the video
    const systemPrompt = `Tu es un consultant expert en stratégie YouTube. Tu donnes des analyses HONNÊTES et UTILES.

RÈGLES ABSOLUES :
- Sois HONNÊTE sur la performance. Si une vidéo a peu de vues, dis-le clairement. Ne fais jamais semblant qu'elle performe bien.
- Analyse la STRUCTURE et le SUJET objectivement, indépendamment des vues.
- Donne des VRAIS CONSEILS actionnables, pas du blabla générique.
- Si le sujet est bon mais l'exécution faible, dis-le. Si le sujet est mauvais, dis-le aussi.
- Le but de l'utilisateur est de TROUVER DES BONS SUJETS à adapter à sa niche. Aide-le à savoir si ce sujet vaut le coup.

Tu dois répondre UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou après.`

    const userMessage = `Analyse cette vidéo YouTube :

URL : ${youtubeUrl}
Titre : ${videoInfo.title}
Description : ${videoInfo.description ? videoInfo.description.substring(0, 500) : '(pas de description)'}
Vues : ${videoInfo.views}
Date : ${videoInfo.publishedAt}
Chaîne : ${videoInfo.channelTitle}

Réponds avec ce JSON exact :
{
  "sujet": "Le sujet principal en une phrase courte",
  "angle": "L'angle ou la promesse spécifique utilisée",
  "verdict": "EXCELLENT ou BON ou MOYEN ou FAIBLE — ton verdict honnête sur la QUALITÉ DU SUJET (pas la vidéo elle-même). Est-ce un sujet porteur, intéressant, qui touche un vrai besoin/curiosité ?",
  "verdict_explication": "2-3 phrases HONNÊTES sur le sujet. Pourquoi ce sujet est bon ou pas. Est-il universel ? Répond-il à un vrai problème ? Y a-t-il de la demande ? Si le sujet est bateau ou saturé, dis-le. Sois direct.",
  "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "plan": [
    {"partie": "Hook", "description": "Ce que fait le hook — est-il efficace ou pas ?"},
    {"partie": "Partie 1 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Partie 2 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Partie 3 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Conclusion", "description": "Comment ça se termine"}
  ],
  "points_forts": ["Un vrai point fort du SUJET ou de l'ANGLE choisi", "Un autre"],
  "points_faibles": ["Un vrai point faible du SUJET ou de l'EXÉCUTION", "Un autre"],
  "potentiel_sujet": {
    "score": "FORT ou MOYEN ou FAIBLE",
    "explication": "Le sujet a-t-il du potentiel ? Est-ce que des gens cherchent ça ? Est-ce qu'il touche une émotion, un désir, une frustration universelle ? Sois concret.",
    "meilleur_angle": "Si tu devais refaire cette vidéo pour maximiser les vues, quel angle prendrais-tu ? Donne un titre concret."
  },
  "conseil_final": "Un conseil direct et honnête. Si la vidéo/le sujet n'est pas un bon choix, dis-le clairement et suggère de regarder les outliers de la chaîne. Si c'est bon, dis pourquoi et encourage à passer à l'étape suivante."
}`

    // Retry with short waits (must stay within 60s Vercel timeout)
    let response
    let lastError: unknown = null

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        })
        break
      } catch (err: unknown) {
        lastError = err
        const apiErr = err as { status?: number }
        if ((apiErr.status === 529 || apiErr.status === 429) && attempt < 1) {
          await new Promise(r => setTimeout(r, 3000))
          continue
        }
        if (apiErr.status === 529 || apiErr.status === 429) break
        throw err
      }
    }

    if (!response) {
      console.error('API failed after retries:', lastError)
      return NextResponse.json(
        { error: 'L\'IA est temporairement surchargée. Attends 1 minute et réessaie.' },
        { status: 503 }
      )
    }

    // Extract text from response
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Parse JSON response — aggressively strip citation tags and fix common issues
    let analysis
    const cleanText = (t: string) => t
      .replace(/```json|```/g, '')
      .replace(/<cite[^>]*?\/>/g, '')
      .replace(/<cite[^>]*>/g, '')
      .replace(/<\/cite>/g, '')
      .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : '') // remove control chars
      .trim()

    const tryParse = (t: string) => {
      // Extract the outermost JSON object
      const start = t.indexOf('{')
      const end = t.lastIndexOf('}')
      if (start === -1 || end === -1) return null
      const jsonStr = t.substring(start, end + 1)
      try {
        return JSON.parse(jsonStr)
      } catch {
        // Try fixing common issues: unescaped newlines in strings
        const fixed = jsonStr
          .replace(/,\s*}/g, '}') // remove trailing commas
          .replace(/,\s*]/g, ']')
        try {
          return JSON.parse(fixed)
        } catch {
          return null
        }
      }
    }

    const cleaned = cleanText(textContent)
    analysis = tryParse(cleaned)

    if (!analysis) {
      console.error('[analyze] Failed to parse JSON. Raw text:', textContent.substring(0, 500))
      throw new Error('Impossible de parser la réponse de l\'IA. Réessaie.')
    }

    // Deep clean: remove any remaining citation tags in all string values
    const stripCitations = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        return obj.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').trim()
      }
      if (Array.isArray(obj)) {
        return obj.map(stripCitations)
      }
      if (obj && typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = stripCitations(value)
        }
        return cleaned
      }
      return obj
    }
    analysis = stripCitations(analysis)

    // Wait for outlier data
    const outlierData = await outlierPromise

    // Read back current credits for response
    let currentCredits: number | undefined
    if (userId) {
      const { data: u } = await supabase.from('users').select('credits').eq('id', userId).single()
      currentCredits = u?.credits
    }

    return NextResponse.json({
      videoInfo,
      analysis,
      outlierData,
      credits: currentCredits,
    })
  } catch (error: unknown) {
    console.error('Analyze error:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
