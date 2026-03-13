import { NextResponse } from 'next/server'

/**
 * OwnerRez fires webhooks for booking.created, booking.modified, booking.cancelled.
 * This handler can be used to update a local DB cache or send internal notifications.
 */
export async function POST(request: Request) {
  const body = await request.json()

  console.log('OwnerRez webhook received:', body.event_type, body)

  switch (body.event_type) {
    case 'booking.created':
      console.log('New booking from OwnerRez (Airbnb/VRBO):', body.booking_id)
      // TODO: invalidate availability cache
      break

    case 'booking.modified':
      console.log('Booking modified:', body.booking_id)
      break

    case 'booking.cancelled':
      console.log('Booking cancelled:', body.booking_id)
      // TODO: invalidate availability cache, send cancellation email
      break

    default:
      console.log('Unhandled OwnerRez event:', body.event_type)
  }

  return NextResponse.json({ received: true })
}
