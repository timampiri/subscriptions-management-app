import { useState, useEffect } from "react";
import { fetchResponses, Response } from "../lib/supabase";

function mean(nums: (number | null)[]): string {
  const valid = nums.filter((n): n is number => n !== null);
  if (!valid.length) return "—";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
}

function sus2(q5s: (number | null)[], q6s: (number | null)[]): string {
  const valid5 = q5s.filter((n): n is number => n !== null);
  const valid6 = q6s.filter((n): n is number => n !== null);
  const n = Math.min(valid5.length, valid6.length);
  if (!n) return "—";
  const score = valid5.slice(0, n).reduce((a, b) => a + b, 0) / n
    + valid6.slice(0, n).reduce((a, b) => a + (6 - b), 0) / n;
  return (score * 25).toFixed(0);
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ flex: 1, background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "14px", padding: "16px 18px" }}>
      <p style={{ fontSize: "11px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{label}</p>
      <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "4px" }}>{sub}</p>}
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

  const shell: React.CSSProperties = {
    minHeight: "100vh", background: "var(--app-outer-bg, #F5F5F7)",
    padding: "40px 24px", fontFamily: "'DM Sans', sans-serif",
  };

  const container: React.CSSProperties = { maxWidth: "900px", margin: "0 auto" };

  const qualQuestions: { key: keyof Response; label: string }[] = [
    { key: "q3", label: "Q3 — Difference between tabs used most" },
    { key: "q7", label: "Q7 — Friction moments" },
    { key: "q8", label: "Q8 — Where to find AI suggestions" },
    { key: "q10", label: "Q10 — What to rename / move in nav" },
  ];

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

        {/* Stats */}
        {!loading && (
          <>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
              <StatCard label="Version A" value={String(a.length)} sub={`SUS-2: ${sus2(a.map(r => r.q5), a.map(r => r.q6))}/100`} />
              <StatCard label="Version B" value={String(b.length)} sub={`SUS-2: ${sus2(b.map(r => r.q5), b.map(r => r.q6))}/100`} />
              <StatCard label="Mean confidence (Q2)" value={mean(rows.map(r => r.q2))} sub={`A: ${mean(a.map(r => r.q2))} · B: ${mean(b.map(r => r.q2))}`} />
              <StatCard label="Mean ease (Q5)" value={mean(rows.map(r => r.q5))} sub={`A: ${mean(a.map(r => r.q5))} · B: ${mean(b.map(r => r.q5))}`} />
            </div>

            {/* Response table */}
            <div style={{ background: "var(--app-card)", border: "1px solid var(--app-border)", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--app-surface)" }}>
                    {["Time", "Name", "Ver", "Q2 conf", "Q5 ease", "Q6 learn", "Q1 recall", "Q4 add"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--app-text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--app-border)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "var(--app-text-muted)" }}>No responses yet.</td></tr>
                  )}
                  {rows.map(r => (
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
                        <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q2 ?? "—"}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q5 ?? "—"}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>{r.q6 ?? "—"}</td>
                        <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.q1 ?? "—"}</td>
                        <td style={{ padding: "10px 14px", color: "var(--app-text-secondary)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.q4 ?? "—"}</td>
                      </tr>
                      {expanded === r.id && (
                        <tr key={`${r.id}-exp`} style={{ borderBottom: "1px solid var(--app-border)" }}>
                          <td colSpan={8} style={{ padding: "16px 14px", background: "var(--app-surface)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              {qualQuestions.map(({ key, label }) => r[key] && (
                                <div key={key}>
                                  <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
                                  <p style={{ fontSize: "13px", color: "var(--app-text-primary)", lineHeight: 1.5 }}>{r[key] as string}</p>
                                </div>
                              ))}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Qualitative side-by-side */}
            {rows.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "16px" }}>Qualitative responses</h2>
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
