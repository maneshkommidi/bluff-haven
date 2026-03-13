import { NextResponse } from 'next/server'
import { getAvailability } from '@/lib/ownerrez'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined

  try {
    const availability = await getAvailability(from, to)
    return NextResponse.json(availability, {
      headers: {
        // Cache for 15 minutes — availability changes when bookings come in
        'Cache-Control': 's-maxage=900, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Availability fetch failed:', error)
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}
