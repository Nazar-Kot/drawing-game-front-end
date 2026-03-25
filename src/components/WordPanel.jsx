import { useState } from 'react'
import './WordPanel.css'

export default function WordPanel({ onSetWord, wordSet, winner }) {
  const [word, setWord] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSet = () => {
    if (!word.trim()) return
    onSetWord(word.trim())
    setSubmitted(true)
  }

  if (winner) {
    return (
      <div className="word-panel word-panel--info">
        🏆 The word was <strong>"{winner.word}"</strong>
      </div>
    )
  }

  if (submitted && wordSet) {
    return (
      <div className="word-panel word-panel--set">
        ✅ Secret word is set — wait for a correct guess!
        <button
          className="word-change-btn"
          onClick={() => { setSubmitted(false); setWord('') }}
        >
          Change word
        </button>
      </div>
    )
  }

  return (
    <div className="word-panel">
      <label className="word-label">Secret word (hidden from guessers)</label>
      <div className="word-row">
        <input
          type="password"
          className="word-input"
          value={word}
          placeholder="Enter secret word…"
          maxLength={40}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSet()}
        />
        <button className="word-set-btn" onClick={handleSet} disabled={!word.trim()}>
          Set Word
        </button>
      </div>
    </div>
  )
}
