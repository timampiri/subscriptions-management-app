import { useEffect, useState } from "react";
import { Camera, FileText, ChevronDown, Check, Upload, X, ArrowLeft, CheckCircle, Sparkles, ChevronRight } from "lucide-react";

type Tab = "auto" | "manual" | "screenshot";

const CATEGORIES = ["Entertainment", "Music", "Productivity", "AI Tools", "Design", "Storage", "Developer Tools", "Security", "Education", "Other"];
const BILLING_CYCLES = ["Monthly", "Annual", "Weekly"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: "14px", outline: "none",
  background: "var(--app-surface)", border: "1px solid var(--app-border-input)",
  color: "var(--app-text-primary)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600,
  textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px",
};

interface AddScreenProps {
  onBack: () => void;
  onConnectNew: () => void;
}

export function AddScreen({ onBack, onConnectNew }: AddScreenProps) {
  const [tab, setTab] = useState<Tab>("auto");
  const [form, setForm] = useState({
    name: "", amount: "", category: "Entertainment", billingCycle: "Monthly",
    nextRenewal: "", account: "", notes: "",
  });
  const [screenshotDragging, setScreenshotDragging] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!form.name.trim()) { setError("Add a service name"); return; }
    if (!form.amount.trim() || isNaN(Number(form.amount))) { setError("Enter a valid amount"); return; }
    setError(null);
    setSaved(true);
  };

  useEffect(() => {
    if (saved) {
      const t = setTimeout(onBack, 1500);
      return () => clearTimeout(t);
    }
  }, [saved, onBack]);

  const cycleShort = form.billingCycle === "Monthly" ? "mo" : form.billingCycle === "Annual" ? "yr" : "wk";

  return (
    <div style={{ flex: 1, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none", paddingBottom: "40px" }}>
      <div style={{ padding: "24px 20px 12px" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 10px 6px 6px", marginLeft: "-6px", marginBottom: "12px",
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--app-text-secondary)", fontSize: "13px", fontWeight: 500,
            borderRadius: "999px",
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px" }}>Add Subscription</h2>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>Track a new service manually or import it</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", padding: "0 20px 20px", gap: "8px" }}>
        {([
          { id: "auto", label: "Auto-detect", icon: Sparkles },
          { id: "manual", label: "Manual", icon: FileText },
          { id: "screenshot", label: "Screenshot", icon: Camera },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              padding: "12px 8px", borderRadius: "16px", cursor: "pointer",
              background: tab === id ? "var(--app-blue)" : "var(--app-surface)",
              border: `1px solid ${tab === id ? "var(--app-blue)" : "var(--app-border)"}`,
              transition: "all 0.15s ease",
            }}
          >
            <Icon size={16} color={tab === id ? "#fff" : "var(--app-text-muted)"} />
            <span style={{ fontSize: "11px", color: tab === id ? "#fff" : "var(--app-text-muted)", fontWeight: tab === id ? 600 : 400 }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Auto-detect tab */}
      {tab === "auto" && (
        <div style={{ padding: "0 20px 32px" }}>
          {/* Hero card */}
          <div style={{
            position: "relative", overflow: "hidden",
            padding: "24px 20px", borderRadius: "20px", marginBottom: "16px",
            background: "var(--app-hero-bg)",
            border: "1px solid var(--app-hero-border)",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px", marginBottom: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.55)",
            }}>
              <Sparkles size={22} color="var(--app-hero-label)" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--app-hero-label)", marginBottom: "6px", lineHeight: 1.2 }}>
              Find subscriptions automatically
            </h3>
            <p style={{ fontSize: "13px", color: "var(--app-hero-label)", opacity: 0.85, lineHeight: 1.5, marginBottom: "16px" }}>
              Connect your email or bank and we'll scan for recurring charges — add them all in one go.
            </p>
            <button
              onClick={onConnectNew}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "12px 18px", borderRadius: "999px",
                background: "var(--app-text-primary)", color: "var(--app-frame-bg)",
                border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Connect an account
              <ChevronRight size={14} />
            </button>
          </div>

          {/* How it works */}
          <div style={{
            padding: "16px", borderRadius: "16px",
            background: "var(--app-card)", border: "1px solid var(--app-border)",
            boxShadow: "var(--app-card-shadow)",
          }}>
            <p style={{ fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
              How it works
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "Pick a provider — Gmail, Chase, Apple Card, and others",
                "We scan the last 12 months for recurring charges",
                "Review the matches and add the ones you want to track",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{
                    width: "20px", height: "20px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "1px",
                    background: "var(--app-blue-bg)",
                    fontSize: "10px", color: "var(--app-blue-label)", fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy reassurance */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "12px 14px", borderRadius: "14px", marginTop: "12px",
            background: "var(--app-ai-bg)", border: "1px solid var(--app-ai-border)",
          }}>
            <Check size={14} color="var(--app-ai-text)" strokeWidth={3} style={{ marginTop: "2px", flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "var(--app-ai-text)", lineHeight: 1.5 }}>
              Read-only access. We never store your password or share data with third parties.
            </p>
          </div>
        </div>
      )}

      {/* Manual form */}
      {tab === "manual" && (
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Service Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix, Spotify…" style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Amount</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--app-text-muted)", fontSize: "14px" }}>$</span>
                <input
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00" type="number"
                  style={{ ...inputStyle, paddingLeft: "28px", fontFamily: "'DM Mono', monospace" }}
                />
              </div>
            </div>
            <div style={{ width: "130px" }}>
              <label style={labelStyle}>Billing</label>
              <div style={{ position: "relative" }}>
                <select
                  value={form.billingCycle}
                  onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }}
                >
                  {BILLING_CYCLES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} color="var(--app-text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {CATEGORIES.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  style={{
                    padding: "6px 12px", borderRadius: "999px", cursor: "pointer",
                    background: form.category === cat ? "var(--app-blue)" : "var(--app-surface)",
                    fontSize: "12px", color: form.category === cat ? "#fff" : "var(--app-text-muted)",
                    border: `1px solid ${form.category === cat ? "var(--app-blue)" : "var(--app-border)"}`,
                    fontWeight: form.category === cat ? 600 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Next Renewal</label>
            <input type="date" value={form.nextRenewal} onChange={e => setForm({ ...form, nextRenewal: e.target.value })} style={{ ...inputStyle, colorScheme: "light dark" }} />
          </div>

          <div>
            <label style={labelStyle}>Linked Account (optional)</label>
            <div style={{ position: "relative" }}>
              <select
                value={form.account}
                onChange={e => setForm({ ...form, account: e.target.value })}
                style={{ ...inputStyle, appearance: "none", paddingRight: "32px", color: form.account ? "var(--app-text-primary)" : "var(--app-text-muted)" }}
              >
                <option value="">Select account…</option>
                <option>john@gmail.com</option>
                <option>work@company.com</option>
                <option>Chase ••4821</option>
                <option>Apple Card ••7743</option>
              </select>
              <ChevronDown size={13} color="var(--app-text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Plan details, shared with…"
              rows={2}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: "12px",
              background: "var(--app-red-bg)", border: "1px solid var(--app-red-border)",
              color: "var(--app-red)", fontSize: "12px", fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            style={{
              width: "100%", padding: "16px", borderRadius: "20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              background: "var(--app-blue)",
              boxShadow: "0 4px 20px var(--app-blue-glow)",
              border: "none", cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Add Subscription</span>
          </button>
        </div>
      )}

      {/* Screenshot tab — coming soon */}
      {tab === "screenshot" && (
        <div style={{ padding: "40px 20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "var(--app-surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Camera size={28} color="var(--app-text-muted)" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px" }}>
              Coming soon
            </p>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", lineHeight: 1.5 }}>
              Screenshot detection is in development. Use Auto-detect or Manual entry in the meantime.
            </p>
          </div>
          <button
            onClick={() => setTab("auto")}
            style={{
              padding: "10px 20px", borderRadius: "999px",
              background: "var(--app-blue)", color: "#fff",
              border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Try Auto-detect instead
          </button>
        </div>
      )}

      {/* Connect tab */}

      {/* Success overlay */}
      {saved && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 80,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "0 40px", background: "var(--app-frame-bg)", fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "var(--app-green-bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "20px",
          }}>
            <CheckCircle size={36} color="var(--app-green)" strokeWidth={2} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px", textAlign: "center" }}>
            Subscription added
          </h3>
          <p style={{ fontSize: "14px", color: "var(--app-text-secondary)", lineHeight: 1.5, textAlign: "center" }}>
            {form.name} · <span style={{ fontFamily: "'DM Mono', monospace" }}>${form.amount}</span>/{cycleShort}
          </p>
        </div>
      )}
    </div>
  );
}
