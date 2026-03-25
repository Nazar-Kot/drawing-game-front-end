import { useState, useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import JoinPage from './components/JoinPage'
import GamePage from './components/GamePage'
import './App.css'

const HUB_URL = (import.meta.env.VITE_HUB_URL ?? 'http://localhost:5157') + '/hub/drawing'

export default function App() {
  // ── Connection ────────────────────────────────────────────────────────────
  const connectionRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

  // ── Pending join (waiting for connection before sending join message) ──────
  const pendingJoinRef = useRef(null)

  // ── User / role ───────────────────────────────────────────────────────────
  const [joined, setJoined]   = useState(false)   // entered the game
  const [role, setRole]       = useState(null)     // 'drawer' | 'guesser'
  const [myName, setMyName]   = useState('')

  // ── Game state ────────────────────────────────────────────────────────────
  const [wordSet, setWordSet]           = useState(false)
  const [winner, setWinner]             = useState(null)   // { name, word }
  const [logs, setLogs]                 = useState([])
  const [messages, setMessages]         = useState([])
  const [drawingSegments, setDrawingSegments] = useState([])
  const [clearSignal, setClearSignal]   = useState(0)

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addLog = useCallback((text) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, ts: new Date().toLocaleTimeString() }])
  }, [])

  console.log(`Connecting to SignalR hub at ${import.meta.env.VITE_HUB_URL}...`);

  // ── Build and start SignalR connection once ───────────────────────────────
  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build()

    // ── Server → Client handlers ───────────────────────────────────────────

    conn.on('JoinedAsDrawer', (name) => {
      setMyName(name)
      setRole('drawer')
      setJoined(true)
      addLog(`You joined as the Drawer.`)
    })

    conn.on('JoinedAsGuesser', (name) => {
      setMyName(name)
      setRole('guesser')
      setJoined(true)
      addLog(`You joined as a Guesser.`)
    })

    conn.on('UserJoined', (name, userRole) => {
      addLog(`${name} joined as ${userRole}.`)
    })

    conn.on('UserLeft', (name) => {
      addLog(`${name} left the game.`)
    })

    conn.on('WordConfirmed', () => {
      setWordSet(true)
      addLog('You set the secret word. The game is on!')
    })

    conn.on('WordWasSet', () => {
      setWordSet(true)
      addLog('The drawer has set the secret word. Start guessing!')
    })

    conn.on('DrawingReceived', (segment) => {
      setDrawingSegments(prev => [...prev, segment])
    })

    conn.on('CanvasCleared', () => {
      setDrawingSegments([])
      setClearSignal(s => s + 1)
      addLog('Canvas was cleared by the drawer.')
    })

    conn.on('GuessReceived', (name, message, userRole) => {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), name, text: message, userRole }])
    })

    conn.on('WordGuessed', (winnerName, word) => {
      setWinner({ name: winnerName, word })
      addLog(`🎉 ${winnerName} guessed the word "${word}"! Game over!`)
    })

    conn.on('AdminDisconnected', () => {
      addLog('The drawer disconnected. Game ended.')
      setJoined(false)
      setRole(null)
      setMyName('')
      setWordSet(false)
      setWinner(null)
      setMessages([])
      setDrawingSegments([])
    })

    conn.on('Error', (msg) => {
      setConnectionError(msg)
    })

    connectionRef.current = conn

    conn.start()
      .then(() => {
        setConnected(true)
        setConnectionError(null)
        // If join was requested before connection was ready, send it now
        if (pendingJoinRef.current) {
          const { name, joinRole } = pendingJoinRef.current
          pendingJoinRef.current = null
          if (joinRole === 'drawer') conn.invoke('JoinAsDrawer', name).catch(console.error)
          else conn.invoke('JoinAsGuesser', name).catch(console.error)
        }
      })
      .catch(err => {
        setConnectionError('Cannot connect to the game server. Make sure the backend is running.')
        console.error(err)
      })

    conn.onreconnected(() => {
      setConnected(true)
      setConnectionError(null)
      addLog('Reconnected to server.')
    })

    conn.onreconnecting(() => {
      setConnectionError('Connection lost — reconnecting…')
    })

    return () => { conn.stop() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Join handlers (called from JoinPage) ─────────────────────────────────
  const handleJoin = useCallback((name, joinRole) => {
    const conn = connectionRef.current
    if (!conn) return
    if (conn.state === signalR.HubConnectionState.Connected) {
      if (joinRole === 'drawer') conn.invoke('JoinAsDrawer', name).catch(console.error)
      else conn.invoke('JoinAsGuesser', name).catch(console.error)
    } else {
      // Queue for when connection is ready
      pendingJoinRef.current = { name, joinRole }
    }
  }, [])

  // ── Game actions (passed down to GamePage) ────────────────────────────────
  const sendDrawing  = useCallback((segment) => connectionRef.current?.invoke('SendDrawing', segment).catch(console.error), [])
  const clearCanvas  = useCallback(() => connectionRef.current?.invoke('ClearCanvas').catch(console.error), [])
  const setSecretWord = useCallback((word) => connectionRef.current?.invoke('SetWord', word).catch(console.error), [])
  const sendGuess    = useCallback((msg) => connectionRef.current?.invoke('SendGuess', msg).catch(console.error), [])

  // ── Render ────────────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <JoinPage
        onJoin={handleJoin}
        error={connectionError}
        connecting={!connected}
      />
    )
  }

  return (
    <GamePage
      role={role}
      myName={myName}
      wordSet={wordSet}
      winner={winner}
      logs={logs}
      messages={messages}
      drawingSegments={drawingSegments}
      clearSignal={clearSignal}
      onSendDrawing={sendDrawing}
      onClearCanvas={clearCanvas}
      onSetWord={setSecretWord}
      onSendGuess={sendGuess}
    />
  )
}
