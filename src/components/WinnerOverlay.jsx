import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import './WinnerOverlay.css'

export default function WinnerOverlay({ winner }) {
  useEffect(() => {
    if (!winner) return

    // Fire confetti
    const duration = 4000
    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [winner])

  if (!winner) return null

  return (
    <div className="winner-overlay">
      <div className="winner-card">
        <div className="winner-emoji">🎉</div>
        <h2 className="winner-title">{winner.name} wins!</h2>
        <p className="winner-word">The word was <strong>"{winner.word}"</strong></p>
        <p className="winner-sub">Refresh the page to play again.</p>
      </div>
    </div>
  )
}
