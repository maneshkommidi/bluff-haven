import { NextResponse } from 'next/server'
import { getQuote } from '@/lib/ownerrez'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const arrival   = searchParams.get('arrival')
  const departure = searchParams.get('departure')
  const adults    = parseInt(searchParams.get('adults')   ?? '2')
  const children  = parseInt(searchParams.get('children') ?? '0')

  if (!arrival || !departure) {
    return NextResponse.json(
      { error: 'arrival and departure are required' },
      { status: 400 }
    )
  }

  try {
    const quote = await getQuote(arrival, departure, adults, children)
    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quote fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote', detail: String(error) },
      { status: 500 }
    )
  }
}
