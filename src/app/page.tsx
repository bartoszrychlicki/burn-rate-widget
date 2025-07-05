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
    flowRateSecond: 0,
    flowRate: 0,
    potentialSavings: 0
  })
  const [showDetails, setShowDetails] = useState(false)

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
      
      {/* Main Flow Rate Display */}
      <div style={{ 
        fontSize: '3.5rem', 
        margin: '2rem',
        fontWeight: 'bold',
        color: data.flowRateSecond >= 0 ? '#22c55e' : '#ef4444',
        padding: '2rem',
        border: `3px solid ${data.flowRateSecond >= 0 ? '#22c55e' : '#ef4444'}`,
        borderRadius: '1rem',
        backgroundColor: data.flowRateSecond >= 0 ? '#f0fdf4' : '#fef2f2'
      }}>
        {data.flowRateSecond >= 0 ? '📈' : '📉'} {data.flowRateSecond.toFixed(8)} PLN/s
      </div>
      
      {/* Description */}
      <div style={{
        fontSize: '1.1rem',
        margin: '1rem 2rem',
        color: '#6b7280',
        fontStyle: 'italic',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.5'
      }}>
        💡 This is your cash flow indicator - when you spend money it goes down, when you don't spend it slowly grows back up 😉
      </div>
      
      {/* Savings Projection */}
      <div style={{
        fontSize: '1.3rem',
        margin: '1.5rem 2rem',
        color: data.potentialSavings >= 0 ? '#059669' : '#dc2626',
        fontWeight: 'bold',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.5'
      }}>
        🎯 At this rate, by the end of the month you'll {data.potentialSavings >= 0 ? 'save' : 'lose'}: {Math.abs(data.potentialSavings).toFixed(2)} PLN
      </div>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setShowDetails(!showDetails)}
        style={{
          fontSize: '1.2rem',
          padding: '0.75rem 1.5rem',
          margin: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }}
      >
        {showDetails ? 'Hide Stats' : 'More Stats'}
      </button>
      
      {/* Detailed Stats */}
      {showDetails && (
        <div>
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
      )}
    </div>
  )
}