'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'failed'>('loading')
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)

  const arrival   = params.get('arrival') ?? ''
  const departure = params.get('departure') ?? ''
  const guest     = params.get('guest') ?? ''
  const total     = parseFloat(params.get('total') ?? '0')
  const paymentIntent = params.get('payment_intent')
  const redirectStatus = params.get('redirect_status')

  useEffect(() => {
    if (!redirectStatus) {
      setStatus('failed')
      return
    }
    if (redirectStatus === 'succeeded') {
      setStatus('success')
      // Confirmation code will come via email from the webhook
    } else if (redirectStatus === 'processing') {
      setStatus('processing')
    } else {
      setStatus('failed')
    }
  }, [redirectStatus])

  const formatDate = (d: string) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">Confirming your booking...</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Payment unsuccessful</h1>
          <p className="text-stone-500 mb-8">Your payment could not be processed. No charge was made to your card.</p>
          <Link
            href="/book"
            className="inline-block bg-stone-800 text-white font-semibold px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Payment processing</h1>
          <p className="text-stone-500 mb-4">Your payment is being processed. You'll receive a confirmation email once it's complete.</p>
          <p className="text-xs text-stone-400">This usually takes just a few seconds. You can safely close this tab.</p>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">You're confirmed!</h1>
          <p className="text-stone-500">
            Hi {guest}, your stay at Bluff Haven Retreat is booked. A confirmation email is on its way.
          </p>
        </div>

        {/* Booking details card */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-6">
          <div className="bg-stone-800 text-white px-8 py-6">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">Bluff Haven Retreat</p>
            <h2 className="text-xl font-semibold">Booking confirmed</h2>
            {paymentIntent && (
              <p className="text-stone-400 text-xs mt-2 font-mono">Ref: {paymentIntent.slice(-8).toUpperCase()}</p>
            )}
          </div>

          <div className="px-8 py-6">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Check-in</p>
                <p className="font-semibold text-stone-800">{formatDate(arrival)}</p>
                <p className="text-sm text-stone-500 mt-0.5">After 4:00 PM</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Check-out</p>
                <p className="font-semibold text-stone-800">{formatDate(departure)}</p>
                <p className="text-sm text-stone-500 mt-0.5">Before 11:00 AM</p>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-6">
              <div className="flex justify-between items-center">
                <p className="text-stone-600 text-sm">Total charged</p>
                <p className="font-bold text-stone-800 text-xl">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-2xl border border-stone-100 p-8 mb-6">
          <h3 className="font-semibold text-stone-800 mb-5">What happens next</h3>
          <div className="space-y-5">
            {[
              {
                step: '1',
                title: 'Check your email',
                body: 'Your booking confirmation with a confirmation code has been sent to your inbox.',
              },
              {
                step: '2',
                title: 'Address sent before arrival',
                body: 'The full property address and access instructions will be sent 7 days before check-in.',
              },
              {
                step: '3',
                title: 'We\'re here if you need us',
                body: 'Reply to your confirmation email at any time with questions or special requests.',
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                  <p className="text-stone-500 text-sm mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-stone-500 text-sm hover:text-stone-700 transition-colors"
          >
            ← Back to Bluff Haven Retreat
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
