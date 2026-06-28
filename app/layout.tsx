import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sentinel — Cybercrime Investigation Intelligence',
  description:
    'Sentinel transforms scattered evidence into structured intelligence. Manage cases, evidence, entities, timelines, and build investigation theories.',
  generator: 'Sentinel',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#15171c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
