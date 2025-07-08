import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  const { value } = await request.json()
  if (typeof value !== 'number') {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }
  const stmt = db.prepare('INSERT INTO burn_rates (timestamp, value) VALUES (?, ?)')
  stmt.run(Date.now(), value)
  return NextResponse.json({ ok: true })
}
