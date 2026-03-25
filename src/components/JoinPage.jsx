import { useState } from 'react'
import './JoinPage.css'

export default function JoinPage({ onJoin, error, connecting }) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  const validate = () => {
    if (!name.trim()) {
      setNameError('Please enter your name.')
      return false
    }
    setNameError('')
    return true
  }

  const handleJoin = (role) => {
    if (!validate()) return
    onJoin(name.trim(), role)
  }

  return (
    <div className="join-wrapper">
      <div className="join-card">
        <div className="join-logo">🎨</div>
        <h1 className="join-title">Drawing Game</h1>
        <p className="join-sub">Guess the drawing — or be the artist!</p>

        <div className="join-field">
          <label htmlFor="playerName">Your name</label>
          <input
            id="playerName"
            type="text"
            value={name}
            placeholder="e.g. Alice"
            maxLength={24}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin('guesser')}
          />
          {nameError && <span className="field-error">{nameError}</span>}
        </div>

        {connecting && <p className="join-status">Connecting to server…</p>}
        {error && <p className="join-error">{error}</p>}

        <div className="join-buttons">
          <button
            className="btn btn-drawer"
            disabled={connecting}
            onClick={() => handleJoin('drawer')}
          >
            ✏️ Join as Drawer
            <span className="btn-hint">You draw &amp; set the word</span>
          </button>

          <button
            className="btn btn-guesser"
            disabled={connecting}
            onClick={() => handleJoin('guesser')}
          >
            💬 Join as Guesser
            <span className="btn-hint">You watch &amp; guess</span>
          </button>
        </div>
      </div>
    </div>
  )
}
