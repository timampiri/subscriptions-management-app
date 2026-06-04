import { useState } from "react";
import { Bell, ChevronRight, Wifi, AlertCircle, Plus, X } from "lucide-react";
import { SUBSCRIPTIONS, LINKED_ACCOUNTS, ALERTS, totalMonthly, Subscription } from "./data";
import { SubscriptionCard } from "./SubscriptionCard";

type LinkedAccount = (typeof LINKED_ACCOUNTS)[number];

function subsFromAccount(linkedName: string): Subscription[] {
  if (linkedName.includes("@")) {
    return SUBSCRIPTIONS.filter(s => s.account === linkedName);
  }
  const suffix = linkedName.match(/••\d+/)?.[0];
  if (suffix) return SUBSCRIPTIONS.filter(s => s.account.includes(suffix));
  return SUBSCRIPTIONS.filter(s => s.account === linkedName);
}

interface HomeScreenProps {
  onSelectSubscription: (id: string) => void;
  onNavigate: (s: "subscriptions" | "insights" | "add" | "stats") => void;
  onConnectNew: () => void;
}

export function HomeScreen({ onSelectSubscription, onNavigate, onConnectNew }: HomeScreenProps) {
  const [alertsSeen, setAlertsSeen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);
  const monthly = totalMonthly(SUBSCRIPTIONS);
  const upcoming = ALERTS.filter((a) => a.daysUntil <= 7);

  const T = {
    ff: "'DM Sans', sans-serif",
    mono: "'DM Mono', monospace",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", fontFamily: T.ff }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px" }}>
        <div>
          <p style={{ fontSize: "12px", color: "var(--app-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Good morning
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "var(--app-text-primary)", lineHeight: 1.2 }}>
            John Mercer
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => onNavigate("add")}
            style={{
              display: "flex", alignItems: "center", gap: "4px", padding: "8px 12px", borderRadius: "999px",
              background: "var(--app-blue)", color: "#fff", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600, boxShadow: "0 4px 12px var(--app-blue-glow)",
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
          <button
            onClick={() => setAlertsSeen(true)}
            style={{
              position: "relative", width: "40px", height: "40px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--app-surface)", border: "none", cursor: "pointer",
            }}
          >
            <Bell size={18} color="var(--app-text-secondary)" strokeWidth={1.5} />
            {!alertsSeen && (
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                width: "8px", height: "8px", borderRadius: "50%", background: "var(--app-red)",
              }} />
            )}
          </button>
        </div>
      </div>

      {/* KPI grid */}
      {(() => {
        const active = SUBSCRIPTIONS.filter(s => s.status === "active");
        const rarelyUsed = active.filter(s => s.usageScore < 40).length;
        const upcomingCount = ALERTS.filter(a => a.daysUntil <= 7).length;
        const kpis = [
          { label: "Monthly", value: `$${monthly.toFixed(0)}`, sub: `of $250 monthly budget`, color: "var(--app-text-primary)", route: "stats" as const },
          { label: "Active", value: String(active.length), sub: "subscriptions", color: "var(--app-text-primary)", route: "subscriptions" as const },
          { label: "Rarely used", value: String(rarelyUsed), sub: "review these", color: "var(--app-red)", route: "subscriptions" as const },
          { label: "Renewals", value: String(upcomingCount), sub: "this week", color: "var(--app-text-primary)", route: "insights" as const },
        ];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 20px 16px" }}>
            {kpis.map(kpi => (
              <button
                key={kpi.label}
                onClick={() => onNavigate(kpi.route)}
                style={{
                  padding: "12px 14px", borderRadius: "16px",
                  background: "var(--app-card)", border: "1px solid var(--app-border)",
                  boxShadow: "var(--app-card-shadow)",
                  cursor: "pointer", textAlign: "left", fontFamily: T.ff,
                }}
              >
                <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  {kpi.label}
                </p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: kpi.color, fontFamily: T.mono, lineHeight: 1.1 }}>
                  {kpi.value}
                </p>
                <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "2px" }}>{kpi.sub}</p>
              </button>
            ))}
          </div>
        );
      })()}

      {/* Linked accounts */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            Linked Accounts
          </span>
          <button onClick={onConnectNew} style={{ fontSize: "12px", color: "var(--app-blue)", background: "none", border: "none", cursor: "pointer" }}>+ Add</button>
        </div>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
          {LINKED_ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 12px", borderRadius: "14px", flexShrink: 0,
                background: "var(--app-card)", border: "1px solid var(--app-border)",
                boxShadow: "var(--app-card-shadow)", cursor: "pointer",
                textAlign: "left", fontFamily: T.ff,
              }}
            >
              <span style={{ fontSize: "16px" }}>{acc.icon}</span>
              <div>
                <p style={{ fontSize: "10px", color: "var(--app-text-muted)", lineHeight: 1.2 }}>
                  {acc.type === "email" ? "Email" : "Bank"}
                </p>
                <p style={{ fontSize: "11px", color: "var(--app-text-primary)", lineHeight: 1.2 }}>
                  {acc.name.length > 16 ? acc.name.slice(0, 16) + "…" : acc.name}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "4px" }}>
                <Wifi size={10} color="var(--app-green)" />
                <span style={{ fontSize: "9px", color: "var(--app-green)" }}>{subsFromAccount(acc.name).length}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Nudge */}
      <div style={{ margin: "0 20px 16px" }}>
        <button
          onClick={() => onNavigate("insights")}
          style={{
            width: "100%", display: "flex", alignItems: "flex-start", gap: "12px",
            padding: "16px", borderRadius: "20px", textAlign: "left", cursor: "pointer",
            background: "var(--app-ai-bg)", border: "1px solid var(--app-ai-border)",
          }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--app-purple-bg)", flexShrink: 0,
          }}>
            <AlertCircle size={16} color="var(--app-purple)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", color: "var(--app-ai-text)", fontWeight: 600, marginBottom: "2px" }}>AI Insight</p>
            <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.4 }}>
              You could save <span style={{ color: "var(--app-green)", fontWeight: 600 }}>$743/yr</span> by cancelling 2 underused subscriptions.
            </p>
          </div>
          <ChevronRight size={16} color="var(--app-text-muted)" />
        </button>
      </div>

      {/* Upcoming renewals */}
      {upcoming.length > 0 && (
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
              Renewals This Week
            </span>
            <button onClick={() => onNavigate("insights")} style={{ fontSize: "12px", color: "var(--app-blue)", background: "none", border: "none", cursor: "pointer" }}>
              See all
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {upcoming.map((alert) => {
              const sub = SUBSCRIPTIONS.find(s => s.id === alert.subscriptionId);
              if (!sub) return null;
              return (
                <SubscriptionCard
                  key={alert.id}
                  sub={sub}
                  onClick={() => onSelectSubscription(alert.subscriptionId)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recent subscriptions */}
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-text-muted)", letterSpacing: "0.02em", textTransform: "uppercase" }}>
            All Subscriptions
          </span>
          <button onClick={() => onNavigate("subscriptions")} style={{ fontSize: "12px", color: "var(--app-blue)", background: "none", border: "none", cursor: "pointer" }}>
            View all
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SUBSCRIPTIONS.filter(s => s.status === "active").slice(0, 4).map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onClick={() => onSelectSubscription(sub.id)}
            />
          ))}
        </div>
      </div>

      {/* Account subscriptions sheet */}
      {selectedAccount && (
        <div
          onClick={() => setSelectedAccount(null)}
          style={{
            position: "absolute", inset: 0, zIndex: 60,
            display: "flex", alignItems: "flex-end",
            background: "rgba(0,0,0,0.32)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", padding: "20px", maxHeight: "75%", overflowY: "auto",
              background: "var(--app-card)",
              borderTopLeftRadius: "20px", borderTopRightRadius: "20px",
              boxShadow: "0 -10px 30px rgba(0,0,0,0.16)",
              scrollbarWidth: "none", fontFamily: T.ff,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--app-surface)", fontSize: "18px",
                }}>{selectedAccount.icon}</div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text-primary)" }}>
                    {selectedAccount.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>
                    {selectedAccount.type === "email" ? "Email" : "Bank"} · {subsFromAccount(selectedAccount.name).length} subscription{subsFromAccount(selectedAccount.name).length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--app-surface)", border: "none", cursor: "pointer",
                }}
              >
                <X size={14} color="var(--app-text-secondary)" />
              </button>
            </div>

            {subsFromAccount(selectedAccount.name).length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--app-text-muted)", textAlign: "center", padding: "32px 0" }}>
                No subscriptions linked to this account yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {subsFromAccount(selectedAccount.name).map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => { setSelectedAccount(null); onSelectSubscription(sub.id); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px", borderRadius: "14px", width: "100%", textAlign: "left",
                      background: "var(--app-surface)", border: "1px solid var(--app-border)",
                      cursor: "pointer", fontFamily: T.ff,
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>{sub.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{sub.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{sub.category}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: T.mono, lineHeight: 1 }}>
                        ${sub.amount.toFixed(2)}
                      </p>
                      <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "2px" }}>
                        /{sub.billingCycle === "monthly" ? "mo" : sub.billingCycle === "annual" ? "yr" : "wk"}
                      </p>
                    </div>
                    <ChevronRight size={14} color="var(--app-text-muted)" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
