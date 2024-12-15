'use client'

import { useState, useRef, useEffect } from 'react'
import { Page, TextItem } from 'react-pdf'

interface LiquidTextPageProps {
  pageNumber: number
}

interface TextLineProps {
  items: TextItem[]
  top: number
  scale: number
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
}

const TextLine: React.FC<TextLineProps> = ({ items, top, scale, onTouchStart, onTouchMove, onTouchEnd }) => {
  return (
    <div
      className="absolute left-0 right-0 whitespace-nowrap overflow-hidden"
      style={{
        top: `${top}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'left top',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {items.map((item, index) => (
        <span key={index} style={{ left: `${item.left}px`, fontFamily: item.fontName }}>
          {item.str}
        </span>
      ))}
    </div>
  )
}

const LiquidTextPage: React.FC<LiquidTextPageProps> = ({ pageNumber }) => {
  const [textLines, setTextLines] = useState<TextItem[][]>([])
  const [linePositions, setLinePositions] = useState<number[]>([])
  const [lineScales, setLineScales] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [activeLine, setActiveLine] = useState<number | null>(null)

  const onPageLoadSuccess = ({ textContent }: { textContent: { items: TextItem[] } }) => {
    const lines: TextItem[][] = []
    let currentLine: TextItem[] = []
    let lastY = textContent.items[0]?.transform[5] || 0

    textContent.items.forEach((item) => {
      if (Math.abs(item.transform[5] - lastY) > 1) {
        if (currentLine.length > 0) {
          lines.push(currentLine)
          currentLine = []
        }
        lastY = item.transform[5]
      }
      currentLine.push(item)
    })

    if (currentLine.length > 0) {
      lines.push(currentLine)
    }

    setTextLines(lines)
    setLinePositions(lines.map((_, index) => index * 20))
    setLineScales(new Array(lines.length).fill(1))
  }

  const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
    setActiveLine(index)
  }

  const handleTouchMove = (index: number) => (e: React.TouchEvent) => {
    if (touchStartY === null || activeLine === null) return

    const touchY = e.touches[0].clientY
    const deltaY = touchY - touchStartY

    setLinePositions((prevPositions) => {
      const newPositions = [...prevPositions]
      newPositions[index] += deltaY
      return newPositions
    })

    setTouchStartY(touchY)
  }

  const handleTouchEnd = () => {
    setTouchStartY(null)
    setActiveLine(null)
  }

  const handlePinch = (e: TouchEvent) => {
    if (e.touches.length !== 2 || activeLine === null) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY)

    setLineScales((prevScales) => {
      const newScales = [...prevScales]
      newScales[activeLine] = Math.max(0.5, Math.min(2, distance / 100))
      return newScales
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('touchmove', handlePinch)
      return () => {
        container.removeEventListener('touchmove', handlePinch)
      }
    }
  }, [activeLine])

  return (
    <div ref={containerRef} className="relative" style={{ width: '100%', height: '100%' }}>
      <Page
        pageNumber={pageNumber}
        onLoadSuccess={onPageLoadSuccess}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
      {textLines.map((line, index) => (
        <TextLine
          key={index}
          items={line}
          top={linePositions[index]}
          scale={lineScales[index]}
          onTouchStart={handleTouchStart(index)}
          onTouchMove={handleTouchMove(index)}
          onTouchEnd={handleTouchEnd}
        />
      ))}
    </div>
  )
}

export default LiquidTextPage

