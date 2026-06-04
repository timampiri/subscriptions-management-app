import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, ResponsiveContainer } from "recharts";
import { CATEGORY_BREAKDOWN, MONTHLY_SPEND_TREND, SUBSCRIPTIONS, totalMonthly } from "./data";

const MAIN_CATS = new Set(CATEGORY_BREAKDOWN.filter(c => c.category !== "Other").map(c => c.category));
const subsByCat: Record<string, typeof SUBSCRIPTIONS> = {};
CATEGORY_BREAKDOWN.forEach(c => (subsByCat[c.category] = []));
SUBSCRIPTIONS.filter(s => s.status !== "cancelled").forEach(s => {
  if (MAIN_CATS.has(s.category)) subsByCat[s.category]?.push(s);
  else subsByCat["Other"]?.push(s);
});

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            {CATEGORY_BREAKDOWN.map((cat) => {
              const count = subsByCat[cat.category]?.length ?? 0;
              return (
                <button
                  key={cat.category}
                  onClick={() => count > 0 && setSelectedCategory(cat.category)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", padding: "2px 0",
                    cursor: count > 0 ? "pointer" : "default", textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                  <p style={{ fontSize: "11px", color: "var(--app-text-secondary)", flex: 1 }}>{cat.category}</p>
                  {count > 0 && (
                    <span style={{ fontSize: "10px", color: "var(--app-text-muted)", background: "var(--app-surface)", borderRadius: "999px", padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>
                      {count}
                    </span>
                  )}
                  <p style={{ fontSize: "11px", color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace" }}>${cat.amount.toFixed(0)}</p>
                </button>
              );
            })}
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

      {/* Category popup */}
      {selectedCategory && (() => {
        const subs = subsByCat[selectedCategory] ?? [];
        const cat = CATEGORY_BREAKDOWN.find(c => c.category === selectedCategory)!;
        return (
          <div
            onClick={() => setSelectedCategory(null)}
            style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,0.32)" }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", padding: "20px", maxHeight: "75%", overflowY: "auto", background: "var(--app-card)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", boxShadow: "0 -10px 30px rgba(0,0,0,0.16)", scrollbarWidth: "none", fontFamily: "'DM Sans', sans-serif" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: cat.color }} />
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)" }}>{selectedCategory}</p>
                    <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{subs.length} subscription{subs.length !== 1 ? "s" : ""} · ${cat.amount.toFixed(0)}/mo</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCategory(null)} style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-surface)", border: "none", cursor: "pointer" }}>
                  <X size={14} color="var(--app-text-secondary)" />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {subs.map(sub => (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "14px", background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
                    <span style={{ fontSize: "22px" }}>{sub.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{sub.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{sub.category}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>${sub.amount.toFixed(2)}</p>
                      <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "2px" }}>/{sub.billingCycle === "monthly" ? "mo" : sub.billingCycle === "annual" ? "yr" : "wk"}</p>
                    </div>
                    <ChevronRight size={14} color="var(--app-text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

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
