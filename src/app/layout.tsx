import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bluff Haven Retreat — Vacation Rental',
  description: 'A private retreat with stunning bluff views. Book your stay directly and save.',
  openGraph: {
    title: 'Bluff Haven Retreat',
    description: 'A private retreat with stunning bluff views.',
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
        <Header />
        <main className="min-h-screen bg-stone-50">
          {children}
        </main>
      </body>
    </html>
  )
}
