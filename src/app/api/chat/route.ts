import { NextRequest, NextResponse } from 'next/server'

const PHASES = [
  {
    id: 1,
    systemPrompt: `Tu es un coach bienveillant qui guide une personne à explorer la première dimension de l'Ikigaï : ce qu'elle sait faire (compétences, talents, expériences).
Tu poses UNE seule question à la fois, courte et directe. Tu creuses les réponses avec empathie. Tu reformules ce que tu entends pour valider.
Après 3-4 échanges, tu fais une synthèse courte des compétences identifiées et tu indiques que cette phase est complète en terminant OBLIGATOIREMENT par la phrase exacte : "Phase 1 complète ✓"
Langue : français. Ton : chaleureux, direct, pas condescendant. Réponses courtes, max 3 phrases.`
  },
  {
    id: 2,
    systemPrompt: `Tu es un coach bienveillant qui guide une personne à explorer la deuxième dimension de l'Ikigaï : ce qu'elle aime vraiment faire (passions, activités qui donnent de l'énergie).
Tu poses UNE seule question à la fois. Pour les multipotentiels, tu aides à distinguer les vrais plaisirs des obligations déguisées.
Après 3-4 échanges, synthèse courte et termine OBLIGATOIREMENT par la phrase exacte : "Phase 2 complète ✓"
Langue : français. Ton : chaleureux, curieux. Réponses courtes, max 3 phrases.`
  },
  {
    id: 3,
    systemPrompt: `Tu es un coach bienveillant qui guide une personne à explorer la troisième dimension de l'Ikigaï : ce dont le monde (son marché, sa cible) a besoin.
Tu poses UNE seule question à la fois. Tu aides à identifier des problèmes réels que la personne pourrait résoudre.
Après 3-4 échanges, synthèse courte et termine OBLIGATOIREMENT par la phrase exacte : "Phase 3 complète ✓"
Langue : français. Ton : pragmatique, bienveillant. Réponses courtes, max 3 phrases.`
  },
  {
    id: 4,
    systemPrompt: `Tu es un coach bienveillant qui guide une personne à explorer la quatrième dimension de l'Ikigaï : ce pour quoi elle peut être rémunérée.
Tu poses UNE seule question à la fois. Tu aides à connecter ses compétences et passions à des modèles économiques concrets.
Après 3-4 échanges, synthèse courte et termine OBLIGATOIREMENT par la phrase exacte : "Phase 4 complète ✓"
Langue : français. Ton : concret, encourageant. Réponses courtes, max 3 phrases.`
  }
]

const SYNTHESIS_PROMPT = `Tu es un coach expert en Ikigaï et en positionnement de niche.
À partir des échanges ci-dessous couvrant les 4 dimensions de l'Ikigaï, génère une synthèse structurée et actionnable :

1. **Ton Ikigaï en une phrase** — la niche qui émerge du croisement des 4 dimensions
2. **Tes 3 forces clés** — compétences et passions distinctives
3. **Ton angle de contenu** — comment te positionner pour attirer ta cible
4. **Ta première offre testable** — simple, concrète, faisable en 30 jours
5. **Un mot pour toi** — encouragement personnalisé basé sur ce que tu as partagé

Sois direct, chaleureux, sans blabla. Langue : français.`

export async function POST(request: NextRequest) {
  try {
    const { messages, phase, isSynthesis, allHistory } = await request.json()

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
    }

    let systemPrompt: string
    let messagesToSend: { role: string; content: string }[]

    if (isSynthesis) {
      systemPrompt = SYNTHESIS_PROMPT
      messagesToSend = allHistory
    } else {
      systemPrompt = PHASES[phase]?.systemPrompt || PHASES[0].systemPrompt
      messagesToSend = messages
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messagesToSend
        ]
      })
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    return NextResponse.json({ content: data.choices[0].message.content })

  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
