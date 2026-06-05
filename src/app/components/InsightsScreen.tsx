import { Sparkles, AlertTriangle, CheckCircle, Info, ChevronRight, Bell, TrendingDown } from "lucide-react";
import { AI_INSIGHTS, ALERTS, SUBSCRIPTIONS } from "./data";

interface InsightsScreenProps {
  onSelectSubscription: (id: string) => void;
}

const ICON_MAP = { warning: AlertTriangle, success: CheckCircle, info: Info };
const COLOR_MAP = {
  warning: { bg: "var(--app-red-bg)", border: "var(--app-red-border)", icon: "var(--app-red)" },
  success: { bg: "var(--app-green-bg)", border: "var(--app-green-border)", icon: "var(--app-green)" },
  info: { bg: "var(--app-blue-bg)", border: "var(--app-blue-border)", icon: "var(--app-blue)" },
};

export function InsightsScreen({ onSelectSubscription }: InsightsScreenProps) {
  const totalSavings = AI_INSIGHTS.reduce((s, i) => s + i.savings, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none" }}>
      <div style={{ padding: "24px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Sparkles size={18} color="var(--app-purple)" />
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)" }}>Insights</h2>
        </div>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>AI-powered analysis updated just now</p>
      </div>

      {/* Savings summary */}
      <div style={{ margin: "0 20px 20px", padding: "16px", borderRadius: "20px", background: "var(--app-ai-bg)", border: "1px solid var(--app-ai-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-purple-bg)", flexShrink: 0 }}>
            <TrendingDown size={18} color="var(--app-purple)" />
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "var(--app-ai-text)", fontWeight: 600, marginBottom: "2px" }}>
              Potential Annual Savings
            </p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
              ${totalSavings.toFixed(0)}
            </p>
            <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginTop: "4px" }}>
              by acting on {AI_INSIGHTS.filter(i => i.savings > 0).length} recommendations below
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <Sparkles size={12} color="var(--app-purple)" />
          <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            AI Suggestions
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {AI_INSIGHTS.map((insight) => {
            const Icon = ICON_MAP[insight.type as keyof typeof ICON_MAP];
            const colors = COLOR_MAP[insight.type as keyof typeof COLOR_MAP];
            return (
              <div
                key={insight.id}
                style={{ padding: "16px", borderRadius: "20px", background: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                  <Icon size={16} color={colors.icon} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 600, lineHeight: 1.3 }}>
                    {insight.title}
                  </p>
                </div>
                <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5, marginLeft: "28px" }}>
                  {insight.body}
                </p>
                {insight.savings > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", marginLeft: "28px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "8px", fontSize: "11px", background: "var(--app-trial-bg)", color: "var(--app-green)", fontWeight: 600 }}>
                      Save ${insight.savings.toFixed(0)}/yr
                    </span>
                    {insight.subscriptionId && (
                      <button
                        onClick={() => onSelectSubscription(insight.subscriptionId!)}
                        style={{ fontSize: "12px", color: "var(--app-blue)", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
                      >
                        Take action →
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Renewal Alerts */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <Bell size={14} color="var(--app-text-muted)" />
          <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Upcoming Renewals
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {ALERTS.map((alert) => {
            const urgencyColor = alert.urgency === "high" ? "var(--app-red)" : alert.urgency === "medium" ? "var(--app-yellow)" : "var(--app-green)";
            const urgencyBg = alert.urgency === "high" ? "var(--app-red-bg)" : alert.urgency === "medium" ? "var(--app-yellow-bg)" : "var(--app-green-bg)";
            return (
              <button
                key={alert.id}
                onClick={() => onSelectSubscription(alert.subscriptionId)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px", borderRadius: "14px", width: "100%", textAlign: "left",
                  background: "var(--app-card)", border: "1px solid var(--app-border)",
                  cursor: "pointer", boxShadow: "var(--app-card-shadow)",
                }}
              >
                <div style={{ width: "3px", borderRadius: "2px", alignSelf: "stretch", background: urgencyColor, minHeight: "36px" }} />
                <span style={{ fontSize: "20px", lineHeight: 1 }}>{alert.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{alert.name}</p>
                  <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>
                    {alert.date} · {alert.daysUntil === 0 ? "Today" : `in ${alert.daysUntil} day${alert.daysUntil === 1 ? "" : "s"}`}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>
                    ${alert.amount}
                  </p>
                  <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "9px", background: urgencyBg, color: urgencyColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {alert.urgency}
                  </span>
                </div>
                <ChevronRight size={14} color="var(--app-text-muted)" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Scores */}
      <div style={{ padding: "0 20px 24px" }}>
        <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
          Usage Scores
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SUBSCRIPTIONS.filter(s => s.status === "active").slice(0, 5).map((sub) => (
            <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px", width: "24px", textAlign: "center", lineHeight: 1 }}>{sub.emoji}</span>
              <p style={{ fontSize: "13px", color: "var(--app-text-primary)", width: "90px", flexShrink: 0 }}>{sub.name}</p>
              <div style={{ flex: 1, height: "8px", borderRadius: "4px", overflow: "hidden", background: "var(--app-surface)" }}>
                <div style={{
                  height: "100%", borderRadius: "4px",
                  width: `${sub.usageScore}%`,
                  background: sub.usageScore > 70 ? "var(--app-green)" : sub.usageScore > 40 ? "var(--app-yellow)" : "var(--app-red)",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <span style={{ fontSize: "11px", color: "var(--app-text-muted)", fontFamily: "'DM Mono', monospace", width: "32px", textAlign: "right" }}>
                {sub.usageScore}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
