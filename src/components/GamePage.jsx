import DrawingCanvas from './DrawingCanvas'
import Chat from './Chat'
import LogSection from './LogSection'
import WordPanel from './WordPanel'
import WinnerOverlay from './WinnerOverlay'
import './GamePage.css'

export default function GamePage({
  role,
  myName,
  wordSet,
  winner,
  logs,
  messages,
  drawingSegments,
  clearSignal,
  onSendDrawing,
  onClearCanvas,
  onSetWord,
  onSendGuess,
}) {
  const isDrawer = role === 'drawer'

  return (
    <div className="game-root">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="game-header">
        <div className="game-header-logo">🎨 Drawing Game</div>
        <div className="game-header-info">
          {isDrawer
            ? <span className="badge badge-drawer">✏️ Drawer — {myName}</span>
            : <span className="badge badge-guesser">💬 Guesser — {myName}</span>
          }
          {wordSet && !winner && <span className="badge badge-active">Game in progress</span>}
          {!wordSet && isDrawer && <span className="badge badge-waiting">Set your word to start</span>}
          {!wordSet && !isDrawer && <span className="badge badge-waiting">Waiting for word…</span>}
        </div>
      </header>

      {/* ── Word panel (drawer only) ──────────────────────────────────────── */}
      {isDrawer && (
        <div className="word-panel-bar">
          <WordPanel onSetWord={onSetWord} wordSet={wordSet} winner={winner} />
        </div>
      )}

      {/* ── Main split layout ────────────────────────────────────────────── */}
      <main className="game-main">
        {/* Left — canvas */}
        <section className="game-left">
          <DrawingCanvas
            isDrawer={isDrawer}
            onSendDrawing={onSendDrawing}
            onClearCanvas={onClearCanvas}
            segments={drawingSegments}
            clearSignal={clearSignal}
          />
        </section>

        {/* Right — chat + log */}
        <section className="game-right">
          <Chat
            messages={messages}
            myName={myName}
            role={role}
            onSendGuess={onSendGuess}
            wordSet={wordSet}
            winner={winner}
          />
          <LogSection logs={logs} />
        </section>
      </main>

      {/* ── Winner overlay ───────────────────────────────────────────────── */}
      <WinnerOverlay winner={winner} />
    </div>
  )
}
