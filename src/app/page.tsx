'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [data, setData] = useState({ 
    burnRateSecond: 0, 
    burnRateMinute: 0, 
    burnRateHour: 0,
    earnRateSecond: 0,
    earnRateMinute: 0,
    earnRateHour: 0,
    flowRate: 0
  })

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
        🔥 Burn Rate per Second: {data.burnRateSecond.toFixed(8)} PLN/s
      </div>
      <div style={{ fontSize: '2rem', margin: '1rem' }}>
        ⏱️ Burn Rate per Minute: {data.burnRateMinute.toFixed(4)} PLN/min
      </div>
      <div style={{ fontSize: '2rem', margin: '1rem' }}>
        🕒 Burn Rate per Hour: {data.burnRateHour.toFixed(2)} PLN/h
      </div>
      
      <div style={{ fontSize: '2rem', margin: '1rem', marginTop: '3rem' }}>
        💰 Earn Rate per Second: {data.earnRateSecond.toFixed(8)} PLN/s
      </div>
      <div style={{ fontSize: '2rem', margin: '1rem' }}>
        ⏱️ Earn Rate per Minute: {data.earnRateMinute.toFixed(4)} PLN/min
      </div>
      <div style={{ fontSize: '2rem', margin: '1rem' }}>
        🕒 Earn Rate per Hour: {data.earnRateHour.toFixed(2)} PLN/h
      </div>
      
      <div style={{ 
        fontSize: '2.5rem', 
        margin: '2rem', 
        marginTop: '3rem',
        fontWeight: 'bold',
        color: data.flowRate >= 0 ? '#22c55e' : '#ef4444'
      }}>
        {data.flowRate >= 0 ? '📈' : '📉'} Cash Flow per Hour: {data.flowRate.toFixed(2)} PLN/h
      </div>
    </div>
  )
}