'use client'

import { useEffect, useState } from 'react'
import SpendRpmGauge from '@/components/SpendRpmGauge'

interface MonthData {
  rawExpenses: number
  rawEstimatedIncome: number
}

export default function SpendRpmPage() {
  const [month, setMonth] = useState<MonthData | null>(null)
  const [rpm, setRpm] = useState(0)
  const [percent, setPercent] = useState(0)

  // Fetch month data periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/month')
        if (!res.ok) throw new Error('Request failed')
        const json = await res.json()
        setMonth({
          rawExpenses: json.rawExpenses,
          rawEstimatedIncome: json.rawEstimatedIncome
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  // Compute RPM every second
  useEffect(() => {
    if (!month) return
    const startOfMonth = new Date('2025-07-01T00:00:00')
    const daysInMonth = 31
    const allowanceSec =
      ((month.rawEstimatedIncome ?? 0) / daysInMonth) / 86400

    const update = () => {
      const t = Math.max(
        (Date.now() - startOfMonth.getTime()) / 1000,
        1
      )
      const burnSec = (month.rawExpenses ?? 0) / t
      const r = burnSec / allowanceSec
      setRpm(r)
      setPercent(Math.min(r / 2, 1))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [month])

  return (
    <div className="flex items-center justify-center h-screen">
      {month ? <SpendRpmGauge percent={percent} rpm={rpm} /> : 'Loading...'}
    </div>
  )
}
