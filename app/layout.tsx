import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Snappy - Capture. Extract. Build.',
  description: 'Capture any webpage, extract its structure, get production-ready code specs. Automatic full-site crawling.',
  keywords: ['web scraper', 'code generator', 'ai', 'crawler', 'component extraction'],
  authors: [{ name: 'Snappy' }],
  openGraph: {
    title: 'Snappy - Capture. Extract. Build.',
    description: 'Capture any webpage, extract its structure, get production-ready code specs.',
    type: 'website',
    siteName: 'Snappy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snappy - Capture. Extract. Build.',
    description: 'Capture any webpage, extract its structure, get production-ready code specs.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
