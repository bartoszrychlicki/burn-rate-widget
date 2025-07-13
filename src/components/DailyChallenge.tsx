'use client'
import { useEffect, useState } from 'react'

interface ChallengeData {
  challengeLimit: number
  spentToday: number
  spentYesterday: number
}

export default function DailyChallenge() {
  const [data, setData] = useState<ChallengeData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/challenge')
        if (!res.ok) throw new Error('Request failed')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return <div>Loading challenge...</div>

  const progress = Math.min((data.spentToday / data.challengeLimit) * 100, 100)

  return (
    <div className="mt-8 mx-8 p-4 rounded-xl border border-blue-200 bg-blue-50 text-gray-800">
      <div className="font-semibold mb-2">
        Wyzwanie: wydaj dziś nie więcej niż {data.challengeLimit.toFixed(2)} PLN
      </div>
      <div className="mb-2 text-sm">Wydane dziś: {data.spentToday.toFixed(2)} PLN</div>
      <div className="w-full bg-gray-200 h-4 rounded">
        <div
          className="h-4 bg-green-500 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
