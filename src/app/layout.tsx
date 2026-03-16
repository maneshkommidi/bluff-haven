import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin | Direct Booking',
  description: 'Private luxury cabin in Sevierville, TN. Hot tub, mountain views, stone fireplace & fire pit. Book direct — save 12–15% vs Airbnb & VRBO. Sleeps 6.',
  keywords: 'Smoky Mountain cabin rental, Sevierville TN vacation rental, Gatlinburg cabin, hot tub cabin, luxury cabin Tennessee, direct booking',
  openGraph: {
    title: 'Bluff Haven Retreat — Luxury Smoky Mountain Cabin',
    description: 'Private luxury cabin in Sevierville, TN. Hot tub, mountain views, fire pit. Book direct & save.',
    type:   'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
