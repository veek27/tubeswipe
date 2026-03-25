import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

async function fetchYouTubeData(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    // Fallback: return minimal info if no YouTube API key
    return {
      title: '',
      description: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      views: 'N/A',
      publishedAt: 'N/A',
      channelTitle: 'N/A',
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
    publishedAt: new Date(snippet.publishedAt).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    channelTitle: snippet.channelTitle,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'URL YouTube requise' }, { status: 400 })
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'URL YouTube invalide' }, { status: 400 })
    }

    // 1. Fetch YouTube data
    const videoInfo = await fetchYouTubeData(videoId)

    // 2. Call Claude to analyze the video
    const systemPrompt = `Tu es un expert mondial en stratégie de contenu YouTube et en analyse virale. Tu analyses des vidéos pour comprendre pourquoi elles fonctionnent et extraire leur structure.

Tu dois répondre UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans texte avant ou après. Juste le JSON.`

    const userMessage = `Analyse cette vidéo YouTube en profondeur :

URL : ${youtubeUrl}
Titre : ${videoInfo.title || '(recherche le titre via web search)'}
Description : ${videoInfo.description ? videoInfo.description.substring(0, 500) : '(recherche la description via web search)'}
Vues : ${videoInfo.views}
Date : ${videoInfo.publishedAt}
Chaîne : ${videoInfo.channelTitle}

Fais une recherche web sur cette vidéo et ce sujet pour avoir le maximum de contexte.

Réponds avec ce JSON exact :
{
  "sujet": "Le sujet principal en une phrase courte et percutante",
  "angle": "L'angle ou la promesse spécifique de la vidéo",
  "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "plan": [
    {"partie": "Hook (0:00-0:30)", "description": "Description précise du hook utilisé"},
    {"partie": "Partie 1 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Partie 2 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Partie 3 - [Titre]", "description": "Ce qui est couvert"},
    {"partie": "Conclusion / CTA", "description": "Comment la vidéo se termine"}
  ],
  "pourquoi": {
    "sujet_attire": "Pourquoi ce SUJET attire les clics (émotion, curiosité, timing, universalité...) — 2-3 phrases concrètes",
    "hook_fonctionne": "Pourquoi le HOOK fonctionne (promesse claire, pattern interrupt, identification...) — 2-3 phrases concrètes",
    "structure_retient": "Pourquoi la STRUCTURE retient l'attention (storytelling, tension, progression...) — 2-3 phrases concrètes",
    "elements_cles": [
      "Premier élément clé qui explique la performance",
      "Deuxième élément clé",
      "Troisième élément clé"
    ]
  },
  "tendances": {
    "score": "HOT ou WARM ou EVERGREEN",
    "explication": "2-3 phrases sur la popularité actuelle de ce sujet sur Google Trends, YouTube, réseaux sociaux",
    "opportunite": "Conseil actionnable en 1-2 phrases pour surfer sur cette tendance",
    "conseil": "Un conseil stratégique pour quelqu'un qui veut adapter ce sujet à sa niche"
  }
}`

    // Try models in order with retry logic
    const models = ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022']
    let response
    let lastError: unknown = null

    for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (model === 'claude-sonnet-4-20250514') {
            response = await anthropic.messages.create({
              model,
              max_tokens: 2000,
              system: systemPrompt,
              tools: [{ type: 'web_search_20250305', name: 'web_search' }],
              messages: [{ role: 'user', content: userMessage }],
            })
          } else {
            response = await anthropic.messages.create({
              model,
              max_tokens: 2000,
              system: systemPrompt,
              messages: [{ role: 'user', content: userMessage }],
            })
          }
          break
        } catch (err: unknown) {
          lastError = err
          const apiErr = err as { status?: number }
          if (apiErr.status === 529 && attempt < 2) {
            await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
            continue
          }
          // If overloaded on last attempt, try next model
          if (apiErr.status === 529) break
          throw err
        }
      }
      if (response) break
    }

    if (!response) {
      console.error('All models failed:', lastError)
      return NextResponse.json(
        { error: 'L\'IA est temporairement surchargée. Réessaie dans 30 secondes.' },
        { status: 503 }
      )
    }

    // Extract text from response
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Parse JSON response
    let analysis
    try {
      const cleaned = textContent.replace(/```json|```/g, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Impossible de parser la réponse de Claude')
      }
    }

    return NextResponse.json({ videoInfo, analysis })
  } catch (error: unknown) {
    console.error('Analyze error:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
