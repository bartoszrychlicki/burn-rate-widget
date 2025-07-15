import React from 'react'

interface Props {
  percent: number // 0..1
  rpm: number
}

export default function SpendRpmGauge({ percent, rpm }: Props) {
  const angle = -90 + percent * 180
  const color = rpm > 1.3 ? '#dc2626' : rpm > 1 ? '#fbbf24' : '#16a34a'

  return (
    <div className="relative w-64 h-32">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
      </svg>
      <div
        className="absolute bottom-0 left-1/2"
        style={{
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformOrigin: 'bottom center'
        }}
      >
        <div style={{ width: 2, height: 45, backgroundColor: color }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 text-center font-mono text-xl mt-2">
        {rpm.toFixed(2)}x
      </div>
    </div>
  )
}
