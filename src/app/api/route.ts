// src/app/api/months/route.ts

import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const url = `https://api.airtable.com/v0/${baseId}/months`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const records = response.data.records
    const lipiec = records.find((r: any) => r.fields.Name === 'Lipiec')

    if (!lipiec) {
      return NextResponse.json({ error: 'Nie znaleziono miesiąca Lipiec' }, { status: 404 })
    }

    const rawExpenses = String(lipiec.fields['expenses_sum'] || '0')
    const expensesSum = parseFloat(
      rawExpenses.replace('PLN', '').replace(',', '').trim()
    )
    
    const rawIncome = String(lipiec.fields['income_sum'] || '0')
    const incomeSum = parseFloat(
      rawIncome.replace('PLN', '').replace('-', '').replace(',', '').trim()
    )

    const startOfMonth = new Date('2025-07-01T00:00:00')
    const now = new Date()
    // Calculate how many seconds have passed since the start of the month
    const secondsPassed = Math.floor((now.getTime() - startOfMonth.getTime()) / 1000)
    console.log(expensesSum);
    // Burn rate per second
    const burnRateSecond = secondsPassed > 0 ? expensesSum / secondsPassed : 0
    // Calculate how many minutes have passed since the start of the month
    const minutesPassed = Math.floor(secondsPassed / 60)
    // Burn rate per minute
    const burnRateMinute = minutesPassed > 0 ? expensesSum / minutesPassed : 0
    // Calculate how many hours have passed since the start of the month
    const hoursPassed = Math.floor(minutesPassed / 60)
    // Burn rate per hour
    const burnRateHour = hoursPassed > 0 ? expensesSum / hoursPassed : 0
    // Return all burn rates in the API response
    return NextResponse.json({ burnRateSecond, burnRateMinute, burnRateHour })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
