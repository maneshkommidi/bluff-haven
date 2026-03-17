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
        <nav className="hidden lg:flex items-center gap-6">
          <a href="/#amenities" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            Amenities
          </a>
          <a href="/#about" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            About
          </a>
          <a href="/#location" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            Location
          </a>
          <a href="/gallery" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            Gallery
          </a>
          <a href="/#reviews" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            Reviews
          </a>
          <a href="/contact" className="text-white/70 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light whitespace-nowrap">
            Contact
          </a>
          <div className="flex items-center gap-1 border border-white/10 rounded-sm px-3 py-1.5">
            <a href="https://www.airbnb.com/h/bluff-haven-retreat" target="_blank" rel="noopener noreferrer"
              className="text-white/50 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light px-2">
              Airbnb
            </a>
            <span className="text-white/20 text-xs">|</span>
            <a href="https://www.vrbo.com/4657328?dateless=true" target="_blank" rel="noopener noreferrer"
              className="text-white/50 text-xs tracking-wide hover:text-[#c9a84c] transition-colors font-light px-2">
              VRBO
            </a>
          </div>
          <Link
            href="/book"
            className="relative overflow-hidden border border-[#c9a84c] text-[#c9a84c] text-sm font-medium px-5 py-2.5 rounded-sm hover:bg-[#c9a84c] hover:text-[#1a2e1a] transition-all duration-300 tracking-wider uppercase"
          >
            Book Direct
          </Link>
        </nav>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-3">
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
        <div className="lg:hidden bg-[#1a2e1a]/98 border-t border-[#c9a84c]/20 px-6 py-5 space-y-4">
          {[['/#amenities','Amenities'],['/#about','About'],['/#location','Location'],['/gallery','Gallery'],['/#reviews','Reviews'],['/contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block text-white/70 text-sm tracking-widest uppercase hover:text-[#c9a84c] transition-colors py-1">
              {label}
            </a>
          ))}
          <div className="border-t border-[#c9a84c]/10 pt-4 flex items-center gap-6">
            <span className="text-white/25 text-xs uppercase tracking-widest">Also on</span>
            <a href="https://www.airbnb.com/h/bluff-haven-retreat" target="_blank" rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="text-white/50 text-sm tracking-widest uppercase hover:text-[#c9a84c] transition-colors">
              Airbnb
            </a>
            <a href="https://www.vrbo.com/4657328?dateless=true" target="_blank" rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="text-white/50 text-sm tracking-widest uppercase hover:text-[#c9a84c] transition-colors">
              VRBO
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
