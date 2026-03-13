import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-stone-800 hover:text-stone-600 transition-colors">
          Bluff Haven Retreat
        </Link>
        <nav className="flex items-center gap-6">
          <a href="/#amenities" className="text-stone-500 text-sm hover:text-stone-800 transition-colors hidden sm:block">
            Amenities
          </a>
          <a href="/#about" className="text-stone-500 text-sm hover:text-stone-800 transition-colors hidden sm:block">
            About
          </a>
          <Link
            href="/book"
            className="bg-stone-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
          >
            Book now
          </Link>
        </nav>
      </div>
    </header>
  )
}
