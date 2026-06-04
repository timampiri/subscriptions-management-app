import { useState } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer } from "recharts";
import { CATEGORY_BREAKDOWN, MONTHLY_SPEND_TREND, SUBSCRIPTIONS, totalMonthly } from "./data";

const monthly = totalMonthly(SUBSCRIPTIONS);

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
  if (active && payload?.length) {
    return (
      <div style={{ padding: "8px 12px", borderRadius: "10px", background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-card-shadow)", fontSize: "12px" }}>
        <p style={{ color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function StatsScreen() {
  const [timeline, setTimeline] = useState<"6m" | "1y">("6m");
  const topSubs = [...SUBSCRIPTIONS].filter(s => s.status === "active").sort((a, b) => b.amount - a.amount).slice(0, 4);
  const trendData = timeline === "6m" ? MONTHLY_SPEND_TREND.slice(-6) : MONTHLY_SPEND_TREND;

  const budget = 250;
  const pct = Math.min(100, (monthly / budget) * 100);
  const over = monthly > budget;
  const warning = pct >= 80 && !over;
  const barColor = over ? "var(--app-red)" : warning ? "var(--app-orange)" : "var(--app-blue)";
  const remaining = budget - monthly;

  const cardStyle: React.CSSProperties = {
    margin: "0 20px 16px",
    padding: "16px",
    borderRadius: "20px",
    background: "var(--app-card)",
    border: "1px solid var(--app-border)",
    boxShadow: "var(--app-card-shadow)",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", fontFamily: "'DM Sans', sans-serif", scrollbarWidth: "none" }}>
      <div style={{ padding: "24px 20px 16px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px" }}>Statistics</h2>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>Spending overview for June 2026</p>
      </div>

      {/* Monthly budget card */}
      <div style={{ margin: "0 20px 16px", padding: "14px 16px", borderRadius: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-card-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Monthly Budget</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>
              ${monthly.toFixed(0)} <span style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 400 }}>/ $250</span>
            </p>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
            background: over ? "var(--app-red-bg)" : warning ? "var(--app-yellow-bg)" : "var(--app-green-bg)",
            color: over ? "var(--app-red)" : warning ? "var(--app-yellow)" : "var(--app-blue)",
          }}>
            {over ? `$${Math.abs(remaining).toFixed(0)} over` : `$${remaining.toFixed(0)} left`}
          </span>
        </div>
        <div style={{ height: "8px", borderRadius: "999px", background: "var(--app-surface)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "999px", transition: "width 0.3s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "8px" }}>{pct.toFixed(0)}% of budget used</p>
      </div>

      {/* Trend chart */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Spending Trend
          </p>
          <div style={{ display: "flex", gap: "4px", background: "var(--app-surface)", borderRadius: "8px", padding: "3px" }}>
            {(["6m", "1y"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeline(t)}
                style={{
                  padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, border: "none", cursor: "pointer",
                  background: timeline === t ? "var(--app-card)" : "transparent",
                  color: timeline === t ? "var(--app-text-primary)" : "var(--app-text-muted)",
                  boxShadow: timeline === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {t === "6m" ? "6M" : "1Y"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={trendData} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area type="monotone" dataKey="amount" stroke="#163300" strokeWidth={2} fill="#163300" fillOpacity={0.15} isAnimationActive={false} dot={false} activeDot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category donut */}
      <div style={cardStyle}>
        <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
          By Category
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <PieChart width={120} height={120}>
            <Pie data={CATEGORY_BREAKDOWN} cx={55} cy={55} innerRadius={38} outerRadius={55} dataKey="amount" nameKey="category" strokeWidth={2} stroke="var(--app-card)" isAnimationActive={false}>
              {CATEGORY_BREAKDOWN.map((entry, i) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            {CATEGORY_BREAKDOWN.map((cat) => (
              <div key={cat.category} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <p style={{ fontSize: "11px", color: "var(--app-text-secondary)", flex: 1 }}>{cat.category}</p>
                <p style={{ fontSize: "11px", color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>${cat.amount.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={cardStyle}>
        <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
          Highest Costs
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={topSubs.map(s => ({ name: s.name, amount: s.amount, id: s.id }))} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} isAnimationActive={false} fill="#163300" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detection source */}
      <div style={{ padding: "0 20px 24px" }}>
        <p style={{ fontSize: "12px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
          Detection Source
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { label: "Email", count: SUBSCRIPTIONS.filter(s => s.source === "email").length, color: "var(--app-green)", icon: "📧" },
            { label: "Bank", count: SUBSCRIPTIONS.filter(s => s.source === "bank").length, color: "var(--app-blue)", icon: "🏦" },
            { label: "Manual", count: SUBSCRIPTIONS.filter(s => s.source === "manual").length, color: "var(--app-purple)", icon: "✍️" },
          ].map((src) => (
            <div
              key={src.label}
              style={{ flex: 1, padding: "12px", borderRadius: "16px", textAlign: "center", background: "var(--app-card)", border: "1px solid var(--app-border)", boxShadow: "var(--app-card-shadow)" }}
            >
              <p style={{ fontSize: "20px", marginBottom: "4px" }}>{src.icon}</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: src.color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{src.count}</p>
              <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "2px" }}>{src.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
