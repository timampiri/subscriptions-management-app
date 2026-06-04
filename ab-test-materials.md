# A/B Test Materials — Subscriptions Management App

## What we're testing

**Variant A** (current): 5-tab bottom nav — Home, Subs, Stats, Insights, Profile  
**Variant B** (new): 4-item nav + centre "+" button — Home, Subs, [+], Analyze (Stats+Insights merged), Profile

**URLs:**
- Variant A: `[your-vercel-url]/?v=a`
- Variant B: `[your-vercel-url]/?v=b`

**Hypothesis:** Merging Stats and Insights into a single "Analyze" tab will reduce navigation errors (users won't have to decide which of the two to visit first) while the centred "+" button will make the Add action more discoverable than the header button.

---

## User task

Read aloud (or paste as written instructions in your testing platform):

> "You've been meaning to get on top of your subscriptions. Using this app:
> 1. Find out how much you're spending per month.
> 2. Identify which subscriptions you use the least.
> 3. Decide what you want to do with one of them — cancel, pause, or keep it — and take that action in the app.
>
> There's no right or wrong answer. Take your time and think out loud as you go."

**Why this framing:** The task forces users to touch the analytics section (Stats/Insights — the main navigation difference we're testing) AND an action path (cancel/pause). Both variants support all three steps but via different nav structures, so divergence in navigation paths will surface naturally without leading participants toward one variant's design.

---

## Post-completion questions

Administer after the task ends, before the participant closes the app. Same 10 questions for both variants — answers are compared across groups.

---

**Q1 — Recall**  
Without looking at the app — which section or tab showed you how much you spend per month?

*(Open text. Scores: correct tab name = 1pt, wrong tab = 0pt. Compare recall accuracy across variants.)*

---

**Q2 — Task confidence**  
How confident are you that you found all the information you needed?

1 — Not confident at all  
2  
3 — Somewhat confident  
4  
5 — Completely confident

---

**Q3 — Mental model**  
In your own words, what's the difference between the tabs you used most?

*(Open text. Looking for: does the participant articulate a clear distinction, or do they describe confusion between analytics sections?)*

---

**Q4 — Add affordance**  
If you wanted to add a new subscription, where would you start? Describe the steps without using the app.

*(Open text. Scores: mentions "+" button or Add = 1pt, describes a non-obvious path = 0pt. Tests whether the nav "+" in Variant B is more immediately recalled than the header button in Variant A.)*

---

**Q5 — Navigation ease (SUS-adapted)**  
I found this app easy to navigate.

1 — Strongly disagree  
2  
3 — Neither agree nor disagree  
4  
5 — Strongly agree

---

**Q6 — Learning curve (SUS-adapted, reverse-scored)**  
I would need to spend time learning this app before feeling confident.

1 — Strongly disagree  
2  
3 — Neither agree nor disagree  
4  
5 — Strongly agree

*(Reverse-score for SUS: 1→5, 2→4, etc. before comparing with Q5.)*

---

**Q7 — Friction probe**  
Was there any moment where you weren't sure where to tap next? If yes, describe what you were trying to do and where you ended up.

*(Open text. Note: do not follow up with "Was that frustrating?" — leads the participant. Just record the answer verbatim.)*

---

**Q8 — Information architecture expectation**  
Where would you expect to find AI-powered saving suggestions — which tab or section?

*(Open text. Tests whether "Insights" label or "Analyze" label is more intuitive for AI nudges. In Variant A, Insights is separate; in Variant B it's inside Analyze.)*

---

**Q9 — Frequency intent**  
How often would you realistically open an app like this?

- Daily
- A few times a week
- Weekly
- Monthly
- Rarely / only when something comes up

*(Single choice. Contextualises confidence and friction scores — a participant who'd use it daily and gave Q5 a 3 is more concerning than a once-a-month user.)*

---

**Q10 — Redesign power**  
If you could rename or move one thing in the bottom navigation, what would it be and why?

*(Open text. Surfaces highest-friction element without asking "what's bad?" — reframes critique as a design power. Compare: do Variant A users flag Stats/Insights split? Do Variant B users flag "Analyze" label as unclear?)*

---

## Scoring guide

| Question | Type | How to score |
|---|---|---|
| Q1 | Recall | Correct / Incorrect |
| Q2 | 1–5 scale | Raw score, compare mean across variants |
| Q3 | Qualitative | Tag: clear-model / confused / no-distinction |
| Q4 | Add recall | Correct / Incorrect |
| Q5 | 1–5 scale | Raw score |
| Q6 | 1–5 scale | Reverse-score before comparing |
| Q7 | Qualitative | Tag: no-friction / minor / major; note which screen |
| Q8 | Qualitative | Note exact label used (Stats / Insights / Analyze / other) |
| Q9 | Frequency | Note; use as context, not primary DV |
| Q10 | Qualitative | Note which nav element flagged; compare across variants |

**Composite SUS-2 score:** `((Q5 raw) + (6 − Q6 raw)) × 25` → 0–100. At n=2 per variant, treat as directional only.

---

## n=2 per variant — what to look for

With 4 participants total (2 per variant), you cannot report statistical significance. Report:

- **Corroborated findings**: both participants in a variant hit the same friction point → actionable
- **Divergent findings**: one participant had friction, the other didn't → note as hypothesis, not finding
- **Cross-variant contrast**: did Variant B participants navigate to analytics faster / with fewer taps?
- **Q1 + Q4 recall scores**: the most behavioural, least subjective measures — weight these most

---

## Session setup

1. Share the relevant URL with participant before they start (either via Maze/Lyssna task link or direct browser URL)
2. Confirm they're on a mobile device or using Chrome DevTools mobile emulation (390×844px)
3. Deliver task verbally or via the testing platform's task screen
4. Do not screen-share your own session — participants should only see the app
5. Post-task questions can be embedded in Maze/Lyssna's follow-up flow, or delivered as a Google Form link immediately after
