import { NextResponse } from 'next/server'
import { getAvailabilityWithPricing } from '@/lib/ownerrez'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? undefined
  const to   = searchParams.get('to')   ?? undefined

  try {
    const result = await getAvailabilityWithPricing(from, to)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('[availability]', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
