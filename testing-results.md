# Testing Results — Subscriptions Management App

**Sessions:** P1 (Marcus, 34, PE teacher) · P2 (Priya, 27, freelance UX writer)
**Date:** 2026-06-03 / 2026-06-04
**Method:** 30-min in-person think-aloud, one deep task, recall + qualitative debrief, SUS-5
**Protocol:** testing-protocol.md

---

## SUS-5 Summary

| Participant | Item 1 Intent | Item 2 Support | Item 3 Cohesion | Item 4 Learning | Item 5 Pre-learn | Score |
|---|---|---|---|---|---|---|
| P1 Marcus | 3 | 3 | 3 | 3 | 3 | **75 / 100** |
| P2 Priya | 3 | 4 | 2 | 3 | 4 | **80 / 100** |

Both scores sit above the 68-point conventional "good" threshold. The 5-point gap is driven almost entirely by P2's higher digital fluency (items 2 and 5). P2 actually scored *lower* than P1 on cohesion (item 3) — the non-interactive KPI grid broke the sense of a consistent system more for her than for him, because she noticed the inconsistency faster.

**Caveat:** At n=2, these are directional signals only. Do not cite as absolute usability scores.

---

## Behavioral Patterns

Six patterns emerged across both sessions. These are not isolated bugs — they reveal how people approach this type of app.

### Pattern 1: Survey before act

Neither participant started with Connect Account. Marcus went to Insights first (following the AI Insight banner on Home). Priya went to Subscriptions first (wanting the full list before recommendations). Both oriented themselves in the data for several minutes before they were willing to commit to any action, including the Connect flow.

**What this means:** The app's core value (auto-detection) is gated behind a permission-granting action. But users want to understand what they're working with before granting access. The Home screen's mock data — John's $133/month, the existing 9 subscriptions — acted as a trust-builder and mental-model-setter that made the Connect action feel less blind. This is actually working as intended, but it means the sequence Home → Explore → Connect needs to feel natural rather than feeling like users are finding Connect by accident.

**Question it raises:** Would a user with zero mock data (empty state) know where to start? The prototype never shows this. Worth testing.

### Pattern 2: The KPI grid reads as navigation

Marcus tapped the `$133/mo` tile. Priya tapped the `Rarely used — 2` tile. Different people, different tiles, same expectation: these are entry points to more detail.

This is not a user error. The monospace large-number typography, card borders, and elevated shadow are exactly the visual language that banking apps use for interactive metric tiles. The sub-label "review these" on Rarely used is an explicit action invitation. The design is making a promise it doesn't keep.

**What if we tried to recreate their decision:** Marcus had just read "$133 a month on subscriptions. That's a lot actually." His natural next move was to find out *where* that $133 goes — he was looking for a breakdown. The tile was the most plausible entry point. Priya had scanned the grid top to bottom, parsed the four numbers, and immediately wanted to act on the most actionable one: Rarely used. She was in audit mode from the first second. Both paths are completely reasonable.

**Alternative path they missed:** Both could have scrolled down and tapped the "View all →" link under All Subscriptions, or tapped the AI Insight banner which leads to Insights. Marcus did eventually tap the banner. Priya skipped it to go to Subscriptions directly. The banner is doing some of this routing work, but it only addresses the Insights path — not the Subscriptions path.

**Deeper question:** Why are there four KPI tiles if none of them go anywhere? If the answer is "they're decorative at this stage," that's a design debt that creates real friction on first use. Every tile with a number invites a tap.

### Pattern 3: Confidence is learned, not read

Neither participant absorbed the meaning of "96% match" as raw text. Marcus questioned it aloud and opened the popover (~8 seconds). Priya already understood the system from her earlier filter exploration — meaning she built the mental model from a different entry point.

This is interesting: the confidence system works, but it requires one moment of initiation. The popover is well-designed (clear bands, plain-English descriptions). The question is whether the label alone should carry more meaning before the popover is opened.

**Options considered:**
- Replace "96% match" with "Very likely" / "Likely" / "Review carefully" text labels → removes the number, which may actually reduce trust (a number feels more objective)
- Add a one-time tooltip the first time a user encounters a confidence pill → patronising if they already understand, but helpful if they don't
- Keep the current system but ensure the pill is tappable (which it already is) → requires users to discover it, which both did, but costs ~8 seconds of friction

The most revealing thing: both participants understood the system perfectly *after* one exposure. This is not a learnability problem — it is a first-encounter friction problem. The solution may be as simple as adding a small `ⓘ tap to learn more` label beneath the first confidence pill a user sees in a session.

### Pattern 4: Positive intelligence builds disproportionate trust

The green "Smart spending detected" card (GitHub Copilot + ChatGPT) was praised by both participants, unprompted, in similar terms:

- Marcus: "I thought it would only tell you bad news. That surprised me."
- Priya: "Most budgeting apps just tell you to spend less on everything. This feels smarter."

This is the differentiator. Most subscription management apps position themselves as cost-cutters. This app positions itself as an intelligent advisor that recognises value, not just waste. Both participants responded to this strongly after spending most of the session seeing warning cards.

**The ratio question:** There are currently 3 warning/info cards and 1 positive card. Is that the right ratio? If the ratio shifted to 50/50, would the app feel less useful (fewer problems flagged) or more trustworthy (balanced)? The sessions don't answer this, but both participants' reactions to the positive card were disproportionately positive relative to its position in the list — suggesting it punches above its weight. Consider whether it should appear earlier, not last.

### Pattern 5: Actions must visibly change the world

Both participants flagged that post-action state didn't update — Marcus twice (after cancelling Adobe and after the Connect scan), Priya at the very end (Rarely used count still showed 2 after she paused Adobe). Both were gracious about it being a prototype.

But the emotional register is important. Marcus said: "I thought I cancelled it but it still shows active." Priya said: "I'd want to see that number tick down to 1." These aren't nitpicks — they're describing a trust requirement. In a financial app, if I take an action and nothing visibly changes, my immediate question is "did that work?" Doubt is the enemy of trust.

**The real-world implication:** The current state persistence gap exists because SUBSCRIPTIONS and DETECTED_SUBSCRIPTIONS are separate static arrays. In a shipped product, state updates would be real-time. But even in the prototype, it is worth considering whether post-action confirmation messages (toasts, updated counts, animated transitions) could bridge the expectation gap. The DoneStep after the Connect flow is a partial answer — but it only covers the Connect flow, not individual cancel/pause actions on the main list.

### Pattern 6: Pause vs. Cancel is doing two different jobs without saying so

This only surfaced with P2, but it matters. The app has two action patterns:
- **Cancel subscription** → routes to the provider's website (external redirect with notice)
- **Pause** → updates status in-app, nothing sent to provider

These are fundamentally different in terms of real-world consequence. Pause is tracking-only. Cancel is a real action. But visually they sit as equal-weight buttons on the same detail screen. Priya noticed this immediately: "Does this pause tracking, or the actual subscription?" She assumed tracking-only and moved on — but the uncertainty was real.

**Analogy:** In many apps, "archive" and "delete" sit next to each other. The difference is obvious from the label — but only because "delete" has decades of convention. "Pause" does not have the same established meaning. It is genuinely ambiguous whether it means "I want to stop tracking this" or "I want to pause my subscription with the provider."

---

## Findings List

Ordered by severity × frequency (most critical first).

---

### Finding 1: KPI tiles are non-interactive — HIGH severity, 2/2 participants
**What happened:** Both participants tapped a KPI tile on their first interaction with the Home screen. Both got no response. Both recovered and moved on, but both experienced a moment of broken expectation.

**Evidence:**
- P1 [03:10]: Taps `$133` tile. "Thought that might open something. Nope." `[FA]`
- P2 [03:00]: Taps `Rarely used — 2` tile. "Not tappable. That's a bit frustrating." `[FA]`
- P2 end-of-session: "If that tile went somewhere useful, I think a lot of people would start there."

**Why this is high severity:** First-tap failures shape trust before the user has seen the app's best feature. Both participants recovered, but the first thing they did was fail. In a real context (not a test), some users would set the phone down here.

**Change:** Make all four KPI tiles tappable. → see Changes list.

---

### Finding 2: Data error — Netflix/Apple TV+ savings badge — HIGH severity, 1/2 (data quality)
**What happened:** The savings badge on the Netflix/Apple TV+ insight card reads "Save $15/yr." The correct figure for cancelling a $15.99/mo subscription is $191.88/yr. The `data.ts` AI_INSIGHTS entry for this insight has `savings: 15.99` — a monthly figure stored in a field used as an annual saving.

**Evidence:**
- P2 [11:45]: "If you cancel Netflix at $15.99 a month, you'd save nearly two hundred a year, not fifteen. I think that's a bug."
- P1 [07:00]: "The number feels small compared to the Adobe one." (noticed but didn't calculate)

**Why this is high severity despite only P2 explicitly flagging it:** This number propagates upward into the hero "Potential Annual Savings $759" figure on the Insights screen. With the corrected value, the true total should be approximately $935, not $759. The headline value proposition of the Insights screen is understated by ~$176 due to this single data entry error.

**Change:** Fix `savings: 15.99` → `savings: 191.88` in `data.ts`. → see Changes list.

---

### Finding 3: State persistence gap after actions — MEDIUM severity, 2/2 participants
**What happened:** After performing actions (cancelling Adobe, adding detected subscriptions, pausing Adobe), neither participant saw the Home screen KPI counts or subscription statuses update. Both flagged this as something they would expect to see update.

**Evidence:**
- P1 [16:20]: "Nothing changed on the home screen after I added those subscriptions. Would I expect it to update?"
- P1 [19:40]: "I thought I cancelled it but it still shows active."
- P2 [25:30]: "The rarely used — 2 still says 2 even though I just paused Adobe."

**Root cause:** SUBSCRIPTIONS and DETECTED_SUBSCRIPTIONS are separate static arrays. The prototype does not persist state between component renders — actions taken in ProviderConnectFlow or SubscriptionDetail do not write back to the SUBSCRIPTIONS array.

**Why this matters even in a prototype:** Evaluators and test participants will judge the product on what they see, not on what they're told is "just a prototype limitation." If the demo at Day 8 shows a KPI grid that never updates, observers will correctly note it as a gap.

**Change:** Not a full state architecture fix for now, but: add a visible acknowledgement when an action completes. The DoneStep already does this for Connect. Individual cancel/pause actions should show a brief toast or status change. → see Changes list.

---

### Finding 4: "Pause" action semantics ambiguous — MEDIUM severity, 1/2 participants
**What happened:** P2 tapped Pause on Adobe's detail screen and immediately asked whether she had paused her subscription with Adobe or just paused tracking in the app. She guessed tracking-only and moved on — but the uncertainty was explicit.

**Evidence:**
- P2 [09:00]: "Does that pause tracking in this app, or the actual subscription with Adobe?"
- In debrief, P2 identified this as the single element she would most want to clarify.

**The asymmetry:** Cancel routes to the provider's website with a redirect notice — making clear it's a real-world action. Pause makes no redirect — so it is tracking-only. But nothing on the button or surrounding UI communicates this distinction. The two buttons are visually equal partners on the same screen, suggesting equal weight, when they have fundamentally different scopes of action.

**Change:** Add a clarifying sub-label to the Pause button. → see Changes list.

---

### Finding 5: Cancel scan button creates anxiety — LOW severity, 1/2 participants, raised in debrief
**What happened:** P1 identified the "Cancel scan" button during the scanning screen as the element he would most want to remove from the app. He did not tap it, but its prominence created anxiety about accidentally losing the scan.

**Evidence:**
- P1 debrief [22:30]: "It creates this worry that I might accidentally tap it and lose the whole scan. I'd remove it, or make it much smaller."

**Context:** The scanning screen shows a 30-second progress animation. The user has just granted Gmail permission. An accidental tap on Cancel at this moment would be genuinely consequential — the scan would have to be restarted from the permissions screen. The button is prominent enough that a user with slightly shaky hands or a small phone screen could fat-finger it.

**Change:** Demote Cancel scan from a button to a small text link at the bottom of the scanning screen, below the progress checklist. → see Changes list.

---

### Finding 6: Usage score methodology opacity — LOW severity, 2/2 participants
**What happened:** Both participants questioned how usage scores are calculated after seeing them on the Insights screen. Neither rejected the scores — both acted on the Adobe 34% figure — but both verbally flagged that knowing the methodology would increase their trust.

**Evidence:**
- P1 [20:50]: "I'd trust it more if I knew where '34%' comes from for Adobe."
- P2 [14:30]: "Is it counting how often I open the app, or is it guessing from email? Those are completely different things." Also noted: "For a freelancer, a rolling average would show me as low-usage but I'm not — I work in bursts."

**The trust gap:** Both participants acted on the insight despite the uncertainty. This means the opacity is not a conversion-blocker today. But at scale — when a user is deciding whether to cancel a $55/month Adobe plan they actually need — the "do I trust this number?" question becomes a blocker.

**What would close this gap without adding a new screen:** A single line of methodology beneath each usage score — e.g., "Based on receipt frequency over 90 days" — would answer the "how does it know?" question without requiring users to navigate elsewhere.

**Change:** Add a methodology sub-line beneath each usage score in the Insights screen. → see Changes list.

---

### Finding 7: "Account" field on detail screen conflates two concepts — LOW severity, 1/2 participants
**What happened:** P2 noticed that "Chase Checking ••4821" on a subscription detail screen could mean either "this subscription was detected from your Chase bank data" or "this subscription is charged to your Chase card." She identified these as two different things for a user tracking freelance expenses.

**Evidence:**
- P2 [07:30]: "Was it auto-detected by scanning the bank, or did John manually assign it to that bank card as a record?"
- P2 debrief: Identified the Account field as the single element she would most want to clarify.

**Why P1 didn't notice:** Marcus has no professional reason to distinguish detection source from payment destination. For him they are the same question. For Priya — and for any business user separating personal and work expenses — they are different.

**What "fixing" this would require:** Two separate fields on the detail screen: "Detected from" and "Charged to." This is a product decision more than a UI fix — the current data model uses a single `account` field that stores the payment account, which is used as a proxy for detection source. In the full data model, these should be separate. For the prototype, consider adding a small label clarifying what the Account field means.

**Change:** Clarify the Account field label — defer full separation to the product backlog. → see Changes list.

---

## Changes to Implement

### Implementing now (bugs or unambiguous fixes)

**Change 1 — Fix the Netflix savings data error**
`data.ts` line 281: `savings: 15.99` → `savings: 191.88`

Justification: Data error that understates the headline savings figure by ~$176. P2 calculated it on the spot and called it a bug. This propagates into the Potential Annual Savings hero number. One-line fix, zero risk.

---

**Change 2 — Make KPI tiles tappable**
`HomeScreen.tsx`: Convert the KPI grid `<div>` elements to `<button>` elements with `onClick` handlers using the existing `onNavigate` prop.

Routing:
- Monthly → `onNavigate("subscriptions")` — see full list to understand spending
- Active → `onNavigate("subscriptions")` — see all active subscriptions
- Rarely used → `onNavigate("subscriptions")` — Subscriptions screen, user can then filter by usage
- Renewals → `onNavigate("insights")` — Insights screen has the renewal alerts section

Justification: The highest-confidence finding from both sessions. Both participants' first tap in the app was a KPI tile. Both got nothing. The visual language (card, number, sub-label) promises navigation. The routing choices are debatable (A/B territory) but any navigation is better than none. Using `onNavigate("subscriptions")` for the first three and `onNavigate("insights")` for Renewals aligns with where each type of information already lives.

---

**Change 3 — Demote the Cancel scan button**
`ProviderConnectFlow.tsx` (scanning step): Change the "Cancel scan" `<button>` to a plain text link, positioned below the checklist at the bottom of the screen, with reduced visual weight.

Justification: P1 named this as the element he would most want to remove. The button creates anxiety about accidental cancellation at a high-stakes moment (30-second scan already in progress, permission already granted). A text link is still discoverable for users who genuinely want to cancel, but removes the fat-finger risk.

---

**Change 4 — Clarify the Pause button scope**
`SubscriptionDetail.tsx`: Add a sub-label beneath the Pause button reading "Pauses tracking in this app."

Justification: P2 was explicitly uncertain about whether Pause applied to the tracking or the provider subscription. Cancel routes to the provider (with a redirect notice), making its scope clear. Pause makes no such signal. A one-line clarification resolves the ambiguity without changing the button's behaviour.

---

### Deferring to next iteration (need more design thinking)

**Change 5 — Usage score methodology line**
Add a small methodology note beneath each usage score bar in the Insights screen.
Defer because: requires a decision on what the methodology actually is, so we can state it accurately. In the prototype the scores are hardcoded — stating a methodology that doesn't match the real algorithm would be worse than saying nothing. Revisit once the detection algorithm is defined.

**Change 6 — Account field label clarification**
Add a small label to the Account field on subscription detail screens clarifying whether it means "detected from" or "charged to."
Defer because: the root issue is a data model decision (single `account` field vs. separate `detectedFrom` + `chargedTo` fields). UI-patching without the model change would be misleading. Raise as a product backlog item.

**Change 7 — Confidence pill first-encounter hint**
Consider a one-time session hint on the first confidence pill a user encounters in Results step.
Defer because: the current system already works (both participants self-recovered). Adding a hint risks being patronising to Priya-type users. Worth testing, not worth implementing unilaterally.

**Change 8 — State persistence (tracked → dashboard update)**
Full state management so actions in ProviderConnectFlow and SubscriptionDetail write back to the shared subscription list.
Defer because: this is an architecture change (shared state / context) that requires more time than is available before Day 8. Partially mitigated by the existing DoneStep confirmation after Connect. Add a toast confirmation for individual cancel/pause actions as a lightweight bridge (this is implementable — added below).

---

**Change 9 (lightweight bridge for Change 8) — Post-action toast confirmations**
`SubscriptionDetail.tsx`: After Cancel or Pause actions, show a brief toast notification confirming the action was recorded ("Adobe marked as cancelled in your tracker" / "Adobe tracking paused").

Justification: Closes the trust gap P1 and P2 both identified without requiring full state architecture. Makes clear that something happened, even if the dashboard number hasn't updated. Use the existing Sonner toast library already installed in the project.

---

## A/B Test Candidate

**Screen:** Home screen KPI tiles — specifically the "Rarely used" tile.
**Hypothesis:** Tapping "Rarely used" routes to the Subscriptions screen with a usage filter pre-applied.
**Variable A:** Routes to Subscriptions list (full, unfiltered) — matches P2's expectation ("I want to see the list")
**Variable B:** Routes to Insights screen — matches P1's navigation path (he went to Insights first)
**Metric:** Task completion time on the "figure out where money is going" task; whether participant uses Insights before Subscriptions or vice versa.
**Why this is a good A/B candidate:** P1 and P2 genuinely disagreed on where this should go. P1 is a list-averse user who wants summaries; Insights suits him. P2 is a list-first user who wants raw data; Subscriptions suits her. The split reflects a real product question about the app's primary audience.
