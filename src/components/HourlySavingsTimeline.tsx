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

  const hourMap = new Map<number, number>(stats.hourly.map((h) => [h.hour, h.avg]))
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const currentHour = new Date().getHours()

  return (
    <div className="mx-8 my-6">
      <h2 className="text-xl font-semibold mb-2">🕑 Savings by Hour</h2>
      <div className="flex items-end overflow-x-auto w-full gap-2">
        {hours.map((hour) => {
          const avg = hourMap.get(hour)
          const isNow = hour === currentHour
          return (
            <div
              key={hour}
              className={`flex-1 text-center ${isNow ? 'border-b-2 border-blue-500' : ''}`}
            >
              <div
                className={`px-2 py-1 rounded ${
                  avg === undefined
                    ? 'bg-gray-100 text-gray-400'
                    : avg >= 0
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {avg === undefined ? '-' : avg.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">{hour}:00</div>
            </div>
          )
        })}
      </div>
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
