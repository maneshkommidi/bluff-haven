/**
 * OwnerRez API client
 * - Availability: derived from v2 bookings endpoint (blocked dates)
 * - Quotes/Pricing: v1.1 API (quotes not yet in v2)
 * - Property info: v2 API
 * Auth: HTTP Basic — username = OwnerRez email, password = personal access token
 */

const BASE_V2  = 'https://api.ownerrez.com/v2'
const BASE_V11 = 'https://api.ownerrez.com/v1.1'
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
    // Disable Next.js caching so we always get fresh data
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
  date: string        // "YYYY-MM-DD"
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

export interface GuestPayload {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export interface Guest {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface QuoteResponse {
  id: number
  payment_form_url: string
  total: number
  charges: { name: string; total: number; type: string }[]
}

// ─── Availability ──────────────────────────────────────────────────────────────

/**
 * Get blocked/booked dates by fetching bookings from v2 API.
 * We expand each booking into individual blocked dates for the calendar.
 */
export async function getAvailability(
  from?: string,
  to?: string
): Promise<AvailabilityDay[]> {
  const start = from ?? new Date().toISOString().split('T')[0]
  const end   = to   ?? getDateMonthsFromNow(13)

  // Fetch bookings using correct v2 params: property_ids (plural) + since_utc
  // Returns all bookings/blocks from start including Airbnb/VRBO synced ones
  const data = await orFetch<{ items: BookingBlock[] }>(
    `${BASE_V2}/bookings?property_ids=${PROPERTY_ID}&since_utc=${start}T00:00:00Z`
  )

  const bookings = data.items ?? []
  const blockedDates = new Set<string>()

  // Expand each booking/block into individual dates
  for (const booking of bookings) {
    const arrivalDate    = new Date(booking.arrival   + 'T00:00:00')
    const departureDate  = new Date(booking.departure + 'T00:00:00')
    const current = new Date(arrivalDate)

    while (current < departureDate) {
      blockedDates.add(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
  }

  // Build full calendar array
  const result: AvailabilityDay[] = []
  const cursor = new Date(start + 'T00:00:00')
  const endDate = new Date(end  + 'T00:00:00')

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().split('T')[0]
    result.push({ date: dateStr, available: !blockedDates.has(dateStr) })
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

interface BookingBlock {
  id: number
  arrival: string
  departure: string
  status: string
  is_block: boolean
}

// ─── Quotes / Pricing (v1.1) ──────────────────────────────────────────────────

/**
 * Create a guest record, then generate a quote with OwnerRez pricing engine.
 * Uses v1.1 API — quotes are not yet available in v2.
 */
export async function getQuote(
  arrival: string,
  departure: string,
  adults: number = 2,
  children: number = 0
): Promise<RateQuote> {
  // Use the TEST verb on v1.1 quotes — validates and returns pricing without saving
  const data = await orFetch<{
    TotalAmount: number
    RentAmount: number
    Charges: { Name: string; Amount: number; Type: string }[]
    Nights: number
  }>(`${BASE_V11}/quotes/test`, {
    method: 'POST',
    body: JSON.stringify({
      PropertyId: parseInt(PROPERTY_ID),
      Arrival: arrival,
      Departure: departure,
      Adults: adults,
      Children: children,
      Pets: 0,
    }),
  })

  const fees  = (data.Charges ?? []).filter(c => c.Type === 'Fee').map(c => ({ name: c.Name, amount: c.Amount }))
  const taxes = (data.Charges ?? []).filter(c => c.Type === 'Tax').map(c => ({ name: c.Name, amount: c.Amount }))

  return {
    total:     data.TotalAmount,
    base_rent: data.RentAmount,
    fees,
    taxes,
    nights:    data.Nights,
    currency:  'USD',
  }
}

// ─── Guest + Quote booking flow ───────────────────────────────────────────────

/**
 * Step 1: Create or find a guest record.
 */
export async function createGuest(payload: GuestPayload): Promise<Guest> {
  return orFetch<Guest>(`${BASE_V2}/guests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Step 2: Create a quote for a guest — returns a payment_form_url
 * that can be used to redirect the guest to OwnerRez to pay.
 */
export async function createQuote(
  guestId: number,
  arrival: string,
  departure: string,
  adults: number,
  children: number,
  redirectUrl?: string
): Promise<QuoteResponse> {
  return orFetch<QuoteResponse>(`${BASE_V11}/quotes`, {
    method: 'POST',
    body: JSON.stringify({
      GuestId:     guestId,
      PropertyId:  parseInt(PROPERTY_ID),
      Arrival:     arrival,
      Departure:   departure,
      Adults:      adults,
      Children:    children,
      Pets:        0,
      ...(redirectUrl ? { RedirectUrl: redirectUrl } : {}),
    }),
  })
}

// ─── Property info ────────────────────────────────────────────────────────────

export async function getProperty() {
  return orFetch<Record<string, unknown>>(`${BASE_V2}/properties/${PROPERTY_ID}`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateMonthsFromNow(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}
