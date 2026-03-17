import Link from 'next/link'
import { reviews } from '@/lib/reviews'

export const metadata = {
  title: 'Guest Reviews — Bluff Haven Retreat',
  description: `Read all ${reviews.length} verified guest reviews for Bluff Haven Retreat. Rated 5 stars on Airbnb and VRBO.`,
}

const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"

export default function ReviewsPage() {
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

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
          <h1 className="font-display text-4xl font-semibold text-white mb-4">Guest Reviews</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#c9a84c' }}>
                  <path d={starPath}/>
                </svg>
              ))}
            </div>
            <span className="font-display text-2xl font-semibold" style={{ color: '#c9a84c' }}>{avgRating}</span>
            <span className="font-light text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              · {reviews.length} verified reviews
            </span>
          </div>
        </div>
      </div>

      {/* Reviews grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(review => (
            <div key={review.id}
              className="p-6 rounded-sm border flex flex-col gap-4"
              style={{ background: '#fff', borderColor: 'rgba(139,111,71,0.15)' }}>
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"
                    style={{ color: s <= review.rating ? '#c9a84c' : '#e5e7eb' }}>
                    <path d={starPath}/>
                  </svg>
                ))}
              </div>
              {/* Text */}
              <p className="text-sm leading-relaxed font-light" style={{ color: '#4a3728', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                &ldquo;{review.text}&rdquo;
              </p>
              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(139,111,71,0.1)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: '#2d4a2d' }}>
                    {review.guestName?.charAt(0)?.toUpperCase() ?? 'G'}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#1a2e1a' }}>{review.guestName}</p>
                    <p className="text-[10px] font-light" style={{ color: '#9b8b7a' }}>{review.source}</p>
                  </div>
                </div>
                {review.date && (
                  <span className="text-[10px] font-light" style={{ color: '#9b8b7a' }}>
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-12 border-t" style={{ borderColor: 'rgba(139,111,71,0.15)' }}>
          <p className="font-light mb-6" style={{ color: '#6b5a3e' }}>Ready to create your own memories?</p>
          <Link href="/book"
            className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-sm text-sm uppercase tracking-widest transition-all duration-300"
            style={{ background: '#1a2e1a', color: '#c9a84c' }}>
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
