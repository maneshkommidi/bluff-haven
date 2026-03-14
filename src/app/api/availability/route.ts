import { NextResponse } from 'next/server'
import { getAvailability } from '@/lib/ownerrez'

const BASE_V1 = 'https://api.ownerrez.com/v1'
const PROPERTY_ID = process.env.OWNERREZ_PROPERTY_ID!
const USERNAME    = process.env.OWNERREZ_USERNAME!
const TOKEN       = process.env.OWNERREZ_TOKEN!

function getAuthHeader() {
  return 'Basic ' + Buffer.from(`${USERNAME}:${TOKEN}`).toString('base64')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? undefined
  const to   = searchParams.get('to')   ?? undefined

  try {
    const [availability, pricing] = await Promise.all([
      getAvailability(from, to),
      fetchPricing(from, to),
    ])

    // Merge minNights into availability response
    const pricingMap = new Map(pricing.map((p: any) => [p.date, p.minNights ?? 1]))
    const result = availability.map(day => ({
      ...day,
      minNights: pricingMap.get(day.date) ?? 1,
    }))

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Availability fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability', detail: String(error) },
      { status: 500 }
    )
  }
}

async function fetchPricing(from?: string, to?: string) {
  const start = from ?? new Date().toISOString().split('T')[0]
  const end   = to   ?? getDateMonthsFromNow(13)
  const url   = `${BASE_V1}/listings/${PROPERTY_ID}/pricing?start=${start}&end=${end}`
  const res   = await fetch(url, {
    headers: { 'Authorization': getAuthHeader(), 'Accept': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

function getDateMonthsFromNow(months: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}
