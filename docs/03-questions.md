# ENIGMA — Question Definitions

These are the exact questions, answer options, and interaction types for all 5 questions.
Use the full text strings exactly as written — they appear in the API payload sent to Claude.

---

## Q1 — Multiple Choice (Tap to Select)

**Question:**
> You have one hour in a city you've never been to. What do you do first?

**Answer Options:**
- A: Start walking with no destination
- B: Find somewhere to sit and just watch
- C: Hit up the locals' top rated place to eat
- D: Find the oldest part of the city and start there

**Interaction:** Single tap selects. Tapping a different answer deselects previous and logs `question_answer_change`.

---

## Q2 — Multiple Choice (Tap to Select)

**Question:**
> The recipe calls for an ingredient you don't have. You...

**Answer Options:**
- A: Improvise immediately, probably better this way
- B: Google a substitution
- C: Feel a little defeated then adapt
- D: This is why you always check before you start

**Interaction:** Same as Q1.

---

## Q3 — Drag to Rank

**Question:**
> Put these in order of how true they are for you — most to least:

**Items to rank (start in this default order):**
- Feel
- Think
- Make
- Move

**Interaction:** Drag and drop to reorder. Log all drag events. Final order logged on `drag_complete`.

---

## Q4 — Open Ended (Typed)

**Question:**
> What's something most people walk past that you always stop for?

**Interaction:** Free text textarea. Log all keystroke events, backspace holds, paste, cut, select_all. Log final text on blur or next question advance.

**Placeholder text:** *Type anything...*

---

## Q5 — Open Ended (Typed)

**Question:**
> If your energy were a sound, what would it be?

**Interaction:** Same as Q4.

**Placeholder text:** *Type anything...*

---

## Notes for Implementation

- All answer text should be stored and sent to Claude as the **full string**, not the letter label
- The drag rank question text ("Put these in order...") should be included in the `dragRankResult` object sent to Claude
- All question text should be included in `open_ended_final` events so Claude has full context
- Q4 and Q5 should advance on a "See your Enigma →" button, not on blur, so the user consciously submits

---

## Follow-Up Question (If Triggered)

If Claude returns a `follow_up` field instead of a full output, display the question as a single open text input with:

- A heading like: *One more thing...*
- The follow_up question text displayed prominently  
- A simple textarea for response
- Submit button: *Complete my Enigma →*

The follow-up answer is appended to the original payload as:
```json
"followUpResponse": {
  "question": "the follow_up question text",
  "answer": "user's typed response"
}
```
