import { useState } from 'react'
import './FollowUpQuestion.css'

export default function FollowUpQuestion({ question, onSubmit }) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(answer)
  }

  return (
    <div className="followup-container">
      <div className="followup-content">
        <h2 className="followup-heading">One more thing...</h2>
        <p className="followup-question">{question}</p>
        
        <form onSubmit={handleSubmit} className="followup-form">
          <textarea
            className="followup-textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type anything..."
            autoFocus
          />
          <button type="submit" className="followup-button">
            Complete my Enigma →
          </button>
        </form>
      </div>
    </div>
  )
}
