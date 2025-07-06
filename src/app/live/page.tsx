// /src/app/live/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function LiveBurnRate() {
  const [flowRate, setFlowRate] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/month')
      const json = await res.json()
      setFlowRate(json?.flowRateMinute ?? null)
    }

    fetchData()
    const interval = setInterval(fetchData, 10000) // co 10 sekund
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontSize: '2.5rem', textAlign: 'center', marginTop: '3rem', fontFamily: 'monospace' }}>
      {flowRate !== null ? `${flowRate.toFixed(6)} PLN/s` : 'Loading...'}
    </div>
  )
}