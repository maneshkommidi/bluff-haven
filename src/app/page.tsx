import Link from 'next/link'
import Image from 'next/image'
import { getFullPropertyDetails } from '@/lib/ownerrez'

// Build amenity cards from the structured property fields OwnerRez actually returns
function buildAmenities(property: any) {
  const items: { icon: string; label: string }[] = []

  if (property?.bedrooms)
    items.push({ icon: '🛏️', label: `${property.bedrooms} Bedroom${property.bedrooms !== 1 ? 's' : ''}` })

  const fullBaths = (property as any)?.bathrooms ?? 0
  const halfBaths = (property as any)?.bathrooms_half ?? 0
  const baths = fullBaths + halfBaths * 0.5 || property?.bathrooms
  if (baths)
    items.push({ icon: '🚿', label: `${baths} Bathroom${baths !== 1 ? 's' : ''}` })

  if (property?.max_guests)
    items.push({ icon: '👥', label: `Up to ${property.max_guests} Guests` })

  if (property?.living_area)
    items.push({ icon: '📐', label: `${property.living_area.toLocaleString()} ${property.living_area_type ?? 'sq. ft.'}` })

  if (property?.max_pets > 0 || property?.pets_allowed)
    items.push({ icon: '🐾', label: 'Pet Friendly' })

  if (property?.check_in)
    items.push({ icon: '🔑', label: `Check-in ${property.check_in}` })

  if (property?.check_out)
    items.push({ icon: '🕙', label: `Checkout ${property.check_out}` })

  // Fill remaining slots with property-type relevant defaults
  const existing = items.map(i => i.label.toLowerCase())
  const extras = [
    { icon: '🌅', label: 'Scenic Views' },
    { icon: '🔥', label: 'Fire Pit' },
    { icon: '🍳', label: 'Full Kitchen' },
    { icon: '📶', label: 'Fast WiFi' },
    { icon: '🚗', label: 'Free Parking' },
    { icon: '🌿', label: 'Private Yard' },
  ]
  for (const extra of extras) {
    if (items.length >= 8) break
    if (!existing.some(e => e.includes(extra.label.toLowerCase().split(' ')[0])))
      items.push(extra)
  }

  return items.slice(0, 8)
}

export default async function HomePage() {
  let property: any = null
  try {
    property = await getFullPropertyDetails()
  } catch (err) {
    console.error('Failed to load property details:', err)
  }

  const raw       = property as any
  const title     = raw?.name ?? 'Bluff Haven Retreat'
  const city      = raw?.address?.city ?? ''
  const state     = raw?.address?.state ?? ''
  const location  = [city, state].filter(Boolean).join(', ')
  const headline  = raw?.headline ?? raw?.summary ?? 'A private escape perched above the bluffs. Stunning views, total seclusion, and every comfort of home.'
  const description = raw?.description ?? raw?.notes ?? 'Bluff Haven Retreat is a thoughtfully designed vacation home offering sweeping views, peaceful surroundings, and the comforts of a well-appointed home.\n\nWhether you\'re here to unwind, celebrate, or reconnect with nature — this is your place.'

  const heroPhoto = raw?.photos?.[0] ?? null
  const amenities = buildAmenities(raw)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative h-[80vh] bg-stone-800 flex items-end">
        {heroPhoto && (
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.caption ?? title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-700/30 to-stone-900/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-16 text-white">
          {location && (
            <p className="text-sm uppercase tracking-widest text-stone-300 mb-2">{location}</p>
          )}
          <p className="text-sm uppercase tracking-widest text-stone-400 mb-3">Direct booking — best rate guaranteed</p>
          <h1 className="text-5xl font-bold mb-4 leading-tight">{title}</h1>
          <p className="text-xl text-stone-200 mb-8 max-w-xl">{headline}</p>
          <Link
            href="/book"
            className="inline-block bg-white text-stone-900 font-semibold px-8 py-4 rounded-xl hover:bg-stone-100 transition-colors text-lg"
          >
            Check availability →
          </Link>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="max-w-4xl mx-auto px-6 py-16 scroll-mt-20">
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
      <section id="about" className="bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-4">Your private retreat awaits</h2>
            {description.split('\n').filter(Boolean).slice(0, 3).map((para: string, i: number) => (
              <p key={i} className="text-stone-600 leading-relaxed mb-4">{para}</p>
            ))}
            <Link
              href="/book"
              className="inline-block bg-stone-800 text-white font-medium px-6 py-3 rounded-lg hover:bg-stone-700 transition-colors"
            >
              Book directly & save
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-square relative bg-stone-100">
            {heroPhoto ? (
              <Image
                src={heroPhoto.url}
                alt={heroPhoto.caption ?? title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
                Property photo
              </div>
            )}
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
