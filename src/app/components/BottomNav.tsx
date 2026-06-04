import { Home, List, BarChart2, Sparkles, User, Plus } from "lucide-react";

export type Screen = "home" | "subscriptions" | "stats" | "insights" | "add" | "profile" | "analyze";

interface BottomNavProps {
  active: Screen;
  onChange: (s: Screen) => void;
  variantB?: boolean;
}

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "subscriptions", icon: List, label: "Subs" },
  { id: "stats", icon: BarChart2, label: "Stats" },
  { id: "insights", icon: Sparkles, label: "Insights" },
  { id: "profile", icon: User, label: "Profile" },
] as const;

const NAV_B_LEFT = [
  { id: "home", icon: Home, label: "Home" },
  { id: "subscriptions", icon: List, label: "Subs" },
] as const;

const NAV_B_RIGHT = [
  { id: "analyze", icon: BarChart2, label: "Analyze" },
  { id: "profile", icon: User, label: "Profile" },
] as const;

function NavButton({ id, icon: Icon, label, isActive, onChange }: {
  id: Screen; icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>; label: string; isActive: boolean; onChange: (s: Screen) => void;
}) {
  return (
    <button
      onClick={() => onChange(id)}
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        gap: "2px", cursor: "pointer", border: "none", background: "transparent", padding: 0,
      }}
    >
      <Icon
        size={22}
        color={isActive ? "var(--app-blue)" : "var(--app-text-muted)"}
        strokeWidth={isActive ? 2 : 1.5}
      />
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10px",
        color: isActive ? "var(--app-blue)" : "var(--app-text-muted)",
        fontWeight: isActive ? 600 : 400,
        letterSpacing: "0.02em",
      }}>
        {label}
      </span>
    </button>
  );
}

export function BottomNav({ active, onChange, variantB }: BottomNavProps) {
  if (variantB) {
    return (
      <nav style={{
        background: "var(--app-nav-bg)",
        borderTop: "1px solid var(--app-nav-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 28px", flexShrink: 0, gap: "4px",
        overflow: "visible",
      }}>
        {NAV_B_LEFT.map(item => (
          <NavButton key={item.id} id={item.id as Screen} icon={item.icon} label={item.label} isActive={active === item.id} onChange={onChange} />
        ))}
        <button
          onClick={() => onChange("add")}
          style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "var(--app-blue)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: "-20px", flexShrink: 0,
            boxShadow: "0 4px 14px var(--app-blue-glow)",
            position: "relative", zIndex: 1,
          }}
        >
          <Plus size={22} color="#fff" strokeWidth={2.5} />
        </button>
        {NAV_B_RIGHT.map(item => (
          <NavButton key={item.id} id={item.id as Screen} icon={item.icon} label={item.label} isActive={active === item.id} onChange={onChange} />
        ))}
      </nav>
    );
  }

  return (
    <nav style={{
      background: "var(--app-nav-bg)",
      borderTop: "1px solid var(--app-nav-border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px 28px", flexShrink: 0, gap: "4px",
    }}>
      {NAV_ITEMS.map((item) => (
        <NavButton key={item.id} id={item.id as Screen} icon={item.icon} label={item.label} isActive={active === item.id} onChange={onChange} />
      ))}
    </nav>
  );
}
