import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Ikigaï IA — Trouve ta niche en 4 étapes',
  description: 'Un coach IA qui t\'aide à trouver ta niche en explorant les 4 cercles de l\'Ikigaï. Idéal pour les multipotentiels et entrepreneurs en reconversion.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
