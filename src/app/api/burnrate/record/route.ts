import { NextRequest, NextResponse } from 'next/server'
import { insertBurnRate } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { value } = await request.json()
  if (typeof value !== 'number') {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }
  const { error } = await insertBurnRate(value)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
