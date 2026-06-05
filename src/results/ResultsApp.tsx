import { useState, useEffect } from "react";
import { fetchResponses, deleteResponse, Response } from "../lib/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

function taskDurationMs(r: Response): number | null {
  if (!r.task_started_at || !r.task_completed_at) return null;
  return new Date(r.task_completed_at).getTime() - new Date(r.task_started_at).getTime();
}

function totalTaskDurationMs(r: Response): number | null {
  const parts = [0, 1, 2].map(i => perTaskDurationMs(r, i)).filter((d): d is number => d !== null);
  if (parts.length === 3) return parts.reduce((a, b) => a + b, 0);
  return taskDurationMs(r);
}

function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

function meanDuration(rows: Response[], fn: (r: Response) => number | null = taskDurationMs): string {
  const ds = rows.map(fn).filter((d): d is number => d !== null);
  if (!ds.length) return "—";
  return formatDuration(ds.reduce((a, b) => a + b, 0) / ds.length);
}

const TIME_BUCKETS = ["<1m", "1–2m", "2–3m", "3–5m", ">5m"];

function timeBucket(ms: number): string {
  const m = ms / 60000;
  if (m < 1) return "<1m";
  if (m < 2) return "1–2m";
  if (m < 3) return "2–3m";
  if (m < 5) return "3–5m";
  return ">5m";
}

const TASK_LABELS = [
  "Task 1 — Find monthly spend & top category",
  "Task 2 — Cancel underused subscription",
  "Task 3 — Connect Gmail & add subscriptions",
];
const TASK_RESULT_KEYS: Array<"q8" | "q9" | "q10"> = ["q8", "q9", "q10"];
const TASK_START_KEYS: Array<keyof Response> = ["task1_started_at", "task2_started_at", "task3_started_at"];
const TASK_END_KEYS: Array<keyof Response> = ["task1_ended_at", "task2_ended_at", "task3_ended_at"];

function perTaskDurationMs(r: Response, i: number): number | null {
  const s = r[TASK_START_KEYS[i]] as string | null;
  const e = r[TASK_END_KEYS[i]] as string | null;
  if (!s || !e) return null;
  return new Date(e).getTime() - new Date(s).getTime();
}

function taskStats(rows: Response[], i: number) {
  const key = TASK_RESULT_KEYS[i];
  const attempted = rows.filter(r => r[key] !== null);
  const completed = attempted.filter(r => r[key] === "completed");
  const durations = attempted.map(r => perTaskDurationMs(r, i)).filter((d): d is number => d !== null);
  const avgDur = durations.length
    ? formatDuration(durations.reduce((a, b) => a + b, 0) / durations.length)
    : "—";
  return {
    rate: attempted.length ? `${completed.length}/${attempted.length}` : "—",
    avgDur,
    n: attempted.length,
  };
}

const AGE_RANGE_KEYS = ["18–24", "25–34", "35–44", "45–54", "55+"];
const PROFESSION_KEYS = [
  "Student", "Designer / Creative", "Engineer / Developer",
  "Product / Project Manager", "Marketing / Sales", "Finance / Business",
  "Healthcare", "Education / Teaching", "Other",
];
const LEARNABILITY_OPTIONS = [
  "Very difficult — I couldn't find what I was looking for",
  "Difficult — it took significant effort",
  "Neutral — neither easy nor hard",
  "Easy — mostly straightforward",
  "Very easy — everything was where I expected it",
];
const LEARNABILITY_SHORT: Record<string, string> = {
  "Very difficult — I couldn't find what I was looking for": "Very difficult",
  "Difficult — it took significant effort": "Difficult",
  "Neutral — neither easy nor hard": "Neutral",
  "Easy — mostly straightforward": "Easy",
  "Very easy — everything was where I expected it": "Very easy",
};
const USAGE_INTENT_OPTIONS = [
  "Daily", "A few times a week", "Weekly", "Monthly",
  "Rarely / only when something comes up",
];
const USAGE_SHORT: Record<string, string> = {
  "Daily": "Daily",
  "A few times a week": "Few/wk",
  "Weekly": "Weekly",
  "Monthly": "Monthly",
  "Rarely / only when something comes up": "Rarely",
};

function countByKey(
  rows: Response[],
  keyFn: (r: Response) => string | null,
  allKeys: string[],
): { label: string; count: number }[] {
  const map: Record<string, number> = {};
  allKeys.forEach(k => (map[k] = 0));
  rows.forEach(r => {
    const k = keyFn(r);
    if (k && allKeys.includes(k)) map[k]++;
  });
  return allKeys.map(k => ({ label: k, count: map[k] }));
}

function computeNPS(rows: Response[]) {
  const valid = rows.filter(r => r.nps !== null && r.nps !== undefined);
  if (!valid.length) return null;
  const detractors = valid.filter(r => (r.nps as number) <= 6).length;
  const passives = valid.filter(r => (r.nps as number) >= 7 && (r.nps as number) <= 8).length;
  const promoters = valid.filter(r => (r.nps as number) >= 9).length;
  const n = valid.length;
  const score = Math.round((promoters / n - detractors / n) * 100);
  return { score, detractors, passives, promoters, n };
}

function avgNPS(rows: Response[]): string {
  const nps = computeNPS(rows);
  if (!nps) return "—";
  return (nps.score > 0 ? "+" : "") + nps.score;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── UI components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ flex: 1, minWidth: "160px", background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "14px", padding: "16px 18px" }}>
      <p style={{ fontSize: "11px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{label}</p>
      <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}

function BarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "96px", paddingTop: "16px" }}>
      {data.map(({ label, count }) => (
        <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 0 }}>
          <span style={{ fontSize: "10px", color: "var(--app-text-muted)", fontFamily: "'DM Mono', monospace", visibility: count > 0 ? "visible" : "hidden" }}>{count}</span>
          <div style={{ width: "100%", height: `${Math.max((count / max) * 56, count > 0 ? 3 : 0)}px`, background: count > 0 ? color : "var(--app-border)", borderRadius: "4px 4px 0 0" }} />
          <span style={{ fontSize: "10px", color: "var(--app-text-muted)", textAlign: "center", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function NPSBar({ rows }: { rows: Response[] }) {
  const nps = computeNPS(rows);
  if (!nps) return <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>No NPS data yet.</p>;
  const { score, detractors, passives, promoters, n } = nps;
  return (
    <div>
      <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", marginBottom: "12px" }}>
        {score > 0 ? "+" : ""}{score}
      </p>
      <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", gap: "2px" }}>
        {detractors > 0 && <div style={{ flex: detractors, background: "#EF4444" }} />}
        {passives > 0 && <div style={{ flex: passives, background: "#F59E0B" }} />}
        {promoters > 0 && <div style={{ flex: promoters, background: "#10B981" }} />}
      </div>
      <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
        <span style={{ fontSize: "11px", color: "#EF4444" }}>Detractors {detractors} ({Math.round(detractors / n * 100)}%)</span>
        <span style={{ fontSize: "11px", color: "#D97706" }}>Passives {passives} ({Math.round(passives / n * 100)}%)</span>
        <span style={{ fontSize: "11px", color: "#059669" }}>Promoters {promoters} ({Math.round(promoters / n * 100)}%)</span>
      </div>
    </div>
  );
}

function ProfessionList({ data }: { data: { label: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count).filter(d => d.count > 0);
  if (!sorted.length) return <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>No data yet.</p>;
  const maxCount = sorted[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {sorted.map(({ label, count }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontSize: "12px", color: "var(--app-text-primary)" }}>{label}</span>
            <span style={{ fontSize: "12px", color: "var(--app-text-muted)", fontFamily: "'DM Mono', monospace" }}>{count}</span>
          </div>
          <div style={{ height: "4px", background: "var(--app-border)", borderRadius: "2px" }}>
            <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: "#7C3AED", borderRadius: "2px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function QualCard({ name, text, variant }: { name: string; text: string | null; variant: string }) {
  if (!text) return null;
  return (
    <div style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: variant === "a" ? "#DBEAFE" : "#EDE9FE", color: variant === "a" ? "#1D4ED8" : "#7C3AED" }}>
          {variant.toUpperCase()}
        </span>
        <span style={{ fontSize: "12px", color: "var(--app-text-muted)" }}>{name}</span>
      </div>
      <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

// ── Per-user expanded detail ───────────────────────────────────────────────────

function UserDetail({
  r,
  onDelete,
}: {
  r: Response;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dur = totalTaskDurationMs(r);

  const qa: { label: string; value: string | null }[] = [
    { label: "Q1 — Learnability", value: r.q1 },
    { label: "Q2 — Navigation clarity", value: r.q2 },
    { label: "Q3 — First impression", value: r.q3 },
    { label: "Q4 — Feature discoverability", value: r.q4 },
    { label: "Q5 — Unmet expectations", value: r.q5 },
    { label: "Q6 — Desired features", value: r.q6 },
    { label: "Q7 — Usage intent", value: r.q7 },
    { label: "Q8 — NPS", value: r.nps !== null && r.nps !== undefined ? String(r.nps) + " / 10" : null },
  ];

  async function handleDelete() {
    setDeleting(true);
    await onDelete(r.id);
    setDeleting(false);
  }

  return (
    <div style={{ padding: "20px 18px", background: "var(--app-surface)" }}>
      {/* Participant summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "14px", padding: "12px 14px", background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "10px" }}>
        {[
          ["Name", r.participant_name ?? "—"],
          ["Version", r.variant.toUpperCase()],
          ["Age", r.age_range ?? "—"],
          ["Profession", r.profession ?? "—"],
          ["Total task time", dur !== null ? formatDuration(dur) : "—"],
          ["Submitted", fmtTime(r.created_at)],
        ].map(([label, val]) => (
          <div key={label}>
            <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-primary)" }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Per-task breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {TASK_LABELS.map((label, i) => {
          const result = r[TASK_RESULT_KEYS[i]];
          const ms = perTaskDurationMs(r, i);
          const resultColor = result === "completed" ? "#059669" : result === "failed" ? "#EF4444" : "var(--app-text-muted)";
          return (
            <div key={i} style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "10px", padding: "10px 12px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Task {i + 1}
              </p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: resultColor, marginBottom: "2px", textTransform: "capitalize" }}>
                {result ?? "—"}
              </p>
              <p style={{ fontSize: "11px", color: "var(--app-text-muted)", fontFamily: "'DM Mono', monospace" }}>
                {ms !== null ? formatDuration(ms) : "—"}
              </p>
            </div>
          );
        })}
      </div>

      {/* All Q&A */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
        {qa.map(({ label, value }) => (
          value ? (
            <div key={label} style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{label}</p>
              <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{value}</p>
            </div>
          ) : null
        ))}
      </div>

      {/* Delete */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
        {confirmDelete ? (
          <>
            <span style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>Delete this response?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#EF4444", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--app-border)", background: "var(--app-card)", color: "var(--app-text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Delete response
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResultsApp() {
  const [rows, setRows] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchResponses());
    } catch {
      setError("Could not load responses. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteResponse(id);
    setRows(prev => prev.filter(r => r.id !== id));
    setExpanded(null);
  }

  const a = rows.filter(r => r.variant === "a");
  const b = rows.filter(r => r.variant === "b");

  // Chart data
  const timeBucketsA = (() => {
    const map: Record<string, number> = {};
    TIME_BUCKETS.forEach(k => (map[k] = 0));
    a.forEach(r => { const ms = taskDurationMs(r); if (ms !== null) map[timeBucket(ms)]++; });
    return TIME_BUCKETS.map(k => ({ label: k, count: map[k] }));
  })();
  const timeBucketsB = (() => {
    const map: Record<string, number> = {};
    TIME_BUCKETS.forEach(k => (map[k] = 0));
    b.forEach(r => { const ms = taskDurationMs(r); if (ms !== null) map[timeBucket(ms)]++; });
    return TIME_BUCKETS.map(k => ({ label: k, count: map[k] }));
  })();

  const learnabilityA = countByKey(a, r => r.q1, LEARNABILITY_OPTIONS).map(d => ({ ...d, label: LEARNABILITY_SHORT[d.label] ?? d.label }));
  const learnabilityB = countByKey(b, r => r.q1, LEARNABILITY_OPTIONS).map(d => ({ ...d, label: LEARNABILITY_SHORT[d.label] ?? d.label }));
  const usageA = countByKey(a, r => r.q7, USAGE_INTENT_OPTIONS).map(d => ({ ...d, label: USAGE_SHORT[d.label] ?? d.label }));
  const usageB = countByKey(b, r => r.q7, USAGE_INTENT_OPTIONS).map(d => ({ ...d, label: USAGE_SHORT[d.label] ?? d.label }));
  const ageData = countByKey(rows, r => r.age_range, AGE_RANGE_KEYS);
  const profData = countByKey(rows, r => r.profession, PROFESSION_KEYS);

  const qualQuestions: { key: keyof Response; label: string }[] = [
    { key: "q2", label: "Q2 — Navigation clarity" },
    { key: "q3", label: "Q3 — First impression" },
    { key: "q4", label: "Q4 — Feature discoverability" },
    { key: "q5", label: "Q5 — Unmet expectations" },
    { key: "q6", label: "Q6 — Desired features" },
  ];

  const shell: React.CSSProperties = {
    minHeight: "100vh", background: "var(--app-outer-bg, #F5F5F7)",
    padding: "40px 24px", fontFamily: "'DM Sans', sans-serif",
  };
  const container: React.CSSProperties = { maxWidth: "960px", margin: "0 auto" };
  const sectionTitle: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "14px" };
  const card: React.CSSProperties = { background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "14px", padding: "20px 22px" };

  return (
    <div style={shell}>
      <div style={container}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--app-text-primary)" }}>A/B Test Results</h1>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginTop: "2px" }}>
              {rows.length} response{rows.length !== 1 ? "s" : ""} · {a.length} Version A · {b.length} Version B
            </p>
          </div>
          <button onClick={load} style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid var(--app-border)", background: "var(--app-card)", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--app-text-primary)", fontFamily: "'DM Sans', sans-serif" }}>
            ↻ Refresh
          </button>
        </div>

        {error && <p style={{ color: "var(--app-red)", marginBottom: "24px", fontSize: "14px" }}>{error}</p>}
        {loading && <p style={{ color: "var(--app-text-muted)", fontSize: "14px" }}>Loading…</p>}

        {!loading && (
          <>
            {/* ── Overview stats ── */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
              <StatCard label="Version A" value={String(a.length)} sub={`NPS: ${avgNPS(a)}`} />
              <StatCard label="Version B" value={String(b.length)} sub={`NPS: ${avgNPS(b)}`} />
              <StatCard label="Avg task time A" value={meanDuration(a, totalTaskDurationMs)} sub={`${a.filter(r => totalTaskDurationMs(r) !== null).length} timed`} />
              <StatCard label="Avg task time B" value={meanDuration(b, totalTaskDurationMs)} sub={`${b.filter(r => totalTaskDurationMs(r) !== null).length} timed`} />
            </div>

            {/* ── Task completion ── */}
            {rows.length > 0 && (
              <>
                <h2 style={sectionTitle}>Task completion</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                  {TASK_LABELS.map((label, i) => {
                    const sA = taskStats(a, i);
                    const sB = taskStats(b, i);
                    return (
                      <div key={i} style={card}>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>{label}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          {([["a", sA, "#1D4ED8"], ["b", sB, "#7C3AED"]] as const).map(([ver, s, col]) => (
                            <div key={ver}>
                              <p style={{ fontSize: "11px", fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Version {ver.toUpperCase()}</p>
                              <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{s.rate}</p>
                              <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "4px" }}>
                                completed{s.n > 0 ? ` · avg ${s.avgDur}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── NPS ── */}
            {rows.length > 0 && (
              <>
                <h2 style={sectionTitle}>NPS — Recommendation likelihood</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Version A</p>
                    <NPSBar rows={a} />
                  </div>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Version B</p>
                    <NPSBar rows={b} />
                  </div>
                </div>

                {/* ── Task timing ── */}
                <h2 style={sectionTitle}>Task timing</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
                  {TASK_LABELS.map((label, i) => (
                    <div key={i} style={card}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                        {label}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {(["a", "b"] as const).map(ver => {
                          const varRows = (ver === "a" ? a : b).map(r => ({
                            name: r.participant_name ?? "—",
                            ms: perTaskDurationMs(r, i),
                            result: r[TASK_RESULT_KEYS[i]],
                          }));
                          const col = ver === "a" ? "#1D4ED8" : "#7C3AED";
                          const validMs = varRows.map(p => p.ms).filter((d): d is number => d !== null);
                          const avg = validMs.length
                            ? formatDuration(validMs.reduce((s, d) => s + d, 0) / validMs.length)
                            : "—";
                          return (
                            <div key={ver}>
                              <p style={{ fontSize: "11px", fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                                Version {ver.toUpperCase()}
                              </p>
                              <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", marginBottom: "10px" }}>
                                {avg}
                              </p>
                              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {varRows.map(p => {
                                  const done = p.result === "completed";
                                  const failed = p.result === "failed";
                                  const resultColor = done ? "#059669" : failed ? "#EF4444" : "var(--app-text-muted)";
                                  return (
                                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                                      <span style={{ color: resultColor, fontWeight: 700, width: "12px", flexShrink: 0 }}>
                                        {done ? "✓" : failed ? "✗" : "·"}
                                      </span>
                                      <span style={{ color: "var(--app-text-secondary)", minWidth: "56px" }}>{p.name}</span>
                                      <span style={{ color: "var(--app-text-muted)", fontFamily: "'DM Mono', monospace" }}>
                                        {p.ms !== null ? formatDuration(p.ms) : "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Learnability ── */}
                <h2 style={sectionTitle}>Q1 — Learnability</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Version A</p>
                    <BarChart data={learnabilityA} color="#1D4ED8" />
                  </div>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Version B</p>
                    <BarChart data={learnabilityB} color="#7C3AED" />
                  </div>
                </div>

                {/* ── Usage intent ── */}
                <h2 style={sectionTitle}>Q7 — Usage intent</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Version A</p>
                    <BarChart data={usageA} color="#1D4ED8" />
                  </div>
                  <div style={card}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Version B</p>
                    <BarChart data={usageB} color="#7C3AED" />
                  </div>
                </div>
              </>
            )}

            {/* ── Response table ── */}
            <h2 style={sectionTitle}>Responses</h2>
            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--app-surface)" }}>
                    {["Time", "Name", "Ver", "Duration", "NPS", "Learnability", "Age", "Profession"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--app-text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--app-border)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "var(--app-text-muted)" }}>No responses yet.</td></tr>
                  )}
                  {rows.map(r => {
                    const dur = totalTaskDurationMs(r);
                    const isExpanded = expanded === r.id;
                    return (
                      <>
                        <tr
                          key={r.id}
                          onClick={() => setExpanded(isExpanded ? null : r.id)}
                          style={{ cursor: "pointer", borderBottom: isExpanded ? "none" : "1px solid var(--app-border)", background: isExpanded ? "var(--app-surface)" : "transparent" }}
                        >
                          <td style={{ padding: "10px 14px", color: "var(--app-text-muted)", whiteSpace: "nowrap" }}>{fmtTime(r.created_at)}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--app-text-primary)" }}>{r.participant_name ?? "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: r.variant === "a" ? "#DBEAFE" : "#EDE9FE", color: r.variant === "a" ? "#1D4ED8" : "#7C3AED" }}>
                              {r.variant.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", color: "var(--app-text-secondary)" }}>{dur !== null ? formatDuration(dur) : "—"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.nps !== null && r.nps !== undefined ? r.nps : "—"}</td>
                          <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.q1 ? (LEARNABILITY_SHORT[r.q1] ?? r.q1) : "—"}
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", whiteSpace: "nowrap" }}>{r.age_range ?? "—"}</td>
                          <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.profession ?? "—"}</td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${r.id}-exp`} style={{ borderBottom: "1px solid var(--app-border)" }}>
                            <td colSpan={8} style={{ padding: 0 }}>
                              <UserDetail r={r} onDelete={handleDelete} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Participants ── */}
            {rows.length > 0 && (
              <>
                <h2 style={sectionTitle}>Participants</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                  <div style={card}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", marginBottom: "12px" }}>Age range</p>
                    <BarChart data={ageData} color="var(--app-blue)" />
                  </div>
                  <div style={card}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", marginBottom: "12px" }}>Profession</p>
                    <ProfessionList data={profData} />
                  </div>
                </div>

                {/* ── Qualitative ── */}
                <h2 style={sectionTitle}>Qualitative responses</h2>
                {qualQuestions.map(({ key, label }) => (
                  <div key={key} style={{ marginBottom: "28px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", marginBottom: "10px" }}>{label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Version A</p>
                        {a.map(r => <QualCard key={r.id} name={r.participant_name ?? "—"} text={r[key] as string | null} variant="a" />)}
                        {a.every(r => !r[key]) && <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>No responses yet.</p>}
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Version B</p>
                        {b.map(r => <QualCard key={r.id} name={r.participant_name ?? "—"} text={r[key] as string | null} variant="b" />)}
                        {b.every(r => !r[key]) && <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>No responses yet.</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
