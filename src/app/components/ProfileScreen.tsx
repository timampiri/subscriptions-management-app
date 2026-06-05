import { ChevronRight, Bell, CreditCard, Shield, HelpCircle, LogOut, Moon, Globe, Check, Sparkles } from "lucide-react";
import { LINKED_ACCOUNTS } from "./data";

interface ProfileScreenProps {
  onConnectNew: () => void;
}

export function ProfileScreen({ onConnectNew }: ProfileScreenProps) {
  const currentPlan: "pro" | "free" = "pro";

  const sectionLabel: React.CSSProperties = {
    fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 16px", width: "100%", textAlign: "left",
    background: "var(--app-card)", border: "1px solid var(--app-border)",
    cursor: "pointer", boxShadow: "var(--app-card-shadow)",
  };

  const settings = [
    { icon: Bell, label: "Notifications", value: "Renewal alerts on" },
    { icon: CreditCard, label: "Payment methods", value: "3 cards linked" },
    { icon: Moon, label: "Appearance", value: "System" },
    { icon: Globe, label: "Currency", value: "USD ($)" },
  ];

  const support = [
    { icon: Shield, label: "Privacy & security" },
    { icon: HelpCircle, label: "Help center" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none" }}>
      <div style={{ padding: "24px 20px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "16px" }}>Profile</h2>

        {/* Identity card */}
        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          padding: "16px", borderRadius: "20px",
          background: "var(--app-hero-bg)", border: "1px solid var(--app-hero-border)",
          boxShadow: "var(--app-card-shadow)", marginBottom: "16px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, var(--app-blue) 0%, #1F4A00 100%)",
            color: "#fff", fontSize: "20px", fontWeight: 700, flexShrink: 0,
          }}>
            JM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", lineHeight: 1.2 }}>
              John Mercer
            </p>
            <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginTop: "2px" }}>
              john@gmail.com
            </p>
          </div>
          <button style={{
            padding: "6px 12px", borderRadius: "999px",
            background: "var(--app-card)", border: "1px solid var(--app-border)",
            fontSize: "11px", fontWeight: 600, color: "var(--app-text-secondary)", cursor: "pointer",
          }}>
            Edit
          </button>
        </div>

        {/* Plan card */}
        <p style={sectionLabel}>Plan</p>
        <div style={{
          padding: "16px", borderRadius: "20px", marginBottom: "20px",
          background: currentPlan === "pro"
            ? "linear-gradient(135deg, var(--app-blue) 0%, #1F4A00 100%)"
            : "var(--app-card)",
          border: currentPlan === "pro" ? "none" : "1px solid var(--app-border)",
          boxShadow: currentPlan === "pro" ? "0 8px 24px var(--app-blue-glow)" : "var(--app-card-shadow)",
          color: currentPlan === "pro" ? "#fff" : "var(--app-text-primary)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} color={currentPlan === "pro" ? "#fff" : "var(--app-blue)"} />
              <p style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.01em" }}>
                {currentPlan === "pro" ? "Pro" : "Free"} plan
              </p>
            </div>
            <span style={{
              padding: "3px 10px", borderRadius: "999px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              background: currentPlan === "pro" ? "rgba(255,255,255,0.18)" : "var(--app-surface)",
              color: currentPlan === "pro" ? "#fff" : "var(--app-text-muted)",
            }}>
              Current
            </span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
            {(currentPlan === "pro"
              ? [
                  "Track subscriptions across up to 15 connected accounts",
                  "Automatic detection from email & bank",
                  "AI insights & renewal alerts",
                ]
              : [
                  "Up to 3 manually added subscriptions",
                  "Renewal reminders",
                  "No automatic tracking",
                ]
            ).map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", lineHeight: 1.4 }}>
                <Check size={13} style={{ marginTop: "2px", flexShrink: 0, opacity: currentPlan === "pro" ? 0.9 : 0.6 }} />
                <span style={{ opacity: currentPlan === "pro" ? 0.95 : 0.85 }}>{f}</span>
              </li>
            ))}
          </ul>

          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            width: "100%", padding: "10px", borderRadius: "12px",
            background: currentPlan === "pro" ? "rgba(255,255,255,0.18)" : "var(--app-blue)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600,
          }}>
            {currentPlan === "pro" ? "Manage plan" : "Upgrade to Pro"}
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Linked accounts */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <p style={{ ...sectionLabel, marginBottom: 0 }}>Linked Accounts</p>
          <button onClick={onConnectNew} style={{ fontSize: "12px", color: "var(--app-blue)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Add</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {LINKED_ACCOUNTS.map((acc) => (
            <button key={acc.id} style={{ ...rowStyle, borderRadius: "14px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--app-surface)", fontSize: "18px", flexShrink: 0,
              }}>
                {acc.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{acc.name}</p>
                <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>
                  {acc.type === "email" ? "Email" : "Bank"} · {acc.count} subscriptions
                </p>
              </div>
              <ChevronRight size={16} color="var(--app-text-muted)" />
            </button>
          ))}
        </div>

        {/* Settings */}
        <p style={sectionLabel}>Settings</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {settings.map(({ icon: Icon, label, value }) => (
            <button key={label} style={{ ...rowStyle, borderRadius: "14px" }}>
              <Icon size={16} color="var(--app-text-secondary)" />
              <span style={{ flex: 1, fontSize: "14px", color: "var(--app-text-primary)" }}>{label}</span>
              <span style={{ fontSize: "12px", color: "var(--app-text-muted)" }}>{value}</span>
              <ChevronRight size={14} color="var(--app-text-muted)" />
            </button>
          ))}
        </div>

        {/* Support */}
        <p style={sectionLabel}>Support</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {support.map(({ icon: Icon, label }) => (
            <button key={label} style={{ ...rowStyle, borderRadius: "14px" }}>
              <Icon size={16} color="var(--app-text-secondary)" />
              <span style={{ flex: 1, fontSize: "14px", color: "var(--app-text-primary)" }}>{label}</span>
              <ChevronRight size={14} color="var(--app-text-muted)" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          width: "100%", padding: "14px", borderRadius: "14px",
          background: "var(--app-red-bg)", border: "1px solid var(--app-red-border)",
          color: "var(--app-red)", fontSize: "14px", fontWeight: 600, cursor: "pointer",
          marginBottom: "16px",
        }}>
          <LogOut size={15} />
          Sign out
        </button>

        <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textAlign: "center" }}>
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}
