import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createBooking } from '@/lib/ownerrez'
import { sendBookingConfirmation } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const meta = intent.metadata

    try {
      const booking = await createBooking({
        property_id:               parseInt(meta.property_id),
        first_name:                meta.guest_first,
        last_name:                 meta.guest_last,
        email:                     meta.guest_email,
        phone:                     meta.guest_phone,
        arrival:                   meta.arrival,
        departure:                 meta.departure,
        adults:                    parseInt(meta.adults),
        children:                  parseInt(meta.children),
        notes:                     meta.notes,
        stripe_payment_intent_id:  intent.id,
        total_paid:                intent.amount / 100,
      })

      await sendBookingConfirmation({
        guestEmail:       meta.guest_email,
        guestName:        `${meta.guest_first} ${meta.guest_last}`,
        confirmationCode: booking.id.toString(),
        arrival:          meta.arrival,
        departure:        meta.departure,
        total:            intent.amount / 100,
      })

      console.log(`Booking created in OwnerRez: ${booking.id}`)
    } catch (error: any) {
      console.error('Failed to create booking after payment:', {
        message: error?.message,
        meta,
      })
    }
  }

  return NextResponse.json({ received: true })
}

export const runtime = 'nodejs'
