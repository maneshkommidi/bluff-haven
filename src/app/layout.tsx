import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin | Direct Booking',
  description: 'Private luxury cabin in Sevierville, TN. Hot tub, mountain views, stone fireplace & fire pit. Book direct — save 12–15% vs Airbnb & VRBO. Sleeps 6.',
  keywords: 'Smoky Mountain cabin rental, Sevierville TN vacation rental, Gatlinburg cabin, hot tub cabin, luxury cabin Tennessee, direct booking',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin',
    description: 'Private luxury cabin in Sevierville, TN. Hot tub, mountain views, fire pit. Book direct & save.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin',
    description: 'Private luxury cabin in Sevierville, TN. Hot tub, mountain views, fire pit. Book direct & save.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
