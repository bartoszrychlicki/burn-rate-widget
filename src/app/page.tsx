'use client'

import { useEffect, useState, useRef } from 'react'
import HourlySavingsTimeline from '../components/HourlySavingsTimeline'
import DailyChallenge from '../components/DailyChallenge'

export default function HomePage() {
  const [data, setData] = useState({
    burnRateSecond: 0,
    burnRateMinute: 0,
    burnRateHour: 0,
    earnRateSecond: 0,
    earnRateMinute: 0,
    earnRateHour: 0,
    flowRateSecond: 0,
    flowRateMinute: 0,
    flowRate: 0,
    potentialSavings: 0
  })
  const [rawData, setRawData] = useState({
    rawExpenses: 0,
    rawIncome: 0,
    rawEstimatedIncome: 0
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/month')
        if (!res.ok) throw new Error('Request failed')
        const json = await res.json()
        setRawData({
          rawExpenses: json.rawExpenses,
          rawIncome: json.rawIncome,
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

  useEffect(() => {
    const computeData = () => {
      const startOfMonth = new Date('2025-07-01T00:00:00')
      const endOfMonth = new Date('2025-07-31T23:59:59')
      const now = new Date()

      const secondsPassed = Math.floor((now.getTime() - startOfMonth.getTime()) / 1000)
      const minutesPassed = Math.floor(secondsPassed / 60)
      const hoursPassed = Math.floor(minutesPassed / 60)

      const totalSecondsInMonth = Math.floor((endOfMonth.getTime() - startOfMonth.getTime()) / 1000)
      const totalMinutesInMonth = Math.floor(totalSecondsInMonth / 60)
      const totalHoursInMonth = Math.floor(totalMinutesInMonth / 60)

      const burnRateSecond = secondsPassed > 0 ? rawData.rawExpenses / secondsPassed : 0
      const burnRateMinute = secondsPassed > 0 ? rawData.rawExpenses / (secondsPassed / 60) : 0
      const burnRateHour = hoursPassed > 0 ? rawData.rawExpenses / hoursPassed : 0

      const earnRateSecond = totalSecondsInMonth > 0 ? rawData.rawEstimatedIncome / totalSecondsInMonth : 0
      const earnRateMinute = totalMinutesInMonth > 0 ? rawData.rawEstimatedIncome / totalMinutesInMonth : 0
      const earnRateHour = totalHoursInMonth > 0 ? rawData.rawEstimatedIncome / totalHoursInMonth : 0

      const flowRateSecond = earnRateSecond - burnRateSecond
      const flowRateMinute = earnRateMinute - burnRateMinute
      const flowRate = earnRateHour - burnRateHour

      const remainingSecondsInMonth = totalSecondsInMonth - secondsPassed
      const potentialSavings = flowRateSecond * remainingSecondsInMonth

      setData({
        burnRateSecond,
        burnRateMinute,
        burnRateHour,
        earnRateSecond,
        earnRateMinute,
        earnRateHour,
        flowRateSecond,
        flowRateMinute,
        flowRate,
        potentialSavings
      })
    }

    computeData()
    const interval = setInterval(computeData, 1000)
    return () => clearInterval(interval)
  }, [rawData])

  // Store current flow rate each minute
  const flowRef = useRef(0)
  useEffect(() => {
    flowRef.current = data.flowRateMinute
  }, [data.flowRateMinute])

  useEffect(() => {
    const send = () => {
      fetch('/api/burnrate/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: flowRef.current })
      })
    }
    send()
    const interval = setInterval(send, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="font-mono text-center mt-16">
      
      {/* Main Flow Rate Display */}
      <div className={`
        text-6xl font-bold mx-8 my-8 p-8 border-3 rounded-2xl
        ${data.flowRateMinute >= 0 
          ? 'text-green-600 border-green-600 bg-green-50' 
          : 'text-red-500 border-red-500 bg-red-50'
        }
      `}>
        I'm saving {data.flowRateMinute.toFixed(6)} PLN/min
      </div>
      
      {/* Description */}
      <div className="text-lg mx-8 my-4 text-gray-500 italic max-w-2xl mx-auto leading-relaxed">
      </div>
      
      {/* Savings Projection */}
      <div className={`
        text-xl mx-8 my-6 font-bold max-w-2xl mx-auto leading-relaxed
        ${data.potentialSavings >= 0 ? 'text-emerald-700' : 'text-red-700'}
      `}>
        🎯 At this rate, by the end of the month you'll {data.potentialSavings >= 0 ? 'save' : 'lose'}: {Math.abs(data.potentialSavings).toFixed(2)} PLN
      </div>

      <HourlySavingsTimeline />

      <DailyChallenge />
      
      {/* Toggle Button */}
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-lg px-6 py-3 m-4 bg-blue-500 text-white border-none rounded-lg cursor-pointer font-mono hover:bg-blue-600 transition-colors"
      >
        {showDetails ? 'Hide Stats' : 'More Stats'}
      </button>
      
      {/* Detailed Stats */}
      {showDetails && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            
            {/* Burn Rate Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔥 Burn Rates</h3>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Second</p>
                    <p className="text-2xl font-bold text-red-600">{data.burnRateSecond.toFixed(8)}</p>
                    <p className="text-sm text-gray-500">PLN/s</p>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Minute</p>
                    <p className="text-2xl font-bold text-red-600">{data.burnRateMinute.toFixed(8)}</p>
                    <p className="text-sm text-gray-500">PLN/min</p>
                  </div>
                  <div className="text-3xl">⏱️</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Hour</p>
                    <p className="text-2xl font-bold text-red-600">{data.burnRateHour.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">PLN/h</p>
                  </div>
                  <div className="text-3xl">🕒</div>
                </div>
              </div>
            </div>
            
            {/* Earn Rate Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Earn Rates</h3>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Second</p>
                    <p className="text-2xl font-bold text-green-600">{data.earnRateSecond.toFixed(8)}</p>
                    <p className="text-sm text-gray-500">PLN/s</p>
                  </div>
                  <div className="text-3xl">💎</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Minute</p>
                    <p className="text-2xl font-bold text-green-600">{data.earnRateMinute.toFixed(8)}</p>
                    <p className="text-sm text-gray-500">PLN/min</p>
                  </div>
                  <div className="text-3xl">⏱️</div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Per Hour</p>
                    <p className="text-2xl font-bold text-green-600">{data.earnRateHour.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">PLN/h</p>
                  </div>
                  <div className="text-3xl">🕒</div>
                </div>
              </div>
            </div>
            
            {/* Cash Flow Section - Larger card spanning full height */}
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Cash Flow Summary</h3>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 h-full hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {data.flowRate >= 0 ? '📈' : '📉'}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Hourly Cash Flow</h4>
                  <p className={`text-3xl font-bold mb-2 ${data.flowRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {data.flowRate.toFixed(2)} PLN/h
                  </p>
                  <p className="text-sm text-gray-600">
                    {data.flowRate >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Additional Metrics - Full width row */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">🎯 Monthly Projection</h4>
                      <p className={`text-2xl font-bold ${data.potentialSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {data.potentialSavings >= 0 ? '+' : ''}{data.potentialSavings.toFixed(2)} PLN
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.potentialSavings >= 0 ? 'Potential savings' : 'Potential loss'} by month end
                      </p>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">⚖️ Net Flow Rate</h4>
                      <p className={`text-2xl font-bold ${data.flowRateMinute >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {data.flowRateMinute >= 0 ? '+' : ''}{data.flowRateMinute.toFixed(6)} PLN/min
                      </p>
                      <p className="text-sm text-gray-600">
                        Current net cash flow per minute
                      </p>
                    </div>
                    <div className="text-4xl">⚖️</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
