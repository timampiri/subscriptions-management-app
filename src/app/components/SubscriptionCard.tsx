import { Subscription } from "./data";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function daysLeftLabel(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "1 day left";
  if (days > 0) return `${days} days left`;
  if (days === -1) return "1 day ago";
  return `${Math.abs(days)} days ago`;
}

function daysLeftColor(days: number) {
  if (days > 7) return "var(--app-text-muted)";
  if (days >= 1 && days <= 3) return "var(--app-red)";
  return "var(--app-orange)";
}

function cycleSuffix(c: Subscription["billingCycle"]) {
  return c === "monthly" ? "/mo" : c === "annual" ? "/yr" : "/wk";
}

function usageTag(score: number) {
  if (score >= 75) return { label: "Heavy use", bg: "var(--app-usage-heavy-bg)", fg: "var(--app-usage-heavy-fg)" };
  if (score >= 40) return { label: "Moderate use", bg: "var(--app-usage-moderate-bg)", fg: "var(--app-usage-moderate-fg)" };
  return { label: "Rarely used", bg: "var(--app-usage-rare-bg)", fg: "var(--app-usage-rare-fg)" };
}

interface SubscriptionCardProps {
  sub: Subscription;
  onClick: () => void;
  variant?: "default" | "history";
}

const inlineTag = (bg: string, fg: string, label: string) => (
  <span style={{
    padding: "2px 8px", borderRadius: "999px",
    fontSize: "10px", fontWeight: 600,
    background: bg, color: fg,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

export function SubscriptionCard({ sub, onClick, variant = "default" }: SubscriptionCardProps) {
  const isHistory = variant === "history";
  const isTrial = sub.status === "trial";
  const tag = usageTag(sub.usageScore);
  const d = daysUntil(sub.nextRenewal);

  const renewalLine = isHistory
    ? `Ended ${fmtDate(sub.nextRenewal)}`
    : isTrial
      ? `Trial ends ${fmtDate(sub.nextRenewal)}`
      : `Renews ${fmtDate(sub.nextRenewal)}`;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px", borderRadius: "14px", width: "100%", textAlign: "left",
        background: isTrial ? "var(--app-trial-bg)" : "var(--app-card)",
        border: `1px solid ${isTrial ? "var(--app-trial-border)" : "var(--app-border)"}`,
        cursor: "pointer", boxShadow: "var(--app-card-shadow)",
        opacity: isHistory ? 0.7 : 1,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isHistory ? "var(--app-surface)" : sub.color + "22",
        flexShrink: 0,
        filter: isHistory ? "grayscale(1)" : "none",
      }}>
        <span style={{ fontSize: "20px", lineHeight: 1 }}>{sub.emoji}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <p style={{
            fontSize: "14px",
            color: isHistory ? "var(--app-text-secondary)" : "var(--app-text-primary)",
            fontWeight: 500,
            textDecoration: isHistory ? "line-through" : "none",
          }}>
            {sub.name}
          </p>
          {!isHistory && isTrial && inlineTag("var(--app-trial-tag-bg)", "var(--app-trial-tag-fg)", "Free trial")}
          {!isHistory && !isTrial && sub.status === "paused" && inlineTag("var(--app-yellow-bg)", "var(--app-yellow)", "Paused")}
          {!isHistory && !isTrial && sub.status === "active" && inlineTag(tag.bg, tag.fg, tag.label)}
          {isHistory && inlineTag("var(--app-red-bg)", "var(--app-red)", "Cancelled")}
        </div>
        <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "2px" }}>
          {renewalLine}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
        {isTrial ? (
          <p style={{ fontSize: "13px", color: "var(--app-trial-tag-bg)", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
            FREE
          </p>
        ) : (
          <p style={{ fontSize: "14px", color: isHistory ? "var(--app-text-muted)" : "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
            ${sub.amount}<span style={{ fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 400 }}>{cycleSuffix(sub.billingCycle)}</span>
          </p>
        )}
        {!isHistory && (
          <p style={{ fontSize: "10px", color: daysLeftColor(d), fontWeight: 600, marginTop: "2px" }}>
            {daysLeftLabel(d)}
          </p>
        )}
      </div>
    </button>
  );
}
