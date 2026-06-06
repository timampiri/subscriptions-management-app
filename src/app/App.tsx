import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { BottomNav, Screen } from "./components/BottomNav";
import { HomeScreen } from "./components/HomeScreen";
import { SubscriptionsScreen } from "./components/SubscriptionsScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { StatsScreen } from "./components/StatsScreen";
import { AddScreen } from "./components/AddScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SubscriptionDetail } from "./components/SubscriptionDetail";
import { ConnectAccountScreen } from "./components/ConnectAccountScreen";
import { AnalyzeScreen } from "./components/AnalyzeScreen";
import { SplashScreen } from "./components/SplashScreen";

const variantB = new URLSearchParams(window.location.search).get("v") !== "a";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [subsFilterOpen, setSubsFilterOpen] = useState(false);
  const [subsInitialUsageFilter, setSubsInitialUsageFilter] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);
  const [analyzeInitialTab, setAnalyzeInitialTab] = useState<"stats" | "insights">("stats");

  const goTo = (s: Screen) => {
    setPrevScreen(screen);
    const target = variantB && (s === "stats" || s === "insights") ? "analyze" : s;
    if (s === "insights" || s === "stats") setAnalyzeInitialTab(s as "stats" | "insights");
    if (target !== "subscriptions") setSubsInitialUsageFilter(null);
    setScreen(target);
  };

  return (
    <div
      className={dark ? "dark" : ""}
      style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-outer-bg)", fontFamily: "'DM Sans', sans-serif", position: "relative" }}
    >
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, var(--app-hero-glow) 0%, transparent 70%)",
          opacity: 0.12, top: "-200px", left: "50%", transform: "translateX(-50%)",
        }} />
      </div>

      {/* Theme toggle — floats top-right of outer canvas */}
      <button
        onClick={() => setDark(d => !d)}
        style={{
          position: "absolute", top: "24px", right: "24px", zIndex: 100,
          width: "40px", height: "40px", borderRadius: "50%",
          background: "var(--app-card)", border: "1px solid var(--app-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--app-card-shadow)", cursor: "pointer", transition: "all 0.2s ease",
        }}
      >
        {dark
          ? <Sun size={16} color="var(--app-yellow)" />
          : <Moon size={16} color="var(--app-blue)" />
        }
      </button>

      <Toaster position="bottom-center" />

      {/* Phone frame */}
      <div style={{
        position: "relative", display: "flex", flexDirection: "column", overflow: "hidden",
        width: "390px", height: "844px", maxHeight: "100vh",
        background: "var(--app-frame-bg)",
        borderRadius: "44px",
        boxShadow: "var(--app-frame-shadow)",
      }}>
        {showSplash && <SplashScreen />}
        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 32px 4px", zIndex: 10, flexShrink: 0 }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--app-status-text)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.02em" }}>
            9:41
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "2px" }}>
              {[4, 6, 8, 10].map((h, i) => (
                <div key={i} style={{ width: "4px", height: `${h}px`, borderRadius: "1px", background: i < 3 ? "var(--app-status-text)" : "var(--app-border)" }} />
              ))}
            </div>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 8.5C8.05 8.5 8.5 8.95 8.5 9.5C8.5 10.05 8.05 10.5 7.5 10.5C6.95 10.5 6.5 10.05 6.5 9.5C6.5 8.95 6.95 8.5 7.5 8.5Z" fill="var(--app-status-text)" />
              <path d="M4.5 6.5C5.4 5.6 6.4 5 7.5 5C8.6 5 9.6 5.6 10.5 6.5" stroke="var(--app-status-text)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M1.5 3.5C3.1 1.9 5.2 1 7.5 1C9.8 1 11.9 1.9 13.5 3.5" stroke="var(--app-status-text)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <div style={{ position: "relative", width: "24px", height: "12px", border: "1.5px solid var(--app-text-muted)", borderRadius: "3px" }}>
                <div style={{ position: "absolute", inset: "2px", width: "75%", background: "var(--app-status-text)", borderRadius: "1px" }} />
              </div>
              <div style={{ width: "2px", height: "5px", background: "var(--app-text-muted)", borderRadius: "0 1px 1px 0" }} />
            </div>
          </div>
        </div>

        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)",
          width: "120px", height: "34px", background: "#000", borderRadius: "20px", zIndex: 20,
        }} />

        {/* Screen content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, position: "relative", paddingTop: "8px" }}>
          {screen === "home" && (
            <HomeScreen
              onSelectSubscription={id => setSelectedSubscriptionId(id)}
              onNavigate={s => goTo(s)}
              onConnectNew={() => setConnecting(true)}
              onNavigateRarelyUsed={() => { setSubsInitialUsageFilter("Rarely used"); goTo("subscriptions"); }}
            />
          )}
          {screen === "subscriptions" && (
            <SubscriptionsScreen
              onSelect={id => setSelectedSubscriptionId(id)}
              onAdd={() => goTo("add")}
              onFilterOpenChange={setSubsFilterOpen}
              initialUsageFilter={subsInitialUsageFilter ?? undefined}
            />
          )}
          {screen === "insights" && (
            <InsightsScreen onSelectSubscription={id => setSelectedSubscriptionId(id)} />
          )}
          {screen === "stats" && <StatsScreen />}
          {screen === "analyze" && <AnalyzeScreen onSelectSubscription={id => setSelectedSubscriptionId(id)} initialTab={analyzeInitialTab} />}
          {screen === "add" && <AddScreen onBack={() => setScreen(prevScreen)} onConnectNew={() => setConnecting(true)} />}
          {screen === "profile" && <ProfileScreen onConnectNew={() => setConnecting(true)} />}

          {connecting && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "var(--app-frame-bg)", zIndex: 30 }}>
              <ConnectAccountScreen
                onBack={() => setConnecting(false)}
                onConnectComplete={() => { setConnecting(false); goTo("subscriptions"); }}
              />
            </div>
          )}

          {selectedSubscriptionId && (
            <SubscriptionDetail
              subscriptionId={selectedSubscriptionId}
              onClose={() => setSelectedSubscriptionId(null)}
            />
          )}
        </div>

        {/* Bottom nav — hidden on focus screens (Add, Subscription Detail, Connect, Subs filter sheet) */}
        {screen !== "add" && !selectedSubscriptionId && !connecting && !subsFilterOpen && (
          <BottomNav active={screen} onChange={goTo} variantB={variantB} />
        )}
      </div>

    </div>
  );
}
