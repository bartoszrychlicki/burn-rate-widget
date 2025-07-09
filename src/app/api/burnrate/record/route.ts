import { NextRequest, NextResponse } from 'next/server'
import { insertBurnRate } from '@/lib/supabase'

// Stores a single burn rate sample sent from the client

export async function POST(request: NextRequest) {
  let value: unknown
  try {
    ;({ value } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }
  const { error } = await insertBurnRate(value)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
