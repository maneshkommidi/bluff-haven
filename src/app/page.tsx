import Link from 'next/link'
import Image from 'next/image'
import { getFullPropertyDetails } from '@/lib/ownerrez'

export default async function HomePage() {
  let property: any = null
  try { property = await getFullPropertyDetails() } catch {}

  const photoUrl = property?.photos?.[0]?.url ?? null

  const amenities = [
    { svg: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', label: '2 Bedrooms' },
    { svg: '<path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/><path d="M10 12v5h4v-5"/>', label: '1.5 Bathrooms' },
    { svg: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>', label: 'Sleeps 6' },
    { svg: '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>', label: 'Mountain Views' },
    { svg: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>', label: 'Private Hot Tub' },
    { svg: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>', label: 'Stone Fireplace' },
    { svg: '<path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9"/><path d="M12 3v6"/>', label: 'Full Kitchen' },
    { svg: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>', label: 'Arcade Games' },
  ]

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center" style={{ background: '#1a2e1a' }}>
        {/* Background image */}
        {photoUrl && (
          <Image src={photoUrl} alt="Bluff Haven Retreat" fill className="object-cover opacity-40" priority />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,46,26,0.95) 0%, rgba(26,46,26,0.6) 50%, rgba(26,46,26,0.85) 100%)' }} />
        {/* Decorative corner lines */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 opacity-30" style={{ borderColor: '#c9a84c' }} />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 opacity-30" style={{ borderColor: '#c9a84c' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 w-full">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-8 fade-up-1">
              <div className="h-px w-12" style={{ background: '#c9a84c' }} />
              <span className="text-xs uppercase tracking-[0.35em] font-light" style={{ color: '#c9a84c' }}>
                Sevierville, Tennessee
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-white mb-6 fade-up-2"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, fontWeight: 600 }}>
              Where the{' '}
              <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Mountains</em>
              <br/>Meet Your{' '}
              <span style={{ color: '#e8c87a' }}>Retreat</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg mb-10 max-w-xl leading-relaxed fade-up-3"
              style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
              Luxury 2-bed, 1.5-bath cabin with private hot tub, stone fireplace & panoramic Smoky Mountain views.
              10 min from Pigeon Forge &amp; Dollywood.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 fade-up-4">
              <Link href="/book"
                className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-widest hover:opacity-90"
                style={{ background: '#c9a84c', color: '#1a2e1a' }}
              >
                Book Direct &amp; Save
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <a href="#about"
                className="inline-flex items-center gap-2 font-light px-8 py-4 rounded-sm border text-sm uppercase tracking-widest transition-all duration-300"
                style={{ borderColor: 'rgba(201,168,76,0.4)', color: 'rgba(255,255,255,0.7)' }}
              >
                Explore the Cabin
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-14 pt-10 border-t fade-up-4"
              style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
              {[
                { n: '2', label: 'Bedrooms' },
                { n: '6', label: 'Guests Max' },
                { n: '0%', label: 'Service Fees' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-display text-3xl font-semibold" style={{ color: '#c9a84c' }}>{s.n}</div>
                  <div className="text-xs uppercase tracking-widest mt-1 font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs uppercase tracking-widest" style={{ color: '#c9a84c', fontSize: '9px' }}>Scroll</span>
          <div className="w-px h-10 animate-pulse" style={{ background: 'linear-gradient(to bottom, #c9a84c, transparent)' }} />
        </div>
      </section>

      {/* ── AMENITIES STRIP ───────────────────────────────────────────── */}
      <section style={{ background: '#2d4a2d' }}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              '🛁 Private Hot Tub',
              '🔥 Stone Fireplace',
              '🌄 Mountain Views',
              '🍳 Full Kitchen',
              '📶 High-Speed WiFi',
              '🕹️ Arcade Games',
              '🔥 Fire Pit',
              '🚗 Free Parking',
            ].map(item => (
              <span key={item} className="text-sm font-light tracking-wide" style={{ color: 'rgba(232,200,122,0.85)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
      <section id="amenities" className="scroll-mt-20" style={{ background: '#faf7f2' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="gold-divider mx-auto mb-6 block" />
            <h2 className="font-display text-4xl font-semibold mb-4" style={{ color: '#1a2e1a' }}>
              Crafted for Comfort
            </h2>
            <p className="text-base max-w-lg mx-auto font-light" style={{ color: '#6b5a3e' }}>
              Every detail curated so you can simply arrive and unwind.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {amenities.map((a, i) => (
              <div key={a.label}
                className="group p-6 rounded-sm border transition-all duration-300 hover:shadow-lg"
                style={{
                  background: i % 3 === 0 ? '#1a2e1a' : '#fff',
                  borderColor: i % 3 === 0 ? 'transparent' : 'rgba(139,111,71,0.15)',
                }}>
                <svg className="w-6 h-6 mb-4 transition-colors duration-300"
                  style={{ color: i % 3 === 0 ? '#c9a84c' : '#4a6741' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  dangerouslySetInnerHTML={{ __html: a.svg }} />
                <span className="text-sm font-medium block"
                  style={{ color: i % 3 === 0 ? '#e8c87a' : '#1a2e1a' }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / STORY ─────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-20" style={{ background: '#1a2e1a' }}>
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="gold-divider mb-8 block" />
            <h2 className="font-display text-4xl font-semibold text-white mb-6" style={{ lineHeight: 1.2 }}>
              Your Private Retreat<br/>
              <em style={{ color: '#c9a84c' }}>Awaits</em>
            </h2>
            <div className="space-y-4 font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              <p>Wake up to golden sunrises, soak under the stars in your private hot tub, and watch eagles soar from your deck. Perfectly perched in the Smokies — where every moment becomes a treasured memory.</p>
              <p>Just 10 minutes from Pigeon Forge &amp; Dollywood, 20 minutes from Gatlinburg, and 25 minutes from Great Smoky Mountains National Park.</p>
              <p>Floor-to-ceiling windows, romantic stone fireplace, gourmet coffee bar, Smart TV, arcade games, fire pit, pergola with hanging egg chairs, and a sweeping multi-level deck.</p>
            </div>
            <Link href="/book"
              className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-widest font-medium transition-colors"
              style={{ color: '#c9a84c' }}>
              Reserve Your Stay
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>

          {/* Image with decorative frame */}
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-full h-full border rounded-sm opacity-20" style={{ borderColor: '#c9a84c' }} />
            <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: '4/5', background: '#2d4a2d' }}>
              {photoUrl ? (
                <Image src={photoUrl} alt="Bluff Haven Retreat" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 opacity-20" style={{ color: '#c9a84c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              )}
              {/* Gold badge overlay */}
              <div className="absolute bottom-6 left-6 px-4 py-2 rounded-sm" style={{ background: 'rgba(26,46,26,0.9)', border: '1px solid rgba(201,168,76,0.4)' }}>
                <span className="text-xs uppercase tracking-widest font-light" style={{ color: '#c9a84c' }}>Check-in 4 PM · Check-out 10 AM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCATION ──────────────────────────────────────────────────── */}
      <section id="location" className="scroll-mt-20" style={{ background: '#faf7f2' }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <span className="gold-divider mx-auto mb-6 block" />
            <h2 className="font-display text-4xl font-semibold mb-3" style={{ color: '#1a2e1a' }}>
              Perfectly Positioned
            </h2>
            <p className="font-light" style={{ color: '#6b5a3e' }}>Adventure nearby. Solitude at home.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { distance: '10 min', label: 'Pigeon Forge & Dollywood', icon: '🎡' },
              { distance: '20 min', label: 'Gatlinburg & Attractions',  icon: '🏔️' },
              { distance: '25 min', label: 'Great Smoky Mountains NP',  icon: '🌲' },
            ].map(loc => (
              <div key={loc.label} className="text-center p-8 rounded-sm border"
                style={{ borderColor: 'rgba(139,111,71,0.2)', background: '#fff' }}>
                <div className="text-4xl mb-4">{loc.icon}</div>
                <div className="font-display text-3xl font-semibold mb-1" style={{ color: '#4a6741' }}>
                  {loc.distance}
                </div>
                <div className="text-sm font-light" style={{ color: '#6b5a3e' }}>{loc.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BOOK DIRECT ───────────────────────────────────────────── */}
      <section style={{ background: '#2d4a2d' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="gold-divider mx-auto mb-6 block" />
            <h2 className="font-display text-3xl font-semibold text-white mb-2">
              Skip the Middleman
            </h2>
            <p className="font-light text-sm" style={{ color: 'rgba(232,200,122,0.7)' }}>
              Book directly. Keep the difference.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: 'Save 12–15%', body: 'No Airbnb or VRBO service fees. The full amount goes to your stay.' },
              { icon: '💬', title: 'Talk to Us Directly', body: 'Real communication with your host — not through a platform filter.' },
              { icon: '🔑', title: 'More Flexibility', body: 'Early check-in, late check-out, special requests — easier done direct.' },
            ].map(item => (
              <div key={item.title} className="p-7 rounded-sm border" style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'rgba(26,46,26,0.5)' }}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ────────────────────────────────────────────────── */}
      <section style={{ background: '#1a2e1a', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: '#c9a84c', filter: 'blur(80px)' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-28 text-center">
          <span className="gold-divider mx-auto mb-8 block" />
          <h2 className="font-display text-5xl font-semibold text-white mb-5" style={{ lineHeight: 1.1 }}>
            Ready to Escape<br/>
            <em style={{ color: '#c9a84c' }}>to the Mountains?</em>
          </h2>
          <p className="font-light mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Real-time availability. Instant confirmation. No service fees.
          </p>
          <Link href="/book"
            className="inline-flex items-center gap-3 font-medium px-10 py-5 rounded-sm text-sm uppercase tracking-widest transition-all duration-300"
            style={{ background: '#c9a84c', color: '#1a2e1a' }}>
            Check Availability
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
          <p className="mt-6 text-xs uppercase tracking-widest font-light" style={{ color: 'rgba(201,168,76,0.5)' }}>
            Best rate guaranteed · Direct booking
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ background: '#111d11', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <path d="M18 4L32 28H4L18 4Z" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="18" cy="4" r="1.5" fill="#c9a84c"/>
            </svg>
            <span className="font-display text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Bluff Haven Retreat
            </span>
          </div>
          <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sevierville, Tennessee · Direct Booking
          </p>
        </div>
      </footer>
    </div>
  )
}
