'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-[#1a2e1a]/95 backdrop-blur-md shadow-lg shadow-black/20'
        : 'bg-[#1a2e1a]/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* SVG Logo Mark */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mountain shape */}
            <path d="M18 4L32 28H4L18 4Z" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Inner mountain */}
            <path d="M18 10L26 24H10L18 10Z" fill="#c9a84c" opacity="0.15"/>
            {/* Trees suggestion */}
            <path d="M6 28L6 32M30 28L30 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Star/sun */}
            <circle cx="18" cy="4" r="1.5" fill="#c9a84c"/>
          </svg>
          <div>
            <span className="font-display text-lg font-semibold text-white tracking-wide group-hover:text-[#c9a84c] transition-colors">
              Bluff Haven
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-[#c9a84c] font-light -mt-0.5">
              Retreat
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          <a href="/#amenities" className="text-white/70 text-sm tracking-wide hover:text-[#c9a84c] transition-colors font-light">
            Amenities
          </a>
          <a href="/#about" className="text-white/70 text-sm tracking-wide hover:text-[#c9a84c] transition-colors font-light">
            About
          </a>
          <a href="/#location" className="text-white/70 text-sm tracking-wide hover:text-[#c9a84c] transition-colors font-light">
            Location
          </a>
          <Link
            href="/book"
            className="relative overflow-hidden border border-[#c9a84c] text-[#c9a84c] text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-[#c9a84c] hover:text-[#1a2e1a] transition-all duration-300 tracking-wider uppercase"
          >
            Book Direct
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-3">
          <Link href="/book" className="border border-[#c9a84c] text-[#c9a84c] text-xs font-medium px-3 py-1.5 rounded-sm tracking-wider uppercase">
            Book
          </Link>
          <button onClick={() => setMobileOpen(o => !o)} className="text-white/80 p-1" aria-label="Menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-[#1a2e1a]/98 border-t border-[#c9a84c]/20 px-6 py-5 space-y-4">
          {[['/#amenities','Amenities'],['/#about','About'],['/#location','Location']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block text-white/70 text-sm tracking-widest uppercase hover:text-[#c9a84c] transition-colors py-1">
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}
