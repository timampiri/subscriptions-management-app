import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, X, Shield, Bell, Info, CheckCircle, ChevronDown, ChevronRight, Search as SearchIcon, Sparkles, Calendar, RefreshCw, Mail as MailIcon, Tag, Pencil, Trash2 } from "lucide-react";
import { DETECTED_SUBSCRIPTIONS, DetectedSubscription } from "./data";
import { SubscriptionEditForm } from "./SubscriptionEditForm";

const DETECTED_CATEGORIES = ["Entertainment", "Music", "Productivity", "AI Tools", "Design", "Storage", "Developer Tools", "Security", "Education", "News", "Creators", "Wellness", "Other"];
const DETECTED_CYCLES = ["monthly", "annual"];

export interface ConnectProvider {
  id: string;
  name: string;
  type: string;
  icon: string;
  desc: string;
}

interface Props {
  provider: ConnectProvider;
  onCancel: () => void;
  onComplete: () => void;
  mode?: "fresh" | "revisit";
}

type Step = "permissions" | "handoff" | "scanning" | "results" | "done";

const COPY_BY_TYPE: Record<string, { verb: string; verbContinuous: string; noun: string; surface: string }> = {
  Email:  { verb: "scan", verbContinuous: "Scanning", noun: "receipts and invoices", surface: "inbox" },
  Bank:   { verb: "read", verbContinuous: "Reading",  noun: "recurring transactions", surface: "statements" },
  Card:   { verb: "read", verbContinuous: "Reading",  noun: "recurring charges",       surface: "card" },
  Wallet: { verb: "read", verbContinuous: "Reading",  noun: "recurring payments",      surface: "wallet" },
};

const T = { ff: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

export function ProviderConnectFlow({ provider, onCancel, onComplete, mode = "fresh" }: Props) {
  const [step, setStep] = useState<Step>(mode === "revisit" ? "results" : "permissions");
  const copy = COPY_BY_TYPE[provider.type] ?? COPY_BY_TYPE.Email;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 60,
      display: "flex", flexDirection: "column",
      background: "var(--app-frame-bg)",
      fontFamily: T.ff,
    }}>
      {step === "permissions" && <PermissionsStep provider={provider} onCancel={onCancel} onContinue={() => setStep("handoff")} />}
      {step === "handoff" && <HandoffStep provider={provider} onDone={() => setStep("scanning")} />}
      {step === "scanning" && <ScanningStep provider={provider} copy={copy} onCancel={onCancel} onDone={() => setStep("results")} />}
      {step === "results" && <ResultsStep provider={provider} mode={mode} onCancel={onCancel} onDone={() => setStep("done")} onClose={onComplete} />}
      {step === "done" && <DoneStep onConnectAnother={onCancel} onClose={onComplete} />}
    </div>
  );
}

/* ─────────────────────────  STEP 1: PERMISSIONS  ───────────────────────── */

function PermissionsStep({
  provider, onCancel, onContinue,
}: {
  provider: ConnectProvider;
  onCancel: () => void;
  onContinue: () => void;
}) {
  const reads = {
    Email: ["Receipt and invoice emails from the last 12 months", "Sender addresses (e.g. billing@netflix.com)", "Subject lines and email dates"],
    Bank:  ["Recurring transactions on this account only", "Merchant name, amount, and date", "Last 12 months of statement history"],
    Card:  ["Recurring charges on this card", "Merchant name, amount, and date", "Last 12 months of card history"],
    Wallet:["Recurring payments from your wallet", "Recipient name, amount, and date", "Last 12 months of wallet history"],
  }[provider.type] ?? [];

  const wontDo = [
    "Read personal emails or messages",
    "Store your password — we use secure OAuth",
    "Share your data with third parties",
    "Make changes on your behalf",
  ];

  return (
    <>
      <Header onBack={onCancel} title="Privacy & access" />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px", scrollbarWidth: "none" }}>
        <ProviderHero provider={provider} />

        <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px", lineHeight: 1.3 }}>
          Before we connect to {provider.name}
        </h3>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          We're a guest in your account. Here's exactly what we'll do — and what we won't.
        </p>

        <Card>
          <CardHead icon={<Check size={14} color="var(--app-green)" />} label="What we'll read" />
          <List items={reads} variant="check" />
        </Card>

        <div style={{ height: "12px" }} />

        <Card>
          <CardHead icon={<X size={14} color="var(--app-red)" />} label="What we won't do" />
          <List items={wontDo} variant="cross" />
        </Card>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            marginTop: "16px", fontSize: "12px", color: "var(--app-blue)",
            textDecoration: "none", fontWeight: 600,
          }}
        >
          Read full privacy policy →
        </a>
      </div>

      <FooterBar>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onContinue} icon={<Shield size={14} />}>Continue securely</PrimaryButton>
      </FooterBar>
    </>
  );
}

/* ─────────────────────────  STEP 1.5: HANDOFF  ─────────────────────────── */

function HandoffStep({ provider, onDone }: { provider: ConnectProvider; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px" }}>
      <style>{`
        @keyframes spin-dots { to { transform: rotate(360deg); } }
        .spin-ring { animation: spin-dots 1s linear infinite; }
      `}</style>
      <div style={{
        position: "relative", width: "96px", height: "96px", marginBottom: "24px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="spin-ring" style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid var(--app-blue-bg)",
          borderTopColor: "var(--app-blue)",
        }} />
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "var(--app-surface)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px",
        }}>
          {provider.icon}
        </div>
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px", textAlign: "center" }}>
        Securely connecting to {provider.name}
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--app-text-muted)", fontSize: "12px" }}>
        <Shield size={12} />
        256-bit encrypted
      </div>
    </div>
  );
}

/* ─────────────────────────  STEP 2: SCANNING  ──────────────────────────── */

function ScanningStep({
  provider, copy, onCancel, onDone,
}: {
  provider: ConnectProvider;
  copy: typeof COPY_BY_TYPE.Email;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [pct, setPct] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const steps = [
    "Verified secure connection",
    `${copy.verbContinuous} ${copy.noun}`,
    "Matching known subscription patterns",
    "Cross-referencing with your other accounts",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => doneRef.current(), 350); return 100; }
        return Math.min(100, prev + 1.7);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const activeStep = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length));

  return (
    <>
      <Header onBack={onCancel} title="Scanning account" />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px", scrollbarWidth: "none" }}>
        {/* Connected pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--app-surface)", fontSize: "16px",
          }}>{provider.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", color: "var(--app-text-primary)", fontWeight: 600, lineHeight: 1.2 }}>{provider.name}</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "2px 8px", borderRadius: "999px",
              background: "var(--app-green-bg)", color: "var(--app-green)",
              fontSize: "10px", fontWeight: 700, marginTop: "3px",
            }}>
              <Check size={10} /> Connected
            </span>
          </div>
        </div>

        {/* Headline */}
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px", lineHeight: 1.3 }}>
          Detecting your subscriptions
        </h3>
        <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
          Looking for recurring charges on your {copy.surface}
        </p>

        {/* Progress */}
        <div style={{
          padding: "16px", borderRadius: "16px",
          background: "var(--app-card)", border: "1px solid var(--app-border)",
          boxShadow: "var(--app-card-shadow)", marginBottom: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Progress
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: T.mono }}>
              {Math.floor(pct)}%
            </span>
          </div>
          <div style={{ height: "8px", borderRadius: "999px", background: "var(--app-surface)", overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: "var(--app-blue)", borderRadius: "999px",
              transition: "width 0.1s linear",
            }} />
          </div>
          <p style={{ fontSize: "11px", color: "var(--app-text-muted)", marginTop: "8px" }}>
            Usually under 30 seconds
          </p>
        </div>

        {/* Steps */}
        <div style={{
          padding: "16px", borderRadius: "16px",
          background: "var(--app-card)", border: "1px solid var(--app-border)",
          boxShadow: "var(--app-card-shadow)", marginBottom: "12px",
        }}>
          {steps.map((s, i) => {
            const complete = i < activeStep || pct >= 100;
            const active = i === activeStep && pct < 100;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: complete ? "var(--app-green-bg)" : active ? "var(--app-blue-bg)" : "var(--app-surface)",
                }}>
                  {complete
                    ? <Check size={11} color="var(--app-green)" strokeWidth={3} />
                    : active
                      ? <div className="spin-ring" style={{ width: "10px", height: "10px", borderRadius: "50%", border: "2px solid var(--app-border)", borderTopColor: "var(--app-blue)" }} />
                      : null}
                </div>
                <p style={{
                  fontSize: "13px",
                  color: complete || active ? "var(--app-text-primary)" : "var(--app-text-muted)",
                  fontWeight: active ? 600 : 400,
                }}>{s}</p>
              </div>
            );
          })}
        </div>

        {/* Bg processing card */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          padding: "12px", borderRadius: "14px",
          background: "var(--app-ai-bg)", border: "1px solid var(--app-ai-border)",
        }}>
          <Bell size={14} color="var(--app-ai-text)" style={{ marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "var(--app-ai-text)", lineHeight: 1.4 }}>
            You can leave this screen — we'll keep scanning and notify you when it's done.
          </p>
        </div>

        <div style={{ paddingTop: "12px", textAlign: "center" }}>
          <button onClick={onCancel} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: "var(--app-text-muted)", fontFamily: T.ff,
          }}>
            Cancel scan
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────  STEP 3: RESULTS  ───────────────────────────── */

type SortKey = "cost" | "newest" | "lastUsed";
type FilterKey = "highConfidence" | "newToApp" | "alreadyAdded";

function ResultsStep({
  provider, mode = "fresh", onCancel, onDone, onClose,
}: {
  provider: ConnectProvider;
  mode?: "fresh" | "revisit";
  onCancel: () => void;
  onDone: () => void;
  onClose?: () => void;
}) {
  const [sort, setSort] = useState<SortKey>("cost");
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [confidenceOpen, setConfidenceOpen] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState<DetectedSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<DetectedSubscription | null>(null);
  const [activeTab, setActiveTab] = useState<"detected" | "saved" | "skipped">("detected");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const all = DETECTED_SUBSCRIPTIONS;

  const detectedRows = useMemo(() => all.filter(s => !added.has(s.id) && !hidden.has(s.id) && !s.alreadyTracked), [all, added, hidden]);
  const savedRows = useMemo(() => all.filter(s => added.has(s.id) || s.alreadyTracked), [all, added]);
  const skippedRows = useMemo(() => all.filter(s => hidden.has(s.id)), [all, hidden]);

  const visible = useMemo(() => {
    let rows = activeTab === "detected" ? detectedRows
      : activeTab === "saved" ? savedRows
      : skippedRows;
    if (activeTab === "detected") {
      if (filters.has("highConfidence")) rows = rows.filter(s => s.confidence >= 80);
      if (filters.has("newToApp")) rows = rows.filter(s => !s.alreadyTracked);
      if (filters.has("alreadyAdded")) rows = rows.filter(s => s.alreadyTracked);
    }
    if (sort === "cost") rows = [...rows].sort((a, b) => b.amount - a.amount);
    if (sort === "newest") rows = [...rows].sort((a, b) => b.lastCharge.localeCompare(a.lastCharge));
    if (sort === "lastUsed") rows = [...rows].sort((a, b) => a.lastCharge.localeCompare(b.lastCharge));
    return rows;
  }, [activeTab, detectedRows, savedRows, skippedRows, filters, sort]);

  const detectedCount = detectedRows.length;
  const savedCount = savedRows.length;
  const skippedCount = skippedRows.length;

  const bulkAdd = () => {
    setAdded(prev => { const n = new Set(prev); selectedIds.forEach(id => n.add(id)); return n; });
    exitSelectMode();
  };
  const bulkSkip = () => {
    setHidden(prev => { const n = new Set(prev); selectedIds.forEach(id => n.add(id)); return n; });
    exitSelectMode();
  };
  const bulkRemove = () => {
    setAdded(prev => { const n = new Set(prev); selectedIds.forEach(id => n.delete(id)); return n; });
    exitSelectMode();
  };
  const bulkAddBack = () => {
    setHidden(prev => { const n = new Set(prev); selectedIds.forEach(id => n.delete(id)); return n; });
    exitSelectMode();
  };

  const toggleFilter = (k: FilterKey) => {
    setFilters(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const handleAdd = (id: string) => {
    setAdded(prev => new Set(prev).add(id));
  };
  const handleRemove = (id: string) => {
    setAdded(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const totalFound = all.length;
  const sortLabels: Record<SortKey, string> = { cost: "Cost (highest)", newest: "Newest", lastUsed: "Last used" };

  return (
    <>
      {/* Header — revisit: title + X close; fresh: smart back (celebration if anything saved) */}
      {mode === "revisit" ? (
        <Header title="Findings" onClose={onClose} />
      ) : (
        <Header
          onBack={() => { if (added.size > 0) setTimeout(onDone, 50); else onCancel(); }}
          title="Review findings"
        />
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: selectMode ? "0 20px 100px" : "0 20px 24px", scrollbarWidth: "none" }}>
        {/* Headline */}
        <div style={{ marginBottom: "14px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "4px" }}>
            Found {totalFound} subscriptions in {provider.name}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--app-text-muted)", lineHeight: 1.5 }}>
            Tap <strong style={{ color: "var(--app-text-primary)" }}>Add</strong> to track each one. We won't add anything without your confirmation.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "14px", padding: "3px", borderRadius: "12px", background: "var(--app-surface)" }}>
          {([
            { key: "detected" as const, label: "To review", count: detectedCount },
            { key: "saved" as const,    label: "Saved",     count: savedCount },
            { key: "skipped" as const,  label: "Skipped",   count: skippedCount },
          ]).map(t => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); exitSelectMode(); }}
                style={{
                  flex: 1, padding: "8px 6px", borderRadius: "10px", border: "none", cursor: "pointer",
                  background: active ? "var(--app-card)" : "transparent",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
                  fontFamily: T.ff,
                }}
              >
                <span style={{
                  fontSize: "12px", fontWeight: active ? 700 : 500,
                  color: active ? "var(--app-text-primary)" : "var(--app-text-muted)",
                }}>{t.label}</span>
                <span style={{
                  padding: "1px 6px", borderRadius: "999px",
                  fontSize: "10px", fontWeight: 700, fontFamily: T.mono,
                  background: active ? "var(--app-blue-bg)" : "transparent",
                  color: active ? "var(--app-blue-label)" : "var(--app-text-muted)",
                  minWidth: "18px", textAlign: "center",
                }}>{t.count}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar — hidden when there's nothing meaningful to sort/select */}
        {visible.length >= 2 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <button onClick={() => setSortOpen(v => !v)} style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "6px 10px", borderRadius: "999px",
              background: "var(--app-card)", border: "1px solid var(--app-border)",
              fontSize: "12px", fontWeight: 500, color: "var(--app-text-primary)",
              cursor: "pointer",
            }}>
              Sort: {sortLabels[sort]} <ChevronDown size={12} />
            </button>
            {sortOpen && (
              <>
                <div onClick={() => setSortOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 2,
                  minWidth: "160px", padding: "4px",
                  background: "var(--app-card)", border: "1px solid var(--app-border)",
                  borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}>
                  {(Object.keys(sortLabels) as SortKey[]).map(k => (
                    <button key={k} onClick={() => { setSort(k); setSortOpen(false); }} style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 10px", borderRadius: "8px", border: "none",
                      background: sort === k ? "var(--app-surface)" : "transparent",
                      fontSize: "12px", color: "var(--app-text-primary)", cursor: "pointer",
                      fontFamily: T.ff,
                    }}>
                      {sortLabels[k]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {activeTab === "detected" && [
            { key: "highConfidence" as FilterKey, label: "High confidence" },
            { key: "newToApp" as FilterKey, label: "New to app" },
            { key: "alreadyAdded" as FilterKey, label: "Already added" },
          ].map(f => {
            const on = filters.has(f.key);
            return (
              <button key={f.key} onClick={() => toggleFilter(f.key)} style={{
                padding: "6px 10px", borderRadius: "999px",
                background: on ? "var(--app-blue-bg)" : "var(--app-card)",
                border: `1px solid ${on ? "var(--app-blue-border)" : "var(--app-border)"}`,
                color: on ? "var(--app-blue-label)" : "var(--app-text-secondary)",
                fontSize: "12px", fontWeight: 500, cursor: "pointer",
              }}>
                {f.label}
              </button>
            );
          })}
          {visible.length > 0 && (
            <button
              onClick={() => setSelectMode(s => !s)}
              style={{
                marginLeft: "auto",
                padding: "6px 12px", borderRadius: "999px",
                background: selectMode ? "var(--app-blue)" : "var(--app-card)",
                color: selectMode ? "#fff" : "var(--app-text-primary)",
                border: `1px solid ${selectMode ? "var(--app-blue)" : "var(--app-border)"}`,
                fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: T.ff,
              }}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
          )}
        </div>
        )}

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {visible.map(sub => {
            const isAdded = added.has(sub.id);
            const isSkipped = hidden.has(sub.id);
            const tracked = sub.alreadyTracked;
            const isSelected = selectedIds.has(sub.id);
            return (
              <div
                key={sub.id}
                onClick={() => (selectMode && !tracked) ? toggleSelect(sub.id) : setDetailSub(sub)}
                style={{
                  padding: "14px", borderRadius: "14px",
                  background: isSelected ? "var(--app-blue-bg)" : "var(--app-card)",
                  border: `1px solid ${isSelected ? "var(--app-blue-border)" : (isAdded ? "var(--app-trial-border)" : "var(--app-border)")}`,
                  boxShadow: "var(--app-card-shadow)",
                  cursor: "pointer",
                  opacity: selectMode && tracked ? 0.55 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: (tracked || isAdded || isSkipped || selectMode || activeTab !== "detected") ? 0 : "10px" }}>
                  {selectMode && !tracked && (
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? "var(--app-blue)" : "transparent",
                      border: `2px solid ${isSelected ? "var(--app-blue)" : "var(--app-border-input)"}`,
                    }}>
                      {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  )}
                  <span style={{ fontSize: "22px" }}>{sub.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 500 }}>{sub.name}</p>
                      {tracked && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "3px",
                          padding: "2px 8px", borderRadius: "999px",
                          background: "var(--app-surface)", color: "var(--app-text-muted)",
                          fontSize: "10px", fontWeight: 700,
                        }}>
                          <Check size={9} strokeWidth={3} /> Already tracked
                        </span>
                      )}
                      {isAdded && !tracked && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "3px",
                          padding: "2px 8px", borderRadius: "999px",
                          background: "var(--app-trial-bg)", color: "var(--app-green)",
                          fontSize: "10px", fontWeight: 700,
                        }}>
                          <Check size={9} strokeWidth={3} /> Added
                        </span>
                      )}
                      {isSkipped && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "3px",
                          padding: "2px 8px", borderRadius: "999px",
                          background: "var(--app-surface)", color: "var(--app-text-muted)",
                          fontSize: "10px", fontWeight: 700,
                        }}>
                          <X size={9} strokeWidth={3} /> Skipped
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--app-text-muted)" }}>{sub.category} · last charge {fmtDate(sub.lastCharge)}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: T.mono, lineHeight: 1 }}>
                      ${sub.amount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "2px" }}>
                      /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                    </p>
                  </div>
                </div>

                {activeTab === "detected" && !selectMode && !tracked && !isAdded && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfidenceOpen(true); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "4px 8px", borderRadius: "999px",
                        background: confidenceBg(sub.confidence),
                        color: confidenceFg(sub.confidence),
                        border: "none", cursor: "pointer",
                        fontSize: "10px", fontWeight: 700,
                      }}
                    >
                      {sub.confidence}% match <Info size={10} />
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmSkip(sub); }}
                      style={{
                        padding: "6px 12px", borderRadius: "999px",
                        background: "transparent", border: "1px solid var(--app-border)",
                        color: "var(--app-text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdd(sub.id); }}
                      style={{
                        padding: "6px 16px", borderRadius: "999px",
                        background: "var(--app-blue)", color: "#fff",
                        border: "none", cursor: "pointer",
                        fontSize: "12px", fontWeight: 600,
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && (
            <EmptyResults
              providerName={provider.name}
              activeTab={activeTab}
              hasFilters={filters.size > 0}
              hasAnyData={all.length > 0}
              onClearFilters={() => setFilters(new Set())}
              onConnectAnother={onCancel}
            />
          )}
        </div>
      </div>

      {/* Selection action bar */}
      {selectMode && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "12px 20px 20px", flexShrink: 0,
          background: "var(--app-frame-bg)", borderTop: "1px solid var(--app-border)",
          display: "flex", gap: "8px", alignItems: "center",
        }}>
          <span style={{ fontSize: "12px", color: "var(--app-text-muted)", fontFamily: T.mono, flexShrink: 0 }}>
            {selectedIds.size} selected
          </span>
          <div style={{ flex: 1 }} />
          {activeTab === "detected" && (
            <>
              <button
                onClick={bulkSkip}
                disabled={selectedIds.size === 0}
                style={{
                  padding: "10px 14px", borderRadius: "999px",
                  background: "transparent",
                  border: "1px solid var(--app-border)",
                  color: selectedIds.size === 0 ? "var(--app-text-muted)" : "var(--app-text-primary)",
                  fontSize: "13px", fontWeight: 600, cursor: selectedIds.size === 0 ? "default" : "pointer",
                  fontFamily: T.ff,
                }}
              >
                Skip ({selectedIds.size})
              </button>
              <button
                onClick={bulkAdd}
                disabled={selectedIds.size === 0}
                style={{
                  padding: "10px 18px", borderRadius: "999px",
                  background: selectedIds.size === 0 ? "var(--app-surface)" : "var(--app-blue)",
                  color: selectedIds.size === 0 ? "var(--app-text-muted)" : "#fff",
                  border: "none", cursor: selectedIds.size === 0 ? "default" : "pointer",
                  fontSize: "13px", fontWeight: 700, fontFamily: T.ff,
                  boxShadow: selectedIds.size === 0 ? "none" : "0 4px 12px var(--app-blue-glow)",
                }}
              >
                Add ({selectedIds.size})
              </button>
            </>
          )}
          {activeTab === "saved" && (
            <button
              onClick={bulkRemove}
              disabled={selectedIds.size === 0}
              style={{
                padding: "10px 18px", borderRadius: "999px",
                background: selectedIds.size === 0 ? "var(--app-surface)" : "var(--app-red)",
                color: selectedIds.size === 0 ? "var(--app-text-muted)" : "#fff",
                border: "none", cursor: selectedIds.size === 0 ? "default" : "pointer",
                fontSize: "13px", fontWeight: 700, fontFamily: T.ff,
              }}
            >
              Remove ({selectedIds.size})
            </button>
          )}
          {activeTab === "skipped" && (
            <button
              onClick={bulkAddBack}
              disabled={selectedIds.size === 0}
              style={{
                padding: "10px 18px", borderRadius: "999px",
                background: selectedIds.size === 0 ? "var(--app-surface)" : "var(--app-blue)",
                color: selectedIds.size === 0 ? "var(--app-text-muted)" : "#fff",
                border: "none", cursor: selectedIds.size === 0 ? "default" : "pointer",
                fontSize: "13px", fontWeight: 700, fontFamily: T.ff,
                boxShadow: selectedIds.size === 0 ? "none" : "0 4px 12px var(--app-blue-glow)",
              }}
            >
              Add back ({selectedIds.size})
            </button>
          )}
        </div>
      )}

      {/* Confidence popover */}
      {confidenceOpen && (
        <Popover onClose={() => setConfidenceOpen(false)}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Sparkles size={16} color="var(--app-blue)" />
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text-primary)" }}>Match confidence</p>
          </div>
          <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5, marginBottom: "10px" }}>
            How sure we are this is a real subscription based on charge patterns, merchant name, and frequency.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <ConfidenceRow color="var(--app-green)" bg="var(--app-trial-bg)" label="80%+" desc="Auto-add recommended" />
            <ConfidenceRow color="var(--app-yellow)" bg="var(--app-yellow-bg)" label="60–79%" desc="Likely a subscription — quick review" />
            <ConfidenceRow color="var(--app-red)" bg="var(--app-red-bg)" label="< 60%" desc="Review carefully before adding" />
          </div>
        </Popover>
      )}

      {/* Skip confirmation */}
      {confirmSkip && (
        <Popover onClose={() => setConfirmSkip(null)}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px" }}>
            Skip {confirmSkip.name}?
          </p>
          <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
            It'll be hidden from this list. You can restore it later in Settings → Detection.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <SecondaryButton onClick={() => setConfirmSkip(null)}>Cancel</SecondaryButton>
            <button onClick={() => {
              setHidden(prev => new Set(prev).add(confirmSkip.id));
              setConfirmSkip(null);
            }} style={{
              flex: 1, padding: "12px 16px", borderRadius: "999px",
              background: "var(--app-text-primary)", color: "var(--app-frame-bg)",
              border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 600, fontFamily: T.ff,
            }}>
              Skip
            </button>
          </div>
        </Popover>
      )}

      {/* Detail view */}
      {detailSub && (
        <DetectedDetail
          sub={detailSub}
          providerName={provider.name}
          isAdded={added.has(detailSub.id)}
          onClose={() => setDetailSub(null)}
          onSkip={() => { setConfirmSkip(detailSub); setDetailSub(null); }}
          onAdd={() => { handleAdd(detailSub.id); setDetailSub(null); }}
          onRemove={() => { handleRemove(detailSub.id); setDetailSub(null); }}
          onConfidenceExplain={() => setConfidenceOpen(true)}
        />
      )}
    </>
  );
}

function EmptyResults({
  providerName, activeTab, hasFilters, hasAnyData, onClearFilters, onConnectAnother,
}: {
  providerName: string;
  activeTab: "detected" | "saved" | "skipped";
  hasFilters: boolean;
  hasAnyData: boolean;
  onClearFilters: () => void;
  onConnectAnother: () => void;
}) {
  // 1. True zero-data — scan returned nothing
  if (!hasAnyData) {
    return (
      <EmptyShell
        icon={<SearchIcon size={28} color="var(--app-text-muted)" />}
        headline={`No subscriptions found in ${providerName}`}
        body="We couldn't detect any recurring charges in the last 12 months. Try connecting another account or add subscriptions manually."
        buttonLabel="Connect another account"
        onButtonClick={onConnectAnother}
      />
    );
  }

  // 2. Filters applied on To review with no matches
  if (activeTab === "detected" && hasFilters) {
    return (
      <EmptyShell
        icon={<SearchIcon size={28} color="var(--app-text-muted)" />}
        headline="No matches for these filters"
        body="Try clearing your filters to see all detected subscriptions."
        buttonLabel="Clear filters"
        onButtonClick={onClearFilters}
      />
    );
  }

  // 3. Per-tab empty
  if (activeTab === "detected") {
    return (
      <EmptyShell
        icon={<CheckCircle size={28} color="var(--app-green)" />}
        bgColor="var(--app-trial-bg)"
        headline="All caught up"
        body={`You've reviewed everything we found in ${providerName}.`}
      />
    );
  }
  if (activeTab === "saved") {
    return (
      <EmptyShell
        icon={<Sparkles size={28} color="var(--app-text-muted)" />}
        headline="Nothing saved yet"
        body="Add subscriptions from the To review tab to see them here."
      />
    );
  }
  return (
    <EmptyShell
      icon={<X size={28} color="var(--app-text-muted)" />}
      headline="Nothing skipped"
      body="Items you skip appear here. We'll re-surface them in 30 days if they're still charging you."
    />
  );
}

function EmptyShell({
  icon, headline, body, buttonLabel, onButtonClick, bgColor,
}: {
  icon: React.ReactNode;
  headline: string;
  body: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  bgColor?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "50%",
        background: bgColor ?? "var(--app-surface)", margin: "0 auto 16px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "6px", fontFamily: T.ff }}>
        {headline}
      </h3>
      <p style={{ fontSize: "13px", color: "var(--app-text-muted)", lineHeight: 1.5, marginBottom: buttonLabel ? "16px" : 0, fontFamily: T.ff }}>
        {body}
      </p>
      {buttonLabel && onButtonClick && (
        <button onClick={onButtonClick} style={{
          padding: "8px 16px", borderRadius: "999px",
          background: "var(--app-blue)", color: "#fff",
          border: "none", cursor: "pointer",
          fontSize: "12px", fontWeight: 600, fontFamily: T.ff,
        }}>
          {buttonLabel}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────  DETECTED SUB DETAIL  ───────────────────────── */

function DetectedDetail({
  sub, providerName, isAdded, onClose, onSkip, onAdd, onRemove, onConfidenceExplain,
}: {
  sub: DetectedSubscription;
  providerName: string;
  isAdded: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onConfidenceExplain: () => void;
}) {
  const tracked = sub.alreadyTracked;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: sub.name,
    amount: sub.amount.toString(),
    billingCycle: sub.billingCycle,
    category: sub.category,
  });
  const cycleLabel = form.billingCycle === "monthly" ? "Monthly" : "Annual";
  const cycleShort = form.billingCycle === "monthly" ? "/mo" : "/yr";
  const lastChargeDate = new Date(sub.lastCharge);
  const monthsBack = Math.max(1, Math.floor((Date.now() - lastChargeDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 80,
      display: "flex", flexDirection: "column",
      background: "var(--app-frame-bg)", fontFamily: T.ff,
    }}>
      {/* Hero */}
      <div style={{
        position: "relative", padding: "48px 20px 28px", flexShrink: 0,
        background: "linear-gradient(180deg, var(--app-trial-bg) 0%, var(--app-frame-bg) 100%)",
        borderBottom: "1px solid var(--app-border)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "20px", right: "20px",
          width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%", background: "var(--app-surface)", border: "none", cursor: "pointer",
        }}>
          <X size={16} color="var(--app-text-secondary)" />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--app-card)", border: "1px solid var(--app-border)",
          }}>
            <span style={{ fontSize: "34px", lineHeight: 1 }}>{sub.emoji}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", lineHeight: 1.1 }}>{form.name}</h2>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginTop: "4px" }}>{form.category}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "2px" }}>
              {cycleLabel} charge
            </p>
            <p style={{ fontSize: "38px", fontWeight: 700, color: "var(--app-text-primary)", fontFamily: T.mono, lineHeight: 1 }}>
              ${Number(form.amount).toFixed(2)}
            </p>
          </div>
          {tracked ? (
            <span style={{
              padding: "4px 10px", borderRadius: "999px", marginBottom: "4px",
              fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              background: "var(--app-surface)", color: "var(--app-text-muted)",
            }}>
              Tracked
            </span>
          ) : (
            <button onClick={onConfidenceExplain} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "4px 10px", borderRadius: "999px", marginBottom: "4px",
              fontSize: "11px", fontWeight: 700,
              background: confidenceBg(sub.confidence), color: confidenceFg(sub.confidence),
              border: "none", cursor: "pointer",
            }}>
              {sub.confidence}% match <Info size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px", scrollbarWidth: "none" }}>
        {tracked && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            padding: "14px", borderRadius: "16px", marginBottom: "16px",
            background: "var(--app-ai-bg)", border: "1px solid var(--app-ai-border)",
          }}>
            <Check size={16} color="var(--app-ai-text)" strokeWidth={3} style={{ marginTop: "1px", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--app-ai-text)", marginBottom: "2px" }}>
                Already in your subscriptions
              </p>
              <p style={{ fontSize: "12px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
                You're already tracking {sub.name}. We surfaced it here so you know we detected it from {providerName}.
              </p>
            </div>
          </div>
        )}

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <InfoTile icon={<Calendar size={14} color="var(--app-text-muted)" />} label="Last charge" value={fmtDate(sub.lastCharge)} sub={`${monthsBack} ${monthsBack === 1 ? "month" : "months"} ago`} />
          <InfoTile icon={<RefreshCw size={14} color="var(--app-text-muted)" />} label="Billing cycle" value={cycleLabel} sub={`Recurring ${cycleShort.replace("/", "per ")}`} />
          <InfoTile icon={<MailIcon size={14} color="var(--app-text-muted)" />} label="Detected via" value={sub.source} sub="Receipt email" />
          <InfoTile icon={<Tag size={14} color="var(--app-text-muted)" />} label="Category" value={form.category} />
        </div>

        {/* Why we detected this */}
        <div style={{
          padding: "16px", borderRadius: "16px", marginBottom: "16px",
          background: "var(--app-card)", border: "1px solid var(--app-border)",
          boxShadow: "var(--app-card-shadow)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Sparkles size={14} color="var(--app-blue)" />
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--app-text-primary)" }}>
              Why we detected this
            </p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Check size={13} color="var(--app-green)" strokeWidth={3} style={{ marginTop: "3px", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
                Recurring charge of ${sub.amount.toFixed(2)} every {sub.billingCycle === "monthly" ? "month" : "year"}
              </p>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Check size={13} color="var(--app-green)" strokeWidth={3} style={{ marginTop: "3px", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
                Receipt-style email from {sub.name.toLowerCase().replace(/\s+/g, "")}.com
              </p>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Check size={13} color="var(--app-green)" strokeWidth={3} style={{ marginTop: "3px", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
                Matches a known {sub.category.toLowerCase()} subscription pattern
              </p>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <p style={{ fontSize: "11px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Actions</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!tracked && (
            <button
              onClick={() => setEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", background: "var(--app-card)", border: "1px solid var(--app-border)", cursor: "pointer", boxShadow: "var(--app-card-shadow)" }}
            >
              <Pencil size={16} color="var(--app-blue)" />
              <span style={{ fontSize: "14px", color: "var(--app-text-primary)", flex: 1, textAlign: "left" }}>Edit details</span>
              <ChevronRight size={14} color="var(--app-text-muted)" />
            </button>
          )}

          {tracked ? (
            <button
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", borderRadius: "16px", background: "var(--app-blue)", border: "none", cursor: "pointer", boxShadow: "0 4px 12px var(--app-blue-glow)" }}
            >
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: T.ff }}>Close</span>
            </button>
          ) : isAdded ? (
            <button
              onClick={onRemove}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "16px", background: "var(--app-red-bg)", border: "1px solid var(--app-red-border)", cursor: "pointer" }}
            >
              <Trash2 size={16} color="var(--app-red)" />
              <span style={{ fontSize: "14px", color: "var(--app-red)", flex: 1, textAlign: "left" }}>Remove from list</span>
              <ChevronRight size={14} color="var(--app-red)" />
            </button>
          ) : (
            <>
              <button
                onClick={onSkip}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "16px", background: "transparent", border: "1px solid var(--app-border)", cursor: "pointer" }}
              >
                <X size={16} color="var(--app-text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--app-text-secondary)", flex: 1, textAlign: "left", fontWeight: 500 }}>Skip this subscription</span>
              </button>
              <button
                onClick={onAdd}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px", borderRadius: "16px", background: "var(--app-blue)", border: "none", cursor: "pointer", boxShadow: "0 4px 12px var(--app-blue-glow)" }}
              >
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff", fontFamily: T.ff }}>Add subscription</span>
              </button>
            </>
          )}
        </div>

        {!tracked && !isAdded && (
          <p style={{ fontSize: "11px", color: "var(--app-text-muted)", lineHeight: 1.5, textAlign: "center", marginTop: "16px" }}>
            Adding will start tracking renewals and usage. You can change this at any time.
          </p>
        )}
      </div>

      {/* Edit overlay (shared component) */}
      {editing && (
        <SubscriptionEditForm
          title={`Edit ${sub.name}`}
          initialValues={{ ...form, account: "" }}
          categories={DETECTED_CATEGORIES}
          cycles={DETECTED_CYCLES}
          showAccountField={false}
          primaryLabel={isAdded ? "Save changes" : "Save & add"}
          onPrimary={(values) => {
            setForm({
              name: values.name,
              amount: values.amount,
              billingCycle: values.billingCycle as "monthly" | "annual",
              category: values.category,
            });
            setEditing(false);
            if (!isAdded) onAdd();
          }}
          secondaryLabel="Cancel"
          onSecondary={() => setEditing(false)}
          onClose={() => setEditing(false)}
          zIndex={90}
        />
      )}
    </div>
  );
}

function InfoTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div style={{
      padding: "14px", borderRadius: "16px",
      background: "var(--app-card)", border: "1px solid var(--app-border)",
      boxShadow: "var(--app-card-shadow)",
    }}>
      <div style={{ marginBottom: "8px" }}>{icon}</div>
      <p style={{ fontSize: "10px", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "14px", color: "var(--app-text-primary)", fontWeight: 600, lineHeight: 1.2 }}>{value}</p>
      {sub && <p style={{ fontSize: "10px", color: "var(--app-text-muted)", marginTop: "2px" }}>{sub}</p>}
    </div>
  );
}

/* ─────────────────────────  STEP 4: DONE  ──────────────────────────────── */

function DoneStep({ onConnectAnother, onClose }: { onConnectAnother: () => void; onClose: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "var(--app-green-bg)", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle size={36} color="var(--app-green)" strokeWidth={2} />
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--app-text-primary)", marginBottom: "8px" }}>
          All done
        </h3>
        <p style={{ fontSize: "14px", color: "var(--app-text-muted)", lineHeight: 1.5 }}>
          Your new subscriptions are now being tracked. We'll alert you before each renewal.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={onClose} style={{
          padding: "14px", borderRadius: "999px",
          background: "var(--app-blue)", color: "#fff",
          border: "none", cursor: "pointer",
          fontSize: "14px", fontWeight: 600, fontFamily: T.ff,
        }}>
          Done
        </button>
        <button onClick={onConnectAnother} style={{
          padding: "14px", borderRadius: "999px",
          background: "transparent", color: "var(--app-text-primary)",
          border: "1px solid var(--app-border)", cursor: "pointer",
          fontSize: "14px", fontWeight: 600, fontFamily: T.ff,
        }}>
          Connect another account
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────  SHARED BITS  ───────────────────────────────── */

function Header({ onBack, onClose, title }: { onBack?: () => void; onClose?: () => void; title: string }) {
  const circleBtn: React.CSSProperties = {
    width: "32px", height: "32px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--app-surface)", border: "none", cursor: "pointer", flexShrink: 0,
  };
  return (
    <div style={{ padding: "24px 20px 12px", flexShrink: 0, display: "flex", alignItems: "center", gap: "10px" }}>
      {onBack && (
        <button onClick={onBack} style={circleBtn}>
          <ArrowLeft size={16} color="var(--app-text-primary)" />
        </button>
      )}
      <h2 style={{ flex: 1, fontSize: "16px", fontWeight: 600, color: "var(--app-text-primary)" }}>{title}</h2>
      {onClose && (
        <button onClick={onClose} style={circleBtn}>
          <X size={16} color="var(--app-text-primary)" />
        </button>
      )}
    </div>
  );
}

function ProviderHero({ provider }: { provider: ConnectProvider }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--app-surface)", fontSize: "28px",
      }}>{provider.icon}</div>
      <div>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--app-text-primary)", lineHeight: 1.2 }}>{provider.name}</p>
        <span style={{
          display: "inline-block", padding: "2px 8px", borderRadius: "999px",
          background: "var(--app-surface)", color: "var(--app-text-muted)",
          fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
          marginTop: "4px",
        }}>{provider.type}</span>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "16px", borderRadius: "16px",
      background: "var(--app-card)", border: "1px solid var(--app-border)",
      boxShadow: "var(--app-card-shadow)",
    }}>
      {children}
    </div>
  );
}

function CardHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
      {icon}
      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--app-text-primary)" }}>{label}</p>
    </div>
  );
}

function List({ items, variant }: { items: string[]; variant: "check" | "cross" }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          {variant === "check"
            ? <Check size={13} color="var(--app-green)" strokeWidth={3} style={{ marginTop: "3px", flexShrink: 0 }} />
            : <X size={13} color="var(--app-red)" strokeWidth={3} style={{ marginTop: "3px", flexShrink: 0 }} />}
          <p style={{ fontSize: "13px", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>{it}</p>
        </li>
      ))}
    </ul>
  );
}

function FooterBar({ children, single }: { children: React.ReactNode; single?: boolean }) {
  return (
    <div style={{
      padding: "12px 20px 20px", flexShrink: 0,
      display: "flex", gap: "8px",
      borderTop: single ? "none" : "1px solid var(--app-border)",
      background: "var(--app-frame-bg)",
    }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      flex: 2, padding: "12px 16px", borderRadius: "999px",
      background: "var(--app-blue)", color: "#fff",
      border: "none", cursor: "pointer",
      fontSize: "13px", fontWeight: 600, fontFamily: T.ff,
      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      boxShadow: "0 4px 12px var(--app-blue-glow)",
    }}>
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "12px 16px", borderRadius: "999px",
      background: "transparent", color: "var(--app-text-primary)",
      border: "1px solid var(--app-border)", cursor: "pointer",
      fontSize: "13px", fontWeight: 600, fontFamily: T.ff,
    }}>
      {children}
    </button>
  );
}

function SourcePill({ icon, name, status, count }: { icon: string; name: string; status: "complete" | "scanning" | "queued"; count?: number }) {
  const bg = status === "complete" ? "var(--app-green-bg)" : status === "scanning" ? "var(--app-blue-bg)" : "var(--app-surface)";
  const fg = status === "complete" ? "var(--app-green)" : status === "scanning" ? "var(--app-blue-label)" : "var(--app-text-muted)";
  const label = status === "complete" ? "Complete" : status === "scanning" ? "Scanning…" : "Queued";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
      padding: "6px 10px", borderRadius: "999px",
      background: bg, color: fg,
      fontSize: "11px", fontWeight: 600,
    }}>
      <span style={{ fontSize: "13px" }}>{icon}</span>
      <span>{name}</span>
      <span style={{ opacity: 0.7 }}>·</span>
      <span>{label}{count != null ? ` · ${count}` : ""}</span>
    </div>
  );
}

function Popover({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 70,
      display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.32)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", padding: "20px",
        background: "var(--app-card)",
        borderTopLeftRadius: "20px", borderTopRightRadius: "20px",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.16)",
      }}>
        {children}
      </div>
    </div>
  );
}

function ConfidenceRow({ color, bg, label, desc }: { color: string; bg: string; label: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{
        padding: "3px 8px", borderRadius: "999px",
        background: bg, color, fontSize: "10px", fontWeight: 700,
        minWidth: "56px", textAlign: "center",
      }}>{label}</span>
      <p style={{ fontSize: "12px", color: "var(--app-text-secondary)" }}>{desc}</p>
    </div>
  );
}

function confidenceBg(c: number) {
  if (c >= 80) return "var(--app-trial-bg)";
  if (c >= 60) return "var(--app-yellow-bg)";
  return "var(--app-red-bg)";
}
function confidenceFg(c: number) {
  if (c >= 80) return "var(--app-green)";
  if (c >= 60) return "var(--app-yellow)";
  return "var(--app-red)";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
