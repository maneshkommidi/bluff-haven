'use client'

import { useEffect, useState } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  clientSecret: string
  total: number
  arrival: string
  departure: string
  guestName: string
}

function CheckoutForm({ total, arrival, departure, guestName }: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation?arrival=${arrival}&departure=${departure}&guest=${encodeURIComponent(guestName)}&total=${total}`,
      },
    })

    if (error) {
      setErrorMessage(error.message ?? 'An unexpected error occurred.')
      setIsLoading(false)
    }
    // On success, Stripe redirects to return_url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing payment...
          </>
        ) : (
          `Pay $${total.toFixed(2)} →`
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.25 3.75 10.14 9 11.25C17.25 21.14 21 16.25 21 11V5l-9-4z"/>
        </svg>
        Secured by Stripe · SSL encrypted
      </div>
    </form>
  )
}

export default function StripePaymentForm({
  clientSecret,
  total,
  arrival,
  departure,
  guestName,
}: PaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#292524',
            colorBackground: '#ffffff',
            colorText: '#1c1917',
            colorDanger: '#ef4444',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
            fontSizeBase: '14px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e7e5e4',
              boxShadow: 'none',
            },
            '.Input:focus': {
              border: '1px solid #292524',
              boxShadow: '0 0 0 2px #29252420',
            },
            '.Label': {
              color: '#78716c',
              fontWeight: '400',
            },
          },
        },
      }}
    >
      <CheckoutForm
        total={total}
        arrival={arrival}
        departure={departure}
        guestName={guestName}
      />
    </Elements>
  )
}
