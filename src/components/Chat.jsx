import { useEffect, useRef, useState } from 'react'
import './Chat.css'

export default function Chat({ messages, myName, role, onSendGuess, wordSet, winner }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSendGuess(trimmed)
    setText('')
  }

  const canGuess = role === 'guesser' && wordSet && !winner

  return (
    <div className="chat-wrapper">
      <div className="chat-header">💬 Guesses</div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">
            {wordSet ? 'Be the first to guess!' : 'Waiting for the drawer to set the word…'}
          </p>
        )}
        {messages.map(m => (
          <div key={m.id} className={`chat-msg ${m.name === myName ? 'mine' : ''}`}>
            <span className="chat-name">{m.name}</span>
            <span className="chat-text">{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {role === 'guesser' && (
        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            value={text}
            placeholder={canGuess ? 'Type your guess…' : winner ? 'Game over!' : 'Waiting for word…'}
            disabled={!canGuess}
            maxLength={80}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="chat-send-btn" disabled={!canGuess} onClick={send}>Send</button>
        </div>
      )}

      {role === 'drawer' && (
        <p className="chat-drawer-note">You are the drawer — watch the guesses roll in!</p>
      )}
    </div>
  )
}
