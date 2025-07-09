import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { insertBurnRate } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!token || !baseId) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 })
  }

  try {
    const url = `https://api.airtable.com/v0/${baseId}/months`
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    const records = response.data.records
    const lipiec = records.find((r: any) => r.fields.Name === 'Lipiec')
    if (!lipiec) {
      return NextResponse.json({ error: 'Month Lipiec not found' }, { status: 404 })
    }

    const rawExpenses = String(lipiec.fields['expenses_sum'] || '0')
    const expensesSum = parseFloat(rawExpenses.replace('PLN', '').replace(',', '').trim())
    const rawEstimatedIncome = String(lipiec.fields['estimated_income_sum'] || '0')
    const estimatedIncomeSum = parseFloat(
      rawEstimatedIncome.replace('PLN', '').replace('-', '').replace(',', '').trim()
    )

    const startOfMonth = new Date('2025-07-01T00:00:00')
    const now = new Date()
    const secondsPassed = Math.floor((now.getTime() - startOfMonth.getTime()) / 1000)
    const endOfMonth = new Date('2025-07-31T23:59:59')
    const totalMinutesInMonth = Math.floor((endOfMonth.getTime() - startOfMonth.getTime()) / 1000 / 60)

    const burnRateMinute = secondsPassed > 0 ? expensesSum / (secondsPassed / 60) : 0
    const earnRateMinute = totalMinutesInMonth > 0 ? estimatedIncomeSum / totalMinutesInMonth : 0
    const flowRateMinute = earnRateMinute - burnRateMinute

    const { error } = await insertBurnRate(flowRateMinute)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, value: flowRateMinute })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
