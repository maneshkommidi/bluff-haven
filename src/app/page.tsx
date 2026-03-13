import Link from 'next/link'

const amenities = [
  { icon: '🛏️', label: '3 Bedrooms' },
  { icon: '🚿', label: '2 Bathrooms' },
  { icon: '🌅', label: 'Bluff Views' },
  { icon: '🔥', label: 'Fire Pit' },
  { icon: '🍳', label: 'Full Kitchen' },
  { icon: '📶', label: 'Fast WiFi' },
  { icon: '🚗', label: 'Free Parking' },
  { icon: '🐾', label: 'Pet Friendly' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative h-[85vh] bg-stone-800 flex items-end">
        {/* Replace with actual property photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-700/40 to-stone-900/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-16 text-white">
          <p className="text-sm uppercase tracking-widest text-stone-300 mb-3">Direct booking — best rate guaranteed</p>
          <h1 className="text-5xl font-bold mb-4 leading-tight">Bluff Haven Retreat</h1>
          <p className="text-xl text-stone-200 mb-8 max-w-xl">
            A private escape perched above the bluffs. Stunning views, total seclusion, and every comfort of home.
          </p>
          <Link
            href="/book"
            className="inline-block bg-white text-stone-900 font-semibold px-8 py-4 rounded-xl hover:bg-stone-100 transition-colors text-lg"
          >
            Check availability →
          </Link>
        </div>
      </section>

      {/* Amenities */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-stone-800 mb-8">What's included</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {amenities.map((a) => (
            <div key={a.label} className="bg-white rounded-xl p-4 border border-stone-100 flex items-center gap-3">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-stone-700 font-medium text-sm">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-4">Your private retreat awaits</h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              Bluff Haven Retreat is a thoughtfully designed vacation home offering sweeping views, 
              peaceful surroundings, and the comforts of a well-appointed home.
            </p>
            <p className="text-stone-600 leading-relaxed mb-6">
              Whether you're here to unwind, celebrate, or reconnect with nature — this is your place.
            </p>
            <Link
              href="/book"
              className="inline-block bg-stone-800 text-white font-medium px-6 py-3 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Book directly & save
            </Link>
          </div>
          <div className="bg-stone-100 rounded-2xl aspect-square flex items-center justify-center text-stone-400">
            {/* Replace with <Image> component and actual photo */}
            <span className="text-sm">Property photo</span>
          </div>
        </div>
      </section>

      {/* Why book direct */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-stone-800 mb-8 text-center">Why book directly?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'No service fees', body: 'Skip the 12–15% platform fees charged by Airbnb and VRBO.' },
            { title: 'Direct communication', body: 'Talk to us directly — no messaging through a platform.' },
            { title: 'Flexible policies', body: 'More flexibility on check-in times and special requests.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="font-semibold text-stone-800 mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-stone-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to book your stay?</h2>
          <p className="text-stone-300 mb-8">Check real-time availability and reserve instantly.</p>
          <Link
            href="/book"
            className="inline-block bg-white text-stone-900 font-semibold px-8 py-4 rounded-xl hover:bg-stone-100 transition-colors"
          >
            Check availability →
          </Link>
        </div>
      </section>
    </div>
  )
}
