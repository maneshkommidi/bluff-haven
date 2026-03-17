import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Things To Do — Bluff Haven Retreat | Smoky Mountains Guide',
  description: 'Local guide to the best restaurants, attractions, shopping, wineries and groceries near Bluff Haven Retreat in Sevierville, TN.',
}

const categories = [
  {
    id: 'attractions',
    label: 'Attractions',
    icon: '🎡',
    items: [
      { name: 'Dollywood', distance: '10 min', desc: 'Award-winning theme park voted friendliest in the industry. Famous cinnamon bread at the Gristmill — don\'t miss it.', url: 'https://www.dollywood.com' },
      { name: 'The Island in Pigeon Forge', distance: '10 min', desc: 'Amusement park, shopping and eateries all in one. Great for an evening out with the family.', url: 'https://islandinpigeonforge.com' },
      { name: 'Anakeesta', distance: '20 min', desc: 'Unique outdoor adventure experience in the heart of Gatlinburg — zip lines, tree canopy walks and stunning mountain views.', url: 'https://anakeesta.com' },
      { name: 'Gatlinburg SkyBridge', distance: '20 min', desc: 'Longest pedestrian suspension bridge in North America with glass panel flooring. Not for the faint-hearted!', url: 'https://www.gatlinburgskylift.com/skybridge' },
      { name: 'Ripley\'s Aquarium of the Smokies', distance: '20 min', desc: 'Over 10,000 exotic sea creatures across 10 themed galleries. Huge hit with families.', url: 'https://www.ripleyaquariums.com/gatlinburg' },
      { name: 'Smoky Mountain Alpine Coaster', distance: '5 min', desc: 'Thrilling mountain coaster ride — one of the most popular attractions in the Smokies.', url: 'https://alpinecoaster.com' },
      { name: 'Smoky Mountain Ziplines', distance: '8 min', desc: 'Soar through the treetops with breathtaking Smoky Mountain views on this adrenaline-pumping zipline course.', url: 'https://www.smokymountainziplines.com' },
      { name: 'Dinner Shows', distance: '10 min', desc: 'A Smokies tradition. Top picks: Dolly Parton\'s Stampede, Hatfield & McCoy\'s, and Murder Mystery Dinner Show.', url: 'https://www.pigeonforge.com/things-to-do/dinner-shows' },
    ],
  },
  {
    id: 'national-park',
    label: 'National Park',
    icon: '🌲',
    items: [
      { name: 'Great Smoky Mountains National Park', distance: '25 min', desc: 'Most visited national park in the US. Endless hiking, wildlife, and scenery — free entry, no reservation needed.', url: 'https://www.nps.gov/grsm' },
      { name: 'Cades Cove', distance: '35 min', desc: 'Voted "must do" in the Smokies. Drive through the Cove at sunrise to spot deer, black bears and wild turkeys.', url: 'https://www.nps.gov/grsm/planyourvisit/cadescove.htm' },
      { name: 'Clingman\'s Dome', distance: '45 min', desc: 'At 6,643 ft, the highest point in the Smokies. A short half-mile hike to the summit observation tower for 360° views.', url: 'https://www.nps.gov/grsm/planyourvisit/clingmansdome.htm' },
      { name: 'Waterfalls', distance: '25 min', desc: 'Over 100 waterfalls in the park. Favorites: Laurel Falls, Grotto Falls, Rainbow Falls and Abrams Falls.', url: 'https://www.nps.gov/grsm/planyourvisit/waterfalls.htm' },
      { name: 'Wildflowers', distance: '25 min', desc: 'Home to over 1,500 wildflower species. Peak bloom in April — Azaleas and Rhododendrons are spectacular.', url: 'https://www.nps.gov/grsm/planyourvisit/wildflowers.htm' },
    ],
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: '🍽️',
    items: [
      { name: 'Paula Deen\'s Family Kitchen', distance: '10 min', desc: 'True Southern cuisine served family-style — fried chicken, meatloaf, and pot pie. A Pigeon Forge staple.', url: 'https://pauladeensfamilykitchen.com/location/paula-deens-family-kitchen-at-the-island-in-pigeon-forge' },
      { name: 'Local Goat', distance: '10 min', desc: 'A favorite with locals and tourists alike. Locally grown cuisine in a casual, welcoming atmosphere.', url: 'https://www.localgoatpf.com' },
      { name: 'The Old Mill', distance: '12 min', desc: '1830 Gristmill with country cooking eateries, potter, candy and toy shops. A Pigeon Forge landmark.', url: 'https://www.old-mill.com' },
      { name: 'Blue Moose Burgers & Wings', distance: '10 min', desc: 'Pigeon Forge\'s best-kept secret by locals — family sports grill with great burgers and wings.', url: 'https://bluemooseburgersandwings.com' },
      { name: 'The Peddler Steakhouse', distance: '20 min', desc: 'Beloved Gatlinburg steakhouse perched over a mountain stream. The salad bar alone is worth the trip.', url: 'https://peddlergatlinburg.com' },
      { name: 'The Appalachian', distance: '20 min', desc: 'Upscale mountain dining with locally sourced ingredients and stunning views of the Smokies.', url: 'http://theappalachianrestaurant.com' },
      { name: 'Gaucho Urbano', distance: '20 min', desc: 'Brazilian steakhouse experience in the heart of Gatlinburg — all-you-can-eat churrasco meats tableside.', url: 'http://www.gauchourbano.com' },
      { name: 'Apple Barn & Cider Mill', distance: '8 min', desc: 'Family-owned farm with fresh apple cider, homemade apple butter, and a classic country restaurant.', url: 'https://www.applebarncidermill.com' },
      { name: 'Smoky Mountain Brewery', distance: '20 min', desc: 'Craft brewery and restaurant in Gatlinburg serving handcrafted beers alongside hearty mountain food.', url: 'http://www.smoky-mtn-brewery.com' },
      { name: 'Boss Hogg\'s BBQ Shack', distance: '10 min', desc: 'Award-winning BBQ the way it should be — slow-smoked, saucy, and served in generous portions.', url: 'https://bestbbqintown.com' },
    ],
  },
  {
    id: 'wineries',
    label: 'Wineries & Moonshine',
    icon: '🍷',
    items: [
      { name: 'Ole Smoky Moonshine', distance: '20 min', desc: 'America\'s most visited distillery. Rustic copper-still moonshine tastings in the heart of Gatlinburg — a must-do.', url: 'https://olesmoky.com' },
      { name: 'Mountain Valley Winery', distance: '15 min', desc: 'One of Tennessee\'s oldest wineries featuring some of the most unique wines in the country.', url: 'https://mountainvalleywinery.com' },
      { name: 'Sugarland Cellars', distance: '20 min', desc: 'Boutique winery in Gatlinburg with wines that tell the history of the Smokies on every label.', url: 'https://sugarlandcellars.com' },
    ],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: '🛍️',
    items: [
      { name: 'Tanger Outlets Sevierville', distance: '5 min', desc: 'Open-air outlet mall with over 100 brand-name stores including Nike, Coach, Michael Kors and more.', url: 'https://www.tangeroutlets.com/sevierville' },
      { name: 'The Village Shoppes', distance: '20 min', desc: 'Nearly 30 shops in a European cobblestone setting in downtown Gatlinburg. Don\'t miss Fudge Kitchen.', url: 'https://www.thevillageshoppes.com' },
      { name: 'Gatlinburg Arts & Crafts Community', distance: '22 min', desc: 'Over 100 local artists and craftsmen — the largest collection of independent artisans in the US.', url: 'https://www.gatlinburgcrafts.com' },
      { name: 'Old Mill Square', distance: '12 min', desc: 'Historic district with pottery, candy making, and artisan shops alongside the working 1830 gristmill.', url: 'https://www.old-mill.com' },
    ],
  },
  {
    id: 'grocery',
    label: 'Grocery & Essentials',
    icon: '🛒',
    items: [
      { name: 'Walmart Supercenter', distance: '4 min', desc: '1414 Parkway, Sevierville · Open 7am–11pm. Closest full-service grocery to the cabin.', url: 'https://www.walmart.com/store/578-sevierville-tn' },
      { name: 'Kroger', distance: '8 min', desc: '220 Wears Valley Rd, Pigeon Forge · Full-service grocery with pharmacy and fuel station.', url: 'https://www.kroger.com/stores/details/026/00536' },
      { name: 'Publix', distance: '10 min', desc: '2656 Parkway, Pigeon Forge · Open 7am–10pm. Great deli and bakery for stocking up on arrival.', url: 'https://www.publix.com/locations/1515-valley-forge-shopping-center' },
      { name: 'Whaley\'s Country Store', distance: '15 min', desc: '1725 Waldens Creek Rd · Hidden family-owned gem with Amish goods, soaps, jellies, cheeses and hot coffee. Open 9am–7pm.', url: 'https://www.facebook.com/WhaleysCountryStore' },
    ],
  },
]

export default function ThingsToDoPage() {
  return (
    <div style={{ background: '#faf7f2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1a2e1a' }} className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
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
            Things To Do
          </h1>
          <p className="font-light text-lg max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Our personal guide to the best of Gatlinburg, Pigeon Forge & the Smoky Mountains — all within easy reach of Bluff Haven.
          </p>

          {/* Category quick links */}
          <div className="flex flex-wrap gap-3 mt-8">
            {categories.map(cat => (
              <a key={cat.id} href={`#${cat.id}`}
                className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-sm transition-all duration-200 hover:opacity-80"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}>
                <span>{cat.icon}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {categories.map((cat, ci) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-24">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-10">
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <div className="h-px w-8 mb-2" style={{ background: '#c9a84c' }} />
                <h2 className="font-display text-3xl font-semibold" style={{ color: '#1a2e1a' }}>
                  {cat.label}
                </h2>
              </div>
            </div>

            {/* Items grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cat.items.map((item, i) => (
                <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col rounded-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  style={{
                    background: ci % 2 === 0 && i === 0 ? '#1a2e1a' : '#fff',
                    borderColor: ci % 2 === 0 && i === 0 ? 'transparent' : 'rgba(139,111,71,0.15)',
                  }}>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    {/* Distance badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-sm"
                        style={{
                          background: ci % 2 === 0 && i === 0 ? 'rgba(201,168,76,0.15)' : 'rgba(74,103,65,0.08)',
                          color: ci % 2 === 0 && i === 0 ? '#c9a84c' : '#4a6741',
                        }}>
                        📍 {item.distance}
                      </span>
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: ci % 2 === 0 && i === 0 ? '#c9a84c' : '#4a6741' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </div>
                    {/* Name */}
                    <h3 className="font-display text-lg font-semibold leading-tight"
                      style={{ color: ci % 2 === 0 && i === 0 ? '#e8c87a' : '#1a2e1a' }}>
                      {item.name}
                    </h3>
                    {/* Description */}
                    <p className="text-sm font-light leading-relaxed flex-1"
                      style={{ color: ci % 2 === 0 && i === 0 ? 'rgba(255,255,255,0.6)' : '#6b5a3e' }}>
                      {item.desc}
                    </p>
                  </div>
                  {/* Footer link */}
                  <div className="px-6 py-3 border-t flex items-center gap-1 text-xs font-medium uppercase tracking-wider"
                    style={{
                      borderColor: ci % 2 === 0 && i === 0 ? 'rgba(201,168,76,0.15)' : 'rgba(139,111,71,0.1)',
                      color: ci % 2 === 0 && i === 0 ? '#c9a84c' : '#4a6741',
                    }}>
                    Visit website
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: '#1a2e1a' }}>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <span className="gold-divider mx-auto mb-8 block" />
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Ready to explore the Smokies?
          </h2>
          <p className="font-light mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Book Bluff Haven Retreat and use it as your base for all the adventures above.
          </p>
          <Link href="/book"
            className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-sm text-sm uppercase tracking-widest transition-all duration-300"
            style={{ background: '#c9a84c', color: '#1a2e1a' }}>
            Book Your Stay
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
