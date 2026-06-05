import { useState, useEffect } from "react";
import { fetchResponses, deleteResponse, Response } from "../lib/supabase";

// ── Design tokens ─────────────────────────────────────────────────────────────

const A     = "#1D4ED8";
const A_BG  = "#DBEAFE";
const A_SOFT= "#EFF6FF";
const B     = "#7C3AED";
const B_BG  = "#EDE9FE";
const B_SOFT= "#F5F3FF";
const GREEN  = "#059669";
const GREEN_BG="#D1FAE5";
const RED    = "#EF4444";
const RED_BG = "#FEE2E2";
const DARK   = "#111827";
const MID    = "#374151";
const MUTED  = "#6B7280";
const BORDER = "#E5E7EB";
const PAGE   = "#F3F4F6";
const CARD   = "#FFFFFF";
const SURF   = "#F9FAFB";

// ── Data helpers ──────────────────────────────────────────────────────────────

const TASK_LABELS = [
  "Task 1 — Find monthly spend & top category",
  "Task 2 — Cancel underused subscription",
  "Task 3 — Connect Gmail & add subscriptions",
];
const TASK_RESULT_KEYS: Array<"q8" | "q9" | "q10"> = ["q8", "q9", "q10"];
const TASK_START_KEYS: Array<keyof Response> = ["task1_started_at", "task2_started_at", "task3_started_at"];
const TASK_END_KEYS:   Array<keyof Response> = ["task1_ended_at",   "task2_ended_at",   "task3_ended_at"];

function perTaskDurationMs(r: Response, i: number): number | null {
  const s = r[TASK_START_KEYS[i]] as string | null;
  const e = r[TASK_END_KEYS[i]]   as string | null;
  if (!s || !e) return null;
  return new Date(e).getTime() - new Date(s).getTime();
}

function taskDurationMs(r: Response): number | null {
  if (!r.task_started_at || !r.task_completed_at) return null;
  return new Date(r.task_completed_at).getTime() - new Date(r.task_started_at).getTime();
}

function totalTaskDurationMs(r: Response): number | null {
  const parts = [0, 1, 2].map(i => perTaskDurationMs(r, i)).filter((d): d is number => d !== null);
  if (parts.length === 3) return parts.reduce((a, b) => a + b, 0);
  return taskDurationMs(r);
}

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return s % 60 > 0 ? `${m}m ${s % 60}s` : `${m}m`;
}

function meanMs(rows: Response[], fn: (r: Response) => number | null = totalTaskDurationMs): number | null {
  const ds = rows.map(fn).filter((d): d is number => d !== null);
  return ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : null;
}

function meanDuration(rows: Response[], fn = totalTaskDurationMs): string {
  const ms = meanMs(rows, fn);
  return ms !== null ? fmt(ms) : "—";
}

function taskStats(rows: Response[], i: number) {
  const key = TASK_RESULT_KEYS[i];
  const attempted  = rows.filter(r => r[key] !== null);
  const completed  = attempted.filter(r => r[key] === "completed");
  const durations  = attempted.map(r => perTaskDurationMs(r, i)).filter((d): d is number => d !== null);
  const avgMs      = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
  return {
    completed: completed.length,
    attempted: attempted.length,
    rate: attempted.length ? `${completed.length}/${attempted.length}` : "—",
    avgDur: avgMs !== null ? fmt(avgMs) : "—",
    avgMs,
  };
}

function completionPct(rows: Response[]): number | null {
  const attempts  = rows.flatMap(r => TASK_RESULT_KEYS.map(k => r[k])).filter(v => v !== null);
  const completed = attempts.filter(v => v === "completed");
  return attempts.length ? Math.round((completed.length / attempts.length) * 100) : null;
}

function avgNPS(rows: Response[]): number | null {
  const valid = rows.filter(r => r.nps !== null && r.nps !== undefined);
  return valid.length ? valid.reduce((s, r) => s + (r.nps as number), 0) / valid.length : null;
}

function computeNPS(rows: Response[]) {
  const valid = rows.filter(r => r.nps !== null && r.nps !== undefined);
  if (!valid.length) return null;
  const det  = valid.filter(r => (r.nps as number) <= 6).length;
  const pass = valid.filter(r => (r.nps as number) >= 7 && (r.nps as number) <= 8).length;
  const prom = valid.filter(r => (r.nps as number) >= 9).length;
  const n = valid.length;
  return { score: Math.round((prom / n - det / n) * 100), det, pass, prom, n };
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
const USAGE_OPTIONS = [
  "Daily", "A few times a week", "Weekly", "Monthly",
  "Rarely / only when something comes up",
];
const USAGE_SHORT: Record<string, string> = {
  "Daily": "Daily", "A few times a week": "Few/wk",
  "Weekly": "Weekly", "Monthly": "Monthly",
  "Rarely / only when something comes up": "Rarely",
};
const QUAL_QUESTION_TEXT: Partial<Record<keyof Response, string>> = {
  q2: "Was there any moment where you weren't sure where to tap next?",
  q3: "If you had to describe this app to a friend in one sentence, what would you say?",
  q4: "Did you notice any feature you weren't sure what it does?",
  q5: "Is there anything you expected the app to do that it didn't?",
  q6: "Is there a feature you would like to have in a similar app?",
};

function countByKey(rows: Response[], keyFn: (r: Response) => string | null, keys: string[]) {
  const map: Record<string, number> = {};
  keys.forEach(k => (map[k] = 0));
  rows.forEach(r => { const k = keyFn(r); if (k && k in map) map[k]++; });
  return keys.map(k => ({ label: k, count: map[k] }));
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ marginBottom: "36px", ...style }}>
      <h2 style={{
        fontSize: "11px", fontWeight: 700, color: MUTED,
        textTransform: "uppercase", letterSpacing: "0.09em",
        paddingBottom: "10px", marginBottom: "14px",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: "14px", padding: "20px 22px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)", ...style,
    }}>
      {children}
    </div>
  );
}

function VerLabel({ ver }: { ver: "a" | "b" }) {
  return (
    <p style={{
      fontSize: "10px", fontWeight: 700,
      color: ver === "a" ? A : B,
      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px",
    }}>
      Version {ver.toUpperCase()}
    </p>
  );
}

function VerPill({ ver }: { ver: string }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "999px",
      fontSize: "11px", fontWeight: 700,
      background: ver === "a" ? A_BG : B_BG,
      color: ver === "a" ? A : B,
    }}>
      {ver.toUpperCase()}
    </span>
  );
}

function ResultDot({ result }: { result: string | null }) {
  const done   = result === "completed";
  const failed = result === "failed";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "20px", height: "20px", borderRadius: "50%", fontSize: "11px", fontWeight: 700,
      background: done ? GREEN_BG : failed ? RED_BG : SURF,
      color: done ? GREEN : failed ? RED : MUTED,
    }}>
      {done ? "✓" : failed ? "✗" : "·"}
    </span>
  );
}

function BarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", paddingTop: "12px" }}>
      {data.map(({ label, count }) => (
        <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 0 }}>
          <span style={{ fontSize: "10px", color: MUTED, fontFamily: "'DM Mono', monospace", visibility: count > 0 ? "visible" : "hidden" }}>{count}</span>
          <div style={{
            width: "100%", borderRadius: "4px 4px 0 0",
            height: `${Math.max((count / max) * 48, count > 0 ? 3 : 0)}px`,
            background: count > 0 ? color : BORDER,
          }} />
          <span style={{ fontSize: "9px", color: MUTED, textAlign: "center", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function NPSBar({ rows }: { rows: Response[] }) {
  const nps = computeNPS(rows);
  const avg = avgNPS(rows);
  if (!nps) return <p style={{ fontSize: "13px", color: MUTED }}>No data yet.</p>;
  const { score, det, pass, prom, n } = nps;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "36px", fontWeight: 700, color: DARK, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
          {score > 0 ? "+" : ""}{score}
        </span>
        {avg !== null && (
          <span style={{ fontSize: "13px", color: MUTED }}>avg {avg.toFixed(1)} / 10</span>
        )}
      </div>
      <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", gap: "2px", marginBottom: "8px" }}>
        {det  > 0 && <div style={{ flex: det,  background: RED,     borderRadius: "3px 0 0 3px" }} />}
        {pass > 0 && <div style={{ flex: pass, background: "#F59E0B" }} />}
        {prom > 0 && <div style={{ flex: prom, background: GREEN,   borderRadius: prom === n ? "3px" : "0 3px 3px 0" }} />}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: RED }}>Detractors {det} ({Math.round(det / n * 100)}%)</span>
        <span style={{ fontSize: "11px", color: "#D97706" }}>Passives {pass} ({Math.round(pass / n * 100)}%)</span>
        <span style={{ fontSize: "11px", color: GREEN }}>Promoters {prom} ({Math.round(prom / n * 100)}%)</span>
      </div>
    </div>
  );
}

function ProfessionList({ data }: { data: { label: string; count: number }[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count).filter(d => d.count > 0);
  if (!sorted.length) return <p style={{ fontSize: "13px", color: MUTED }}>No data yet.</p>;
  const max = sorted[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {sorted.map(({ label, count }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontSize: "12px", color: MID }}>{label}</span>
            <span style={{ fontSize: "12px", color: MUTED, fontFamily: "'DM Mono', monospace" }}>{count}</span>
          </div>
          <div style={{ height: "4px", background: BORDER, borderRadius: "2px" }}>
            <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: B, borderRadius: "2px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function QualCard({ name, text, ver }: { name: string; text: string | null; ver: string }) {
  const isEmpty = !text || text.toLowerCase() === "no" || text.toLowerCase() === "nope";
  return (
    <div style={{
      border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "12px 14px", marginBottom: "8px",
      background: isEmpty ? SURF : CARD,
      boxShadow: isEmpty ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
      opacity: isEmpty ? 0.65 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: isEmpty ? 0 : "8px" }}>
        <VerPill ver={ver} />
        <span style={{ fontSize: "12px", fontWeight: 500, color: MID }}>{name}</span>
        {isEmpty && <span style={{ fontSize: "11px", color: MUTED, marginLeft: "auto" }}>No issues reported</span>}
      </div>
      {!isEmpty && (
        <p style={{ fontSize: "13px", color: MID, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
          "{text}"
        </p>
      )}
    </div>
  );
}

// ── Expanded row detail ───────────────────────────────────────────────────────

function UserDetail({ r, onDelete }: { r: Response; onDelete: (id: string) => Promise<void> }) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalMs = totalTaskDurationMs(r);
  const varCol  = r.variant === "a" ? A : B;

  return (
    <div style={{ padding: "20px 22px", background: SURF, borderTop: `2px solid ${r.variant === "a" ? A_BG : B_BG}` }}>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {[
          ["Version", r.variant.toUpperCase()],
          ["Age", r.age_range ?? "—"],
          ["Profession", r.profession ?? "—"],
          ["Total time", totalMs !== null ? fmt(totalMs) : "—"],
          ["NPS", r.nps !== null && r.nps !== undefined ? `${r.nps} / 10` : "—"],
          ["Submitted", fmtTime(r.created_at)],
        ].map(([label, val]) => (
          <div key={label} style={{ padding: "8px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
            <p style={{ fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
            <p style={{ fontSize: "13px", fontWeight: 600, color: label === "Version" ? varCol : DARK }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Task breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {TASK_LABELS.map((_, i) => {
          const result = r[TASK_RESULT_KEYS[i]];
          const ms     = perTaskDurationMs(r, i);
          const done   = result === "completed";
          const failed = result === "failed";
          return (
            <div key={i} style={{
              background: done ? GREEN_BG : failed ? RED_BG : SURF,
              border: `1px solid ${done ? "#A7F3D0" : failed ? "#FECACA" : BORDER}`,
              borderRadius: "10px", padding: "10px 14px",
            }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Task {i + 1}
              </p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: done ? GREEN : failed ? RED : MUTED, marginBottom: "2px" }}>
                {done ? "✓ Completed" : failed ? "✗ Failed" : "—"}
              </p>
              <p style={{ fontSize: "11px", color: MUTED, fontFamily: "'DM Mono', monospace" }}>
                {ms !== null ? fmt(ms) : "—"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Q&A grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {([
          ["Q1 — Learnability",             r.q1],
          ["Q2 — Navigation clarity",        r.q2],
          ["Q3 — First impression",          r.q3],
          ["Q4 — Feature discoverability",   r.q4],
          ["Q5 — Unmet expectations",        r.q5],
          ["Q6 — Desired features",          r.q6],
          ["Q7 — Usage intent",              r.q7],
        ] as [string, string | null][]).filter(([, v]) => v).map(([label, value]) => (
          <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "12px 14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{label}</p>
            <p style={{ fontSize: "13px", color: MID, lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Delete */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
        {confirm ? (
          <>
            <span style={{ fontSize: "13px", color: MUTED }}>Delete this response?</span>
            <button onClick={async () => { setDeleting(true); await onDelete(r.id); }} disabled={deleting}
              style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: RED, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button onClick={() => setConfirm(false)}
              style={{ padding: "7px 14px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: CARD, color: MID, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setConfirm(true)}
            style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Delete response
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function ResultsApp() {
  const [rows, setRows]       = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError("");
    try { setRows(await fetchResponses()); }
    catch { setError("Could not load responses. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    await deleteResponse(id);
    setRows(prev => prev.filter(r => r.id !== id));
    setExpanded(null);
  }

  const a = rows.filter(r => r.variant === "a");
  const b = rows.filter(r => r.variant === "b");

  const pctA = completionPct(a);
  const pctB = completionPct(b);
  const npsA = avgNPS(a);
  const npsB = avgNPS(b);
  const msA  = meanMs(a);
  const msB  = meanMs(b);

  const learnabilityA = countByKey(a, r => r.q1, LEARNABILITY_OPTIONS).map(d => ({ ...d, label: LEARNABILITY_SHORT[d.label] ?? d.label }));
  const learnabilityB = countByKey(b, r => r.q1, LEARNABILITY_OPTIONS).map(d => ({ ...d, label: LEARNABILITY_SHORT[d.label] ?? d.label }));
  const usageA  = countByKey(a, r => r.q7, USAGE_OPTIONS).map(d => ({ ...d, label: USAGE_SHORT[d.label] ?? d.label }));
  const usageB  = countByKey(b, r => r.q7, USAGE_OPTIONS).map(d => ({ ...d, label: USAGE_SHORT[d.label] ?? d.label }));
  const ageData = countByKey(rows, r => r.age_range,  AGE_RANGE_KEYS);
  const profData = countByKey(rows, r => r.profession, PROFESSION_KEYS);

  const qualQuestions: { key: keyof Response; label: string }[] = [
    { key: "q2", label: "Q2 — Navigation clarity" },
    { key: "q3", label: "Q3 — First impression" },
    { key: "q4", label: "Q4 — Feature discoverability" },
    { key: "q5", label: "Q5 — Unmet expectations" },
    { key: "q6", label: "Q6 — Desired features" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: PAGE, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        tbody tr:hover { background: #F0F4FF !important; }
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: CARD, borderBottom: `1px solid ${BORDER}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "17px", fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.2 }}>A/B Test Results</h1>
            <p style={{ fontSize: "12px", color: MUTED, margin: "3px 0 0" }}>
              Subscriptions Management App &nbsp;·&nbsp;
              {rows.length} response{rows.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
              <span style={{ color: A, fontWeight: 600 }}>{a.length} Version A</span>
              &nbsp;·&nbsp;
              <span style={{ color: B, fontWeight: 600 }}>{b.length} Version B</span>
            </p>
          </div>
          <button onClick={load} style={{
            padding: "7px 14px", borderRadius: "8px",
            border: `1px solid ${BORDER}`, background: CARD,
            cursor: "pointer", fontSize: "12px", fontWeight: 600,
            color: MID, fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 24px" }}>

        {error && (
          <div style={{ background: RED_BG, border: `1px solid #FECACA`, borderRadius: "10px", padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: RED }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 0" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: A, animation: "spin 0.7s linear infinite" }} />
            <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>Loading responses…</p>
          </div>
        )}

        {!loading && rows.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "36px", marginBottom: "14px" }}>📭</p>
            <p style={{ fontSize: "16px", fontWeight: 600, color: MID, marginBottom: "6px" }}>No responses yet</p>
            <p style={{ fontSize: "13px", color: MUTED }}>Share the survey link to start collecting data.</p>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <>
            {/* ── Summary ── */}
            <Section title="Summary">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {([
                  { label: "Task completion", valA: pctA !== null ? `${pctA}%` : "—", valB: pctB !== null ? `${pctB}%` : "—", winB: pctB !== null && pctA !== null && pctB > pctA },
                  { label: "Avg NPS", valA: npsA !== null ? npsA.toFixed(1) : "—", valB: npsB !== null ? npsB.toFixed(1) : "—", winB: npsB !== null && npsA !== null && npsB > npsA },
                  { label: "Avg total time", valA: msA !== null ? fmt(msA) : "—", valB: msB !== null ? fmt(msB) : "—", winB: msB !== null && msA !== null && msB < msA },
                ]).map(({ label, valA, valB, winB }) => (
                  <Card key={label} style={{ padding: "16px 18px" }}>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>{label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {([["a", valA, !winB] as const, ["b", valB, winB] as const]).map(([ver, val, isWin]) => (
                        <div key={ver} style={{
                          padding: "10px 12px", borderRadius: "10px",
                          background: isWin ? (ver === "a" ? A_SOFT : B_SOFT) : SURF,
                          border: `1px solid ${isWin ? (ver === "a" ? A_BG : B_BG) : BORDER}`,
                        }}>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: ver === "a" ? A : B, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                            Ver {ver.toUpperCase()}{isWin ? " ↑" : ""}
                          </p>
                          <p style={{ fontSize: "20px", fontWeight: 700, color: DARK, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Section>

            {/* ── Task completion ── */}
            <Section title="Task completion">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {TASK_LABELS.map((label, i) => {
                  const sA = taskStats(a, i);
                  const sB = taskStats(b, i);
                  return (
                    <Card key={i} style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>{label}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {([["a", sA] as const, ["b", sB] as const]).map(([ver, s]) => {
                          const col    = ver === "a" ? A : B;
                          const allDone = s.attempted > 0 && s.completed === s.attempted;
                          return (
                            <div key={ver} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                              <div style={{ textAlign: "center" }}>
                                <VerLabel ver={ver} />
                                <p style={{ fontSize: "30px", fontWeight: 700, fontFamily: "'DM Mono', monospace", lineHeight: 1, color: allDone ? GREEN : s.completed === 0 ? RED : DARK }}>
                                  {s.rate}
                                </p>
                              </div>
                              <div style={{ paddingTop: "16px" }}>
                                {s.n > 0 && <p style={{ fontSize: "11px", color: MUTED, marginBottom: "6px" }}>avg {s.avgDur}</p>}
                                {(ver === "a" ? a : b).map(r => {
                                  const res = r[TASK_RESULT_KEYS[i]];
                                  const ms  = perTaskDurationMs(r, i);
                                  const done = res === "completed";
                                  return (
                                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: MUTED, marginBottom: "3px" }}>
                                      <ResultDot result={res} />
                                      <span style={{ color: MID }}>{r.participant_name ?? "?"}</span>
                                      {ms !== null && <span style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(ms)}</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Section>

            {/* ── NPS ── */}
            <Section title="NPS — Recommendation likelihood">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {(["a", "b"] as const).map(ver => (
                  <Card key={ver}>
                    <VerLabel ver={ver} />
                    <NPSBar rows={ver === "a" ? a : b} />
                  </Card>
                ))}
              </div>
            </Section>

            {/* ── Task timing ── */}
            <Section title="Task timing">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {TASK_LABELS.map((label, i) => (
                  <Card key={i} style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>{label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      {(["a", "b"] as const).map(ver => {
                        const vRows = (ver === "a" ? a : b).map(r => ({
                          name: r.participant_name ?? "—",
                          ms:   perTaskDurationMs(r, i),
                          result: r[TASK_RESULT_KEYS[i]],
                        }));
                        const valid = vRows.map(p => p.ms).filter((d): d is number => d !== null);
                        const avg   = valid.length ? fmt(valid.reduce((s, d) => s + d, 0) / valid.length) : "—";
                        return (
                          <div key={ver}>
                            <VerLabel ver={ver} />
                            <p style={{ fontSize: "24px", fontWeight: 700, color: DARK, fontFamily: "'DM Mono', monospace", marginBottom: "10px" }}>{avg}</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                              {vRows.map(p => (
                                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                                  <ResultDot result={p.result ?? null} />
                                  <span style={{ color: MID, minWidth: "52px" }}>{p.name}</span>
                                  <span style={{ color: MUTED, fontFamily: "'DM Mono', monospace" }}>
                                    {p.ms !== null ? fmt(p.ms) : "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </Section>

            {/* ── Quantitative ── */}
            <Section title="Quantitative responses">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Q1 — How was your experience of finding information you needed?", dataA: learnabilityA, dataB: learnabilityB },
                  { label: "Q7 — How often would you realistically open an app like this?",  dataA: usageA,        dataB: usageB },
                ].map(({ label, dataA, dataB }) => (
                  <Card key={label}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: MID, marginBottom: "16px" }}>{label}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {(["a", "b"] as const).map(ver => (
                        <div key={ver}>
                          <VerLabel ver={ver} />
                          <BarChart data={ver === "a" ? dataA : dataB} color={ver === "a" ? A : B} />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Section>

            {/* ── Responses table ── */}
            <Section title="Responses">
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: SURF }}>
                      {["Name", "Ver", "T1", "T2", "T3", "Total", "NPS", "Learnability"].map(h => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontWeight: 600, color: MUTED,
                          fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em",
                          borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      const totalMs   = totalTaskDurationMs(r);
                      const isExpanded = expanded === r.id;
                      return (
                        <>
                          <tr
                            key={r.id}
                            onClick={() => setExpanded(isExpanded ? null : r.id)}
                            style={{
                              cursor: "pointer",
                              borderBottom: isExpanded ? "none" : `1px solid ${BORDER}`,
                              background: isExpanded ? "#F0F4FF" : idx % 2 === 0 ? CARD : SURF,
                            }}
                          >
                            <td style={{ padding: "11px 14px", fontWeight: 600, color: DARK }}>
                              {r.participant_name ?? "—"}
                            </td>
                            <td style={{ padding: "11px 14px" }}><VerPill ver={r.variant} /></td>
                            {TASK_RESULT_KEYS.map((k, i) => {
                              const res = r[k];
                              const ms  = perTaskDurationMs(r, i);
                              return (
                                <td key={k} style={{ padding: "11px 14px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <ResultDot result={res ?? null} />
                                    {ms !== null && (
                                      <span style={{ fontSize: "11px", color: MUTED, fontFamily: "'DM Mono', monospace" }}>{fmt(ms)}</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: "12px", color: MID }}>
                              {totalMs !== null ? fmt(totalMs) : "—"}
                            </td>
                            <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: DARK }}>
                              {r.nps !== null && r.nps !== undefined ? r.nps : "—"}
                            </td>
                            <td style={{ padding: "11px 14px", color: MID, maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.q1 ? (LEARNABILITY_SHORT[r.q1] ?? r.q1) : "—"}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${r.id}-exp`} style={{ borderBottom: `1px solid ${BORDER}` }}>
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
              </Card>
            </Section>

            {/* ── Participants ── */}
            <Section title="Participants">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Card>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: MID, marginBottom: "12px" }}>Age range</p>
                  <BarChart data={ageData} color={A} />
                </Card>
                <Card>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: MID, marginBottom: "12px" }}>Profession</p>
                  <ProfessionList data={profData} />
                </Card>
              </div>
            </Section>

            {/* ── Qualitative responses ── */}
            <Section title="Qualitative responses">
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {qualQuestions.map(({ key, label }) => (
                  <div key={String(key)}>
                    <div style={{ marginBottom: "10px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: MID, margin: 0 }}>{label}</p>
                      {QUAL_QUESTION_TEXT[key] && (
                        <p style={{ fontSize: "12px", color: MUTED, margin: "3px 0 0", fontStyle: "italic" }}>
                          {QUAL_QUESTION_TEXT[key]}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {(["a", "b"] as const).map(ver => (
                        <div key={ver}>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: ver === "a" ? A : B, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
                            Version {ver.toUpperCase()}
                          </p>
                          {(ver === "a" ? a : b).map(r => (
                            <QualCard key={r.id} name={r.participant_name ?? "—"} text={r[key] as string | null} ver={ver} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

          </>
        )}
      </div>
    </div>
  );
}
