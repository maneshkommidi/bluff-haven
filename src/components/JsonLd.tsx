import { reviews } from '@/lib/reviews'

export default function JsonLd() {
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LodgingBusiness',
        name: 'Bluff Haven Retreat',
        description: 'Luxury 2-bedroom cabin in Sevierville, TN with private hot tub, stone fireplace, mountain views and panoramic Smoky Mountain scenery.',
        url: 'https://bluff-haven.vercel.app',
        image: 'https://bluff-haven.vercel.app/og-image.jpg',
        telephone: '',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2439 Bruke Ave',
          addressLocality: 'Sevierville',
          addressRegion: 'TN',
          postalCode: '37876',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 35.7979416,
          longitude: -83.6243573,
        },
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Private Hot Tub',    value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Stone Fireplace',    value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Mountain Views',     value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Full Kitchen',       value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Free WiFi',          value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Free Parking',       value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Arcade Games',       value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Fire Pit',           value: true },
        ],
        numberOfRooms: 2,
        occupancy: { '@type': 'QuantitativeValue', maxValue: 6 },
        checkinTime: '16:00',
        checkoutTime: '10:00',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating,
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        },
        review: reviews.slice(0, 10).map(r => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.guestName },
          datePublished: r.date,
          reviewBody: r.text,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
