import { useRef, useEffect, useCallback, useState } from 'react'
import './DrawingCanvas.css'

const COLORS = ['#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff']
const SIZES  = [3, 7, 14, 24]

export default function DrawingCanvas({
  isDrawer,
  onSendDrawing,
  onClearCanvas,
  segments,      // new segments to render (guesser side)
  clearSignal,
}) {
  const canvasRef  = useRef(null)
  const drawing    = useRef(false)
  const lastPos    = useRef({ x: 0, y: 0 })
  const [color, setColor] = useState('#000000')
  const [size, setSize]   = useState(7)

  // ── Draw a single segment onto the canvas ─────────────────────────────────
  const drawSegment = useCallback((ctx, seg) => {
    if (seg.type === 'clear') {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      return
    }
    ctx.beginPath()
    ctx.moveTo(seg.x0, seg.y0)
    ctx.lineTo(seg.x1, seg.y1)
    ctx.strokeStyle = seg.color
    ctx.lineWidth   = seg.size
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
  }, [])

  // ── React to incoming segments (guesser) ─────────────────────────────────
  useEffect(() => {
    if (!segments || segments.length === 0) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const seg = segments[segments.length - 1]
    drawSegment(ctx, seg)
  }, [segments, drawSegment])

  // ── React to clear signal ─────────────────────────────────────────────────
  useEffect(() => {
    if (clearSignal === 0) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }, [clearSignal])

  // ── Pointer helpers ───────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    }
  }

  const startDraw = useCallback((e) => {
    if (!isDrawer) return
    e.preventDefault()
    drawing.current = true
    const pos = getPos(e, canvasRef.current)
    lastPos.current = pos
  }, [isDrawer])

  const doDraw = useCallback((e) => {
    if (!isDrawer || !drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    const seg = {
      type: 'draw',
      x0: lastPos.current.x, y0: lastPos.current.y,
      x1: pos.x,             y1: pos.y,
      color, size,
    }
    drawSegment(ctx, seg)
    onSendDrawing(seg)
    lastPos.current = pos
  }, [isDrawer, color, size, drawSegment, onSendDrawing])

  const stopDraw = useCallback(() => { drawing.current = false }, [])

  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    onClearCanvas()
  }

  return (
    <div className="canvas-wrapper">
      {isDrawer && (
        <div className="toolbar">
          <div className="color-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${c === color ? 'active' : ''}`}
                style={{ background: c, border: c === '#ffffff' ? '2px solid #ccc' : undefined }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="size-row">
            {SIZES.map(s => (
              <button
                key={s}
                className={`size-btn ${s === size ? 'active' : ''}`}
                onClick={() => setSize(s)}
                title={`${s}px`}
              >
                <span style={{ width: s, height: s, background: '#333', borderRadius: '50%', display:'inline-block' }} />
              </button>
            ))}
            <button className="clear-btn" onClick={handleClear} title="Clear canvas">🗑</button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`drawing-canvas ${isDrawer ? 'drawable' : ''}`}
        width={800}
        height={550}
        onMouseDown={startDraw}
        onMouseMove={doDraw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={doDraw}
        onTouchEnd={stopDraw}
      />
    </div>
  )
}
