'use client'

import { useEffect, useState } from 'react'

interface WaveformProps {
  isActive: boolean
  mode?: 'listening' | 'speaking' | 'idle'
  barCount?: number
}

export default function Waveform({ isActive, mode = 'idle', barCount = 20 }: WaveformProps) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(4))

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(4))
      return
    }

    const interval = setInterval(() => {
      setHeights(prev =>
        prev.map((_, i) => {
          // Center bars are taller — natural waveform shape
          const centerFactor = 1 - Math.abs((i - barCount / 2) / (barCount / 2)) * 0.4
          const base = mode === 'listening' ? 8 : 12
          const amplitude = mode === 'listening' ? 20 : 28
          return base + Math.random() * amplitude * centerFactor
        })
      )
    }, 80)

    return () => clearInterval(interval)
  }, [isActive, mode, barCount])

  const getColor = () => {
    if (mode === 'listening') return '#00d4ff'
    if (mode === 'speaking') return '#00ff88'
    return '#4a6080'
  }

  const color = getColor()

  return (
    <div className="flex items-center gap-[3px]" style={{ height: '48px' }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${isActive ? h : 4}px`,
            borderRadius: '2px',
            background: isActive
              ? `linear-gradient(to top, ${color}, ${color}88)`
              : 'rgba(0,212,255,0.15)',
            boxShadow: isActive ? `0 0 6px ${color}88` : 'none',
            transition: 'height 0.08s ease, box-shadow 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
