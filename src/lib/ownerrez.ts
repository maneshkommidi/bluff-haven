/**
 * OwnerRez API client
 *
 * Architecture:
 *  - v1: availability, pricing, quotes (legacy API, still required for these endpoints)
 *  - v2: properties, guests, bookings
 *
 * All auth + fetch logic is centralised here.
 * Route handlers should import from this file only — never re-implement auth.
 */

// ─── Config + validation ──────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

const BASE_V1 = 'https://api.ownerrez.com/v1'
const BASE_V2 = 'https://api.ownerrez.com/v2'

function getConfig() {
  return {
    propertyId: requireEnv('OWNERREZ_PROPERTY_ID'),
    username:   requireEnv('OWNERREZ_USERNAME'),
    token:      requireEnv('OWNERREZ_TOKEN'),
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getAuthHeader(): string {
  const { username, token } = getConfig()
  return 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64')
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

async function orFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type':  'application/json',
      'Accept':        'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    // Redact credentials from error — only log status + endpoint path
    const path = new URL(url).pathname
    throw new Error(`OwnerRez ${res.status} on ${path}: ${body}`)
  }

  // Handle 204 No Content and other empty responses
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getDateMonthsFromNow(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function toDateStr(d: Date): string {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailabilityDay {
  date:      string
  available: boolean
  minNights: number
}

export interface RateQuote {
  total:     number
  base_rent: number
  fees:      { name: string; amount: number }[]
  taxes:     { name: string; amount: number }[]
  nights:    number
  currency:  string
}

export interface PropertyPhoto {
  id:      number
  url:     string
  caption?: string
}

export interface PropertyDetails {
  id:          number
  name:        string
  headline:    string
  description: string
  bedrooms:    number
  bathrooms:   number
  max_guests:  number
  check_in:    string
  check_out:   string
  address:     { city: string; state: string; country: string }
  photos:      PropertyPhoto[]
}

// ─── Availability + Pricing (single merged call) ──────────────────────────────

/**
 * Fetches availability and pricing in parallel from v1 and merges them.
 * Returns a day-by-day array with available flag + minNights for each date.
 * Used by /api/availability route.
 */
export async function getAvailabilityWithPricing(
  from?: string,
  to?: string
): Promise<AvailabilityDay[]> {
  const { propertyId } = getConfig()
  const start = from ?? new Date().toISOString().split('T')[0]
  const end   = to   ?? getDateMonthsFromNow(13)

  const [bookingData, pricingData] = await Promise.all([
    orFetch<unknown>(
      `${BASE_V1}/listings/${propertyId}/availability?start=${start}&end=${end}`
    ),
    orFetch<{ date: string; minNights: number }[]>(
      `${BASE_V1}/listings/${propertyId}/pricing?start=${start}&end=${end}`
    ).catch(() => [] as { date: string; minNights: number }[]),
  ])

  // Build blocked dates set from booking ranges
  const bookings    = Array.isArray(bookingData) ? (bookingData as any[]) : []
  const blockedDates = new Set<string>()
  for (const b of bookings) {
    if (!b.arrival || !b.departure) continue
    const [ay, am, ad] = (b.arrival  as string).split('-').map(Number)
    const [dy, dm, dd] = (b.departure as string).split('-').map(Number)
    const cursor  = new Date(ay, am - 1, ad)
    const endDate = new Date(dy, dm - 1, dd)
    while (cursor < endDate) {
      blockedDates.add(toDateStr(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  // Build minNights map
  const minNightsMap = new Map<string, number>(
    (Array.isArray(pricingData) ? pricingData : []).map(p => [p.date, p.minNights ?? 1])
  )

  // Generate full day-by-day result
  const result: AvailabilityDay[] = []
  const cursor  = new Date(start + 'T00:00:00')
  const endDate = new Date(end   + 'T00:00:00')
  while (cursor <= endDate) {
    const dateStr = toDateStr(cursor)
    result.push({
      date:      dateStr,
      available: !blockedDates.has(dateStr),
      minNights: minNightsMap.get(dateStr) ?? 1,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export async function getQuote(
  arrival:   string,
  departure: string,
  adults   = 2,
  children = 0
): Promise<RateQuote> {
  const { propertyId } = getConfig()

  const data = await orFetch<any>(`${BASE_V1}/quotes`, {
    method: 'TEST',
    body: JSON.stringify({
      PropertyId: parseInt(propertyId),
      Arrival:    arrival,
      Departure:  departure,
      Adults:     adults,
      Children:   children,
      Pets:       0,
    }),
  })

  const charges: any[] = data.charges ?? []
  const rentCharge = charges.find(c => c.type === 1)
  const feeCharges = charges.filter(c => c.type === 2)
  const taxCharges = charges.filter(c => c.type === 3)

  const base_rent = rentCharge?.amount ?? 0
  const fees      = feeCharges.map(c => ({ name: c.description as string, amount: c.amount as number }))
  const taxes     = taxCharges.map(c => ({ name: c.description as string, amount: c.amount as number }))
  const total     = charges.reduce((sum, c) => sum + ((c.amount as number) ?? 0), 0)
  const nights    = Math.round(
    (new Date(departure + 'T00:00:00').getTime() - new Date(arrival + 'T00:00:00').getTime())
    / (1000 * 60 * 60 * 24)
  )

  return { total, base_rent, fees, taxes, nights, currency: 'USD' }
}

// ─── Property ─────────────────────────────────────────────────────────────────

export async function getPropertyPhotos(): Promise<PropertyPhoto[]> {
  const { propertyId } = getConfig()

  // Try the dedicated photos endpoint first (requires WP + Integrated Sites feature)
  try {
    const data = await orFetch<any>(`${BASE_V2}/properties/${propertyId}/photos`)
    const items: any[] = data?.items ?? data ?? []
    if (Array.isArray(items) && items.length > 0) {
      return items.map((p: any, i: number) => ({
        id:      p.id      ?? i,
        url:     p.url     ?? p.large_url ?? p.original_url ?? p.medium_url ?? '',
        caption: p.caption ?? p.name ?? '',
        sort_order: p.sort_order ?? i,
      })).filter(p => p.url).sort((a, b) => a.sort_order - b.sort_order)
    }
  } catch {}

  // Fallback: try listing photos endpoint
  try {
    const data = await orFetch<any>(`${BASE_V2}/listings/${propertyId}/photos`)
    const items: any[] = data?.items ?? data ?? []
    if (Array.isArray(items) && items.length > 0) {
      return items.map((p: any, i: number) => ({
        id:      p.id      ?? i,
        url:     p.url     ?? p.large_url ?? p.original_url ?? '',
        caption: p.caption ?? '',
        sort_order: p.sort_order ?? i,
      })).filter(p => p.url).sort((a, b) => a.sort_order - b.sort_order)
    }
  } catch {}

  // Final fallback: pull from property details thumbnail
  try {
    const p = await orFetch<any>(`${BASE_V2}/properties/${propertyId}`)
    const url = p.thumbnail_url_large ?? p.thumbnail_url_medium ?? p.thumbnail_url ?? null
    if (url) return [{ id: 1, url, caption: p.name ?? 'Bluff Haven Retreat', sort_order: 0 }]
  } catch {}

  return []
}

export async function getFullPropertyDetails(): Promise<PropertyDetails> {
  const { propertyId } = getConfig()
  const [p, photos] = await Promise.all([
    orFetch<any>(`${BASE_V2}/properties/${propertyId}`),
    getPropertyPhotos(),
  ])

  return {
    id:          p.id,
    name:        p.name        ?? 'Bluff Haven Retreat',
    headline:    p.headline    ?? p.summary      ?? '',
    description: p.description ?? p.notes        ?? '',
    bedrooms:    p.bedrooms    ?? 2,
    bathrooms:   p.bathrooms_full ?? p.bathrooms ?? 2,
    max_guests:  p.max_guests  ?? 6,
    check_in:    p.check_in    ?? '4:00 PM',
    check_out:   p.check_out   ?? '10:00 AM',
    address:     p.address     ?? { city: 'Sevierville', state: 'Tennessee', country: 'US' },
    photos,
  }
}
