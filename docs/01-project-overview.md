# ENIGMA — Project Overview, Architecture & Build Plan

## What We're Building

Enigma is a 5-question personality experience that listens to both what people say and how they move. It captures behavioral signals alongside explicit answers, sends everything to Claude, and returns a creature-based identity card with a painterly AI-generated image.

**The core insight:** Most people express themselves in patterns nobody thought to listen to — keystroke rhythm, hesitation, what they delete, answer changes, time spent reading. Enigma pays attention to these "lost signals" alongside explicit answers.

**The emotional goal:** User gives casual input over 5 questions. Output feels unnervingly personal. The gap between simple input and resonant output is where the magic lives.

---

## Tech Stack

- **Frontend:** React (Vite), mobile-first, single-page
- **AI Inference:** Anthropic Claude (claude-opus-4-20250514) via API
- **Image Generation:** OpenAI DALL-E 3
- **Deployment:** Local for hackathon demo, Vercel-ready

---

## App Flow

```
Landing Page
    ↓ [begin_click logged]
Question 1 — Multiple Choice (tap)
    ↓ [answer + timing logged]
Question 2 — Multiple Choice (tap)
    ↓ [answer + timing logged]
Question 3 — Drag to Rank
    ↓ [all drag events logged]
Question 4 — Open Ended (typed)
    ↓ [keystroke events logged]
Question 5 — Open Ended (typed)
    ↓ [keystroke events logged]
Submit
    ↓ [payload assembled]
Loading State (rotating messages)
    ↓ [Anthropic API call]
    ↓ [check: follow_up or full output]
    ↓ [if follow_up: show question, collect answer, second API call]
    ↓ [OpenAI DALL-E 3 image generation]
Reveal Card
```

---

## Audit Trail Structure

The audit trail is an append-only array of typed, timestamped events. Every interaction is logged via a single `logEvent(type, value?)` function.

### Event Structure
```json
{ "type": "string", "timestamp": number, "value": any }
```

Timestamps are milliseconds elapsed since `landing_load` (timestamp 0).

### Complete Event Reference

**Landing**
```
landing_load          — page ready, timestamp 0
landing_hover         — value: "hero" | "subtitle" | "fine_print"
begin_click           — user taps Begin
```

**Multiple Choice (Q1, Q2)**
```
question_start        — value: "q1" | "q2"
question_answer       — value: { question: full text, answer: full answer text }
question_answer_change — value: { question, from: full text, to: full text }
```

**Drag to Rank (Q3)**
```
question_start        — value: "q3"
drag_start            — value: item label
drag_drop             — value: { item, position }
drag_reorder          — value: current full order array
drag_complete         — value: { question: full text, order: final array }
```

**Open Ended (Q4, Q5)**
```
question_start        — value: "q4" | "q5"
keydown               — timestamp only (no value needed)
backspace_hold        — value: { duration_ms }
paste                 — value: { text }
cut                   — no value
select_all            — no value
open_ended_final      — value: { question: full text, text: final answer }
```

**Submission**
```
submit                — no value
```

### What Signals Reveal
- **Time per question** — decisiveness vs deliberation
- **Answer changes** — self-awareness in motion
- **Keystroke rhythm** — burst thinker vs methodical editor
- **Backspace hold duration** — self-censoring, what they almost said
- **Paste events** — pre-meditated, wrote elsewhere first
- **Select-all + retype** — perfectionist or clarifier
- **Drag reorder count** — how settled in self-concept
- **Landing exploration** — curious explorer vs direct diver

---

## API Payload Structure

The full payload sent to Claude on submission:

```json
{
  "multipleChoiceAnswers": {
    "q1": {
      "question": "full question text",
      "answer": "full answer text"
    },
    "q2": {
      "question": "full question text",
      "answer": "full answer text"
    }
  },
  "dragRankResult": {
    "question": "full question text",
    "order": ["Feel", "Think", "Make", "Move"]
  },
  "openEndedResponses": {
    "q4": {
      "question": "full question text",
      "answer": "final typed answer"
    },
    "q5": {
      "question": "full question text",
      "answer": "final typed answer"
    }
  },
  "auditTrail": [
    { "type": "landing_load", "timestamp": 0 },
    { "type": "begin_click", "timestamp": 4200 },
    ...
  ]
}
```

---

## Two-Mode API Response

Claude returns either a **follow_up** or a **full output** depending on signal richness.

### Follow-up (thin data)
```json
{
  "follow_up": "One specific question Claude genuinely needs answered to complete the reading."
}
```
When this is returned: display the question to the user, collect their answer, make a second API call with the original payload + follow_up answer appended.

### Full Output (sufficient data)
```json
{
  "_divergence": "INTERNAL — never shown to user. The most interesting tension between explicit answers and behavior.",
  "creature_name": "The [Creature]",
  "tagline": "One sentence naming their gift directly.",
  "reading": "2 sentences. Creature language only.",
  "ai_partnership_style": "Three sentences. Creature behavior as bridge.",
  "image_prompt": "Painterly scene description for DALL-E 3."
}
```

---

## Loading State Copy

Rotate through in sequence during API call:
1. *Reading the spaces between your words...*
2. *Listening to what you almost said...*
3. *Something true is taking form...*
4. *Your Enigma has been waiting...*

---

## Landing Page Copy

- **Hero:** *You've been using AI. You haven't met it yet.*
- **Subheading:** *Five questions. One revelation.*
- **Button:** *Begin →*
- **Fine print:** *No wrong answers. Just yours.*

---

## Parallel Build Paths

### Agent 1 — Quiz UI + Audit Trail
**Files:** `QuizFlow.jsx`, `AuditLogger.js`
**Owns:** Landing page, all 5 question components, event logging
**No dependencies:** Can build and test independently with mock submit

### Agent 2 — API Integration
**Files:** `enigmaApi.js`
**Owns:** Anthropic API call, response parsing, follow-up logic, DALL-E image call
**No dependencies:** Can build and test with mock payloads

### Agent 3 — Reveal Card UI
**Files:** `RevealCard.jsx`, `LoadingState.jsx`
**Owns:** Full-screen reveal, all card fields rendered beautifully, loading experience
**No dependencies:** Can build with hardcoded mock data

### Agent 4 — Glue + Polish
**Files:** `App.jsx`, global styles
**Owns:** State machine connecting all components, mobile layout, typography
**Depends on:** Agents 1, 2, 3 complete
**Runs last**

---

## Environment Variables Required

```
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
```

Add to `.env` in project root. Never commit this file.
