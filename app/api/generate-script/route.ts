import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60 // Allow up to 60s for retries on Vercel

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { analysis, niche, icp, angle, style, extra, channelInfo } = await request.json()

    if (!analysis || !niche || !icp) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const systemPrompt = `Tu es un expert en copywriting YouTube et en stratégie de contenu.
Tu écris des scripts YouTube viraux, percutants, adaptés à une niche précise.
Tu n'écris JAMAIS de formules génériques. Chaque script est unique, ancré dans la réalité de la niche et de l'audience.
Tu écris en français, de manière naturelle et engageante.`

    const userMessage = `Voici le sujet et le plan d'une vidéo YouTube qui a bien fonctionné :

SUJET ORIGINAL : ${analysis.sujet}
ANGLE : ${analysis.angle}
PLAN :
${(analysis.plan || []).map((p: { partie: string; description: string }, i: number) => `${i + 1}. ${p.partie} — ${p.description}`).join('\n')}

Ta mission : réécris un script complet en l'adaptant parfaitement à cette niche et audience :

MA NICHE : ${niche}
MON ICP : ${icp}
MON ANGLE / POSITIONNEMENT : ${angle || 'Non précisé'}
MON STYLE : ${style || 'Naturel et direct'}
INFOS SUPPLÉMENTAIRES : ${extra || 'Aucune'}
${channelInfo ? `
DONNÉES DE MA CHAÎNE YOUTUBE :
- Nom : ${channelInfo.name}
- Abonnés : ${channelInfo.subscribers}
- Vues totales : ${channelInfo.totalViews}
- Nombre de vidéos : ${channelInfo.videoCount}
- Description : ${channelInfo.description || 'Non renseignée'}
- Dernières vidéos : ${(channelInfo.recentVideos || []).map((v: { title: string }) => v.title).join(', ')}

Utilise ces données pour :
- Adapter le niveau de langage et la maturité du contenu au stade de la chaîne
- S'inspirer du style et des sujets des dernières vidéos pour garder une cohérence
- Faire des références subtiles qui parlent à l'audience existante
` : ''}
Instructions de rédaction :
- Garde la STRUCTURE du plan original (même architecture narrative)
- Adapte TOUS les exemples, références, métaphores à la niche
- Le hook doit accrocher MON ICP spécifiquement (douleur, désir, curiosité)
- Chaque partie doit parler directement au problème de mon ICP
- Inclus des transitions naturelles entre les parties
- Le CTA doit être cohérent avec ma niche
- Style : ${style || 'direct, naturel, avec de l\'autorité'}

Format de réponse EXACT (utilise ces marqueurs) :

[TITRE SUGGÉRÉ]
Le titre YouTube optimisé pour le CTR

[HOOK — 0:00 à 0:30]
Le texte du hook mot pour mot

[PARTIE 1 — Titre de la partie]
Le contenu mot pour mot...

(continue pour chaque partie du plan)

[CTA — Conclusion]
Le call to action mot pour mot

[IDÉE MINIATURE]
Description courte et précise de l'image de miniature idéale (couleurs, texte, expression, composition)`

    // Retry with long waits to respect rate limits
    let response
    let lastError: unknown = null

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        })
        break
      } catch (err: unknown) {
        lastError = err
        const apiErr = err as { status?: number }
        if ((apiErr.status === 529 || apiErr.status === 429) && attempt < 2) {
          await new Promise(r => setTimeout(r, 15000 * (attempt + 1)))
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

    const script = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return NextResponse.json({ script })
  } catch (error: unknown) {
    console.error('Generate script error:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
