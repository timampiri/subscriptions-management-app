
# Subscriptions Management App

A subscription tracking prototype — find, review, and manage recurring payments. Built in React/Vite as a 390×844 phone-frame prototype for HCI user testing.

Original Figma source: [Subscriptions Management App](https://www.figma.com/design/Sfue2CEUeAaG6dIH5AeQdo/Subscriptions-Management-App)

---

## Live links

| | URL |
|---|---|
| **Prototype — Version A** | https://subscriptions-management-app.vercel.app/?v=a |
| **Prototype — Version B** | https://subscriptions-management-app.vercel.app/?v=b |
| Survey — Version A participants | https://subscriptions-management-app.vercel.app/survey?v=a |
| Survey — Version B participants | https://subscriptions-management-app.vercel.app/survey?v=b |
| Results dashboard | https://subscriptions-management-app.vercel.app/results |

---

## A/B test status

Testing complete (n=4, 2 per variant). **Version B selected** — 100% task completion vs 83% for A, avg NPS 9.5 vs 8.5. Proceeding with Version B as the canonical design for Day 7–8 revisions.

Full findings and revision plan: [Revision-List.md](Revision-List.md)

---

## Running locally

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:5173`. Append `?v=b` to test Version B navigation locally.

---

## Project docs

| File | Contents |
|---|---|
| [ab-test-materials.md](ab-test-materials.md) | A/B test hypothesis, task script, 10 post-completion questions, scoring guide |
| [testing-protocol.md](testing-protocol.md) | HCI methodology, session checklists, consent template, observation sheets |
| [testing-results.md](testing-results.md) | Pre-A/B session synthesis — SUS scores, behavioral patterns, severity-ranked findings |
| [Revision-List.md](Revision-List.md) | 15 revisions (R-01–R-15) with participant evidence, alternatives, priority, and status |
| [development-plan.csv](development-plan.csv) | Day-by-day build log with task status, hours, and learnings |
