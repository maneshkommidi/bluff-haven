import { NextResponse } from 'next/server'
import { getFullPropertyDetails } from '@/lib/ownerrez'

export async function GET() {
  try {
    const details = await getFullPropertyDetails()
    return NextResponse.json(details, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('[property]', error)
    return NextResponse.json({ error: 'Failed to fetch property details' }, { status: 500 })
  }
}
