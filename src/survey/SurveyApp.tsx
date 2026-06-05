import { useState } from "react";
import { submitResponse } from "../lib/supabase";

const variant = new URLSearchParams(window.location.search).get("v") ?? "a";
const prototypeUrl = `${window.location.origin}/?v=${variant}`;

const TASKS = [
  { text: "Find out how much you're spending per month and what category you spend the most money on." },
  { text: "Identify which subscriptions you use the least and cancel one of them." },
  { text: "Add a new auto-tracked subscription by connecting your Gmail account, then add all subscriptions to track." },
];

const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];
const PROFESSIONS = [
  "Student",
  "Designer / Creative",
  "Engineer / Developer",
  "Product / Project Manager",
  "Marketing / Sales",
  "Finance / Business",
  "Healthcare",
  "Education / Teaching",
  "Other",
];
const LEARNABILITY_OPTIONS = [
  "Very difficult — I couldn't find what I was looking for",
  "Difficult — it took significant effort",
  "Neutral — neither easy nor hard",
  "Easy — mostly straightforward",
  "Very easy — everything was where I expected it",
];
const USAGE_INTENT_OPTIONS = [
  "Daily",
  "A few times a week",
  "Weekly",
  "Monthly",
  "Rarely / only when something comes up",
];

// ── UI helpers ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--app-text-primary)", marginBottom: "8px", lineHeight: 1.4 }}>
      {children}
    </p>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginBottom: "10px", lineHeight: 1.4 }}>
      {children}
    </p>
  );
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? "Type your answer here…"}
      rows={3}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: "10px", resize: "vertical",
        border: "1px solid var(--app-border)", background: "var(--app-surface)",
        color: "var(--app-text-primary)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
        outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${value === opt ? "var(--app-blue)" : "var(--app-border)"}`, background: value === opt ? "var(--app-blue-bg, #EBF2FF)" : "var(--app-surface)" }}>
          <input type="radio" checked={value === opt} onChange={() => onChange(opt)} style={{ accentColor: "var(--app-blue)", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
          <span style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.4 }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: "8px 18px", borderRadius: "999px",
            border: `1.5px solid ${value === opt ? "var(--app-blue)" : "var(--app-border)"}`,
            background: value === opt ? "var(--app-blue)" : "var(--app-surface)",
            color: value === opt ? "#fff" : "var(--app-text-primary)",
            fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function NPSScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  function color(n: number) {
    if (n <= 6) return "#EF4444";
    if (n <= 8) return "#F59E0B";
    return "#10B981";
  }
  return (
    <div>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            style={{
              flex: 1, minWidth: 0, padding: "10px 2px", borderRadius: "8px",
              border: `1.5px solid ${value === i ? color(i) : "var(--app-border)"}`,
              background: value === i ? color(i) : "var(--app-surface)",
              color: value === i ? "#fff" : "var(--app-text-primary)",
              fontSize: "13px", fontWeight: value === i ? 700 : 400,
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
        <span style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>Not at all likely</span>
        <span style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>Extremely likely</span>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: "14px", padding: "16px 18px", marginBottom: "12px" }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "14px", borderRadius: "12px", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "var(--app-border)" : "var(--app-blue)",
        color: disabled ? "var(--app-text-muted)" : "#fff",
        fontSize: "15px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SurveyApp() {
  const [step, setStep] = useState(1);
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState<string[]>([]);

  // Demographics
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [profession, setProfession] = useState("");

  // Per-task timing — parallel arrays indexed by task number
  const [taskStartTimes, setTaskStartTimes] = useState<string[]>([]);
  const [taskEndTimes, setTaskEndTimes] = useState<string[]>([]);

  // Questions
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4Choice, setQ4Choice] = useState("");
  const [q4Detail, setQ4Detail] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  const [q7, setQ7] = useState("");
  const [nps, setNps] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function startTask() {
    setTaskStartTimes([new Date().toISOString()]);
    setStep(2);
  }

  function handleTaskDone(result: "completed" | "failed") {
    const now = new Date().toISOString();
    setTaskResults(prev => [...prev, result]);
    setTaskEndTimes(prev => [...prev, now]);
    if (taskIndex < TASKS.length - 1) {
      setTaskStartTimes(prev => [...prev, now]);
      setTaskIndex(taskIndex + 1);
    } else {
      setStep(3);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const q4Value = q4Choice === "No" ? "No" : (q4Detail.trim() || (q4Choice === "Yes" ? "Yes (no description)" : null));
      await submitResponse({
        variant,
        participant_name: name || null,
        age_range: ageRange || null,
        profession: profession || null,
        task_started_at: taskStartTimes[0] ?? null,
        task_completed_at: taskEndTimes[TASKS.length - 1] ?? null,
        survey_completed_at: new Date().toISOString(),
        task1_started_at: taskStartTimes[0] ?? null,
        task1_ended_at: taskEndTimes[0] ?? null,
        task2_started_at: taskStartTimes[1] ?? null,
        task2_ended_at: taskEndTimes[1] ?? null,
        task3_started_at: taskStartTimes[2] ?? null,
        task3_ended_at: taskEndTimes[2] ?? null,
        q1: q1 || null,
        q2: q2 || null,
        q3: q3 || null,
        q4: q4Value,
        q5: q5 || null,
        q6: q6 || null,
        q7: q7 || null,
        q8: taskResults[0] ?? null,
        q9: taskResults[1] ?? null,
        q10: taskResults[2] ?? null,
        nps,
      });
      setStep(4);
    } catch {
      setError("Submission failed — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Two-panel layout (steps 2 and 3) ──────────────────────────────────────

  if (step === 2 || step === 3) {
    const progressWidth = step === 2
      ? `${25 + ((taskIndex + 1) / TASKS.length) * 37}%`
      : "75%";

    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Left panel */}
        <div style={{ width: "440px", flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--app-border)", background: "var(--app-card)" }}>

          {/* Fixed header */}
          <div style={{ padding: "24px 28px 16px", flexShrink: 0, borderBottom: "1px solid var(--app-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ height: "4px", flex: 1, background: "var(--app-border)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: progressWidth, background: "var(--app-blue)", borderRadius: "2px", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--app-text-muted)", whiteSpace: "nowrap" }}>
                Step {step} of 4
              </span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--app-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Version {variant.toUpperCase()}
            </span>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "var(--app-text-primary)", margin: "4px 0 2px" }}>
              {step === 2 ? `Task ${taskIndex + 1} of ${TASKS.length}` : "Quick questions"}
            </h1>
            <p style={{ fontSize: "12px", color: "var(--app-text-muted)", margin: 0 }}>
              {step === 2
                ? "Use the prototype on the right. Come back here when done."
                : "Feel free to refer back to the prototype on the right."}
            </p>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px" }}>

            {step === 2 && (
              <>
                {/* Prototype disclaimer */}
                <div style={{
                  background: "var(--app-surface)", borderRadius: "10px",
                  padding: "10px 14px", marginBottom: "16px",
                  borderLeft: "3px solid var(--app-orange, #F59E0B)",
                  border: "1px solid var(--app-border)",
                }}>
                  <p style={{ fontSize: "12px", color: "var(--app-text-muted)", margin: 0, lineHeight: 1.5 }}>
                    ⚠️ This is a prototype — some features may not be fully functional yet.
                  </p>
                </div>

                {/* Task text */}
                <div style={{ background: "var(--app-surface)", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "14px", color: "var(--app-text-primary)", lineHeight: 1.75, margin: 0 }}>
                    {TASKS[taskIndex].text}
                  </p>
                </div>

                <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginBottom: "20px", lineHeight: 1.4 }}>
                  There's no right or wrong answer. Take your time.
                </p>

                <button
                  onClick={() => handleTaskDone("completed")}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: "var(--app-blue)", color: "#fff", fontSize: "15px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: "8px",
                    display: "block",
                  }}
                >
                  {taskIndex < TASKS.length - 1 ? "Task completed → Next task" : "Task completed → Questions"}
                </button>

                <button
                  onClick={() => handleTaskDone("failed")}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "12px",
                    border: "1px solid var(--app-border)", background: "transparent",
                    color: "var(--app-text-secondary)", fontSize: "14px", fontWeight: 500,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "block",
                  }}
                >
                  Couldn't complete · Skip to {taskIndex < TASKS.length - 1 ? "next task" : "questions"}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <Card>
                  <Label>Q1 — Learnability</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    How was your experience of finding information that you needed?
                  </p>
                  <RadioGroup options={LEARNABILITY_OPTIONS} value={q1} onChange={setQ1} />
                </Card>

                <Card>
                  <Label>Q2 — Navigation clarity</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    Was there any moment where you weren't sure where to tap next? If yes, describe what you were trying to do.
                  </p>
                  <Textarea value={q2} onChange={setQ2} placeholder="Type 'No' if everything felt clear." />
                </Card>

                <Card>
                  <Label>Q3 — First impression</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    If you had to describe this app to a friend in one sentence, what would you say?
                  </p>
                  <Textarea value={q3} onChange={setQ3} />
                </Card>

                <Card>
                  <Label>Q4 — Feature discoverability</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    During your time with the app, did you notice any feature you weren't sure what it does?
                  </p>
                  <RadioGroup options={["Yes", "No"]} value={q4Choice} onChange={setQ4Choice} />
                  {q4Choice === "Yes" && (
                    <div style={{ marginTop: "10px" }}>
                      <Textarea value={q4Detail} onChange={setQ4Detail} placeholder="Please describe which feature and what was unclear…" />
                    </div>
                  )}
                </Card>

                <Card>
                  <Label>Q5 — Unmet expectations</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    Is there anything you expected the app to do that it didn't?
                  </p>
                  <Textarea value={q5} onChange={setQ5} />
                </Card>

                <Card>
                  <Label>Q6 — Desired features</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    Is there a feature you would like to have in a similar subscription management app?
                  </p>
                  <Textarea value={q6} onChange={setQ6} />
                </Card>

                <Card>
                  <Label>Q7 — Usage intent</Label>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", marginBottom: "10px" }}>
                    How often would you realistically open an app like this?
                  </p>
                  <RadioGroup options={USAGE_INTENT_OPTIONS} value={q7} onChange={setQ7} />
                </Card>

                <Card>
                  <Label>Q8 — Recommendation likelihood</Label>
                  <Hint>How likely are you to recommend this app to a friend?</Hint>
                  <NPSScale value={nps} onChange={setNps} />
                </Card>

                {error && (
                  <p style={{ color: "var(--app-red)", fontSize: "13px", margin: "0 0 8px" }}>{error}</p>
                )}
                <PrimaryButton onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit answers"}
                </PrimaryButton>
              </>
            )}
          </div>
        </div>

        {/* Right panel — prototype */}
        <div style={{ flex: 1, overflow: "hidden", background: "var(--app-outer-bg, #F5F5F7)" }}>
          <iframe src={prototypeUrl} style={{ width: "100%", height: "100%", border: "none" }} title="Prototype" />
        </div>
      </div>
    );
  }

  // ── Standard centred shell (steps 1 and 4) ────────────────────────────────

  const shell: React.CSSProperties = {
    minHeight: "100vh", background: "var(--app-outer-bg, #F5F5F7)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "40px 20px", fontFamily: "'DM Sans', sans-serif",
  };
  const container: React.CSSProperties = { width: "100%", maxWidth: "600px" };

  return (
    <div style={shell}>
      <div style={container}>
        {step === 1 && (
          <div style={{ width: "100%", height: "4px", background: "var(--app-border)", borderRadius: "2px", marginBottom: "32px" }}>
            <div style={{ height: "100%", width: "25%", background: "var(--app-blue)", borderRadius: "2px" }} />
          </div>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: "12px", color: "var(--app-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Version {variant.toUpperCase()}
            </p>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px" }}>
              Welcome to our study
            </h1>
            <p style={{ fontSize: "15px", color: "var(--app-text-secondary)", marginBottom: "32px", lineHeight: 1.5 }}>
              This takes about 10 minutes. You'll use a prototype app, then answer a few short questions.
            </p>

            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px" }}>
              <Label>What's your name or nickname?</Label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid var(--app-border)", background: "var(--app-surface)",
                  color: "var(--app-text-primary)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px" }}>
              <Label>What's your age range?</Label>
              <PillGroup options={AGE_RANGES} value={ageRange} onChange={setAgeRange} />
            </div>

            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px" }}>
              <Label>What best describes your profession?</Label>
              <RadioGroup options={PROFESSIONS} value={profession} onChange={setProfession} />
            </div>

            <PrimaryButton onClick={startTask} disabled={!name.trim() || !ageRange || !profession}>
              Start →
            </PrimaryButton>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px" }}>
              Thank you, {name}!
            </h1>
            <p style={{ fontSize: "15px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
              Your responses have been recorded. You can close this tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
