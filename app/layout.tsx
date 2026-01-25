import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Snappy - Capture. Extract. Build.',
  description: 'Capture any webpage, extract its structure, get production-ready code specs.',
  openGraph: {
    title: 'Snappy - Capture. Extract. Build.',
    description: 'Capture any webpage, extract its structure, get production-ready code specs.',
    type: 'website',
  },
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
