import { NextResponse } from 'next/server'
import axios from 'axios'

// Helper to parse date strings returned from Airtable
function parseTransactionDate(value: string): Date | null {
  const direct = new Date(value)
  if (!isNaN(direct.getTime())) return direct
  const m = value.match(/(\d{1,2})\s+([\p{L}]+)\s+(\d{4})/u)
  if (!m) return null
  const day = parseInt(m[1], 10)
  const monthName = m[2].toLowerCase()
  const year = parseInt(m[3], 10)
  const months: Record<string, number> = {
    'stycznia': 1,
    'lutego': 2,
    'marca': 3,
    'kwietnia': 4,
    'maja': 5,
    'czerwca': 6,
    'lipca': 7,
    'sierpnia': 8,
    'września': 9,
    'października': 10,
    'listopada': 11,
    'grudnia': 12
  }
  const month = months[monthName]
  if (!month) return null
  return new Date(Date.UTC(year, month - 1, day))
}

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 })
  }

  const url = `https://api.airtable.com/v0/${baseId}/transactions`
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const now = new Date()
    const params = {
      filterByFormula: `IS_AFTER({transaction date}, '${startOfMonth.toISOString()}')`,
      maxRecords: 1000
    }
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params
    })
    const records = response.data.records as any[]
    let totalMonth = 0
    let spentToday = 0
    let spentYesterday = 0
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startYesterday = new Date(startToday)
    startYesterday.setDate(startYesterday.getDate() - 1)
    const endToday = new Date(startToday)
    endToday.setDate(endToday.getDate() + 1)

    for (const rec of records) {
      const val = parseFloat(String(rec.fields.Value || '0').replace(/[^0-9.-]/g, ''))
      if (Number.isNaN(val) || val <= 0) continue
      const raw = String(rec.fields['transaction date'] || '')
      const parsed = parseTransactionDate(raw)
      if (!parsed) continue
      const date = parsed
      totalMonth += val
      if (date >= startToday && date < endToday) {
        spentToday += val
      } else if (date >= startYesterday && date < startToday) {
        spentYesterday += val
      }
    }

    const dayOfMonth = now.getDate()
    const daysCompleted = Math.max(dayOfMonth - 1, 1)
    const expensesUntilYesterday = totalMonth - spentToday
    const avgDaily = expensesUntilYesterday / daysCompleted
    const challengeLimit = avgDaily * 0.99

    return NextResponse.json({
      challengeLimit,
      spentToday,
      spentYesterday
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
