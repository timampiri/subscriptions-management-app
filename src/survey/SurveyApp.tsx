import { useState } from "react";
import { submitResponse } from "../lib/supabase";

const variant = new URLSearchParams(window.location.search).get("v") ?? "a";
const prototypeUrl = `${window.location.origin}/?v=${variant}`;

const TASK_TEXT = `You've been meaning to get on top of your subscriptions. Using this app:

1. Find out how much you're spending per month.
2. Identify which subscriptions you use the least.
3. Decide what you want to do with one of them — cancel, pause, or keep it — and take that action in the app.

There's no right or wrong answer. Take your time.`;

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
const Q9_OPTIONS = ["Daily", "A few times a week", "Weekly", "Monthly", "Rarely / only when something comes up"];
const LIKERT_LABELS: Record<number, string> = { 1: "Strongly disagree", 3: "Neutral", 5: "Strongly agree" };

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ width: "100%", height: "4px", background: "var(--app-border)", borderRadius: "2px", marginBottom: "32px" }}>
      <div style={{ height: "100%", width: `${(step / total) * 100}%`, background: "var(--app-blue)", borderRadius: "2px", transition: "width 0.3s ease" }} />
    </div>
  );
}

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

function LikertScale({ value, onChange, id }: { value: number | null; onChange: (v: number) => void; id: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
      {[1, 2, 3, 4, 5].map(n => (
        <label key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", flex: 1 }}>
          <input
            type="radio"
            name={`likert-${id}`}
            checked={value === n}
            onChange={() => onChange(n)}
            style={{ accentColor: "var(--app-blue)", width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span style={{ fontSize: "11px", color: "var(--app-text-muted)", textAlign: "center", lineHeight: 1.2 }}>
            {LIKERT_LABELS[n] ?? n}
          </span>
        </label>
      ))}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 12px", borderRadius: "10px", border: `1px solid ${value === opt ? "var(--app-blue)" : "var(--app-border)"}`, background: value === opt ? "var(--app-blue-bg, #EBF2FF)" : "var(--app-surface)" }}>
          <input type="radio" checked={value === opt} onChange={() => onChange(opt)} style={{ accentColor: "var(--app-blue)", cursor: "pointer" }} />
          <span style={{ fontSize: "14px", color: "var(--app-text-primary)" }}>{opt}</span>
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
            transition: "all 0.15s ease",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px" }}>
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
        marginTop: "8px", opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function SurveyApp() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [profession, setProfession] = useState("");
  const [taskStartedAt, setTaskStartedAt] = useState<string | null>(null);
  const [taskCompletedAt, setTaskCompletedAt] = useState<string | null>(null);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState<number | null>(null);
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState<number | null>(null);
  const [q6, setQ6] = useState<number | null>(null);
  const [q7, setQ7] = useState("");
  const [q8, setQ8] = useState("");
  const [q9, setQ9] = useState("");
  const [q10, setQ10] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function startTask() {
    setTaskStartedAt(new Date().toISOString());
    setStep(2);
  }

  function completeTask() {
    setTaskCompletedAt(new Date().toISOString());
    setStep(3);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await submitResponse({
        variant,
        participant_name: name || null,
        age_range: ageRange || null,
        profession: profession || null,
        task_started_at: taskStartedAt,
        task_completed_at: taskCompletedAt,
        survey_completed_at: new Date().toISOString(),
        q1: q1 || null, q2, q3: q3 || null, q4: q4 || null, q5, q6,
        q7: q7 || null, q8: q8 || null, q9: q9 || null, q10: q10 || null,
      });
      setStep(4);
    } catch {
      setError("Submission failed — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: full-screen two-panel layout
  if (step === 2) {
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Left: task panel */}
        <div style={{ width: "380px", flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--app-border)", background: "var(--app-card)", padding: "32px 28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ height: "4px", flex: 1, background: "var(--app-border)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: "50%", background: "var(--app-blue)", borderRadius: "2px" }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--app-text-muted)", whiteSpace: "nowrap" }}>Step 2 of 4</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--app-blue)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Version {variant.toUpperCase()}
            </span>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--app-text-primary)", margin: "6px 0 4px" }}>
              Complete the task
            </h1>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", margin: 0 }}>
              Use the prototype on the right. Come back here when done.
            </p>
          </div>

          <div style={{ background: "var(--app-surface)", borderRadius: "12px", padding: "18px 20px", flex: 1, overflowY: "auto" }}>
            <p style={{ fontSize: "14px", color: "var(--app-text-primary)", lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>
              {TASK_TEXT}
            </p>
          </div>

          <button
            onClick={completeTask}
            style={{
              marginTop: "20px", padding: "14px 20px", borderRadius: "12px", border: "none",
              background: "var(--app-blue)", color: "#fff", fontSize: "15px", fontWeight: 600,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            I've completed the task →
          </button>
        </div>

        {/* Right: prototype iframe */}
        <div style={{ flex: 1, overflow: "hidden", background: "var(--app-outer-bg, #F5F5F7)" }}>
          <iframe src={prototypeUrl} style={{ width: "100%", height: "100%", border: "none" }} title="Prototype" />
        </div>
      </div>
    );
  }

  const shell: React.CSSProperties = {
    minHeight: "100vh", background: "var(--app-outer-bg, #F5F5F7)",
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "40px 20px", fontFamily: "'DM Sans', sans-serif",
  };
  const container: React.CSSProperties = { width: "100%", maxWidth: "600px" };

  return (
    <div style={shell}>
      <div style={container}>
        <ProgressBar step={step === 3 ? 3 : step === 4 ? 4 : 1} total={4} />

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

            <Card>
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
            </Card>

            <Card>
              <Label>What's your age range?</Label>
              <PillGroup options={AGE_RANGES} value={ageRange} onChange={setAgeRange} />
            </Card>

            <Card>
              <Label>What best describes your profession?</Label>
              <RadioGroup options={PROFESSIONS} value={profession} onChange={setProfession} />
            </Card>

            <PrimaryButton onClick={startTask} disabled={!name.trim() || !ageRange || !profession}>
              Start →
            </PrimaryButton>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px" }}>
              Quick questions
            </h1>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "24px" }}>
              Don't re-open the app — answer from memory where asked.
            </p>

            <Card>
              <Label>Q1 — Without looking at the app, which section or tab showed you how much you spend per month?</Label>
              <Textarea value={q1} onChange={setQ1} />
            </Card>

            <Card>
              <Label>Q2 — How confident are you that you found all the information you needed?</Label>
              <Hint>1 = Not confident at all · 5 = Completely confident</Hint>
              <LikertScale id="q2" value={q2} onChange={setQ2} />
            </Card>

            <Card>
              <Label>Q3 — In your own words, what's the difference between the tabs you used most?</Label>
              <Textarea value={q3} onChange={setQ3} />
            </Card>

            <Card>
              <Label>Q4 — If you wanted to add a new subscription, where would you start? Describe the steps.</Label>
              <Textarea value={q4} onChange={setQ4} />
            </Card>

            <Card>
              <Label>Q5 — I found this app easy to navigate.</Label>
              <Hint>1 = Strongly disagree · 5 = Strongly agree</Hint>
              <LikertScale id="q5" value={q5} onChange={setQ5} />
            </Card>

            <Card>
              <Label>Q6 — I would need to spend time learning this app before feeling confident.</Label>
              <Hint>1 = Strongly disagree · 5 = Strongly agree</Hint>
              <LikertScale id="q6" value={q6} onChange={setQ6} />
            </Card>

            <Card>
              <Label>Q7 — Was there any moment where you weren't sure where to tap next? If yes, describe what you were trying to do.</Label>
              <Textarea value={q7} onChange={setQ7} placeholder="Or type 'No' if everything felt clear." />
            </Card>

            <Card>
              <Label>Q8 — Where would you expect to find AI-powered saving suggestions — which tab or section?</Label>
              <Textarea value={q8} onChange={setQ8} />
            </Card>

            <Card>
              <Label>Q9 — How often would you realistically open an app like this?</Label>
              <RadioGroup options={Q9_OPTIONS} value={q9} onChange={setQ9} />
            </Card>

            <Card>
              <Label>Q10 — If you could rename or move one thing in the bottom navigation, what would it be and why?</Label>
              <Textarea value={q10} onChange={setQ10} />
            </Card>

            {error && (
              <p style={{ color: "var(--app-red)", fontSize: "13px", marginBottom: "8px" }}>{error}</p>
            )}
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit answers"}
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
