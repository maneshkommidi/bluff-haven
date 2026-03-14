/**
 * OwnerRez API client
 * v1 for availability + quotes, v2 for guests + bookings
 */

const BASE_V1 = 'https://api.ownerrez.com/v1'
const BASE_V2 = 'https://api.ownerrez.com/v2'
const PROPERTY_ID = process.env.OWNERREZ_PROPERTY_ID!
const USERNAME    = process.env.OWNERREZ_USERNAME!
const TOKEN       = process.env.OWNERREZ_TOKEN!

function getAuthHeader(): string {
  const credentials = Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64')
  return `Basic ${credentials}`
}

async function orFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OwnerRez API error ${res.status} at ${url}: ${error}`)
  }
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailabilityDay {
  date: string
  available: boolean
}

export interface RateQuote {
  total: number
  base_rent: number
  fees: { name: string; amount: number }[]
  taxes: { name: string; amount: number }[]
  nights: number
  currency: string
}

export interface BookingPayload {
  property_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  arrival: string
  departure: string
  adults: number
  children: number
  notes?: string
  stripe_payment_intent_id?: string
  total_paid?: number
}

export interface Booking {
  id: number
  confirmation_code: string
  status: string
  arrival: string
  departure: string
  total: number
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getAvailability(from?: string, to?: string): Promise<AvailabilityDay[]> {
  const start = from ?? new Date().toISOString().split('T')[0]
  const end   = to   ?? getDateMonthsFromNow(13)
  const data  = await orFetch<any>(`${BASE_V1}/listings/${PROPERTY_ID}/availability?start=${start}&end=${end}`)
  const bookings: any[] = Array.isArray(data) ? data : []
  const blockedDates = new Set<string>()
  for (const booking of bookings) {
    if (!booking.arrival || !booking.departure) continue
    const [ay, am, ad] = booking.arrival.split('-').map(Number)
    const [dy, dm, dd] = booking.departure.split('-').map(Number)
    const cursor  = new Date(ay, am - 1, ad)
    const endDate = new Date(dy, dm - 1, dd)
    while (cursor < endDate) {
      blockedDates.add(
        cursor.getFullYear() + '-' +
        String(cursor.getMonth() + 1).padStart(2, '0') + '-' +
        String(cursor.getDate()).padStart(2, '0')
      )
      cursor.setDate(cursor.getDate() + 1)
    }
  }
  const result: AvailabilityDay[] = []
  const cursor  = new Date(start + 'T00:00:00')
  const endDate = new Date(end   + 'T00:00:00')
  while (cursor <= endDate) {
    const dateStr =
      cursor.getFullYear() + '-' +
      String(cursor.getMonth() + 1).padStart(2, '0') + '-' +
      String(cursor.getDate()).padStart(2, '0')
    result.push({ date: dateStr, available: !blockedDates.has(dateStr) })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export async function getQuote(
  arrival: string,
  departure: string,
  adults: number = 2,
  children: number = 0
): Promise<RateQuote> {
  const data = await orFetch<any>(`${BASE_V1}/quotes`, {
    method: 'TEST',
    body: JSON.stringify({
      PropertyId: parseInt(PROPERTY_ID),
      Arrival: arrival,
      Departure: departure,
      Adults: adults,
      Children: children,
      Pets: 0,
    }),
  })
  const charges: any[] = data.charges ?? []
  const rentCharge = charges.find(c => c.type === 1)
  const feeCharges = charges.filter(c => c.type === 2)
  const taxCharges = charges.filter(c => c.type === 3)
  const base_rent  = rentCharge?.amount ?? 0
  const fees       = feeCharges.map(c => ({ name: c.description, amount: c.amount }))
  const taxes      = taxCharges.map(c => ({ name: c.description, amount: c.amount }))
  const total      = charges.reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const arrDate    = new Date(arrival   + 'T00:00:00')
  const depDate    = new Date(departure + 'T00:00:00')
  const nights     = Math.round((depDate.getTime() - arrDate.getTime()) / (1000 * 60 * 60 * 24))
  return { total, base_rent, fees, taxes, nights, currency: 'USD' }
}

// ─── Create guest ─────────────────────────────────────────────────────────────
// Confirmed v2 field names: email_addresses[].address, phones[].number

export async function createGuest(payload: {
  first_name: string
  last_name: string
  email: string
  phone?: string
}): Promise<{ id: number }> {
  const body: any = {
    first_name: payload.first_name,
    last_name:  payload.last_name,
    email_addresses: [{ address: payload.email }],
  }
  if (payload.phone) {
    body.phones = [{ number: payload.phone }]
  }
  return orFetch<{ id: number }>(`${BASE_V2}/guests`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ─── Create booking ───────────────────────────────────────────────────────────
// Note: v2 POST /bookings only accepts property_id, guest_id, arrival, departure.
// adults/children are not writable via API — they show as 0 in OwnerRez.
// Payment is collected via Stripe; we record the Stripe details in notes
// since OwnerRez v2 has no writable payments endpoint.

export async function createBooking(payload: BookingPayload): Promise<Booking> {
  // Step 1: Create guest
  const guest = await createGuest({
    first_name: payload.first_name,
    last_name:  payload.last_name,
    email:      payload.email,
    phone:      payload.phone,
  })

  // Step 2: Build notes with guest count + Stripe payment reference
  const noteParts = [
    `Adults: ${payload.adults}, Children: ${payload.children}`,
    payload.stripe_payment_intent_id
      ? `Stripe Payment: ${payload.stripe_payment_intent_id}`
      : '',
    payload.total_paid
      ? `Total Paid: $${payload.total_paid.toFixed(2)}`
      : '',
    payload.notes ?? '',
  ].filter(Boolean).join(' | ')

  // Step 3: Create booking
  const booking = await orFetch<Booking>(`${BASE_V2}/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      property_id: payload.property_id,
      guest_id:    guest.id,
      arrival:     payload.arrival,
      departure:   payload.departure,
    }),
  })

  // Step 4: PATCH notes onto the booking
  try {
    await orFetch(`${BASE_V2}/bookings/${booking.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes: noteParts }),
    })
  } catch (e) {
    // Notes patch failing shouldn't fail the whole booking
    console.warn('Could not patch booking notes:', e)
  }

  return booking
}

// ─── Property info ────────────────────────────────────────────────────────────

export interface PropertyPhoto {
  id: number
  url: string
  caption?: string
  sort_order?: number
}

export interface PropertyAmenity {
  id: number
  name: string
  category?: string
}

export interface PropertyDetails {
  id: number
  name: string
  headline?: string
  description?: string
  bedrooms?: number
  bathrooms?: number
  bathrooms_half?: number
  max_guests?: number
  address?: { city?: string; state?: string; country?: string }
  photos: PropertyPhoto[]
  amenities: PropertyAmenity[]
}

export async function getProperty(): Promise<Record<string, unknown>> {
  return orFetch<Record<string, unknown>>(`${BASE_V2}/properties/${PROPERTY_ID}`)
}

export async function getPropertyPhotos(): Promise<PropertyPhoto[]> {
  return []
}

export async function getPropertyAmenities(): Promise<PropertyAmenity[]> {
  try {
    const data = await orFetch<any>(`${BASE_V2}/properties/${PROPERTY_ID}`)
    const raw: any[] = data.amenities ?? data.property_amenities ?? []
    return raw.map((a: any, i: number) => ({
      id: a.id ?? i,
      name: a.name ?? a.amenity_name ?? String(a),
      category: a.category ?? a.amenity_type ?? undefined,
    }))
  } catch {
    return []
  }
}

export async function getFullPropertyDetails(): Promise<PropertyDetails> {
  const property = await getProperty() as any
  const photos: PropertyPhoto[] = []
  if (property.thumbnail_url_large) {
    photos.push({ id: 1, url: property.thumbnail_url_large, caption: property.name })
  } else if (property.thumbnail_url_medium) {
    photos.push({ id: 1, url: property.thumbnail_url_medium, caption: property.name })
  } else if (property.thumbnail_url) {
    photos.push({ id: 1, url: property.thumbnail_url, caption: property.name })
  }
  const rawAmenities: any[] = property.amenities ?? property.property_amenities ?? []
  const amenities: PropertyAmenity[] = rawAmenities.map((a: any, i: number) => ({
    id: a.id ?? i,
    name: a.name ?? a.amenity_name ?? String(a),
    category: a.category ?? undefined,
  }))
  return {
    id: property.id,
    name: property.name ?? 'Bluff Haven Retreat',
    headline: property.headline ?? property.summary ?? '',
    description: property.description ?? property.notes ?? '',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms_full ?? property.bathrooms,
    bathrooms_half: property.bathrooms_half ?? 0,
    max_guests: property.max_guests,
    address: property.address,
    photos,
    amenities,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateMonthsFromNow(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}
