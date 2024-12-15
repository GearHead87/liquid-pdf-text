interface HighlightProps {
    position: { top: number; left: number; width: number; height: number }
    scale: number
    isActive: boolean
  }
  
  export function Highlight({ position, scale, isActive }: HighlightProps) {
    const style = {
      position: 'absolute' as const,
      top: position.top * scale,
      left: position.left * scale,
      width: position.width * scale,
      height: position.height * scale,
      backgroundColor: isActive ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 255, 0, 0.3)',
      pointerEvents: 'none' as const,
      transition: 'background-color 0.3s ease',
    }
  
    return <div style={style} />
  }
  
  