import { NextResponse } from 'next/server'
import axios from 'axios'
import { fetchBurnRates } from '@/lib/supabase'

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 })
  }

  const url = `https://api.airtable.com/v0/${baseId}/months`
  try {
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    const records = response.data.records
    const lipiec = records.find((r: any) => r.fields.Name === 'Lipiec')
    if (!lipiec) {
      return NextResponse.json({ error: 'Month Lipiec not found' }, { status: 404 })
    }
    const rawExpenses = parseFloat(String(lipiec.fields['expenses_sum'] || '0').replace(/[^0-9.-]/g, ''))
    if (Number.isNaN(rawExpenses)) throw new Error('Invalid expenses sum')

    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

    const rowsToday = await fetchBurnRates(startToday.getTime(), now.getTime())
    const rowsYesterday = await fetchBurnRates(startYesterday.getTime(), startToday.getTime())
    const totalToday = rowsToday.reduce((s, r) => s + r.value, 0)
    const totalYesterday = rowsYesterday.reduce((s, r) => s + r.value, 0)

    const spentToday = totalToday < 0 ? -totalToday : 0
    const spentYesterday = totalYesterday < 0 ? -totalYesterday : 0

    const dayOfMonth = now.getDate()
    const avgDaily = rawExpenses / dayOfMonth
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
