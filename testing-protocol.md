# In-Person Testing Protocol — Subscriptions Management App

**Project:** Subscriptions Management App (CS147)
**Author:** Rina Arutiunian
**Date:** Day 4 prep (Jun 1) → Day 5 sessions (Jun 2)
**Sample:** n=2 in-person sessions, 30-min recorded per participant
**Method:** Single deep task with printed task card, motivation-led framing, think-aloud, qualitative debrief, SUS-5

---

## 1. Methodology foundation

This protocol is grounded in the HCI lecture on running studies. The single biggest pitfall the lecture identifies is asking variants of *"Do you like my interface?"* — people are nice, they say yes, and a 1–5 Likert scale dressed up as data is the same question with a patina of scientificness. This protocol measures **behaviour**, not stated affection.

### Independent variables (what we control)

The IVs are held fixed across both sessions so that any difference between participants is attributable to the participant, not the setup:

- **Prototype state.** A single fixed React build is loaded on the same phone for both sessions. No edits between sessions, even if the first session surfaces an obvious bug.
- **Task framing.** Verbatim wording, read aloud identically to both participants (see §5).
- **Probe script.** Same probes, same trigger conditions, same phrasing (see §6).
- **Venue and rig.** Same quiet venue, same camera angle, same lighting where possible.

### Dependent variables (what we measure)

Following the lecture's common HCI measures — task completion, accuracy, recall, emotional response — adapted to the app:

| DV | How measured | Why |
|---|---|---|
| Task completion | Did the participant locate where their money is going *and* make a concrete decision (cancel / pause / skip / keep)? Yes/no per phase. | Lecture: define what "complete" means concretely. |
| Time-on-task (per phase) | Phase boundaries: Connect → Results → Subscriptions/Detail → Insights → decision. Timestamp each transition. | Surfaces friction points; one phase being 5× longer than another is signal. |
| Error count | False-affordance taps, dead-end navigations, backtracks, retries. | Lecture: accuracy is a primary DV. Distinguish fatal errors from quickly-recovered ones. |
| Recall | Post-task probe: "What did the confidence pill mean?" — without looking back. | Lecture: recall is a real DV, tests learnability beyond first-look visibility. |
| Emotional response | SUS-5 score (§9) + timestamped verbal hesitation moments. | Lecture: confident vs stressed, would they recommend to a friend. |

### Internal validity controls

- Same task wording read verbatim to both participants.
- Same warm-up question and same probe phrasing.
- Quiet venue (controls for distraction confound).
- Same prototype build for both sessions — no late-night edits between sessions, even when tempted.
- Same observer (Rina) running both sessions, with the same observation sheet template.

### External validity — explicit limits

State these in the writeup. The lecture is firm: the generalisability of findings is constrained by the sample, and a designer should name those constraints rather than hide them.

- **n=2**, recruited from local design community and flatmate's network — convenience sample, not random.
- **Heavy-subscription-user profile** (4+ active recurring subscriptions). Findings do not generalise to light users, non-subscribers, or users who already use a competitor app.
- **In-person, mobile-only.** Findings do not transfer to desktop or remote async testing where Please-the-Experimenter pressure differs.
- **London-based, English-speaking.** Findings do not generalise across language or cultural contexts where subscription norms differ.

### What this protocol will NOT do

Lecture pitfalls we are explicitly avoiding:

- **No "do you like it?"** or "rate this 1–5" without a behavioural measure attached. Stated affection without behavioural evidence is the bias the lecture warns about.
- **No comparison to Mint, Truebill, or Rocket Money.** Those competitors have years of refinement; comparing a Day-5 prototype to them mixes implementation fidelity with design approach, and the lecture is clear that conflated variables make findings uninterpretable. If we want a competitive comparison later, it goes in a separate study at matched fidelity.
- **No reading the SUS-5 score at n=2 as "the app is X% usable."** SUS at this sample size is a directional signal between sessions only.
- **No leading probes.** "Most people find this easy, do you?" is banned (see §6).
- **No silently changing the protocol between sessions.** If something needs to change after Session 1, note it explicitly and treat Session 2 as a separate condition, not a replication.

---

## 2. Session structure

Total session: 30 minutes per participant, end-to-end. Tight by design — a CS147 prototype test does not need a 60-minute slot, and shorter sessions hold the participant's energy through the SUS-5 at the end.

| Phase | Duration | Purpose |
|---|---|---|
| Arrival + consent | 3 min | Greet, sign printed consent, confirm recording is rolling. |
| Warm-up question | 2 min | Establish mental model without leading (§4). |
| Single deep task | 15 min | Motivation-led framing, printed task card in front of participant, think-aloud. |
| Recall + qualitative debrief | 5 min | 3 verbatim prompts (§8). |
| SUS-5 questionnaire | 3 min | Self-administered, printed (§9). |
| Wrap | 2 min | Thank-you, gift if applicable, contact for follow-up. |

If the task naturally wraps before 15 minutes (participant finishes and says they are done), move straight to the debrief — do not pad. If the task is still active at 15 minutes, give a soft warning (*"a couple more minutes and we will move on"*) and let them finish their current path rather than cutting mid-tap.

---

## 3. Pre-session checklist

Run through this the morning of, then again 30 minutes before the participant arrives.

- [ ] Quiet venue booked. Table + 2 chairs. Power outlet within reach.
- [ ] Phone with React prototype loaded and smoke-tested ≤2 hours before session.
- [ ] Backup phone with same prototype, charged, ready as fallback.
- [ ] Laptop screen-capture verified (OBS or QuickTime). Test recording made and played back.
- [ ] Phone tripod at 45° — captures participant's hands and face in single frame.
- [ ] Printed consent form ×2 copies (participant keeps one).
- [ ] **Printed task card** (§5), 1 per participant — placed next to the phone so they can re-read at any point.
- [ ] Printed observation sheet (§7), 1 per participant, blank.
- [ ] Printed SUS-5 questionnaire (§9), 1 per participant, blank.
- [ ] 2 pens.
- [ ] My phone on Do Not Disturb. Notifications off on the prototype phone.
- [ ] Water for participant.
- [ ] Cash or voucher ready if compensating.

---

## 4. Warm-up question (verbatim)

Read this exactly. Goal: establish how the participant currently thinks about subscriptions, without priming them toward any feature in the app.

> *"Before we start, can you tell me how you currently keep track of your subscriptions? Is there a system, or do you mostly just notice when something charges you?"*

Listen, don't direct. Note the mental-model words they use — *"track", "remember", "checking my bank", "spreadsheet"*. These become anchor terms for probes during the task.

Do not say what the app does. Do not preview screens. Do not justify why subscription tracking matters.

---

## 5. The deep task (verbatim, motivation-led)

Read exactly. The lecture warns against vague success criteria, so the task names a clear endpoint (*figure out where money is going AND make a decision*) without prescribing the route.

Hand the participant the **printed task card** (below) and place it next to the phone so they can re-read it any time without asking. Then read the task aloud:

> *"Imagine you've had a feeling for a while that you're spending too much on subscriptions, but you're not sure where it's going. I'd like you to use this app to figure out where your money is going and decide what, if anything, you want to do about it.*
>
> *Take as long as you need. There's no right or wrong path — I'm here to learn from how you naturally use it.*
>
> *One thing that will help me a lot: please talk out loud while you use it. Say what you're looking at, what you're trying to do, what you expect to happen when you tap something, even when you're confused or annoyed. There are no wrong things to say. The more you talk, the more useful this is for me."*

Hand over the phone with the app open on the Home screen.

### Printed task card (give to participant)

A single printed card the participant keeps in front of them throughout the task. No surprise, no memory load — they can glance down any time.

```
YOUR TASK

You've been feeling like you're spending too much on
subscriptions, but you're not sure where it's going.

Use this app to:
  1. Figure out where your money is going
  2. Decide what, if anything, you want to do about it

There's no right path. Take your time.

Please talk out loud as you go — say what you see,
what you're trying to do, and what you expect.
```

### Why this framing (note for the writeup)

- A single deep task surfaces real navigation paths better than five shallow tasks (dev-plan Day 4 learning).
- Multiple valid paths complete the task — Connect → Results → cancel; Subscriptions list → Detail → pause; Insights → Take action. This is intentional and mirrors real product use.
- "Decide what, if anything, to do" makes *no decision* a valid endpoint. We learn from people who finish and choose to do nothing.
- The motivation ("spending too much") matches the app's positioning, so the task is ecologically realistic.
- The printed card removes "what was I supposed to do again?" as a confound. Any pause becomes a real signal, not a memory lapse.
- The explicit think-aloud framing — *"the more you talk, the more useful this is for me"* — gives the participant permission to narrate. People stop thinking aloud when they feel watched; reframing it as helping the researcher reverses that pressure.

---

## 6. Probe script

Probes are sparing. Trigger only when the participant goes silent for **>10 seconds**, visibly hesitates, or makes a decision without verbalising why.

### Allowed probes (verbatim, neutral)

- *"What are you thinking right now?"*
- *"What did you expect to happen there?"*
- *"What does that [element they're looking at] mean to you?"*
- (After they tap something) *"Walk me through why you went there."*
- (After a backtrack) *"What were you trying to do just then?"*

### Think-aloud reminders (use when the participant has been silent for >20 seconds)

Participants almost always go quiet once they get absorbed in the task. A gentle reminder reactivates think-aloud without breaking flow. Rotate between these so it doesn't feel like a script:

- *"Keep talking — what's going through your head?"*
- *"What are you reading right now?"*
- *"Say it out loud, even if it feels obvious."*

If they stay silent after two reminders, leave them alone — pushing further reads as pressure, and the silence itself is data.

### Banned probes (lecture: leading + Please-the-Experimenter bias)

- *"Did you find that easy?"* / *"Was that clear?"* — fishes for affirmation.
- *"Most people tap X here — what about you?"* — primes the answer.
- *"Do you like this screen?"* — the exact bias the lecture warns about.
- *"That's not quite right — try…"* — directing.
- *"That's a great point!"* — rewards specific feedback, biasing what comes next.

Sit on hands if needed. Silence is allowed.

---

## 7. Observation sheet (printable)

Fill in live during the session. Leave the *Interpretation* column blank — that gets filled in during synthesis, after the session ends, so live judgement does not contaminate observation.

Print one per participant. Date and participant ID at the top.

```
Participant ID: P___      Date: ___________      Session start: ___:___
```

| Time (mm:ss) | Screen | Action | Error type | Verbatim quote | Interpretation (synthesis only) |
|---|---|---|---|---|---|
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

**Error type codes:**
- `FA` — false affordance (tapped something that looked tappable but wasn't)
- `DE` — dead end (navigated somewhere with no clear way forward)
- `BT` — backtrack (returned to a previous screen, suggesting wrong path)
- `CF` — confusion (verbalised uncertainty without a clear next action)
- `RT` — retry (repeated the same action expecting different result)
- `—` — no error

**Phase markers** (write across the table as participant crosses each boundary):
- `P1` Connect / Add flow entered
- `P2` Results / detected subscriptions reviewed
- `P3` Subscriptions list or Detail opened
- `P4` Insights opened
- `P5` Decision made (cancel / pause / skip / keep / no decision)

---

## 8. Recall + qualitative debrief (3 prompts, verbatim)

Run these after the task ends, before the SUS-5. Read each prompt exactly. Wait. Resist the urge to fill silence.

### Prompt 1 — Recall (tests retention of the app's core value)

> *"Without looking back at the phone, can you tell me roughly how much the app said you could save per year, and which subscriptions it suggested you cancel or look at?"*

Why: recall is a real DV per the lecture. This tests whether the app's headline value — *"here is how much you can save and here is what to cancel"* — actually landed in memory, not just appeared on screen. The saving number is the hero number in Insights; the suggested cancellations are the AI recommendations. If the participant can paraphrase both, the value proposition was learnable. If they remember the number but not the actions (or vice versa), that's a signal about which half of the message is sticky.

### Prompt 2 — Surprise probe (surfaces app-specific learning moment)

> *"Was there a moment in the app where you learned something about your own subscription spending — or about the way the app works — that you didn't expect? Walk me back to that moment."*

Why: replaces the abstract "moment you felt most certain" with a more app-specific probe. The unique promise of this app is auto-detection + AI insights revealing things the user didn't already know. This question directly tests whether that promise delivered a felt moment in the session. If the participant points to the Insights "Adobe — you have not used this in 4 months" card, or the Results screen surfacing a subscription they had forgotten, the value proposition worked. If they shrug, the app showed them what they already knew — a serious finding.

### Prompt 3 — One-button-removal probe (surfaces highest friction)

> *"If you had one button to delete from this whole app and never see again, which one and why?"*

Why: surfaces the most frustrating element without asking *"what's bad?"* directly. Reframes critique as a design power the participant holds, not a complaint they have to manufacture.

Do **not** follow up with *"and what would you replace it with?"* — that's a design task, not a research probe.

---

## 9. SUS-5 questionnaire (printable, self-administered)

Standard SUS is 10 items. SUS-5 cuts to 5 — but the cut has to be deliberate. The earlier draft used items that mirrored each other (*"the app was easy to use"* and *"the app was unnecessarily complex"* are the same question with opposite framing). The 5 items below each test a **different facet** of usability with minimal overlap: intent, support burden, cohesion, learnability speed, and pre-learning required.

Print one per participant. Hand it over with a pen. Ask the participant to circle their answer for each statement. No verbal explanation — let the wording stand alone.

```
Participant ID: P___      Date: ___________

For each statement, circle the number that best matches your view.

1 = Strongly disagree   5 = Strongly agree

1. I think I would like to use this app frequently.
   1     2     3     4     5
   (facet: intent to use)

2. I think I would need help from a technical person to be
   able to use this app.                                    [reverse-scored]
   1     2     3     4     5
   (facet: support burden)

3. I found the various parts of this app worked well
   together.
   1     2     3     4     5
   (facet: cohesion / integration)

4. I would imagine that most people would learn to use this
   app very quickly.
   1     2     3     4     5
   (facet: learnability speed)

5. I needed to learn a lot of things before I could get
   going with this app.                                     [reverse-scored]
   1     2     3     4     5
   (facet: pre-learning required)

Optional one-line comment:
___________________________________________________________
```

**Why these five (and why not the others):**

| # | Facet | Replaced because… |
|---|---|---|
| 1 | Intent to use | Kept — intent is uncorrelated with the rest and irreplaceable. |
| 2 | Support burden | Replaced the old *"unnecessarily complex"* which was a near-mirror of *"easy to use"*. |
| 3 | Cohesion | Replaced the old *"easy to use"* which overlapped with both #2 and #5 in the old set. |
| 4 | Learnability speed | Kept — distinct facet, no overlap. |
| 5 | Pre-learning required | Replaced the old *"felt very confident"* which overlapped with *"easy to use"*. Pre-learning is a sharper, more behavioural facet. |

**Scoring:**
- For positive items (1, 3, 4): score = response − 1 (range 0–4).
- For negative items (2, 5): score = 5 − response (range 0–4).
- Sum the five item scores (range 0–20).
- Multiply by 5 to scale to 0–100.

**Caveat for the writeup:** SUS was designed for n≥10 over 10 items. At n=2 over 5 items, the score is a **directional** comparison between Session 1 and Session 2 only — not an absolute usability claim. The lecture's *"is this difference significant?"* question applies: at n=2 the answer is *we don't know yet*. Report the raw per-item responses alongside the score so readers can see what drove it.

---

## 10. Same-evening synthesis

Run this within 2 hours of the second session ending. Memory decays fast and the next-day rationalisation is the enemy of honest synthesis.

1. **Top 5 findings** — written as one-sentence claims, each grounded in at least one observation timestamp or participant quote.
2. **3 critical fixes** prioritised by **severity × frequency**. Severity = how badly it blocked the task. Frequency = how many of the 2 participants hit it. Both-participants + task-blocking = highest priority.
3. **A/B candidate screen** — the screen with the strongest *disagreement* between the two participants. Even at n=2, a clear split is a signal worth testing as the Day 6 minimal-pairs comparison.
4. **One annotated screenshot per participant** — the single frame that captures their key reaction moment. These become evidence in the writeup and poster.

Distinguish **expected** from **unexpected** findings explicitly. The expected ones confirm the design hypothesis; the unexpected ones are where the real learning lives.

---

## 11. Consent form (printable, single page)

Print two copies per participant. Participant signs both, keeps one.

```
SUBSCRIPTIONS MANAGEMENT APP — USABILITY TEST CONSENT

What this session is for
You are taking part in a 60-minute usability test of a prototype
app for managing subscriptions. This is a course project (CS147)
for Stanford University.

What will be recorded
  • The phone screen as you use the app
  • Audio of our conversation
  • A video of your hands and face as you interact with the phone

How your data will be used
  • A written course writeup (anonymised — no name, no face shown)
  • A possible portfolio inclusion (anonymised — no name, no face shown)
  • Analysis by Rina Arutiunian only. Not shared with third parties.

Your rights
  • You may withdraw from the session at any time, for any reason,
    without explanation.
  • You may request that your data be deleted within 14 days of
    this session, by emailing rina@[contact].
  • You may decline to answer any specific question.

What we are NOT doing
  • Not collecting your name, address, or any subscription account
    details from your real accounts.
  • Not retaining the recording beyond the course project.

Signature

I have read and understood the above. I consent to participate
and to be recorded as described.

Participant printed name: ________________________________

Signature: ____________________________   Date: __________

Researcher signature: _________________   Date: __________
```

---

## 12. Reproducibility notes

If a third session is added, or this protocol is run again later, the points that matter most for keeping the comparison clean:

- Same prototype build. Tag it in git (e.g. `testing/day-5-session-1`) and check the tag back out for any follow-up session, even if main has moved on.
- Same phone, same headphones (none), same venue if possible.
- Same observer. If a second observer is needed, they must read the warm-up, task, and probes from this document verbatim, and use this observation sheet without modification.
- Log any deviation explicitly. The lecture's point is that confounds become invisible if not named — *we changed the venue but everything else was the same* is a confound, not a footnote.
