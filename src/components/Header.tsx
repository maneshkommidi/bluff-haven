'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="font-semibold text-stone-800 hover:text-stone-600 transition-colors">
          Bluff Haven Retreat
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <a href="/#amenities" className="text-stone-500 text-sm hover:text-stone-800 transition-colors">
            Amenities
          </a>
          <a href="/#about" className="text-stone-500 text-sm hover:text-stone-800 transition-colors">
            About
          </a>
          <Link
            href="/book"
            className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            Book now
          </Link>
        </nav>

        {/* Mobile: book button + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <Link
            href="/book"
            className="bg-stone-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
          >
            Book now
          </Link>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="text-stone-600 hover:text-stone-900 p-1"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-white px-6 py-4 space-y-3">
          <a
            href="/#amenities"
            onClick={() => setMobileOpen(false)}
            className="block text-stone-600 text-sm hover:text-stone-900 transition-colors py-1"
          >
            Amenities
          </a>
          <a
            href="/#about"
            onClick={() => setMobileOpen(false)}
            className="block text-stone-600 text-sm hover:text-stone-900 transition-colors py-1"
          >
            About
          </a>
        </div>
      )}
    </header>
  )
}
