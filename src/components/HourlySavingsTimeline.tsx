'use client'

import { useEffect, useState } from 'react'

interface HourEntry { hour: number; avg: number }
interface Stats {
  hourly: HourEntry[]
  totalToday: number
  totalYesterday: number
}

export default function HourlySavingsTimeline() {
  const [stats, setStats] = useState<Stats>({ hourly: [], totalToday: 0, totalYesterday: 0 })

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/burnrate/stats')
      if (!res.ok) throw new Error('Request failed')
      const json = await res.json()
      setStats(json)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-8 my-6">
      <div className="mt-2 text-lg">
        Total today:{' '}
        <span className={stats.totalToday >= 0 ? 'text-green-600' : 'text-red-600'}>
          {stats.totalToday.toFixed(2)} PLN
        </span>
        <span className="text-sm text-gray-500 ml-2">
          (yesterday {stats.totalYesterday.toFixed(2)} PLN)
        </span>
      </div>
    </div>
  )
}
