import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Header } from '@/components/layout/Header'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DSA Mastery',
  description: 'A comprehensive DSA and system design reference for senior engineers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <TooltipProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  )
}
