# Ikigaï IA — Trouve ta niche en 4 étapes

Un coach conversationnel basé sur l'Ikigaï, propulsé par Mistral AI.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Mistral AI (mistral-small-latest)

## Déploiement sur Vercel

1. Fork ou clone ce repo sur ton GitHub
2. Va sur [vercel.com](https://vercel.com) et connecte ton compte GitHub
3. Importe le repo `ikigai-ia`
4. Dans les settings Vercel → **Environment Variables**, ajoute :
   - `MISTRAL_API_KEY` = ta clé API Mistral
5. Clique sur **Deploy**

## Développement local

```bash
npm install
cp .env.example .env.local
# Remplis MISTRAL_API_KEY dans .env.local
npm run dev
```

## Personnalisation

- Les prompts des 4 phases sont dans `src/app/api/chat/route.ts`
- Le design est dans `src/app/page.tsx`
- La couleur principale est `purple-600` — modifiable dans Tailwind
