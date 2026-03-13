import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getQuote } from '@/lib/ownerrez'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: Request) {
  const body = await request.json()
  const { arrival, departure, adults, children, guest } = body

  if (!arrival || !departure || !guest?.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Get the live quote from OwnerRez — always calculate server-side
    const quote = await getQuote(arrival, departure, adults ?? 2, children ?? 0)
    const amountInCents = Math.round(quote.total * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: quote.currency?.toLowerCase() ?? 'usd',
      metadata: {
        property_id: process.env.OWNERREZ_PROPERTY_ID!,
        arrival,
        departure,
        guest_email: guest.email,
        guest_first: guest.firstName,
        guest_last: guest.lastName,
        guest_phone: guest.phone ?? '',
        adults: String(adults ?? 2),
        children: String(children ?? 0),
        notes: guest.notes ?? '',
      },
      receipt_email: guest.email,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      quote,
    })
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
