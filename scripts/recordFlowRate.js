const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')
require('dotenv/config')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function fetchMonth() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    throw new Error('Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID')
  }
  const url = `https://api.airtable.com/v0/${baseId}/months`
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.records
}

function computeFlowRateMinute(records) {
  const lipiec = records.find(r => r.fields.Name === 'Lipiec')
  if (!lipiec) throw new Error('Month Lipiec not found')

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
  return earnRateMinute - burnRateMinute
}

async function main() {
  try {
    const records = await fetchMonth()
    const value = computeFlowRateMinute(records)
    const { error } = await supabase.from('burn_rates').insert({ timestamp: Date.now(), value })
    if (error) throw error
    console.log('Recorded value', value)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
