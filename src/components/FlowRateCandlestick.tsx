'use client'

import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeriesOptions } from 'lightweight-charts'

interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
}

export default function FlowRateCandlestick() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
    })
    const series = chartRef.current.addCandlestickSeries({} as CandlestickSeriesOptions)

    const fetchData = async () => {
      try {
        const res = await fetch('/api/burnrate/history')
        if (!res.ok) throw new Error('Request failed')
        const json = await res.json()
        const data = (json.candles as Candle[]).map(c => ({
          time: c.timestamp / 1000,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
        series.setData(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartRef.current?.remove()
    }
  }, [])

  return <div ref={containerRef} />
}
