'use client'

import { useState } from 'react'
import Link from 'next/link'

const categories = [
  {
    label: 'Booking & Check-In',
    icon: '🗝️',
    faqs: [
      {
        q: 'What time is check-in and check-out?',
        a: 'Check-in is after 4:00 PM and check-out is before 10:00 AM. The cabin has a self check-in — you\'ll receive driving directions and your entry access code by email after booking. Please save or print these before you leave home as cell service can be limited in the area.',
      },
      {
        q: 'When will I receive my check-in info and door code?',
        a: 'You\'ll receive your full check-in instructions including the door code, driving directions, and cabin guide 7 days before your arrival date. If you have any questions before then, just reach out via the Contact page.',
      },
      {
        q: 'How do I book direct?',
        a: 'Simply click "Book Direct" anywhere on the site, select your dates, and complete checkout. Booking direct saves you 12–15% compared to Airbnb or VRBO since there are no platform service fees.',
      },
      {
        q: 'How do I purchase travel insurance?',
        a: 'When booking direct you will have the option to add travel insurance. We strongly encourage you to review the options available — travel insurance is especially important for mountain destinations where weather can occasionally impact travel.',
      },
    ],
  },
  {
    label: 'Cancellation & Payments',
    icon: '💳',
    faqs: [
      {
        q: 'What is your cancellation policy?',
        a: '100% refund if cancelled more than 14 days before arrival. 50% refund if cancelled more than 7 days before arrival. No refund for cancellations within 7 days of arrival. We strongly recommend purchasing travel insurance to protect your trip.',
      },
      {
        q: 'When is payment due?',
        a: '100% of the total booking amount is due at the time of booking.',
      },
      {
        q: 'Is there a security deposit?',
        a: 'A damage protection pre-authorization of $300 is placed on your card 2 days before arrival and released 7 days after departure, provided there is no damage to the property.',
      },
    ],
  },
  {
    label: 'The Cabin & Amenities',
    icon: '🏡',
    faqs: [
      {
        q: 'What does the kitchen include?',
        a: 'The kitchen is fully stocked with everything you need — pots, pans, baking sheets, toaster, blender, rice maker, and full dishware. We also have a gourmet coffee bar with both a Keurig and a regular drip coffee maker, plus starter pods, grounds, and creamers.',
      },
      {
        q: 'What do you provide vs. what should I bring?',
        a: 'We provide: starter coffee pods and creamer, travel-size shampoo/conditioner/body wash, 2 rolls of toilet paper per bathroom, 1 roll of paper towels, dish soap and dishwasher pod, laundry detergent pod, trash bags, all linens and towels, and a s\'mores kit for the fire pit.\n\nYou should bring: groceries, charcoal for the grill, and your streaming service passwords for the Smart TVs. For longer stays, bring extra toilet paper, paper towels, and detergent.',
      },
      {
        q: 'Is there a grill?',
        a: 'Yes — there\'s a park-style charcoal grill on the property. Please bring your own charcoal and lighter fluid.',
      },
      {
        q: 'Is the hot tub cleaned between guests?',
        a: 'Absolutely. The hot tub is fully sanitized, drained, and refilled before every guest arrival. It\'s ready and waiting for you.',
      },
      {
        q: 'What entertainment is available?',
        a: 'The cabin has Smart TVs with YouTube TV and NFL Sunday Ticket, a multicade arcade machine with dozens of classic games, board games, and a full outdoor setup including the fire pit and pergola with hanging egg chairs.',
      },
      {
        q: 'Is there laundry?',
        a: 'Yes, the cabin has a washer and dryer available for guest use.',
      },
    ],
  },
  {
    label: 'Internet & Cell Service',
    icon: '📶',
    faqs: [
      {
        q: 'What internet service is provided?',
        a: 'We provide unlimited high-speed WiFi (800 Mbps+). Internet is provided at no extra charge. Please note that Bluff Haven Retreat is not responsible for outages or compatibility with guest devices.',
      },
      {
        q: 'Is there cell phone service at the cabin?',
        a: 'Yes, but it can be limited depending on your carrier. AT&T, Verizon, and US Cellular work best in the Sevierville/Pigeon Forge area. Other carriers may be hit-or-miss. We recommend downloading offline maps and saving your check-in instructions before you arrive as a precaution.',
      },
    ],
  },
  {
    label: 'Pets & Smoking',
    icon: '🚭',
    faqs: [
      {
        q: 'Are pets allowed?',
        a: 'Unfortunately, pets are not allowed at Bluff Haven Retreat — including emotional support animals. A $500 fee will be charged if a pet is found on the property.',
      },
      {
        q: 'Is smoking allowed?',
        a: 'Smoking and vaping are strictly prohibited in all indoor and outdoor living areas of the property. If signs of smoking are found, an additional cleaning fee will be charged as determined by management.',
      },
    ],
  },
  {
    label: 'Property Rules & Policies',
    icon: '📋',
    faqs: [
      {
        q: 'What are the house rules?',
        a: 'Maximum occupancy is 6 guests. No parties or events. Quiet hours are 10:00 PM to 8:00 AM. No late check-out or early check-in without prior approval. Failure to vacate by 10:00 AM incurs a $50 fee for the first 30 minutes and $100 for each subsequent 30 minutes.',
      },
      {
        q: 'Are there security cameras?',
        a: 'Yes — the property has exterior security cameras at the front door and side of the cabin. They do not monitor any interior spaces or the hot tub. Cameras may be used to verify guest count and policy compliance. Do not tamper with or unplug the cameras.',
      },
      {
        q: 'What is your weather/natural disaster policy?',
        a: 'We are unable to issue refunds for inclement weather or early departures. However, if the National Weather Service issues advisories for road closures that prevent travel to the property, we will work with you to rebook your reservation. Travel insurance is strongly recommended.',
      },
      {
        q: 'What about wildlife?',
        a: 'The cabin is located in a forested mountain area — wildlife including deer, wild turkeys, and occasionally black bears may be spotted on or near the property. Do not feed or approach any wildlife. The property is professionally treated for interior pests on a regular schedule. No refunds are issued for wildlife or pest encounters.',
      },
      {
        q: 'What about utility outages?',
        a: 'Due to the rural mountain location, occasional utility outages can occur due to factors outside our control. Local service providers will work to restore services as quickly as possible. Refunds cannot be issued for temporary outages.',
      },
      {
        q: 'Is the access road difficult?',
        a: 'The road to the cabin is paved but has a steep incline for approximately 0.5 miles and narrows to one lane in sections. Motorcycles and trailers are not recommended. 4-wheel drive is recommended during adverse winter conditions. The cabin is not suitable for guests who prefer flat, easy road access.',
      },
    ],
  },
  {
    label: 'Location & Area',
    icon: '📍',
    faqs: [
      {
        q: 'How far is the cabin from major attractions?',
        a: 'Bluff Haven is perfectly positioned: 10 minutes to Pigeon Forge & Dollywood, 20 minutes to Gatlinburg, 25 minutes to Great Smoky Mountains National Park, 35 minutes to Cades Cove, and 45 minutes to Clingman\'s Dome.',
      },
      {
        q: 'Where is the nearest grocery store?',
        a: 'Walmart Supercenter on Parkway in Sevierville is about 4 minutes away. Kroger in Pigeon Forge is about 8 minutes, and Publix is about 10 minutes.',
      },
      {
        q: 'Where can I find more area information?',
        a: 'Check out our Things To Do guide for our personal recommendations on restaurants, attractions, wineries, and shopping. For official tourism info, visit visitmysmokies.com, mypigeonforge.com, or gatlinburg.com.',
      },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'rgba(139,111,71,0.12)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors hover:opacity-80"
      >
        <span className="text-sm font-medium pr-4" style={{ color: '#1a2e1a' }}>{q}</span>
        <svg
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{ color: '#c9a84c', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      {open && (
        <div className="pb-5 pr-8">
          {a.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm font-light leading-relaxed ${i > 0 ? 'mt-3' : ''}`}
              style={{ color: '#6b5a3e' }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = activeCategory
    ? categories.filter(c => c.label === activeCategory)
    : categories

  return (
    <div style={{ background: '#faf7f2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1a2e1a' }} className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm font-light mb-8 transition-colors"
            style={{ color: 'rgba(201,168,76,0.7)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Bluff Haven
          </Link>
          <div className="h-px w-12 mb-6" style={{ background: '#c9a84c' }} />
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-light text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Everything you need to know before your stay.
          </p>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs font-medium px-4 py-2 rounded-sm transition-all duration-200"
              style={{
                background: !activeCategory ? '#c9a84c' : 'rgba(201,168,76,0.12)',
                color: !activeCategory ? '#1a2e1a' : '#c9a84c',
                border: '1px solid rgba(201,168,76,0.25)',
              }}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                className="text-xs font-medium px-4 py-2 rounded-sm transition-all duration-200"
                style={{
                  background: activeCategory === cat.label ? '#c9a84c' : 'rgba(201,168,76,0.12)',
                  color: activeCategory === cat.label ? '#1a2e1a' : '#c9a84c',
                  border: '1px solid rgba(201,168,76,0.25)',
                }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ sections */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {filtered.map(cat => (
          <section key={cat.label}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="font-display text-2xl font-semibold" style={{ color: '#1a2e1a' }}>
                {cat.label}
              </h2>
            </div>
            <div className="bg-white rounded-sm border px-6" style={{ borderColor: 'rgba(139,111,71,0.15)' }}>
              {cat.faqs.map(faq => (
                <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </section>
        ))}

        {/* Still have questions CTA */}
        <div className="rounded-sm border p-8 text-center" style={{ background: '#fff', borderColor: 'rgba(139,111,71,0.15)' }}>
          <p className="font-display text-xl font-semibold mb-2" style={{ color: '#1a2e1a' }}>
            Still have a question?
          </p>
          <p className="text-sm font-light mb-6" style={{ color: '#6b5a3e' }}>
            We usually respond within a few hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact"
              className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-sm text-sm uppercase tracking-widest transition-all duration-300"
              style={{ background: '#1a2e1a', color: '#c9a84c' }}>
              Contact Us
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
            <Link href="/book"
              className="inline-flex items-center gap-2 font-medium px-6 py-3 rounded-sm text-sm uppercase tracking-widest border transition-all duration-300 hover:bg-[#1a2e1a] hover:text-[#c9a84c] hover:border-[#1a2e1a]"
              style={{ borderColor: 'rgba(26,46,26,0.2)', color: '#1a2e1a' }}>
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
