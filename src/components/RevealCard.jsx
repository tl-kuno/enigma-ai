import './RevealCard.css'

export default function RevealCard({ enigma, imageUrl }) {
  return (
    <div className="reveal-card">
      <div className="reveal-content">
        <div className="reveal-columns">
          <div className="reveal-left">
            <div className="creature-header">
              <h1 className="creature-name">{enigma.creature_name}</h1>
              <p className="tagline">{enigma.tagline}</p>
            </div>

            {imageUrl && (
              <div className="image-container">
                <img src={imageUrl} alt={enigma.creature_name} className="creature-image" />
              </div>
            )}
          </div>

          <div className="reveal-right">
            <div className="reading-section">
              <p className="reading">{enigma.reading}</p>
            </div>

            <div className="divider"></div>

            <div className="partnership-section">
              <p className="ai-partnership-style">{enigma.ai_partnership_style}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
