import { useState } from "react";
import { StatsScreen } from "./StatsScreen";
import { InsightsScreen } from "./InsightsScreen";

interface AnalyzeScreenProps {
  onSelectSubscription: (id: string) => void;
  initialTab?: "stats" | "insights";
}

export function AnalyzeScreen({ onSelectSubscription, initialTab = "stats" }: AnalyzeScreenProps) {
  const [tab, setTab] = useState<"stats" | "insights">(initialTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div style={{ padding: "16px 20px 8px", flexShrink: 0 }}>
        <div style={{
          display: "flex",
          background: "var(--app-surface)",
          borderRadius: "12px",
          padding: "3px",
        }}>
          {(["stats", "insights"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: tab === t ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                background: tab === t ? "var(--app-card)" : "transparent",
                color: tab === t ? "var(--app-text-primary)" : "var(--app-text-muted)",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {t === "stats" ? "Stats" : "Insights"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === "stats" ? (
          <StatsScreen />
        ) : (
          <InsightsScreen onSelectSubscription={onSelectSubscription} />
        )}
      </div>
    </div>
  );
}
