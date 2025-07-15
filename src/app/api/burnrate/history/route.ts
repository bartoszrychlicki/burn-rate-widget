import { NextResponse } from 'next/server'
import { fetchBurnRates } from '@/lib/supabase'

/**
 * Returns hourly candlestick data for all recorded flow rates.
 * Each entry contains the hour timestamp (start of hour) and
 * open, high, low, close values aggregated from minute samples.
 */
export async function GET() {
  // fetch all records from the beginning of time
  const now = Date.now()
  let rows: { timestamp: number; value: number }[] = []
  try {
    rows = await fetchBurnRates(0, now)
  } catch (err) {
    console.error(err)
  }

  rows.sort((a, b) => a.timestamp - b.timestamp)

  const map = new Map<number, { open: number; high: number; low: number; close: number }>()
  for (const r of rows) {
    const date = new Date(r.timestamp)
    const hourTs = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime()
    const entry = map.get(hourTs)
    if (!entry) {
      map.set(hourTs, { open: r.value, high: r.value, low: r.value, close: r.value })
    } else {
      entry.high = Math.max(entry.high, r.value)
      entry.low = Math.min(entry.low, r.value)
      entry.close = r.value
    }
  }

  const candles = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ts, ohlc]) => ({ timestamp: ts, ...ohlc }))

  return NextResponse.json({ candles })
}
