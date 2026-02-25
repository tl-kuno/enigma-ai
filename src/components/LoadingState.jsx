import { useState, useEffect } from 'react'
import './LoadingState.css'

const messages = [
  'Reading the spaces between your words...',
  'Listening to what you almost said...',
  'Something true is taking form...',
  'Your Enigma has been waiting...'
]

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length)
        setFadeIn(true)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="loading-state">
      <div className="loading-message" style={{ opacity: fadeIn ? 1 : 0 }}>
        {messages[messageIndex]}
      </div>
    </div>
  )
}
