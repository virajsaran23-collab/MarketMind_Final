import type { Metadata, Viewport } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { LanguageProvider } from '@/lib/language-context'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MarketMind — Learn the Stock Market by Playing It',
  description:
    'Invest virtual money, react to real-world events, and understand how markets move. An interactive stock market simulation and learning platform.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} bg-background text-foreground`}
    >
      <body className="font-sans antialiased bg-background text-foreground selection:bg-cyan-100 selection:text-cyan-900">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}


