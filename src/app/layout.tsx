import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bluff Haven Retreat — Smoky Mountain Cabin | Direct Booking',
  description: 'Luxury 2-bed cabin in Sevierville, TN with private hot tub, mountain views & fire pit. Book directly and save 12-15% vs Airbnb & VRBO.',
  keywords: 'Smoky Mountain cabin rental, Sevierville TN vacation rental, Gatlinburg cabin, direct booking, hot tub cabin Tennessee',
  openGraph: {
    title: 'Bluff Haven Retreat — Smoky Mountain Cabin',
    description: 'Luxury 2-bed cabin in Sevierville, TN. Private hot tub, mountain views, fire pit. Book direct & save.',
    type:  'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
