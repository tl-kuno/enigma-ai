# Enigma

**Answer five questions. Discover the creature that knows you.**

Enigma is an AI-powered personality experience that listens to both what you say *and how you move*. It captures behavioral signals—keystroke rhythm, hesitation, what you delete—alongside explicit answers, then uses Claude Opus to generate a uniquely resonant creature-based identity card.

## The Insight

Most personality tools ask what you think about yourself. Enigma listens to what you *actually do* while answering. The gap between conscious self-concept and behavioral truth is where the magic lives.

## How It Works

1. **Five whimsical questions** capture orientation, structure, self-concept, perception, and inner energy
2. **Audit trail** logs every keystroke, drag, hover, and timing signal as you answer
3. **Claude Sonnet** receives the full behavioral stream and generates one creature-based reading
4. **DALL-E 3** renders the creature in a painterly scene
5. **Reveal card** shows creature name, tagline, reading, and AI partnership style

The whole experience happens in ~8-15 seconds, with image generation parallelized while Claude writes.

## Tech Stack

- **Frontend:** React 19 + Vite
- **AI Inference:** Claude Sonnet (or Opus) via Anthropic API
- **Image Generation:** DALL-E 3 via OpenAI API
- **Deployment:** Vercel (Edge Functions for API proxying)
- **Drag-to-rank:** @dnd-kit

## Local Development

### Setup

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...
```

(During dev, Vite's dev proxy forwards requests to the real APIs. Keys are only used in dev; production uses serverless functions.)

### Run

```bash
npm run dev
```

Open `http://localhost:5173` and answer the five questions. You'll see:
- Real-time audit trail logging in the console
- Rotating loading messages during Claude inference
- Creature reveal with generated image

## Project Structure

```
src/
├── App.jsx                    # State machine: quiz → loading → reveal
├── enigmaApi.js              # API layer (with dev/prod routing)
├── systemPrompt.js           # Claude system prompt (exact from spec)
├── components/
│   ├── QuizFlow.jsx          # Landing + all 5 question types
│   ├── LandingPage.jsx       # Entry screen with hover logging
│   ├── MultipleChoiceCard.jsx # Q1, Q2 tap-to-select
│   ├── DragToRank.jsx        # Q3 drag-to-rank (Feel/Think/Make/Move)
│   ├── OpenEndedTextarea.jsx # Q4, Q5 with keystroke capture
│   ├── LoadingState.jsx      # Rotating messages during API call
│   ├── RevealCard.jsx        # Final creature card display
│   └── FollowUpQuestion.jsx  # If Claude needs one more question
│   └── SortableItem.jsx      # Drag-to-rank item component
├── auditLogger.js            # Event logging with relative timestamps
└── App.css                   # Dark theme + global styles

api/                          # Vercel serverless functions
├── anthropic.js             # Edge function proxying to Anthropic
└── openai.js                # Edge function proxying to OpenAI

docs/                         # Design & specification
├── 01-project-overview.md
├── 02-system-prompt.md
├── 03-questions.md
└── 04-agent-prompts.md
```

## Key Features

### Behavioral Signal Capture

Every interaction is timestamped and logged:
- `landing_hover` — what explores before diving in
- `question_start` / `question_answer` — commitment to choice
- `question_answer_change` — self-awareness in action
- `drag_start` / `drag_reorder` / `drag_complete` — how settled you are in self-concept
- `keydown` (with key content) — typing rhythm and what almost was
- `backspace_hold` — self-censoring and deleted thoughts
- `paste` / `cut` / `select_all` — editing patterns

### Streaming + Parallel DALL-E

Claude's response streams via SSE. The moment `image_prompt` is detected mid-stream, DALL-E fires immediately. By the time Claude finishes the reading, the image is almost always ready.

### Follow-up Questions

If Claude detects insufficient data, it asks one deeply specific follow-up question (not generic, genuinely curious) before proceeding to the full reading.

### Two-Column Reveal

Left: creature name, tagline, AI-generated image
Right: 2-sentence reading + AI partnership style (how to work together)

## API Integration

### Development

Vite dev server proxies:
- `POST /api/anthropic/v1/messages` → `https://api.anthropic.com/v1/messages`
- `POST /api/openai/v1/images/generations` → `https://api.openai.com/v1/images/generations`

API keys are read from `.env` as `VITE_*`. Safe for local development only.

### Production (Vercel)

Serverless Edge Functions at `api/` intercept requests:
- `/api/anthropic` → proxies to Anthropic (uses `ANTHROPIC_API_KEY` from Vercel env)
- `/api/openai` → proxies to OpenAI (uses `OPENAI_API_KEY` from Vercel env)

API keys never leave the server. Frontend only knows endpoint URLs.

## Deployment

### To Vercel

1. Push code to GitHub
2. Import repo in Vercel dashboard
3. Add environment variables:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `OPENAI_API_KEY` = your OpenAI API key
4. Deploy

Vite will auto-build to `dist/`. Vercel serves the static SPA + serverless functions.

### Build Locally

```bash
npm run build
```

Outputs to `dist/`. Vercel automatically serves this on deployment.

## System Prompt

The Claude system prompt is carefully engineered to:
1. Find the most interesting **divergence** between what you said and how you moved
2. Choose a **creature** that embodies your strength (behavioral truth + delight)
3. Write a **reading** that feels eerie and specific without listing traits
4. Provide **AI partnership style** — concrete ways to work together tomorrow

See `docs/02-system-prompt.md` for the full prompt and guidelines.

## Questions

The five questions are designed to capture different dimensions:

- **Q1** (City exploration) — Orientation and approach to novelty
- **Q2** (Recipe adaptation) — How you handle constraint and improvisation
- **Q3** (Feel/Think/Make/Move ranking) — Self-concept hierarchy
- **Q4** (What you stop for) — What captures your attention
- **Q5** (Energy as sound) — Inner quality and rhythm

See `docs/03-questions.md` for full definitions and answer options.

## Performance

- **Claude Sonnet:** ~5-8 seconds
- **DALL-E 3:** ~10-15 seconds
- **Parallel execution:** Image loads while Claude finishes → ~12-20 seconds total

On slower networks, the rotating loading messages buy time without feeling like a wait.

## Future Enhancements

- Persistence: save enigmas to user profile
- Sharing: shareable enigma cards with images
- Theme variation: different creature palettes based on vibe
- Streaming text reveal: animate the reading as it arrives
- Multiple reads: see how your enigma shifts over time

## Contributing

This was built for a hackathon. The code is modular — each component and API function is self-contained. To extend:

1. New question types? Add to `components/` and wire into `QuizFlow.jsx`
2. Different Claude model? Update `src/enigmaApi.js`
3. UI tweaks? Components have individual CSS files
4. System prompt refinement? Edit `src/systemPrompt.js`

## License

Built with curiosity and attention. Use it to make people feel real to themselves.

---

**Discovered by:** Claude + Taylor, Feb 2026
**Witnessed by:** Honey Badger, Seed-Catching Wren, Great Blue Heron, Roadside Comet

