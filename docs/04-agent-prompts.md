# ENIGMA — Agent Starting Prompts

Four focused briefs. Launch Agent 1 and Agent 3 simultaneously.
Launch Agent 2 once Vite is confirmed running.
Launch Agent 4 last to wire everything together.

---

## AGENT 1 — Quiz UI + Audit Trail

Paste this to start:

---

You are building the quiz interface for a web app called Enigma. This is a React (Vite) project. Your job is to build the complete interactive quiz experience with full behavioral event logging.

**What to build:**

1. A `logEvent(type, value)` function that appends to an audit trail array in state. Every event has `{ type, timestamp, value? }` where timestamp is ms since `landing_load` (set to 0).

2. A landing page with:
   - Hero text: "You've been using AI. You haven't met it yet."
   - Subheading: "Five questions. One revelation."
   - Button: "Begin →"
   - Fine print: "No wrong answers. Just yours."
   - Log: `landing_load` on mount, `landing_hover` on hover of hero/subtitle/fine_print, `begin_click` on button tap

3. Q1 and Q2 — tap-to-select card components:
   - Single selection, tapping another deselects
   - Log `question_start` when question appears
   - Log `question_answer` with full question and answer text on selection
   - Log `question_answer_change` with from/to full text if answer changes

4. Q3 — drag to rank:
   - Four draggable items: Feel, Think, Make, Move
   - Log `drag_start`, `drag_drop`, `drag_reorder`, `drag_complete`
   - `drag_complete` value includes full question text and final order array

5. Q4 and Q5 — open ended textareas:
   - Log `question_start` when question appears
   - Log `keydown` on every keypress (timestamp only)
   - Log `backspace_hold` with `{ duration_ms }` when backspace held >500ms
   - Log `paste` with pasted text value
   - Log `cut`, `select_all` as bare events
   - Log `open_ended_final` with full question text and final answer text on advance
   - Advance button text: "See your Enigma →" on Q5

6. Log `submit` event when final submit fires, then call `onSubmit(auditTrail, answers)` prop

**Component output:** Export a `<QuizFlow onSubmit={fn} />` component that calls onSubmit with the complete audit trail array and a structured answers object.

**Answers object shape:**
```json
{
  "multipleChoiceAnswers": {
    "q1": { "question": "...", "answer": "..." },
    "q2": { "question": "...", "answer": "..." }
  },
  "dragRankResult": { "question": "...", "order": [...] },
  "openEndedResponses": {
    "q4": { "question": "...", "answer": "..." },
    "q5": { "question": "...", "answer": "..." }
  }
}
```

**Question text strings to use exactly:**

Q1: "You have one hour in a city you've never been to. What do you do first?"
Q1 options: "Start walking with no destination" / "Find somewhere to sit and just watch" / "Hit up the locals' top rated place to eat" / "Find the oldest part of the city and start there"

Q2: "The recipe calls for an ingredient you don't have. You..."
Q2 options: "Improvise immediately, probably better this way" / "Google a substitution" / "Feel a little defeated then adapt" / "This is why you always check before you start"

Q3: "Put these in order of how true they are for you — most to least:"
Q3 items: Feel / Think / Make / Move

Q4: "What's something most people walk past that you always stop for?"
Q5: "If your energy were a sound, what would it be?"

**Style:** Mobile-first, dark background, clean sans-serif, card-based questions. Make it feel intentional and calm — not a buzzfeed quiz.

---

## AGENT 2 — API Integration

Paste this to start:

---

You are building the API integration layer for a web app called Enigma. This is a React (Vite) project. Your job is to build the functions that call the Anthropic Claude API and the OpenAI GPT Image 2 API.

**What to build:**

Create `src/enigmaApi.js` with two exported functions:

**1. `getEnigma(payload)`**

Calls the Anthropic Claude API with the user's quiz payload.

- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-opus-4-20250514`
- Max tokens: 1500
- API key from: `import.meta.env.VITE_ANTHROPIC_API_KEY`
- Required headers: `anthropic-version: 2023-06-01`, `x-api-key`, `content-type`

The user message should be: `JSON.stringify(payload)`

The system prompt is long — import it from a separate file `src/systemPrompt.js` that exports it as a default string. (See the system prompt document for the exact text.)

Parse the response content text as JSON. Return the parsed object.

The response will be either:
- `{ follow_up: "question text" }` — needs a follow-up
- `{ _divergence, creature_name, tagline, reading, ai_partnership_style, image_prompt }` — full output

**2. `generateImage(imagePrompt)`**

Calls OpenAI GPT Image 2.

- Endpoint: `https://api.openai.com/v1/images/generations`
- Model: `gpt-image-2`
- Size: `1024x1024`
- Quality: `low`
- API key from: `import.meta.env.VITE_OPENAI_API_KEY`

Returns a base64 data URI (`data:image/png;base64,...`) from the response.

**3. `getEnigmaWithFollowUp(originalPayload, followUpQuestion, followUpAnswer)`**

Calls `getEnigma` again with the original payload plus:
```json
"followUpResponse": {
  "question": "the follow up question",
  "answer": "the user's answer"
}
```

**Error handling:** Wrap all calls in try/catch. Throw meaningful errors. Log failures to console.

**Environment variables needed in `.env`:**
```
VITE_ANTHROPIC_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
```

---

## AGENT 3 — Reveal Card UI

Paste this to start:

---

You are building the reveal experience for a web app called Enigma. This is a React (Vite) project. Your job is to build two components: the loading state and the reveal card.

**What to build:**

**1. `<LoadingState />`**

A full-screen loading experience shown while the API call runs.

- Dark background
- Rotate through these four messages in sequence, ~2.5s each:
  1. "Reading the spaces between your words..."
  2. "Listening to what you almost said..."
  3. "Something true is taking form..."
  4. "Your Enigma has been waiting..."
- Subtle fade transition between messages
- No spinner — just the text, centered, elegant

**2. `<RevealCard enigma={} imageUrl={} />`**

A full-screen reveal card. Props:
- `enigma` — the full output object from Claude
- `imageUrl` — the GPT Image 2 generated image (base64 data URI)

**Card should display:**
- `enigma.creature_name` — large, prominent, feels like a title
- `enigma.tagline` — one line below, slightly smaller
- `imageUrl` — the generated creature image, displayed beautifully
- `enigma.reading` — 2 sentences, displayed with space and care
- `enigma.ai_partnership_style` — displayed under a subtle divider

**Do NOT display:** `_divergence` (internal only)

**Visual feel:**
- Dark base, feels like something precious being revealed
- The creature name should feel like a title being bestowed
- Image should feel like it was always there waiting
- Reading and partnership style should have breathing room
- Mobile-first — this is primarily a phone experience
- Should feel screenshot-worthy — like something you'd want to keep

**Also build:**
A `<FollowUpQuestion question={} onSubmit={} />` component for when Claude returns a follow_up instead of full output:
- Display: "One more thing..." as a heading
- The question text prominently
- A simple textarea
- Submit button: "Complete my Enigma →"

---

## AGENT 4 — Glue + Polish

Paste this to start (run this one last):

---

You are wiring together the complete Enigma app. This is a React (Vite) project. Agents 1, 2, and 3 have already built their components. Your job is to connect everything in `App.jsx` and handle the complete state machine.

**Components available:**
- `<QuizFlow onSubmit={fn} />` — calls onSubmit(auditTrail, answers)
- `<LoadingState />` — shown during API calls
- `<RevealCard enigma={} imageUrl={} />` — the final reveal
- `<FollowUpQuestion question={} onSubmit={fn} />` — if follow_up returned
- `getEnigma(payload)`, `generateImage(prompt)`, `getEnigmaWithFollowUp(...)` from `enigmaApi.js`

**State machine to implement:**

```
STATES: quiz | loading | followup | reveal

quiz → [user submits] → loading
loading → [API returns follow_up] → followup
loading → [API returns full output] → loading (image gen) → reveal
followup → [user submits] → loading
loading → [image generated] → reveal
```

**App.jsx logic:**

1. Start in `quiz` state
2. On quiz submit: assemble full payload, set state to `loading`, call `getEnigma(payload)`
3. If response has `follow_up`: set state to `followup`, store question
4. If response has `creature_name`: call `generateImage(response.image_prompt)`, then set state to `reveal` with enigma + imageUrl
5. On follow-up submit: set state to `loading`, call `getEnigmaWithFollowUp(...)`, then proceed to image gen → reveal

**Payload assembly on quiz submit:**
```json
{
  "multipleChoiceAnswers": answers.multipleChoiceAnswers,
  "dragRankResult": answers.dragRankResult,
  "openEndedResponses": answers.openEndedResponses,
  "auditTrail": auditTrail
}
```

**Polish checklist:**
- Mobile-first layout, max-width ~480px centered on desktop
- Smooth state transitions (fade between screens)
- No flash of unstyled content
- `.env` file with both API keys documented in README
- Error state: if API fails, show a simple "Something went wrong. Try again." with retry button

**Global styles:**
- Dark background: #0F0F14
- Primary text: #E8E0F0
- Clean sans-serif font (Inter or system-ui)
- Generous padding on mobile
- No horizontal scroll
