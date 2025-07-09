import { NextResponse } from 'next/server'
import { fetchBurnRates } from '@/lib/supabase'

export async function GET() {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

  async function groupAndSum(start: Date, end: Date) {
    const rows = await fetchBurnRates(start.getTime(), end.getTime())
    const map = new Map<number, number[]>()
    for (const r of rows) {
      const h = new Date(r.timestamp).getHours()
      const arr = map.get(h) || []
      arr.push(r.value)
      map.set(h, arr)
    }
    const hourly: { hour: number; avg: number }[] = []
    for (const [hour, vals] of map) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
      hourly.push({ hour, avg })
    }
    hourly.sort((a, b) => a.hour - b.hour)
    const total = hourly.reduce((s, h) => s + h.avg, 0)
    return { hourly, total }
  }

  const today = await groupAndSum(startToday, now)
  const yesterday = await groupAndSum(startYesterday, startToday)

  return NextResponse.json({
    hourly: today.hourly,
    totalToday: today.total,
    totalYesterday: yesterday.total,
  })
}
