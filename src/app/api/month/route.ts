// src/app/api/month/route.ts
// Returns burn rate and earnings data for the current month

import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!token || !baseId) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 })
  }

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
    const expensesSum = parseFloat(rawExpenses.replace(/[^0-9.-]/g, ''))
    if (Number.isNaN(expensesSum)) throw new Error('Invalid expenses sum')
    
    const rawIncome = String(lipiec.fields['income_sum'] || '0')
    const incomeSum = parseFloat(rawIncome.replace(/[^0-9.-]/g, ''))
    if (Number.isNaN(incomeSum)) throw new Error('Invalid income sum')

    const rawEstimatedIncome = String(lipiec.fields['estimated_income_sum'] || '0')
    const estimatedIncomeSum = parseFloat(rawEstimatedIncome.replace(/[^0-9.-]/g, ''))
    if (Number.isNaN(estimatedIncomeSum)) throw new Error('Invalid estimated income')

    const startOfMonth = new Date('2025-07-01T00:00:00')
    const now = new Date()
    // Calculate how many seconds have passed since the start of the month
    const secondsPassed = Math.floor((now.getTime() - startOfMonth.getTime()) / 1000)
    // Burn rate per second
    const burnRateSecond = secondsPassed > 0 ? expensesSum / secondsPassed : 0
    // Calculate how many minutes have passed since the start of the month
    const minutesPassed = Math.floor(secondsPassed / 60)
    // Burn rate per minute (more fluid, updates every second)
    const burnRateMinute = secondsPassed > 0 ? expensesSum / (secondsPassed / 60) : 0
    // Calculate how many hours have passed since the start of the month
    const hoursPassed = Math.floor(minutesPassed / 60)
    // Burn rate per hour
    const burnRateHour = hoursPassed > 0 ? expensesSum / hoursPassed : 0

    // Calculate total seconds, minutes, and hours in the current month
    const endOfMonth = new Date('2025-07-31T23:59:59')
    const totalSecondsInMonth = Math.floor((endOfMonth.getTime() - startOfMonth.getTime()) / 1000)
    const totalMinutesInMonth = Math.floor(totalSecondsInMonth / 60)
    const totalHoursInMonth = Math.floor(totalMinutesInMonth / 60)

    // Earn rate per second (based on total seconds in month)
    const earnRateSecond = totalSecondsInMonth > 0 ? estimatedIncomeSum / totalSecondsInMonth : 0
    // Earn rate per minute (based on total minutes in month)
    const earnRateMinute = totalMinutesInMonth > 0 ? estimatedIncomeSum / totalMinutesInMonth : 0
    // Earn rate per hour (based on total hours in month)
    const earnRateHour = totalHoursInMonth > 0 ? estimatedIncomeSum / totalHoursInMonth : 0

    // Flow rate per second (difference between earn and burn rate per second)
    const flowRateSecond = earnRateSecond - burnRateSecond
    // Flow rate per minute (difference between earn and burn rate per minute)
    const flowRateMinute = earnRateMinute - burnRateMinute
    // Flow rate per hour (difference between earn and burn rate)
    const flowRate = earnRateHour - burnRateHour

    // Calculate remaining seconds in the month
    const remainingSecondsInMonth = totalSecondsInMonth - secondsPassed
    // Calculate potential savings by the end of the month
    const potentialSavings = flowRateSecond * remainingSecondsInMonth

    // Return raw values and all calculated rates in the API response
    return NextResponse.json({
      rawExpenses: expensesSum,
      rawIncome: incomeSum,
      rawEstimatedIncome: estimatedIncomeSum,
      burnRateSecond,
      burnRateMinute,
      burnRateHour,
      earnRateSecond,
      earnRateMinute,
      earnRateHour,
      flowRateSecond,
      flowRateMinute,
      flowRate,
      potentialSavings
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
} 