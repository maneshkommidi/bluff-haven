import { NextResponse } from 'next/server'
import { reviews } from '@/lib/reviews'

export async function GET() {
  return NextResponse.json(reviews)
}
