import { useState, useMemo } from "react";
import { ArrowLeft, Search, Check, ChevronRight } from "lucide-react";
import { LINKED_ACCOUNTS } from "./data";
import { ProviderConnectFlow, ConnectProvider } from "./ProviderConnectFlow";

interface ConnectAccountScreenProps {
  onBack: () => void;
  onConnectComplete?: () => void;
}

const PROVIDERS = [
  { id: "gmail", name: "Gmail", type: "Email", icon: "📧", desc: "Scan emails for subscription receipts" },
  { id: "outlook", name: "Outlook", type: "Email", icon: "📬", desc: "Scan emails for subscription receipts" },
  { id: "yahoo", name: "Yahoo Mail", type: "Email", icon: "📨", desc: "Scan emails for subscription receipts" },
  { id: "icloud", name: "iCloud Mail", type: "Email", icon: "✉️", desc: "Scan emails for subscription receipts" },
  { id: "chase", name: "Chase", type: "Bank", icon: "🏦", desc: "Link via Plaid" },
  { id: "boa", name: "Bank of America", type: "Bank", icon: "🏧", desc: "Link via Plaid" },
  { id: "wellsfargo", name: "Wells Fargo", type: "Bank", icon: "🏛️", desc: "Link via Plaid" },
  { id: "amex", name: "American Express", type: "Card", icon: "💳", desc: "Sync card transactions" },
  { id: "applecard", name: "Apple Card", type: "Card", icon: "💳", desc: "Connect via Apple Pay" },
  { id: "paypal", name: "PayPal", type: "Wallet", icon: "📊", desc: "Sync PayPal subscription history" },
  { id: "revolut", name: "Revolut", type: "Bank", icon: "💸", desc: "Link via Open Banking" },
  { id: "monzo", name: "Monzo", type: "Bank", icon: "🐷", desc: "Link via Open Banking" },
];

export function ConnectAccountScreen({ onBack, onConnectComplete }: ConnectAccountScreenProps) {
  const [search, setSearch] = useState("");
  const [activeProvider, setActiveProvider] = useState<ConnectProvider | null>(null);
  const [activeMode, setActiveMode] = useState<"fresh" | "revisit">("fresh");

  const connectedInfo = useMemo(() => {
    const map = new Map<string, number>();
    LINKED_ACCOUNTS.forEach(a => {
      const key = a.name.toLowerCase().split(/[\s•]/)[0];
      map.set(key, (map.get(key) ?? 0) + a.count);
    });
    return map;
  }, []);

  const filtered = useMemo(
    () => PROVIDERS.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof PROVIDERS> = {};
    filtered.forEach(p => {
      if (!map[p.type]) map[p.type] = [];
      map[p.type].push(p);
    });
    return map;
  }, [filtered]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif", minHeight: 0 }}>
      <div style={{ padding: "24px 20px 12px", flexShrink: 0 }}>
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
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px" }}>
          Connect account
        </h2>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "14px" }}>
          Pick a provider to automatically detect subscriptions
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "14px", background: "var(--app-surface)" }}>
          <Search size={15} color="var(--app-text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search providers…"
            autoFocus
            style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: "14px", color: "var(--app-text-primary)", fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
      </div>

      {activeProvider && (
        <ProviderConnectFlow
          provider={activeProvider}
          mode={activeMode}
          onCancel={() => setActiveProvider(null)}
          onComplete={activeMode === "revisit"
            ? () => setActiveProvider(null)
            : () => { setActiveProvider(null); (onConnectComplete ?? onBack)(); }}
        />
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px", scrollbarWidth: "none" }}>
        {Object.keys(grouped).length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--app-text-muted)", textAlign: "center", marginTop: "40px" }}>
            No providers match "{search}"
          </p>
        ) : (
          Object.entries(grouped).map(([type, items]) => (
            <div key={type} style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", color: "var(--app-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                {type}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map(p => {
                  const key = p.name.toLowerCase().split(" ")[0];
                  const count = connectedInfo.get(key);
                  const connected = count !== undefined;
                  const openRevisit = () => { setActiveMode("revisit"); setActiveProvider(p); };
                  return (
                    <div
                      key={p.id}
                      onClick={connected ? openRevisit : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "14px", borderRadius: "14px",
                        background: "var(--app-card)", border: "1px solid var(--app-border)",
                        boxShadow: "var(--app-card-shadow)",
                        cursor: connected ? "pointer" : "default",
                      }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--app-surface)", fontSize: "18px", flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{p.name}</p>
                        <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{p.desc}</p>
                      </div>
                      {connected ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "999px", background: "var(--app-green-bg)", color: "var(--app-blue)", fontSize: "10px", fontWeight: 700 }}>
                            <Check size={11} /> Connected · {count}
                          </span>
                          <ChevronRight size={14} color="var(--app-text-muted)" />
                        </div>
                      ) : (
                        <button
                          onClick={() => { setActiveMode("fresh"); setActiveProvider(p); }}
                          style={{
                            padding: "6px 12px", borderRadius: "999px",
                            background: "var(--app-blue)", color: "var(--app-on-accent)",
                            border: "none", cursor: "pointer",
                            fontSize: "12px", fontWeight: 600,
                          }}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
