'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [data, setData] = useState({ burnRate: 0, incomeRate: 0, ratio: 0 })

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/')
      const json = await res.json()
      setData(json)
    }

    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ fontFamily: 'monospace', textAlign: 'center', marginTop: '4rem' }}>
      <h1>💸 Burn Rate Widget</h1>
      <div style={{ fontSize: '2rem', margin: '1rem' }}>
        🔥 Spalanie: {data.burnRate.toFixed(8)} PLN/s
      </div>
    </div>
  )
}