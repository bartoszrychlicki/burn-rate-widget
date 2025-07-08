'use client'

import { useEffect, useState } from 'react'

interface HourEntry { hour: number; avg: number }
interface Stats { hourly: HourEntry[]; totalToday: number; totalYesterday: number }

export default function HourlySavingsTimeline() {
  const [stats, setStats] = useState<Stats>({ hourly: [], totalToday: 0, totalYesterday: 0 })

  const fetchStats = async () => {
    const res = await fetch('/api/burnrate/stats')
    const json = await res.json()
    setStats(json)
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-8 my-6">
      <h2 className="text-xl font-semibold mb-2">🕑 Savings by Hour</h2>
      <div className="flex items-end space-x-2 overflow-x-auto">
        {stats.hourly.map((h) => (
          <div key={h.hour} className="text-center">
            <div className={`px-2 py-1 rounded ${h.avg >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {h.avg.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{h.hour}:00</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-lg">
        Total today: <span className={stats.totalToday >= 0 ? 'text-green-600' : 'text-red-600'}>{stats.totalToday.toFixed(2)} PLN</span>
        <span className="text-sm text-gray-500 ml-2">(yesterday {stats.totalYesterday.toFixed(2)} PLN)</span>
      </div>
    </div>
  )
}
