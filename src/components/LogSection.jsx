import { useEffect, useRef } from 'react'
import './LogSection.css'

export default function LogSection({ logs }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="log-wrapper">
      <div className="log-header">📋 Game Log</div>
      <div className="log-list">
        {logs.map(entry => (
          <div key={entry.id} className="log-entry">
            <span className="log-ts">{entry.ts}</span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
