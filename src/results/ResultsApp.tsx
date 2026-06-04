import { useState, useEffect } from "react";
import { fetchResponses, Response } from "../lib/supabase";

// ── Stat helpers ──────────────────────────────────────────────────────────────

function mean(nums: (number | null)[]): string {
  const v = nums.filter((n): n is number => n !== null);
  if (!v.length) return "—";
  return (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);
}

function sus2(q5s: (number | null)[], q6s: (number | null)[]): string {
  const v5 = q5s.filter((n): n is number => n !== null);
  const v6 = q6s.filter((n): n is number => n !== null);
  const n = Math.min(v5.length, v6.length);
  if (!n) return "—";
  const score = v5.slice(0, n).reduce((a, b) => a + b, 0) / n
    + v6.slice(0, n).reduce((a, b) => a + (6 - b), 0) / n;
  return (score * 25).toFixed(0);
}

function taskDurationMs(r: Response): number | null {
  if (!r.task_started_at || !r.task_completed_at) return null;
  return new Date(r.task_completed_at).getTime() - new Date(r.task_started_at).getTime();
}

function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

function meanDuration(rows: Response[]): string {
  const ds = rows.map(taskDurationMs).filter((d): d is number => d !== null);
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

const AGE_RANGE_KEYS = ["18–24", "25–34", "35–44", "45–54", "55+"];
const PROFESSION_KEYS = [
  "Student", "Designer / Creative", "Engineer / Developer",
  "Product / Project Manager", "Marketing / Sales", "Finance / Business",
  "Healthcare", "Education / Teaching", "Other",
];

function countByKey(rows: Response[], keyFn: (r: Response) => string | null, allKeys: string[]): { label: string; count: number }[] {
  const map: Record<string, number> = {};
  allKeys.forEach(k => (map[k] = 0));
  rows.forEach(r => {
    const k = keyFn(r);
    if (k && allKeys.includes(k)) map[k]++;
  });
  return allKeys.map(k => ({ label: k, count: map[k] }));
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

  const a = rows.filter(r => r.variant === "a");
  const b = rows.filter(r => r.variant === "b");

  // Time distribution data
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

  const ageData = countByKey(rows, r => r.age_range, AGE_RANGE_KEYS);
  const profData = countByKey(rows, r => r.profession, PROFESSION_KEYS);

  const qualQuestions: { key: keyof Response; label: string }[] = [
    { key: "q3", label: "Q3 — Difference between tabs used most" },
    { key: "q7", label: "Q7 — Friction moments" },
    { key: "q8", label: "Q8 — Where to find AI suggestions" },
    { key: "q10", label: "Q10 — What to rename / move in nav" },
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
          <button
            onClick={load}
            style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid var(--app-border)", background: "var(--app-card)", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--app-text-primary)", fontFamily: "'DM Sans', sans-serif" }}
          >
            ↻ Refresh
          </button>
        </div>

        {error && <p style={{ color: "var(--app-red)", marginBottom: "24px", fontSize: "14px" }}>{error}</p>}
        {loading && <p style={{ color: "var(--app-text-muted)", fontSize: "14px" }}>Loading…</p>}

        {!loading && (
          <>
            {/* ── Overview stats ── */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
              <StatCard label="Version A" value={String(a.length)} sub={`SUS-2: ${sus2(a.map(r => r.q5), a.map(r => r.q6))}/100`} />
              <StatCard label="Version B" value={String(b.length)} sub={`SUS-2: ${sus2(b.map(r => r.q5), b.map(r => r.q6))}/100`} />
              <StatCard label="Mean confidence (Q2)" value={mean(rows.map(r => r.q2))} sub={`A: ${mean(a.map(r => r.q2))} · B: ${mean(b.map(r => r.q2))}`} />
              <StatCard label="Mean ease (Q5)" value={mean(rows.map(r => r.q5))} sub={`A: ${mean(a.map(r => r.q5))} · B: ${mean(b.map(r => r.q5))}`} />
            </div>

            {/* ── Task timing ── */}
            <h2 style={sectionTitle}>Task timing</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Version A</span>
                  <span style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>avg task time</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>
                  {meanDuration(a)}
                </p>
                <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginBottom: "0" }}>
                  {a.filter(r => r.task_started_at && r.task_completed_at).length} timed responses
                </p>
                <BarChart data={timeBucketsA} color="#1D4ED8" />
              </div>
              <div style={card}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.06em" }}>Version B</span>
                  <span style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>avg task time</span>
                </div>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", marginBottom: "4px" }}>
                  {meanDuration(b)}
                </p>
                <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginBottom: "0" }}>
                  {b.filter(r => r.task_started_at && r.task_completed_at).length} timed responses
                </p>
                <BarChart data={timeBucketsB} color="#7C3AED" />
              </div>
            </div>

            {/* ── Response table ── */}
            <h2 style={sectionTitle}>Responses</h2>
            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--app-surface)" }}>
                    {["Time", "Name", "Ver", "Duration", "Q2 conf", "Q5 ease", "Q6 learn", "Age", "Profession"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--app-text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--app-border)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={9} style={{ padding: "24px", textAlign: "center", color: "var(--app-text-muted)" }}>No responses yet.</td></tr>
                  )}
                  {rows.map(r => {
                    const dur = taskDurationMs(r);
                    return (
                      <>
                        <tr
                          key={r.id}
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          style={{ cursor: "pointer", borderBottom: "1px solid var(--app-border)", background: expanded === r.id ? "var(--app-surface)" : "transparent" }}
                        >
                          <td style={{ padding: "10px 14px", color: "var(--app-text-muted)", whiteSpace: "nowrap" }}>{fmtTime(r.created_at)}</td>
                          <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--app-text-primary)" }}>{r.participant_name ?? "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: r.variant === "a" ? "#DBEAFE" : "#EDE9FE", color: r.variant === "a" ? "#1D4ED8" : "#7C3AED" }}>
                              {r.variant.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", color: "var(--app-text-secondary)" }}>{dur !== null ? formatDuration(dur) : "—"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q2 ?? "—"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q5 ?? "—"}</td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q6 ?? "—"}</td>
                          <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", whiteSpace: "nowrap" }}>{r.age_range ?? "—"}</td>
                          <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.profession ?? "—"}</td>
                        </tr>
                        {expanded === r.id && (
                          <tr key={`${r.id}-exp`} style={{ borderBottom: "1px solid var(--app-border)" }}>
                            <td colSpan={9} style={{ padding: "16px 14px", background: "var(--app-surface)" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {qualQuestions.map(({ key, label }) => r[key] && (
                                  <div key={key}>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
                                    <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{r[key] as string}</p>
                                  </div>
                                ))}
                                {r.q1 && (
                                  <div>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Q1 — Recall: spend section</p>
                                    <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{r.q1}</p>
                                  </div>
                                )}
                                {r.q4 && (
                                  <div>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Q4 — Add subscription steps</p>
                                    <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{r.q4}</p>
                                  </div>
                                )}
                                {r.q9 && (
                                  <div>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Q9 — Frequency</p>
                                    <p style={{ fontSize: "13px", color: "var(--app-text-primary)" }}>{r.q9}</p>
                                  </div>
                                )}
                              </div>
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

                {/* ── Qualitative side-by-side ── */}
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
