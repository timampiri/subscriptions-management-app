import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

export interface EditFormValues {
  name: string;
  amount: string;
  billingCycle: string;
  category: string;
  account: string;
}

interface Props {
  title: string;
  initialValues: EditFormValues;
  categories: string[];
  cycles: string[];
  showAccountField?: boolean;
  accountPlaceholder?: string;
  primaryLabel: string;
  onPrimary: (values: EditFormValues) => void;
  secondaryLabel: string;
  onSecondary: () => void;
  secondaryVariant?: "neutral" | "destructive";
  onClose: () => void;
  zIndex?: number;
}

const T = { ff: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: "14px", outline: "none",
  background: "var(--app-surface)", border: "1px solid var(--app-border-input)",
  color: "var(--app-text-primary)", fontSize: "14px", fontFamily: T.ff,
  boxSizing: "border-box",
};

export function SubscriptionEditForm({
  title, initialValues, categories, cycles,
  showAccountField = true, accountPlaceholder = "e.g. Chase ••4821",
  primaryLabel, onPrimary,
  secondaryLabel, onSecondary,
  secondaryVariant = "neutral",
  onClose,
  zIndex = 85,
}: Props) {
  const [form, setForm] = useState(initialValues);

  const secondaryStyle: React.CSSProperties = secondaryVariant === "destructive"
    ? { background: "transparent", color: "var(--app-red)", border: "1px solid var(--app-red-border)" }
    : { background: "transparent", color: "var(--app-text-primary)", border: "1px solid var(--app-border)" };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex,
      display: "flex", flexDirection: "column",
      background: "var(--app-frame-bg)", fontFamily: T.ff,
    }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={onClose} style={{
          width: "32px", height: "32px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--app-surface)", border: "none", cursor: "pointer", flexShrink: 0,
        }}>
          <X size={16} color="var(--app-text-primary)" />
        </button>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--app-text-primary)" }}>
          {title}
        </h2>
      </div>

      {/* Form */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "0 20px 24px",
        scrollbarWidth: "none", display: "flex", flexDirection: "column", gap: "16px",
      }}>
        <Field label="Service name">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field label="Amount">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--app-text-muted)", fontSize: "14px" }}>$</span>
                <input
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  type="number"
                  inputMode="decimal"
                  style={{ ...inputStyle, paddingLeft: "28px", fontFamily: T.mono }}
                />
              </div>
            </Field>
          </div>
          <div style={{ width: "130px", flexShrink: 0 }}>
            <Field label="Billing">
              <div style={{ position: "relative" }}>
                <select
                  value={form.billingCycle}
                  onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", paddingRight: "32px" }}
                >
                  {cycles.map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                </select>
                <ChevronDown size={13} color="var(--app-text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </Field>
          </div>
        </div>

        <Field label="Category">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {categories.map(cat => {
              const selected = form.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  style={{
                    padding: "6px 12px", borderRadius: "999px", cursor: "pointer",
                    background: selected ? "var(--app-blue)" : "var(--app-surface)",
                    fontSize: "12px", color: selected ? "#fff" : "var(--app-text-muted)",
                    border: `1px solid ${selected ? "var(--app-blue)" : "var(--app-border)"}`,
                    fontWeight: selected ? 600 : 400, fontFamily: T.ff,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Field>

        {showAccountField && (
          <Field label="Payment account">
            <input
              value={form.account}
              onChange={e => setForm({ ...form, account: e.target.value })}
              style={inputStyle}
              placeholder={accountPlaceholder}
            />
          </Field>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 20px 20px", borderTop: "1px solid var(--app-border)",
        display: "flex", gap: "8px", flexShrink: 0,
      }}>
        <button
          onClick={onSecondary}
          style={{
            flex: 1, padding: "12px 16px", borderRadius: "999px", cursor: "pointer",
            fontSize: "13px", fontWeight: 600, fontFamily: T.ff,
            ...secondaryStyle,
          }}
        >
          {secondaryLabel}
        </button>
        <button
          onClick={() => onPrimary(form)}
          style={{
            flex: 2, padding: "12px 16px", borderRadius: "999px",
            background: "var(--app-blue)", color: "var(--app-on-accent)",
            border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 700, fontFamily: T.ff,
            boxShadow: "0 4px 12px var(--app-blue-glow)",
          }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px",
      }}>{label}</p>
      {children}
    </div>
  );
}
