import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}

interface ContextLinesProps {
  points: Point[]
  color?: string
}

export function ContextLines({ points, color = '#3b82f6' }: ContextLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw curved lines connecting points
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        const prevPoint = points[index - 1]
        const midX = (prevPoint.x + point.x) / 2
        ctx.quadraticCurveTo(midX, prevPoint.y, point.x, point.y)
      }
    })

    ctx.stroke()
  }, [points, color])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

