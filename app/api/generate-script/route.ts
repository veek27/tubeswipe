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

    const systemPrompt = `Tu es un scriptwriter YouTube d'élite. Tu appliques la méthodologie des meilleurs créateurs YouTube francophones (Safian, etc.).

## TES PRINCIPES FONDAMENTAUX (à respecter ABSOLUMENT) :

### 1. LE SUJET EST ROI
Le sujet est le levier #1 sur YouTube. Un seul bon sujet peut générer 10K abonnés. Tu ne changes JAMAIS le sujet ni l'angle de la vidéo originale — tu les ADAPTES à la niche du créateur. Le sujet a DÉJÀ prouvé qu'il fonctionne, ton job c'est de le transposer, pas de le réinventer.

### 2. DIRE LES BONNES CHOSES AUX BONNES PERSONNES
Chaque phrase du script doit parler DIRECTEMENT à l'ICP (profil client idéal). Pas de généralités. Pas de "tout le monde". Tu écris comme si tu parlais à UNE personne spécifique qui a un problème spécifique.

### 3. LE HOOK DÉCIDE DE TOUT
Les 30 premières secondes déterminent si le viewer reste ou part. Le hook doit :
- Créer une TENSION immédiate (curiosité, douleur, promesse forte)
- Faire un "pattern interrupt" — surprendre, choquer légèrement, casser les attentes
- Permettre au viewer de s'IDENTIFIER ("c'est exactement mon problème")
- Faire une PROMESSE claire de ce qu'il va obtenir en restant

### 4. LA STRUCTURE RETIENT L'ATTENTION
- Chaque partie doit contenir une MINI-TENSION qui pousse à regarder la suite
- Les transitions doivent créer des "open loops" (poser une question, annoncer quelque chose de surprenant)
- Alterner entre contenu de valeur et moments émotionnels (storytelling, anecdotes, exemples concrets)
- NE JAMAIS être ennuyeux — si une partie est juste informative, ajoute une histoire ou un exemple percutant

### 5. PRÉ-QUALIFICATION DU VIEWER
Le script doit naturellement filtrer : attirer les bonnes personnes et repousser les mauvaises. Le CTA doit guider vers l'action logique suivante (s'abonner, regarder une autre vidéo, télécharger une ressource, prendre rdv...).

### 6. PAS DE FLUFF, PAS DE BULLSHIT
- Zéro phrase de remplissage ("dans cette vidéo on va voir...", "avant de commencer...")
- Chaque phrase doit avoir une RAISON d'exister
- Être direct, concret, actionnable
- Le script ne doit PAS être trop long — la qualité > la quantité

## CE QUE TU NE FAIS JAMAIS :
- Écrire des formules génériques copiées-collées
- Faire des intros longues et ennuyeuses
- Utiliser du jargon que l'ICP ne comprend pas
- Écrire un script "safe" et fade — il faut de la personnalité, de l'opinion, du tranchant
- Oublier l'émotion — un bon script fait RESSENTIR quelque chose
- INVENTER des informations sur le créateur, sa niche, son business, ses résultats, ses clients. Tu utilises UNIQUEMENT ce qui est fourni dans les champs ci-dessous. Si un champ dit "Non précisé" ou "Aucune", tu n'inventes RIEN pour le combler. Tu restes dans le cadre de ce qui t'est donné.

Tu écris en français, de manière naturelle et engageante.`

    const userMessage = `## VIDÉO ORIGINALE À ADAPTER

SUJET ORIGINAL : ${analysis.sujet}
ANGLE ORIGINAL : ${analysis.angle}
MOTS-CLÉS : ${(analysis.mots_cles || []).join(', ')}

PLAN STRUCTUREL DE LA VIDÉO ORIGINALE :
${(analysis.plan || []).map((p: { partie: string; description: string }, i: number) => `${i + 1}. ${p.partie} — ${p.description}`).join('\n')}

POURQUOI CETTE VIDÉO A FONCTIONNÉ :
- Sujet : ${analysis.pourquoi?.sujet_attire || 'Non analysé'}
- Hook : ${analysis.pourquoi?.hook_fonctionne || 'Non analysé'}
- Structure : ${analysis.pourquoi?.structure_retient || 'Non analysé'}
- Éléments clés : ${(analysis.pourquoi?.elements_cles || []).join(' | ')}

## LE CRÉATEUR QUI VEUT ADAPTER CE SUJET

MA NICHE : ${niche}
MON ICP (profil client idéal) : ${icp}
MON ANGLE / POSITIONNEMENT UNIQUE : ${angle || 'Non précisé'}
MON STYLE DE CONTENU : ${style || 'Naturel et direct'}
INFOS SUPPLÉMENTAIRES : ${extra || 'Aucune'}
${channelInfo ? `
MA CHAÎNE YOUTUBE :
- Nom : ${channelInfo.name}
- ${channelInfo.subscribers} abonnés | ${channelInfo.totalViews} vues totales | ${channelInfo.videoCount} vidéos
- Description : ${channelInfo.description || 'Non renseignée'}
- Mes dernières vidéos : ${(channelInfo.recentVideos || []).map((v: { title: string }) => v.title).join(' | ')}
→ Adapte le ton et le niveau au stade de cette chaîne. Garde une cohérence avec les vidéos existantes.
` : ''}

## TA MISSION

1. GARDE le même SUJET et le même ANGLE que la vidéo originale — c'est prouvé, ça marche
2. GARDE la même STRUCTURE narrative (même nombre de parties, même progression, mêmes open loops)
3. TRANSPOSE tout à la niche du créateur : exemples, références, métaphores, vocabulaire
4. Le HOOK doit être adapté à l'ICP : toucher SA douleur, SON désir, SA curiosité
5. Chaque partie doit parler du problème spécifique de l'ICP, pas de généralités
6. Le CTA doit être cohérent avec la niche et le business du créateur

## RÈGLE ABSOLUE : NE RIEN INVENTER
- Tu n'inventes JAMAIS de chiffres, résultats, clients, anecdotes ou détails sur le créateur
- Si le créateur dit "ma niche c'est le fitness", tu parles de fitness — tu n'inventes pas qu'il a "aidé 200 clients" ou "généré X€"
- Les exemples que tu donnes dans le script doivent être GÉNÉRIQUES à la niche (pas inventés sur le créateur)
- Si tu as besoin d'une anecdote, utilise un format comme "Imagine que..." ou "Prends l'exemple de quelqu'un qui..." — jamais "J'ai personnellement..." avec des détails inventés

## VÉRIFICATION AVANT DE RÉPONDRE
Avant de finaliser le script, vérifie mentalement :
✓ Le sujet est le MÊME que l'original (juste transposé à la niche) ?
✓ Le hook crée une tension immédiate et fait s'identifier l'ICP ?
✓ Chaque transition crée un open loop qui donne envie de continuer ?
✓ Il n'y a AUCUNE phrase de remplissage inutile ?
✓ Le script est concret, avec des exemples spécifiques à la niche ?
✓ Le CTA est naturel et guide vers la bonne action ?
✓ Le script a de la PERSONNALITÉ, pas un ton robotique ?
✓ Tu n'as RIEN inventé sur le créateur qui n'était pas dans les données fournies ?

## FORMAT DE RÉPONSE EXACT

[TITRE SUGGÉRÉ]
Un titre YouTube optimisé pour le CTR, qui reprend le sujet prouvé adapté à la niche. Court, percutant, avec un élément de curiosité ou une promesse forte.

[HOOK — 0:00 à 0:30]
Le texte du hook mot pour mot. Doit créer une tension immédiate.

[PARTIE 1 — Titre]
Le contenu mot pour mot, avec transitions et open loops...

(continue pour CHAQUE partie du plan original — même nombre de parties)

[CTA — Conclusion]
Le call to action naturel et cohérent avec la niche

[IDÉE MINIATURE]
Description précise : texte sur la miniature, expression du visage, couleurs, composition, émotion véhiculée. La miniature est le levier #2 après le sujet — elle doit donner ENVIE de cliquer.

[NOTES DE PRODUCTION]
2-3 conseils concrets pour le tournage : ton à adopter, moments à accentuer, rythme à suivre.`

    // Retry with short waits (must stay within 60s Vercel timeout)
    let response
    let lastError: unknown = null

    for (let attempt = 0; attempt < 2; attempt++) {
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
