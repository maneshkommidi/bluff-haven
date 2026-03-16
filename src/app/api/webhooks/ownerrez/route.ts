import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * OwnerRez webhook handler.
 * Fires on: booking.created, booking.modified, booking.cancelled
 *
 * Set OWNERREZ_WEBHOOK_SECRET in OwnerRez → Settings → Webhooks
 * to enable signature verification.
 */

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

export async function POST(request: Request) {
  const body      = await request.text()
  const signature = request.headers.get('x-ownerrez-signature') ?? null
  const secret    = process.env.OWNERREZ_WEBHOOK_SECRET

  // Verify signature if secret is configured
  if (secret) {
    if (!verifySignature(body, signature, secret)) {
      console.warn('[ownerrez-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[ownerrez-webhook]', event.event_type, event.booking_id ?? '')

  switch (event.event_type) {
    case 'booking.created':
      // New booking from Airbnb/VRBO — availability cache will expire naturally (15 min)
      // For real-time updates, implement cache invalidation here
      console.log('[ownerrez-webhook] New booking:', event.booking_id)
      break

    case 'booking.modified':
      console.log('[ownerrez-webhook] Booking modified:', event.booking_id)
      break

    case 'booking.cancelled':
      console.log('[ownerrez-webhook] Booking cancelled:', event.booking_id)
      break

    default:
      console.log('[ownerrez-webhook] Unhandled event:', event.event_type)
  }

  return NextResponse.json({ received: true })
}
